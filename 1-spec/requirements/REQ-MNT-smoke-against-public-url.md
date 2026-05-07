# REQ-MNT-smoke-against-public-url: Smoke harness can target a deployed URL via `PUBLIC_API_BASE_URL`

**Type**: Maintainability

**Status**: Approved

**Priority**: Should-have

**Source**: [US-operator-deploy-preview](../user-stories/US-operator-deploy-preview.md)

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

`scripts/smoke-test.mjs` accepts an optional `PUBLIC_API_BASE_URL` environment variable. When set, the harness skips spawning a local server and runs every assertion against the supplied URL. When unset, it spawns a local server on port 4173 and runs against `http://127.0.0.1:4173` (the existing local-first behaviour). Both modes execute the identical assertion set so a deployment can be validated with the same script.

## Acceptance Criteria

- Given `PUBLIC_API_BASE_URL` is unset, when `npm run smoke` runs, then it spawns a local server on port 4173 and asserts homepage + 3 endpoints + CONSENT_REQUIRED + MALFORMED_JSON + UNSUPPORTED_MEDIA_TYPE + CORS preflight.
- Given `PUBLIC_API_BASE_URL=https://example.test`, when `npm run smoke` runs, then it does not spawn a local server, polls `${BASE_URL}/healthz` until ready, and runs the identical assertion set.
- Given a remote target that fails any assertion, when the script runs, then it exits non-zero with an informative error referencing the failed assertion and HTTP status.
