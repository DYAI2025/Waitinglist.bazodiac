# REQ-USA-keyboard-accessible-tiles: Six chart tiles are keyboard-focusable with localized ARIA + dismissable tooltips

**Type**: Usability

**Status**: Approved

**Priority**: Should-have

**Source**: [US-keyboard-explore-tiles](../user-stories/US-keyboard-explore-tiles.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

The six chart-stat tiles (sun, moon, ascendant, BaZi year animal, daymaster, dominant element) carry `tabindex="0"` and `role="group"`, are reachable via Tab in document order, expose an `aria-label` that combines tile name and a localized explanation, and offer a hover/focus tooltip with the same explanation. Pressing Escape on a focused tile blurs focus. ARIA labels and tooltip content react to language changes live (via the `MutationObserver` on `<html lang>`).

## Acceptance Criteria

- Given the chart is rendered, when the user presses Tab from the form, then each of the six tiles receives keyboard focus in document order (sun → moon → ascendant → animal → day → dom).
- Given a focused tile, when a screen reader announces it, then the announcement combines the tile's semantic name and a short language-appropriate explanation (DE or EN per active language).
- Given a focused tile, when the user presses Escape, then focus blurs from the tile and the tooltip is no longer visible.
- Given a language switch, when the active language changes, then the next focus on a tile yields the announcement in the new language without a page reload.
- Given the ascendant tile is provisional (`chart.ascendant === null`), when focused, then the announced text reflects the provisional state (no fabricated sign).
