# GOAL-pre-launch-preview: Pre-launch deployable preview

**Description**: Provide a deployable, contract-stable preview of the Bazodiac experience that runs end-to-end without upstream backend services, so stakeholders can validate the flow before the FuFirE / Gemini / newsletter integrations land. The preview must be reachable on Railway, satisfy the public API contract, and let a reviewer complete the chart → interpretation → newsletter flow without any synthesized-engine error visible to the user.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Success Criteria

- [ ] Repository deploys to Railway via `npm start` and passes the `/healthz` healthcheck.
- [ ] The three public POST endpoints (`/api/public/{fusion-chart, fusion-interpretation, newsletter-signup}`) respond with the contract envelope without any upstream provider configured.
- [ ] `npm run check`, `npm test` (33 tests), and `npm run smoke` all pass against the deployed preview (`PUBLIC_API_BASE_URL=https://… npm run smoke`).
- [ ] A reviewer can complete the chart → interpretation → newsletter flow in a browser without observing any "data synthesized" disclosure or backend error.

## Related Artifacts

- User stories: [US-compute-cosmic-signature](../user-stories/US-compute-cosmic-signature.md), [US-provisional-without-birth-time](../user-stories/US-provisional-without-birth-time.md), [US-read-fusion-interpretation](../user-stories/US-read-fusion-interpretation.md), [US-operator-deploy-preview](../user-stories/US-operator-deploy-preview.md)
- Requirements: [REQ-F-stable-error-envelope](../requirements/REQ-F-stable-error-envelope.md), [REQ-F-fusion-chart-endpoint](../requirements/REQ-F-fusion-chart-endpoint.md), [REQ-F-fusion-interpretation-endpoint](../requirements/REQ-F-fusion-interpretation-endpoint.md), [REQ-F-null-birth-time-accepted](../requirements/REQ-F-null-birth-time-accepted.md), [REQ-USA-error-code-rendered-verbatim](../requirements/REQ-USA-error-code-rendered-verbatim.md), [REQ-MNT-railway-deploy-conformance](../requirements/REQ-MNT-railway-deploy-conformance.md), [REQ-MNT-smoke-against-public-url](../requirements/REQ-MNT-smoke-against-public-url.md)
