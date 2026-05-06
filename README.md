# Bazodiac — Frontend / Backend-Iteration 2

This repository is frozen for **Backend Iteration 2**. The frontend is final; the backend now implements against the contract documented here.

## Repository layout

```
/
├─ public/
│  └─ index.html                     # canonical frontend (Bazodiac One-Page)
├─ contracts/
│  ├─ public-api.md                  # frozen API contract
│  ├─ SMOKE_CHECKLIST.md             # manual test contract until automation exists
│  └─ fixtures/                      # canonical request / response examples
├─ archive/
│  ├─ standalone/                    # legacy HTML snapshots (v1, v2)
│  └─ react-src-iteration-1/         # archived, not build-ready
└─ README.md
```

## Canonical frontend

[`public/index.html`](./public/index.html) is the **only** active frontend for Backend Iteration 2. It contains the complete UI, the `apiClient`, all motion / theme / i18n logic, and exercises the three endpoints described below.

If you are extending the UI, edit `public/index.html`. Do not reactivate or build against `archive/react-src-iteration-1/`.

## Archived material

- `archive/react-src-iteration-1/` — earlier React/TypeScript prototype. **Not build-ready**, missing build configuration and the service layer. Preserved for the eventual React port. Do not implement Backend Iteration 2 against this folder. See [`archive/react-src-iteration-1/README.md`](./archive/react-src-iteration-1/README.md).
- `archive/standalone/` — historical HTML snapshots (`Bazodiac One-Page v1.html`, `v2.html`). For reference only.

## Backend contract

[`contracts/public-api.md`](./contracts/public-api.md) is the **frozen** specification for the three public endpoints Backend Iteration 2 must deliver:

- `POST /api/public/fusion-chart`
- `POST /api/public/fusion-interpretation`
- `POST /api/public/newsletter-signup`

All three use a unified envelope:

- Success: `{ "ok": true, ...endpoint-specific fields }`
- Error:   `{ "ok": false, "error": { "code", "message", "field?" } }`

[`contracts/fixtures/`](./contracts/fixtures/) holds canonical request / response JSON used by the frontend during development. **These fixtures are the source of truth** — implementation behavior must round-trip them unchanged.

| Endpoint | Valid request | Success response | Error response |
|---|---|---|---|
| `fusion-chart` | `fusion-chart.request.valid.json` | `fusion-chart.response.success.json` | `fusion-chart.response.error.json` |
| `fusion-interpretation` | `fusion-interpretation.request.valid.json` | `fusion-interpretation.response.success.json` | `fusion-interpretation.response.error.json` |
| `newsletter-signup` | `newsletter-signup.request.valid.json` | `newsletter-signup.response.success.json` | `newsletter-signup.response.error.json` |

## Manual testing

Until automated contract / integration tests exist, [`contracts/SMOKE_CHECKLIST.md`](./contracts/SMOKE_CHECKLIST.md) is the **manual test contract**. Backend changes must pass every item before being declared done.

## Out of scope for Iteration 2

- Waitlist queue, referral codes, referral counters — removed from the frontend, do not implement on the backend.
- Authenticated endpoints.
- Streaming / WebSocket interpretation.
- Reactivation of `archive/react-src-iteration-1/`.

## Conventions

- All endpoints accept and return UTF-8 JSON.
- `language` is one of `"de"` or `"en"`.
- Error codes are stable, machine-readable, ALL_CAPS strings rendered verbatim by the UI.
- Timestamps are ISO 8601 UTC.
# Waitinglist.bazodiac
