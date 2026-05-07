# Bazodiac Public API — Frontend Contract

**Status:** Frozen for Backend Iteration 2.
**Source of truth:** [`/public/index.html`](../public/index.html) — the standalone HTML artifact embeds the only `apiClient` the frontend uses today; this document describes the contract that client expects. Canonical request / response examples live in [`./fixtures/`](./fixtures/).

All three endpoints share:

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Base URL:** configured via `API_BASE_URL`. Empty string = same-origin. Will become `import.meta.env.VITE_PUBLIC_API_BASE_URL` when the React port is revived.
- **Envelope:**
  - Success: `{ "ok": true, ...endpoint-specific fields }`
  - Error:   `{ "ok": false, "error": { "code": "STABLE_CODE", "message": "human readable", "field": "fieldNameIfApplicable" } }`
- **Errors:** non-2xx HTTP status is paired with `ok: false`. `error.code` is a stable, machine-readable, ALL_CAPS string rendered verbatim by the UI (e.g. `VALIDATION_ERROR`, `FUFIRE_UNAVAILABLE`, `CONFIGURATION_ERROR`, `INTERPRETATION_UNAVAILABLE`, `CONSENT_REQUIRED`, `INVALID_EMAIL`, `ALREADY_SUBSCRIBED`, `RATE_LIMITED`).
- **No silent frontend fallbacks.** The frontend never invents data. If an endpoint is unreachable, the relevant card shows the error code and a retry button. Production backends must not synthesize data on failure. The local/Railway adapter in this repository intentionally returns deterministic fixture data so the preview can be deployed before the final FuFirE services are connected.

---

## 1. `POST /api/public/fusion-chart`

Compute the FuFirE fusion chart for a given birth data set.

### Request

Required fields: `birthDate`, `birthTime`, `birthPlace`, `language`. `timezone` is optional during the preview adapter phase and may be `null` when the backend resolves it from `birthPlace`.

```json
{
  "birthDate": "1990-04-12",
  "birthTime": "08:30",
  "birthPlace": "Berlin, Germany",
  "timezone": "Europe/Berlin",
  "language": "de"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `birthDate` | `string` (ISO `YYYY-MM-DD`) | yes | |
| `birthTime` | `string` (`HH:MM`) \| `null` | yes | `null` is valid — the user checked "I don't know my birth time". |
| `birthPlace` | `string` | yes | Free-form. Backend resolves it to coordinates server-side. |
| `timezone` | `string` (IANA) \| `null` | no | e.g. `"Europe/Berlin"`; `null` lets the backend infer it from `birthPlace`. |
| `language` | `"de" \| "en"` | yes | UI language. |

See `fixtures/fusion-chart.request.valid.json`.

### Success Response — `200`

```json
{
  "ok": true,
  "chartSessionId": "fc_2719ae",
  "chart": {
    "sunSign": "Aries",
    "moonSign": "Scorpio",
    "ascendant": "Cancer",
    "baziYearAnimal": "Horse",
    "baziDaymaster": "Geng",
    "dominantElement": "Fire",
    "coherenceIndex": 0.82,
    "wuXing": {
      "wood": 0.08, "fire": 0.42, "earth": 0.18, "metal": 0.12, "water": 0.20
    },
    "cosmicSignature": "FU-2719-AE",
    "computedAt": "2026-05-06T12:00:00Z"
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `chartSessionId` | `string` | Stable identifier; input to `/fusion-interpretation`. |
| `chart.sunSign` / `moonSign` / `ascendant` | `string` | English labels. |
| `chart.baziYearAnimal` | `string` | English label (e.g. `"Horse"`). |
| `chart.baziDaymaster` | `string` | English label (e.g. `"Geng"`). |
| `chart.dominantElement` | `string` | One of `Wood`, `Fire`, `Earth`, `Metal`, `Water`. |
| `chart.coherenceIndex` | `number` (0..1) | |
| `chart.wuXing.{wood,fire,earth,metal,water}` | `number` (0..1) | Five floats summing to ~1.0. |
| `chart.cosmicSignature` | `string` | Display-only signature. |
| `chart.computedAt` | `string` (ISO 8601 UTC) | |

See `fixtures/fusion-chart.response.success.json`.

### Error Response

See `fixtures/fusion-chart.response.error.json`.

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "birthDate is required", "field": "birthDate" } }
```

Common codes: `VALIDATION_ERROR`, `FUFIRE_UNAVAILABLE`, `CONFIGURATION_ERROR`.

---

## 2. `POST /api/public/fusion-interpretation`

Generate the natural-language interpretation for a previously-computed chart.

### Request

Required fields: `language`, `chartSessionId`, `chart`.

```json
{
  "language": "de",
  "chartSessionId": "fc_2719ae",
  "chart": { "sunSign": "Aries", "moonSign": "Scorpio", "...": "..." }
}
```

The full `chart` object from `/fusion-chart` is passed back so the interpretation service does not need to refetch. See `fixtures/fusion-interpretation.request.valid.json`.

### Success Response — `200`

```json
{
  "ok": true,
  "interpretation": {
    "id": "int_…",
    "chartSessionId": "fc_…",
    "language": "de",
    "headline": "…",
    "body": "…multiline markdown…",
    "stats": [{ "label": "…", "value": "…" }],
    "downloads": { "txt": "…", "pdf": "…" },
    "generatedAt": "…"
  }
}
```

The frontend modal renders `headline`, `stats` as a grid, and `body` as markdown. `downloads.txt` / `downloads.pdf` populate the two download buttons; `null` keeps the corresponding button disabled.

See `fixtures/fusion-interpretation.response.success.json`.

### Error Response

See `fixtures/fusion-interpretation.response.error.json`. Codes: `VALIDATION_ERROR`, `INTERPRETATION_UNAVAILABLE`.

---

## 3. `POST /api/public/newsletter-signup`

Subscribe to release / pre-launch updates. Surfaced in the UI only after a successful chart computation.

### Request

Required fields: `email`, `name`, `language`, `consent`, `chartSessionId`.

```json
{
  "email": "user@example.com",
  "name": "Alex",
  "language": "de",
  "consent": true,
  "chartSessionId": "fc_2719ae"
}
```

`consent` must be `true`. The frontend's submit button stays disabled until the consent box is checked. See `fixtures/newsletter-signup.request.valid.json`.

### Success Response — `200`

```json
{
  "ok": true,
  "subscribed": true,
  "subscription": {
    "id": "sub_…",
    "email": "user@example.com",
    "confirmedAt": "…",
    "doubleOptInRequired": false
  }
}
```

See `fixtures/newsletter-signup.response.success.json`.

### Error Response

See `fixtures/newsletter-signup.response.error.json`. Codes: `CONSENT_REQUIRED`, `INVALID_EMAIL`, `VALIDATION_ERROR`, `ALREADY_SUBSCRIBED`.

`ALREADY_SUBSCRIBED` may also be returned as a soft-success `{ ok: true, subscribed: true }` — see the smoke checklist.

---

## Out of scope for Iteration 2

- Waitlist queue position, referral codes, referral counters — removed from the frontend, do not implement on the backend.
- Authenticated endpoints.
- WebSockets / streaming interpretation.
- Rate-limit headers — frontend ignores them; if implemented, return `{ ok: false, error: { code: "RATE_LIMITED" } }` with HTTP 429.

## Analytics

The frontend already emits `console.debug('[analytics]', eventName, payload)` for these events. Backend logging is optional for Iteration 2:

| Event | When |
|---|---|
| `language_changed` | DE/EN toggle |
| `theme_changed` | Light/dark toggle |
| `birthdata_started` | First focus on a form field |
| `birthdata_submitted` | Form submit |
| `fusion_chart_requested` / `_succeeded` / `_failed` | API call lifecycle |
| `fusion_report_opened` / `_failed` / `_download_txt` / `_download_pdf` | Modal interactions |
| `newsletter_prompt_viewed` / `_submitted` / `_confirmed` / `_failed` | Newsletter funnel |

## Validation

The manual test contract for Backend Iteration 2 lives in [`./SMOKE_CHECKLIST.md`](./SMOKE_CHECKLIST.md). Every box must pass before the iteration is sign-off ready.
