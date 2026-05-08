# REQ-F-fufire-chart-mapping: FuFirE provider maps the chart contract to the upstream `/v1/fusion` schema exactly

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [CON-fufire-chart-endpoint](../constraints/CON-fufire-chart-endpoint.md)

**Source stakeholder**: [STK-upstream-provider-maintainers](../stakeholders.md)

## Description

The FuFirE provider (`src/providers/fufireProvider.mjs`) translates between the public chart contract and the upstream FuFirE `/v1/fusion` schema as defined in [`CON-fufire-chart-endpoint`](../constraints/CON-fufire-chart-endpoint.md). The request payload uses the frozen constants (`dst_policy:"error"`, `bodies:null`, `include_validation:false`, `time_standard:"CIVIL"`, `day_boundary:"midnight"`); the response mapping covers Sun/Moon positions, Ascendant degree → localized sign, BaZi year animal, day master, dominant element (with German element keys mapped to English), coherence index, and the five Wu-Xing values normalized to `[0, 1]`.

## Acceptance Criteria

- Given a chart request with known birth time, when the FuFirE provider is called, then the outgoing request URL is `${FUFIRE_BASE_URL}/v1/fusion`, the method is POST, the header `X-API-Key` carries `FUFIRE_API_KEY`, and the body contains the seven payload constants verbatim.
- Given a chart request with `birthTime: null`, when the FuFirE provider is called, then `local_datetime` is `${birthDate}T12:00:00` and the resulting `chart.ascendant` is `null` (provisional).
- Given a FuFirE response with `wuxing.from_planets` keyed in German (`Holz`, `Feuer`, `Erde`, `Metall`, `Wasser`), when the response is mapped, then the public chart returns `wood`, `fire`, `earth`, `metal`, `water` in numeric `[0, 1]` form.
- Given a non-2xx FuFirE response, when the provider is called, then the adapter throws an `ApiError` with `code: FUFIRE_UNAVAILABLE`.

## Related Constraints

- [CON-fufire-chart-endpoint](../constraints/CON-fufire-chart-endpoint.md) — the upstream contract this requirement locks.

## Related Assumptions

- [ASM-fufire-api-available](../assumptions/ASM-fufire-api-available.md) — the requirement only delivers value if FuFirE is actually reachable in production.
- [ASM-geocoding-vendor-affordable](../assumptions/ASM-geocoding-vendor-affordable.md) — geocoding feeds the FuFirE request payload (`tz_id`, `geo_lon_deg`, `geo_lat_deg`).
