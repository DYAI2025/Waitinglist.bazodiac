# CON-no-synthesized-data-in-prod: Production must not synthesize astrology, interpretation, or signup data

**Category**: Operational

**Status**: Active

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

In production, the system must not synthesize astrology data, interpretation text, or subscription confirmations. Every chart, interpretation, and signup confirmation served to a production user must originate from a real upstream provider call (FuFirE for charts, geocoding/timezone for location resolution, the interpretation provider for reading text, the newsletter vendor for signup confirmations).

## Rationale

Bazodiac is positioned as honest reflection-framing rather than entertainment. Returning fabricated astrology data under the framing of a real reading is dishonest, undermines the brand position, and — for newsletter confirmations — violates the lawful-processing expectations attached to consent (the user consented to receive updates from a real subscription, not from a stub).

## Impact

- Service-layer code (`src/services/*.mjs`) must surface a backend-error envelope (`error.code: FUFIRE_UNAVAILABLE` / `INTERPRETATION_UNAVAILABLE` / etc.) when an upstream provider fails.
- The fixture-fallback path (`loadFixture(...)` in service code) is permitted **only** when `config.stubMode === true`.
- Implies the requirement [REQ-F-no-fixture-fallback-in-prod](../requirements/REQ-F-no-fixture-fallback-in-prod.md): the service layer must not fall through to fixtures when `stubMode` is false.
- Closely related to [CON-no-silent-provider-fallback](CON-no-silent-provider-fallback.md), which forbids silent substitution of *any* alternative response source in production.
