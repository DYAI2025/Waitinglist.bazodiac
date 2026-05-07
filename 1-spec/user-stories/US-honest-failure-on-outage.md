# US-honest-failure-on-outage: Surface upstream provider failures as structured errors in production

**As a** privacy / compliance accountability owner, **I want** production provider failures to surface as `{ok: false, error: {code, ...}}` rather than silently substituting fixtures or unmarked cached data, **so that** outages are visible to users and operators and I can audit that no fabricated data ever reached production users.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

**Related goal**: [GOAL-honest-reflection-framing](../goals/GOAL-honest-reflection-framing.md)

## Acceptance Criteria

- Given the system is running in production (`PUBLIC_API_STUB_MODE=false`), when an upstream provider returns a non-2xx response, then the public endpoint returns `{ok: false, error: {code, message, field?}}` with the matching stable code, and the HTTP status is non-2xx.
- Given production mode, when a provider call times out (per the timeout configured in `src/config.mjs`), then the response is the appropriate `…_UNAVAILABLE` envelope, not a fixture-backed success.
- Given production logs, when an outage occurs, then the failed `error.code` is logged for on-call correlation; no PII (birth data, email) is logged with the failure.
- Given an audit of production deployment configuration, when checking the env vars, then `PUBLIC_API_STUB_MODE` is verifiably `false` (per [`CON-stub-mode-dev-only`](../constraints/CON-stub-mode-dev-only.md)).
- Given a future cache layer is introduced, when a cached response is served, then the response carries an explicit cache-hit indicator and the cache existence is documented in a recorded decision (per [`CON-no-silent-provider-fallback`](../constraints/CON-no-silent-provider-fallback.md)).

## Derived Requirements

- [REQ-REL-explicit-provider-failure](../requirements/REQ-REL-explicit-provider-failure.md)
- [REQ-F-no-fixture-fallback-in-prod](../requirements/REQ-F-no-fixture-fallback-in-prod.md)
- [REQ-SEC-no-pii-in-logs](../requirements/REQ-SEC-no-pii-in-logs.md)
- [REQ-COMP-stub-mode-prod-disabled](../requirements/REQ-COMP-stub-mode-prod-disabled.md)
