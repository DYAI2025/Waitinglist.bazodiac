# REQ-COMP-stub-mode-prod-disabled: Production environments must not run with stub mode enabled

**Type**: Compliance

**Status**: Approved

**Priority**: Must-have

**Source**: [CON-stub-mode-dev-only](../constraints/CON-stub-mode-dev-only.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

Any deployment classified as production (e.g., `NODE_ENV=production`, the customer-facing Railway service, the live DNS target) must have `PUBLIC_API_STUB_MODE=false` and the full set of upstream provider variables configured. Verification is part of the deployment runbook in `4-deploy/`, executed before flipping DNS or announcing launch. Operating production with stub mode is a compliance violation.

## Acceptance Criteria

- Given a production deployment, when its environment configuration is audited, then `PUBLIC_API_STUB_MODE` is set and not equal to `true` (case-insensitively, including aliases `1`, `yes`, `on`).
- Given the deployment runbook is run, when the production-readiness check executes, then it asserts the flag's value and refuses to mark the deployment as production-ready otherwise.
- Given a smoke run against the production URL, when assertions execute, then chart, interpretation, and signup responses contain provider-sourced (non-fixture) content (varying `chartSessionId`, distinct interpretation text per chart, real subscription identifiers).
- Given the runbook detects stub mode in production, when the operator reads the runbook output, then the action item is "set `PUBLIC_API_STUB_MODE=false` and verify provider env vars" — not "ignore and proceed".

## Related Constraints

- [CON-stub-mode-dev-only](../constraints/CON-stub-mode-dev-only.md) — origin of this compliance obligation.
