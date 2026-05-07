# REQ-USA-no-8px-essential-text: No essential UI text uses `font-size: 8px`

**Type**: Usability

**Status**: Approved

**Priority**: Should-have

**Source**: [US-keyboard-explore-tiles](../user-stories/US-keyboard-explore-tiles.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

Essential UI text — chart-stat labels (`.stat .k`), Wu-Xing vector labels (`.wuxing-vec .lab`), Wu-Xing bar names (`.wuxing-bars .el .name`), bento card labels (`.bento .ck .label`), bento small markers (`.bento .v small`), interpretation kv labels (`.interpretation .kv span`), modal foot notes (`.modal-foot .note`) — must not use `font-size: 8px`. The minimum acceptable size for these selectors is `10px` (paired with the `--fg-muted` / `--fg-subtle` contrast tokens).

## Acceptance Criteria

- Given the CSS in `public/index.html`, when each of the listed selectors is searched, then none has a `font-size: 8px` declaration.
- Given the static check `npm run check`, when run, then it fails if any of the listed selectors regresses to `font-size: 8px`.
- Given a contrast inspection of the rendered page, when each listed selector is rendered, then the contrast ratio against the background meets WCAG AA at the chosen color tokens.
