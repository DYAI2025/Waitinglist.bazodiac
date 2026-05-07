import { readJson, sendJson } from '../http.mjs';
import { computeFusionChart } from '../services/fusionChartService.mjs';
import { generateFusionInterpretation } from '../services/fusionInterpretationService.mjs';
import { subscribeToNewsletter } from '../services/newsletterService.mjs';
import { loadFixture, FIXTURE_NAMES } from '../fixtures.mjs';

export const PUBLIC_API_ROUTES = [
  {
    method: 'POST',
    path: '/api/public/fusion-chart',
    handle: async (req, res, { config }) => {
      const body = await readJson(req);
      const result = await computeFusionChart(body, { config });
      sendJson(res, 200, result, { cors: config.corsOrigin });
    },
  },
  {
    method: 'POST',
    path: '/api/public/fusion-interpretation',
    handle: async (req, res, { config }) => {
      const body = await readJson(req);
      const result = await generateFusionInterpretation(body, { config });
      sendJson(res, 200, result, { cors: config.corsOrigin });
    },
  },
  {
    method: 'POST',
    path: '/api/public/newsletter-signup',
    handle: async (req, res, { config }) => {
      const body = await readJson(req);
      const result = await subscribeToNewsletter(body, { config });
      sendJson(res, 200, result, { cors: config.corsOrigin });
    },
  },
];

export async function getInterpretationDownloadBody() {
  const fixture = await loadFixture(FIXTURE_NAMES.fusionInterpretationSuccess);
  return fixture.interpretation.body;
}
