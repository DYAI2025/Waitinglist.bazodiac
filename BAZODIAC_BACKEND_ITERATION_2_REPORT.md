# BaZodiac Backend Iteration 2 — Implementation Report

## Test Results

```text
npm run check
→ passed

npm test
→ passed, 23 tests

npm run smoke
→ passed
```

## Changed Files

- `.env.example`
- `README.md`
- `package.json`
- `package-lock.json`
- `server.mjs`
- `public/index.html`
- `contracts/public-api.md`
- `contracts/SMOKE_CHECKLIST.md`
- `contracts/fixtures/fusion-chart.request.valid.json`
- `contracts/fixtures/fusion-chart.response.success.json`
- `contracts/fixtures/fusion-interpretation.request.valid.json`
- `scripts/check.mjs`
- `scripts/smoke-test.mjs`
- `src/app.mjs`
- `src/config.mjs`
- `src/errors.mjs`
- `src/fixtures.mjs`
- `src/http.mjs`
- `src/validation.mjs`
- `src/routes/publicApi.mjs`
- `src/services/fusionChartService.mjs`
- `src/services/fusionInterpretationService.mjs`
- `src/services/newsletterService.mjs`
- `src/providers/fufireProvider.mjs`
- `src/providers/geocodingProvider.mjs`
- `src/providers/interpretationProvider.mjs`
- `src/providers/newsletterProvider.mjs`
- `tests/fixtures.test.mjs`
- `tests/public-api.test.mjs`
- `tests/fufire-provider.test.mjs`
- `tests/frontend-compatibility.test.mjs`
- `archive/uploads-reference/Waiting_list (5).zip`
- `archive/uploads-reference/uploads/`
- `archive/uploads-reference/Waiting_list_5_unpacked/`

## Frontend Fixes Completed

- Desktop and small-window vertical scrolling is unblocked.
- `body` now uses `overflow-y:auto`; `.shell` uses `overflow-y:visible`.
- Static checks fail if `body` or `.shell` reintroduces blocking `overflow:hidden`.
- Default desktop motion profile no longer includes `custom_cursor`, `cursor_glow`, or `image_trail`.
- Rich cursor/canvas FX is opt-in via `localStorage.setItem('bazodiac.effects', 'rich')`.
- Rich FX stops on pointer idle, hidden tab, reduced motion, coarse pointer, and small viewports.
- Cursor loop is throttled to 30 FPS and has explicit `cancelAnimationFrame` paths.
- Essential text no longer uses `font-size:8px`.
- Form labels, chart labels, modal notes, and interpretation stats use stronger muted text tokens.
- Six chart stat tiles now have keyboard focus, hover/focus tooltip help, Escape dismissal, and ARIA labels in German and English.
- Unknown birth time marks the ascendant tile as provisional and changes its explanation.

## Backend Endpoints Implemented

- `GET /`
- `GET /healthz`
- `POST /api/public/fusion-chart`
- `POST /api/public/fusion-interpretation`
- `POST /api/public/newsletter-signup`

Backend is modularized under `src/` with provider boundaries for:

- FuFirE chart calculation
- geocoding/timezone resolution
- interpretation generation
- newsletter signup

## FuFirE Mapping Summary

Non-stub mode calls exactly:

```text
POST {FUFIRE_BASE_URL}/chart
```

With:

```text
X-API-Key: ${FUFIRE_API_KEY}
Content-Type: application/json
```

Mapped request fields:

- `birthDate + birthTime` → `local_datetime`
- `birthTime:null` → noon fallback `T12:00:00` with provisional fields
- resolved timezone → `tz_id`
- resolved longitude/latitude → `geo_lon_deg`, `geo_lat_deg`
- constants:
  - `dst_policy:"error"`
  - `bodies:null`
  - `include_validation:false`
  - `time_standard:"CIVIL"`
  - `day_boundary:"midnight"`

Mapped response fields:

- `positions[Sun]` → `chart.sunSign`
- `positions[Moon]` → `chart.moonSign`
- `angles.Ascendant` degrees → localized ascendant sign when birth time is known
- `bazi.pillars.year.animal` → `baziYearAnimal`
- `bazi.day_master` → `baziDaymaster`
- `wuxing.dominant_planet ?? dominant_bazi` → `dominantElement`
- `wuxing.harmony_index` → `coherenceIndex`
- `wuxing.from_planets.Holz/Feuer/Erde/Metall/Wasser` → `wood/fire/earth/metal/water`

## Provider Environment Required for Production

```dotenv
NODE_ENV=production
PUBLIC_API_STUB_MODE=false

FUFIRE_BASE_URL=https://bafe-production.up.railway.app
FUFIRE_API_KEY=...
FUFIRE_TIMEOUT_MS=15000

GEOCODING_API_URL=...
GEOCODING_API_KEY=...
TIMEZONE_API_URL=...
TIMEZONE_API_KEY=...

INTERPRETATION_API_URL=...
GEMINI_API_KEY=...

NEWSLETTER_API_URL=...
NEWSLETTER_API_KEY=...
```

## Known Limitations

- Geocoding/timezone provider boundary is generic and must be adapted to the selected vendor's exact API shape.
- Interpretation provider boundary is generic and requires final Gemini/proxy endpoint confirmation.
- Newsletter provider boundary is generic and requires final newsletter vendor endpoint confirmation.
- Stub mode intentionally returns deterministic fixtures and must not be used as production data.

## Exact Next Step for Real Credentials / Deployment

1. Set Railway variables with `NODE_ENV=production`, `PUBLIC_API_STUB_MODE=false`, `FUFIRE_API_KEY`, geocoding/timezone provider URLs/keys, interpretation provider URL/key, and newsletter provider URL/key.
2. Run `npm run check && npm test && npm run smoke` locally.
3. Deploy to Railway.
4. Run smoke against the deployed URL with:

```bash
PUBLIC_API_BASE_URL=https://<railway-app-url> npm run smoke
```
