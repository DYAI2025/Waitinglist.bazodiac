# Bazodiac FuFirE Fusion Preview

Bazodiac FuFirE Fusion Preview is a pre-release landing and waitlist experience for **Bazodiac**, a reflective chart product that combines Western astrology, Chinese BaZi, and Wu-Xing element modeling into a single "Cosmic Signature" preview.

The repository currently ships the production-facing preview as a **standalone HTML application** and includes a small **Railway-ready Node.js adapter server**. The server serves the static frontend, exposes health checks, and implements the public API contract with deterministic fixture-backed responses so the experience is deployable and smoke-testable before the final FuFirE/Gemini backend services are connected.

> This is a reflection and product-preview application. It is not a scientific, medical, financial, legal, or deterministic life-decision tool.

## Purpose and Origin

This codebase originated as an exported one-page Bazodiac waiting-list / preview concept. Earlier React and standalone iterations are preserved in `archive/` and `uploads/`, but the active implementation has been consolidated around one canonical artifact:

- `public/index.html` — the active frontend, UI state machine, i18n, animations, API client, and modal/newsletter flow.
- `contracts/public-api.md` — the public Backend Iteration 2 API contract.
- `contracts/fixtures/` — canonical request and response examples used by the adapter server and smoke tests.

The goal of this iteration is to keep the frontend honest and functional: it calls real HTTP endpoints, renders explicit backend errors, and no longer relies on silent client-side mock data. For deployment readiness, this repository now includes a minimal server that can run on Railway without external package dependencies.

## Technology Stack

### Runtime and Deployment

- **Node.js 20+** using native ECMAScript modules.
- **No runtime npm dependencies**; the HTTP server uses Node's built-in `node:http`, `node:fs`, and `node:path` modules.
- **Railway / Nixpacks** deployment via `railway.json`.
- **Same-origin API** by default: the frontend posts to `/api/public/*` on the same host.

### Frontend

- Standalone HTML, CSS, and JavaScript in `public/index.html`.
- CSS custom properties for dark/light theming.
- German and English i18n dictionaries embedded in the page.
- Motion-profile manager for desktop/tablet/mobile/reduced-motion behavior.
- Progressive enhancement for cursor effects, card glow, magnetic buttons, parallax, and reduced-motion accessibility.
- Browser `fetch` API for the public contract endpoints.

### Backend Adapter

- `server.mjs` serves static files from `public/`.
- `server.mjs` exposes:
  - `GET /healthz`
  - `POST /api/public/fusion-chart`
  - `POST /api/public/fusion-interpretation`
  - `POST /api/public/newsletter-signup`
  - deterministic report download helpers for the fixture interpretation.
- The adapter validates required fields and returns the contract envelope `{ ok: true, ... }` or `{ ok: false, error: ... }`.
- Successful API responses are sourced from `contracts/fixtures/` to keep the deployed preview aligned with the documented contract.

## Architecture

```text
Browser
  │
  │ GET /
  ▼
Node adapter server (server.mjs)
  ├─ serves public/index.html
  ├─ GET /healthz
  ├─ POST /api/public/fusion-chart
  ├─ POST /api/public/fusion-interpretation
  └─ POST /api/public/newsletter-signup
       │
       ▼
contracts/fixtures/*.json
```

### Active Application Flow

1. The user opens the one-page Bazodiac preview.
2. The user enters birth data.
3. The frontend validates date, time, place, and language locally.
4. The frontend posts to `/api/public/fusion-chart`.
5. The chart card renders the returned Western, BaZi, Wu-Xing, and coherence fields.
6. The user opens the Fusion Report modal.
7. The frontend posts the chart payload to `/api/public/fusion-interpretation`.
8. The modal renders the interpretation headline, stats, and body.
9. The user may download a text report or continue to newsletter signup.
10. The newsletter form posts to `/api/public/newsletter-signup` with explicit consent.

### Why the Adapter Server Exists

Railway deployments need a process that binds to `PORT`. A purely static `public/index.html` artifact cannot do that on its own unless it is placed behind a separate static host. `server.mjs` makes this repository self-contained for Railway while preserving the same public API shape that a real production backend will later implement.

The adapter is intentionally small and replaceable. When the real FuFirE services are ready, replace the fixture-backed handler internals in `server.mjs` with service calls while keeping the same endpoint paths and response envelopes.

## Repository Layout

```text
/
├─ public/
│  └─ index.html                     # Canonical active frontend
├─ contracts/
│  ├─ public-api.md                  # Public API contract
│  ├─ SMOKE_CHECKLIST.md             # Manual QA checklist
│  └─ fixtures/                      # Canonical request/response JSON examples
├─ scripts/
│  ├─ check.mjs                      # Static syntax/HTML sanity checks
│  └─ smoke-test.mjs                 # End-to-end local server/API smoke test
├─ archive/
│  ├─ standalone/                    # Historical standalone HTML snapshots
│  └─ react-src-iteration-1/         # Archived, not build-ready React prototype
├─ uploads/                          # Original import/export material, reference only
├─ server.mjs                        # Railway-ready Node adapter server
├─ package.json                      # Node scripts and engine metadata
├─ railway.json                      # Railway/Nixpacks deployment settings
└─ README.md
```

## Public API Contract

The canonical contract lives in [`contracts/public-api.md`](./contracts/public-api.md). The three public endpoints are:

| Endpoint | Method | Purpose |
|---|---:|---|
| `/api/public/fusion-chart` | `POST` | Validate birth data and compute the Fusion Chart payload. |
| `/api/public/fusion-interpretation` | `POST` | Generate/render the natural-language interpretation for an existing chart. |
| `/api/public/newsletter-signup` | `POST` | Subscribe a consenting user to Bazodiac release updates. |

All API responses use a stable envelope:

```json
{ "ok": true }
```

or

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "field": "birthDate" } }
```

## Local Installation

### Prerequisites

- Node.js `>=20`
- npm (bundled with Node)

### Install

This project currently has no external dependencies, but running `npm install` is still useful because it verifies `package.json` and creates a lockfile if your workflow requires one.

```bash
npm install
```

### Run Locally

```bash
npm start
```

The application starts on:

```text
http://localhost:3000
```

Override the port if needed:

```bash
PORT=8080 npm start
```

### Health Check

```bash
curl http://localhost:3000/healthz
```

Expected response:

```json
{ "ok": true, "service": "bazodiac-fusion-preview" }
```

## Testing and Quality Checks

Run syntax and HTML sanity checks:

```bash
npm run check
```

Run the local end-to-end smoke test:

```bash
npm run smoke
```

The smoke test starts the server on a temporary local port, checks `GET /`, checks `/healthz`, posts each valid fixture request, and verifies one consent-validation error path.

## Railway Deployment

### One-Time Setup

1. Create or open a Railway project.
2. Connect this repository.
3. Ensure the service uses the repository root as the app root.
4. Railway/Nixpacks should detect `package.json` automatically.

### Deployment Settings

The included `railway.json` configures:

- Builder: `NIXPACKS`
- Start command: `npm start`
- Health check path: `/healthz`
- Restart policy: retry on failure

No mandatory environment variables are required for the current fixture-backed deployment.

Optional environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` locally, Railway injects its own value | HTTP listen port. |
| `HOST` | `0.0.0.0` | Bind address. Keep `0.0.0.0` on Railway. |

### Railway Verification

After deployment, verify:

```bash
curl https://<your-railway-domain>/healthz
curl https://<your-railway-domain>/
```

Then open the Railway domain in a browser and complete the chart → interpretation → newsletter flow.

## Implementation Notes and Review Findings Fixed in This Iteration

- The inline frontend script contained a syntax-breaking extra brace in the form-validation section; it has been removed.
- The interpretation modal expected a string but the public contract returns an `interpretation` object. The renderer now uses `headline`, `stats`, and `body` correctly.
- The text report download now extracts `interpretation.body` instead of serializing the whole object.
- Wu-Xing values in the contract are normalized floats (`0..1`), while CSS bars need percentages (`0..100`). The frontend now scales normalized values correctly.
- A Railway-ready Node adapter was added so the repository can run as a real web process and satisfy health checks.
- Automated checks were added for inline script syntax, duplicate HTML IDs, server syntax, and fixture-backed endpoint smoke tests.

## Archived Material

`archive/react-src-iteration-1/` is not build-ready and should not be used for the current deployment. It is preserved as a reference for a future React port.

`archive/standalone/` contains historical HTML snapshots.

`uploads/` contains original imported/exported material and duplicated source snapshots. Treat it as reference material only; the active application lives in `public/index.html`.

## Future Production Backend Integration

To connect real services:

1. Keep the same endpoint paths and response envelopes documented in `contracts/public-api.md`.
2. Replace the fixture response logic inside `server.mjs` handlers with FuFirE/Gemini/newsletter service calls.
3. Preserve explicit validation errors and stable `error.code` values.
4. Add service-specific environment variables, for example API keys and provider URLs.
5. Extend `scripts/smoke-test.mjs` or add integration tests against a staging backend.

## License and Ownership

No open-source license is declared in this repository. Treat the code, branding, concept, and assets as proprietary Bazodiac pre-release material unless a license is added later.
