# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pre-launch landing page + waitlist for **Bazodiac**, a "Cosmic Signature" product fusing Western astrology, Chinese BaZi, and Wu-Xing element modelling. Two artifacts matter:

- `public/index.html` — the entire frontend in one ~100 KB file (HTML/CSS/JS, inline `<script>`, embedded DE/EN i18n, motion profiles, API client, modal/newsletter flow). All UI changes happen here.
- `server.mjs` — a Railway-ready Node adapter. It serves `public/`, exposes `/healthz`, and implements the three public POST endpoints with **deterministic responses sourced from `contracts/fixtures/*.json`**. It is the placeholder for the real FuFirE/Gemini backend.

The contract in `contracts/public-api.md` is the source of truth for endpoint shapes; `contracts/fixtures/` holds the canonical request/response JSON used by both the adapter and the smoke test.

## Commands

Run from the repo root:

```bash
npm install          # no runtime deps; useful only to materialise package-lock.json
npm start            # node server.mjs → http://localhost:3000
npm run check        # static checks: inline-script syntax, duplicate HTML ids, server.mjs syntax
npm run smoke        # spawns server on 127.0.0.1:4173, posts every fixture, asserts CONSENT_REQUIRED + MALFORMED_JSON + CORS preflight
```

Override port: `PORT=8080 npm start`. Health: `curl http://localhost:3000/healthz` → `{"ok":true,"service":"bazodiac-fusion-preview"}`.

There is **no test framework, no bundler, no build step**. `npm run check` and `npm run smoke` are the entire CI surface.

## Architecture invariants

These are load-bearing. Don't break them.

- **Zero runtime npm dependencies.** `server.mjs` uses only `node:http`, `node:fs`, `node:path`, `node:url`. Adding a runtime dep means changing the deployment story (Nixpacks, no lockfile-locked installs in prod). Don't pull in Express, Fastify, etc. — the contract surface is too small to justify it.
- **Stable response envelope.** Every API response is either `{ok: true, …}` or `{ok: false, error: {code, message, field?}}`. `error.code` is a stable ALL_CAPS machine string (`VALIDATION_ERROR`, `CONSENT_REQUIRED`, `INVALID_EMAIL`, `MALFORMED_JSON`, `UNSUPPORTED_MEDIA_TYPE`, `FUFIRE_UNAVAILABLE`, `INTERPRETATION_UNAVAILABLE`, `CONFIGURATION_ERROR`, `RATE_LIMITED`, `METHOD_NOT_ALLOWED`). The frontend renders `code` verbatim — never localize it server-side.
- **No silent client-side fallbacks.** The frontend does not synthesize chart/interpretation data on failure. If you remove the fixture-backed adapter, do not replace it with a frontend mock — show the error UI. This is an explicit decision recorded in `contracts/public-api.md`.
- **Wu-Xing units.** The contract returns five floats in `[0..1]` summing to ~1.0 (`wood`, `fire`, `earth`, `metal`, `water`). The UI scales these to `0..100` for the bars. `server.mjs:scaleWuXing` is intentionally a passthrough — keep canonical floats on the wire, scale only in the renderer.
- **`birthTime: null` is valid input**, not an error. It maps to "I don't know my birth time". Validators in `server.mjs:handleFusionChart` enforce this — don't tighten them.
- **Adapter is replaceable, contract is not.** When the real FuFirE services arrive, swap the fixture lookups inside the three handlers in `server.mjs`. Do not change endpoint paths, the envelope shape, or `error.code` strings — the frontend depends on them and so does `SMOKE_CHECKLIST.md`.
- **Out of scope (must NOT exist).** No `/api/public/waitlist-signup`, no queue position, no referral codes. These were intentionally removed. See "Out of scope for Iteration 2" in `contracts/public-api.md`.

## Conventions

- **`archive/` and `uploads/` are reference-only and not build-ready.** `archive/react-src-iteration-1` will not run; `archive/standalone` and `uploads/` are historical exports. Don't import from them, don't edit them as if they were sources.
- **Active source of truth:** `public/index.html` (frontend), `server.mjs` (backend), `contracts/*.md` (spec), `contracts/fixtures/*.json` (canonical examples). Anything else is reference.
- **CORS** defaults to `*` (`process.env.CORS_ORIGIN || '*'`). When pinning to a real frontend domain, set `CORS_ORIGIN` rather than editing `server.mjs`.
- **Static caching** in `server.mjs:serveStatic`: `index.html` is `no-cache`; everything else is `public, max-age=31536000, immutable`. SPA fallback streams `index.html` for any non-`/api/` GET miss — don't add new server routes that overlap that fallback without an explicit `if` guard.
- **Manual contract test:** `contracts/SMOKE_CHECKLIST.md` is the formal Backend-Iteration-2 sign-off. When changing endpoint behaviour, walk it before claiming done.

## Deployment

Railway/Nixpacks via `railway.json` (start: `npm start`, healthcheck: `/healthz`, retry on failure). Railway injects `PORT`; the server also reads `HOST` (default `0.0.0.0`) and `CORS_ORIGIN`. No mandatory env vars for the current fixture-backed deployment. Remote: `DYAI2025/Waitinglist.bazodiac` (branch `main`).
