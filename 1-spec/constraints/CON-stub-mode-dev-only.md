# CON-stub-mode-dev-only: `PUBLIC_API_STUB_MODE=true` is for development and preview only

**Category**: Operational

**Status**: Active

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

`PUBLIC_API_STUB_MODE=true` (the adapter's default in absence of explicit configuration) is permitted only in development, preview, and test environments. Production deployments must explicitly set `PUBLIC_API_STUB_MODE=false` and provide the full set of upstream provider credentials documented in `.env.example`.

## Rationale

In stub mode the adapter returns deterministic fixture data sourced from `contracts/fixtures/*.json`. Serving those responses to real users in production would be deceptive: the same fixed birth chart, the same prerecorded interpretation text, and the same confirmation marker would be returned to every user regardless of input. This conflicts with the product's reflection-framing positioning (see [CON-no-synthesized-data-in-prod](CON-no-synthesized-data-in-prod.md)) and would mislead users into believing they have received a real, personalized reading.

The default-true behavior is intentional for the *preview phase*: it lets the Railway preview deployment run without upstream credentials so stakeholders can review the experience before the FuFirE / Gemini / newsletter integrations are wired up. Lifting the default to `false` is part of the production-launch checklist, not a code change.

Co-driver: [STK-founder](../stakeholders.md) for the operational launch checklist.

## Impact

- Production `.env` must explicitly set `PUBLIC_API_STUB_MODE=false`.
- Deployment runbooks (in `4-deploy/`) must include a verification step for the flag's value before flipping DNS or announcing the launch.
- Smoke tests targeting production (`PUBLIC_API_BASE_URL=https://… npm run smoke`) must assert non-stub responses (e.g., varying `chartSessionId`, real interpretation text).
- Implies the requirement [REQ-COMP-stub-mode-prod-disabled](../requirements/REQ-COMP-stub-mode-prod-disabled.md): a verifiable obligation that production environments fail startup or fail closed if the flag is left on.
