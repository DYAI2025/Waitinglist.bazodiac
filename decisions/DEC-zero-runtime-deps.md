# DEC-zero-runtime-deps: Zero runtime dependencies (Node built-ins only)

**Status**: Active

**Category**: Architecture

**Scope**: backend (`server.mjs` + `src/`)

**Source**: [GOAL-pre-launch-preview](../1-spec/goals/GOAL-pre-launch-preview.md), [CON-same-origin-node-deployment](../1-spec/constraints/CON-same-origin-node-deployment.md)

**Last updated**: 2026-05-07

## Context

The contract surface is small (3 POST endpoints + `/healthz` + static delivery). Adding an HTTP framework (Express, Fastify, Hono, Koa) would expand the supply chain dramatically (Express alone adds ~30 transitive packages) for marginal ergonomic gains. The deployment story (Railway / Nixpacks) is simplest when `package.json` has no production dependencies — `npm install --production` becomes a no-op, lockfile management never blocks deploys, and the runtime image stays small.

## Decision

The adapter uses only Node.js built-ins:

- `node:http`
- `node:fs`
- `node:path`
- `node:url`
- `node:crypto`

No package is added to `"dependencies"` in `package.json`. Dev/test dependencies are allowed (e.g., test runner, linter).

## Enforcement

### Trigger conditions

- **Specification phase**: n/a
- **Design phase**: when proposing a new HTTP framework, runtime dependency, or build-tool integration in `architecture.md` or `api-design.md`.
- **Code phase**: when adding any import that is not a `node:*` built-in or a relative path inside the repository.
- **Deploy phase**: when reviewing the build/install path or considering adding a CDN, edge function, or framework.

### Required patterns

All imports follow one of these two shapes:

```javascript
import { something } from 'node:http';      // or node:fs / node:path / node:url / node:crypto
import { something } from './other-module.mjs'; // relative path inside src/
```

`package.json` keeps `"dependencies": {}` (or omits the key entirely).

### Required checks

1. `cat package.json | jq '.dependencies'` returns `{}` or `null`.
2. `grep -rE "from\s+'[^./]" src/ server.mjs | grep -v 'node:'` returns no results.
3. `npm install --production` reports `up to date in 0s` (no packages installed).

### Prohibited patterns

- Adding `express`, `fastify`, `hono`, `koa`, `body-parser`, `cors`, `dotenv` (env is read directly via `process.env`), or any other runtime dependency without first deprecating this decision.
- Importing from a CDN URL or non-node remote.
- Using `npx some-package` at runtime.
