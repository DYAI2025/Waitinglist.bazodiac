# REQ-F-null-birth-time-accepted: Chart endpoint accepts `birthTime: null`

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-provisional-without-birth-time](../user-stories/US-provisional-without-birth-time.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

`POST /api/public/fusion-chart` accepts `birthTime: null` as a valid input ("I don't know my birth time"). When `birthTime` is null, the FuFirE provider request uses a noon fallback (`T12:00:00`) and the response's `chart.ascendant` is set to `null` to signal the provisional state. The frontend renders the ascendant tile with a localized provisional explanation rather than a fabricated sign label.

## Acceptance Criteria

- Given a request with `birthTime: null` and otherwise valid fields, when the endpoint is called, then the response is HTTP 200 with `ok: true` (no `VALIDATION_ERROR` for `birthTime`).
- Given `birthTime: null`, when the chart is computed, then `chart.ascendant` is `null` in the response.
- Given a request omitting the `birthTime` field entirely, when the endpoint is called, then HTTP 400 is returned with `error.code: VALIDATION_ERROR` and `field: "birthTime"` (presence required, value may be null).
- Given a chart with `ascendant: null`, when the frontend renders it, then the ascendant tile shows the provisional explanation in the active language.
