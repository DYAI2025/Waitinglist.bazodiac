# REQ-F-fusion-interpretation-endpoint: `POST /api/public/fusion-interpretation` returns an interpretation envelope

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-read-fusion-interpretation](../user-stories/US-read-fusion-interpretation.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

`POST /api/public/fusion-interpretation` accepts a body containing `language` (`"de" | "en"`), `chartSessionId` (string), and `chart` (the chart object returned by the chart endpoint). On success it returns `{ ok: true, interpretation: { id, chartSessionId, language, headline, body, stats: [{label, value}, ...], downloads: { txt, pdf }, generatedAt } }` per `contracts/public-api.md`. `downloads.txt` and `downloads.pdf` are either URL strings or `null`; the frontend disables the corresponding download buttons when null.

## Acceptance Criteria

- Given a valid request, when the endpoint is called, then the response is HTTP 200 with `ok: true` and an `interpretation` object containing non-empty `headline` and `body`.
- Given missing `chartSessionId` or `chart`, when the endpoint is called, then HTTP 400 is returned with `error.code: VALIDATION_ERROR` and the offending `field`.
- Given `interpretation.language` and `interpretation.chartSessionId`, when the response is rendered, then they echo the request values exactly.
- Given `interpretation.stats`, when the response is rendered, then it is an array of `{label, value}` objects with at least one entry.
- Given `interpretation.downloads.{txt,pdf}`, when the response is rendered, then each is either a URL string or `null` (no other types).

## Related Assumptions

- [ASM-interpretation-vendor-selectable](../assumptions/ASM-interpretation-vendor-selectable.md) — live-mode delivery of interpretation depends on a procurable vendor.
