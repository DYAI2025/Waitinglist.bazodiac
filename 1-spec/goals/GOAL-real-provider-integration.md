# GOAL-real-provider-integration: Drop-in switch to live providers

**Description**: When upstream providers (FuFirE chart engine, geocoding / timezone vendor, Gemini interpretation, newsletter vendor) are ready, flipping `PUBLIC_API_STUB_MODE=false` with valid credentials must make all three public endpoints serve provider-sourced responses, without changing the public contract or the frontend.

**Status**: Approved

**Priority**: Should-have

**Source stakeholder**: [STK-upstream-provider-maintainers](../stakeholders.md)

## Success Criteria

- [ ] Toggling `PUBLIC_API_STUB_MODE=false` with valid credentials makes every public endpoint serve real provider data.
- [ ] The public envelope shape (`{ ok, … }` on success and `{ ok: false, error: { code, message, field? } }` on failure) is byte-compatible between stub mode and live mode.
- [ ] `tests/fufire-provider.test.mjs` continues to pass when the FuFirE schema is exercised against a real instance.
- [ ] Each provider boundary fails closed with a stable `error.code` (`FUFIRE_UNAVAILABLE`, `INTERPRETATION_UNAVAILABLE`, `CONFIGURATION_ERROR`, etc.) when the upstream is unreachable.

## Related Artifacts

- User stories: [US-operator-flip-to-live](../user-stories/US-operator-flip-to-live.md)
- Requirements: [REQ-F-stub-mode-toggle](../requirements/REQ-F-stub-mode-toggle.md), [REQ-F-config-validation-live](../requirements/REQ-F-config-validation-live.md), [REQ-F-envelope-byte-compat](../requirements/REQ-F-envelope-byte-compat.md), [REQ-F-fufire-chart-mapping](../requirements/REQ-F-fufire-chart-mapping.md), [REQ-REL-explicit-provider-failure](../requirements/REQ-REL-explicit-provider-failure.md)
