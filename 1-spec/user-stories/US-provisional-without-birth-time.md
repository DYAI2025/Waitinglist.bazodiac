# US-provisional-without-birth-time: Receive a chart without a known birth time

**As a** prospective user who does not know my exact birth time, **I want** to mark "I don't know my birth time" and still receive a Fusion Chart with the ascendant flagged as provisional, **so that** I am not locked out of the experience.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

**Related goals**: [GOAL-pre-launch-preview](../goals/GOAL-pre-launch-preview.md), [GOAL-accessible-chart-tiles](../goals/GOAL-accessible-chart-tiles.md)

## Acceptance Criteria

- Given the "I don't know my birth time" checkbox is checked and otherwise valid birth data, when I submit the form, then the request payload sends `birthTime: null` and is accepted (no `VALIDATION_ERROR`).
- Given a successful chart with provisional ascendant, when the chart renders, then five of six tiles show real values and the ascendant tile communicates its provisional state explicitly (visual marker + tooltip), without showing a misleading sign label.
- Given the ascendant tile is provisional, when I focus or hover it, then the tooltip in the active language explains that ascendant requires a birth time and that no value is shown.
- Given I edit the form to add a birth time and re-submit, when the new chart returns, then the ascendant tile renders the computed sign and the provisional marker is removed.

## Derived Requirements

- [REQ-F-null-birth-time-accepted](../requirements/REQ-F-null-birth-time-accepted.md)
- [REQ-F-fusion-chart-endpoint](../requirements/REQ-F-fusion-chart-endpoint.md)
