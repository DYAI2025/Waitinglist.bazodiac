# SDLC Hygiene Sweep Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Close the procedural loose ends left after Phase 2 FuFirE alignment — re-approve the 2 Draft artefacts, give the 4 Unverified assumptions explicit verification plans, refresh the stale gap analysis + completeness assessment numbers in `CLAUDE.md`, and track the Fly.io-vs-Railway URL ambiguity as its own task.

**Architecture:** Pure markdown work in 4 logically separate commits. No source code touched. Tests must stay 40/40 green throughout. Task 1 is a user-decision-gate (re-approval) — it requires explicit approval from the orchestrator/user before status flips. Tasks 2-4 are mechanical artefact edits.

**Tech Stack:** Markdown + bash (`grep`, `npm test`).

**Source context:**
- Final Phase 2 review: caveats listed at the bottom of [`2026-05-08-phase-2-fufire-alignment.md`](2026-05-08-phase-2-fufire-alignment.md) execution.
- Two follow-up tasks already added to `3-code/tasks.md` in commit `9d9b89d`.
- Stale markers self-flagged in `CLAUDE.md` lines ~55 + ~63.

---

## Pre-Flight: State Verification

**Step 0.1: Confirm git state and target files**

```bash
git status --short
git log --oneline -3
ls 1-spec/constraints/CON-fufire-chart-endpoint.md \
   1-spec/requirements/REQ-F-fufire-chart-mapping.md \
   1-spec/assumptions/ASM-geocoding-vendor-affordable.md \
   1-spec/assumptions/ASM-interpretation-vendor-selectable.md \
   1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md \
   1-spec/assumptions/ASM-de-en-covers-target-audience.md
grep -c "TASK-reapprove-fufire-artefacts\|TASK-refresh-spec-design-assessments" 3-code/tasks.md
```

**Expected:** Working tree clean. Last 3 commits include `9d9b89d` (chore tasks). All 6 artefact files exist. The grep returns `2` (both follow-up tasks present).

**Step 0.2: Baseline test run**

```bash
npm test 2>&1 | tail -5
```

**Expected:** `# pass 40` `# fail 0`.

**Step 0.3: Confirm current Draft / Unverified state**

```bash
grep -h "^\*\*Status\*\*:" 1-spec/constraints/CON-fufire-chart-endpoint.md 1-spec/requirements/REQ-F-fufire-chart-mapping.md
grep -h "^\*\*Status\*\*:\|^Status:" 1-spec/assumptions/*.md | sort -u
```

**Expected:** CON + REQ both show `**Status**: Draft`. ASMs show 1 Verified (fufire-api-available) + 4 Unverified (or equivalent wording).

---

## Task 1: User-decision-gate — Re-approve CON + REQ

**Why a single task with a gate:** Re-approval is fundamentally a human decision. The implementer subagent cannot self-approve. This task structures the gate explicitly: the subagent prepares everything, presents the diff to the orchestrator, and ONLY proceeds with the Status flip after the orchestrator confirms approval.

**Files:**
- Modify: `1-spec/constraints/CON-fufire-chart-endpoint.md` (Status Draft → Approved on approval)
- Modify: `1-spec/requirements/REQ-F-fufire-chart-mapping.md` (Status Draft → Approved on approval)
- Modify: `CLAUDE.md` (Specification phase summary: count update)

### Step 1.1: Read both artefacts and summarize what changed since Draft

The subagent should read:
- `1-spec/constraints/CON-fufire-chart-endpoint.md`
- `1-spec/requirements/REQ-F-fufire-chart-mapping.md`

…and produce a short summary (≤200 words total) covering:
- For CON: what the endpoint spec was (`/chart`), what it now is (`/v1/fusion`), why (DEC-fufire-baseline citing the live BAFE engine).
- For REQ: what the acceptance-criteria mapping referenced (`/chart`), what it now references (`/v1/fusion`), and the provisional-mapping caveat (live response shape unverified — Phase 3 task).

### Step 1.2: Present to orchestrator and ask for re-approval verdict

Subagent stops and reports the summary back to the orchestrator with this prompt template:

> Both artefacts are Draft pending re-approval. The substantive change is `/chart` → `/v1/fusion` per the live BAFE engine. Re-approval scope per SDLC-elicit: `STK-founder` confirms the new wording matches intent. Approve as-is, request changes, or hold?

Wait for orchestrator's verdict before proceeding.

### Step 1.3a (only if orchestrator approves): Apply the Status flip

For each file:
- Change `**Status**: Draft` → `**Status**: Approved`.
- Update the "Last modified" / "Approved on" date to `2026-05-08`.
- Update / remove the "Status downgrade" note: replace it with a "Re-approved 2026-05-08 by `STK-founder`" line that preserves the historical record (e.g., "Originally Approved before 2026-05-08; downgraded to Draft on 2026-05-08 (commit 0fc253b) when endpoint was corrected from `/chart` to `/v1/fusion` per `DEC-fufire-baseline`; re-approved 2026-05-08 after review of the new wording.").

In `CLAUDE.md` Specification phase summary:
- Constraints: `6 Active + 1 Draft (...)` → `7 Active`. Drop the Draft parenthetical.
- Requirements: `22 Approved + 1 Draft (...)` → `23 Approved (all)`. Drop the Draft parenthetical.
- Note that the breakdown line (`18 Must-have Approved + 5 Should-have Approved`) is now correct again — verify but probably needs no change.

In `CLAUDE.md` Design phase progress:
- The "All N Approved requirements mapped" assertion should now read cleanly without the "(22 Approved + 1 Draft)" qualifier.

In `3-code/adapter/CLAUDE.component.md`:
- The component requirements table row for REQ-F-fufire-chart-mapping currently has the `(Draft, downgraded 2026-05-08 ...)` parenthetical in the Summary cell. Drop it now that the REQ is back to Approved.

In `1-spec/CLAUDE.spec.md` index rows for CON and REQ:
- Status column flips back to `Approved`.
- Summary text drops any "(Draft, awaiting re-approval)" parentheticals.

### Step 1.3b (only if orchestrator does NOT approve): Halt and report

Subagent stops, makes no edits, reports the orchestrator's blocking concerns. Plan execution pauses; the next session resumes after the concerns are addressed.

### Step 1.4: Sanity checks

```bash
grep -c "Draft" 1-spec/constraints/CON-fufire-chart-endpoint.md 1-spec/requirements/REQ-F-fufire-chart-mapping.md
# Expected: each file may still mention "Draft" in the historical note; just verify the active **Status** field is Approved.
grep "^\*\*Status\*\*:" 1-spec/constraints/CON-fufire-chart-endpoint.md 1-spec/requirements/REQ-F-fufire-chart-mapping.md
# Expected: both show **Status**: Approved.
grep -n "22 Approved + 1 Draft\|6 Active + 1 Draft" CLAUDE.md
# Expected: zero hits.
npm test 2>&1 | tail -3
# Expected: 40/40.
```

### Step 1.5: Commit (only if 1.3a was executed)

Stage exactly: 2 spec files + CLAUDE.md + 3-code/adapter/CLAUDE.component.md + 1-spec/CLAUDE.spec.md. That's 5 files.

```bash
git add 1-spec/constraints/CON-fufire-chart-endpoint.md \
        1-spec/requirements/REQ-F-fufire-chart-mapping.md \
        1-spec/CLAUDE.spec.md \
        3-code/adapter/CLAUDE.component.md \
        CLAUDE.md
git status --short  # confirm 5 files
git commit -m "$(cat <<'EOF'
docs(spec): re-approve CON-fufire-chart-endpoint + REQ-F-fufire-chart-mapping

Both artefacts were downgraded to Draft on 2026-05-08 (commit 0fc253b)
when the endpoint specification was corrected from /chart to /v1/fusion
per DEC-fufire-baseline. After STK-founder review of the new wording,
both are re-approved.

Restores Approved counts:
- Constraints: 7 Active (was 6 Active + 1 Draft)
- Requirements: 23 Approved (was 22 Approved + 1 Draft)

Index rows in 1-spec/CLAUDE.spec.md and 3-code/adapter/CLAUDE.component.md
updated to drop the Draft parentheticals.

Closes TASK-reapprove-fufire-artefacts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Also mark `TASK-reapprove-fufire-artefacts` Done in `3-code/tasks.md` (this is one of the staged files? — actually no, tasks.md isn't staged above. Add it to the stage list. Make it 6 files.). The Notes column gets `Done 2026-05-08: re-approved by STK-founder, Status flipped back to Approved for both artefacts.`

Do NOT push yet. All 4 task commits push together at end.

---

## Task 2: Add verification plans to 4 Unverified ASMs

**Why this matters:** Unverified assumptions without a verification plan are open-ended risks. The plan section gives a concrete trigger — "verification happens when X" — so a future agent knows when to flip the status to Verified.

**Files:**
- Modify: `1-spec/assumptions/ASM-geocoding-vendor-affordable.md`
- Modify: `1-spec/assumptions/ASM-interpretation-vendor-selectable.md`
- Modify: `1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md`
- Modify: `1-spec/assumptions/ASM-de-en-covers-target-audience.md`

### Step 2.1: Read each ASM to know its current shape

For each of the 4 files, read it and note:
- Current presence/absence of a `## Verification Plan` section.
- Current "Last modified" date.
- Risk level (Medium for the 3 vendors, Low for de-en).

### Step 2.2: Add or update the Verification Plan section per ASM

Each ASM gets a `## Verification Plan` section with this shape:

```
## Verification Plan

**Trigger:** <one-line trigger condition>
**Method:** <how verification happens>
**Owner:** <which stakeholder confirms>
**Target date:** <phase or date>
**Records to update on verification:** Status field (`Unverified` → `Verified`); Verification Evidence section with date and evidence link.
```

Specific content per ASM:

**`ASM-geocoding-vendor-affordable.md`:**
- Trigger: `TASK-decide-geocoding-vendor` resolves to either a chosen vendor OR `DEC-no-geocoding-vendor` (vendor not needed because BAFE accepts lat/lon directly per `DEC-fufire-baseline`).
- Method: If a vendor is chosen, verification happens when its monthly invoice + traffic-projection arithmetic confirms affordability against the budget constraint in `CON-budget-monthly-vendor-cap` (or whatever the relevant constraint is — verify it exists; if not, drop this clause). If no vendor is needed, the assumption becomes vacuously true and the ASM is closed via `Status: Verified — N/A (vendor not selected)`.
- Owner: `STK-founder`.
- Target date: post-Phase-2 vendor-decision resolution.

**`ASM-interpretation-vendor-selectable.md`:**
- Trigger: `TASK-decide-interpretation-vendor` resolves.
- Method: Same shape as geocoding — vendor invoice OR `Status: Verified — N/A` if BAFE's `/v1/experience/daily` covers interpretation natively per `DEC-no-separate-interpretation-vendor` (if recorded).
- Owner: `STK-founder`.
- Target date: post-Phase-2 vendor-decision resolution.

**`ASM-newsletter-vendor-gdpr-compliant.md`:**
- Trigger: `TASK-decide-newsletter-vendor` resolves.
- Method: Vendor's published GDPR/DPA documentation reviewed by `STK-privacy-compliance-owner`; double-opt-in mechanic verified via test signup.
- Owner: `STK-privacy-compliance-owner`.
- Target date: post-Phase-2 vendor-decision resolution.

**`ASM-de-en-covers-target-audience.md`:**
- Trigger: First wave of public-traffic analytics post-launch (Phase 4 or post-launch monitoring).
- Method: Track language-toggle ratio + EN-content engagement metrics in production analytics. If EN < 5% of total sessions over a 30-day window, the assumption is invalidated and the language strategy revisits.
- Owner: `STK-founder` (or whoever owns growth analytics).
- Target date: 30 days post-launch.

### Step 2.3: Sanity check

```bash
grep -l "^## Verification Plan" 1-spec/assumptions/*.md | wc -l
# Expected: 5 — the 4 newly-added + ASM-fufire-api-available which already had verification evidence (or its plan-equivalent).
# If the count is 4 or less, one of the edits did not save.
```

### Step 2.4: Commit

```bash
git add 1-spec/assumptions/ASM-geocoding-vendor-affordable.md \
        1-spec/assumptions/ASM-interpretation-vendor-selectable.md \
        1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md \
        1-spec/assumptions/ASM-de-en-covers-target-audience.md
git commit -m "$(cat <<'EOF'
docs(spec): add Verification Plan to 4 Unverified ASMs

Each Unverified assumption now has an explicit trigger, method, owner,
and target date for verification, so the path from Unverified to
Verified is concrete and trackable rather than open-ended.

- ASM-geocoding-vendor-affordable: trigger = vendor decision (or
  vacuously verified if BAFE-direct lat/lon obviates a vendor).
- ASM-interpretation-vendor-selectable: trigger = vendor decision (or
  vacuously verified if /v1/experience/daily covers it natively).
- ASM-newsletter-vendor-gdpr-compliant: trigger = vendor decision +
  STK-privacy-compliance-owner DPA review.
- ASM-de-en-covers-target-audience: trigger = 30-day post-launch
  language-toggle analytics window.

Status remains Unverified until trigger fires. Total Unverified count
in CLAUDE.md unchanged (still 4).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Do NOT push yet.

---

## Task 3: Refresh CLAUDE.md gap analysis + completeness assessment

**Why this matters:** Both lines self-flag as `(stale — ...)` after Phase 2's transitions. Refreshing them removes the staleness markers and updates the numbers to reflect post-Task-1-and-Task-2 reality.

**Files:**
- Modify: `CLAUDE.md`

### Step 3.1: Re-run the gap-analysis logic from `.claude/skills/SDLC-elicit/SKILL.md`

For each gap-analysis check (missing traceability, potential coverage gaps, uncovered stakeholders, orphaned artefacts, missing non-functional coverage, unverified assumptions, constraint coverage), determine the current count.

After Tasks 1 + 2:
- All Approved REQs have traceability (no orphaned).
- ASM-fufire-api-available is Verified.
- The 3 vendor ASMs are still Unverified — but now have Verification Plans (Minor → less severe).
- ASM-de-en-covers-target-audience has a Verification Plan (Minor → less severe).

Expected post-refresh assessment: **0 Critical, 0 Important, 4 Minor** (the 4 Unverified ASMs that still need their triggers to fire).

The Phase 2 final review noted that prior Important counts were inflated because ASM-fufire-api-available was Unverified. With it Verified, that finding closes.

### Step 3.2: Re-run the design completeness-assessment logic from `.claude/skills/SDLC-design/SKILL.md`

Severity classification:
- Critical: Must-have requirements unaddressed, empty design documents, constraint violations.
- Important: Should-have requirements not covered, design depending on High-risk Unverified assumption, document incomplete for scope.
- Minor: Missing diagrams, design depending on Low-risk Unverified assumption, minor traceability link missing.

Post-Tasks 1+2 expected: **0 Critical, 0 Important, 4 Minor** (3 Medium + 1 Low Unverified ASMs all classified as Minor in design context per current rubric).

### Step 3.3: Update CLAUDE.md

In the Specification phase summary block:
- Replace the existing gap-analysis line (currently includes `(stale — 1 ASM verified, 1 constraint downgraded since)`) with a fresh dated line: `Gap analysis (2026-05-08, post-hygiene-sweep): 0 Critical, 0 Important, 4 Minor. The 4 Minor are 4 Unverified ASMs (3 Medium, 1 Low), all with explicit Verification Plans dated 2026-05-08. Spec → Design gate fully clean.`

In the Design phase progress block:
- Replace the existing completeness-assessment line (with `(stale — 1 new decision, 1 constraint downgraded since)`) with: `Completeness assessment (2026-05-08, post-hygiene-sweep): 0 Critical, 0 Important, 4 Minor. The 4 Minor are 4 Unverified ASMs with Verification Plans dated 2026-05-08; resolution paths captured in tasks.md (vendor decisions + post-launch analytics). Design → Code gate fully clean (0 Critical + fresh).`

In the Implementation progress section:
- Append a new dated entry summarizing the hygiene sweep (composes after all 4 task commits land — see Task 4 commit which folds Implementation-progress narrative into the same final entry).

Also drop "(stale — ...)" markers anywhere else they may still appear (grep `CLAUDE.md` for the exact strings).

### Step 3.4: Sanity check

```bash
grep -n "(stale —" CLAUDE.md
# Expected: zero hits.
grep -n "Gap analysis (2026-05-08, post-hygiene-sweep)" CLAUDE.md
# Expected: 1 hit.
grep -n "Completeness assessment (2026-05-08, post-hygiene-sweep)" CLAUDE.md
# Expected: 1 hit.
```

### Step 3.5: Mark `TASK-refresh-spec-design-assessments` Done

In `3-code/tasks.md`, that row's Status column flips Todo → Done, Notes column gets `Done 2026-05-08: post-hygiene-sweep refresh — 0 Critical, 0 Important, 4 Minor for both Spec gap analysis and Design completeness assessment.`

### Step 3.6: Commit

```bash
git add CLAUDE.md 3-code/tasks.md
git commit -m "$(cat <<'EOF'
docs(claude): refresh gap analysis + completeness assessment

After re-approval (Task 1) and ASM verification plans (Task 2), the
self-flagged-stale assessment numbers in CLAUDE.md (Specification +
Design phase summaries) are recomputed.

Result: 0 Critical, 0 Important, 4 Minor for both Spec gap analysis and
Design completeness assessment. The 4 Minor are 4 Unverified ASMs that
now all have explicit Verification Plans (3 vendor ASMs trigger on
post-Phase-2 vendor decision; 1 language ASM triggers on 30-day
post-launch analytics).

Both phase gates are now formally clean (no stale, no Critical).

Closes TASK-refresh-spec-design-assessments.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Do NOT push yet.

---

## Task 4: Track Fly.io vs Railway URL ambiguity as its own task

**Why this matters:** The DEC's "Open question" captures the issue but doesn't create accountability. A `tasks.md` row makes the question visible in the Implementation-plan view and gives it a Phase placement.

**Files:**
- Modify: `3-code/tasks.md`

### Step 4.1: Add a new task row

Add this row in the Phase 2 "Vendor selection / decision" group (right after `TASK-reapprove-fufire-artefacts` or wherever Phase 2 decision tasks are listed):

```
| TASK-resolve-fufire-url-ambiguity | Resolve which BAFE production URL the Waitinglist adapter should target — Fly.io (https://bafe-2u0e2a.fly.dev) per main Web/Mobile, OR Railway (https://bafe-production.up.railway.app) per Signatur-App. Confirm canonical URL with `STK-upstream-provider-maintainers`; record verdict as `DEC-fufire-canonical-url` (or amend `DEC-fufire-baseline` history). | P2 | Todo | - | TASK-decide-fufire-deployment | 2026-05-08 | Open question captured in `DEC-fufire-baseline.md`; needs upstream confirmation before Phase 3 wiring. |
```

### Step 4.2: Sanity check

```bash
grep "TASK-resolve-fufire-url-ambiguity" 3-code/tasks.md | wc -l
# Expected: 2 (the row + the Setup section's numbered list, if it tracks task IDs there).
# If the Setup section also lists tasks by name, add the new task to that list at the appropriate position.
```

### Step 4.3: Final implementation-progress entry in CLAUDE.md

Append this entry to the Implementation progress list in `CLAUDE.md` (the dated bullets):

```
- 2026-05-08: SDLC hygiene sweep — closed 4 procedural follow-ups left after the FuFirE alignment. (1) Re-approved `CON-fufire-chart-endpoint` and `REQ-F-fufire-chart-mapping` after `STK-founder` review of the new `/v1/fusion` wording — restores 23 Approved REQs / 7 Active CONs. (2) Added Verification Plans to 4 Unverified ASMs (3 vendor + 1 language). (3) Refreshed gap analysis + completeness assessment — both 0 Critical, 0 Important, 4 Minor; phase gates fully clean. (4) Tracked Fly.io-vs-Railway URL ambiguity as `TASK-resolve-fufire-url-ambiguity`. Closes `TASK-reapprove-fufire-artefacts` and `TASK-refresh-spec-design-assessments`. See `docs/plans/2026-05-08-sdlc-hygiene-sweep.md`.
```

### Step 4.4: Commit

```bash
git add 3-code/tasks.md CLAUDE.md
git commit -m "$(cat <<'EOF'
chore(tasks): track Fly.io-vs-Railway URL resolution as its own task

DEC-fufire-baseline captures the ambiguity as an "Open question" but
without a tasks.md row it risks dropping off the radar before Phase 3
wiring needs the canonical URL.

TASK-resolve-fufire-url-ambiguity (P2) blocks on STK-upstream-provider-
maintainers confirmation. Verdict will be recorded as either
DEC-fufire-canonical-url or as a history-file amendment to
DEC-fufire-baseline.

Also appends the closing 2026-05-08 implementation-progress entry to
CLAUDE.md summarizing the full SDLC hygiene sweep.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Push all 4 commits to origin/main

### Step 5.1: Pre-push divergence check

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD && echo "FF-of-remote: safe" || echo "DIVERGED: stop"
git log --oneline origin/main..HEAD
# Expected: 4 commits ahead, FF-of-remote.
```

### Step 5.2: Push

```bash
git push origin main
```

**Expected:** 4 commits land on origin/main.

---

## Out of scope for this plan

- **Vendor decisions for geocoding / interpretation / newsletter.** The 3 `TASK-decide-*-vendor` rows stay Todo. Their rewritten briefings (post-FuFirE-alignment) already structure them around "is the vendor needed at all?" — answering them is its own session.
- **Phase 3 work.** No code changes. No live integration.
- **Re-approval if orchestrator declines.** If Task 1 hits the "do NOT approve" branch, plan execution halts after Task 1.3b. Tasks 2-5 still run on the next session if their preconditions are independent (they are: Tasks 2 and 4 don't depend on re-approval; Task 3's refresh would just need to keep the "Draft" qualifier intact).

---

## Summary

| Task | Type | User input needed? | Files | Commits |
|---|---|---|---|---|
| Pre-flight 0.1-0.3 | Read-only | No | 0 | 0 |
| 1 | Re-approval gate (decision-gate task) | YES | 6 | 1 (only on approve) |
| 2 | Add Verification Plans to 4 ASMs | No | 4 | 1 |
| 3 | Refresh gap-analysis + completeness assessment | No | 2 (CLAUDE.md + tasks.md) | 1 |
| 4 | Track Fly.io-vs-Railway as new task | No | 2 (tasks.md + CLAUDE.md) | 1 |
| 5 | Push | No | 0 | push only |

**Total: 4 commits, 1 user-decision gate (Task 1), 0 source-code changes, 40/40 tests stay green.**
