# CON-no-silent-provider-fallback: No silent or unmarked fallback for upstream provider failures in production

**Category**: Technical

**Status**: Active

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

When an upstream provider (chart engine, geocoding, timezone, interpretation, newsletter) fails or is unavailable in production, the adapter must surface the failure to the frontend via a stable error envelope — never silently substitute fixture data, unmarked cached data, or another provider's output without an explicit user-visible signal.

**Stub mode is the only allowed deterministic fixture path and must be explicitly enabled (`PUBLIC_API_STUB_MODE=true`). Production must fail closed with a structured error.**

This constraint does **not** absolutely forbid future caching: an explicitly-designed cache layer — with a clear cache-hit indicator on the response, a documented TTL, and a contractual agreement with the affected provider team — may be introduced later as a new design decision. What is forbidden is *silent* or *unmarked* substitution: anything that would let a user receive cached, stub, or fabricated content while believing they received a fresh provider response.

Co-driver: [STK-upstream-provider-maintainers](../stakeholders.md), responsible for the contract semantics on the other side of each boundary.

## Rationale

A silent fallback would:

- Hide outages from users and operators (no error counter, no incident-response trigger).
- Degrade trust if users notice that their "personalized" reading is identical to someone else's.
- Mask provider-side regressions, since the adapter would not surface a non-2xx state for them to investigate.

## Impact

- Service code (`src/services/*.mjs`) distinguishes `config.stubMode === true` (where fixture fallback is the configured behavior, not a fallback) from production (where fallback is forbidden and provider errors must propagate).
- All provider boundaries throw structured `ApiError` instances (`src/errors.mjs`); the route handler renders these as `{ ok: false, error: { code, message, field? } }` with appropriate non-2xx HTTP status, and the frontend renders `error.code` verbatim.
- Implies the requirement [REQ-REL-explicit-provider-failure](../requirements/REQ-REL-explicit-provider-failure.md): every provider boundary must surface failures explicitly in production.
- Future cache introduction requires a new decision (`DEC-…`), an explicit cache-hit signal in the response, and an update to this constraint's Description.
