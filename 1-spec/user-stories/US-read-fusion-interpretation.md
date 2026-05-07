# US-read-fusion-interpretation: Open the Fusion Interpretation modal

**As a** prospective user who has just received a chart, **I want** to open the Fusion Interpretation modal and read a natural-language reflection of my Cosmic Signature, with optional TXT or PDF download, **so that** I can sit with the meaning.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

**Related goals**: [GOAL-pre-launch-preview](../goals/GOAL-pre-launch-preview.md), [GOAL-honest-reflection-framing](../goals/GOAL-honest-reflection-framing.md)

## Acceptance Criteria

- Given a chart has been computed and has a `chartSessionId`, when I open the interpretation modal, then the modal renders `interpretation.headline`, `interpretation.stats` as a grid, and `interpretation.body` as markdown.
- Given the contract returns `interpretation.downloads.txt` and `.pdf` (URL or `null`), when the modal renders, then each download button is enabled if its URL is non-null and disabled if `null`.
- Given I dismiss the modal (close button or Escape), when it closes, then keyboard focus returns to the element that opened it.
- Given the interpretation endpoint returns `{ok: false, error: {code, ...}}`, when the modal renders, then it shows `error.code` verbatim and does not synthesize a fallback reading.
- Given the language toggle is switched while the modal is open, when the change is applied, then the modal labels and stat keys update live without re-fetching the interpretation body.

## Derived Requirements

- [REQ-F-fusion-interpretation-endpoint](../requirements/REQ-F-fusion-interpretation-endpoint.md)
- [REQ-F-stable-error-envelope](../requirements/REQ-F-stable-error-envelope.md)
- [REQ-USA-error-code-rendered-verbatim](../requirements/REQ-USA-error-code-rendered-verbatim.md)
