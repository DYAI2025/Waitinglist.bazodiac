# REQ-F-no-fixture-fallback-in-prod: Service layer must not return fixture data when `stubMode === false`

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [CON-no-synthesized-data-in-prod](../constraints/CON-no-synthesized-data-in-prod.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

The service layer (`src/services/*.mjs`) is forbidden from returning fixture data, deterministic placeholder content, or synthesized output when `config.stubMode === false`. The fixture-fallback path (`loadFixture(...)`) may execute only inside a branch guarded by `if (config.stubMode) { ... }`. When a provider call fails in live mode, the service layer must propagate the structured `ApiError` rather than substituting a fixture-backed envelope.

## Acceptance Criteria

- Given `config.stubMode === false`, when a provider boundary throws (HTTP non-2xx, timeout, malformed response), when the service layer handles it, then it re-throws the `ApiError` and does not call `loadFixture()`.
- Given `config.stubMode === false`, when source-code is reviewed, then no service-layer function returns fixture data outside a `stubMode === true` branch.
- Given `config.stubMode === true`, when a service is called, then fixture data may be returned (this is the configured behavior).
- Given a future cache layer is introduced, when serving a cached response in live mode, then the response carries an explicit cache-hit indicator (per [`CON-no-silent-provider-fallback`](../constraints/CON-no-silent-provider-fallback.md)).

## Related Constraints

- [CON-no-synthesized-data-in-prod](../constraints/CON-no-synthesized-data-in-prod.md) — origin of this prohibition.
- [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md) — complementary failure-path policy.
