## Language Policy

**All AI outputs must be in English**, regardless of the language used in user prompts. This applies to code, comments, documentation, configuration files, commit messages, and response text.

**Exception — verbatim external snapshots.** Files under `2-design/external-context/` may preserve their original source language when ingested verbatim from upstream (e.g., a third-party API documentation export). The frontmatter's `status: snapshot` field signals this, and the live source-of-truth named in the file's `> Authoritative source` blockquote takes precedence on conflict. Any AI-authored prose in the same directory (introductory notes, summaries) still follows the English rule.

## Memory Policy

**Do not use Claude memory files to store project information**. All project knowledge — domain context, team structure, constraints, decisions, and any other relevant information — must be captured exclusively through the SDLC artifact system (stakeholders, constraints, assumptions, goals, requirements, decisions, etc.). This ensures all knowledge is structured, traceable, and available to every team member working on the project.

---

## Project Overview

**Bazodiac FuFirE Fusion Preview** — pre-launch landing and waitlist for **Bazodiac**, a reflective astrology product that fuses Western astrology, Chinese BaZi, and Wu-Xing element modeling into a single "Cosmic Signature." This repository previews the experience before the real FuFirE / Gemini / newsletter backends come online, so it can be deployed and shared with stakeholders without waiting for the upstream services.

**Active artifacts.**
- `public/index.html` — the entire frontend in one ~100 KB file (HTML/CSS/JS, DE/EN i18n, API client, motion profiles, newsletter flow). No bundler, no build step.
- `server.mjs` — Railway-ready Node adapter using only `node:http` / `node:fs` / `node:path`. Serves the page, exposes `/healthz`, and implements the three public POST endpoints by returning deterministic fixtures from `contracts/fixtures/`.
- `contracts/public-api.md` — frozen public API contract (Iteration 2 surface). `contracts/SMOKE_CHECKLIST.md` — manual contract-test sign-off list.

**Architectural backbone.**
- **Contract-first.** The contract surface and stable `error.code` strings are non-replaceable. The adapter behind them is intentionally replaceable: when the real FuFirE engine, Gemini interpretation, geocoding/timezone, and newsletter services are wired in, the fixture-lookup bodies of the three handlers in `server.mjs` are swapped while paths, envelope shape, and error codes stay identical.
- **Zero runtime dependencies.** Adding an Express/Fastify-style framework is out of scope — the contract is small enough that Node built-ins suffice, and the deployment story (Nixpacks, no lockfile-locked production install) stays simple.
- **No silent client-side fallbacks.** The frontend never synthesizes data on backend failure; it renders the backend's `error.code` verbatim and surfaces a retry path.

**Non-negotiable invariants** (encoded in contract + smoke checklist):
- Response envelope: `{ok: true, …}` or `{ok: false, error: {code, message, field?}}` with stable ALL_CAPS `error.code` strings.
- Wu-Xing units: contract returns five floats in `[0..1]` summing to ~1.0; UI scales to `0..100` for the progress bars.
- `birthTime: null` is valid input ("I don't know my birth time"), not a validation error.
- Out of scope (must NOT exist): `/api/public/waitlist-signup`, queue position, referral codes.
- `archive/` and `uploads/` are reference-only and not build-ready.

Stakeholders + collaborators are to be modeled in `1-spec/stakeholders.md` once the Specification phase starts.

### Current State

**Phase: Code (retrospective / code-derived baseline; forward iteration in progress).**

**Code-derived baseline note.** The Specification phase is being populated *after* implementation, not before. Iteration 1 + Iteration 2 are committed to `origin/main` (commit `7737da9`) and pass all quality gates (`npm run check`, `npm test` — 33 tests, `npm run smoke`). The committed code, `contracts/public-api.md`, `contracts/SMOKE_CHECKLIST.md`, and the two Iteration-2 reports (`BAZODIAC_BACKEND_ITERATION_2_REPORT.md`, `test_results_npm_run_check_passed_npm_test_pa.md`) are the source of truth that artifacts in `1-spec/`, `2-design/`, and `decisions/` document. Treat these artifacts as descriptions of an *existing* system, not as a forward plan — later modifications must not assume the spec preceded the code.

**Implemented baseline (committed to `origin/main`):**
- Modular adapter under `src/{config,errors,http,validation,fixtures,routes/publicApi,services/*,providers/*}.mjs`; thin `server.mjs` bootstrap. Zero runtime dependencies (`node:http`, `node:fs`, `node:path` only).
- Provider boundaries: FuFirE (`POST {FUFIRE_BASE_URL}/v1/fusion`, header `X-API-Key`), geocoding + timezone, Gemini interpretation, newsletter — generic, stub-mode-default.
- Stable error envelope `{ok: bool, error?: {code, message, field?}}` with 13 ALL_CAPS error codes.
- Frontend fixes in `public/index.html`: scrolling unblock, opt-in rich cursor FX (`localStorage.bazodiac.effects=='rich'`), contrast tokens, keyboard-accessible chart-tile tooltips (DE/EN ARIA), provisional ascendant when birth time unknown.
- `archive/uploads-reference/*` consolidates legacy uploads; `.env.example` documents the full provider env-var set.
- Railway-ready via `railway.json` (Nixpacks, healthcheck `/healthz`).

**Specification phase summary** (extended approval round 2026-05-07).
- Stakeholders: 6 defined. Constraints: 7 Active. Assumptions: 5 (1 High-risk Verified 2026-05-08 [ASM-fufire-api-available], 3 Medium Unverified, 1 Low Unverified).
- Goals: **6 Approved (all)** — 4 Must-have + 2 Should-have. User Stories: **9 Approved (all)** — 7 Must-have + 2 Should-have. Requirements: **23 Approved (all)** — 18 Must-have Approved + 5 Should-have Approved. (`REQ-USA-editorial-framing-reflection` re-approved 2026-05-08 by `STK-founder` after pivot rewrite — new acceptance criteria match the shipped editorial-voice doc + soft-hint linter implementation.)
- New requirement created 2026-05-07: [`REQ-USA-editorial-framing-reflection`](1-spec/requirements/REQ-USA-editorial-framing-reflection.md) — formalizes the editorial intent of `GOAL-honest-reflection-framing` via forbidden-phrase + reflection-token review. Closes prior gap finding `I-1`.
- Approval rationale: code-derived baseline — Approved requirements describe behaviour already shipped in `origin/main` commit `7737da9` and verified by the 33-test suite, except (a) `REQ-USA-editorial-framing-reflection` (formalizes existing copy + adds a forward `scripts/check-editorial-framing.mjs` task) and (b) Should-have reqs under `GOAL-real-provider-integration` (`REQ-F-envelope-byte-compat`, `REQ-F-idempotent-newsletter-signup`) which describe the live-mode contract that has not yet been exercised against real providers.
- Gap analysis (2026-05-08, post-pivot, post-re-approval): **0 Critical, 1 Important, 4 Minor.** Important: `ASM-fufire-api-available` (High-risk Unverified) — verification requires live FuFirE engine, which is the inherent subject of `GOAL-real-provider-integration` (Phase 2/3/4 of the implementation plan). Minor: 3 Medium-risk Unverified vendor assumptions (interpretation, newsletter, geocoding) + 1 Low-risk assumption (`ASM-de-en-covers-target-audience`). Prior `I-1` editorial-framing finding is **closed** by `REQ-USA-editorial-framing-reflection`. Stale flag removed; findings unchanged from 2026-05-07 because the REQ rewrite affected acceptance-criteria wording, not goal coverage or stakeholder traceability. Spec → Design gate is now formally clean. (stale — 1 ASM verified, 1 constraint downgraded since)

**Design phase progress.**
- Architecture (`2-design/architecture.md`): drafted 2026-05-07, **coverage updated 2026-05-07 (v2)** for newly-Approved Should-haves + `REQ-USA-editorial-framing-reflection`. Documents the as-built two-mode (stub/live) same-origin Node adapter with three internal layers (route → service → provider). All 23 Approved requirements mapped to implementation files; all 7 Active constraints respected; 5 Unverified assumptions flagged as design risks; `## Architectural Decisions` section indexes the 4 Active recorded DECs (the deprecated `DEC-data-as-fenced-markdown-blocks` was removed from this index in the editorial-framing pivot).
- Data Model (`2-design/data-model.md`): drafted 2026-05-07. No persistence — system is a DTO-catalog with invariants. Documents `ChartRequest`, `FusionChart`, `WuXing`, `InterpretationRequest`, `FusionInterpretation`, `NewsletterSignupRequest`, `NewsletterSubscription`, `ErrorEnvelope`; the Public ↔ FuFirE schema mapping; identifier conventions; lifecycle. No update needed in v2 (new reqs are Microcopy/CSS/test-infra, not DTO-shape).
- API Design (`2-design/api-design.md`): drafted 2026-05-07, **updated 2026-05-07 (v2)** with `## Smoke Testing` section + 3 new Coverage rows. References `contracts/public-api.md` as authoritative schema; documents HTTP conventions, envelope discriminator (`ok`), status-code-to-error-code mapping, idempotency profiles, versioning policy, validation rules, provider-failure semantics, smoke testing, analytics, rate-limiting policy.
- Decisions: 5 Active + 1 Deprecated — [`DEC-layered-adapter`](decisions/DEC-layered-adapter.md), [`DEC-zero-runtime-deps`](decisions/DEC-zero-runtime-deps.md), [`DEC-frozen-error-codes`](decisions/DEC-frozen-error-codes.md), [`DEC-same-origin-monolith`](decisions/DEC-same-origin-monolith.md), [`DEC-fufire-baseline`](decisions/DEC-fufire-baseline.md). Deprecated 2026-05-07: [`DEC-data-as-fenced-markdown-blocks`](decisions/DEC-data-as-fenced-markdown-blocks.md) (in editorial-framing pivot — first instance deleted, no current instance). Indexed in `1-spec/CLAUDE.spec.md` (1 entry), `2-design/CLAUDE.design.md` (5 entries), `4-deploy/CLAUDE.deploy.md` (3 entries), and per-component `CLAUDE.component.md` files (frontend: 2; adapter: 5).
- Component decomposition: **2 components** — [`frontend`](3-code/frontend/CLAUDE.component.md) (HTML/CSS/JS in `public/index.html`, 7 reqs after editorial-framing addition) + [`adapter`](3-code/adapter/CLAUDE.component.md) (Node.js zero-deps, 17 reqs). All component req tables now show Approved status (Draft annotations removed in v2).
- **Completeness assessment (2026-05-08, post-pivot, post-re-approval): 0 Critical, 1 Important, 1 Minor.** Important: `ASM-fufire-api-available` (High, Unverified) — verifiable only via Phase 4 live test against the FuFirE engine. Minor: 3 Medium-risk Unverified vendor assumptions (interpretation, newsletter, geocoding) — resolved in Phase 2 vendor selection. Findings unchanged from 2026-05-07 v2; staleness was about assessment date, not underlying conditions. Design → Code gate **fully clean** (0 Critical + fresh). (stale — 1 new decision, 1 constraint downgraded since)

**Implementation plan created (2026-05-07).** [`3-code/tasks.md`](3-code/tasks.md): **22 tasks across 4 phases**.
- Phase 1 — Editorial framing tooling (6 tasks, P1): closes `GOAL-honest-reflection-framing` I-1 gap; builds `scripts/check-editorial-framing.mjs` with versioned lexicon.
- Phase 2 — Vendor selection (6 tasks, P2): 4 vendor `DEC-*` decisions + assumption linkage. Research-only, no code changes.
- Phase 3 — Live-mode integration (6 tasks, P2): wires real FuFirE, geocoding, interpretation, newsletter providers; verifies envelope byte-compat.
- Phase 4 — Production cutover (4 tasks, P2): stub-mode-disabled gate, deployed-URL smoke, assumption verification, go-live runbook.
- 3 of 6 Approved goals (`GOAL-pre-launch-preview`, `GOAL-bilingual-experience`, `GOAL-accessible-chart-tiles`) require no forward tasks — they are pre-implemented at commit `7737da9` and re-verified end-to-end in Phase 4.

**Implementation progress: 7 Done / 5 Cancelled / 16 Todo (28 tasks total after pivot expansion). Phase 1 (Editorial framing tooling) complete; next active phase is Phase 2 — Vendor selection.**
- 2026-05-07: `TASK-define-editorial-lexicon` Done — `4-deploy/runbooks/editorial-framing-lexicon.md` written (subsequently deleted in 2026-05-07 editorial-framing pivot). At the time, source of truth for the editorial-framing check (4 fenced code blocks with DE+EN forbidden phrases and reflection tokens). Superseded by `1-spec/editorial-voice.md` per `docs/plans/2026-05-07-editorial-framing-pivot-design.md`.
- 2026-05-07: Code-review fix-up batch — recorded `DEC-data-as-fenced-markdown-blocks`, added `.github/CODEOWNERS`, added lexicon back-link in `REQ-USA-editorial-framing-reflection`, hardened lexicon's "How the check works" section (canonical path, whitespace contract, loud-failure clause). Closes 3 Important + 1 Minor finding from the post-task code review.
- 2026-05-07: Editorial-framing pivot — replaced forbidden-phrase blacklist (TASK-define-editorial-lexicon and Phase 1 Tasks 14-18) with editorial-voice doc + soft-hint linter. New artefacts: `1-spec/editorial-voice.md`, `scripts/check-editorial-voice.mjs`, `tests/editorial-voice.test.mjs`, `npm run editorial-hints`. Deleted: `4-deploy/runbooks/editorial-framing-lexicon.md`. Deprecated: `DEC-data-as-fenced-markdown-blocks`. REQ-USA-editorial-framing-reflection rewritten + reverted to Draft (needs founder re-approval). See [`docs/plans/2026-05-07-editorial-framing-pivot-design.md`](docs/plans/2026-05-07-editorial-framing-pivot-design.md).
- 2026-05-08: Phase 1 documentation closed — created [`3-code/frontend/README.md`](3-code/frontend/README.md) (copy-change workflow, watchword update process, DE/EN parity rules), [`3-code/adapter/README.md`](3-code/adapter/README.md) (build/run/test commands, env-var reference, decision triggers), [`4-deploy/runbooks/editorial-review-process.md`](4-deploy/runbooks/editorial-review-process.md) (5-step manual review procedure, classification rubric, troubleshooting). Closes `TASK-document-editorial-voice-frontend` and `TASK-phase-1-manual-testing-pivot`. Phase 1 (Editorial framing tooling) is now fully Done; Phase 2 — Vendor selection — is next per [`docs/plans/2026-05-08-phase-2-vendor-selection.md`](docs/plans/2026-05-08-phase-2-vendor-selection.md).
- 2026-05-08: FuFirE alignment — recorded [`DEC-fufire-baseline`](decisions/DEC-fufire-baseline.md) reflecting the deployed BAFE engine (production `https://bafe-2u0e2a.fly.dev`, fallback `https://bafe-production.up.railway.app`, API key tier `ff_pro_*`, selected upstream endpoint `POST /v1/fusion`, strict CORS whitelist) per the verbatim API snapshot at [`2-design/external-context/bafe-api-reference.md`](2-design/external-context/bafe-api-reference.md). Side effects: [`CON-fufire-chart-endpoint`](1-spec/constraints/CON-fufire-chart-endpoint.md) downgraded Approved → Draft (endpoint corrected from `/chart` to `/v1/fusion`, awaiting re-approval); [`ASM-fufire-api-available`](1-spec/assumptions/ASM-fufire-api-available.md) upgraded Unverified → Verified, resolved by `DEC-fufire-baseline`; `TASK-decide-fufire-deployment` marked Done; `TASK-decide-interpretation-vendor` and `TASK-decide-geocoding-vendor` briefings rewritten (BAFE provides interpretation natively via `/v1/experience/daily` and accepts `birth.lat`/`birth.lon` directly, so both vendor decisions need re-evaluation against the FuFirE-native baseline before vendor research begins); [`2-design/CLAUDE.design.md`](2-design/CLAUDE.design.md) gains an External-context discoverability entry for the snapshot. Phase-index counts updated; 40/40 tests still pass (no source code touched). See [`docs/plans/2026-05-08-phase-2-fufire-alignment-design.md`](docs/plans/2026-05-08-phase-2-fufire-alignment-design.md). Spec compliance follow-up: [`REQ-F-fufire-chart-mapping`](1-spec/requirements/REQ-F-fufire-chart-mapping.md) was also downgraded Approved → Draft (its title and acceptance criteria were rewritten `/chart` → `/v1/fusion` in the same commit and require re-approval by `STK-upstream-provider-maintainers`); residual `/chart schema` reference in `2-design/architecture.md` Design Risks corrected to `/v1/fusion`.

**SDLC scaffold:** pangon/ai-sdlc-scaffold installed in `1-spec/`, `2-design/`, `3-code/`, `4-deploy/`, `decisions/`.

---

## Phase-Specific Instructions

Each phase directory contains a `CLAUDE.<phase>.md` file. When working in a phase:

1. Read the phase-specific instructions — they extend (not override) this file
2. Consult the decisions index in that phase file before starting work (for the Code phase, decisions indexes are in each component's `CLAUDE.component.md`, not in `CLAUDE.code.md`)
3. Work within the appropriate phase structure

| Phase | Directory | Focus |
|-------|-----------|-------|
| **Specification** | `1-spec/` | Define what to build and why |
| **Design** | `2-design/` | Define how to build it |
| **Code** | `3-code/` | Build it |
| **Deploy** | `4-deploy/` | Ship and operate it |

### Cross-Skill Artifact Procedures

Any modification to phase artifacts — whether performed inside a skill, during a free-prompt conversation, or as a side effect of any other task — must follow the authoritative procedures for that phase:

- **Specification artifacts** (`1-spec/`): follow the procedures in [`.claude/skills/SDLC-elicit/SKILL.md`](.claude/skills/SDLC-elicit/SKILL.md) — including traceability rules, status downgrade on modification, index synchronization, bidirectional link maintenance, and Current State tracking.
- **Design artifacts** (`2-design/`): follow the procedures in [`.claude/skills/SDLC-design/SKILL.md`](.claude/skills/SDLC-design/SKILL.md) — including downstream effect checks, decision recording triggers, requirement coverage verification, and Current State tracking.
- **Code phase task artifacts** (`3-code/tasks.md`): follow the procedures in [`.claude/skills/SDLC-implementation-plan/SKILL.md`](.claude/skills/SDLC-implementation-plan/SKILL.md) — including phased task grouping, traceability links, incremental deployability, and Current State tracking.

### Phase Gates

Before creating artifacts in the next phase, check these minimum preconditions. Gates are advisory — warn the user if not met, but proceed if they confirm.

| Transition | Preconditions |
|------------|---------------|
| Spec → Design | Stakeholders defined; at least one goal Approved; at least one requirement Approved; gap analysis recorded in Current State and fresh (not stale, no Critical gaps) |
| Design → Code | All design documents drafted (`architecture.md`, `data-model.md`, `api-design.md`); completeness assessment recorded in Current State and fresh (not stale, no Critical findings); components identified (per-component directories in `3-code/`) |

There is no gate between Code and Deploy. Deploy activities (deployments, runbooks, infrastructure setup) can happen at any time during the Code phase.

---

## Artifacts

All project knowledge is captured as structured markdown files alongside the source code. This gives AI agents the full context that human developers would normally carry in their heads or scattered across external tools, and creates a traceability chain from business goals to deployed code.

### Types and locations

| Prefix | Artifact | Location |
|--------|----------|----------|
| `GOAL` | Goals | `1-spec/goals/` |
| `US` | User Stories | `1-spec/user-stories/` |
| `REQ-CLASS` | Requirements | `1-spec/requirements/` |
| `ASM` | Assumptions | `1-spec/assumptions/` |
| `CON` | Constraints | `1-spec/constraints/` |
| `STK` | Stakeholders | `1-spec/stakeholders.md` (rows) |
| `TASK` | Tasks | `3-code/tasks.md` (rows) |
| `DEC` | Decisions | `decisions/` |

### Naming

All artifact IDs use the pattern `PREFIX-kebab-name` — a type prefix followed by a descriptive kebab-case name. The descriptive name **is** the unique identifier (e.g., `DEC-use-postgres`, `REQ-F-search-by-name`). There are no numeric sequences, to avoid ID collisions when working on parallel branches.

### Phase indexes

Every `CLAUDE.<phase>.md` file contains index tables listing the artifacts in that phase. Each index must include a **File column** with a relative link to the artifact file, so that AI agents can discover the file name and human reviewers can navigate easily.

---

## Graduated Safeguards

AI agents operate autonomously within development tasks. For project-level decisions, the scaffold defines three tiers:

| Tier | When | Agent behavior |
|------|------|----------------|
| **Always ask** | Conflict resolution, design gaps, decision deprecation/supersession, phase gate advancement | Stop, present options, wait for human approval |
| **Ask first time, then follow precedent** | Naming conventions, error handling patterns, test structure | Ask once, record the decision, apply consistently afterward |
| **Decide and record** | Routine implementation choices within established patterns | Decide autonomously, record in the appropriate artifact |

When spotting a related issue, potential improvement, or ambiguous situation during a task, **surface it to the user** instead of silently deciding to act or not act.

---

## Decisions

Decisions live in `decisions/`. Each decision has two files:

- **`DEC-kebab-name.md`** — the active record (context, decision, enforcement). Read during normal task execution.
- **`DEC-kebab-name.history.md`** — the trail (alternatives, reasoning, changelog). Read only when evaluating or changing a decision.

Each `CLAUDE.<phase>.md` contains a decisions index with trigger conditions. A decision may appear in multiple phase indexes.

### How to use decisions during tasks

1. Consult the decisions index in the current phase's `CLAUDE.<phase>.md`, or in a component-specific `CLAUDE.<component>.md` when working within a specific component.
2. Follow the File column link to read the relevant `DEC-*.md` file.
3. Apply its enforcement rules.

Do **not** modify `*.history.md` except to append to the changelog.

### Recording, deprecating, or superseding decisions

When a significant decision, pattern, or constraint emerges, record it as a new decision. For the recording procedure, as well as deprecation and supersession, see [`decisions/PROCEDURES.md`](decisions/PROCEDURES.md).

---

## After Making Changes

Evaluate whether to:

1. **Update this file** if project-wide patterns or architecture change significantly.
2. **Update phase-specific files** (`CLAUDE.<phase>.md`) if phase-specific patterns or conventions are established.
3. **Create new instruction files** if a workflow becomes complex enough to need dedicated guidance.

Proactively suggest these updates when relevant.
