# REQ-MNT-railway-deploy-conformance: Server complies with Railway deployment conventions

**Type**: Maintainability

**Status**: Approved

**Priority**: Must-have

**Source**: [US-operator-deploy-preview](../user-stories/US-operator-deploy-preview.md)

**Source stakeholder**: [STK-railway-platform](../stakeholders.md)

## Description

The deployable artifact runs as a single Node.js process invoked by `npm start`. The server binds to the `PORT` env var (default 3000 locally) and the `HOST` env var (default `0.0.0.0`), exposes `GET /healthz` returning HTTP 200 with `{ ok: true, service: "bazodiac-fusion-preview" }`, and conforms to `railway.json` (Nixpacks builder, healthcheck path `/healthz`, retry policy on failure). Static assets and API live in the same process and origin (per [`CON-same-origin-node-deployment`](../constraints/CON-same-origin-node-deployment.md)).

## Acceptance Criteria

- Given the Railway deployment, when `npm start` runs on the platform, then the server binds to the platform-supplied `PORT` and starts within Railway's startup timeout.
- Given the deployment is live, when Railway calls `/healthz`, then the response is HTTP 200 with `{ ok: true, service: "bazodiac-fusion-preview" }` within the healthcheck timeout (20 seconds per `railway.json`).
- Given a startup failure, when the process crashes, then Railway's `ON_FAILURE` restart policy retries up to 3 times per `railway.json`.
- Given the deployed service, when both the homepage `/` and `/api/public/*` endpoints are exercised, then both respond from the same origin.

## Related Constraints

- [CON-same-origin-node-deployment](../constraints/CON-same-origin-node-deployment.md) — single-process same-origin shape this iteration assumes.
