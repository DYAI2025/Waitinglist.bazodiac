# ASM-newsletter-vendor-gdpr-compliant: A GDPR-compliant newsletter vendor will be available

**Category**: Regulatory

**Status**: Unverified

**Risk if wrong**: Medium — without a GDPR-compliant vendor with a JSON API and proper consent handling, the newsletter signup cannot lawfully run in EU markets. Pre-launch okay (stub mode keeps signups deterministic and discardable). Launch blocker for live newsletter mode.

## Statement

A newsletter vendor (e.g., Brevo, Klaviyo, Mailchimp, ActiveCampaign, ConvertKit) that supports GDPR-compliant double opt-in, a JSON API, EU data-residency or appropriate Standard Contractual Clauses, and consent + deletion endpoints will be selected and contracted before production launch.

## Rationale

Several EU-friendly newsletter vendors meet these criteria. The selection is a commercial / legal decision rather than a technical one; the Iteration-2 newsletter provider boundary (`src/providers/newsletterProvider.mjs`) is generic enough to swap.

## Verification Plan

**Trigger:** `TASK-decide-newsletter-vendor` resolves to a chosen vendor (Brevo / ConvertKit / Buttondown / other).
**Method:** Vendor's published GDPR/DPA documentation reviewed by `STK-privacy-compliance-owner`; double-opt-in mechanic verified via test signup with confirmation-email round-trip; data-retention + right-to-erasure flow documented in the runbook.
**Owner:** [STK-privacy-compliance-owner](../stakeholders.md)
**Target date:** Post-Phase-2 vendor-decision resolution.
**Records to update on verification:** Status field (`Unverified` → `Verified`); add a `## Verification Evidence` section with date and evidence link; if applicable, add a `## Resolved by` section linking to the relevant `DEC-*`.

## Related Artifacts

- [GOAL-collect-waitlist-signups](../goals/GOAL-collect-waitlist-signups.md)
- [REQ-F-newsletter-signup-endpoint](../requirements/REQ-F-newsletter-signup-endpoint.md)
- [REQ-SEC-consent-required](../requirements/REQ-SEC-consent-required.md)
- [REQ-F-idempotent-newsletter-signup](../requirements/REQ-F-idempotent-newsletter-signup.md)
