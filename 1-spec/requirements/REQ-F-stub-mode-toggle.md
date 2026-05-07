# REQ-F-stub-mode-toggle: `PUBLIC_API_STUB_MODE` switches between fixture and live provider modes by env-var only

**Type**: Functional

**Status**: Approved

**Priority**: Must-have

**Source**: [US-operator-flip-to-live](../user-stories/US-operator-flip-to-live.md)

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

The runtime flag `PUBLIC_API_STUB_MODE` controls whether the adapter serves deterministic fixture responses (`true`, default) or invokes upstream provider services (`false`). Switching from stub to live mode is performed entirely by environment variables — no code change, no rebuild, no redeploy of altered code is required, only a service restart with the updated env. The flag is read at startup by `loadConfig()` in `src/config.mjs`.

## Acceptance Criteria

- Given `PUBLIC_API_STUB_MODE=true` (or unset), when the server starts, then service-layer code returns fixture-backed responses for all three public endpoints.
- Given `PUBLIC_API_STUB_MODE=false` plus all required provider env vars, when the server starts, then `loadConfig()` produces `config.stubMode === false` and service-layer code calls the configured providers.
- Given the flag is changed by environment-variable update, when the process is restarted (no code change), then the new behavior takes effect.

## Related Constraints

- [CON-stub-mode-dev-only](../constraints/CON-stub-mode-dev-only.md) — production policy on which value the flag must take.
