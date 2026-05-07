# REQ-F-fusion-chart-endpoint: `POST /api/public/fusion-chart` returns a Fusion Chart envelope

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-compute-cosmic-signature](../user-stories/US-compute-cosmic-signature.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

`POST /api/public/fusion-chart` accepts a JSON body containing `birthDate` (YYYY-MM-DD), `birthTime` (HH:MM or null), `birthPlace` (string), `language` (`"de" | "en"`), and optional `timezone` (IANA string or null). On success it returns `{ ok: true, chartSessionId: string, chart: { sunSign, moonSign, ascendant, baziYearAnimal, baziDaymaster, dominantElement, coherenceIndex, wuXing: {wood, fire, earth, metal, water}, cosmicSignature, computedAt } }` per the public contract in `contracts/public-api.md`.

## Acceptance Criteria

- Given a valid request body, when the endpoint is called, then the response is HTTP 200 with `ok: true` and a `chart` object containing every contract field.
- Given a missing required field (`birthDate`, `birthTime`, `birthPlace`, `language`), when the endpoint is called, then HTTP 400 is returned with `error.code: VALIDATION_ERROR` and the offending `field`.
- Given `chart.coherenceIndex`, when the response is rendered, then it is a number in `[0, 1]`.
- Given `chart.wuXing`, when the response is rendered, then it has exactly the five keys `wood`, `fire`, `earth`, `metal`, `water` summing to ~1.0 (±0.01).
