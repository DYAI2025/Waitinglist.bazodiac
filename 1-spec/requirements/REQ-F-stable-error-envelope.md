# REQ-F-stable-error-envelope: Stable response envelope with ALL_CAPS error codes

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

Every public API response (`/api/public/*`) uses a stable envelope: success responses begin with `"ok": true` and carry endpoint-specific fields; error responses begin with `"ok": false` and carry an `error` object with `code`, `message`, and an optional `field`. `error.code` is an ALL_CAPS, language-neutral, machine-readable string drawn from a closed catalog (see `src/errors.mjs`). HTTP status reflects the error category (4xx for client, 5xx for upstream/internal). Successful operations always pair HTTP 2xx with `ok: true`; failures pair non-2xx with `ok: false`.

## Acceptance Criteria

- Given a successful chart computation, when the response is rendered, then it has `ok: true` and matches the contract response shape from `contracts/public-api.md`.
- Given a validation failure, when the response is rendered, then it has `ok: false`, an HTTP 4xx status, and `error.code: VALIDATION_ERROR` with a `field` indicating the offending input.
- Given a missing or wrong content-type, when the request is processed, then HTTP 415 is returned with `error.code: UNSUPPORTED_MEDIA_TYPE`.
- Given malformed JSON, when the body is parsed, then HTTP 400 is returned with `error.code: MALFORMED_JSON`.
- Given any error path, when the response is logged, then `error.code` exists in the closed catalog and is exactly the string the frontend renders verbatim.

## Related Constraints

- [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md) — the envelope is what failures must surface as.
