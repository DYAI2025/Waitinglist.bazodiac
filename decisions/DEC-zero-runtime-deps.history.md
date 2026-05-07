# DEC-zero-runtime-deps: Trail

> Companion to `DEC-zero-runtime-deps.md`.
> AI agents read this only when evaluating whether the decision is still
> valid or when proposing a change or supersession.

## Alternatives considered

### Option A: Express + body-parser + cors
- Pros: Familiar to most JS engineers; rich middleware ecosystem; abundant examples for new contributors.
- Cons: 30+ transitive packages for 3 routes. Supply chain surface grows for marginal ergonomic gain. CORS handling is already trivial (one helper in `src/http.mjs`). Body parsing is ~20 lines of `node:http` reading the JSON.

### Option B: Fastify
- Pros: Fast, schema-first, strong validation story.
- Cons: Schema validation is overkill — input shapes are tiny and validated by hand in `src/validation.mjs`. Adds vendor lock-in (Fastify-specific lifecycle hooks) for negligible benefit at 3 endpoints.

### Option C: Hono / minimal framework
- Pros: Smaller dependency footprint than Express; modern routing API.
- Cons: Still adds an external dependency for a contract surface that fits comfortably in a 30-line route table. The minimal frameworks all carry their own runtime quirks (e.g., context object shape) that future migrations would have to unpick.

### Option D (chosen): Node built-ins only
- Pros: Zero supply-chain surface, zero install time, zero version conflicts, zero CVE-tracking burden for runtime deps. Railway / Nixpacks build is trivially fast and reproducible. Code is portable to any Node 20+ runtime without lockfile concerns.
- Cons: Hand-rolled JSON parsing, CORS, and routing — but those are ~150 lines total in `src/http.mjs` + `src/app.mjs` + `src/routes/publicApi.mjs` and are well-tested.

## Reasoning

A 3-route contract surface plus same-origin static delivery is too small to justify a framework. The failure modes a framework prevents (parsing edge cases, route conflicts) are non-existent at this scale. The failure modes a framework introduces (transitive CVEs, unexpected middleware order, framework-version migrations) are real and recurring. Trade-off accepted: contributors must read ~150 lines of plain Node HTTP code instead of skimming Express docs. Conditions that would invalidate this reasoning: contract surface growing beyond ~10 endpoints, or arrival of routing complexity (path parameters, regex matching, auth middleware) that the hand-rolled `findRoute` table cannot absorb.

## Human involvement

**Type**: ai-proposed/human-approved

**Notes**: Proposed by `/SDLC-design` skill from the as-built code (commit `7737da9`). Approved — matches the explicit Iteration-2 decision visible in `.env.example` and `package.json` (no production deps).

## Changelog

| Date | Change | Involvement |
|------|--------|-------------|
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
