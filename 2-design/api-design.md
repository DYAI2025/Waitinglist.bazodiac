# API Design

The authoritative endpoint-by-endpoint schema is [`contracts/public-api.md`](../contracts/public-api.md), frozen for Backend Iteration 2 and accompanied by canonical fixtures under [`contracts/fixtures/`](../contracts/fixtures/) and the manual contract test in [`contracts/SMOKE_CHECKLIST.md`](../contracts/SMOKE_CHECKLIST.md).

This document is **not** a duplicate of that contract. It captures the *design decisions, conventions, and cross-cutting rules* that govern the contract — the kind of context a future agent needs before adding, changing, or replacing an endpoint.

## Surface

Three POST endpoints under `/api/public/*`, plus operational endpoints:

| Method | Path | Purpose | Document |
|---|---|---|---|
| POST | `/api/public/fusion-chart` | Compute the fusion chart | `REQ-F-fusion-chart-endpoint` |
| POST | `/api/public/fusion-interpretation` | Generate the interpretation for a prior chart | `REQ-F-fusion-interpretation-endpoint` |
| POST | `/api/public/newsletter-signup` | Subscribe with consent | `REQ-F-newsletter-signup-endpoint` |
| GET, HEAD | `/healthz` | Liveness probe (`{ok: true, service}`) | `REQ-MNT-railway-deploy-conformance` |
| GET | `/`, `/index.html`, static assets | Frontend delivery (same-origin) | `CON-same-origin-node-deployment` |
| OPTIONS | any | CORS preflight | cross-cutting |

**Out of scope (must NOT exist):** `/api/public/waitlist-signup`, queue position, referral codes, authenticated endpoints, WebSockets / streaming interpretation. Adding any of these is a scope expansion that requires a new requirement first.

## HTTP Conventions

### Method semantics

The three public endpoints are POST even though `/fusion-chart` and `/fusion-interpretation` are read-shaped (no server-side state change). POST is chosen because the inputs (birth data, full chart object) are too large for query strings and contain PII that should not appear in URLs or logs (`REQ-SEC-no-pii-in-logs`).

`GET` and `HEAD` are reserved for static delivery and `/healthz`. `PUT`, `PATCH`, `DELETE` are not used. Any other method on `/api/*` returns `METHOD_NOT_ALLOWED` (HTTP 405).

### Content type

- Requests: `application/json` required. Other content types return `UNSUPPORTED_MEDIA_TYPE` (HTTP 415).
- Responses: `application/json; charset=utf-8` for all API responses; `text/html` for the SPA fallback; `text/plain` for `/download.txt`-style legacy interpretation downloads.
- JSON parsing failure returns `MALFORMED_JSON` (HTTP 400).

### Same-origin and CORS

Default deployment is same-origin (`CORS_ORIGIN=*` is the wildcard fallback for development; production should narrow it). The server emits CORS headers on every response and handles `OPTIONS` preflight explicitly.

### Caching

| Resource | Cache-Control |
|---|---|
| `/`, `/index.html`, any `.html` | `no-cache` (HTML is the entry point, must reflect deploys) |
| Static assets under `/public/*` | `public, max-age=31536000, immutable` (long-lived; deploy bumps the path or filename when content changes) |
| API responses | not set (responses are cacheable only at the application layer; no CDN cache opinion stated) |

### Status codes

The envelope discriminator is `ok: boolean`, **not** the HTTP status code. Status code is paired consistently:

| HTTP | When |
|---|---|
| 200 | `ok: true` success |
| 400 | `ok: false` with `VALIDATION_ERROR`, `CONSENT_REQUIRED`, `INVALID_EMAIL`, `MALFORMED_JSON` |
| 405 | `METHOD_NOT_ALLOWED` |
| 415 | `UNSUPPORTED_MEDIA_TYPE` |
| 429 | `RATE_LIMITED` (frontend ignores headers; envelope is the source of truth) |
| 500 | `CONFIGURATION_ERROR`, `INTERNAL_ERROR` |
| 502 | `FUFIRE_UNAVAILABLE`, `INTERPRETATION_UNAVAILABLE` (upstream provider failures) |

The frontend renders `error.code` verbatim and **ignores** the HTTP status (`REQ-USA-error-code-rendered-verbatim`). Status codes are kept conventional for `curl` users, ops dashboards, and CDN/proxy tooling, not for client logic.

## Envelope Contract

Every API response is a single JSON object with the discriminator `ok`:

```json
{ "ok": true, ...endpoint-specific }
{ "ok": false, "error": { "code": "STABLE_CODE", "message": "human readable", "field": "fieldNameIfApplicable" } }
```

Rationale:

- A single shape simplifies the client — one parser, one branch (`if (!resp.ok) renderError(resp.error.code)`).
- `error.code` is the contract; `error.message` is debug-grade only and may change.
- `error.field` is included only when the error pertains to a specific input field, allowing the UI to highlight that input.
- Envelope shape is **byte-compatible** between stub and live mode (`REQ-F-envelope-byte-compat`, Should-have).

## Idempotency

The three endpoints have different idempotency profiles:

| Endpoint | Idempotent? | Notes |
|---|---|---|
| `/fusion-chart` | Effectively yes | No server-side state. Same input → same chart in stub mode (fixture); deterministic in live mode if upstream is deterministic. |
| `/fusion-interpretation` | Effectively yes | Same chart → same interpretation in stub mode; live mode depends on upstream interpretation provider (Gemini outputs may vary). |
| `/newsletter-signup` | Soft-idempotent | Repeated signup with the same `email` returns either `ALREADY_SUBSCRIBED` (HTTP 400 + `ok: false`) **or** a soft-success `{ok: true, subscribed: true}` per the smoke checklist (`REQ-F-idempotent-newsletter-signup`, Should-have). The vendor is the source of truth. |

No request includes an explicit `Idempotency-Key` header — the iteration's traffic profile does not justify it.

## Versioning

The path prefix `/api/public/` carries an implicit `v1` (the Iteration-2 contract). There is no `/api/public/v2/` plan. When breaking changes are required:

- **Additive changes** (new optional response fields, new error codes appended to the frozen list) ship in place after a contract update.
- **Breaking changes** (renamed fields, removed fields, behavior changes) introduce `/api/public/v2/<endpoint>` and run both surfaces side-by-side until clients migrate. The old surface is then removed in a single commit referenced by a `DEC-*`.

The `error.code` set is **not** versioned per endpoint — it is global to the API. Adding a code is non-breaking; renaming or removing a code is breaking.

## Validation

Server-side input validation lives in `src/validation.mjs`, called by the service layer before any branch on `config.stubMode`. Rules:

- Reject unknown top-level fields silently (do not echo them back).
- Required-field checks return `VALIDATION_ERROR` with `error.field` set to the offending field.
- Type checks return `VALIDATION_ERROR` with `error.field`.
- Email validation (`REQ-F-newsletter-signup-endpoint`) lives only on the newsletter path; chart endpoints do not see emails.
- `consent === true` is enforced before any vendor call (`REQ-SEC-consent-required`).
- `birthTime: null` is **not** a validation error — it's a documented user choice (`REQ-F-null-birth-time-accepted`).

Per `REQ-SEC-no-pii-in-logs`, validation error messages must be generic ("birthDate is required") rather than echoing values.

## Provider Failure Semantics

When in live mode and an upstream provider fails or times out, the adapter:

1. **Never** returns a fixture or synthesized payload (`REQ-F-no-fixture-fallback-in-prod`, `REQ-REL-explicit-provider-failure`, `CON-no-silent-provider-fallback`).
2. Maps the failure to a stable code: `FUFIRE_UNAVAILABLE`, `INTERPRETATION_UNAVAILABLE`, or `CONFIGURATION_ERROR` if the cause is missing/invalid env vars.
3. Returns HTTP 502 (provider) or 500 (configuration), preserving the envelope.
4. The frontend then renders the error code with a retry button (`REQ-USA-error-code-rendered-verbatim`).

There is no retry-with-backoff inside the adapter — retry is a client concern. Provider timeouts are configurable via `FUFIRE_TIMEOUT_MS` (default 15000 ms).

## Smoke Testing

`scripts/smoke-test.mjs` validates the contract surface end-to-end. Default behaviour: spawn a local server on port 4173 and assert homepage + the three POST endpoints + key error-path codes (`CONSENT_REQUIRED`, `MALFORMED_JSON`, `UNSUPPORTED_MEDIA_TYPE`) + CORS preflight.

With `PUBLIC_API_BASE_URL` set, the script skips the local-server spawn, polls `${BASE_URL}/healthz` until ready, and runs the **identical** assertion set against the deployed URL (`REQ-MNT-smoke-against-public-url`). The same script validates both stub-mode and live-mode deployments without modification — relying on `REQ-F-envelope-byte-compat` so contract assertions written against stub mode keep passing against live mode.

Manual sign-off uses [`contracts/SMOKE_CHECKLIST.md`](../contracts/SMOKE_CHECKLIST.md); automated assertions live in the script.

## Analytics

The frontend emits `console.debug('[analytics]', eventName, payload)` for the events listed in `contracts/public-api.md`. Backend logging of these events is **optional** for Iteration 2 and is currently not implemented. If introduced, it must respect `REQ-SEC-no-pii-in-logs`: log event names and chart-session-correlated identifiers only, never raw PII.

## Rate Limiting

`RATE_LIMITED` is part of the frozen error code set, but no rate-limiting middleware is implemented in Iteration 2. The frontend ignores rate-limit headers. If introduced (operational decision, recordable as `DEC-*`), it must:

- Return HTTP 429.
- Use the envelope: `{ok: false, error: {code: "RATE_LIMITED"}}`.
- Optionally include `Retry-After` (the frontend may begin honoring it later).

## Requirement Coverage

| REQ | Covered by |
|---|---|
| [REQ-F-stable-error-envelope](../1-spec/requirements/REQ-F-stable-error-envelope.md) | Envelope Contract section |
| [REQ-F-fusion-chart-endpoint](../1-spec/requirements/REQ-F-fusion-chart-endpoint.md) | Surface table + Validation + Provider Failure |
| [REQ-F-fusion-interpretation-endpoint](../1-spec/requirements/REQ-F-fusion-interpretation-endpoint.md) | Surface table + Idempotency + Provider Failure |
| [REQ-F-newsletter-signup-endpoint](../1-spec/requirements/REQ-F-newsletter-signup-endpoint.md) | Surface table + Validation + Idempotency |
| [REQ-F-null-birth-time-accepted](../1-spec/requirements/REQ-F-null-birth-time-accepted.md) | Validation section explicit non-error |
| [REQ-F-no-fixture-fallback-in-prod](../1-spec/requirements/REQ-F-no-fixture-fallback-in-prod.md) | Provider Failure Semantics |
| [REQ-REL-explicit-provider-failure](../1-spec/requirements/REQ-REL-explicit-provider-failure.md) | Provider Failure Semantics |
| [REQ-SEC-consent-required](../1-spec/requirements/REQ-SEC-consent-required.md) | Validation section |
| [REQ-SEC-no-pii-in-logs](../1-spec/requirements/REQ-SEC-no-pii-in-logs.md) | Method semantics, Validation, Analytics |
| [REQ-USA-error-code-rendered-verbatim](../1-spec/requirements/REQ-USA-error-code-rendered-verbatim.md) | Envelope + Status code semantics |
| [REQ-MNT-railway-deploy-conformance](../1-spec/requirements/REQ-MNT-railway-deploy-conformance.md) | Surface table (`/healthz`) |
| [REQ-F-envelope-byte-compat](../1-spec/requirements/REQ-F-envelope-byte-compat.md) (SH) | Envelope Contract — explicit byte-compatibility statement; Smoke Testing section relies on it |
| [REQ-F-idempotent-newsletter-signup](../1-spec/requirements/REQ-F-idempotent-newsletter-signup.md) (SH) | Idempotency table (newsletter-signup row, soft-success vs `ALREADY_SUBSCRIBED`) |
| [REQ-MNT-smoke-against-public-url](../1-spec/requirements/REQ-MNT-smoke-against-public-url.md) (SH) | Smoke Testing section (`PUBLIC_API_BASE_URL` env-var-driven target) |

Endpoint-by-endpoint field-level coverage for `REQ-F-fusion-chart-endpoint`, `REQ-F-fusion-interpretation-endpoint`, and `REQ-F-newsletter-signup-endpoint` is in `contracts/public-api.md` and is intentionally not duplicated here.
