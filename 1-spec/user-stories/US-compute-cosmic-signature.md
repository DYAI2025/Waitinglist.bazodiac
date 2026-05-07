# US-compute-cosmic-signature: Compute the Cosmic Signature from birth data

**As a** prospective user, **I want** to enter my birth date, time and place and receive a Fusion Chart with sun, moon, ascendant, BaZi year animal, daymaster, dominant element and Wu-Xing distribution, **so that** I can see my Cosmic Signature in one place.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

**Related goals**: [GOAL-pre-launch-preview](../goals/GOAL-pre-launch-preview.md), [GOAL-honest-reflection-framing](../goals/GOAL-honest-reflection-framing.md)

## Acceptance Criteria

- Given valid birth data and `language=de`, when I submit the birth-data form, then the chart card renders all six tiles populated with non-placeholder values and the Wu-Xing bars render at the contract percentages summing to ~100%.
- Given valid birth data and `language=en`, when I submit, then the response labels and any rendered text are in English (English sign names where applicable).
- Given the chart endpoint returns `{ok: false, error: {code, ...}}`, when the response arrives, then no synthesized chart is rendered — the error UI shows `error.code` verbatim and offers a retry.
- Given the chart endpoint times out, when the timeout fires, then the same error UI shows the matching stable code (no fixture fallback in production).

## Derived Requirements

- [REQ-F-fusion-chart-endpoint](../requirements/REQ-F-fusion-chart-endpoint.md)
- [REQ-F-stable-error-envelope](../requirements/REQ-F-stable-error-envelope.md)
- [REQ-USA-error-code-rendered-verbatim](../requirements/REQ-USA-error-code-rendered-verbatim.md)
