# DEC-layered-adapter: Trail

> Companion to `DEC-layered-adapter.md`.
> AI agents read this only when evaluating whether the decision is still
> valid or when proposing a change or supersession.

## Alternatives considered

### Option A: Branch in route handlers
- Pros: Earliest exit point; minimal call depth in stub mode.
- Cons: Duplicates the `stubMode` branch across every route. Routes become aware of business logic. New routes must remember the pattern, which fails open if forgotten.

### Option B: Branch in provider modules
- Pros: Keeps services free of mode awareness; providers handle their own "stubbed" implementation.
- Cons: Providers should be vendor-shaped — a fixture is not vendor-shaped. Couples fixture lifecycle to provider lifecycle. Makes it harder to keep the production path mechanically free of fixture references.

### Option C: Single-layer monolithic handler
- Pros: Simplest possible structure for a 3-route surface.
- Cons: Incompatible with `REQ-F-fufire-chart-mapping`, which wants a clean provider boundary. Loses the natural seam where input validation, business orchestration, and outbound integration separate.

### Option D (chosen): Three-layer adapter, service-layer branch
- Pros: Single grep-checkable location for the stub/live decision. Routes stay thin (read body → call service → send envelope). Providers stay vendor-shaped. Production code path is mechanically free of fixture references because the stub branch returns *before* any provider import is reached.
- Cons: Slightly more layers than minimum; adds a service-per-endpoint convention.

## Reasoning

The decisive factor is mechanical checkability of `REQ-F-no-fixture-fallback-in-prod` / `CON-no-silent-provider-fallback`. A failure mode where production silently returns a fixture (because of a stale fallback path) is hard to detect via tests but is detectable via static `grep` on the codebase only if `stubMode` lives in exactly one layer. Option D enables that. Trade-offs accepted: more files, an extra call in the live path. Conditions that would invalidate this reasoning: if the contract surface grows past ~10 endpoints, the per-endpoint service files become boilerplate-heavy and a generic dispatcher might be preferable.

## Human involvement

**Type**: ai-proposed/human-approved

**Notes**: Proposed by `/SDLC-design` skill from the as-built code (commit `7737da9`). Approved as-is — pattern matches the deployed implementation.

## Changelog

| Date | Change | Involvement |
|------|--------|-------------|
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
