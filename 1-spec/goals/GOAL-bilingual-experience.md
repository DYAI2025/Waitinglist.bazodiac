# GOAL-bilingual-experience: Full DE/EN parity

**Description**: Every visitor-facing surface — copy, button labels, status banners, error messages, modal contents, ARIA labels, chart-tile tooltips — is rendered with full content and UI parity in German and English. Language switching is live (no page reload) and persists across the session.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Success Criteria

- [ ] Every text label, error code message, status banner, modal, and chart-tile tooltip is rendered in both DE and EN.
- [ ] The language toggle persists per session and updates ARIA labels live, without a page reload.
- [ ] No engineering-English fragments leak into user-visible UI for non-developer visitors.
- [ ] Backend `error.code` strings remain language-neutral (ALL_CAPS) but their human-readable `error.message` is rendered in the user's selected language.

## Related Artifacts

- User stories: [US-switch-language](../user-stories/US-switch-language.md), [US-keyboard-explore-tiles](../user-stories/US-keyboard-explore-tiles.md)
- Requirements: [REQ-F-language-toggle-live](../requirements/REQ-F-language-toggle-live.md), [REQ-USA-i18n-de-en-parity](../requirements/REQ-USA-i18n-de-en-parity.md), [REQ-USA-keyboard-accessible-tiles](../requirements/REQ-USA-keyboard-accessible-tiles.md)
