# GOAL-accessible-chart-tiles: Keyboard + screen-reader access for the chart tiles

**Description**: The six chart tiles (sun, moon, ascendant, BaZi year animal, daymaster, dominant element) are reachable via keyboard navigation, expose meaningful ARIA labels in DE and EN, and offer hover / focus tooltips that explain what each tile represents — including a provisional explanation on the ascendant when the user did not supply a birth time.

**Status**: Approved

**Priority**: Should-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Success Criteria

- [ ] All six chart tiles are reachable via Tab navigation in document order.
- [ ] Each tile exposes an `aria-label` that combines its semantic name and a short explanation, switched per active language.
- [ ] Hover and keyboard focus reveal a tooltip; Escape dismisses focus.
- [ ] When birth time is unknown, the ascendant tile communicates its provisional nature explicitly (not by blanking the value alone).
- [ ] No essential UI text (chart-stat labels, modal notes, bento card labels) uses `font-size: 8px`.

## Related Artifacts

- User stories: [US-provisional-without-birth-time](../user-stories/US-provisional-without-birth-time.md), [US-switch-language](../user-stories/US-switch-language.md), [US-keyboard-explore-tiles](../user-stories/US-keyboard-explore-tiles.md)
- Requirements: [REQ-F-null-birth-time-accepted](../requirements/REQ-F-null-birth-time-accepted.md), [REQ-F-language-toggle-live](../requirements/REQ-F-language-toggle-live.md), [REQ-USA-keyboard-accessible-tiles](../requirements/REQ-USA-keyboard-accessible-tiles.md), [REQ-USA-no-8px-essential-text](../requirements/REQ-USA-no-8px-essential-text.md)
