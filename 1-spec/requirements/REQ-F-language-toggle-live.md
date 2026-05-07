# REQ-F-language-toggle-live: Language toggle updates the entire UI live, without page reload

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-switch-language](../user-stories/US-switch-language.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

Activating the language toggle on `public/index.html` switches every visible string — labels, status banners, errors, modal text, ARIA labels, chart-tile tooltips — between German and English without a page reload. The toggle sets `document.documentElement.lang`; chart-tile tooltips and ARIA labels react via a `MutationObserver` on that attribute. Backend `error.code` values stay language-neutral (ALL_CAPS); only the human-readable `error.message` is rendered in the active language.

## Acceptance Criteria

- Given the page is in DE, when the EN toggle is activated, then every text element, button, label, status banner, modal text, ARIA label, and tooltip switches to English without a page reload.
- Given a chart is already rendered, when the language is switched, then the dynamic-content tooltips on all six chart tiles update to the new language (handled by the `MutationObserver` on `<html lang>`).
- Given a request is in flight, when the language is switched, then the response's status / error rendering uses the now-active language.
- Given an error envelope is received, when rendered, then `error.code` appears verbatim (language-neutral) and `error.message` is shown in the active language.
