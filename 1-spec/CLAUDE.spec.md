Phase-specific instructions for the **Specification** phase. Extends [../CLAUDE.md](../CLAUDE.md).

## Purpose

This phase defines **what** we're building and **why**. Focus on clarity, measurability, and alignment with stakeholder needs.

## Phase artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| Stakeholders | [`stakeholders.md`](stakeholders.md) | Roles with interests and influence |
| Goals | [`goals/`](goals/) | High-level outcomes |
| User Stories | [`user-stories/`](user-stories/) | User-facing capabilities |
| Requirements | [`requirements/`](requirements/) | Testable system requirements |
| Assumptions | [`assumptions/`](assumptions/) | Beliefs taken as true but not verified |
| Constraints | [`constraints/`](constraints/) | Hard limits on design and implementation |

---

## AI Guidelines

### Per-artifact guidance

**Stakeholders**: ask who uses, funds, operates, or is affected by the system. Record influence level honestly — it drives conflict resolution. Add entries to [`stakeholders.md`](stakeholders.md).

**Goals**: decompose vague ideas into concrete, measurable outcomes. Use MoSCoW priority consistently.
Status lifecycle: `Draft → Approved → Achieved → Deprecated`. Only a human can approve or deprecate. The agent marks `Achieved` when all success criteria are met (linked requirements implemented).

**User Stories**: use "As a [role], I want [capability], so that [benefit]." The role must be an existing stakeholder ID. Acceptance criteria at the story level are high-level; detailed criteria live in requirements.
Status lifecycle: `Draft → Approved → Implemented → Deprecated`. Only a human can approve or deprecate. The agent marks `Implemented` when all linked requirements reach `Implemented`.

**Requirements**: use clear, testable language (not "should be fast" — use "response time < 200ms at p95"). Choose the correct requirement class.
Requirement classes: `REQ-F` Functional, `REQ-PERF` Performance, `REQ-SEC` Security, `REQ-REL` Reliability, `REQ-USA` Usability, `REQ-MNT` Maintainability, `REQ-PORT` Portability, `REQ-SCA` Scalability, `REQ-COMP` Compliance.
Status lifecycle: `Draft → Approved → Implemented → Deprecated`. Only a human can approve or deprecate. The agent marks `Implemented` when all linked tasks reach Done.

**Assumptions**: always record the risk level (what happens if wrong?) and a verification plan when possible.
Status lifecycle: `Unverified → Verified | Invalidated`. The agent marks `Verified` when the verification plan confirms the assumption. Only a human can mark `Invalidated` (triggers impact analysis on dependent artifacts).

**Constraints**: consider technical (platforms, dependencies), business (budget, timeline, team size), and operational (hosting, compliance) categories.
Status lifecycle: `Active → Lifted`. Only a human can lift a constraint.

### Conflict resolution

A conflict exists when two or more requirements cannot both be satisfied as stated.

**Never resolve a conflict silently.** Always surface it before acting.

1. **Identify**: note conflicting requirement IDs, source stakeholders, influence levels, and why they are incompatible.
2. **Ask the user**: present what makes them incompatible, stakeholders and influence levels, two or more resolution options, and a recommended option if one is clearly better.
3. **Wait for explicit approval** before modifying any file.
4. **Apply**: update affected requirement files and index rows. Update dependent user stories or goals if affected. Record a decision if the resolution imposes a recurring constraint.
5. **Verify**: no artifacts remain in a conflicting state after resolution.

### Assumption invalidation

When an assumption is found to be wrong or no longer holds:

1. **Identify impact**: list all artifacts (requirements, user stories, decisions) that depend on the invalidated assumption.
2. **Ask the user**: present the invalidated assumption, the affected artifacts, and proposed adjustments or alternatives.
3. **Wait for explicit approval** before modifying any file.
4. **Apply**: change the assumption's Status to `Invalidated`. Update or flag all dependent artifacts as directed.
5. **Verify**: no artifacts remain based on the invalidated assumption without acknowledgment.

### Artifact deprecation

When an artifact (goal, user story, requirement) is no longer relevant:

1. Propose deprecation to the user with rationale and downstream impact.
2. Wait for explicit approval.
3. Change Status to `Deprecated` in the artifact file. Update its index row.
4. Check for dependent artifacts — flag any that reference the deprecated item.

---

## Decisions Relevant to This Phase

| File | Title | Trigger |
|------|-------|---------|
<!-- Add rows as decisions are recorded. File column: [DEC-kebab-name](../decisions/DEC-kebab-name.md) -->

---

## Linking to Other Phases

- Goals, user stories, constraints, assumptions, and requirements are referenced in design documents (`2-design/`)
- Requirements determine the development tasks in `3-code/tasks.md`; each task references the requirements it fulfills
- Acceptance criteria inform test cases (`3-code/`)

---

## Goals Index

| File | Priority | Status | Summary |
|------|----------|--------|---------|
| [GOAL-pre-launch-preview](goals/GOAL-pre-launch-preview.md) | Must-have | Approved | Deployable contract-stable preview running end-to-end without upstream services. |
| [GOAL-bilingual-experience](goals/GOAL-bilingual-experience.md) | Must-have | Approved | Full DE/EN content + UI parity with live language switching. |
| [GOAL-collect-waitlist-signups](goals/GOAL-collect-waitlist-signups.md) | Must-have | Approved | Consenting newsletter signup with stable error codes for missing consent / invalid email. |
| [GOAL-honest-reflection-framing](goals/GOAL-honest-reflection-framing.md) | Must-have | Approved | No fabricated data in production; copy frames reflection, not prediction. |
| [GOAL-real-provider-integration](goals/GOAL-real-provider-integration.md) | Should-have | Approved | Drop-in switch to live providers without contract or frontend changes. |
| [GOAL-accessible-chart-tiles](goals/GOAL-accessible-chart-tiles.md) | Should-have | Approved | Keyboard + screen-reader access for the six chart tiles. |
<!-- Add rows as goals are created. File column: [GOAL-kebab-name](goals/GOAL-kebab-name.md) -->

---

## User Stories Index

| File | Role | Priority | Status | Summary |
|------|------|----------|--------|---------|
| [US-compute-cosmic-signature](user-stories/US-compute-cosmic-signature.md) | Prospective user | Must-have | Approved | Enter birth data and receive the full Fusion Chart (six tiles + Wu-Xing). |
| [US-provisional-without-birth-time](user-stories/US-provisional-without-birth-time.md) | Prospective user | Must-have | Approved | Submit without birth time; ascendant rendered as provisional. |
| [US-read-fusion-interpretation](user-stories/US-read-fusion-interpretation.md) | Prospective user | Must-have | Approved | Open the interpretation modal with headline, stats, body markdown, and downloads. |
| [US-switch-language](user-stories/US-switch-language.md) | Prospective user | Must-have | Approved | Switch DE ↔ EN at any point with live ARIA + tooltip update. |
| [US-subscribe-with-consent](user-stories/US-subscribe-with-consent.md) | Newsletter subscriber | Must-have | Approved | Submit email + consent and receive a localized confirmation envelope. |
| [US-keyboard-explore-tiles](user-stories/US-keyboard-explore-tiles.md) | Prospective user (keyboard / AT) | Should-have | Approved | Tab through the six chart tiles; localized ARIA + tooltip; Escape dismiss. |
| [US-operator-deploy-preview](user-stories/US-operator-deploy-preview.md) | Project owner | Must-have | Approved | Deploy preview to Railway and pass `PUBLIC_API_BASE_URL=… npm run smoke`. |
| [US-operator-flip-to-live](user-stories/US-operator-flip-to-live.md) | Project owner | Should-have | Approved | Flip to live providers via env-only configuration; envelope unchanged. |
| [US-honest-failure-on-outage](user-stories/US-honest-failure-on-outage.md) | Privacy / compliance owner | Must-have | Approved | Production upstream failures surface as structured errors, never silent fixture fallback. |
<!-- Add rows as user stories are created. File column: [US-kebab-name](user-stories/US-kebab-name.md) -->

---

## Requirements Index

| File | Type | Priority | Status | Summary |
|------|------|----------|--------|---------|
| [REQ-F-stable-error-envelope](requirements/REQ-F-stable-error-envelope.md) | Functional | Must-have | Approved | `{ok, error?:{code,message,field?}}` envelope with stable ALL_CAPS codes. |
| [REQ-F-fusion-chart-endpoint](requirements/REQ-F-fusion-chart-endpoint.md) | Functional | Must-have | Approved | `POST /api/public/fusion-chart` returns the contract chart envelope. |
| [REQ-F-fusion-interpretation-endpoint](requirements/REQ-F-fusion-interpretation-endpoint.md) | Functional | Must-have | Approved | `POST /api/public/fusion-interpretation` returns the contract interpretation envelope. |
| [REQ-F-newsletter-signup-endpoint](requirements/REQ-F-newsletter-signup-endpoint.md) | Functional | Must-have | Approved | `POST /api/public/newsletter-signup` confirms a consenting subscription. |
| [REQ-F-null-birth-time-accepted](requirements/REQ-F-null-birth-time-accepted.md) | Functional | Must-have | Approved | Chart endpoint accepts `birthTime: null` and renders ascendant as provisional. |
| [REQ-F-fufire-chart-mapping](requirements/REQ-F-fufire-chart-mapping.md) | Functional | Must-have | Approved | FuFirE provider maps the chart contract to the upstream `/chart` schema exactly. |
| [REQ-F-stub-mode-toggle](requirements/REQ-F-stub-mode-toggle.md) | Functional | Must-have | Approved | `PUBLIC_API_STUB_MODE` switches between fixture and live modes by env-var only. |
| [REQ-F-config-validation-live](requirements/REQ-F-config-validation-live.md) | Functional | Must-have | Approved | Missing live env vars fail startup with `CONFIGURATION_ERROR` listing every variable. |
| [REQ-F-envelope-byte-compat](requirements/REQ-F-envelope-byte-compat.md) | Functional | Should-have | Approved | Stub-mode and live-mode envelopes are byte-compatible in shape. |
| [REQ-F-no-fixture-fallback-in-prod](requirements/REQ-F-no-fixture-fallback-in-prod.md) | Functional | Must-have | Approved | Service layer must not return fixture data when `stubMode === false`. |
| [REQ-F-language-toggle-live](requirements/REQ-F-language-toggle-live.md) | Functional | Must-have | Approved | Language toggle updates the entire UI live, without page reload. |
| [REQ-F-idempotent-newsletter-signup](requirements/REQ-F-idempotent-newsletter-signup.md) | Functional | Should-have | Approved | Repeated signup with same email is graceful; no duplicate records. |
| [REQ-REL-explicit-provider-failure](requirements/REQ-REL-explicit-provider-failure.md) | Reliability | Must-have | Approved | Production provider failures surface as structured errors, never silently. |
| [REQ-SEC-consent-required](requirements/REQ-SEC-consent-required.md) | Security | Must-have | Approved | Newsletter signup requires explicit `consent: true`. |
| [REQ-SEC-no-pii-in-logs](requirements/REQ-SEC-no-pii-in-logs.md) | Security | Must-have | Approved | Logs and `error.message` strings must not contain user PII. |
| [REQ-USA-i18n-de-en-parity](requirements/REQ-USA-i18n-de-en-parity.md) | Usability | Must-have | Approved | All visible UI text exists in both DE and EN with full parity. |
| [REQ-USA-error-code-rendered-verbatim](requirements/REQ-USA-error-code-rendered-verbatim.md) | Usability | Must-have | Approved | Frontend renders backend `error.code` verbatim; no synthesized fallback. |
| [REQ-USA-keyboard-accessible-tiles](requirements/REQ-USA-keyboard-accessible-tiles.md) | Usability | Should-have | Approved | Six chart tiles are keyboard-focusable with live-localized ARIA + Escape dismiss. |
| [REQ-USA-no-8px-essential-text](requirements/REQ-USA-no-8px-essential-text.md) | Usability | Should-have | Approved | No essential UI text uses `font-size: 8px`. |
| [REQ-USA-editorial-framing-reflection](requirements/REQ-USA-editorial-framing-reflection.md) | Usability | Must-have | Approved | Frontend microcopy uses reflection-oriented phrasing, not prediction-asserting; verified via forbidden-phrase grep + manual editorial review. |
| [REQ-MNT-railway-deploy-conformance](requirements/REQ-MNT-railway-deploy-conformance.md) | Maintainability | Must-have | Approved | Server complies with Railway deployment conventions (`PORT`, `HOST`, `/healthz`, single process). |
| [REQ-MNT-smoke-against-public-url](requirements/REQ-MNT-smoke-against-public-url.md) | Maintainability | Should-have | Approved | Smoke harness can target a deployed URL via `PUBLIC_API_BASE_URL`. |
| [REQ-COMP-stub-mode-prod-disabled](requirements/REQ-COMP-stub-mode-prod-disabled.md) | Compliance | Must-have | Approved | Production environments must not run with `PUBLIC_API_STUB_MODE=true`. |
<!-- Add rows as requirements are created. File column: [REQ-CLASS-kebab-name](requirements/REQ-CLASS-kebab-name.md) -->

---

## Assumptions Index

| File | Category | Status | Risk | Summary |
|------|----------|--------|------|---------|
| [ASM-fufire-api-available](assumptions/ASM-fufire-api-available.md) | Technology | Unverified | High | FuFirE/BAFE chart engine reachable with documented `/chart` schema at launch. |
| [ASM-interpretation-vendor-selectable](assumptions/ASM-interpretation-vendor-selectable.md) | Business | Unverified | Medium | A Gemini or equivalent proxy interpretation vendor will be procurable at acceptable terms. |
| [ASM-newsletter-vendor-gdpr-compliant](assumptions/ASM-newsletter-vendor-gdpr-compliant.md) | Regulatory | Unverified | Medium | A GDPR-compliant newsletter vendor with double opt-in + JSON API will be selected before launch. |
| [ASM-geocoding-vendor-affordable](assumptions/ASM-geocoding-vendor-affordable.md) | Business | Unverified | Medium | A geocoding + timezone vendor will be affordable at expected pre-launch traffic. |
| [ASM-de-en-covers-target-audience](assumptions/ASM-de-en-covers-target-audience.md) | Business | Unverified | Low | German + English together cover the pre-launch / early-launch audience. |
<!-- Add rows as assumptions are created. File column: [ASM-kebab-name](assumptions/ASM-kebab-name.md) -->

---

## Constraints Index

| File | Category | Status | Summary |
|------|----------|--------|---------|
| [CON-active-frontend-public-index](constraints/CON-active-frontend-public-index.md) | Technical | Active | Single active frontend in `public/index.html`; no bundler or module split. |
| [CON-react-archive-inactive](constraints/CON-react-archive-inactive.md) | Technical | Active | `archive/` is reference-only and not build-ready. |
| [CON-stub-mode-dev-only](constraints/CON-stub-mode-dev-only.md) | Operational | Active | `PUBLIC_API_STUB_MODE=true` is dev/preview only; production must set `false` explicitly. |
| [CON-no-synthesized-data-in-prod](constraints/CON-no-synthesized-data-in-prod.md) | Operational | Active | Production must not synthesize astrology, interpretation, or signup data. |
| [CON-fufire-chart-endpoint](constraints/CON-fufire-chart-endpoint.md) | Technical | Active | FuFirE engine reached at exactly `POST {FUFIRE_BASE_URL}/chart` with frozen payload + response mapping. |
| [CON-no-silent-provider-fallback](constraints/CON-no-silent-provider-fallback.md) | Technical | Active | Production fails closed with a structured error; stub mode is the only allowed fixture path. |
| [CON-same-origin-node-deployment](constraints/CON-same-origin-node-deployment.md) | Operational | Active | Preferred deployment for this iteration: single Node process serving static + API same-origin. |
<!-- Add rows as constraints are created. File column: [CON-kebab-name](constraints/CON-kebab-name.md) -->
