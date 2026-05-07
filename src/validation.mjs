import { validationError, consentRequired, invalidEmail } from './errors.mjs';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{1,2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGES = new Set(['de', 'en']);

function ensureLanguage(value) {
  if (!LANGUAGES.has(value)) {
    throw validationError('language must be either de or en', 'language');
  }
}

export function validateFusionChartRequest(body) {
  if (!body.birthDate) throw validationError('birthDate is required', 'birthDate');
  if (!DATE_RE.test(String(body.birthDate))) {
    throw validationError('birthDate must be YYYY-MM-DD', 'birthDate');
  }
  if (!Object.hasOwn(body, 'birthTime')) {
    throw validationError('birthTime is required', 'birthTime');
  }
  // birthTime: null is valid ("I don't know my birth time").
  if (body.birthTime !== null && !TIME_RE.test(String(body.birthTime))) {
    throw validationError('birthTime must be HH:MM or null', 'birthTime');
  }
  if (typeof body.birthPlace !== 'string' || body.birthPlace.trim() === '') {
    throw validationError('birthPlace is required', 'birthPlace');
  }
  ensureLanguage(body.language);
  // timezone is optional; if provided, must be a string.
  if (body.timezone !== undefined && body.timezone !== null && typeof body.timezone !== 'string') {
    throw validationError('timezone must be a string or null', 'timezone');
  }
  return {
    birthDate: body.birthDate,
    birthTime: body.birthTime,
    birthPlace: body.birthPlace.trim(),
    timezone: body.timezone ?? null,
    language: body.language,
  };
}

export function validateFusionInterpretationRequest(body) {
  ensureLanguage(body.language);
  if (!body.chartSessionId || typeof body.chartSessionId !== 'string') {
    throw validationError('chartSessionId is required', 'chartSessionId');
  }
  if (!body.chart || typeof body.chart !== 'object' || Array.isArray(body.chart)) {
    throw validationError('chart is required', 'chart');
  }
  return {
    language: body.language,
    chartSessionId: body.chartSessionId,
    chart: body.chart,
  };
}

export function validateNewsletterRequest(body) {
  // Consent is checked first so consent errors are not masked by missing email.
  if (!body.consent) throw consentRequired();
  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    throw invalidEmail('email must be valid');
  }
  ensureLanguage(body.language);
  if (!body.chartSessionId || typeof body.chartSessionId !== 'string') {
    throw validationError('chartSessionId is required', 'chartSessionId');
  }
  if (body.name !== undefined && body.name !== null && typeof body.name !== 'string') {
    throw validationError('name must be a string', 'name');
  }
  return {
    email: body.email,
    name: body.name ?? null,
    language: body.language,
    consent: true,
    chartSessionId: body.chartSessionId,
  };
}

export const _internals = { DATE_RE, TIME_RE, EMAIL_RE };
