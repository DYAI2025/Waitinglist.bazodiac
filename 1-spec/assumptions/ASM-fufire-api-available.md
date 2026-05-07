# ASM-fufire-api-available: FuFirE chart engine is available at launch

**Category**: Technology

**Status**: Unverified

**Risk if wrong**: High — if FuFirE is unreachable or has changed its `/chart` schema by launch, production cannot leave stub mode. The entire chart pipeline depends on it; without it, Bazodiac cannot serve real readings. Mitigation: stub mode keeps the preview alive while integration is being completed.

## Statement

The FuFirE / BAFE chart engine will be reachable at the configured `FUFIRE_BASE_URL` with the documented `POST /chart` endpoint, header convention (`X-API-Key`), and request/response schema when production launch occurs.

## Rationale

The FuFirE engine is owned by an internal team (DYAI). Iteration 2 already implemented the adapter mapping per the team's documented schema, and the boundary is verified by `tests/fufire-provider.test.mjs`. The team is the upstream-provider-maintainers stakeholder.

## Verification Plan

1. Coordinated smoke run against the FuFirE staging URL with a valid `FUFIRE_API_KEY`: send the canonical request fixture and confirm the response shape matches `mapFufireResponse()` expectations.
2. Sign-off by [STK-upstream-provider-maintainers](../stakeholders.md) before launch (the team confirms the contract is frozen for the launch window).
3. Production smoke after launch: `PUBLIC_API_BASE_URL=https://<production-url> npm run smoke` returns provider-sourced (non-fixture) data on the chart endpoint.
4. Re-verify if FuFirE versioning or the `/chart` URL changes.

## Related Artifacts

- [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)
- [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md)
- [REQ-REL-explicit-provider-failure](../requirements/REQ-REL-explicit-provider-failure.md)
- [CON-fufire-chart-endpoint](../constraints/CON-fufire-chart-endpoint.md)
