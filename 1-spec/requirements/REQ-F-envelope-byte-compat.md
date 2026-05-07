# REQ-F-envelope-byte-compat: Stub-mode and live-mode responses share an identical envelope shape

**Type**: Functional

**Status**: Approved

**Priority**: Should-have

**Source**: [US-operator-flip-to-live](../user-stories/US-operator-flip-to-live.md)

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

For every public endpoint, the response shape served in stub mode and in live mode is byte-compatible: identical envelope keys, identical type signatures, identical nesting. Only the *values* differ (e.g., `chartSessionId`, `chart.sunSign`, `subscription.id`). This guarantees the frontend works against either mode without conditional logic and that smoke tests written against stub mode keep passing against the live deployment.

## Acceptance Criteria

- Given the same valid input, when the chart endpoint is called in stub mode and in live mode, then both responses have the same set of keys at every level of the envelope, with the same types per key.
- Given the same input, when the interpretation endpoint is called in either mode, then `interpretation.headline`, `body`, `stats`, `downloads.{txt,pdf}`, `language`, `chartSessionId`, `id`, `generatedAt` all exist with their contract types.
- Given the smoke test (`scripts/smoke-test.mjs`) runs against a stub-mode deployment, when run again against a live-mode deployment, then it passes without modification (envelope assertions remain valid).
