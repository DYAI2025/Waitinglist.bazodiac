## Test Results

`npm run check
→ passed

npm test
→ passed, 23 tests

npm run smoke
→ passed`

## Changed Files

Kernänderungen:

`.env.example
README.md
package.json
package-lock.json
server.mjs
public/index.html

contracts/public-api.md
contracts/SMOKE_CHECKLIST.md
contracts/fixtures/*.json

scripts/check.mjs
scripts/smoke-test.mjs

src/app.mjs
src/config.mjs
src/errors.mjs
src/http.mjs
src/validation.mjs
src/fixtures.mjs
src/routes/publicApi.mjs
src/services/*.mjs
src/providers/*.mjs

tests/fixtures.test.mjs
tests/public-api.test.mjs
tests/fufire-provider.test.mjs
tests/frontend-compatibility.test.mjs

archive/uploads-reference/*`

## Frontend Fixes Completed

Desktop-/Small-window-Scrolling repariert.

`body` blockiert kein vertikales Scrollen mehr.

`.shell` blockiert keine vertikale Overflow-Fläche mehr.

Default Desktop Motion entfernt heavy FX: `custom_cursor`, `cursor_glow`, `image_trail`.

Rich Cursor FX nur noch opt-in via:

JavaScript

`localStorage.setItem('bazodiac.effects', 'rich')`

Cursor FX stoppt bei Idle, Hidden Tab, Reduced Motion, Touch/Coarse Pointer und Small Viewports.

Essential UI Text nutzt keine `8px` mehr.

Kontrast über `--fg-muted` / `--fg-subtle` verbessert.

Chart Tiles haben Hover-/Focus-Tooltips + ARIA Labels für:

Sonne

Mond

Aszendent

BaZi Jahrestier

Tagesmeister

Dominantes Element

Ascendant Tooltip zeigt bei unbekannter Geburtszeit eine Provisional-Erklärung.

## Backend Endpoints Implemented

`GET  /
GET  /healthz
POST /api/public/fusion-chart
POST /api/public/fusion-interpretation
POST /api/public/newsletter-signup`

Architektur jetzt modular:

`server.mjs
src/
  app.mjs
  config.mjs
  errors.mjs
  http.mjs
  validation.mjs
  routes/publicApi.mjs
  services/
  providers/`

## FuFirE Mapping Summary

Non-stub mode ruft exakt auf:

`POST {FUFIRE_BASE_URL}/chart`

Mit:

`X-API-Key: ${FUFIRE_API_KEY}
Content-Type: application/json`

Payload Mapping:

`birthDate + birthTime → local_datetime
birthTime:null        → T12:00:00 + provisional fields
timezone/geocoder     → tz_id
coordinates           → geo_lon_deg / geo_lat_deg
dst_policy            → "error"
bodies                → null
include_validation    → false
time_standard         → "CIVIL"
day_boundary          → "midnight"`

Response Mapping:

`positions Sun/Moon                         → sunSign / moonSign
angles.Ascendant degree                    → localized ascendant sign
bazi.pillars.year.animal                   → baziYearAnimal
bazi.day_master                            → baziDaymaster
wuxing.dominant_planet ?? dominant_bazi    → dominantElement
wuxing.harmony_index                       → coherenceIndex
Holz/Feuer/Erde/Metall/Wasser              → wood/fire/earth/metal/water`

## Production Env Vars Required

dotenv

`NODE_ENV=production
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
NEWSLETTER_API_KEY=...`

## Known Limitations

Geocoding/timezone provider boundary ist generisch und muss an den finalen Vendor angepasst werden.

Interpretation provider boundary ist generisch und braucht den finalen Gemini-/Proxy-Endpoint.

Newsletter provider boundary ist generisch und braucht den finalen Newsletter-Vendor.

Stub Mode bleibt deterministisch und darf nicht als Production-Datenquelle genutzt werden.

## Exact Next Step

Railway Env Vars setzen, dann gegen Deployment prüfen:

Bash

`PUBLIC_API_BASE_URL=https://<railway-app-url> npm run smoke`

**a.** Nächster sinnvoller Schritt: echte Geocoding-/Timezone-Vendor-Response in `src/providers/geocodingProvider.mjs` finalisieren und mit Mock-Tests absichern.
