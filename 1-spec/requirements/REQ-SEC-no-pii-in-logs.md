# REQ-SEC-no-pii-in-logs: Logs and `error.message` strings must not contain user PII

**Type**: Security

**Status**: Approved

**Priority**: Must-have

**Source**: [US-honest-failure-on-outage](../user-stories/US-honest-failure-on-outage.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

Server logs and the human-readable `error.message` field in API responses must not contain personally identifiable information (PII): user email, name, birth date, birth time, birth place, IP address, or any user-supplied free-text field. Stable `error.code` strings, request paths, HTTP statuses, and timing data are permitted. Validation errors that need to refer to a field name use `error.field` (the name of the field, never its value).

## Acceptance Criteria

- Given any error in any code path, when an `error.message` is constructed, then it does not include the value of `email`, `name`, `birthDate`, `birthTime`, `birthPlace`, or any other user-supplied free-text field.
- Given a malformed-JSON parse error, when the error is rendered, then `error.message` is a fixed, non-PII string (e.g., `"Request body must be valid JSON."`) — the malformed body is not echoed back.
- Given a validation error on `email`, when rendered, then `error.message` says the email is invalid (without echoing the email value) and `error.field` is `"email"`.
- Given server-side logs, when an outage is logged, then the logged record contains `error.code`, request path, and HTTP status — no PII.
