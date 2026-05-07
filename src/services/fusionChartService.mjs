import { randomBytes } from 'node:crypto';
import { validateFusionChartRequest } from '../validation.mjs';
import { resolveLocation } from '../providers/geocodingProvider.mjs';
import { callFufire, buildLocalDatetime } from '../providers/fufireProvider.mjs';
import { loadFixture, FIXTURE_NAMES } from '../fixtures.mjs';

function newSessionId() {
  return `fc_${randomBytes(3).toString('hex')}`;
}

export async function computeFusionChart(rawBody, { config }) {
  const input = validateFusionChartRequest(rawBody);
  const { provisional } = buildLocalDatetime(input.birthDate, input.birthTime);

  if (config.stubMode) {
    const fixture = await loadFixture(FIXTURE_NAMES.fusionChartSuccess);
    // Stub keeps the fixture's canonical signature stable so the smoke test
    // and the frontend can rely on it. When birth time is unknown, blank
    // the ascendant — the frontend renders the provisional explanation.
    if (provisional) fixture.chart.ascendant = null;
    return fixture;
  }

  const location = await resolveLocation({
    birthPlace: input.birthPlace,
    providedTimezone: input.timezone,
    config,
  });

  const chart = await callFufire(
    {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      timezone: location.timezone,
      geo_lat_deg: location.geo_lat_deg,
      geo_lon_deg: location.geo_lon_deg,
      language: input.language,
    },
    { config },
  );

  return {
    ok: true,
    chartSessionId: newSessionId(),
    chart,
  };
}
