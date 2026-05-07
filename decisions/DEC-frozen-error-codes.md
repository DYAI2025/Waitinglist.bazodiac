# DEC-frozen-error-codes: Frozen ALL_CAPS error code set as contract surface

**Status**: Active

**Category**: Convention

**Scope**: system-wide

**Source**: [REQ-F-stable-error-envelope](../1-spec/requirements/REQ-F-stable-error-envelope.md), [REQ-USA-error-code-rendered-verbatim](../1-spec/requirements/REQ-USA-error-code-rendered-verbatim.md)

**Last updated**: 2026-05-07

## Context

The frontend renders the backend's `error.code` string verbatim — there is no client-side translation layer or fallback message. This makes every code value a user-visible contract: adding a code introduces a new UI state, renaming a code breaks rendering, and removing a code leaves the UI without a path to express that error condition. Free-form ad-hoc strings would cause the rendered set to drift between deploys and would make i18n / smoke testing unreliable.

## Decision

All `error.code` values in API responses are sourced from the frozen `ERROR_CODES` constant in `src/errors.mjs`. The current set has 13 values:

```
VALIDATION_ERROR, CONSENT_REQUIRED, INVALID_EMAIL, ALREADY_SUBSCRIBED,
MALFORMED_JSON, UNSUPPORTED_MEDIA_TYPE, METHOD_NOT_ALLOWED,
FUFIRE_UNAVAILABLE, INTERPRETATION_UNAVAILABLE, CONFIGURATION_ERROR,
RATE_LIMITED, CHART_NOT_FOUND, INTERNAL_ERROR
```

Adding a code requires updating `contracts/public-api.md` and `contracts/SMOKE_CHECKLIST.md` in the same commit. Renaming or removing a code requires deprecating this decision (or a successor decision) per `decisions/PROCEDURES.md`.

`error.message` is debug-grade and may change without contract notice; it MUST NOT contain user PII (`REQ-SEC-no-pii-in-logs`).

## Enforcement

### Trigger conditions

- **Specification phase**: n/a
- **Design phase**: when adding or changing an error code in `api-design.md` or `data-model.md`.
- **Code phase**: when implementing a new error path or surfacing a new failure mode.
- **Deploy phase**: n/a

### Required patterns

All errors are constructed via factory functions in `src/errors.mjs`:

```javascript
throw validationError('birthDate is required', 'birthDate');
throw fufireUnavailable(`FuFirE returned HTTP ${response.status}.`);
throw configurationError('FUFIRE_BASE_URL is not set.');
```

The factory functions reference `ERROR_CODES` keys directly. Adding a new code follows the same pattern: extend `ERROR_CODES`, add a factory function, then update `contracts/public-api.md`.

### Required checks

1. `grep -rE "code:\s*['\"]([A-Z_]+)['\"]" src/ | grep -vE "ERROR_CODES\.\w+"` returns no results outside `src/errors.mjs` itself.
2. Every key in `ERROR_CODES` appears at least once in `contracts/public-api.md` (or is documented as an internal-only code in the same file).
3. `error.message` strings are constants or template strings without user-supplied fields (birthDate, birthTime, birthPlace, email, name).

### Prohibited patterns

- Ad-hoc `throw new Error('something')` from request handlers, services, or providers — these escape the envelope and surface as `INTERNAL_ERROR` with no context.
- Localized error messages on the server (`error.message` is English-only; UI does not translate).
- Returning `error.code` values that are not in `ERROR_CODES`.
- Echoing user input fields into `error.message`.
