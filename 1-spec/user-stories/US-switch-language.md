# US-switch-language: Switch the page language between DE and EN at any point

**As a** prospective user fluent in either German or English, **I want** to switch the page language at any point and have my choice persist across the session, **so that** I can read the entire experience in my preferred language without losing my place.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

**Related goals**: [GOAL-bilingual-experience](../goals/GOAL-bilingual-experience.md), [GOAL-accessible-chart-tiles](../goals/GOAL-accessible-chart-tiles.md)

## Acceptance Criteria

- Given the page is in DE, when I activate the EN toggle, then every visible text element, error message, ARIA label, and chart-tile tooltip switches to English without a page reload.
- Given a chart is already rendered with DE labels, when I switch to EN, then the dynamic-content tooltips on all six chart tiles update to English (handled by a `MutationObserver` on `<html lang>`).
- Given I switch language while a request is in flight, when the response arrives, then the status banner and any error messages render in the now-active language.
- Given the active language is EN, when an error envelope is received, then `error.code` is rendered verbatim (language-neutral) but `error.message` is shown in English.

## Derived Requirements

- [REQ-F-language-toggle-live](../requirements/REQ-F-language-toggle-live.md)
- [REQ-USA-i18n-de-en-parity](../requirements/REQ-USA-i18n-de-en-parity.md)
