# GOAL-honest-reflection-framing: No fabricated data, no horoscope promises

**Description**: Maintain Bazodiac's positioning as a *reflection-framing* product, not a predictive horoscope. The system never serves fabricated astrology data, interpretation text, or signup confirmations to production users; copy avoids deterministic "fate" or "destiny" language.

**Status**: Approved

**Priority**: Must-have

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Success Criteria

- [ ] In production, no endpoint returns fixture data; provider failures surface as `{ ok: false, error: { code, message, field? } }`.
- [ ] The frontend renders backend `error.code` strings verbatim and never synthesizes a fallback reading on its own.
- [ ] User-visible copy in DE and EN frames the experience as *reflection*, not *prediction* (no "your future will…", no "you are destined to…").
- [ ] [`CON-stub-mode-dev-only`](../constraints/CON-stub-mode-dev-only.md) is verifiable in deployment runbooks (the production runbook checks the flag's value before flipping DNS or announcing launch).

## Related Artifacts

- User stories: [US-compute-cosmic-signature](../user-stories/US-compute-cosmic-signature.md), [US-read-fusion-interpretation](../user-stories/US-read-fusion-interpretation.md), [US-honest-failure-on-outage](../user-stories/US-honest-failure-on-outage.md)
- Requirements: [REQ-F-stable-error-envelope](../requirements/REQ-F-stable-error-envelope.md), [REQ-F-fusion-interpretation-endpoint](../requirements/REQ-F-fusion-interpretation-endpoint.md), [REQ-USA-error-code-rendered-verbatim](../requirements/REQ-USA-error-code-rendered-verbatim.md), [REQ-USA-editorial-framing-reflection](../requirements/REQ-USA-editorial-framing-reflection.md), [REQ-REL-explicit-provider-failure](../requirements/REQ-REL-explicit-provider-failure.md), [REQ-F-no-fixture-fallback-in-prod](../requirements/REQ-F-no-fixture-fallback-in-prod.md), [REQ-SEC-no-pii-in-logs](../requirements/REQ-SEC-no-pii-in-logs.md), [REQ-COMP-stub-mode-prod-disabled](../requirements/REQ-COMP-stub-mode-prod-disabled.md)
