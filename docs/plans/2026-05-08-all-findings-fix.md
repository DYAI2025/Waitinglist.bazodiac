# All Findings Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (or superpowers:executing-plans for parallel session) to implement this plan task-by-task.

**Goal:** Address every actionable finding accumulated across this session's reviews — finishing the in-flight editorial-framing pivot (Tasks 13-15 of `2026-05-07-editorial-framing-pivot-plan.md`), then layering production-hardening + governance follow-ups identified by the elite code review and code-review-checklist passes.

**Architecture:** Three phases by priority. Phase 1 is **critical** — completes the editorial-framing pivot's tasks.md restructure, CLAUDE.md sync (with the elite-review-flagged line-71 broken-link de-link), and final verification. Phase 2 is **production hardening** — adds defensive ergonomics to the soft-hint linter (control-char filtering, error-message path inclusion, magic-number extraction, test cleanup robustness). Phase 3 is **governance follow-ups** — codifies the patterns this pivot established (REQ template update, CODEOWNERS broadening, language-policy exception note) so future agents follow precedent. Each task = one commit.

**Tech Stack:** Markdown for docs, Node.js 20+ built-ins for the script, `node:test` for tests. No new dependencies.

---

## Pre-Flight: State Verification

**Step 0.1: Confirm git state**

```bash
git status -sb
git log --oneline -5
```

**Expected:**
- HEAD at `ad54123` (Task 12 of the pivot plan: DEC deprecation).
- Branch `main`, 15 commits ahead of `origin/main`.
- Working tree may have unrelated dirty paths from outer git repos; in-repo paths should be clean.

**Step 0.2: Confirm tests still green and hint script live**

```bash
npm test --silent 2>&1 | tail -5
npm run editorial-hints 2>&1 | tail -3 ; echo "exit: $?"
```

**Expected:** `# tests 39 / # pass 39 / # fail 0`. Hint script runs, emits hints, exit 0.

---

## Phase 1 — Finish the Pivot (Critical)

These three tasks finish `docs/plans/2026-05-07-editorial-framing-pivot-plan.md` Tasks 13-15. Task 14 carries the elite-review enhancement (de-link line 71 of `CLAUDE.md`).

### Task 1.1: Restructure `3-code/tasks.md` Phase 1 (originally pivot-plan Task 13)

**Files:**
- Modify: `3-code/tasks.md`

This is one large mechanical edit:
- Cancel 5 old Phase 1 tasks with reasons.
- Update `TASK-define-editorial-lexicon` (Done) Notes column.
- Add 6 new Phase 1 tasks (4 already-Done in this session, 2 Todo for future).
- Update the Execution Plan's Phase 1 list.

**Step 1: Read current Phase 1**

```bash
grep -n "TASK-" 3-code/tasks.md | head -30
```

**Step 2: Apply edits per pivot plan Task 13 (Steps 13.2-13.4)**

Per `docs/plans/2026-05-07-editorial-framing-pivot-plan.md` lines 689-790: cancel the old IDs (`TASK-implement-check-editorial-framing`, `TASK-test-editorial-framing-script`, `TASK-wire-editorial-framing-into-check`, `TASK-document-editorial-framing-frontend`, `TASK-phase-1-manual-testing`), update `TASK-define-editorial-lexicon` Notes to "Superseded...", and add the 6 new task rows. Also update Phase 1 capabilities prose to remove blacklist-mechanic references.

The exact replacement table rows are in the pivot plan; copy them verbatim.

**Step 3: Verify**

```bash
grep "TASK-implement-check-editorial-voice" 3-code/tasks.md
grep "Cancelled" 3-code/tasks.md | wc -l
grep "editorial-framing-lexicon" 3-code/tasks.md
```

Expected: ≥1 hit for new task ID; ≥5 cancelled tasks; the lexicon path may still appear inside the Cancelled-task original-description text (acceptable — that's the trail).

**Step 4: Commit**

```bash
git add 3-code/tasks.md
git commit -m "$(cat <<'EOF'
docs(tasks): restructure Phase 1 for editorial-framing pivot

Old Phase 1 tasks Cancelled (per the SDLC scaffold's never-rename rule):
- TASK-implement-check-editorial-framing → replaced by check-editorial-voice
- TASK-test-editorial-framing-script → replaced
- TASK-wire-editorial-framing-into-check → replaced (no npm run check wiring)
- TASK-document-editorial-framing-frontend → replaced
- TASK-phase-1-manual-testing → replaced

TASK-define-editorial-lexicon stays Done; Notes appended noting
supersession by editorial-voice.md.

New Phase 1 tasks (4 Done in this session, 2 Todo):
TASK-create-editorial-voice-doc, TASK-implement-check-editorial-voice,
TASK-test-editorial-voice-script, TASK-add-editorial-hints-npm-script
(all Done) plus TASK-document-editorial-voice-frontend and
TASK-phase-1-manual-testing-pivot (Todo).

Execution Plan Phase 1 list updated.
EOF
)"
```

---

### Task 1.2: Sync `CLAUDE.md` Current State + de-link broken link (originally pivot-plan Task 14, with elite-review enhancement)

**Files:**
- Modify: `CLAUDE.md`

This task applies pivot-plan Task 14's 4 edits (A-D) **plus a 5th edit** flagged by the elite review: line 71 contains a markdown link to `4-deploy/runbooks/editorial-framing-lexicon.md` which was deleted in pivot-plan Task 11 (`c2b102a`). The link will render as broken.

**Step 1: Apply pivot-plan Task 14 edits A-E**

Per `docs/plans/2026-05-07-editorial-framing-pivot-plan.md` lines 821-887:
- **A**: REQ count line: `23 Approved` → `22 Approved + 1 Draft`
- **B**: Gap analysis line: append `(stale — pivot rewrote REQ-USA-editorial-framing-reflection)`
- **C**: Decisions line: `5 Active` → `4 Active + 1 Deprecated`; index counts updated
- **D**: Completeness assessment: append `(stale — editorial-framing pivot 2026-05-07 changed architecture.md Frontend section + Coverage row; fresh assessment needed)`
- **E**: Implementation progress: append the pivot bullet describing what changed

**Step 2: Apply the elite-review enhancement (de-link the broken markdown link)**

In the Implementation progress block, find the existing bullet at ~line 71:

```markdown
- 2026-05-07: `TASK-define-editorial-lexicon` Done — [`4-deploy/runbooks/editorial-framing-lexicon.md`](4-deploy/runbooks/editorial-framing-lexicon.md) written. Source of truth for the editorial-framing check (4 fenced code blocks with DE+EN forbidden phrases and reflection tokens, plus surfaces-in-scope, examples, and review process). Next task: `TASK-implement-check-editorial-framing` (build `scripts/check-editorial-framing.mjs`).
```

Replace with:

```markdown
- 2026-05-07: `TASK-define-editorial-lexicon` Done — `4-deploy/runbooks/editorial-framing-lexicon.md` written (subsequently deleted in 2026-05-07 editorial-framing pivot). At the time, source of truth for the editorial-framing check (4 fenced code blocks with DE+EN forbidden phrases and reflection tokens). Superseded by `1-spec/editorial-voice.md` per `docs/plans/2026-05-07-editorial-framing-pivot-design.md`.
```

The change: convert the markdown link `[text](url)` to plain inline-code path; note the supersession; replace the now-stale "next task" reference to a deleted artefact with a forward pointer to the pivot design doc.

**Step 3: Verify**

```bash
grep "Editorial-framing pivot" CLAUDE.md          # expect ≥1 hit (Edit E)
grep "5 Active recorded" CLAUDE.md                # expect 0 hits
grep "4 Active + 1 Deprecated" CLAUDE.md          # expect ≥1 hit (Edit C)
grep "22 Approved + 1 Draft" CLAUDE.md            # expect ≥1 hit (Edit A)
grep -c "(\`4-deploy/runbooks/editorial-framing-lexicon.md\`)" CLAUDE.md  # 0 (markdown link form removed)
grep "subsequently deleted" CLAUDE.md             # expect ≥1 hit (de-link enhancement)
```

**Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(claude): sync Current State for editorial-framing pivot

Five edits in one commit:
A. REQ count: 23 Approved → 22 Approved + 1 Draft
B. Gap analysis stale-flagged
C. Decisions: 5 Active → 4 Active + 1 Deprecated; index counts updated
D. Completeness assessment stale-flagged
E. Implementation progress pivot bullet appended

Plus elite-review enhancement: line 71's existing TASK-define-editorial-lexicon
bullet had a markdown link [path](path) to the now-deleted lexicon file.
Converted to inline-code path-as-prose with explicit "subsequently deleted"
note + forward pointer to the pivot design doc. Steady-state doc is now
free of broken links.
EOF
)"
```

---

### Task 1.3: Final verification (originally pivot-plan Task 15)

**No file changes — runs the full test/script suite to confirm internal consistency.**

**Step 1: Full test suite**

```bash
npm test --silent 2>&1 | tail -10
```

Expected: `# tests 39 / # pass 39 / # fail 0`.

**Step 2: Hint script live run**

```bash
npm run editorial-hints
echo "exit code: $?"
```

Expected: 13 hints (from `public/index.html`), exit code 0.

**Step 3: Existing project quality gates still green**

```bash
npm run check --silent 2>&1 | tail -5
```

Expected: same as before pivot. The editorial-hints script not interfering.

**Step 4: No orphan references to deleted/deprecated artefacts**

```bash
echo "=== references to deleted lexicon (expect 0 outside docs/plans + .history.md) ==="
grep -rln "editorial-framing-lexicon" \
  CLAUDE.md \
  1-spec/ \
  2-design/ \
  3-code/ \
  4-deploy/ \
  decisions/ \
  .github/ \
  scripts/ \
  tests/ \
  | grep -v "docs/plans" \
  | grep -v "\.history\.md$"

echo "=== references to deprecated DEC in active indexes (expect 0) ==="
grep -l "DEC-data-as-fenced-markdown-blocks" \
  1-spec/CLAUDE.spec.md \
  2-design/CLAUDE.design.md \
  2-design/architecture.md \
  4-deploy/CLAUDE.deploy.md \
  3-code/adapter/CLAUDE.component.md

echo "=== references to old script name (expect 0) ==="
grep -rln "check-editorial-framing.mjs" \
  CLAUDE.md \
  1-spec/ \
  2-design/ \
  3-code/ \
  4-deploy/ \
  decisions/ \
  .github/ \
  scripts/ \
  tests/ \
  | grep -v "docs/plans"
```

Expected: each grep returns nothing (or only references inside `docs/plans/` and `decisions/*.history.md`, which are intentional historical preservation).

**Step 5: No commit** (verification only)

```bash
git status -sb
```

Expected: working tree clean (or only outer-repo unrelated changes).

---

**Phase 1 outcome**: pivot plan fully complete. Steady-state docs are free of broken links and stale references. Tests green. Ready to push.

---

## Phase 2 — Production Hardening (Should-do)

These tasks address the elite-review's `🟡 Important` findings on the soft-hint linter. All four tasks touch `scripts/check-editorial-voice.mjs` and `tests/editorial-voice.test.mjs`. Each is a small focused commit.

### Task 2.1: Extract magic numbers to named constants

**Files:**
- Modify: `scripts/check-editorial-voice.mjs`

**Step 1: Find the magic numbers**

```bash
grep -n "30\|40" scripts/check-editorial-voice.mjs
```

The relevant lines are in `findHints()`:
```js
const start = Math.max(0, idx - 30);
const end = Math.min(lines[i].length, idx + watchword.length + 40);
```

**Step 2: Extract constants near the top of the file** (after imports, before `parseArgs`)

Use Edit. Find:
```js
const REPO_ROOT = resolve(HERE, '..');

function parseArgs(argv) {
```

Replace with:
```js
const REPO_ROOT = resolve(HERE, '..');

// Excerpt window around each watchword match (chars).
const EXCERPT_PREFIX_CHARS = 30;
const EXCERPT_SUFFIX_CHARS = 40;

function parseArgs(argv) {
```

**Step 3: Use the constants in `findHints`**

Use Edit. Find:
```js
      const start = Math.max(0, idx - 30);
      const end = Math.min(lines[i].length, idx + watchword.length + 40);
```

Replace with:
```js
      const start = Math.max(0, idx - EXCERPT_PREFIX_CHARS);
      const end = Math.min(lines[i].length, idx + watchword.length + EXCERPT_SUFFIX_CHARS);
```

**Step 4: Run tests**

```bash
npm test --silent 2>&1 | tail -5
```

Expected: 39/39 still passing (refactor, no behavior change).

**Step 5: Commit**

```bash
git add scripts/check-editorial-voice.mjs
git commit -m "refactor(scripts): extract excerpt-window magic numbers

EXCERPT_PREFIX_CHARS = 30 and EXCERPT_SUFFIX_CHARS = 40 were inline
literals in findHints(). Promoting to named constants near the top of
the file makes the excerpt-window contract reviewable and tunable.

Pure refactor — 39/39 tests still pass."
```

---

### Task 2.2: Filter control characters from hint excerpts

**Why:** Elite review trust-boundary finding. A watchword with a control char (``, ``, etc.) would corrupt terminal output when echoed verbatim in a hint. CODEOWNERS-protected lexicon limits the risk, but a defensive filter is cheap.

**Files:**
- Modify: `scripts/check-editorial-voice.mjs`
- Modify: `tests/editorial-voice.test.mjs`

**Step 1: Write failing test (TDD red)**

Append a new test to `tests/editorial-voice.test.mjs` after the last existing test:

```javascript
test('strips control characters from excerpts before printing', async () => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n- Horoskop\n\n## End\n`,
    `<p>before \x1B[31mHoroskop\x1B[0m after</p>\n`,
  );

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  // The escape sequence (0x1B) must not appear in the output excerpt.
  assert.doesNotMatch(stdout, /\x1B/);
  // The placeholder should appear instead.
  assert.match(stdout, /\?\[31mHoroskop\?\[0m/);

  await rm(dir, { recursive: true });
});
```

**Step 2: Run test to verify failure**

```bash
node --test tests/editorial-voice.test.mjs 2>&1 | tail -10
```

Expected: 6 pass + 1 fail. The new test fails because the script does not yet filter control chars.

**Step 3: Add control-char filter to `findHints`**

In `scripts/check-editorial-voice.mjs`, find the excerpt-construction line:

```js
      const excerpt = `${prefix}${lines[i].slice(start, end).trim()}${suffix}`;
```

Replace with:

```js
      const rawExcerpt = lines[i].slice(start, end).trim();
      const safeExcerpt = rawExcerpt.replace(/[\x00-\x1F\x7F]/g, '?');
      const excerpt = `${prefix}${safeExcerpt}${suffix}`;
```

**Step 4: Run tests, confirm green**

```bash
node --test tests/editorial-voice.test.mjs 2>&1 | tail -5
```

Expected: 7 pass / 0 fail.

```bash
npm test --silent 2>&1 | tail -5
```

Expected: 40 pass / 0 fail.

**Step 5: Commit**

```bash
git add scripts/check-editorial-voice.mjs tests/editorial-voice.test.mjs
git commit -m "$(cat <<'EOF'
fix(scripts): strip control characters from hint excerpts

Defensive filter on excerpt output: replace any byte in 0x00-0x1F or 0x7F
with '?' before printing. Closes the elite-review trust-boundary finding
that a watchword (or surrounding HTML) containing escape sequences could
corrupt terminal rendering of hints.

Risk is low (CODEOWNERS-protected lexicon, well-formed HTML target), but
the filter is one line and stops a class of garbage-output failures.

Adds regression test 7/7: 'strips control characters from excerpts before
printing'. Suite now 40/40.
EOF
)"
```

---

### Task 2.3: Include resolved path in loud-failure error message

**Why:** Elite review production-reliability finding. When `extractWatchwords` throws "missing a `## Watchwords` heading", the operator sees the message but not WHICH file the script tried to read. A 1-line ergonomic improvement.

**Files:**
- Modify: `scripts/check-editorial-voice.mjs`

**Step 1: Find the catch handler**

```bash
grep -n "process.exit(2)" scripts/check-editorial-voice.mjs
```

**Step 2: Update the catch handler to include the resolved voice path**

This is tricky because the catch is far from where the path is resolved. Cleanest option: keep the throws in `extractWatchwords` (and the `readFile` call) generic, and make the `main()` `await readFile` aware. Wrap the readFile + extractWatchwords with explicit context.

Use Edit. Find:

```js
async function main() {
  const args = parseArgs(process.argv);
  const voicePath = args.voice
    ? resolve(args.voice)
    : resolve(REPO_ROOT, '1-spec/editorial-voice.md');
  const targetPath = args.target
    ? resolve(args.target)
    : resolve(REPO_ROOT, 'public/index.html');

  const voiceMd = await readFile(voicePath, 'utf-8');
  const watchwords = extractWatchwords(voiceMd);
  const html = await readFile(targetPath, 'utf-8');
```

Replace with:

```js
async function main() {
  const args = parseArgs(process.argv);
  const voicePath = args.voice
    ? resolve(args.voice)
    : resolve(REPO_ROOT, '1-spec/editorial-voice.md');
  const targetPath = args.target
    ? resolve(args.target)
    : resolve(REPO_ROOT, 'public/index.html');

  let voiceMd;
  try {
    voiceMd = await readFile(voicePath, 'utf-8');
  } catch (err) {
    throw new Error(`failed to read editorial-voice doc at ${voicePath}: ${err.message}`);
  }
  let watchwords;
  try {
    watchwords = extractWatchwords(voiceMd);
  } catch (err) {
    throw new Error(`${err.message} (in ${voicePath})`);
  }
  let html;
  try {
    html = await readFile(targetPath, 'utf-8');
  } catch (err) {
    throw new Error(`failed to read target at ${targetPath}: ${err.message}`);
  }
```

**Step 3: Update tests' loud-failure assertions to expect the path in the message**

Use Edit. In `tests/editorial-voice.test.mjs`, find:

```js
test('exits 2 when voice doc is missing the Watchwords heading', async () => {
  const { dir, voice, target } = await setupFixtures(
    `# Editorial Voice\n\n## Other\n\n- thing\n`,
    `<p>x</p>`,
  );

  const { code, stderr } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 2);
  assert.match(stderr, /Watchwords/);

  await rm(dir, { recursive: true });
});
```

Replace with:

```js
test('exits 2 when voice doc is missing the Watchwords heading', async () => {
  const { dir, voice, target } = await setupFixtures(
    `# Editorial Voice\n\n## Other\n\n- thing\n`,
    `<p>x</p>`,
  );

  const { code, stderr } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 2);
  assert.match(stderr, /Watchwords/);
  assert.match(stderr, new RegExp(voice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  await rm(dir, { recursive: true });
});
```

(Same pattern: the test now also asserts the voice path appears in the error message.)

**Step 4: Run tests**

```bash
npm test --silent 2>&1 | tail -5
```

Expected: 40 pass / 0 fail.

**Step 5: Commit**

```bash
git add scripts/check-editorial-voice.mjs tests/editorial-voice.test.mjs
git commit -m "$(cat <<'EOF'
fix(scripts): include resolved file paths in loud-failure error messages

When the editorial-voice doc is missing a `## Watchwords` heading or the
section is empty, the prior error message named the problem but not the
file. Operators got 'editorial-voice doc is missing a `## Watchwords`
heading' with no clue which path the script looked at.

Wraps each readFile + extractWatchwords call with try/catch that adds
the resolved path to the error message before re-throwing. Updated the
existing 'exits 2 when missing heading' test to also assert the path
appears in stderr.

Closes the elite-review production-reliability finding.
EOF
)"
```

---

### Task 2.4: Test cleanup robustness via `t.after()`

**Why:** Quality reviews on Tasks 2 and 3 noted that test fixtures use `await rm({recursive: true})` at the end of each test. If an `assert` throws mid-test, the tempdir leaks (OS reaps eventually, but flaky failures could pile up). Use `t.after()` for cleanup so it runs even on failure.

**Files:**
- Modify: `tests/editorial-voice.test.mjs`

**Step 1: Refactor each test's cleanup**

For each `test('...', async () => { ... await rm(dir, {recursive: true}); })` pattern, change to use `t.after()`. Example transformation:

Before:
```js
test('emits hint and exits 0 when watchword appears in target', async () => {
  const { dir, voice, target } = await setupFixtures(...);
  // ... assertions ...
  await rm(dir, { recursive: true });
});
```

After:
```js
test('emits hint and exits 0 when watchword appears in target', async (t) => {
  const { dir, voice, target } = await setupFixtures(...);
  t.after(() => rm(dir, { recursive: true }));
  // ... assertions ...
});
```

Apply to all 7 tests in `tests/editorial-voice.test.mjs`. Each test becomes async-with-t-parameter and uses `t.after()` to schedule cleanup before any assertions.

**Step 2: Run tests**

```bash
npm test --silent 2>&1 | tail -5
```

Expected: 40 pass / 0 fail (no behavior change for the happy path; cleanup is now robust to assertion failures).

**Step 3: Commit**

```bash
git add tests/editorial-voice.test.mjs
git commit -m "$(cat <<'EOF'
test(scripts): use t.after() for tempdir cleanup

Each test scheduled rm(dir, {recursive: true}) at end-of-body, which
leaks the tempdir if any assert throws. t.after() guarantees cleanup
runs whether the test passes or throws.

Refactor only — no behavior change for the happy path. Suite still 40/40.

Addresses non-blocking note from Task 2 quality review.
EOF
)"
```

---

**Phase 2 outcome**: linter is hardened — magic numbers extracted, control chars filtered, error messages include file paths, tests robust against mid-flow assertion failures. Suite 40/40 (was 39/39).

---

## Phase 3 — Governance Follow-ups (Defer-OK)

These tasks address `⚠️ notes` from various reviews. Each is small. They can be deferred to a future session if you want to ship Phase 1+2 first.

### Task 3.1: Add `## Implementation` as documented optional section in REQ template

**Why:** Task 4 quality review's precedent note. `REQ-USA-editorial-framing-reflection.md` introduced a novel `## Implementation` section that is genuinely useful (links from spec to runbook + script). Codifying it in `_template.md` lets future REQ authors follow the same convention.

**Files:**
- Modify: `1-spec/requirements/_template.md`

**Step 1: Read template**

```bash
cat 1-spec/requirements/_template.md
```

**Step 2: Add `## Implementation` to the optional-sections list**

Find the comment block around the optional sections (e.g., `## Related Constraints`, `## Related Assumptions`). Add a new optional section:

```markdown
## Implementation

[Optional. Link to the runbook, script, or other artefact that implements this requirement. Use when the implementation lives in a separate file that future readers should be able to navigate to. Plain navigation aid — not a substitute for Acceptance Criteria.]
```

(The exact format depends on how the existing template structures optional sections — match the existing style.)

**Step 3: Verify**

```bash
grep "## Implementation" 1-spec/requirements/_template.md
```

Expected: ≥1 hit.

**Step 4: Commit**

```bash
git add 1-spec/requirements/_template.md
git commit -m "docs(spec): add ## Implementation as documented optional section

Follow-up to the editorial-framing pivot: REQ-USA-editorial-framing-
reflection introduced a novel ## Implementation section that's genuinely
useful (links from spec to runbook + script). Codifying it in _template.md
so future REQ authors follow the same precedent.

From the 2026-05-07 code-review-checklist's precedent note."
```

---

### Task 3.2: Add CLAUDE.spec.md exception note for DE-prose policy

**Why:** Task 1 quality review observation. CLAUDE.md says "All AI outputs must be in English". `editorial-voice.md` is bilingual by design (it documents bilingual product copy). Without an explicit exception, future agents may "fix" it.

**Files:**
- Modify: `1-spec/CLAUDE.spec.md`

**Step 1: Find an appropriate insertion point**

The exception should go near the start, in a small "Language policy exception" subsection.

```bash
head -25 1-spec/CLAUDE.spec.md
```

**Step 2: Insert the exception note**

After the `## Phase artifacts` table or near the top of the file, insert:

```markdown
## Language policy exception

[`CLAUDE.md`](../CLAUDE.md) mandates English for all AI outputs. **Specification artefacts that document bilingual product content** (e.g., [`editorial-voice.md`](editorial-voice.md), which catalogs DE+EN editorial conventions) are exempt: their content has to be bilingual to do its job. Do not auto-translate these documents.

All other Specification artefacts (goals, user stories, requirements, decisions, indexes, narrative descriptions) follow the English-only mandate.

---
```

(Match the existing CLAUDE.spec.md formatting style — section headings, separators.)

**Step 3: Verify**

```bash
grep "Language policy exception" 1-spec/CLAUDE.spec.md
```

Expected: 1 hit.

**Step 4: Commit**

```bash
git add 1-spec/CLAUDE.spec.md
git commit -m "docs(spec): add language-policy exception for bilingual artefacts

CLAUDE.md mandates English for AI outputs; editorial-voice.md is bilingual
by design (it documents bilingual product copy). Without an explicit
exception, future agents may 'fix' it. This note prevents that.

From Task 1 quality review of the editorial-framing pivot."
```

---

### Task 3.3: Broaden `.github/CODEOWNERS` to cover governance artefacts

**Why:** Task 3 quality review (in the prior plan) flagged `contracts/`, `3-code/tasks.md`, `docs/plans/` as candidates for ownership. The current scope is "editorial-policy + SDLC governance directories"; these are governance-flavored too.

**Files:**
- Modify: `.github/CODEOWNERS`

**Step 1: Read current CODEOWNERS**

```bash
cat .github/CODEOWNERS
```

**Step 2: Add 3 new lines after the existing SDLC-governance block**

Use Edit. Find the existing tail block:
```
# Spec, decisions, and design artefacts: project-level governance.
1-spec/                                         @DYAI2025
decisions/                                      @DYAI2025
2-design/                                       @DYAI2025
```

Append:
```
contracts/                                      @DYAI2025
3-code/tasks.md                                 @DYAI2025
docs/plans/                                     @DYAI2025
```

**Step 3: Verify**

```bash
grep "contracts/" .github/CODEOWNERS
grep "tasks.md" .github/CODEOWNERS
grep "docs/plans/" .github/CODEOWNERS
```

Expected: 1 hit each.

**Step 4: Commit**

```bash
git add .github/CODEOWNERS
git commit -m "$(cat <<'EOF'
docs(governance): broaden CODEOWNERS to cover governance artefacts

Adds:
- contracts/   — public API contract + smoke checklist (governance-flavored)
- 3-code/tasks.md — implementation plan tracking
- docs/plans/  — plan documents driving multi-task execution

All same owner @DYAI2025. From Task 3 quality review's coverage
suggestion (prior code-review-findings-fix plan).
EOF
)"
```

---

**Phase 3 outcome**: governance + template precedents codified. Future REQs can use `## Implementation` as a documented optional section. DE-prose exception is recorded so language-mandate enforcement doesn't trample bilingual artefacts. CODEOWNERS now covers the project's governance surface broadly.

---

## Out of scope (deferred to even later iterations)

The elite review noted these as **future-state concerns**, not current findings:

1. **REQ Pivot-context churn pattern** — the `## Pivot context` section in `REQ-USA-editorial-framing-reflection.md` works for one rewrite. If the REQ rewrites again, we need a convention: replace-not-append. Not actionable until a 2nd rewrite happens.

2. **Subagent-driven workflow vocabulary improvements** — codifying when per-task review consolidation is safe; pre-authorizing `decisions/*.history.md` carve-outs. Process improvement for the upstream `superpowers:subagent-driven-development` skill, not this repo.

3. **Multi-occurrence per line** — script reports one hint per line even if a watchword appears 3 times. Documented contract; flagged as defensible.

4. **Negation-aware matching** — explicitly accepted v1 limitation. Revisit only if reviewer fatigue emerges (~13 hits in 100KB file currently — manageable).

---

## Summary

| Phase | Tasks | Outcome | Defer-OK? |
|---|---|---|---|
| **1** Critical | 1.1, 1.2, 1.3 (3 tasks) | Pivot plan complete; CLAUDE.md broken-link de-linked; verification clean | ❌ Must finish before push |
| **2** Hardening | 2.1, 2.2, 2.3, 2.4 (4 tasks) | Magic-number constants, control-char filter, path-in-error-msg, robust test cleanup; suite 39 → 40 | ⚠️ Strongly recommended, can defer |
| **3** Governance | 3.1, 3.2, 3.3 (3 tasks) | REQ template `## Implementation` codified; DE-prose exception note; CODEOWNERS broadened | ✅ Defer-OK |

**Total: 10 tasks, ~10 commits.**

Each task = atomic commit. Phase 1 is the priority (finishes the pivot, addresses the elite-review's only "action-required-within-this-plan" finding). Phases 2 and 3 can land in the same batch or be deferred to a later session — explicit choice point at the end of Phase 1.
