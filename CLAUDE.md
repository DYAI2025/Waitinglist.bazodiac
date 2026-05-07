## Language Policy

**All AI outputs must be in English**, regardless of the language used in user prompts. This applies to code, comments, documentation, configuration files, commit messages, and response text.

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

**Phase: Design (retrospective / code-derived baseline).**

**Code-derived baseline note.** The Specification phase is being populated *after* implementation, not before. Iteration 1 + Iteration 2 are committed to `origin/main` (commit `7737da9`) and pass all quality gates (`npm run check`, `npm test` — 33 tests, `npm run smoke`). The committed code, `contracts/public-api.md`, `contracts/SMOKE_CHECKLIST.md`, and the two Iteration-2 reports (`BAZODIAC_BACKEND_ITERATION_2_REPORT.md`, `test_results_npm_run_check_passed_npm_test_pa.md`) are the source of truth that artifacts in `1-spec/`, `2-design/`, and `decisions/` document. Treat these artifacts as descriptions of an *existing* system, not as a forward plan — later modifications must not assume the spec preceded the code.

**Implemented baseline (committed to `origin/main`):**
- Modular adapter under `src/{config,errors,http,validation,fixtures,routes/publicApi,services/*,providers/*}.mjs`; thin `server.mjs` bootstrap. Zero runtime dependencies (`node:http`, `node:fs`, `node:path` only).
- Provider boundaries: FuFirE (`POST {FUFIRE_BASE_URL}/chart`, header `X-API-Key`), geocoding + timezone, Gemini interpretation, newsletter — generic, stub-mode-default.
- Stable error envelope `{ok: bool, error?: {code, message, field?}}` with 13 ALL_CAPS error codes.
- Frontend fixes in `public/index.html`: scrolling unblock, opt-in rich cursor FX (`localStorage.bazodiac.effects=='rich'`), contrast tokens, keyboard-accessible chart-tile tooltips (DE/EN ARIA), provisional ascendant when birth time unknown.
- `archive/uploads-reference/*` consolidates legacy uploads; `.env.example` documents the full provider env-var set.
- Railway-ready via `railway.json` (Nixpacks, healthcheck `/healthz`).

**Specification phase summary** (extended approval round 2026-05-07).
- Stakeholders: 6 defined. Constraints: 7 Active. Assumptions: 5 (1 High-risk, 3 Medium, 1 Low; all Unverified).
- Goals: **6 Approved (all)** — 4 Must-have + 2 Should-have. User Stories: **9 Approved (all)** — 7 Must-have + 2 Should-have. Requirements: **23 Approved (all)** — 18 Must-have + 5 Should-have (Distribution: 12 F, 1 REL, 2 SEC, 5 USA, 2 MNT, 1 COMP).
- New requirement created 2026-05-07: [`REQ-USA-editorial-framing-reflection`](1-spec/requirements/REQ-USA-editorial-framing-reflection.md) — formalizes the editorial intent of `GOAL-honest-reflection-framing` via forbidden-phrase + reflection-token review. Closes prior gap finding `I-1`.
- Approval rationale: code-derived baseline — Approved requirements describe behaviour already shipped in `origin/main` commit `7737da9` and verified by the 33-test suite, except (a) `REQ-USA-editorial-framing-reflection` (formalizes existing copy + adds a forward `scripts/check-editorial-framing.mjs` task) and (b) Should-have reqs under `GOAL-real-provider-integration` (`REQ-F-envelope-byte-compat`, `REQ-F-idempotent-newsletter-signup`) which describe the live-mode contract that has not yet been exercised against real providers.
- Gap analysis (2026-05-07, post-approval): **0 Critical, 1 Important, 4 Minor.** Important: `ASM-fufire-api-available` (High-risk Unverified) — verification requires live FuFirE engine, which is the inherent subject of `GOAL-real-provider-integration` (next iteration). Minor: 3 Medium-risk Unverified vendor assumptions + 1 Low-risk assumption. Prior `I-1` editorial-framing finding is **closed** by `REQ-USA-editorial-framing-reflection`.

**Design phase progress.**
- Architecture (`2-design/architecture.md`): drafted 2026-05-07, **coverage updated 2026-05-07 (v2)** for newly-Approved Should-haves + `REQ-USA-editorial-framing-reflection`. Documents the as-built two-mode (stub/live) same-origin Node adapter with three internal layers (route → service → provider). All 23 Approved requirements mapped to implementation files; all 7 Active constraints respected; 4 Unverified assumptions flagged as design risks; `## Architectural Decisions` section indexes the 4 recorded DECs.
- Data Model (`2-design/data-model.md`): drafted 2026-05-07. No persistence — system is a DTO-catalog with invariants. Documents `ChartRequest`, `FusionChart`, `WuXing`, `InterpretationRequest`, `FusionInterpretation`, `NewsletterSignupRequest`, `NewsletterSubscription`, `ErrorEnvelope`; the Public ↔ FuFirE schema mapping; identifier conventions; lifecycle. No update needed in v2 (new reqs are Microcopy/CSS/test-infra, not DTO-shape).
- API Design (`2-design/api-design.md`): drafted 2026-05-07, **updated 2026-05-07 (v2)** with `## Smoke Testing` section + 3 new Coverage rows. References `contracts/public-api.md` as authoritative schema; documents HTTP conventions, envelope discriminator (`ok`), status-code-to-error-code mapping, idempotency profiles, versioning policy, validation rules, provider-failure semantics, smoke testing, analytics, rate-limiting policy.
- Decisions: 4 Active recorded — [`DEC-layered-adapter`](decisions/DEC-layered-adapter.md), [`DEC-zero-runtime-deps`](decisions/DEC-zero-runtime-deps.md), [`DEC-frozen-error-codes`](decisions/DEC-frozen-error-codes.md), [`DEC-same-origin-monolith`](decisions/DEC-same-origin-monolith.md). Indexed in `2-design/CLAUDE.design.md` (4 entries), `4-deploy/CLAUDE.deploy.md` (2 entries), and per-component `CLAUDE.component.md` files (frontend: 2; adapter: all 4).
- Component decomposition: **2 components** — [`frontend`](3-code/frontend/CLAUDE.component.md) (HTML/CSS/JS in `public/index.html`, 7 reqs after editorial-framing addition) + [`adapter`](3-code/adapter/CLAUDE.component.md) (Node.js zero-deps, 17 reqs). All component req tables now show Approved status (Draft annotations removed in v2).
- **Completeness assessment (2026-05-07 v2): 0 Critical, 1 Important, 1 Minor.** Important: `ASM-fufire-api-available` (High, Unverified) — verification requires live FuFirE engine = subject of `GOAL-real-provider-integration` next iteration. Minor: 3 Medium-risk Unverified vendor assumptions (interpretation, newsletter, geocoding) — verification follows vendor selection. Design → Code gate **fully open**. Next step: `/SDLC-implementation-plan` (substantial forward scope now available).

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
