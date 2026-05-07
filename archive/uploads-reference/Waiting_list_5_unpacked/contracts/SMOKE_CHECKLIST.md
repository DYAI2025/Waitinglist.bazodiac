# Smoke Checklist — Bazodiac Public API

**Status:** Manual test contract for Backend Iteration 2 until automated contract / integration tests are added.
**Scope:** The three public endpoints listed in [`public-api.md`](./public-api.md).
**How to use:** Walk every section top to bottom against a deployed backend. Every box must be ✓ before the iteration is considered done. Use the JSON files in [`./fixtures/`](./fixtures/) verbatim as request bodies (curl, Postman, Insomnia, or the in-browser DevTools console all work).

A failing item blocks the iteration. Do not "mostly pass" this checklist.

---

## Envelope sanity

- [ ] Every successful response is `{"ok": true, ...}`.
- [ ] Every error response is `{"ok": false, "error": { "code": "...", "message": "...", "field"?: "..." }}`.
- [ ] `error.code` values are stable, ALL_CAPS, machine-readable strings (no localized text inside `code`).
- [ ] `error.message` is human-readable; safe to display verbatim in the UI.
- [ ] `error.field` is present when the error is field-scoped, omitted otherwise.
- [ ] Non-2xx HTTP status is paired with `ok: false` (no 200 OK on a logical error).
- [ ] All responses are UTF-8 JSON with `Content-Type: application/json`.

---

## 1. `POST /api/public/fusion-chart`

### Happy path

- [ ] POST body = `fixtures/fusion-chart.request.valid.json` returns HTTP 200.
- [ ] Response shape matches `fixtures/fusion-chart.response.success.json` (keys, types, nesting).
- [ ] `ok: true` is present.
- [ ] `chartSessionId` is non-empty and stable enough to use as input to `/fusion-interpretation`.
- [ ] `chart.sunSign`, `chart.moonSign`, `chart.ascendant` are non-empty strings.
- [ ] `chart.baziYearAnimal`, `chart.baziDaymaster`, `chart.dominantElement` are non-empty strings.
- [ ] `chart.coherenceIndex` is a number in `[0, 1]`.
- [ ] `chart.wuXing` contains exactly the five keys `wood`, `fire`, `earth`, `metal`, `water`, all numbers in `[0, 1]`.
- [ ] The five wuXing values sum to ~1.0 (±0.01).
- [ ] `chart.computedAt` parses as ISO 8601 UTC.

### Validation errors

- [ ] Omitting `birthDate` returns HTTP 4xx with `{ ok: false, error.code: "VALIDATION_ERROR", error.field: "birthDate" }` (matches `fixtures/fusion-chart.response.error.json`).
- [ ] Sending `birthTime: null` (the "I don't know my birth time" case) returns HTTP 200 — `null` is **valid**, not an error.
- [ ] Empty `birthPlace` returns HTTP 4xx with `error.field: "birthPlace"`.
- [ ] Invalid `language` (anything other than `"de"` or `"en"`) returns HTTP 4xx with `error.field: "language"`.

### Engine failure cases

- [ ] When the FuFirE engine is unreachable, the endpoint returns `error.code: "FUFIRE_UNAVAILABLE"`.
- [ ] When the endpoint is reachable but misconfigured, it returns `error.code: "CONFIGURATION_ERROR"`.
- [ ] No 5xx leaks raw stack traces or backend internals into `error.message`.

### Negative

- [ ] No silent fallback / synthesized data on failure. The frontend must see `ok: false` so it can render the error UI.

---

## 2. `POST /api/public/fusion-interpretation`

### Happy path

- [ ] POST body = `fixtures/fusion-interpretation.request.valid.json` returns HTTP 200.
- [ ] Response shape matches `fixtures/fusion-interpretation.response.success.json`.
- [ ] `ok: true` is present.
- [ ] `interpretation.chartSessionId` echoes the request `chartSessionId`.
- [ ] `interpretation.language` echoes the request `language`.
- [ ] `interpretation.headline` is a non-empty single-line string.
- [ ] `interpretation.body` is a non-empty markdown string the modal can render.
- [ ] `interpretation.stats` is an array of `{ label, value }` objects (≥ 1 entry).
- [ ] `interpretation.downloads.txt` and `interpretation.downloads.pdf` are either valid URLs or `null`. The frontend disables the buttons when `null`.
- [ ] `interpretation.generatedAt` parses as ISO 8601 UTC.

### Validation errors

- [ ] Omitting `chartSessionId` returns HTTP 4xx with `error.code: "VALIDATION_ERROR"`, `error.field: "chartSessionId"` (matches `fixtures/fusion-interpretation.response.error.json`).
- [ ] Omitting `chart` returns HTTP 4xx with `error.field: "chart"`.
- [ ] Invalid `language` returns HTTP 4xx with `error.field: "language"`.

### Other errors

- [ ] When the upstream model is unreachable, returns `error.code: "INTERPRETATION_UNAVAILABLE"`.
- [ ] Unknown `chartSessionId` returns HTTP 404 with a stable error code (e.g. `CHART_NOT_FOUND` or `INTERPRETATION_UNAVAILABLE`).

---

## 3. `POST /api/public/newsletter-signup`

### Happy path

- [ ] POST body = `fixtures/newsletter-signup.request.valid.json` returns HTTP 200.
- [ ] Response shape matches `fixtures/newsletter-signup.response.success.json`.
- [ ] `ok: true` and `subscribed: true` are both present.
- [ ] `subscription.email` echoes the request email.
- [ ] `subscription.confirmedAt` parses as ISO 8601 UTC.
- [ ] `subscription.doubleOptInRequired` is a boolean.

### Validation errors

- [ ] Sending `consent: false` returns HTTP 4xx with `error.code: "CONSENT_REQUIRED"`, `error.field: "consent"` (matches `fixtures/newsletter-signup.response.error.json`).
- [ ] Omitting `consent` is treated identically to `consent: false`.
- [ ] Invalid email (e.g. `"not-an-email"`) returns HTTP 4xx with `error.code: "INVALID_EMAIL"`, `error.field: "email"`.
- [ ] Missing `email` returns HTTP 4xx with `error.field: "email"`.

### Idempotency

- [ ] Re-submitting the same email returns either:
  - HTTP 200 with `ok: true` and `subscribed: true` (preferred — frontend treats as success), or
  - HTTP 4xx with `error.code: "ALREADY_SUBSCRIBED"`. The frontend renders a softer confirmation in this case.
- [ ] No duplicate subscription records are created on re-submission.

### Optional fields

- [ ] Omitting `name` returns HTTP 200 (name is optional).
- [ ] Omitting `chartSessionId` returns HTTP 200 (signup is allowed independent of a chart).

---

## Cross-cutting

### CORS / Preflight

- [ ] `OPTIONS` against each of the three endpoints returns appropriate CORS headers for the deployed frontend origin.
- [ ] Preflight does not require credentials.

### Content negotiation

- [ ] Sending non-JSON content type returns HTTP 4xx with a stable error code (e.g. `UNSUPPORTED_MEDIA_TYPE`).
- [ ] Sending malformed JSON returns HTTP 4xx with `error.code: "MALFORMED_JSON"` (or equivalent stable code).

### Rate limits (if implemented)

- [ ] Rate-limited responses use HTTP 429 with `error.code: "RATE_LIMITED"`.
- [ ] Frontend tolerates `RATE_LIMITED` by showing the standard error card.

### Logging / privacy

- [ ] No request bodies containing email addresses are written to logs in plain text without a clear retention policy.
- [ ] No PII appears in `error.message` strings (e.g. don't echo the user's email back inside the message).

### Out of scope (must NOT exist)

- [ ] No `/api/public/waitlist-signup` endpoint is exposed.
- [ ] No referral / queue-position fields appear in any response.
- [ ] No anonymous chart computation result is persisted beyond what `chartSessionId` requires.

---

## Sign-off

- [ ] All boxes above are checked.
- [ ] Every fixture in `contracts/fixtures/` round-trips against the deployed backend.
- [ ] The frontend at `public/index.html` exercises all three endpoints end-to-end without console errors.

When all three sign-off boxes are checked, Backend Iteration 2 is **done**.
