# DEC-layered-adapter: Layered adapter with stub-mode short-circuit at service layer

**Status**: Active

**Category**: Architecture

**Scope**: backend (`server.mjs` + `src/`)

**Source**: [REQ-F-no-fixture-fallback-in-prod](../1-spec/requirements/REQ-F-no-fixture-fallback-in-prod.md), [REQ-F-stub-mode-toggle](../1-spec/requirements/REQ-F-stub-mode-toggle.md), [REQ-REL-explicit-provider-failure](../1-spec/requirements/REQ-REL-explicit-provider-failure.md)

**Last updated**: 2026-05-07

## Context

The adapter must serve fixtures in stub mode and call upstream providers in live mode, while *never* serving fixtures in live mode. Where the stub/live branch lives determines whether `REQ-F-no-fixture-fallback-in-prod` and `REQ-REL-explicit-provider-failure` are mechanically checkable. A stub branch in the wrong layer (route or provider) creates room for accidental fallback paths that would silently mask production outages.

## Decision

Use a three-layer adapter:

```
src/routes/publicApi.mjs   →   src/services/*.mjs   →   src/providers/*.mjs
```

The single `if (config.stubMode) return await loadFixture(...)` short-circuit lives in the **service** layer only. Routes and providers must be unaware of stub mode. Production code paths return provider results directly without try/catch fallback to fixtures.

## Enforcement

### Trigger conditions

- **Specification phase**: n/a
- **Design phase**: when adding a new endpoint, modifying provider boundaries, or proposing a new fallback mechanism.
- **Code phase**: when implementing a service, provider, or route.
- **Deploy phase**: n/a

### Required patterns

Canonical example — `src/services/fusionChartService.mjs`:

```javascript
export async function computeFusionChart(rawBody, { config }) {
  const input = validateFusionChartRequest(rawBody);
  if (config.stubMode) {
    const fixture = await loadFixture(FIXTURE_NAMES.fusionChartSuccess);
    return fixture;                       // returns BEFORE any provider call
  }
  const location = await resolveLocation({ ... });
  const chart = await callFufire({ ... }, { config });
  return { ok: true, chartSessionId: newSessionId(), chart };
}
```

### Required checks

1. `grep -rn 'stubMode' src/` returns hits only in `src/config.mjs` and `src/services/`. Hits in `src/routes/` or `src/providers/` violate this decision.
2. Provider modules do not import or reference `loadFixture` / `FIXTURE_NAMES`.
3. Service modules contain no `try { return await provider() } catch { return fixture }` pattern — the stub-mode `if` returns *before* any provider call.

### Prohibited patterns

- `try/catch` in services that swallows a provider error and returns a fixture.
- A `stubMode` branch in route handlers or provider modules.
- Default-export of a service that conditionally re-exports fixtures vs providers (defeats grep-based checks).
