# REQ-SEC-consent-required: Newsletter signup requires explicit consent

**Type**: Security

**Status**: Approved

**Priority**: Must-have

**Source**: [US-subscribe-with-consent](../user-stories/US-subscribe-with-consent.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

The newsletter signup endpoint refuses any submission without `consent: true` on the request body. A missing or `false` consent is rejected with HTTP 4xx `{ ok: false, error: { code: "CONSENT_REQUIRED", field: "consent" } }`. The frontend keeps the submit button disabled until the consent checkbox is checked, providing a defense-in-depth layer; the backend check is the authoritative one.

## Acceptance Criteria

- Given a request body with `consent: false` (or `consent` omitted), when `/api/public/newsletter-signup` is called, then the response is HTTP 4xx with `error.code: CONSENT_REQUIRED` and `error.field: "consent"`.
- Given a request body with `consent: true` but other validation failures, when called, then the response surfaces the more-specific failure (e.g., `INVALID_EMAIL`) — `CONSENT_REQUIRED` is checked first only to avoid silently accepting a submission whose consent is missing.
- Given the frontend, when the consent checkbox is unchecked, then the submit button is disabled and cannot trigger an API call.
- Given a backend audit, when reviewing service code, then no code path subscribes a user without first verifying `consent: true`.

## Related Constraints

- [CON-no-synthesized-data-in-prod](../constraints/CON-no-synthesized-data-in-prod.md) — confirmation envelopes are not allowed without an actual consenting subscription.

## Related Assumptions

- [ASM-newsletter-vendor-gdpr-compliant](../assumptions/ASM-newsletter-vendor-gdpr-compliant.md) — the consent obligation only delivers value if the vendor handles consent records lawfully.
