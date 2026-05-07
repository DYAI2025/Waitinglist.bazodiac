# REQ-USA-i18n-de-en-parity: All visible UI text exists in both DE and EN with full parity

**Type**: Usability

**Status**: Approved

**Priority**: Must-have

**Source**: [US-switch-language](../user-stories/US-switch-language.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

Every visitor-visible string on `public/index.html` exists in both German and English, with parity in meaning, completeness, and tone. This includes: form labels, button text, placeholder text, status banners, error messages, modal copy, chart-tile labels, chart-tile tooltips, ARIA labels, footer notes, and disclaimer text. Engineering-internal strings (HTTP method names, `error.code` ALL_CAPS strings, debug logs) are excluded.

## Acceptance Criteria

- Given every `data-i18n` key in the i18n dictionary, when the dictionary is reviewed, then a non-empty entry exists for both `de` and `en`.
- Given a chart-tile tooltip in the `TIP_STRINGS` table, when the table is reviewed, then a non-empty `label` and `text` exist for both `de` and `en` (and for the `asc_provisional` variant).
- Given the language toggle, when switched, then no visible text remains in the previous language (manual visual review or automated diff).
- Given an `error.message` returned by the backend, when rendered, then it appears in the active language; `error.code` remains the language-neutral ALL_CAPS string.

## Related Assumptions

- [ASM-de-en-covers-target-audience](../assumptions/ASM-de-en-covers-target-audience.md) — DE + EN parity is sufficient only if the target audience is covered by these two locales.
