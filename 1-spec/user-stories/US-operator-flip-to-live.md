# US-operator-flip-to-live: Switch from stub mode to live providers via configuration

**As a** project owner, **I want** to set `PUBLIC_API_STUB_MODE=false` with valid provider credentials and have the system serve real provider responses without any code changes, **so that** production launch is a configuration flip rather than a code redeploy.

**Status**: Approved

**Priority**: Should-have

**Source stakeholder**: [STK-founder](../stakeholders.md)

**Related goal**: [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)

## Acceptance Criteria

- Given `PUBLIC_API_STUB_MODE=false` plus all required provider variables (`FUFIRE_BASE_URL`, `FUFIRE_API_KEY`, `GEOCODING_API_URL`, `TIMEZONE_API_URL`, `INTERPRETATION_API_URL`, `GEMINI_API_KEY`, `NEWSLETTER_API_URL`), when the server starts, then `assertProductionConfig` does not throw and the startup log indicates `live mode`.
- Given an env var is missing in live mode, when the server starts, then it fails fast with `CONFIGURATION_ERROR` listing every missing variable.
- Given live mode and reachable providers, when a user submits the chart form, then the response originates from the FuFirE provider and not from `contracts/fixtures/`.
- Given live mode, when a user submits a chart with a known birth time, then the response chart fields conform to the same contract envelope as the stub-mode response (byte-compatible shape, identical key names).
- Given live mode and an unreachable upstream, when a request hits its endpoint, then the response is `{ok: false, error: {code: "FUFIRE_UNAVAILABLE" | "INTERPRETATION_UNAVAILABLE" | …}}` — never a fixture-backed success.

## Derived Requirements

- [REQ-F-stub-mode-toggle](../requirements/REQ-F-stub-mode-toggle.md)
- [REQ-F-config-validation-live](../requirements/REQ-F-config-validation-live.md)
- [REQ-F-envelope-byte-compat](../requirements/REQ-F-envelope-byte-compat.md)
- [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md)
