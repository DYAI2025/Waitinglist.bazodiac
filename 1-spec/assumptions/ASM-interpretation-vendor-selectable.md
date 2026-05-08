# ASM-interpretation-vendor-selectable: An interpretation vendor will be procurable at acceptable terms

**Category**: Business

**Status**: Unverified

**Risk if wrong**: Medium — without a viable interpretation vendor, the interpretation modal stays in `INTERPRETATION_UNAVAILABLE` state in production and the chart-only experience is incomplete. Mitigation: the Iteration-2 interpretation provider boundary is generic, so the vendor is swappable; pre-launch experience continues in stub mode.

## Statement

A Gemini-based provider (or an equivalent proxy service such as Vertex AI, OpenRouter, or a self-hosted model) will be procurable at acceptable cost, rate-limit terms, and data-handling terms before production launch.

## Rationale

The Gemini family is widely available, and `src/providers/interpretationProvider.mjs` is intentionally generic so that the vendor can be swapped without changing the public contract or the frontend. Several proxy services offer Gemini-equivalent capabilities under different commercial terms.

## Verification Plan

**Trigger:** `TASK-decide-interpretation-vendor` resolves — either to a chosen path (Gemini direct / proxy router) or to a *prospective* `DEC-no-separate-interpretation-vendor` (not yet recorded; would be created if BAFE's `/v1/experience/daily` returning `summary`, `themes`, `caution`, `opportunity` natively per `2-design/external-context/bafe-api-reference.md` is judged sufficient).
**Method:** If a vendor is chosen, verification is a successful end-to-end call producing acceptable DE+EN content quality. If no vendor is needed, the assumption is closed via `Status: Verified — N/A (BAFE-native interpretation sufficient)`.
**Owner:** [STK-founder](../stakeholders.md)
**Target date:** Post-Phase-2 vendor-decision resolution.
**Records to update on verification:** Status field (`Unverified` → `Verified`); add a `## Verification Evidence` section with date and evidence link; if applicable, add a `## Resolved by` section linking to the relevant `DEC-*`. **If invalidated instead** (e.g., neither path produces acceptable DE+EN quality), change Status to `Invalidated` and surface a follow-up artefact.

## Related Artifacts

- [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)
- [REQ-F-fusion-interpretation-endpoint](../requirements/REQ-F-fusion-interpretation-endpoint.md)
- [REQ-F-stub-mode-toggle](../requirements/REQ-F-stub-mode-toggle.md)
- [REQ-F-config-validation-live](../requirements/REQ-F-config-validation-live.md)
