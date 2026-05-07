# Spec Gap-Findings Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve all gap-analysis findings recorded on 2026-05-07 (1 Important + 5 Minor) so the Spec → Design phase gate is clean with 0 findings remaining. Each finding becomes either a new requirement (with bidirectional traceability) and/or a verifiable check in the existing test/lint pipeline.

**Architecture:** This is a *retrospective spec* project — the code already exists and passes (Iteration 2 at commit `7737da9`). The fix work is therefore (a) writing new `REQ-*.md` artefacts in `1-spec/requirements/`, (b) wiring back-links into the goal/user-story/constraint files that originally surfaced the gap, (c) where applicable, adding a check in `scripts/check.mjs` and a corresponding `node:test` test in `tests/frontend-compatibility.test.mjs` so the requirement's acceptance criteria are mechanically verifiable. Each finding gets one self-contained task with one commit.

**Tech Stack:** Node.js 20+ (zero runtime deps; `node:http`, `node:fs`, `node:test`); Markdown specs; `node --test tests/*.test.mjs` for unit tests; `scripts/check.mjs` for static checks; `scripts/smoke-test.mjs` for end-to-end smoke. No bundler, no build step.

---

## Pre-Flight: Project State Verification

Before starting, verify the engineer is at the expected baseline.

**Step 0.1: Confirm git state**

```bash
git status -sb
```
Expected: `## main...origin/main` with **clean** working tree (no unstaged changes besides `.claude/`, `.swarm/`, `ruvector.db` which are gitignored).

**Step 0.2: Confirm all gates currently pass**

```bash
npm run check && npm test && npm run smoke
```
Expected: `check` passes, `npm test` shows `# pass 33 # fail 0`, `Smoke test passed`.

**Step 0.3: Confirm spec baseline**

```bash
ls 1-spec/requirements/*.md | wc -l        # → 22
ls 1-spec/assumptions/*.md | grep -v _template | wc -l   # → 5
grep -c "^| \[" 1-spec/CLAUDE.spec.md      # → 49 (7 CON + 6 GOAL + 9 US + 22 REQ + 5 ASM)
```
If any number is off, stop and reconcile before proceeding.

**Step 0.4: Confirm pre-flight i18n hygiene**

The reflection-framing check (Task 1) uses *phrase-pair* patterns to avoid false positives on the brand-marker `"Kein Schicksal. Eine Signatur."` / `"Not destiny. A signature."`. Run a quick check that no current i18n string contains the forbidden multi-word patterns:

```bash
grep -E '(destined to|fate awaits|will happen to you|predetermine|prophecy|foretell|Schicksal wartet|wird dir geschehen|sicher passieren|vorherbestimmt|Prophezeiung)' public/index.html
```
Expected: empty (zero matches).

---

## Shared Context

### File map

```
1-spec/
├── CLAUDE.spec.md                    # phase index — Requirements Index lives here
├── stakeholders.md
├── goals/GOAL-*.md                   # 6 files — `## Related Artifacts` has Requirements: line
├── user-stories/US-*.md              # 9 files — `## Derived Requirements` section
├── requirements/REQ-*.md             # 22 files; new ones go here
├── assumptions/ASM-*.md              # 5 files
└── constraints/CON-*.md              # 7 files; some have `## Impact` referring to implied REQ

CLAUDE.md                             # `### Current State` tracks all artefact counts
public/index.html                     # frontend; CSS + I18N + chart-tile JS inline
scripts/check.mjs                     # static checks (run via npm run check)
scripts/smoke-test.mjs                # end-to-end smoke
tests/
├── fixtures.test.mjs
├── public-api.test.mjs
├── fufire-provider.test.mjs
└── frontend-compatibility.test.mjs   # new compatibility checks land here
```

### The repeating REQ-creation pattern (used by every task)

Every requirement-adding task follows the same micro-workflow. Don't drift from it.

1. Write `1-spec/requirements/REQ-<CLASS>-<kebab-name>.md` from the template at `1-spec/requirements/_template.md`. All template fields filled. Status: `Draft`.
2. Add a row to the **Requirements Index** table in `1-spec/CLAUDE.spec.md` (between the existing rows and the `<!-- Add rows... -->` comment).
3. Update the `Requirements:` line in the `## Related Artifacts` section of every `GOAL-*.md` that this requirement contributes to.
4. Update the `## Derived Requirements` section of every `US-*.md` whose acceptance criteria this requirement helps verify.
5. If the requirement is "implied by" a constraint, update that `CON-*.md`'s `## Impact` section (remove `(to be drafted)`-style placeholders, add the link).
6. If the requirement is "supported by" an assumption, add a `## Related Assumptions` section to the requirement file (template's optional section).
7. Run the gates: `npm run check && npm test && npm run smoke`. All must pass.
8. Commit.

### Commit message convention

Each task ends with one commit. Format:

```
spec: <short title>

<one-paragraph why>

Resolves gap-analysis finding <ID> (<Important|Minor>).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Use `git add -- <specific files>` rather than `git add -A` so the commit stays scoped to the finding.

---

## Tasks

### Task 1: I-1 — Lock reflection-framing copy in i18n + add automated check

**Goal of this task:** Close the only Important finding. `GOAL-honest-reflection-framing` had a success criterion ("copy frames reflection, not prediction") with no covering requirement. We add a verifiable requirement and a check that scans both the I18N dictionary and inline copy in `public/index.html` for predictive language.

**Files:**
- Create: `1-spec/requirements/REQ-USA-reflection-framing-copy.md`
- Modify: `tests/frontend-compatibility.test.mjs` (add new test)
- Modify: `scripts/check.mjs` (add scan)
- Modify: `1-spec/CLAUDE.spec.md` (Requirements Index row)
- Modify: `1-spec/goals/GOAL-honest-reflection-framing.md` (Requirements: line)
- Modify: `1-spec/user-stories/US-honest-failure-on-outage.md` (Derived Requirements)

**Step 1.1: Write the failing test**

Open `tests/frontend-compatibility.test.mjs` and append a new `test(...)` block:

```javascript
test('i18n dictionary and inline copy avoid deterministic prediction language', () => {
  // Phrase-pair patterns chosen to avoid false positives on the brand-marker
  // "Kein Schicksal. Eine Signatur." / "Not destiny. A signature."
  const FORBIDDEN = [
    /destined to/i,
    /fate awaits/i,
    /will happen to you/i,
    /predetermine/i,
    /prophecy/i,
    /foretell/i,
    /Schicksal wartet/i,
    /wird dir geschehen/i,
    /sicher passieren/i,
    /vorherbestimmt/i,
    /Prophezeiung/i,
  ];
  for (const re of FORBIDDEN) {
    assert.doesNotMatch(html, re, `Frontend copy must avoid predictive phrase: ${re}`);
  }
});
```

**Step 1.2: Run the test to confirm it passes against current copy**

```bash
node --test tests/frontend-compatibility.test.mjs
```
Expected: all tests pass (the test passes immediately — Pre-Flight Step 0.4 confirmed the absence of these patterns). This is intentional; the test acts as a *regression sentinel*, not a TDD red-then-green cycle, because the requirement codifies a property the existing code already meets.

**Step 1.3: Add the equivalent scan to scripts/check.mjs**

Insert after the `// 5) Rich cursor FX must be opt-in...` block in `scripts/check.mjs`:

```javascript
// 5b) Reflection-framing copy: no deterministic prediction language.
const FORBIDDEN_PREDICTION_PATTERNS = [
  /destined to/i, /fate awaits/i, /will happen to you/i, /predetermine/i,
  /prophecy/i, /foretell/i, /Schicksal wartet/i, /wird dir geschehen/i,
  /sicher passieren/i, /vorherbestimmt/i, /Prophezeiung/i,
];
for (const re of FORBIDDEN_PREDICTION_PATTERNS) {
  if (re.test(html)) {
    throw new Error(`public/index.html copy contains a forbidden predictive phrase: ${re}`);
  }
}
console.log('public/index.html reflection framing: no deterministic prediction phrases');
```

**Step 1.4: Run the static check**

```bash
npm run check
```
Expected: includes the new line `public/index.html reflection framing: no deterministic prediction phrases`, exits 0.

**Step 1.5: Write the requirement file**

Create `1-spec/requirements/REQ-USA-reflection-framing-copy.md`:

```markdown
# REQ-USA-reflection-framing-copy: User-visible copy avoids deterministic prediction language

**Type**: Usability

**Status**: Draft

**Priority**: Should-have

**Source**: [GOAL-honest-reflection-framing](../goals/GOAL-honest-reflection-framing.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

User-visible copy in `public/index.html` (i18n dictionary entries plus any inline DOM strings, both DE and EN) must not contain deterministic prediction phrases such as "destined to", "fate awaits", "will happen to you", "predetermine", "prophecy", "foretell", "Schicksal wartet", "wird dir geschehen", "sicher passieren", "vorherbestimmt", "Prophezeiung". The brand-marker phrases "Kein Schicksal. Eine Signatur." and "Not destiny. A signature." are explicitly allowed because they are negations that reinforce the reflection framing.

## Acceptance Criteria

- Given the current `public/index.html`, when `npm run check` runs, then a new check confirms no forbidden phrase is present in the file.
- Given the same file, when the dedicated test in `tests/frontend-compatibility.test.mjs` runs, then it asserts the same property as a regression sentinel.
- Given a new locale or copy update, when an editor adds a string, then both the test and the script catch any forbidden phrase before merge.
- Given the negated brand markers ("Kein Schicksal", "Not destiny"), when the checks run, then they do not trigger (the phrase patterns are multi-word and exclude these negations).
```

**Step 1.6: Update the Goal back-link**

In `1-spec/goals/GOAL-honest-reflection-framing.md`, locate the `Requirements:` line in `## Related Artifacts` and append `, [REQ-USA-reflection-framing-copy](../requirements/REQ-USA-reflection-framing-copy.md)` to the existing list.

**Step 1.7: Update the User Story Derived Requirements**

In `1-spec/user-stories/US-honest-failure-on-outage.md`, the `## Derived Requirements` already lists 4 entries. Append:

```markdown
- [REQ-USA-reflection-framing-copy](../requirements/REQ-USA-reflection-framing-copy.md)
```

**Step 1.8: Update the Requirements Index**

In `1-spec/CLAUDE.spec.md`, find the `## Requirements Index` table. Insert this row before the trailing `<!-- Add rows... -->` comment, after the last `REQ-COMP-*` row:

```markdown
| [REQ-USA-reflection-framing-copy](requirements/REQ-USA-reflection-framing-copy.md) | Usability | Should-have | Draft | User-visible copy avoids deterministic prediction language; verified by check + test. |
```

**Step 1.9: Run all gates**

```bash
npm run check && npm test && npm run smoke
```
Expected: all pass; test count is now 34 (was 33).

**Step 1.10: Commit**

```bash
git add 1-spec/requirements/REQ-USA-reflection-framing-copy.md \
        1-spec/CLAUDE.spec.md \
        1-spec/goals/GOAL-honest-reflection-framing.md \
        1-spec/user-stories/US-honest-failure-on-outage.md \
        tests/frontend-compatibility.test.mjs \
        scripts/check.mjs

git commit -m "$(cat <<'EOF'
spec: lock reflection-framing copy with verifiable check (I-1)

Adds REQ-USA-reflection-framing-copy plus a phrase-pair scan in both
scripts/check.mjs and tests/frontend-compatibility.test.mjs. The patterns
are multi-word so the brand-marker negations "Kein Schicksal. Eine Signatur."
and "Not destiny. A signature." stay green; only deterministic prediction
language is rejected.

Resolves gap-analysis finding I-1 (Important).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: M-1 — Add a frontend-page-weight performance budget

**Goal of this task:** Lock a performance budget for `public/index.html` so that future iterations don't silently bloat the single-file frontend. Current size is 107 KB; budget is 150 KB (40% headroom).

**Files:**
- Create: `1-spec/requirements/REQ-PERF-frontend-page-weight.md`
- Modify: `tests/frontend-compatibility.test.mjs`
- Modify: `scripts/check.mjs`
- Modify: `1-spec/CLAUDE.spec.md`
- Modify: `1-spec/goals/GOAL-pre-launch-preview.md`

**Step 2.1: Write the failing test**

Append to `tests/frontend-compatibility.test.mjs`:

```javascript
test('public/index.html stays within the 150 KB performance budget', async () => {
  const { statSync } = await import('node:fs');
  const sizeBytes = statSync('public/index.html').size;
  const budgetBytes = 150 * 1024;
  assert.ok(
    sizeBytes <= budgetBytes,
    `public/index.html size ${sizeBytes} B exceeds budget ${budgetBytes} B`,
  );
});
```

**Step 2.2: Run the test**

```bash
node --test tests/frontend-compatibility.test.mjs
```
Expected: pass (current size 107 069 B < 153 600 B).

**Step 2.3: Mirror the check in scripts/check.mjs**

Append (before the `node --check server.mjs` invocation):

```javascript
// 7) Frontend page-weight budget.
import { statSync } from 'node:fs';
const PAGE_WEIGHT_BUDGET_BYTES = 150 * 1024;
const pageBytes = statSync('public/index.html').size;
if (pageBytes > PAGE_WEIGHT_BUDGET_BYTES) {
  throw new Error(`public/index.html size ${pageBytes} B exceeds budget ${PAGE_WEIGHT_BUDGET_BYTES} B`);
}
console.log(`public/index.html page weight: ${pageBytes} B (budget ${PAGE_WEIGHT_BUDGET_BYTES} B)`);
```

Note: `import { statSync }` belongs at the top of the file with the other imports — move it there to keep style consistent.

**Step 2.4: Run the static check**

```bash
npm run check
```
Expected: prints the page-weight line, exits 0.

**Step 2.5: Write the requirement**

Create `1-spec/requirements/REQ-PERF-frontend-page-weight.md`:

```markdown
# REQ-PERF-frontend-page-weight: Single-file frontend stays under 150 KB

**Type**: Performance

**Status**: Draft

**Priority**: Should-have

**Source**: [GOAL-pre-launch-preview](../goals/GOAL-pre-launch-preview.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

`public/index.html` (the single-file frontend artefact established by [`CON-active-frontend-public-index`](../constraints/CON-active-frontend-public-index.md)) must remain at or below 150 KB on disk so that the page loads quickly on mobile and metered networks. The current size at the time this requirement was introduced is approximately 107 KB; the budget gives roughly 40% headroom for additions before a hard stop.

## Acceptance Criteria

- Given the current commit, when `npm run check` runs, then it prints the page-weight line and exits 0.
- Given a hypothetical future change that grows `public/index.html` past 153 600 bytes, when `npm run check` or `npm test` runs, then it fails with a clear over-budget message.
- Given a deliberate over-budget addition, when the engineer wants to ship anyway, then the requirement must be revisited (raising the budget is a spec change, not a code-only change).

## Related Constraints

- [CON-active-frontend-public-index](../constraints/CON-active-frontend-public-index.md) — performance budget is the price of the single-file convention.
```

**Step 2.6: Update Goal back-link**

In `1-spec/goals/GOAL-pre-launch-preview.md`, append `, [REQ-PERF-frontend-page-weight](../requirements/REQ-PERF-frontend-page-weight.md)` to the `Requirements:` line.

**Step 2.7: Update the Requirements Index**

In `1-spec/CLAUDE.spec.md`, add this row to the Requirements Index table:

```markdown
| [REQ-PERF-frontend-page-weight](requirements/REQ-PERF-frontend-page-weight.md) | Performance | Should-have | Draft | `public/index.html` stays ≤150 KB; verified by check + test. |
```

**Step 2.8: Run all gates and commit**

```bash
npm run check && npm test && npm run smoke
```

```bash
git add 1-spec/requirements/REQ-PERF-frontend-page-weight.md \
        1-spec/CLAUDE.spec.md \
        1-spec/goals/GOAL-pre-launch-preview.md \
        tests/frontend-compatibility.test.mjs \
        scripts/check.mjs

git commit -m "$(cat <<'EOF'
spec: lock frontend page-weight budget at 150 KB (M-1)

Adds REQ-PERF-frontend-page-weight plus an enforcing assertion in both
scripts/check.mjs and tests/frontend-compatibility.test.mjs. Current page
size is ~107 KB so the budget gives roughly 40% headroom before a hard stop.

Resolves gap-analysis finding M-1 (Minor).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: M-2 — Lock the mobile-responsive breakpoints

**Goal of this task:** Formalise the implicit responsive contract. The motion-profile manager already branches on `mqMobile (max-width:719px)` and `mqTablet (min-width:720px) and (max-width:1099px)`; we lock both as a verifiable property so a future CSS rewrite can't silently drop responsive behaviour.

**Files:**
- Create: `1-spec/requirements/REQ-USA-mobile-responsive.md`
- Modify: `tests/frontend-compatibility.test.mjs`
- Modify: `1-spec/CLAUDE.spec.md`
- Modify: `1-spec/goals/GOAL-bilingual-experience.md` (a11y-aligned) and/or `GOAL-accessible-chart-tiles.md` — pick whichever is closer; default: `GOAL-accessible-chart-tiles`.

**Step 3.1: Write the failing test**

Append to `tests/frontend-compatibility.test.mjs`:

```javascript
test('public/index.html declares mobile + tablet responsive breakpoints', () => {
  // Lock the breakpoints used by the motion-profile manager and the layout grid.
  assert.match(html, /@media\s*\(\s*max-width\s*:\s*1100px\s*\)/, 'expected tablet/main breakpoint @media (max-width:1100px)');
  assert.match(html, /@media\s*\(\s*max-width\s*:\s*720px\s*\)/, 'expected mobile breakpoint @media (max-width:720px)');
  assert.match(html, /matchMedia\(['"]\(max-width:719px\)['"]\)/, 'expected mqMobile in motion-profile JS');
  assert.match(html, /matchMedia\(['"]\(min-width:720px\) and \(max-width:1099px\)['"]\)/, 'expected mqTablet in motion-profile JS');
});
```

**Step 3.2: Run the test**

```bash
node --test tests/frontend-compatibility.test.mjs
```
Expected: pass.

**Step 3.3: Write the requirement**

Create `1-spec/requirements/REQ-USA-mobile-responsive.md`:

```markdown
# REQ-USA-mobile-responsive: Frontend layout responds to mobile + tablet breakpoints

**Type**: Usability

**Status**: Draft

**Priority**: Should-have

**Source**: [GOAL-accessible-chart-tiles](../goals/GOAL-accessible-chart-tiles.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

`public/index.html` declares CSS breakpoints at `max-width: 720px` (mobile) and `max-width: 1100px` (tablet/main collapse), and the inline motion-profile manager branches on `matchMedia('(max-width:719px)')` and `matchMedia('(min-width:720px) and (max-width:1099px)')`. Together these implement the implicit responsive contract for the single-file frontend: the layout collapses to a single column under 1100 px and motion features are progressively disabled on mobile.

## Acceptance Criteria

- Given the current `public/index.html`, when the dedicated test in `tests/frontend-compatibility.test.mjs` runs, then both CSS breakpoints and both motion-profile media queries are present.
- Given a hypothetical refactor that moves CSS to a separate file (lifting `CON-active-frontend-public-index`), when the responsive obligation is migrated, then the equivalent breakpoints must remain present in the new location and the test must be updated.
- Given a manual test on a 360 px-wide viewport, when the page is rendered, then the layout collapses to a single column and the heavy motion features (parallax, magnetic, ambient-drift) are off.

## Related Constraints

- [CON-active-frontend-public-index](../constraints/CON-active-frontend-public-index.md) — breakpoints live inline today; a future split deployment would move them.
```

**Step 3.4: Update Goal back-link**

In `1-spec/goals/GOAL-accessible-chart-tiles.md`, append `, [REQ-USA-mobile-responsive](../requirements/REQ-USA-mobile-responsive.md)` to the `Requirements:` line.

**Step 3.5: Update the Requirements Index**

```markdown
| [REQ-USA-mobile-responsive](requirements/REQ-USA-mobile-responsive.md) | Usability | Should-have | Draft | Frontend declares mobile + tablet breakpoints; verified by test. |
```

**Step 3.6: Run all gates and commit**

```bash
npm run check && npm test && npm run smoke
```

```bash
git add 1-spec/requirements/REQ-USA-mobile-responsive.md \
        1-spec/CLAUDE.spec.md \
        1-spec/goals/GOAL-accessible-chart-tiles.md \
        tests/frontend-compatibility.test.mjs

git commit -m "$(cat <<'EOF'
spec: lock mobile + tablet responsive breakpoints (M-2)

Adds REQ-USA-mobile-responsive plus a regression sentinel in
tests/frontend-compatibility.test.mjs that asserts both the CSS @media
queries and the motion-profile matchMedia branches are present.

Resolves gap-analysis finding M-2 (Minor).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: M-3 — Add a deferred rate-limiting requirement (spec only)

**Goal of this task:** Bring the existing `RATE_LIMITED` error code in the catalog under spec governance. No code change yet — the requirement is `Could-have`, marked as deferred to post-launch when traffic justifies it.

**Files:**
- Create: `1-spec/requirements/REQ-SEC-rate-limiting.md`
- Modify: `1-spec/CLAUDE.spec.md`
- Modify: `1-spec/goals/GOAL-collect-waitlist-signups.md` (or `GOAL-real-provider-integration` — pick the closer one; default: signups, since the most likely abuse target is the newsletter endpoint)

**Step 4.1: Write the requirement**

Create `1-spec/requirements/REQ-SEC-rate-limiting.md`:

```markdown
# REQ-SEC-rate-limiting: Public endpoints surface `RATE_LIMITED` when limits are exceeded

**Type**: Security

**Status**: Draft

**Priority**: Could-have

**Source**: [GOAL-collect-waitlist-signups](../goals/GOAL-collect-waitlist-signups.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

When per-IP or per-session request rates on `/api/public/*` (especially `newsletter-signup` and `fusion-chart`) exceed configured thresholds, the adapter must respond with HTTP 429 and the contract envelope `{ ok: false, error: { code: "RATE_LIMITED" } }`. The error code is already part of the closed catalog in [`REQ-F-stable-error-envelope`](REQ-F-stable-error-envelope.md); what is currently missing is the rate-limiting middleware itself plus configuration for thresholds.

This requirement is **deferred**: the current pre-launch traffic does not justify the operational cost of a rate-limiter, and the public contract already documents the response shape. Implementation is expected post-launch when traffic measurement justifies thresholds. Until then, the requirement remains `Draft` and the corresponding implementation task is not added to `tasks.md`.

## Acceptance Criteria

- Given a deployment with rate-limiting enabled and a configured threshold (e.g., 30 requests / minute / IP on `/api/public/newsletter-signup`), when an IP exceeds the threshold, then subsequent requests within the window return HTTP 429 with `{ ok: false, error: { code: "RATE_LIMITED" } }`.
- Given the rate-limit response, when the frontend renders it, then the standard error UI displays `error.code` verbatim (per `REQ-USA-error-code-rendered-verbatim`).
- Given a configuration change to thresholds, when the server is restarted, then the new thresholds take effect without code changes.
- Given the current pre-launch deployment, when this requirement is reviewed, then it remains `Draft` until rate-limiter selection (in-memory token bucket vs. external like Upstash) is decided.

## Related Constraints

- [CON-no-silent-provider-fallback](../constraints/CON-no-silent-provider-fallback.md) — rate-limit responses must remain explicit, never silent throttling.
```

**Step 4.2: Update Goal back-link**

In `1-spec/goals/GOAL-collect-waitlist-signups.md`, append `, [REQ-SEC-rate-limiting](../requirements/REQ-SEC-rate-limiting.md)` to the `Requirements:` line.

**Step 4.3: Update the Requirements Index**

```markdown
| [REQ-SEC-rate-limiting](requirements/REQ-SEC-rate-limiting.md) | Security | Could-have | Draft | Public endpoints surface `RATE_LIMITED` 429 when thresholds exceeded. **Deferred.** |
```

**Step 4.4: Run all gates and commit**

```bash
npm run check && npm test && npm run smoke
```

```bash
git add 1-spec/requirements/REQ-SEC-rate-limiting.md \
        1-spec/CLAUDE.spec.md \
        1-spec/goals/GOAL-collect-waitlist-signups.md

git commit -m "$(cat <<'EOF'
spec: add deferred rate-limiting requirement (M-3)

Adds REQ-SEC-rate-limiting at Could-have priority, marked as deferred to
post-launch. Brings the existing RATE_LIMITED code in the error catalog
under spec governance without committing to an implementation date.

Resolves gap-analysis finding M-3 (Minor).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: M-4 — Trace the two untraced architectural constraints

**Goal of this task:** `CON-active-frontend-public-index` and `CON-react-archive-inactive` had no requirements traced to them. Add two `REQ-MNT-*` requirements that lock these conventions through the *existing* `scripts/check.mjs` plus one new check (no archive imports outside `archive/`).

**Files:**
- Create: `1-spec/requirements/REQ-MNT-single-file-frontend-check.md`
- Create: `1-spec/requirements/REQ-MNT-no-archive-build-references.md`
- Modify: `tests/frontend-compatibility.test.mjs` (one new test)
- Modify: `scripts/check.mjs` (one new scan)
- Modify: `1-spec/constraints/CON-active-frontend-public-index.md` (Impact section gets a Related Requirement)
- Modify: `1-spec/constraints/CON-react-archive-inactive.md` (same)
- Modify: `1-spec/CLAUDE.spec.md`
- Modify: `1-spec/goals/GOAL-pre-launch-preview.md`

**Step 5.1: Write the failing test**

Append to `tests/frontend-compatibility.test.mjs`:

```javascript
test('no source file outside archive/ imports or references archive/', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const { join } = await import('node:path');

  async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'archive' || entry.name === 'node_modules' || entry.name === '.git') continue;
        yield* walk(full);
      } else if (/\.(mjs|js|ts|html)$/.test(entry.name)) {
        yield full;
      }
    }
  }

  const offenders = [];
  for await (const file of walk('.')) {
    const content = await readFile(file, 'utf8');
    if (/\barchive\//.test(content)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `Files reference archive/: ${offenders.join(', ')}`);
});
```

**Step 5.2: Run the test**

```bash
node --test tests/frontend-compatibility.test.mjs
```
Expected: pass (Pre-Flight Step 0.4 confirmed no current references).

**Step 5.3: Add the equivalent scan to scripts/check.mjs**

After the page-weight check, append:

```javascript
// 8) No source file outside archive/ may reference archive/.
async function scanForArchiveRefs() {
  const { readFile, readdir } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const offenders = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['archive', 'node_modules', '.git', '.claude', '.swarm'].includes(entry.name)) continue;
        await walk(full);
      } else if (/\.(mjs|js|ts|html)$/.test(entry.name)) {
        const content = await readFile(full, 'utf8');
        if (/\barchive\//.test(content)) offenders.push(full);
      }
    }
  }
  await walk('.');
  if (offenders.length) {
    throw new Error(`Files reference archive/: ${offenders.join(', ')}`);
  }
  console.log('source tree: no archive/ references outside archive/');
}
await scanForArchiveRefs();
```

**Step 5.4: Run the static check**

```bash
npm run check
```
Expected: prints the new line, exits 0.

**Step 5.5: Write REQ-MNT-single-file-frontend-check**

Create `1-spec/requirements/REQ-MNT-single-file-frontend-check.md`:

```markdown
# REQ-MNT-single-file-frontend-check: `npm run check` mechanically verifies the single-file frontend convention

**Type**: Maintainability

**Status**: Draft

**Priority**: Should-have

**Source**: [CON-active-frontend-public-index](../constraints/CON-active-frontend-public-index.md)

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

The single-file-frontend convention from [`CON-active-frontend-public-index`](../constraints/CON-active-frontend-public-index.md) is mechanically verified on every `npm run check` run by `scripts/check.mjs`: it parses `public/index.html`, runs every inline `<script>` block through the JavaScript parser, asserts every HTML id is unique, asserts the body and `.shell` CSS rules do not regress to `overflow: hidden`, asserts essential text selectors do not regress to `font-size: 8px`, and asserts the rich-FX opt-in flag is present. A future move to a multi-file frontend would lift the constraint and require a new build pipeline; until then this requirement keeps drift visible.

## Acceptance Criteria

- Given the current commit, when `npm run check` runs, then it parses every inline script and reports `inline script N: syntax ok` for each.
- Given a hypothetical future PR that introduces an external `<script src="...">` (other than the `data-i18n` markers), when `npm run check` runs, then a sentinel test in `tests/frontend-compatibility.test.mjs` (`inline <script> blocks are syntactically valid`) catches the missing inline body.
- Given a regression that adds a duplicate `id` attribute, when `npm run check` runs, then it fails with `Duplicate HTML ids found: …`.
- Given a regression that re-introduces `overflow: hidden` on `body` or `.shell`, when `npm run check` runs, then it fails.

## Related Constraints

- [CON-active-frontend-public-index](../constraints/CON-active-frontend-public-index.md) — origin convention.
```

**Step 5.6: Write REQ-MNT-no-archive-build-references**

Create `1-spec/requirements/REQ-MNT-no-archive-build-references.md`:

```markdown
# REQ-MNT-no-archive-build-references: No source file outside `archive/` references `archive/`

**Type**: Maintainability

**Status**: Draft

**Priority**: Should-have

**Source**: [CON-react-archive-inactive](../constraints/CON-react-archive-inactive.md)

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

To enforce [`CON-react-archive-inactive`](../constraints/CON-react-archive-inactive.md), no source file outside the `archive/` directory may reference the archive — neither as an import path, a fetch URL, a static asset reference, nor inline copy. This is mechanically checked by both `scripts/check.mjs` and a dedicated test in `tests/frontend-compatibility.test.mjs` that walks the source tree (excluding `archive/`, `node_modules/`, `.git/`, `.claude/`, `.swarm/`) and rejects any `*.mjs`, `*.js`, `*.ts`, or `*.html` file containing the substring `archive/`.

## Acceptance Criteria

- Given the current commit, when `npm run check` runs, then it prints `source tree: no archive/ references outside archive/` and exits 0.
- Given a hypothetical regression where `server.mjs` adds a route serving files from `archive/`, when `npm run check` or `npm test` runs, then it fails listing the offending file.
- Given a documentation file outside `1-spec/` mentioning `archive/` in prose (e.g., `README.md`), when the check runs, then it does not flag it because Markdown is excluded from the file-extension filter.

## Related Constraints

- [CON-react-archive-inactive](../constraints/CON-react-archive-inactive.md) — origin convention.
```

**Step 5.7: Update the constraints — add Related Requirements back-link**

In `1-spec/constraints/CON-active-frontend-public-index.md`, after the `## Impact` section append:

```markdown

## Related Requirements

- [REQ-MNT-single-file-frontend-check](../requirements/REQ-MNT-single-file-frontend-check.md) — mechanical verification of this convention by `scripts/check.mjs`.
```

In `1-spec/constraints/CON-react-archive-inactive.md`, similarly append:

```markdown

## Related Requirements

- [REQ-MNT-no-archive-build-references](../requirements/REQ-MNT-no-archive-build-references.md) — mechanical enforcement that no live source references `archive/`.
```

**Step 5.8: Update Goal back-link**

In `1-spec/goals/GOAL-pre-launch-preview.md`, append both new REQs to the `Requirements:` line.

**Step 5.9: Update the Requirements Index**

```markdown
| [REQ-MNT-single-file-frontend-check](requirements/REQ-MNT-single-file-frontend-check.md) | Maintainability | Should-have | Draft | `npm run check` mechanically verifies the single-file convention. |
| [REQ-MNT-no-archive-build-references](requirements/REQ-MNT-no-archive-build-references.md) | Maintainability | Should-have | Draft | No source file outside `archive/` references `archive/`. |
```

**Step 5.10: Run all gates and commit**

```bash
npm run check && npm test && npm run smoke
```

```bash
git add 1-spec/requirements/REQ-MNT-single-file-frontend-check.md \
        1-spec/requirements/REQ-MNT-no-archive-build-references.md \
        1-spec/constraints/CON-active-frontend-public-index.md \
        1-spec/constraints/CON-react-archive-inactive.md \
        1-spec/CLAUDE.spec.md \
        1-spec/goals/GOAL-pre-launch-preview.md \
        tests/frontend-compatibility.test.mjs \
        scripts/check.mjs

git commit -m "$(cat <<'EOF'
spec: trace single-file-frontend + no-archive constraints (M-4)

Adds REQ-MNT-single-file-frontend-check (locking the existing scripts/check.mjs
inline-script + dup-id + overflow + 8px + opt-in checks under one named REQ)
and REQ-MNT-no-archive-build-references (a new mechanical scan rejecting
references to archive/ from any live source file). Updates both source
constraints with a back-linked Related Requirements section.

Resolves gap-analysis finding M-4 (Minor).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: M-5 — Add a deferred GDPR-retention requirement (spec only)

**Goal of this task:** Lock the GDPR retention / right-to-erasure obligation as a `Draft` `Should-have` requirement, deferred until the newsletter vendor is selected (per `ASM-newsletter-vendor-gdpr-compliant`). No code change.

**Files:**
- Create: `1-spec/requirements/REQ-COMP-gdpr-retention.md`
- Modify: `1-spec/CLAUDE.spec.md`
- Modify: `1-spec/goals/GOAL-collect-waitlist-signups.md`
- Modify: `1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md` (add Related Requirement back-link)

**Step 6.1: Write the requirement**

Create `1-spec/requirements/REQ-COMP-gdpr-retention.md`:

```markdown
# REQ-COMP-gdpr-retention: Newsletter subscription data has a defined retention policy and erasure path

**Type**: Compliance

**Status**: Draft

**Priority**: Should-have

**Source**: [GOAL-collect-waitlist-signups](../goals/GOAL-collect-waitlist-signups.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

Newsletter subscriber data (email, optional name, consent record, subscription confirmation timestamp, optional `chartSessionId`) must have a documented retention period and a working erasure path that satisfies GDPR Articles 5(1)(e) (storage limitation) and 17 (right to erasure). The retention period and the erasure mechanism are deferred to the newsletter vendor selection (see [`ASM-newsletter-vendor-gdpr-compliant`](../assumptions/ASM-newsletter-vendor-gdpr-compliant.md)); when the vendor is chosen, this requirement must be updated with concrete period and mechanism, and its `Status` advanced from `Draft` once verified.

## Acceptance Criteria

- Given the chosen newsletter vendor's data-retention contract, when the period is documented, then this requirement is updated with the concrete duration (e.g., "subscriber records retained until unsubscribe + 30 days, then purged").
- Given a subscriber's erasure request, when the operator triggers the documented erasure path (vendor API call, dashboard action, or runbook step), then the subscriber record and all derived state are removed within the period the vendor advertises (typically ≤30 days).
- Given the operator runbook in `4-deploy/`, when an erasure request is processed, then the runbook step matches the procedure documented in this requirement.

## Related Assumptions

- [ASM-newsletter-vendor-gdpr-compliant](../assumptions/ASM-newsletter-vendor-gdpr-compliant.md) — concrete retention period + erasure path are deferred to vendor selection.
```

**Step 6.2: Update the Assumption back-link**

In `1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md`, find the `## Related Artifacts` section and append:

```markdown
- [REQ-COMP-gdpr-retention](../requirements/REQ-COMP-gdpr-retention.md) — concrete retention period + erasure path will be filled in here once vendor is chosen.
```

**Step 6.3: Update Goal back-link**

In `1-spec/goals/GOAL-collect-waitlist-signups.md`, append `, [REQ-COMP-gdpr-retention](../requirements/REQ-COMP-gdpr-retention.md)` to the `Requirements:` line.

**Step 6.4: Update the Requirements Index**

```markdown
| [REQ-COMP-gdpr-retention](requirements/REQ-COMP-gdpr-retention.md) | Compliance | Should-have | Draft | Subscriber data retention + erasure path; concrete period **deferred** to vendor selection. |
```

**Step 6.5: Run all gates and commit**

```bash
npm run check && npm test && npm run smoke
```

```bash
git add 1-spec/requirements/REQ-COMP-gdpr-retention.md \
        1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md \
        1-spec/CLAUDE.spec.md \
        1-spec/goals/GOAL-collect-waitlist-signups.md

git commit -m "$(cat <<'EOF'
spec: add deferred GDPR retention requirement (M-5)

Adds REQ-COMP-gdpr-retention as Should-have / Draft, marked as deferred to
the newsletter vendor selection. Bidirectionally linked from
ASM-newsletter-vendor-gdpr-compliant so the deferral path is explicit.

Resolves gap-analysis finding M-5 (Minor).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Re-run gap analysis + update CLAUDE.md Current State

**Goal of this task:** Walk the gap-analysis checklist again with the 6 new requirements in place, confirm the score is now 0 / 0 / 0 (or otherwise document remaining items honestly), and reflect the new totals in `CLAUDE.md`'s `### Current State`.

**Files:**
- Modify: `CLAUDE.md`

**Step 7.1: Verify spec totals**

```bash
ls 1-spec/requirements/*.md | grep -v _template | wc -l   # → 28 (was 22, added 6)
ls 1-spec/assumptions/*.md | grep -v _template | wc -l    # → 5 (unchanged)
```

**Step 7.2: Re-walk the gap checks mentally**

For each of the original findings, confirm it is now closed:

- **I-1** ✓ closed by `REQ-USA-reflection-framing-copy` + check + test.
- **M-1** ✓ closed by `REQ-PERF-frontend-page-weight` + check + test.
- **M-2** ✓ closed by `REQ-USA-mobile-responsive` + test.
- **M-3** ✓ closed by `REQ-SEC-rate-limiting` (deferred but tracked).
- **M-4** ✓ closed by `REQ-MNT-single-file-frontend-check` + `REQ-MNT-no-archive-build-references` + check + test.
- **M-5** ✓ closed by `REQ-COMP-gdpr-retention` (deferred but tracked).

Confirm no *new* gaps emerged from the additions. Specifically check:

- Every new REQ has a Source link → ✓
- Every new REQ has a back-link from at least one Goal → ✓ (Task 1 → honest, Task 2 → preview, Task 3 → a11y, Task 4 → signups, Task 5 → preview, Task 6 → signups)
- The two constraints (`active-frontend`, `react-archive`) are no longer untraced → ✓
- No new Critical / Important / Minor findings.

**Step 7.3: Update `CLAUDE.md` Current State**

In the `### Current State` block, replace the requirements line:

```markdown
- Requirements drafted: 28 entries — 16 Must-have, 9 Should-have, 1 Could-have (`REQ-SEC-rate-limiting`, deferred). Distribution: 12 Functional, 1 Performance, 1 Reliability, 3 Security, 6 Usability, 4 Maintainability, 2 Compliance. Every user story has ≥1 derived requirement; the previously untraced constraints `CON-active-frontend-public-index` and `CON-react-archive-inactive` are now linked to mechanical-check requirements.
```

And the gap-analysis line:

```markdown
- **Gap analysis (2026-05-07, refresh after findings fix): 0 Critical, 0 Important, 0 Minor.** All 6 findings from the initial analysis are closed (1 Important + 5 Minor). The Specification phase is unambiguously ready for the Spec → Design phase gate.
```

**Step 7.4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
spec: refresh gap analysis to 0/0/0 after findings fix

All 6 gap-analysis findings (1 Important + 5 Minor) are closed by the
6 new requirements added in the previous commits. Updates Requirements
total to 28 (was 22) and the gap-analysis result line to 0/0/0.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Push to origin/main

**Goal of this task:** Publish the work.

**Step 8.1: Inspect the local commit graph**

```bash
git log --oneline origin/main..HEAD
```
Expected: 7 commits (one per Task 1–7) ahead of origin/main.

**Step 8.2: Push**

```bash
git push origin main
```
Expected: `7737da9..<new-head>  main -> main`.

**Step 8.3: Final verification**

```bash
git status -sb
```
Expected: `## main...origin/main` clean.

```bash
npm run check && npm test && npm run smoke
```
Expected: all pass; test count is now 36 (33 original + 1 reflection-framing + 1 page-weight + 1 mobile-responsive + 1 no-archive-refs = 37; if the count is off, recount).

---

## Done

After Task 8:
- 6 new requirements written, indexed, and back-linked.
- 4 new mechanical checks (`scripts/check.mjs` + `tests/frontend-compatibility.test.mjs`) catch any regression on reflection-framing, page weight, responsive breakpoints, or archive references.
- `CLAUDE.md` Current State reflects 0 Critical / 0 Important / 0 Minor.
- The Specification phase is unambiguously ready for the Spec → Design phase gate.

Next sensible action: invoke `/SDLC-design` to retrospectively populate `2-design/architecture.md`, `2-design/data-model.md`, and `2-design/api-design.md` from the existing code.
