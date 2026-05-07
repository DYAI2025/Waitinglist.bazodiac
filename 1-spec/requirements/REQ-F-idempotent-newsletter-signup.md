# REQ-F-idempotent-newsletter-signup: Repeated signup with the same email is graceful and produces no duplicates

**Type**: Functional

**Status**: Approved

**Priority**: Should-have

**Source**: [US-subscribe-with-consent](../user-stories/US-subscribe-with-consent.md)

**Source stakeholder**: [STK-newsletter-subscriber](../stakeholders.md)

## Description

Submitting `/api/public/newsletter-signup` more than once with the same email is handled idempotently: the response is either a soft-success (`{ ok: true, subscribed: true, subscription: {...} }`) or a stable error envelope (`{ ok: false, error: { code: "ALREADY_SUBSCRIBED" } }`) per `contracts/public-api.md`. In neither case is a duplicate subscription record created in the upstream newsletter vendor.

## Acceptance Criteria

- Given an email that has already been subscribed, when the endpoint is called again with the same email, then the response is HTTP 200 `{ ok: true, subscribed: true }` **or** HTTP 4xx with `error.code: ALREADY_SUBSCRIBED`. No other status/code combination is returned.
- Given a re-subscription, when the upstream is queried after the call, then the subscriber record count for that email is exactly one.
- Given the contract uses soft-success for re-subscription, when the frontend receives it, then the UI renders a softer "you are already subscribed" confirmation (in active language) rather than a generic error.
