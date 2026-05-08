# DEC-fufire-baseline: Trail

> Companion to `DEC-fufire-baseline.md`.
> AI agents read this only when evaluating whether the decision is still
> valid or when proposing a change or supersession.

## Alternatives considered

### Option A: Wait — defer until upstream commits a deployment timeline

- Pros: Avoids locking the Waitinglist to a specific BAFE revision before the upstream contract is formally frozen for the launch window.
- Cons: The BAFE engine is **already deployed** at `https://bafe-2u0e2a.fly.dev`. Waiting for a "future" engine that already exists adds calendar time without reducing risk. The Phase 2 plan was structured around this assumption and is now invalid.

### Option B: Self-host a separate FuFirE instance for the Waitinglist

- Pros: Full control over uptime and versioning; no shared rate limit with the Signatur-App.
- Cons: The upstream engine **is** reachable. Self-hosting duplicates Swiss Ephemeris setup, BaZi tables, and Wu-Xing modelling — a non-trivial computational stack — for a preview surface that needs at most a few hundred chart computations per day. Cost (compute + maintenance) far exceeds the value of isolated rate limits.

### Option C: Mock with another astrology engine (e.g., AstrologyAPI, Swiss Ephemeris CLI)

- Pros: Avoids depending on an internal upstream that might churn.
- Cons: BAFE is **purpose-built for Bazodiac fusion** — Western + BaZi + Wu-Xing in a single response with the exact element-distribution shape the Waitinglist contract requires. Any other engine would require the adapter to fuse outputs from two or three engines, contradicting [`CON-fufire-chart-endpoint`](../1-spec/constraints/CON-fufire-chart-endpoint.md) and [`REQ-F-fufire-chart-mapping`](../1-spec/requirements/REQ-F-fufire-chart-mapping.md).

### Option D (chosen): Consume the deployed BAFE engine directly

- Pros: Engine already exists, already implements the exact fusion the Waitinglist needs, already runs Swiss Ephemeris, already has an API-key tier (`ff_pro_*`) sized for our traffic. The 2026-05-08 API documentation snapshot gives us enough surface to wire the adapter without a discovery phase. Aligns with the original architectural intent: the Waitinglist is a *preview* of an experience whose backend already lives elsewhere.
- Cons: Inherits BAFE's deployment lifecycle — when BAFE deploys, the Waitinglist sees it. Open question on Fly.io vs Railway URL is unresolved. The exact `/v1/fusion` response shape is not yet verified against the `WuXing` DTO; verification deferred to Phase 3 (`TASK-configure-fufire-live`).

## Reasoning

The original Phase 2 plan was structured around the assumption that no FuFirE engine existed — hence the four "decide vendor" tasks. The 2026-05-08 supply of the BAFE API documentation invalidated that premise: a deployed engine, a documented authentication scheme, and a tier with appropriate rate limits all exist. Aligning the SDLC artefacts with the deployed reality is the smallest correct action; pretending the engine still has to be chosen would generate parallel-universe artefacts that disagree with the codebase.

The chosen option also surfaces, rather than hides, the two genuine unknowns: (1) the Fly.io vs Railway URL ambiguity, and (2) the unverified `/v1/fusion` response shape. Both are tracked in the decision body and tagged for explicit follow-up, which is healthier than burying them inside a vendor-comparison spreadsheet.

Conditions that would invalidate this reasoning: BAFE being deprecated or replaced upstream; a contract change in `/v1/fusion` that breaks the `WuXing` mapping beyond the adapter's ability to absorb; or a stakeholder decision to move the Waitinglist off the shared BAFE instance for isolation reasons.

## Human involvement

**Type**: ai-proposed/human-approved

**Notes**: Proposed by the Phase 2 alignment plan ([`docs/plans/2026-05-08-phase-2-fufire-alignment-design.md`](../docs/plans/2026-05-08-phase-2-fufire-alignment-design.md)) after the 2026-05-08 BAFE API documentation snapshot landed in commit `9613de5`. Approved as the smallest action that re-aligns Phase 2 artefacts with the deployed reality.

## Changelog

| Date | Change | Involvement |
|------|--------|-------------|
| 2026-05-08 | Initial Active status; created from `docs/plans/2026-05-08-phase-2-fufire-alignment-design.md`. | ai-proposed/human-approved |
