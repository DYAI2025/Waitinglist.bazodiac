# US-keyboard-explore-tiles: Explore the chart tiles via keyboard and screen reader

**As a** prospective user navigating with a keyboard or assistive technology, **I want** to focus each chart tile, read its meaning via screen reader in my chosen language, and dismiss with Escape, **so that** the chart is meaningful without a pointing device.

**Status**: Approved

**Priority**: Should-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

**Related goals**: [GOAL-accessible-chart-tiles](../goals/GOAL-accessible-chart-tiles.md), [GOAL-bilingual-experience](../goals/GOAL-bilingual-experience.md)

## Acceptance Criteria

- Given the chart is rendered, when I press Tab repeatedly from the form, then each of the six tiles (sun, moon, ascendant, BaZi year animal, daymaster, dominant element) receives keyboard focus in document order.
- Given a tile has keyboard focus, when a screen reader announces it, then the announced text combines the tile's semantic name and a short localized explanation (DE or EN per the active language).
- Given a tile has keyboard focus, when I press Escape, then focus blurs from the tile and any visible tooltip is dismissed.
- Given the active language is DE, when I focus a tile, then the announcement is German; when language is EN, the announcement is English (synced via the `MutationObserver` on `<html lang>`).
- Given the ascendant tile is provisional (no birth time supplied), when it receives focus, then the announced explanation reflects the provisional state, not a fabricated sign.

## Derived Requirements

- [REQ-USA-keyboard-accessible-tiles](../requirements/REQ-USA-keyboard-accessible-tiles.md)
- [REQ-USA-i18n-de-en-parity](../requirements/REQ-USA-i18n-de-en-parity.md)
- [REQ-USA-no-8px-essential-text](../requirements/REQ-USA-no-8px-essential-text.md)
