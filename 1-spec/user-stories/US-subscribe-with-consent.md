# US-subscribe-with-consent: Subscribe to release updates with explicit consent

**As a** newsletter subscriber who has just received a chart, **I want** to give my email and name with explicit consent to receive Bazodiac release updates, **so that** I can be notified when the product launches.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-newsletter-subscriber](../stakeholders.md)

**Related goal**: [GOAL-collect-waitlist-signups](../goals/GOAL-collect-waitlist-signups.md)

## Acceptance Criteria

- Given the consent checkbox is unchecked, when I attempt to submit, then the form blocks submission and the response surfaces `error.code: CONSENT_REQUIRED` with `error.field: "consent"`.
- Given valid email + name, granted consent, and a prior `chartSessionId`, when I submit, then the response is `{ok: true, subscribed: true, subscription: {...}}` and the UI shows a localized confirmation.
- Given a malformed email, when I submit, then `error.code: INVALID_EMAIL` is returned with `error.field: "email"` and rendered in the active language.
- Given I submit the same email a second time, when the second submission completes, then the response is either `{ok: true, subscribed: true}` (soft-success) or `{ok: false, error: {code: "ALREADY_SUBSCRIBED"}}` per the public contract — never a duplicate subscription record.
- Given the request is missing `chartSessionId`, when I submit, then `error.code: VALIDATION_ERROR` with `error.field: "chartSessionId"` is returned, since signup is only surfaced after a chart computation.

## Derived Requirements

- [REQ-F-newsletter-signup-endpoint](../requirements/REQ-F-newsletter-signup-endpoint.md)
- [REQ-SEC-consent-required](../requirements/REQ-SEC-consent-required.md)
- [REQ-F-idempotent-newsletter-signup](../requirements/REQ-F-idempotent-newsletter-signup.md)
