# Tasks

## Status Legend

| Symbol | Status |
|--------|--------|
| `Todo` | Not started |
| `In Progress` | Currently being worked on |
| `Blocked` | Waiting on a dependency or decision (reason **must** be noted in the Notes column) |
| `Done` | Completed |
| `Cancelled` | No longer needed (reason **must** be noted in the Notes column) |

## Priority Legend

| Priority | Meaning |
|----------|---------|
| `P0` | Infrastructure / cross-cutting — required before feature work |
| `P1` | Implements a Must-have goal |
| `P2` | Implements a Should-have goal |
| `P3` | Implements a Could-have goal |

---

## Task Table

<!-- Req column: links to requirements this task implements (comma-separated), or "-" if none. -->

### Setup & Infrastructure

| ID | Task | Priority | Status | Req | Dependencies | Updated | Notes |
|----|------|----------|--------|-----|--------------|---------|-------|
| TASK-decide-fufire-deployment | Verify FuFirE engine readiness (URL + API key obtainable); record `DEC-fufire-baseline` with deployment rollout pattern | P2 | Todo | [REQ-F-fufire-chart-mapping](../1-spec/requirements/REQ-F-fufire-chart-mapping.md) | - | 2026-05-07 | Verifies `ASM-fufire-api-available` |
| TASK-decide-geocoding-vendor | Compare 2-3 geocoding+timezone vendors (Mapbox, OpenCage, Google) on price + accuracy; record `DEC-geocoding-vendor` | P2 | Todo | - | - | 2026-05-07 | Resolves `ASM-geocoding-vendor-affordable` |
| TASK-decide-interpretation-vendor | Decide interpretation integration (Gemini direct API vs proxy); record `DEC-interpretation-vendor` | P2 | Todo | - | - | 2026-05-07 | Resolves `ASM-interpretation-vendor-selectable` |
| TASK-decide-newsletter-vendor | Compare GDPR-compliant newsletter vendors with double opt-in (Brevo, ConvertKit, Buttondown); record `DEC-newsletter-vendor` | P2 | Todo | - | - | 2026-05-07 | Resolves `ASM-newsletter-vendor-gdpr-compliant` |
| TASK-update-assumption-statuses | Link the 4 `ASM-*` files to their newly-recorded `DEC-*` records; keep status Unverified until live test in Phase 4 | P2 | Todo | - | TASK-decide-fufire-deployment, TASK-decide-geocoding-vendor, TASK-decide-interpretation-vendor, TASK-decide-newsletter-vendor | 2026-05-07 | Bidirectional traceability |
| TASK-mark-assumptions-verified | Update the 4 `ASM-*` to `Status: Verified` with verification date + evidence link, after live smoke is green | P2 | Todo | - | TASK-smoke-deployed-url | 2026-05-07 | Final assumption verification |

### Frontend

| ID | Task | Priority | Status | Req | Dependencies | Updated | Notes |
|----|------|----------|--------|-----|--------------|---------|-------|
| TASK-document-editorial-framing-frontend | Create or extend `3-code/frontend/README.md` with the copy-change workflow: edit `public/index.html` → `npm run check` → fix or extend lexicon | P1 | Cancelled | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-implement-check-editorial-framing | 2026-05-08 | Cancelled: replaced by TASK-document-editorial-voice-frontend (different doc target). |
| TASK-document-editorial-voice-frontend | Update `3-code/frontend/README.md` (or create) with the copy-change workflow: edit public/index.html → optionally `npm run editorial-hints` → consult 1-spec/editorial-voice.md → reviewer sign-off via CODEOWNERS | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-add-editorial-hints-npm-script | 2026-05-08 | Done 2026-05-08: created 3-code/frontend/README.md documenting the copy-change workflow, watchword update process, and DE/EN parity rules. |

### Adapter

| ID | Task | Priority | Status | Req | Dependencies | Updated | Notes |
|----|------|----------|--------|-----|--------------|---------|-------|
| TASK-define-editorial-lexicon | Create `4-deploy/runbooks/editorial-framing-lexicon.md` with versioned DE+EN forbidden-phrase + reflection-token lists | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | - | 2026-05-08 | Superseded by editorial-voice.md in 2026-05-07 pivot. Lexicon file deleted. See docs/plans/2026-05-07-editorial-framing-pivot-design.md. |
| TASK-create-editorial-voice-doc | Create `1-spec/editorial-voice.md` with 4 principles, 6 DE/EN before/after examples, 5 watchwords, governance note | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | - | 2026-05-08 | Pivot supersedes TASK-define-editorial-lexicon. Implemented via pivot plan Task 1. |
| TASK-implement-check-editorial-framing | Build `scripts/check-editorial-framing.mjs` (Node built-ins only) that reads the lexicon, scans `public/index.html`, exits non-zero on forbidden hits | P1 | Cancelled | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-define-editorial-lexicon | 2026-05-08 | Cancelled: editorial-framing pivot replaced by TASK-implement-check-editorial-voice (different script name + different semantics: soft hint, not blacklist). |
| TASK-implement-check-editorial-voice | Build `scripts/check-editorial-voice.mjs` (zero deps, soft hint, exits 0 always on content findings) | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-create-editorial-voice-doc | 2026-05-08 | Pivot supersedes TASK-implement-check-editorial-framing. Implemented via pivot plan Task 3 (TDD green after pivot plan Task 2 red). |
| TASK-test-editorial-framing-script | Add `tests/editorial-framing.test.mjs` with `node:test` cases covering: forbidden detection (DE+EN), reflection-token detection, lexicon parsing, exit codes | P1 | Cancelled | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-implement-check-editorial-framing | 2026-05-08 | Cancelled: replaced by TASK-test-editorial-voice-script. Tests for the new script live in tests/editorial-voice.test.mjs. |
| TASK-test-editorial-voice-script | Add `tests/editorial-voice.test.mjs` covering hint emission, slash-split watchwords, zero-hit, parser loud-failure | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-create-editorial-voice-doc | 2026-05-08 | Pivot supersedes TASK-test-editorial-framing-script. Implemented via pivot plan Task 2 + 3. |
| TASK-wire-editorial-framing-into-check | Integrate the script as a step in `scripts/check.mjs` (or `npm run check` runner) so it gates on every PR | P1 | Cancelled | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-test-editorial-framing-script | 2026-05-08 | Cancelled: editorial-framing pivot removed npm run check wiring. Standalone npm run editorial-hints instead. Replaced by TASK-add-editorial-hints-npm-script. |
| TASK-add-editorial-hints-npm-script | Add `npm run editorial-hints` to package.json (NOT in npm run check) | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-implement-check-editorial-voice | 2026-05-08 | Pivot supersedes TASK-wire-editorial-framing-into-check. Implemented via pivot plan Task 4. |
| TASK-configure-fufire-live | Set `FUFIRE_BASE_URL` + `FUFIRE_API_KEY` in staging env; run `/api/public/fusion-chart` against live FuFirE; assert `mapFufireResponse` mappings hold against real schema | P2 | Todo | [REQ-F-fufire-chart-mapping](../1-spec/requirements/REQ-F-fufire-chart-mapping.md), [REQ-F-fusion-chart-endpoint](../1-spec/requirements/REQ-F-fusion-chart-endpoint.md) | TASK-decide-fufire-deployment | 2026-05-07 | |
| TASK-configure-geocoding-live | Wire `GEOCODING_API_URL` + `GEOCODING_API_KEY` per `DEC-geocoding-vendor`; verify `resolveLocation` returns correct lat/lon/timezone for sample places | P2 | Todo | - | TASK-decide-geocoding-vendor | 2026-05-07 | |
| TASK-configure-interpretation-live | Wire `INTERPRETATION_API_URL` + `GEMINI_API_KEY` per `DEC-interpretation-vendor`; verify `/api/public/fusion-interpretation` produces vendor-generated content | P2 | Todo | [REQ-F-fusion-interpretation-endpoint](../1-spec/requirements/REQ-F-fusion-interpretation-endpoint.md) | TASK-decide-interpretation-vendor | 2026-05-07 | |
| TASK-configure-newsletter-live | Wire `NEWSLETTER_API_URL` + `NEWSLETTER_API_KEY` per `DEC-newsletter-vendor` with double opt-in; verify subscription persists in vendor dashboard | P2 | Todo | [REQ-F-newsletter-signup-endpoint](../1-spec/requirements/REQ-F-newsletter-signup-endpoint.md), [REQ-F-idempotent-newsletter-signup](../1-spec/requirements/REQ-F-idempotent-newsletter-signup.md) | TASK-decide-newsletter-vendor | 2026-05-07 | |
| TASK-verify-envelope-byte-compat-live | Extend `tests/` or `scripts/smoke-test.mjs` to assert byte-compatibility between stub-mode and live-mode envelopes for all 3 endpoints | P2 | Todo | [REQ-F-envelope-byte-compat](../1-spec/requirements/REQ-F-envelope-byte-compat.md) | TASK-configure-fufire-live, TASK-configure-geocoding-live, TASK-configure-interpretation-live, TASK-configure-newsletter-live | 2026-05-07 | |

### Deploy & Operations

| ID | Task | Priority | Status | Req | Dependencies | Updated | Notes |
|----|------|----------|--------|-----|--------------|---------|-------|
| TASK-phase-1-manual-testing | Update `4-deploy/runbooks/editorial-framing-review.md` runbook (manual review steps + expected `npm run check` output); document phase-1 build/run/test commands in `3-code/{frontend,adapter}/README.md` | P1 | Cancelled | - | TASK-wire-editorial-framing-into-check, TASK-document-editorial-framing-frontend | 2026-05-08 | Cancelled: replaced by TASK-phase-1-manual-testing-pivot (different artefacts to manual-test against). |
| TASK-phase-1-manual-testing-pivot | Update `4-deploy/runbooks/editorial-review-process.md` runbook (manual editorial review steps + npm run editorial-hints output explanation); document phase-1 build/run/test commands in `3-code/{frontend,adapter}/README.md` | P1 | Done | - | TASK-document-editorial-voice-frontend | 2026-05-08 | Done 2026-05-08: created 4-deploy/runbooks/editorial-review-process.md (5-step manual review procedure + classification rubric + troubleshooting) and 3-code/adapter/README.md (build/run/test commands incl. npm run editorial-hints + env var reference + decision triggers). |
| TASK-phase-2-manual-testing | Document the 4 vendor-decision rationales in `4-deploy/runbooks/vendor-selection.md` with comparison criteria, selected vendor, and rollout plan per provider | P2 | Todo | - | TASK-update-assumption-statuses | 2026-05-07 | |
| TASK-phase-3-manual-testing | Create `4-deploy/runbooks/live-mode-deployment.md`: env-var checklist, smoke procedure, rollback steps; update `3-code/{frontend,adapter}/README.md` with flip-to-live procedure | P2 | Todo | - | TASK-verify-envelope-byte-compat-live | 2026-05-07 | |
| TASK-runbook-stub-mode-prod-disabled-check | Add a deployment runbook gate to verify `PUBLIC_API_STUB_MODE=false` in production env vars before declaring production live | P2 | Todo | [REQ-COMP-stub-mode-prod-disabled](../1-spec/requirements/REQ-COMP-stub-mode-prod-disabled.md) | TASK-phase-3-manual-testing | 2026-05-07 | Honors `CON-stub-mode-dev-only` |
| TASK-smoke-deployed-url | Run `PUBLIC_API_BASE_URL=https://<railway-domain> npm run smoke` against production; document the run command + expected output in deploy runbook | P2 | Todo | [REQ-MNT-smoke-against-public-url](../1-spec/requirements/REQ-MNT-smoke-against-public-url.md) | TASK-runbook-stub-mode-prod-disabled-check | 2026-05-07 | |
| TASK-phase-4-manual-testing | Final go-live runbook in `4-deploy/runbooks/go-live.md`: pre-flight checklist, cutover sequence, rollback plan, post-cutover smoke; READMEs reflect production-ready state | P2 | Todo | - | TASK-mark-assumptions-verified | 2026-05-07 | |

---

## Execution Plan

Defines the order in which tasks should be executed. Tasks are grouped into phases; complete all tasks in a phase before moving to the next. Within a phase, execute tasks in the listed order (dependencies are encoded in the task table). Each phase ends with a deployable or testable system.

### Phase 1: Editorial framing tooling

**Capabilities delivered:**
- `npm run editorial-hints` (standalone, NOT in `npm run check`) emits non-fatal hints when watchwords appear in `public/index.html`, supporting editorial review (`REQ-USA-editorial-framing-reflection`).
- Editorial-voice document (4 principles + 6 examples + 5 watchwords) lives as a versioned data+prose file in `1-spec/editorial-voice.md`, reviewable per PR via `.github/CODEOWNERS`.
- `GOAL-honest-reflection-framing` Success Criterion "User-visible copy frames experience as reflection, not prediction" is achieved via editorial guideline + soft-hint linter (not mechanical blacklist).

**Tasks:**
1. TASK-create-editorial-voice-doc
2. TASK-test-editorial-voice-script (TDD red)
3. TASK-implement-check-editorial-voice (TDD green)
4. TASK-add-editorial-hints-npm-script
5. TASK-document-editorial-voice-frontend
6. TASK-phase-1-manual-testing-pivot

### Phase 2: Vendor selection

**Capabilities delivered:**
- 4 vendor decisions recorded as `DEC-*` artifacts (FuFirE deployment readiness, geocoding+timezone, interpretation, newsletter).
- 4 unverified Assumptions linked to their resolving decisions; ready to verify when live.
- `GOAL-real-provider-integration` Success Criterion "Toggling `PUBLIC_API_STUB_MODE=false` with valid credentials..." becomes actionable (credentials path exists).

**Tasks:**
1. TASK-decide-fufire-deployment
2. TASK-decide-geocoding-vendor
3. TASK-decide-interpretation-vendor
4. TASK-decide-newsletter-vendor
5. TASK-update-assumption-statuses
6. TASK-phase-2-manual-testing

### Phase 3: Live-mode integration (per-provider wire-up)

**Capabilities delivered:**
- Each of the 4 providers (FuFirE chart, geocoding+timezone, interpretation, newsletter) responds with real data when called.
- `PUBLIC_API_STUB_MODE=false` produces working end-to-end behaviour in a staging environment.
- `REQ-F-envelope-byte-compat`: stub-mode and live-mode envelopes verified byte-compatible by smoke harness.

**Tasks:**
1. TASK-configure-fufire-live
2. TASK-configure-geocoding-live
3. TASK-configure-interpretation-live
4. TASK-configure-newsletter-live
5. TASK-verify-envelope-byte-compat-live
6. TASK-phase-3-manual-testing

### Phase 4: Production cutover & honest-failure verification

**Capabilities delivered:**
- Production deployment runs with `PUBLIC_API_STUB_MODE=false` and real provider credentials (`REQ-COMP-stub-mode-prod-disabled`, `CON-stub-mode-dev-only`).
- `PUBLIC_API_BASE_URL=https://… npm run smoke` passes against the production Railway URL (`REQ-MNT-smoke-against-public-url`).
- All 4 vendor `ASM-*` flip from Unverified → Verified.
- `GOAL-real-provider-integration` Success Criteria all green.
- `GOAL-pre-launch-preview` re-verified end-to-end against production.

**Tasks:**
1. TASK-runbook-stub-mode-prod-disabled-check
2. TASK-smoke-deployed-url
3. TASK-mark-assumptions-verified
4. TASK-phase-4-manual-testing
