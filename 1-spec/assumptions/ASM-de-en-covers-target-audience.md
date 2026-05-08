# ASM-de-en-covers-target-audience: German + English are sufficient for pre-launch audience

**Category**: Business

**Status**: Unverified

**Risk if wrong**: Low — adding a third locale (French, Italian, Spanish, etc.) is additive: extending the i18n dictionary, the chart-tile tooltip table, and copy review for the new language. Cost is moderate and there is no architectural change.

## Statement

German and English together cover the pre-launch and early-launch target audience for Bazodiac. No third locale is required at this stage.

## Rationale

The founder ([STK-founder](../stakeholders.md)) is based in DE-EU; the primary intended audience is German-speaking visitors plus English-speaking international visitors. The current `public/index.html` ships full DE/EN parity with a live language toggle, and `REQ-USA-i18n-de-en-parity` locks this expectation.

## Verification Plan

**Trigger:** First wave of public-traffic analytics post-launch (Phase 4 cutover or first 30 days of public availability, whichever comes first).
**Method:** Track language-toggle ratio + EN-content engagement metrics in production analytics. Threshold: if EN sessions are < 5% of total over a rolling 30-day window, the assumption is invalidated and the language strategy revisits (potential addition of further locales or de-prioritization of EN).
**Owner:** [STK-founder](../stakeholders.md)
**Target date:** 30 days post-public-launch.
**Records to update on verification:** Status field (`Unverified` → `Verified`); add a `## Verification Evidence` section with date and analytics-snapshot reference; if invalidated instead, change Status to `Invalidated` and surface a follow-up artefact.

## Related Artifacts

- [GOAL-bilingual-experience](../goals/GOAL-bilingual-experience.md)
- [REQ-USA-i18n-de-en-parity](../requirements/REQ-USA-i18n-de-en-parity.md)
