// Interpretation provider boundary (Gemini or proxy).
//
// Generic boundary: the upstream Gemini/proxy schema is not finalized. Stub
// mode returns null and the service layer falls back to the fixture-backed
// canonical response.
import { configurationError, interpretationUnavailable } from '../errors.mjs';

export async function generateInterpretation({ language, chartSessionId, chart, config, fetchImpl = fetch }) {
  if (config.stubMode) return null;
  if (!config.interpretation.url) throw configurationError('INTERPRETATION_API_URL is not set.');
  if (!config.interpretation.apiKey) throw configurationError('GEMINI_API_KEY is not set.');

  let response;
  try {
    response = await fetchImpl(config.interpretation.url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.interpretation.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ language, chartSessionId, chart }),
    });
  } catch (err) {
    throw interpretationUnavailable(`Interpretation request failed: ${err.message}`);
  }
  if (!response.ok) {
    throw interpretationUnavailable(`Interpretation HTTP ${response.status}.`);
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw interpretationUnavailable('Interpretation returned a non-JSON response.');
  }
  if (!body?.interpretation?.body || !body?.interpretation?.headline) {
    throw interpretationUnavailable('Interpretation payload is missing required fields.');
  }
  // Normalize to the public contract shape.
  return {
    id: body.interpretation.id || `int_${chartSessionId}_${language}`,
    chartSessionId,
    language,
    headline: body.interpretation.headline,
    body: body.interpretation.body,
    stats: Array.isArray(body.interpretation.stats) ? body.interpretation.stats : [],
    downloads: body.interpretation.downloads || { txt: null, pdf: null },
    generatedAt: body.interpretation.generatedAt || new Date().toISOString(),
  };
}
