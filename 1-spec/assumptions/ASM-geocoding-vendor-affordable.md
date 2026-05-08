# ASM-geocoding-vendor-affordable: A geocoding + timezone vendor is affordable at expected traffic

**Category**: Business

**Status**: Unverified

**Risk if wrong**: Medium — geocoding + timezone resolution is required for FuFirE chart computation in live mode. Without an affordable vendor, live mode would be too expensive to operate at the expected pre-launch traffic level, blocking the `PUBLIC_API_STUB_MODE=false` switch.

## Statement

A geocoding and timezone vendor (e.g., Mapbox, Google Geocoding + Time Zone API, OpenCage, Photon, LocationIQ) will provide enough free-tier or low-cost requests to cover pre-launch and early-launch traffic at acceptable cost — including any per-request budget that allows for occasional retries and edge-case lookups.

## Rationale

Pre-launch traffic is expected to be modest (hundreds to low thousands of chart computations per month). Multiple vendors offer free tiers that comfortably cover this volume; some bundle geocoding with timezone resolution in a single API.

## Verification Plan

**Trigger:** `TASK-decide-geocoding-vendor` resolves — either to a chosen vendor (e.g., Mapbox / OpenCage / Google) or to a *prospective* `DEC-no-geocoding-vendor` (not yet recorded; would be created if BAFE accepting `lat`/`lon` directly per `DEC-fufire-baseline` makes a vendor unnecessary).
**Method:** If a vendor is chosen, verification happens when its monthly invoice + traffic-projection arithmetic confirms affordability against the project's budget posture. If no vendor is needed, the assumption becomes vacuously true and is closed via `Status: Verified — N/A (vendor not selected)`.
**Owner:** [STK-founder](../stakeholders.md)
**Target date:** Post-Phase-2 vendor-decision resolution.
**Records to update on verification:** Status field (`Unverified` → `Verified`); add a `## Verification Evidence` section with date and evidence link; if applicable, add a `## Resolved by` section linking to the relevant `DEC-*`. **If invalidated instead** (e.g., no affordable vendor found), change Status to `Invalidated` and surface a follow-up artefact.

## Related Artifacts

- [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)
- [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md) — geocoding feeds the FuFirE chart request payload (`tz_id`, `geo_lon_deg`, `geo_lat_deg`)
- [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md)
