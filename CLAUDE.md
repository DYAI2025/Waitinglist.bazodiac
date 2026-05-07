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

**Phase: Code — Iteration 1 deployed; Iteration 2 reported but not present in this repository.**

**Iteration 1 (committed to `origin/main`):**
- Monolithic `server.mjs` (~220 LOC, all three public POST handlers inline; static + SPA fallback; CORS preflight; download endpoints).
- Static checks (`npm run check`): inline-script syntax, duplicate HTML IDs, `node --check server.mjs`.
- End-to-end smoke (`npm run smoke`): boots server on `127.0.0.1:4173`, posts every fixture, asserts `CONSENT_REQUIRED`, `MALFORMED_JSON`, and CORS preflight.
- Railway-ready via `railway.json` (Nixpacks, healthcheck `/healthz`, retry on failure).

**Iteration 2** (described in two external reports — `~/Downloads/BAZODIAC_BACKEND_ITERATION_2_REPORT.md` and a FlashDocs MD export — but **not in the repository** as of this commit):
- Modular decomposition under `src/`: `app.mjs`, `config.mjs`, `errors.mjs`, `http.mjs`, `validation.mjs`, `fixtures.mjs`, `routes/publicApi.mjs`, `services/*`, `providers/*`.
- `tests/` directory with 23 tests (`fixtures`, `public-api`, `fufire-provider`, `frontend-compatibility`) plus an `npm test` script.
- Real provider boundaries: FuFirE (`POST {FUFIRE_BASE_URL}/chart`, header `X-API-Key`), geocoding/timezone, Gemini interpretation, newsletter.
- `.env.example` covering `PUBLIC_API_STUB_MODE`, `FUFIRE_*`, `GEOCODING_API_*`, `TIMEZONE_API_*`, `INTERPRETATION_API_*`, `GEMINI_API_KEY`, `NEWSLETTER_API_*`.
- Frontend fixes: scrolling unblock (`body`, `.shell`), opt-in rich cursor FX via `localStorage.setItem('bazodiac.effects', 'rich')`, contrast tokens (`--fg-muted`, `--fg-subtle`), keyboard-accessible chart-tile tooltips (DE/EN ARIA), provisional ascendant when birth time unknown.
- `archive/uploads-reference/*` consolidation.

**Open block:** the Iteration 2 source code has not been located — not in this repository, not in the (already merged) `codex/review-architecture-and-fix-bugs` branch, not in `Waiting_list (5).zip`, and not in either source report (both contain only narrative status, no `*.mjs` files). Resolving where this code lives — another machine, an unpushed branch, or work that has not actually been executed yet — is a precondition for accurately populating Specification and Code-phase artifacts.

**SDLC scaffold installed:** `1-spec/`, `2-design/`, `3-code/`, `4-deploy/`, `decisions/` are populated with the pangon/ai-sdlc-scaffold template skeleton (only `_template.md`, `PROCEDURES.md`, and `CLAUDE.<phase>.md` index files). Next step: `/SDLC-elicit` to populate the Specification phase, once the Iteration 2 code disconnect is resolved with the user.

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
