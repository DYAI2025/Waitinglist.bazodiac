# ASM-de-en-covers-target-audience: German + English are sufficient for pre-launch audience

**Category**: Business

**Status**: Unverified

**Risk if wrong**: Low — adding a third locale (French, Italian, Spanish, etc.) is additive: extending the i18n dictionary, the chart-tile tooltip table, and copy review for the new language. Cost is moderate and there is no architectural change.

## Statement

German and English together cover the pre-launch and early-launch target audience for Bazodiac. No third locale is required at this stage.

## Rationale

The founder ([STK-founder](../stakeholders.md)) is based in DE-EU; the primary intended audience is German-speaking visitors plus English-speaking international visitors. The current `public/index.html` ships full DE/EN parity with a live language toggle, and `REQ-USA-i18n-de-en-parity` locks this expectation.

## Verification Plan

1. Marketing / audience research: which languages are spoken by the visitors targeted by pre-launch outreach (ads, social, partnerships)?
2. Once early signups exist: signup-language analytics — what fraction of subscribers chose DE vs EN, and is there a long tail of "neither" that suggests demand for a third locale?
3. Re-evaluate after 3 months of data; if a clear third-locale demand emerges, add it (the i18n + tooltip-string structure already supports any number of locales).

## Related Artifacts

- [GOAL-bilingual-experience](../goals/GOAL-bilingual-experience.md)
- [REQ-USA-i18n-de-en-parity](../requirements/REQ-USA-i18n-de-en-parity.md)
