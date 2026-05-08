# Phase 2 FuFirE-Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Bring SDLC artefacts into alignment with the deployed BAFE engine — record `DEC-fufire-baseline`, downgrade `CON-fufire-chart-endpoint` to Draft for re-approval, mark `ASM-fufire-api-available` Verified, ingest the upstream API doc as a design reference, and rewrite the geocoding/interpretation vendor-task briefings now that BAFE provides those capabilities natively.

**Architecture:** Pure markdown work. ~9 files touched in 2 logical commits. No source code changes. No tests added (covered by `npm test` regression check — must stay 40/40 green). Tasks are organised in two phases: Phase A (reference doc ingestion, separate commit) and Phase B (the SDLC alignment sweep, single commit).

**Tech Stack:** Markdown only. Bash for sanity checks (`grep`, `npm test`).

**Source design:** [`2026-05-08-phase-2-fufire-alignment-design.md`](2026-05-08-phase-2-fufire-alignment-design.md)

---

## Pre-Flight: State Verification

**Step 0.1: Confirm git state and required files**

```bash
git status --short
git log --oneline -3
ls decisions/_template.md decisions/_template.history.md decisions/PROCEDURES.md
ls 1-spec/constraints/CON-fufire-chart-endpoint.md 1-spec/assumptions/ASM-fufire-api-available.md
ls 1-spec/CLAUDE.spec.md 2-design/CLAUDE.design.md 4-deploy/CLAUDE.deploy.md 3-code/adapter/CLAUDE.component.md
test -d 2-design/external-context && echo "external-context/ exists" || echo "external-context/ MISSING — Task A.1 will mkdir"
```

**Expected:** Working tree clean (or only untracked plan file). All listed files exist. `2-design/external-context/` may not exist yet — Task A.1 creates it.

**Step 0.2: Confirm the design has been committed**

```bash
git log --oneline -5 | grep "Phase 2 FuFirE-alignment design"
```

**Expected:** the design-doc commit (`e179de0` or successor) is in history.

**Step 0.3: Baseline test run**

```bash
npm test 2>&1 | tail -5
```

**Expected:** `# pass 40` `# fail 0`. Establishes regression baseline.

---

## Phase A — Reference Doc Ingestion

### Task A.1: Create `2-design/external-context/bafe-api-reference.md`

**Why a separate phase/commit:** Ingesting an external doc is a self-contained action; the alignment artefacts in Phase B will reference this file. Splitting the commit makes the reference doc's lineage easy to grep later.

**Files:**
- Create: `2-design/external-context/bafe-api-reference.md` (new directory + new file)

**Step A.1.1: Create the directory**

```bash
mkdir -p 2-design/external-context
```

**Step A.1.2: Write the file**

Use the Write tool with this content. The body (everything after the frontmatter blank line) is the verbatim API documentation supplied by the user during the brainstorm session on 2026-05-08; do not edit the body content during this step.

````markdown
---
title: BAFE / FuFirE API Reference (Snapshot)
source: Cowork-Analyse, automatisch generiert aus Codebase
upstream: BAFE — Bazodiac Astro Fusion Engine (https://bafe-2u0e2a.fly.dev)
captured: 2026-05-08
status: snapshot — kann veralten
---

> **Authoritative source:** the live `/health` endpoint of the BAFE engine.
> If this snapshot conflicts with what the engine returns, the engine wins.
> Re-capture this file by re-running the upstream Cowork-Analyse and overwriting in place.

# API-Endpunkt-Dokumentation — Bazodiac Dashboard, Tagespuls & Signatur

**Stand:** 2026-05-08 | **Autor:** Cowork-Analyse (automatisch generiert aus Codebase)

[... PASTE THE FULL API DOCUMENTATION FROM THE BRAINSTORM SESSION HERE ...]

[Implementer note: the full doc body is in the conversation message that
produced the design (a long markdown block starting with "## Architektur-
Übersicht" and ending with "## 8. Offene Fragen / Identified Gaps").
Reproduce it verbatim. The orchestrator (controller) provides the full
text when dispatching this task to a subagent.]
````

**Step A.1.3: Verify the file exists with the right size**

```bash
wc -l 2-design/external-context/bafe-api-reference.md
```

**Expected:** at least 300 lines (frontmatter + full doc body).

**Step A.1.4: Commit**

```bash
git add 2-design/external-context/bafe-api-reference.md
git commit -m "$(cat <<'EOF'
docs(design): ingest BAFE/FuFirE API reference as external-context snapshot

Captures the live engine surface (https://bafe-2u0e2a.fly.dev with Railway
fallback) as a design reference so future agents don't re-discover it.
Frontmatter flags this as a snapshot — the live /health endpoint is the
authoritative source of truth.

Used by DEC-fufire-baseline (next commit) as the verification evidence
for ASM-fufire-api-available.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Expected:** clean commit, exit 0.

---

## Phase B — SDLC Alignment Sweep

All Phase B tasks contribute to a single final commit (Step B.13). Subagents executing this phase should NOT commit between tasks.

### Task B.1: Read source templates and existing artefacts

**Files (read-only):**
- Read: `decisions/_template.md`
- Read: `decisions/_template.history.md`
- Read: `decisions/PROCEDURES.md` (sections "Recording a new decision" and "Bidirectional indexes")
- Read: `decisions/DEC-zero-runtime-deps.md` (as a concrete example of an Active DEC referencing a constraint)
- Read: `1-spec/constraints/CON-fufire-chart-endpoint.md`
- Read: `1-spec/assumptions/ASM-fufire-api-available.md`
- Read the trigger-conditions sections of: `1-spec/CLAUDE.spec.md`, `2-design/CLAUDE.design.md`, `4-deploy/CLAUDE.deploy.md`, `3-code/adapter/CLAUDE.component.md`

**Goal:** Get the exact structure (frontmatter shape, section headings, link conventions) before generating new content. Note the current Status, Date, Source-link conventions in each.

**No commit. No file changes. This task is pure reading and synthesising.**

---

### Task B.2: Create `decisions/DEC-fufire-baseline.md`

**Files:**
- Create: `decisions/DEC-fufire-baseline.md`

Use the structure from `decisions/_template.md`. The decision body must include the following facts (gathered from `2-design/external-context/bafe-api-reference.md` ingested in Task A.1):

- **Decision:** The Waitinglist project consumes the existing deployed BAFE engine. No new deployment, no fork, no replacement engine.
- **Production endpoint:** `https://bafe-2u0e2a.fly.dev` (Fly.io).
- **Fallback endpoint:** `https://bafe-production.up.railway.app` (Railway). Currently used by the Signatur-App; flagged as an open architecture question.
- **Authentication:** API key, header `X-API-Key: ff_pro_<secret>`. Tier `ff_pro_*` allows 10,000 req/day, 100 req/min globally; rate limit 30 req/min specifically on `/v1/fusion`, `/v1/experience/bootstrap`, `/v1/experience/daily`; 60 req/min on `/v1/experience/signature-delta`.
- **Upstream endpoint for our `/api/public/fusion-chart`:** `POST /v1/fusion` (Wu-Xing Fusion-Analyse, kombiniert BaZi + Western). Selected over `/v1/experience/bootstrap` because the Waitinglist preview only needs the Wu-Xing chart, not the full soulprint/signature-blueprint payload.
- **CORS:** the engine enforces a strict whitelist (Wildcard `*` is explicitly forbidden). `bazodiac.space` and `www.bazodiac.space` must be in the engine's `CORS_ALLOWED_ORIGINS`.
- **Standard response headers:** `X-Request-ID`, `X-API-Version`, `X-Response-Time-ms`, `X-RateLimit-Limit`, `X-RateLimit-Remaining` are present and may be surfaced in the adapter's logging.
- **Known gap:** the response shape of `POST /v1/fusion` is not fully reconstructed from the snapshot. Verification against our `WuXing` DTO is deferred to Phase 3 (`TASK-configure-fufire-live`).
- **Open question:** two production URLs (Fly.io vs Railway). Resolution requires `STK-upstream-provider-maintainers` confirmation; tracked but not resolved here.

**Frontmatter / metadata fields:**

- `Status: Active`
- `Date: 2026-05-08`
- `Source: REQ-F-fufire-chart-mapping, CON-fufire-chart-endpoint, ASM-fufire-api-available`
- `Supersedes: n/a` (this DEC creates a new alignment; the prior plan that proposed Wait/Self-host/Mock is superseded but never reached Active status)

**Trigger conditions (per `decisions/PROCEDURES.md` shape):**

- **Code phase:** when setting `FUFIRE_BASE_URL` / `FUFIRE_API_KEY` env vars; when modifying `src/providers/fufireProvider.mjs` or `mapFufireResponse`.
- **Deploy phase:** when configuring production environment variables for the adapter.
- **Spec phase:** when reviewing `CON-fufire-chart-endpoint` for re-approval.

**Required cross-references in body:**

- Link to `2-design/external-context/bafe-api-reference.md` as the verification artefact.
- Link to `1-spec/assumptions/ASM-fufire-api-available.md` as the resolved assumption.
- Link to `1-spec/constraints/CON-fufire-chart-endpoint.md` (which is being downgraded in Task B.4) for the endpoint contract.

**No commit yet.** The DEC, its history file, and all downstream updates land in one commit at Step B.13.

---

### Task B.3: Create `decisions/DEC-fufire-baseline.history.md`

**Files:**
- Create: `decisions/DEC-fufire-baseline.history.md`

Use `decisions/_template.history.md` as the structural template.

**Required content:**

- **Alternatives considered:** (1) Wait — defer until upstream team commits a deployment timeline. Rejected because BAFE is already deployed (`https://bafe-2u0e2a.fly.dev`). (2) Self-host an internal FuFirE instance. Rejected because (1) implies the upstream is reachable. (3) Mock with a different chart engine (Astrolog, Swiss Ephemeris). Rejected because BAFE already runs Swiss Ephemeris internally and is purpose-built for the Bazodiac fusion model.
- **Reasoning:** The original Phase 2 plan was structured around the assumption that no FuFirE engine existed. The 2026-05-08 supply of the BAFE API documentation invalidated that premise. Aligning the SDLC artefacts with the deployed reality is the smallest correct action.
- **Changelog:**
  - `2026-05-08` — Initial Active status; created from `docs/plans/2026-05-08-phase-2-fufire-alignment-design.md`.

**No commit.**

---

### Task B.4: Update `1-spec/constraints/CON-fufire-chart-endpoint.md`

**Files:**
- Modify: `1-spec/constraints/CON-fufire-chart-endpoint.md`

**Required edits:**

1. **Status:** `Approved` → `Draft`. Add a note: `Status downgraded 2026-05-08: endpoint specification updated from POST {FUFIRE_BASE_URL}/chart to POST {FUFIRE_BASE_URL}/v1/fusion per DEC-fufire-baseline. Re-approval required.`
2. **Endpoint specification:** any text or example that shows `/chart` as the upstream path is replaced with `/v1/fusion`. Header remains `X-API-Key`. Method remains `POST`.
3. **Add a new section or update an existing one** to reference `decisions/DEC-fufire-baseline.md` as the resolving decision and `2-design/external-context/bafe-api-reference.md` as the upstream evidence.
4. **Date:** update the artefact's "Last modified" or equivalent metadata field to `2026-05-08`.

**Verification grep (after edit, before commit):**

```bash
grep -n "/chart" 1-spec/constraints/CON-fufire-chart-endpoint.md
```

**Expected:** zero hits in active spec text. Historical mention in the status-downgrade note (where it explains "was previously /chart") is acceptable, but the active endpoint string must be `/v1/fusion`.

**No commit.**

---

### Task B.5: Update `1-spec/assumptions/ASM-fufire-api-available.md`

**Files:**
- Modify: `1-spec/assumptions/ASM-fufire-api-available.md`

**Required edits:**

1. **Status:** `Unverified` → `Verified`.
2. **Add a `## Verification Evidence` section** (or update an existing one) with: `Verified 2026-05-08 against API documentation snapshot at 2-design/external-context/bafe-api-reference.md. Live endpoint: https://bafe-2u0e2a.fly.dev/health (returns engine version + ephemeris status).`
3. **Add a `## Resolved by` section** (or update an existing one) linking to `decisions/DEC-fufire-baseline.md`.
4. **Date:** update "Last modified" to `2026-05-08`.

**No commit.**

---

### Task B.6: Add DEC row to phase decision indexes

**Files:**
- Modify: `1-spec/CLAUDE.spec.md` — add a row in its "Decisions Relevant to This Phase" or equivalent index, with trigger condition matching the spec-phase trigger from Task B.2.
- Modify: `2-design/CLAUDE.design.md` — same.
- Modify: `4-deploy/CLAUDE.deploy.md` — same.
- Modify: `3-code/adapter/CLAUDE.component.md` — same.

**Row content (for each index):**

`| [DEC-fufire-baseline](../decisions/DEC-fufire-baseline.md) | <phase-specific trigger condition copied from the DEC's Trigger conditions section> |`

(Adjust the relative-path prefix per file location: `1-spec/`, `2-design/`, `4-deploy/` use `../decisions/`; `3-code/adapter/CLAUDE.component.md` uses `../../decisions/`.)

**Verification grep (after edits, before commit):**

```bash
grep -l "DEC-fufire-baseline" 1-spec/CLAUDE.spec.md 2-design/CLAUDE.design.md 4-deploy/CLAUDE.deploy.md 3-code/adapter/CLAUDE.component.md
```

**Expected:** all 4 file paths printed.

**No commit.**

---

### Task B.7: Update `3-code/tasks.md`

**Files:**
- Modify: `3-code/tasks.md`

**Required edits (3 separate row updates):**

1. **`TASK-decide-fufire-deployment`** row — Status `Todo` → `Done`. Date `2026-05-08`. Notes column gets: `Done 2026-05-08: superseded by DEC-fufire-baseline (alignment with deployed BAFE engine, not a build/buy choice).`

2. **`TASK-decide-interpretation-vendor`** row — Description column rewritten to: `Determine whether BAFE's /v1/experience/daily (returns summary, themes, caution, opportunity natively) makes a separate interpretation vendor unnecessary. If yes, record DEC-no-separate-interpretation-vendor. If no, compare Gemini direct vs proxy.` Notes column: `Briefing rewritten 2026-05-08 after BAFE API snapshot revealed native interpretation surface.` Status remains `Todo`.

3. **`TASK-decide-geocoding-vendor`** row — Description rewritten to: `BAFE accepts birth.lat / birth.lon directly. Determine whether the Waitinglist frontend still needs a geocoding vendor for place-label-to-coordinates UX. If yes, compare Mapbox/OpenCage/Google. If no, record DEC-no-geocoding-vendor.` Notes column: `Briefing rewritten 2026-05-08 — geocoding may be redundant if frontend captures lat/lon via browser geolocation or numeric input.` Status remains `Todo`.

**No other rows are touched.** `TASK-update-assumption-statuses` remains Todo (only ASM-fufire-api-available is updated in this run; the other 3 ASMs remain Unverified).

**No commit.**

---

### Task B.8: Update `CLAUDE.md` Current State

**Files:**
- Modify: `CLAUDE.md`

**Required edits:**

1. **In the Specification phase summary section** — update the constraints-line: `7 Active` → `6 Active + 1 Draft (CON-fufire-chart-endpoint, downgraded 2026-05-08 per DEC-fufire-baseline; awaiting re-approval)`. Update the assumptions-line: `5 (1 High-risk, 3 Medium, 1 Low; all Unverified)` → `5 (1 High-risk Verified 2026-05-08 [ASM-fufire-api-available], 3 Medium Unverified, 1 Low Unverified)`.

2. **In the Design phase progress section** — update the decisions-count: `4 Active + 1 Deprecated` → `5 Active + 1 Deprecated`. Add `DEC-fufire-baseline` to the linked-decisions list. Update phase-index counts: `0/4/2/(2,4)` → `(1)/5/3/(2,5)` (1-spec/2-design/4-deploy/(frontend,adapter)). Note: the `1-spec/CLAUDE.spec.md` index gains its first decision row in this run.

3. **In the Implementation progress section** — append a new dated entry:

```
- 2026-05-08: FuFirE alignment — recorded `DEC-fufire-baseline` after the BAFE API snapshot revealed the engine is already deployed (`https://bafe-2u0e2a.fly.dev`). Closes `TASK-decide-fufire-deployment`. Side effects: `CON-fufire-chart-endpoint` downgraded to Draft (endpoint corrected from `/chart` to `/v1/fusion`, awaiting re-approval); `ASM-fufire-api-available` upgraded to Verified; `2-design/external-context/bafe-api-reference.md` ingested as upstream evidence; `TASK-decide-interpretation-vendor` and `TASK-decide-geocoding-vendor` briefings rewritten because BAFE provides those capabilities natively. See [`docs/plans/2026-05-08-phase-2-fufire-alignment-design.md`](docs/plans/2026-05-08-phase-2-fufire-alignment-design.md).
```

4. **Update the gap-analysis line** in the Specification summary — append `(stale — 1 ASM verified, 1 constraint downgraded since)` to the existing gap-analysis date entry.

5. **Update the completeness-assessment line** in the Design summary — append `(stale — 1 new decision, 1 constraint downgraded since)`.

**No commit.**

---

### Task B.9: Sanity checks (pre-commit)

**Files:** none modified.

**Step B.9.1: Run the test suite**

```bash
npm test 2>&1 | tail -5
```

**Expected:** `# pass 40` `# fail 0`. No regression.

**Step B.9.2: Run editorial-hints linter (existing soft-hint check)**

```bash
npm run editorial-hints 2>&1 | tail -5
```

**Expected:** the script exits 0. Hint count may be unchanged or differ by ±1; not a blocker.

**Step B.9.3: Constraint endpoint sanity grep**

```bash
grep -rn "FUFIRE_BASE_URL.*chart" 1-spec/ 2-design/
```

**Expected:** zero hits in active text (ignoring history files and the design doc, which describes the change). If `1-spec/constraints/CON-fufire-chart-endpoint.md` shows hits in active text, fix Task B.4 before continuing.

**Step B.9.4: Check decision count consistency**

```bash
ls decisions/DEC-*.md | grep -v history | wc -l
grep -c "Active" CLAUDE.md
```

**Expected:** the file count increases by 1 (was 5 — including deprecated — now 6); CLAUDE.md mentions "5 Active" exactly once in the design summary.

**Step B.9.5: Verify all 4 indexes link to the new DEC**

```bash
grep -l "DEC-fufire-baseline" 1-spec/CLAUDE.spec.md 2-design/CLAUDE.design.md 4-deploy/CLAUDE.deploy.md 3-code/adapter/CLAUDE.component.md
```

**Expected:** 4 paths printed. Zero indicates Task B.6 was incomplete.

**No commit.**

---

### Task B.10: Single alignment commit

**Files (all from Tasks B.2–B.8):**

- Created: `decisions/DEC-fufire-baseline.md`, `decisions/DEC-fufire-baseline.history.md`
- Modified: `1-spec/constraints/CON-fufire-chart-endpoint.md`, `1-spec/assumptions/ASM-fufire-api-available.md`, `1-spec/CLAUDE.spec.md`, `2-design/CLAUDE.design.md`, `4-deploy/CLAUDE.deploy.md`, `3-code/adapter/CLAUDE.component.md`, `3-code/tasks.md`, `CLAUDE.md`

**Step B.10.1: Stage exactly the alignment files**

```bash
git add \
  decisions/DEC-fufire-baseline.md \
  decisions/DEC-fufire-baseline.history.md \
  1-spec/constraints/CON-fufire-chart-endpoint.md \
  1-spec/assumptions/ASM-fufire-api-available.md \
  1-spec/CLAUDE.spec.md \
  2-design/CLAUDE.design.md \
  4-deploy/CLAUDE.deploy.md \
  3-code/adapter/CLAUDE.component.md \
  3-code/tasks.md \
  CLAUDE.md
git status --short
```

**Expected:** 10 files staged. No untracked alignment files; no unintended modifications.

**Step B.10.2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(phase-2): align SDLC artefacts with deployed BAFE engine

Records DEC-fufire-baseline reflecting the live engine state captured
in 2-design/external-context/bafe-api-reference.md (committed in the
previous commit):
- Production: https://bafe-2u0e2a.fly.dev (Fly.io)
- Fallback: https://bafe-production.up.railway.app (Railway, Signatur-App)
- API key tier ff_pro_*, rate limit 30 req/min on /v1/fusion
- Strict CORS whitelist (no wildcard)
- Selected upstream endpoint for /api/public/fusion-chart: POST /v1/fusion

Side effects:
- CON-fufire-chart-endpoint downgraded Approved → Draft (endpoint
  corrected from /chart to /v1/fusion, awaiting re-approval).
- ASM-fufire-api-available upgraded Unverified → Verified, resolved
  by DEC-fufire-baseline.
- TASK-decide-fufire-deployment marked Done.
- TASK-decide-interpretation-vendor and TASK-decide-geocoding-vendor
  briefings rewritten: BAFE provides interpretation natively
  (/v1/experience/daily) and accepts lat/lon directly, so both vendor
  decisions need re-evaluation against the FuFirE-native baseline
  before vendor research begins.

Phase-index counts updated; CLAUDE.md Current State refreshed.
40/40 tests still pass (no source code touched).

Closes TASK-decide-fufire-deployment.
See docs/plans/2026-05-08-phase-2-fufire-alignment-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Expected:** clean commit, exit 0.

---

### Task B.11: Push

**Step B.11.1: Pre-push divergence check**

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD && echo "FF-of-remote: safe" || echo "DIVERGED: stop"
```

**Expected:** `FF-of-remote: safe`.

**Step B.11.2: Push**

```bash
git push origin main
```

**Expected:** two new commits land on `origin/main` (the Phase A reference-doc commit + the Phase B alignment commit).

---

## Out of scope (for this plan)

- **Code-level changes to `src/providers/fufireProvider.mjs`** — that's Phase 3 (`TASK-configure-fufire-live`).
- **Re-approving `CON-fufire-chart-endpoint`** — requires user (`STK-founder`) review of the new endpoint text in a follow-up `/SDLC-elicit` session.
- **Resolving the Fly.io vs Railway URL ambiguity** — flagged in `DEC-fufire-baseline` and `bafe-api-reference.md` as an open question; requires upstream-team confirmation.
- **Updating the remaining 3 ASMs (`geocoding-vendor-affordable`, `interpretation-vendor-selectable`, `newsletter-vendor-gdpr-compliant`)** — those wait for their respective vendor-decision tasks to be resolved with the rewritten briefings.
- **Running the live `/v1/fusion` endpoint to verify response shape** — Phase 3 work.

---

## Summary

| Task | Type | Files touched | Commits |
|---|---|---|---|
| Pre-flight 0.1–0.3 | Read-only | 0 | 0 |
| A.1 | Reference-doc ingestion | 1 created | 1 |
| B.1 | Read templates + existing | 0 | 0 |
| B.2–B.8 | Alignment artefact authoring | 10 (2 new + 8 modified) | 0 |
| B.9 | Sanity checks | 0 | 0 |
| B.10 | Alignment commit | 10 staged | 1 |
| B.11 | Push | 0 | 0 (push only) |

**Total: 11 file touches across 2 commits, 0 source-code changes, 40/40 tests stay green.**
