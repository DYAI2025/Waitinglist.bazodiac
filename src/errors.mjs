// Stable error codes rendered verbatim by the frontend.
// Adding or renaming a code is a contract change — update contracts/public-api.md
// and contracts/SMOKE_CHECKLIST.md in the same commit.
export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  INVALID_EMAIL: 'INVALID_EMAIL',
  ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
  MALFORMED_JSON: 'MALFORMED_JSON',
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  FUFIRE_UNAVAILABLE: 'FUFIRE_UNAVAILABLE',
  INTERPRETATION_UNAVAILABLE: 'INTERPRETATION_UNAVAILABLE',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  CHART_NOT_FOUND: 'CHART_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

export class ApiError extends Error {
  constructor({ status, code, message, field }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    if (field) this.field = field;
  }
  toEnvelope() {
    const error = { code: this.code, message: this.message };
    if (this.field) error.field = this.field;
    return { ok: false, error };
  }
}

export const validationError = (message, field) =>
  new ApiError({ status: 400, code: ERROR_CODES.VALIDATION_ERROR, message, field });

export const consentRequired = (message = 'Consent must be granted before subscribing.') =>
  new ApiError({ status: 400, code: ERROR_CODES.CONSENT_REQUIRED, message, field: 'consent' });

export const invalidEmail = (message = 'email must be valid') =>
  new ApiError({ status: 400, code: ERROR_CODES.INVALID_EMAIL, message, field: 'email' });

export const malformedJson = (message = 'Request body must be valid JSON.') =>
  new ApiError({ status: 400, code: ERROR_CODES.MALFORMED_JSON, message, field: 'body' });

export const unsupportedMediaType = (message = 'Content-Type must be application/json.') =>
  new ApiError({ status: 415, code: ERROR_CODES.UNSUPPORTED_MEDIA_TYPE, message, field: 'content-type' });

export const methodNotAllowed = (message = 'Method not allowed.') =>
  new ApiError({ status: 405, code: ERROR_CODES.METHOD_NOT_ALLOWED, message });

export const fufireUnavailable = (message = 'Chart engine is currently unavailable.') =>
  new ApiError({ status: 502, code: ERROR_CODES.FUFIRE_UNAVAILABLE, message });

export const interpretationUnavailable = (message = 'Interpretation service is currently unavailable.') =>
  new ApiError({ status: 502, code: ERROR_CODES.INTERPRETATION_UNAVAILABLE, message });

export const configurationError = (message) =>
  new ApiError({ status: 500, code: ERROR_CODES.CONFIGURATION_ERROR, message });

export const internalError = (message = 'Unexpected server error.') =>
  new ApiError({ status: 500, code: ERROR_CODES.INTERNAL_ERROR, message });

export function asEnvelope(err) {
  if (err instanceof ApiError) return err.toEnvelope();
  return {
    ok: false,
    error: { code: ERROR_CODES.INTERNAL_ERROR, message: 'Unexpected server error.' },
  };
}

export function statusFor(err) {
  return err instanceof ApiError ? err.status : 500;
}
