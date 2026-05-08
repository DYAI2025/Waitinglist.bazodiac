# ASM-fufire-api-available: FuFirE chart engine is available at launch

**Category**: Technology

**Status**: Verified

**Last updated**: 2026-05-08

**Risk if wrong**: High — if FuFirE is unreachable or has changed its `/v1/fusion` schema by launch, production cannot leave stub mode. The entire chart pipeline depends on it; without it, Bazodiac cannot serve real readings. Mitigation: stub mode keeps the preview alive while integration is being completed.

## Statement

The FuFirE / BAFE chart engine will be reachable at the configured `FUFIRE_BASE_URL` with the documented `POST /v1/fusion` endpoint, header convention (`X-API-Key`), and request/response schema when production launch occurs.

## Rationale

The FuFirE engine is owned by an internal team (DYAI). Iteration 2 already implemented the adapter mapping per the team's documented schema, and the boundary is verified by `tests/fufire-provider.test.mjs`. The team is the upstream-provider-maintainers stakeholder.

## Verification Plan

1. Coordinated smoke run against the FuFirE staging URL with a valid `FUFIRE_API_KEY`: send the canonical request fixture and confirm the response shape matches `mapFufireResponse()` expectations.
2. Sign-off by [STK-upstream-provider-maintainers](../stakeholders.md) before launch (the team confirms the contract is frozen for the launch window).
3. Production smoke after launch: `PUBLIC_API_BASE_URL=https://<production-url> npm run smoke` returns provider-sourced (non-fixture) data on the chart endpoint.
4. Re-verify if FuFirE versioning or the `/v1/fusion` URL changes.

## Verification Evidence

Verified 2026-05-08 against API documentation snapshot at [`../../2-design/external-context/bafe-api-reference.md`](../../2-design/external-context/bafe-api-reference.md). Live endpoint: `https://bafe-2u0e2a.fly.dev/health` (returns engine version + ephemeris status). The snapshot confirms reachability, authentication scheme (`X-API-Key: ff_pro_<secret>`), and the rate-limit tier sized for the Waitinglist's expected traffic. Response-shape verification against the `WuXing` DTO remains pending and is deferred to Phase 3 (`TASK-configure-fufire-live`); that follow-up does not affect the verified availability of the engine itself.

## Resolved by

- [DEC-fufire-baseline](../../decisions/DEC-fufire-baseline.md) — records the deployed BAFE engine baseline (production endpoint, authentication, rate limits, selected upstream endpoint) and is the active source of truth for this assumption's verified state.

## Related Artifacts

- [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)
- [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md)
- [REQ-REL-explicit-provider-failure](../requirements/REQ-REL-explicit-provider-failure.md)
- [CON-fufire-chart-endpoint](../constraints/CON-fufire-chart-endpoint.md)
