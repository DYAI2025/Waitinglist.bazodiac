# CON-fufire-chart-endpoint: FuFirE engine is reached at `POST {FUFIRE_BASE_URL}/chart` exactly

**Category**: Technical

**Status**: Active

**Source stakeholder**: [STK-upstream-provider-maintainers](../stakeholders.md)

## Description

The FuFirE chart engine is reached at exactly **`POST {FUFIRE_BASE_URL}/chart`** with header `X-API-Key: ${FUFIRE_API_KEY}` and `Content-Type: application/json`.

The frozen request payload schema:

- `local_datetime` — ISO `YYYY-MM-DDTHH:MM:SS` (with `T12:00:00` fallback when `birthTime` is null, marking the result provisional)
- `tz_id` — IANA timezone string from the geocoder
- `geo_lon_deg`, `geo_lat_deg` — resolved coordinates
- `dst_policy: "error"`
- `bodies: null`
- `include_validation: false`
- `time_standard: "CIVIL"`
- `day_boundary: "midnight"`

The frozen response mapping consumed by the adapter:

- `positions.Sun.sign` → `chart.sunSign`
- `positions.Moon.sign` → `chart.moonSign`
- `angles.Ascendant.degree` → localized ascendant sign (only when birth time is known)
- `bazi.pillars.year.animal` → `chart.baziYearAnimal`
- `bazi.day_master` → `chart.baziDaymaster`
- `wuxing.dominant_planet ?? wuxing.dominant_bazi` → `chart.dominantElement`
- `wuxing.harmony_index` → `chart.coherenceIndex`
- `wuxing.from_planets.{Holz,Feuer,Erde,Metall,Wasser}` → `chart.wuXing.{wood,fire,earth,metal,water}` (English keys also accepted)

## Rationale

This is the boundary contract jointly owned with the FuFirE/BAFE team. Any deviation by the adapter changes the wire shape, which would either break the upstream service or require server-side aliasing on FuFirE — both of which are coordination costs that should not be taken on lightly.

## Impact

- `src/providers/fufireProvider.mjs` is the single integration point with FuFirE. No other module may construct or send `/chart` requests.
- Changing the URL path, header name, payload constants, or response field mapping requires a coordinated change with the FuFirE team and a migration plan (versioned endpoint, parallel rollout).
- The mapping is enforced by `tests/fufire-provider.test.mjs` — payload constants, response shape, German/English wuXing keys, provisional ascendant blanking, and HTTP-error → `FUFIRE_UNAVAILABLE` mapping are all verified.
- Implies the requirement [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md): a formal lock of this mapping.
