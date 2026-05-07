# ASM-geocoding-vendor-affordable: A geocoding + timezone vendor is affordable at expected traffic

**Category**: Business

**Status**: Unverified

**Risk if wrong**: Medium — geocoding + timezone resolution is required for FuFirE chart computation in live mode. Without an affordable vendor, live mode would be too expensive to operate at the expected pre-launch traffic level, blocking the `PUBLIC_API_STUB_MODE=false` switch.

## Statement

A geocoding and timezone vendor (e.g., Mapbox, Google Geocoding + Time Zone API, OpenCage, Photon, LocationIQ) will provide enough free-tier or low-cost requests to cover pre-launch and early-launch traffic at acceptable cost — including any per-request budget that allows for occasional retries and edge-case lookups.

## Rationale

Pre-launch traffic is expected to be modest (hundreds to low thousands of chart computations per month). Multiple vendors offer free tiers that comfortably cover this volume; some bundle geocoding with timezone resolution in a single API.

## Verification Plan

1. Traffic projection from pre-launch outreach: number of expected unique visitors × percentage that submit birth data → expected geocoding + timezone request volume per month.
2. Vendor short-list with quota and per-request cost (free-tier ceiling, paid-tier overage cost).
3. Pricing review against pre-launch budget; selection.
4. Optional: design (and record as a decision) an explicit geocoding cache for `birthPlace → coordinates` lookups, since `birthPlace` strings repeat across users (per [`CON-no-silent-provider-fallback`](../constraints/CON-no-silent-provider-fallback.md), any cache must be explicit and marked).
5. Runtime: integration smoke against `GEOCODING_API_URL` + `TIMEZONE_API_URL` with valid keys.

## Related Artifacts

- [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)
- [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md) — geocoding feeds the FuFirE chart request payload (`tz_id`, `geo_lon_deg`, `geo_lat_deg`)
- [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md)
