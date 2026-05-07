# CON-same-origin-node-deployment: Single same-origin Node process is the preferred deployment shape for this iteration

**Category**: Operational

**Status**: Active

**Source stakeholder**: [STK-railway-platform](../stakeholders.md)

## Description

For the current iteration, the deployment shape is a single Node.js process that serves both `public/` static assets and the `/api/public/*` endpoints from the same origin. No separate static host, CDN, edge worker, or microservice split is in scope **for this iteration**.

This is a deployment constraint scoped to the current iteration, **not an eternal architectural law**. A future migration to a split deployment (CDN-hosted frontend + API service, edge runtime, separate microservices, etc.) is permitted, but would be a new design decision with explicit CORS, environment-variable distribution, and smoke-harness implications that must be addressed before adoption.

Co-driver: [STK-founder](../stakeholders.md) for the operational simplicity goal.

## Rationale

Same-origin avoids CORS configuration complexity for the frontend, lets the adapter remain `node:http`-only (no Express, no reverse-proxy config), and matches Railway's single-service deployment model. A split deployment would multiply ops surface area without functional benefit at the current scale and pre-launch traffic levels.

## Impact

- Frontend uses relative `/api/public/*` paths (no client-side configurable API base URL).
- Deployment is `node server.mjs` behind Railway's load balancer; healthcheck `/healthz` and the API live in the same process.
- The smoke test (`scripts/smoke-test.mjs`) accepts an override (`PUBLIC_API_BASE_URL`) for remote runs but the frontend itself does not.
- A future split deployment would require: (a) a configurable frontend API base URL, (b) a CORS policy keyed to the deployed frontend origin (currently `*`), (c) split env-var distribution between two services, (d) revisiting the smoke harness for two distinct deployable targets.
