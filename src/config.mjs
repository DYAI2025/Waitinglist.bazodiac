import { configurationError } from './errors.mjs';

const truthy = (v) => /^(1|true|yes|on)$/i.test(String(v ?? '').trim());
const numeric = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function loadConfig(env = process.env) {
  // STUB mode is the default. The real-provider switch is opt-in: set
  // PUBLIC_API_STUB_MODE=false explicitly to engage the upstream services.
  const stubMode = env.PUBLIC_API_STUB_MODE === undefined
    ? true
    : !/^(0|false|no|off)$/i.test(String(env.PUBLIC_API_STUB_MODE).trim());

  const config = {
    nodeEnv: env.NODE_ENV || 'development',
    port: numeric(env.PORT, 3000),
    host: env.HOST || '0.0.0.0',
    corsOrigin: env.CORS_ORIGIN || '*',
    stubMode,
    fufire: {
      baseUrl: env.FUFIRE_BASE_URL || '',
      apiKey: env.FUFIRE_API_KEY || '',
      timeoutMs: numeric(env.FUFIRE_TIMEOUT_MS, 15000),
    },
    geocoding: {
      url: env.GEOCODING_API_URL || '',
      apiKey: env.GEOCODING_API_KEY || '',
    },
    timezone: {
      url: env.TIMEZONE_API_URL || '',
      apiKey: env.TIMEZONE_API_KEY || '',
    },
    interpretation: {
      url: env.INTERPRETATION_API_URL || '',
      apiKey: env.GEMINI_API_KEY || '',
    },
    newsletter: {
      url: env.NEWSLETTER_API_URL || '',
      apiKey: env.NEWSLETTER_API_KEY || '',
    },
  };
  return config;
}

export function assertProductionConfig(config) {
  if (config.stubMode) return;
  const missing = [];
  if (!config.fufire.baseUrl) missing.push('FUFIRE_BASE_URL');
  if (!config.fufire.apiKey) missing.push('FUFIRE_API_KEY');
  if (!config.geocoding.url) missing.push('GEOCODING_API_URL');
  if (!config.timezone.url) missing.push('TIMEZONE_API_URL');
  if (!config.interpretation.url) missing.push('INTERPRETATION_API_URL');
  if (!config.interpretation.apiKey) missing.push('GEMINI_API_KEY');
  if (!config.newsletter.url) missing.push('NEWSLETTER_API_URL');
  if (missing.length) {
    throw configurationError(
      `PUBLIC_API_STUB_MODE=false requires these environment variables: ${missing.join(', ')}`,
    );
  }
}

export { truthy };
