# GOAL-collect-waitlist-signups: Consenting newsletter signup

**Description**: Enable visitors who have just received a Fusion Chart to consent to receive release updates and have their address recorded, so the team can build a launch list. Consent must be explicit; the contract returns clear, language-neutral error codes for missing consent or malformed input.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Success Criteria

- [ ] A consenting visitor can submit email + name and receive a `{ ok: true, subscribed: true, subscription: { ... } }` envelope.
- [ ] Submission is blocked when consent is not granted, surfacing `error.code: CONSENT_REQUIRED` with `error.field: "consent"`.
- [ ] Invalid emails return `error.code: INVALID_EMAIL` with `error.field: "email"`, rendered in the user's chosen language.
- [ ] Re-submitting the same email is handled gracefully — either soft-success (`ok: true, subscribed: true`) or `error.code: ALREADY_SUBSCRIBED` per the contract; no duplicate subscription records are created.
- [ ] Newsletter signup is only surfaced after a successful chart computation (a `chartSessionId` is required in the request).

## Related Artifacts

- User stories: [US-subscribe-with-consent](../user-stories/US-subscribe-with-consent.md)
- Requirements: [REQ-F-newsletter-signup-endpoint](../requirements/REQ-F-newsletter-signup-endpoint.md), [REQ-F-idempotent-newsletter-signup](../requirements/REQ-F-idempotent-newsletter-signup.md), [REQ-SEC-consent-required](../requirements/REQ-SEC-consent-required.md)
