# REQ-REL-explicit-provider-failure: Production provider failures surface as structured errors, never silently

**Type**: Reliability

**Status**: Approved

**Priority**: Must-have

**Source**: [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

In production (`config.stubMode === false`), every provider boundary (FuFirE chart, geocoding, timezone, interpretation, newsletter) surfaces failures as structured `ApiError` instances with stable `error.code` strings (`FUFIRE_UNAVAILABLE`, `INTERPRETATION_UNAVAILABLE`, `CONFIGURATION_ERROR`, etc.) drawn from `src/errors.mjs`. Errors propagate through the service layer to the route handler, which renders `{ ok: false, error: { code, message, field? } }` with appropriate non-2xx HTTP status. No silent or unmarked substitution of fixture / cached / alternative-provider data occurs.

## Acceptance Criteria

- Given live mode and an upstream returning HTTP 5xx, when a request hits the affected endpoint, then the public response is `{ ok: false, error: { code: "FUFIRE_UNAVAILABLE" | "INTERPRETATION_UNAVAILABLE" | … } }` with non-2xx HTTP status.
- Given live mode and an upstream timeout (per `FUFIRE_TIMEOUT_MS` etc.), when the timeout fires, then the response is the appropriate `…_UNAVAILABLE` envelope, not a fixture-backed success.
- Given live mode and a provider returning malformed/non-JSON data, when the adapter parses it, then it raises an `ApiError` with `error.code: FUFIRE_UNAVAILABLE` (or matching) and a message that does not leak the malformed body to the user.
- Given a code review of `src/services/*.mjs` and `src/providers/*.mjs`, when reading the provider boundaries, then no path returns success-shaped responses on upstream failure in live mode.

## Related Constraints

- [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md) — origin of this requirement.

## Related Assumptions

- [ASM-fufire-api-available](../assumptions/ASM-fufire-api-available.md) — outage handling matters most for the highest-risk upstream.
