# DEC-same-origin-monolith: Same-origin Node monolith (static + API in one process)

**Status**: Active

**Category**: Architecture

**Scope**: system-wide (deploy + backend)

**Source**: [CON-same-origin-node-deployment](../1-spec/constraints/CON-same-origin-node-deployment.md), [REQ-MNT-railway-deploy-conformance](../1-spec/requirements/REQ-MNT-railway-deploy-conformance.md)

**Last updated**: 2026-05-07

## Context

For the preview iteration the deployment story (Railway / Nixpacks) and the CORS surface stay simplest when the static frontend (`public/index.html`) and the three API endpoints are served by the same Node process from the same origin. Splitting the frontend onto a CDN (Vercel, Netlify, S3+CloudFront) while keeping the API on Node would multiply the deployment surface (two CI paths, two release schedules, CORS narrowing, env-management duplication) for no gain at this contract size.

## Decision

One Node process serves both the static frontend and the three POST endpoints from the same origin. The dispatch logic lives in `src/app.mjs`:

- `OPTIONS *` → CORS preflight.
- `GET|HEAD /healthz` → liveness JSON.
- `POST /api/public/*` → route table → service → provider/fixture.
- `GET *` → static file (with SPA fallback to `index.html`).

Splitting into separate static-CDN + API-service deployments is **out of scope for this iteration**. Reintroducing the split requires deprecating or superseding this decision.

## Enforcement

### Trigger conditions

- **Specification phase**: n/a
- **Design phase**: when proposing component boundaries, deployment topology, or a CDN integration.
- **Code phase**: when introducing a new entry point or build target.
- **Deploy phase**: when designing CI/CD, hosting, or proxy/CDN layout.

### Required patterns

- `server.mjs` binds a single port (`PORT`/`HOST` env vars) and attaches `createHandler(config)` from `src/app.mjs`.
- `railway.json` defines a single service with `startCommand: "npm start"` and `healthcheckPath: "/healthz"`.
- The frontend's `apiClient` uses `API_BASE_URL=""` (empty string = same-origin) by default.

### Required checks

1. `cat railway.json | jq '.deploy'` shows a single service definition.
2. `grep -E "API_BASE_URL|baseURL" public/index.html` returns the same-origin default and no hardcoded cross-origin host.
3. `curl -i http://localhost:3000/healthz` and `curl -i http://localhost:3000/` are both served by the same process.

### Prohibited patterns

- Introducing a separate `frontend` deployment (Vercel, Netlify, S3) that serves `index.html` while the API stays on Node, without first superseding this decision.
- Adding an external reverse proxy (nginx, Caddy) in front of the Node process for routing static vs API traffic — the Node process does that itself.
- Hardcoding a cross-origin API base URL into `public/index.html`.
