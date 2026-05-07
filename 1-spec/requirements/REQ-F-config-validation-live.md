# REQ-F-config-validation-live: Missing live env vars fail startup with `CONFIGURATION_ERROR` listing every missing variable

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-operator-flip-to-live](../user-stories/US-operator-flip-to-live.md)

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

When `PUBLIC_API_STUB_MODE=false`, the adapter's `assertProductionConfig(config)` validates that every required upstream variable is set: `FUFIRE_BASE_URL`, `FUFIRE_API_KEY`, `GEOCODING_API_URL`, `TIMEZONE_API_URL`, `INTERPRETATION_API_URL`, `GEMINI_API_KEY`, `NEWSLETTER_API_URL`. Any missing variable raises a `CONFIGURATION_ERROR` whose message lists **all** missing variables (not just the first), and the server fails to start. Stub mode does not enforce these.

## Acceptance Criteria

- Given `PUBLIC_API_STUB_MODE=false` with one or more required env vars unset, when the server starts, then it raises `CONFIGURATION_ERROR` and the process exits with non-zero status.
- Given multiple missing variables, when the error is raised, then `error.message` lists every missing variable name (comma-separated), not only the first.
- Given `PUBLIC_API_STUB_MODE=true`, when env vars are missing, then startup succeeds (stub mode is allowed without provider credentials).
- Given all required variables are set in live mode, when the server starts, then `assertProductionConfig` returns without throwing.
