# Adapter Component

Node.js HTTP server providing the public Bazodiac contract surface. Bootstrap → dispatch → routes → services → providers, with stub-vs-live mode short-circuit at the service layer.

> **Component definition**: [`CLAUDE.component.md`](CLAUDE.component.md) — responsibility, interfaces, 17 requirements, 4 decisions.

## Source layout

| Path | Role |
|---|---|
| [`server.mjs`](../../server.mjs) | Bootstrap — `loadConfig`, `assertProductionConfig`, bind `PORT`/`HOST` |
| [`src/app.mjs`](../../src/app.mjs) | Dispatch — OPTIONS/CORS, `/healthz`, route lookup, static-with-SPA-fallback |
| [`src/routes/publicApi.mjs`](../../src/routes/publicApi.mjs) | POST `/api/public/*` route table |
| `src/services/{fusionChart,fusionInterpretation,newsletter}Service.mjs` | Validate input; branch on `config.stubMode`; orchestrate providers |
| `src/providers/{fufire,geocoding,interpretation,newsletter}Provider.mjs` | Outbound integrations; map public ↔ upstream schemas |
| [`src/{config,errors,http,validation,fixtures}.mjs`](../../src) | Cross-cutting infrastructure |

## Build / run / test commands

The adapter has **zero runtime dependencies** ([`DEC-zero-runtime-deps`](../../decisions/DEC-zero-runtime-deps.md)) — only Node.js built-ins. `package.json` `dependencies` is empty.

```bash
# Run the server (default: stub mode, port 3000)
npm start
# → opens http://localhost:3000, serves the frontend + API

# Run the full test suite (40 tests: 33 contract + 7 editorial-voice)
npm test
# → 40/40 should pass

# Pre-commit gate (linter + structural checks)
npm run check

# Local smoke test (spawns server on port 4173, asserts contract surface)
npm run smoke

# Smoke against a deployed URL
PUBLIC_API_BASE_URL=https://<railway-domain> npm run smoke

# Editorial-voice soft-hint linter (NOT in npm run check — soft, never fails)
npm run editorial-hints
# → prints hint lines for each watchword occurrence in public/index.html
```

## Environment variables

| Variable | Default | Required when |
|---|---|---|
| `PORT` | `3000` | always (Railway sets it) |
| `HOST` | `0.0.0.0` | always |
| `PUBLIC_API_STUB_MODE` | `true` | production must set to `false` per [`REQ-COMP-stub-mode-prod-disabled`](../../1-spec/requirements/REQ-COMP-stub-mode-prod-disabled.md) |
| `CORS_ORIGIN` | `*` | production should narrow |
| `FUFIRE_BASE_URL`, `FUFIRE_API_KEY`, `FUFIRE_TIMEOUT_MS` | unset | when `PUBLIC_API_STUB_MODE=false` |
| `GEOCODING_API_URL`, `GEOCODING_API_KEY` | unset | when `PUBLIC_API_STUB_MODE=false` |
| `TIMEZONE_API_URL`, `TIMEZONE_API_KEY` | unset | when `PUBLIC_API_STUB_MODE=false` |
| `INTERPRETATION_API_URL`, `GEMINI_API_KEY` | unset | when `PUBLIC_API_STUB_MODE=false` |
| `NEWSLETTER_API_URL`, `NEWSLETTER_API_KEY` | unset | when `PUBLIC_API_STUB_MODE=false` |

In live mode (`stubMode=false`), `assertProductionConfig()` runs at boot and aborts startup with `CONFIGURATION_ERROR` listing every missing variable.

See [`.env.example`](../../.env.example) for the full provider env-var set.

## Decisions that govern this component

Read these before changing endpoint structure, dependencies, error codes, or topology:

| File | Triggers when |
|---|---|
| [`DEC-layered-adapter`](../../decisions/DEC-layered-adapter.md) | Adding a new endpoint, modifying provider boundaries, or proposing a new fallback mechanism |
| [`DEC-zero-runtime-deps`](../../decisions/DEC-zero-runtime-deps.md) | Adding any import that is not a `node:*` built-in or a relative path inside the repository |
| [`DEC-frozen-error-codes`](../../decisions/DEC-frozen-error-codes.md) | Implementing a new error path or surfacing a new failure mode |
| [`DEC-same-origin-monolith`](../../decisions/DEC-same-origin-monolith.md) | Introducing a new entry point, build target, or considering a separate API service deployment |

## Common operations

### Add a new endpoint

1. Define the contract in [`contracts/public-api.md`](../../contracts/public-api.md) (frozen for current iteration; new endpoints require a contract addition).
2. Add the route to [`src/routes/publicApi.mjs`](../../src/routes/publicApi.mjs).
3. Implement the service in `src/services/<endpoint>Service.mjs`. Branch on `config.stubMode` per `DEC-layered-adapter`.
4. Implement the provider in `src/providers/<endpoint>Provider.mjs` if it talks to an upstream service.
5. Add a contract test in `tests/`. The new test must run against both stub mode and (eventually) live mode.

### Add a new error code

1. Add the code to `ERROR_CODES` in [`src/errors.mjs`](../../src/errors.mjs).
2. Add a factory function in the same file.
3. Update [`contracts/public-api.md`](../../contracts/public-api.md) and [`contracts/SMOKE_CHECKLIST.md`](../../contracts/SMOKE_CHECKLIST.md) in the **same commit** per `DEC-frozen-error-codes`.

### Add a runtime dependency

**Don't.** Per `DEC-zero-runtime-deps`, the adapter uses only Node built-ins. If a new dependency seems necessary, deprecate the decision first per `decisions/PROCEDURES.md`.

## Tests

| Test file | Coverage |
|---|---|
| `tests/*.test.mjs` (33 tests) | Contract surface — endpoints, error envelope, validation, smoke gates |
| `tests/editorial-voice.test.mjs` (7 tests) | Soft-hint linter — watchword extraction, slash-split, control-char filter, parser loud-failure |

Run all: `npm test`. Single file: `node --test tests/<file>.test.mjs`.

## What lives elsewhere

- The frontend (single-file HTML/CSS/JS): [`frontend`](../frontend/) component.
- The editorial guideline + watchword list: [`1-spec/editorial-voice.md`](../../1-spec/editorial-voice.md).
- The soft-hint linter implementation: [`scripts/check-editorial-voice.mjs`](../../scripts/check-editorial-voice.mjs).
- Infrastructure / deploy procedures: [`4-deploy/runbooks/`](../../4-deploy/runbooks/).
