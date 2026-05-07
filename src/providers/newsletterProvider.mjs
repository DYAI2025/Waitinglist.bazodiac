// Newsletter provider boundary.
//
// Generic boundary; final newsletter vendor schema is not yet pinned. Stub
// mode returns null and the service layer falls back to the canonical
// fixture response (deterministic confirmation).
import { configurationError, fufireUnavailable, ApiError, ERROR_CODES } from '../errors.mjs';

export async function subscribe({ email, name, language, chartSessionId, config, fetchImpl = fetch }) {
  if (config.stubMode) return null;
  if (!config.newsletter.url) throw configurationError('NEWSLETTER_API_URL is not set.');

  let response;
  try {
    response = await fetchImpl(config.newsletter.url, {
      method: 'POST',
      headers: {
        ...(config.newsletter.apiKey
          ? { authorization: `Bearer ${config.newsletter.apiKey}` }
          : {}),
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, name, language, chartSessionId, consent: true }),
    });
  } catch (err) {
    throw fufireUnavailable(`Newsletter request failed: ${err.message}`);
  }

  if (response.status === 409) {
    // Vendor signals already-subscribed → soft-success per public-api.md.
    return { alreadySubscribed: true };
  }
  if (!response.ok) {
    throw new ApiError({
      status: 502,
      code: ERROR_CODES.FUFIRE_UNAVAILABLE,
      message: `Newsletter HTTP ${response.status}.`,
    });
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError({
      status: 502,
      code: ERROR_CODES.FUFIRE_UNAVAILABLE,
      message: 'Newsletter returned a non-JSON response.',
    });
  }
  return {
    id: body.id || `sub_${randomToken()}`,
    email,
    confirmedAt: body.confirmedAt || new Date().toISOString(),
    doubleOptInRequired: Boolean(body.doubleOptInRequired),
  };
}

function randomToken() {
  return Math.random().toString(36).slice(2, 10);
}
