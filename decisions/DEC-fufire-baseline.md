# DEC-fufire-baseline: Consume the deployed BAFE engine as the FuFirE provider

**Status**: Active

**Category**: Architecture

**Scope**: backend (`src/providers/fufireProvider.mjs` + production env-vars)

**Source**: [REQ-F-fufire-chart-mapping](../1-spec/requirements/REQ-F-fufire-chart-mapping.md), [CON-fufire-chart-endpoint](../1-spec/constraints/CON-fufire-chart-endpoint.md), [ASM-fufire-api-available](../1-spec/assumptions/ASM-fufire-api-available.md)

**Supersedes**: n/a

**Last updated**: 2026-05-08

## Context

Phase 2 of the original implementation plan was structured around a build/buy choice for a FuFirE chart engine that did not yet exist. On 2026-05-08, the upstream BAFE (Bazodiac Astro Fusion Engine) team supplied an API documentation snapshot revealing that the engine is already deployed, accessible, and purpose-built for Bazodiac fusion (Western astrology + BaZi + Wu-Xing). The snapshot is captured verbatim in [`../2-design/external-context/bafe-api-reference.md`](../2-design/external-context/bafe-api-reference.md). Without recording this baseline, downstream artefacts (constraints, assumptions, tasks) continue to assume a non-existent engine and the Phase 2 plan keeps pointing to vendor-selection work that no longer applies.

## Decision

The Waitinglist project consumes the **existing deployed BAFE engine**. There is no new deployment, no fork, no replacement engine to evaluate.

### Production endpoint

- **Production:** `https://bafe-2u0e2a.fly.dev` (Fly.io)
- **Fallback:** `https://bafe-production.up.railway.app` (Railway, used by the Signatur-App). Flagged as an open architecture question — see Open question below.

### Authentication

API key, header `X-API-Key: ff_pro_<secret>`. The `ff_pro_*` tier allows:

- 10,000 requests/day, 100 requests/minute globally.
- 30 requests/minute specifically on `/v1/fusion`, `/v1/experience/bootstrap`, `/v1/experience/daily`.
- 60 requests/minute on `/v1/experience/signature-delta`.

### Upstream endpoint for `/api/public/fusion-chart`

Selected: `POST /v1/fusion`.

Rationale: The Waitinglist preview only needs the Wu-Xing chart (six tiles + element distribution), not the full soulprint or signature-blueprint payload. `/v1/fusion` is the narrowest BAFE endpoint that returns the necessary chart shape; `/v1/experience/bootstrap` returns more data than the contract surface exposes.

### CORS

Strict whitelist. **No wildcard.** The BAFE engine must include `bazodiac.space` and `www.bazodiac.space` in `CORS_ALLOWED_ORIGINS` for browser-originating calls; the same-origin Node adapter (per [`DEC-same-origin-monolith`](DEC-same-origin-monolith.md)) calls BAFE server-to-server, so the adapter does not itself rely on CORS, but the constraint is recorded here because it governs any future direct-from-frontend BAFE calls.

### Standard response headers

The adapter must propagate or honour the following headers on every BAFE response:

- `X-Request-ID` — for correlation in upstream logs.
- `X-API-Version` — to detect contract drift.
- `X-Response-Time-ms` — for latency observability.
- `X-RateLimit-Limit`, `X-RateLimit-Remaining` — to anticipate throttling before it surfaces as `FUFIRE_UNAVAILABLE`.

### Known gap

The exact response shape of `POST /v1/fusion` has **not** been fully reconstructed from the snapshot. The mapping `fufireResponse → WuXing` DTO recorded in [`CON-fufire-chart-endpoint`](../1-spec/constraints/CON-fufire-chart-endpoint.md) is treated as provisional until a live response is captured. Verification against the `WuXing` DTO is **deferred to Phase 3** (`TASK-configure-fufire-live`).

### Open question

Fly.io vs Railway production URL ambiguity. The snapshot lists Fly.io as primary and Railway as fallback used by the Signatur-App; it is not yet confirmed whether the Waitinglist should target Fly.io directly, Railway directly, or one with the other as automatic fallback. Resolution requires confirmation from `STK-upstream-provider-maintainers`. Tracked here but **not** resolved by this decision.

## Enforcement

### Trigger conditions

- **Specification phase**: when reviewing [`CON-fufire-chart-endpoint`](../1-spec/constraints/CON-fufire-chart-endpoint.md) for re-approval; when assessing whether [`ASM-fufire-api-available`](../1-spec/assumptions/ASM-fufire-api-available.md) needs re-verification.
- **Design phase**: when modifying the upstream-FuFirE schema mapping in [`../2-design/data-model.md`](../2-design/data-model.md) or [`../2-design/api-design.md`](../2-design/api-design.md), or when introducing a new BAFE endpoint to the architecture.
- **Code phase**: when setting `FUFIRE_BASE_URL` / `FUFIRE_API_KEY` env vars; when modifying `src/providers/fufireProvider.mjs` or `mapFufireResponse`.
- **Deploy phase**: when configuring production environment variables for the adapter.

### Required patterns

- `FUFIRE_BASE_URL` is set to `https://bafe-2u0e2a.fly.dev` in production until the Fly.io vs Railway open question is resolved.
- `FUFIRE_API_KEY` is a key with `ff_pro_` prefix; lower tiers must not be used in production.
- The adapter's outbound call uses `POST {FUFIRE_BASE_URL}/v1/fusion` with header `X-API-Key: {FUFIRE_API_KEY}` and `Content-Type: application/json`.
- Any new BAFE endpoint introduced to the adapter must first be reviewed against the snapshot in [`../2-design/external-context/bafe-api-reference.md`](../2-design/external-context/bafe-api-reference.md) and, if missing or contradicted, against the live `/health` endpoint of the engine.

### Required checks

1. `FUFIRE_BASE_URL` resolves to the documented production host (`bafe-2u0e2a.fly.dev`) or, where explicitly approved, the Railway fallback.
2. `FUFIRE_API_KEY` value starts with `ff_pro_`.
3. The adapter logs surface BAFE's `X-Request-ID` for every request so failures can be correlated upstream.

### Prohibited patterns

- Calling any BAFE endpoint without the `X-API-Key` header.
- Using a wildcard CORS configuration on the BAFE side (this is a constraint on BAFE configuration, not on the adapter, but is recorded here so it cannot be silently relaxed).
- Treating the snapshot in `2-design/external-context/bafe-api-reference.md` as authoritative when the live `/health` endpoint disagrees — the engine wins per the snapshot's frontmatter convention.

## Related artefacts

- Verification artefact: [`../2-design/external-context/bafe-api-reference.md`](../2-design/external-context/bafe-api-reference.md) — captured 2026-05-08 from the BAFE Cowork-Analyse export.
- Resolved assumption: [`../1-spec/assumptions/ASM-fufire-api-available.md`](../1-spec/assumptions/ASM-fufire-api-available.md).
- Endpoint contract: [`../1-spec/constraints/CON-fufire-chart-endpoint.md`](../1-spec/constraints/CON-fufire-chart-endpoint.md) (downgraded to Draft 2026-05-08 pending re-approval against the corrected `/v1/fusion` path).
