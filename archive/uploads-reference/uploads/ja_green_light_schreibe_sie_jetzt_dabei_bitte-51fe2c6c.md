Ja — **green light**. Schreibe sie jetzt.

Dabei bitte **alle drei Punkte erledigen**, nicht nur die Fixtures:

Markdown

`Proceed with the remaining Phase 0 artifacts.

## Required now

1. Create the 9 JSON fixtures:

contracts/fixtures/fusion-chart.request.valid.json
contracts/fixtures/fusion-chart.response.success.json
contracts/fixtures/fusion-chart.response.error.json

contracts/fixtures/fusion-interpretation.request.valid.json
contracts/fixtures/fusion-interpretation.response.success.json
contracts/fixtures/fusion-interpretation.response.error.json

contracts/fixtures/newsletter-signup.request.valid.json
contracts/fixtures/newsletter-signup.response.success.json
contracts/fixtures/newsletter-signup.response.error.json

2. Create a root README.md for the backend team.

It must explain:
- public/index.html is the canonical frontend for Backend Iteration 2
- archive/react-src-iteration-1 is not active and not build-ready
- archive/standalone contains legacy HTML snapshots
- contracts/public-api.md defines the backend contract
- contracts/fixtures/*.json are the source of truth for request/response examples
- Backend Iteration 2 must implement:
  - POST /api/public/fusion-chart
  - POST /api/public/fusion-interpretation
  - POST /api/public/newsletter-signup

3. Create a smoke checklist markdown file:

contracts/SMOKE_CHECKLIST.md

This should be used until automated test infrastructure exists.

## Fixture rules

Use this response envelope consistently:

Success:

{
  "ok": true,
  "...": "endpoint-specific fields"
}

Error:

{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "field": "fieldNameIfApplicable"
  }
}

## Endpoint fixture requirements

### POST /api/public/fusion-chart

Valid request must include:
- birthDate
- birthTime
- birthPlace
- timezone
- language

Success response must include:
- ok: true
- chartSessionId
- chart.sunSign
- chart.moonSign
- chart.ascendant
- chart.baziYearAnimal
- chart.baziDaymaster
- chart.dominantElement
- chart.coherenceIndex
- chart.wuXing.wood/fire/earth/metal/water

Error response should model a missing birthDate or invalid birthPlace.

### POST /api/public/fusion-interpretation

Valid request must include:
- language
- chartSessionId
- chart

Success response must include:
- ok: true
- interpretation

Error response should model missing chartSessionId or missing chart.

### POST /api/public/newsletter-signup

Valid request must include:
- email
- name
- language
- consent
- chartSessionId

Success response must include:
- ok: true
- subscribed: true

Error response should model invalid email or missing consent.

## Important constraints

- Do not add waitlist-signup yet.
- Do not reactivate src/.
- Do not create random waitlist position or referral fixtures.
- Do not introduce backend implementation in this step.
- Keep all fixtures deterministic and backend-team friendly.`

Kleine Korrektur: Die Smoke Checklist ist nicht mehr optional. Sie ist jetzt der manuelle Testvertrag, bis echte Contract-/Integrationstests existieren.

ENTWICKLERMODUS

window.__oai_logHTML?window.__oai_logHTML():window.__oai_SSR_HTML=window.__oai_SSR_HTML||Date.now();requestAnimationFrame((function(){window.__oai_logTTI?window.__oai_logTTI():window.__oai_SSR_TTI=window.__oai_SSR_TTI||Date.now()}))

Länger
