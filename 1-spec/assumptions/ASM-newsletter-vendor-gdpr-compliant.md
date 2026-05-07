# ASM-newsletter-vendor-gdpr-compliant: A GDPR-compliant newsletter vendor will be available

**Category**: Regulatory

**Status**: Unverified

**Risk if wrong**: Medium — without a GDPR-compliant vendor with a JSON API and proper consent handling, the newsletter signup cannot lawfully run in EU markets. Pre-launch okay (stub mode keeps signups deterministic and discardable). Launch blocker for live newsletter mode.

## Statement

A newsletter vendor (e.g., Brevo, Klaviyo, Mailchimp, ActiveCampaign, ConvertKit) that supports GDPR-compliant double opt-in, a JSON API, EU data-residency or appropriate Standard Contractual Clauses, and consent + deletion endpoints will be selected and contracted before production launch.

## Rationale

Several EU-friendly newsletter vendors meet these criteria. The selection is a commercial / legal decision rather than a technical one; the Iteration-2 newsletter provider boundary (`src/providers/newsletterProvider.mjs`) is generic enough to swap.

## Verification Plan

1. Vendor evaluation matrix scoring: GDPR (consent storage + audit trail, deletion + export endpoints, EU data-residency or SCCs), JSON API stability, double-opt-in support, error semantics, pricing.
2. Privacy-compliance owner sign-off on the selected vendor's data-processing terms.
3. Implement vendor-specific request/response mapping in `src/providers/newsletterProvider.mjs` and exercise via a staging signup; verify confirmation email lands and that re-subscription is handled per [`REQ-F-idempotent-newsletter-signup`](../requirements/REQ-F-idempotent-newsletter-signup.md).
4. Confirm consent records are retrievable and deletable per GDPR.

## Related Artifacts

- [GOAL-collect-waitlist-signups](../goals/GOAL-collect-waitlist-signups.md)
- [REQ-F-newsletter-signup-endpoint](../requirements/REQ-F-newsletter-signup-endpoint.md)
- [REQ-SEC-consent-required](../requirements/REQ-SEC-consent-required.md)
- [REQ-F-idempotent-newsletter-signup](../requirements/REQ-F-idempotent-newsletter-signup.md)
