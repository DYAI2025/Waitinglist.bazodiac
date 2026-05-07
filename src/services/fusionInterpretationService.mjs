import { validateFusionInterpretationRequest } from '../validation.mjs';
import { generateInterpretation } from '../providers/interpretationProvider.mjs';
import { loadFixture, FIXTURE_NAMES } from '../fixtures.mjs';

export async function generateFusionInterpretation(rawBody, { config }) {
  const input = validateFusionInterpretationRequest(rawBody);

  if (config.stubMode) {
    const fixture = await loadFixture(FIXTURE_NAMES.fusionInterpretationSuccess);
    fixture.interpretation.chartSessionId = input.chartSessionId;
    fixture.interpretation.language = input.language;
    return fixture;
  }

  const interpretation = await generateInterpretation({
    language: input.language,
    chartSessionId: input.chartSessionId,
    chart: input.chart,
    config,
  });
  return { ok: true, interpretation };
}
