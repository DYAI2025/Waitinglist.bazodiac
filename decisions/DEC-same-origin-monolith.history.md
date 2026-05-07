# DEC-same-origin-monolith: Trail

> Companion to `DEC-same-origin-monolith.md`.
> AI agents read this only when evaluating whether the decision is still
> valid or when proposing a change or supersession.

## Alternatives considered

### Option A: Static (Vercel/Netlify) + separate API service
- Pros: CDN edge caching for the static frontend; clear separation of concerns; independent deploy cycles.
- Cons: Two CI paths, two release coordination problems, CORS narrowing required, env-var management duplicated, an extra hostname to operate. All for a 100 KB single HTML file and 3 endpoints — overkill for the current traffic profile.

### Option B: Edge functions per endpoint (Vercel Functions, Cloudflare Workers)
- Pros: No long-running process to operate; auto-scales.
- Cons: Vendor lock-in for a contract surface that fits comfortably in plain Node. Edge runtimes restrict Node built-ins (no `node:fs` for fixture loading without bundling). Cold-start latency for FuFirE calls is acceptable on a single Node process and would be a regression on edge.

### Option C: Same-origin nginx + Node API
- Pros: Decouples static delivery (nginx) from API (Node); common pattern.
- Cons: Doubles the infrastructure for no additional capability — Node serves static files via `node:fs` perfectly well at this scale. Adds a configuration surface (nginx config, reload procedure) for negligible benefit.

### Option D (chosen): Single Node process, static + API
- Pros: Single deploy artifact, single env-var set, single healthcheck, no CORS narrowing required (same-origin by construction). Fits Railway / Nixpacks deployment story without customization. Frontend's `API_BASE_URL=""` default lets the same `apiClient` work locally and in production unchanged.
- Cons: The Node process is the bottleneck for both static delivery and API throughput. Acceptable at preview-iteration traffic (waitlist signup volumes); revisit if the frontend grows materially in size or the API takes off.

## Reasoning

The constraint `CON-same-origin-node-deployment` is marked Active and explicitly chooses this topology for the preview iteration. The constraint exists because adding deployment topology now (when the contract is fluid) would amplify churn. Once the real-provider integration ships and the frontend stabilizes, splitting becomes a candidate refactor — at which point this decision should be superseded with explicit migration steps. Trade-off accepted: forgoing CDN edge caching and the operational ergonomics of separate frontend/backend deploys. Conditions that would invalidate this reasoning: traffic outgrows a single Node process, frontend assets grow beyond what `node:fs` can serve efficiently, or operational pressure makes independent deploy cycles necessary.

## Human involvement

**Type**: ai-proposed/human-approved

**Notes**: Proposed by `/SDLC-design` skill from the as-built code (commit `7737da9`) and the explicit `CON-same-origin-node-deployment` constraint. Approved.

## Changelog

| Date | Change | Involvement |
|------|--------|-------------|
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
