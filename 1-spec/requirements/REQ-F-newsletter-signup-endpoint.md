# REQ-F-newsletter-signup-endpoint: `POST /api/public/newsletter-signup` confirms a consenting subscription

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-subscribe-with-consent](../user-stories/US-subscribe-with-consent.md)

**Source stakeholder**: [STK-newsletter-subscriber](../stakeholders.md)

## Description

`POST /api/public/newsletter-signup` accepts a body containing `email` (valid format), optional `name`, `language` (`"de" | "en"`), `consent` (must be `true`), and `chartSessionId` (string). On success it returns `{ ok: true, subscribed: true, subscription: { id, email, confirmedAt, doubleOptInRequired } }` per `contracts/public-api.md`. The endpoint is the only path that records a newsletter subscription; signup is only surfaced after a successful chart computation.

## Acceptance Criteria

- Given a valid request with `consent: true`, when the endpoint is called, then the response is HTTP 200 with `ok: true`, `subscribed: true`, and `subscription.email` echoing the request.
- Given `consent: false` or missing consent, when the endpoint is called, then HTTP 400 is returned with `error.code: CONSENT_REQUIRED` and `field: "consent"`.
- Given a malformed email, when the endpoint is called, then HTTP 400 is returned with `error.code: INVALID_EMAIL` and `field: "email"`.
- Given missing `chartSessionId`, when the endpoint is called, then HTTP 400 is returned with `error.code: VALIDATION_ERROR` and `field: "chartSessionId"`.
- Given an optional `name`, when omitted, then the request is still accepted (name is optional).

## Related Assumptions

- [ASM-newsletter-vendor-gdpr-compliant](../assumptions/ASM-newsletter-vendor-gdpr-compliant.md) — live-mode delivery and lawful processing depend on the selected vendor.
