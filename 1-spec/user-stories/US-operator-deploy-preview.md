# US-operator-deploy-preview: Deploy the preview to Railway and run smoke tests

**As a** project owner / maintainer, **I want** to deploy the current branch to Railway and run smoke tests against the deployed URL, **so that** I can validate the experience end-to-end before showing it to stakeholders or signing off on a release.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-founder](../stakeholders.md)

**Related goal**: [GOAL-pre-launch-preview](../goals/GOAL-pre-launch-preview.md)

## Acceptance Criteria

- Given the latest commit on `main`, when I run `npm start` (locally or on Railway), then the server binds to `PORT`/`HOST` and `GET /healthz` returns `200 {ok: true, service: "bazodiac-fusion-preview"}` within Railway's healthcheck timeout.
- Given the preview is deployed at a public URL, when I run `PUBLIC_API_BASE_URL=https://… npm run smoke` from a workstation, then every smoke assertion passes (homepage, the three POST endpoints, `CONSENT_REQUIRED`, `MALFORMED_JSON`, `UNSUPPORTED_MEDIA_TYPE`, CORS preflight).
- Given the preview is deployed without provider credentials (stub mode), when I open it in a browser, then I can complete the chart → interpretation → newsletter flow without any 5xx or backend error visible to the user.
- Given a failed deployment, when the healthcheck fails, then Railway's restart policy retries up to 3 times before marking the deploy failed (per `railway.json`).

## Derived Requirements

- [REQ-MNT-railway-deploy-conformance](../requirements/REQ-MNT-railway-deploy-conformance.md)
- [REQ-MNT-smoke-against-public-url](../requirements/REQ-MNT-smoke-against-public-url.md)
