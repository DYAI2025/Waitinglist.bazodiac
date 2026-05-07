# Adapter

**Responsibility**: HTTP server providing the public Bazodiac contract surface. Layered as bootstrap → dispatch → routes → services → providers, with cross-cutting modules for config, errors, validation, and fixtures. Serves the static frontend, exposes `/healthz`, and orchestrates the three POST endpoints in either stub mode (fixtures) or live mode (upstream providers). Branches on `config.stubMode` only inside the service layer (`DEC-layered-adapter`).

**Technology**: Node.js, built-ins only (`node:http`, `node:fs`, `node:path`, `node:url`, `node:crypto`). No production dependencies in [`package.json`](../../package.json). Source layout:

| Path | Role |
|------|------|
| [`server.mjs`](../../server.mjs) | Bootstrap — `loadConfig`, `assertProductionConfig`, bind `PORT`/`HOST`, attach handler. |
| [`src/app.mjs`](../../src/app.mjs) | Dispatch — OPTIONS/CORS, `/healthz`, route lookup, static-with-SPA-fallback, method gating. |
| [`src/routes/publicApi.mjs`](../../src/routes/publicApi.mjs) | POST `/api/public/*` route table. |
| `src/services/{fusionChart,fusionInterpretation,newsletter}Service.mjs` | Validate input; branch on `config.stubMode`; orchestrate providers. |
| `src/providers/{fufire,geocoding,interpretation,newsletter}Provider.mjs` | Outbound integrations; map public ↔ upstream schemas. |
| [`src/config.mjs`](../../src/config.mjs) | `loadConfig` + `assertProductionConfig`. |
| [`src/errors.mjs`](../../src/errors.mjs) | `ApiError` + frozen 13-code `ERROR_CODES` set + factory functions. |
| [`src/http.mjs`](../../src/http.mjs) | `readJson` / `sendJson` / `sendError` / `corsHeaders`. |
| [`src/validation.mjs`](../../src/validation.mjs) | Per-endpoint input validation. |
| [`src/fixtures.mjs`](../../src/fixtures.mjs) | Stub-mode fixture loader. |

Tests under [`tests/`](../../tests/); contract surface frozen in [`contracts/public-api.md`](../../contracts/public-api.md); manual contract test in [`contracts/SMOKE_CHECKLIST.md`](../../contracts/SMOKE_CHECKLIST.md).

## Interfaces

- **Inbound HTTP from `frontend`** (same-origin):
  - `POST /api/public/fusion-chart` — chart computation.
  - `POST /api/public/fusion-interpretation` — interpretation generation.
  - `POST /api/public/newsletter-signup` — newsletter subscription with consent.
  - `GET /healthz` — liveness probe (`{ok: true, service: 'bazodiac-fusion-preview'}`).
  - `GET /`, `GET /<asset>` — static frontend delivery.
  - `OPTIONS *` — CORS preflight.
- **Outbound HTTP (live mode only — `PUBLIC_API_STUB_MODE=false`)**:
  - FuFirE chart engine: `POST {FUFIRE_BASE_URL}/chart`, header `X-API-Key: {FUFIRE_API_KEY}`. Mapped per `REQ-F-fufire-chart-mapping`.
  - Geocoding + Timezone APIs: vendor TBD (HTTP).
  - Interpretation API (Gemini-based): vendor TBD (HTTP).
  - Newsletter API: vendor with double opt-in (HTTP).

All API responses use the stable envelope `{ok: true, ...}` or `{ok: false, error: {code, message, field?}}` (`REQ-F-stable-error-envelope`). Error codes come from the frozen `ERROR_CODES` set in `src/errors.mjs` (`DEC-frozen-error-codes`). Provider failures surface as `*_UNAVAILABLE` codes — never as fixtures (`REQ-F-no-fixture-fallback-in-prod`, `REQ-REL-explicit-provider-failure`).

## Requirements Addressed

| File | Type | Priority | Summary |
|------|------|----------|---------|
| [REQ-F-stable-error-envelope](../../1-spec/requirements/REQ-F-stable-error-envelope.md) | Functional | Must-have | `{ok, error?:{code,message,field?}}` envelope with stable ALL_CAPS codes. |
| [REQ-F-fusion-chart-endpoint](../../1-spec/requirements/REQ-F-fusion-chart-endpoint.md) | Functional | Must-have | `POST /api/public/fusion-chart` returns the contract chart envelope. |
| [REQ-F-fusion-interpretation-endpoint](../../1-spec/requirements/REQ-F-fusion-interpretation-endpoint.md) | Functional | Must-have | `POST /api/public/fusion-interpretation` returns the contract interpretation envelope. |
| [REQ-F-newsletter-signup-endpoint](../../1-spec/requirements/REQ-F-newsletter-signup-endpoint.md) | Functional | Must-have | `POST /api/public/newsletter-signup` confirms a consenting subscription. |
| [REQ-F-null-birth-time-accepted](../../1-spec/requirements/REQ-F-null-birth-time-accepted.md) | Functional | Must-have | Chart endpoint accepts `birthTime: null` and renders ascendant as provisional. |
| [REQ-F-fufire-chart-mapping](../../1-spec/requirements/REQ-F-fufire-chart-mapping.md) | Functional | Must-have | FuFirE provider maps the chart contract to the upstream `/chart` schema exactly. |
| [REQ-F-stub-mode-toggle](../../1-spec/requirements/REQ-F-stub-mode-toggle.md) | Functional | Must-have | `PUBLIC_API_STUB_MODE` switches between fixture and live modes by env-var only. |
| [REQ-F-config-validation-live](../../1-spec/requirements/REQ-F-config-validation-live.md) | Functional | Must-have | Missing live env vars fail startup with `CONFIGURATION_ERROR` listing every variable. |
| [REQ-F-no-fixture-fallback-in-prod](../../1-spec/requirements/REQ-F-no-fixture-fallback-in-prod.md) | Functional | Must-have | Service layer must not return fixture data when `stubMode === false`. |
| [REQ-REL-explicit-provider-failure](../../1-spec/requirements/REQ-REL-explicit-provider-failure.md) | Reliability | Must-have | Production provider failures surface as structured errors, never silently. |
| [REQ-SEC-consent-required](../../1-spec/requirements/REQ-SEC-consent-required.md) | Security | Must-have | Newsletter signup requires explicit `consent: true`. |
| [REQ-SEC-no-pii-in-logs](../../1-spec/requirements/REQ-SEC-no-pii-in-logs.md) | Security | Must-have | Logs and `error.message` strings must not contain user PII. |
| [REQ-MNT-railway-deploy-conformance](../../1-spec/requirements/REQ-MNT-railway-deploy-conformance.md) | Maintainability | Must-have | Server complies with Railway deployment conventions (`PORT`/`HOST`, `/healthz`, single process). |
| [REQ-COMP-stub-mode-prod-disabled](../../1-spec/requirements/REQ-COMP-stub-mode-prod-disabled.md) | Compliance | Must-have | Production environments must not run with `PUBLIC_API_STUB_MODE=true`. |
| [REQ-F-envelope-byte-compat](../../1-spec/requirements/REQ-F-envelope-byte-compat.md) | Functional | Should-have | Stub-mode and live-mode envelopes are byte-compatible in shape. |
| [REQ-F-idempotent-newsletter-signup](../../1-spec/requirements/REQ-F-idempotent-newsletter-signup.md) | Functional | Should-have | Repeated signup with same email is graceful; no duplicate records. |
| [REQ-MNT-smoke-against-public-url](../../1-spec/requirements/REQ-MNT-smoke-against-public-url.md) | Maintainability | Should-have | Smoke harness can target a deployed URL via `PUBLIC_API_BASE_URL`. |

## Relevant Decisions

| File | Title | Trigger |
|------|-------|---------|
| [DEC-layered-adapter](../../decisions/DEC-layered-adapter.md) | Layered adapter with stub-mode short-circuit at service layer | When implementing a service, provider, or route; when adding a new endpoint or fallback path. |
| [DEC-zero-runtime-deps](../../decisions/DEC-zero-runtime-deps.md) | Zero runtime dependencies (Node built-ins only) | When adding any import that is not a `node:*` built-in or a relative path inside the repository. |
| [DEC-frozen-error-codes](../../decisions/DEC-frozen-error-codes.md) | Frozen ALL_CAPS error code set as contract surface | When implementing a new error path or surfacing a new failure mode. |
| [DEC-same-origin-monolith](../../decisions/DEC-same-origin-monolith.md) | Same-origin Node monolith (static + API in one process) | When introducing a new entry point, build target, or considering a separate API service deployment. |
