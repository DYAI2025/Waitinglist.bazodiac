# Editorial-Framing Pivot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or superpowers:subagent-driven-development for same-session execution) to implement this plan task-by-task.

**Goal:** Replace the forbidden-phrase blacklist (mechanical fail-build) with an editorial guideline document plus a non-blocking soft-hint linter, so that Bazodiac's own anti-prediction brand voice ("Kein Horoskop-Versprechen", "Kein Schicksal. Eine Signatur.") stops being false-flagged as a violation of itself.

**Architecture:** New 1-page `1-spec/editorial-voice.md` replaces the deleted `4-deploy/runbooks/editorial-framing-lexicon.md`. New `scripts/check-editorial-voice.mjs` (zero deps) reads the doc's `## Watchwords` bullet section and emits non-fatal hints when watchwords appear in `public/index.html`. Script is invoked via `npm run editorial-hints` — explicitly NOT wired into `npm run check`. `DEC-data-as-fenced-markdown-blocks` is deprecated. The Approved REQ-USA-editorial-framing-reflection is rewritten and reverts to Draft for re-approval.

**Tech Stack:** Node.js 20+ built-ins only (`node:fs/promises`, `node:path`, `node:url`); `node:test` for the test suite; Markdown for docs. No dependencies added. Reference: `docs/plans/2026-05-07-editorial-framing-pivot-design.md` (commit `d16a030`).

---

## Pre-Flight: Project State Verification

**Step 0.1: Confirm git state**

```bash
git status -sb
git log --oneline -5
```

**Expected:**
- Branch `main`, up-to-date with `origin/main` after `d16a030` (the design doc commit) — or with at most uncommitted unrelated changes from outside this repo's working tree (the home-dir's separate git repo). The design doc (`docs/plans/2026-05-07-editorial-framing-pivot-design.md`) must be committed before starting Task 1.
- `git log --oneline` shows `d16a030 docs(plans): editorial-framing pivot design` as HEAD.

**Step 0.2: Confirm prerequisites exist**

```bash
ls 1-spec/requirements/REQ-USA-editorial-framing-reflection.md \
   2-design/architecture.md \
   3-code/frontend/CLAUDE.component.md \
   3-code/adapter/CLAUDE.component.md \
   1-spec/CLAUDE.spec.md \
   2-design/CLAUDE.design.md \
   4-deploy/CLAUDE.deploy.md \
   .github/CODEOWNERS \
   4-deploy/runbooks/editorial-framing-lexicon.md \
   decisions/DEC-data-as-fenced-markdown-blocks.md \
   decisions/DEC-data-as-fenced-markdown-blocks.history.md \
   decisions/PROCEDURES.md \
   3-code/tasks.md \
   CLAUDE.md \
   package.json \
   public/index.html \
   docs/plans/2026-05-07-editorial-framing-pivot-design.md
```

**Expected:** all listed files exist. Stop if any is missing.

**Step 0.3: Confirm baseline test suite**

```bash
npm test --silent 2>&1 | tail -5
```

**Expected:** `# tests 33` and `# pass 33`. The pivot must not break this; we'll add new tests in Task 4.

---

## Phase 1 — Forward Construction

### Task 1: Create `1-spec/editorial-voice.md`

**Files:**
- Create: `1-spec/editorial-voice.md`

**Step 1.1: Verify the file does not exist**

```bash
ls 1-spec/editorial-voice.md 2>/dev/null
```

Expected: `No such file or directory`.

**Step 1.2: Create `1-spec/editorial-voice.md`**

Write this exact content:

```markdown
# Editorial Voice

> **Status**: Active
> **Source**: [GOAL-honest-reflection-framing](goals/GOAL-honest-reflection-framing.md)
> **Source stakeholder**: [STK-privacy-compliance-owner](stakeholders.md)
> **Last updated**: 2026-05-07

## Stance in one paragraph

Bazodiac ist kein Horoskop. Es ist ein Reflexionsmodell, das aus echten Chartdaten eine Cosmic Signature destilliert — keine Zukunftsvorhersage, keine Schicksalsdeutung, keine Mystifizierung. Unsere Sprache muss diese Position spiegeln: rational, ehrlich, reflexiv. Begriffe der Horoskop-Tradition (Horoskop, Schicksal, Zukunft) dürfen vorkommen, aber **nur** in negierender oder neu definierender Form ("Kein Horoskop. Eine Signatur.") oder als bewusst markierter Kontrast.

## 4 Prinzipien

1. **Rational vor mystisch** — Begriffe wie "Cosmic Signature", "Wu-Xing", "BaZi" werden präzise verwendet, nicht poetisch verschleiert.
2. **Ehrlich vor versprechend** — keine Aussagen über Zukunft, Persönlichkeit oder Lebensweg in Indikativ-Form. Konjunktiv und Reflexionsfragen sind erwünscht.
3. **Reflexiv vor deklarativ** — Texte laden ein zu erkunden, statt Antworten zu liefern. "Vielleicht zeigt sich…" > "Du bist…".
4. **Negation als Markenstimme** — die Anti-Horoskop-Position wird *explizit* benannt. "Kein Schicksal. Eine Signatur." ist kanonische Bazodiac-Stimme, nicht ein Verstoß.

## 6 Vorher/Nachher-Beispiele

### DE

| ❌ Prediction-asserting | ✅ Reflection-framing |
|---|---|
| "Dein Schicksal ist in den Sternen geschrieben." | "Eine Cosmic Signature lädt zur Reflexion ein." |
| "Du wirst eine wichtige Begegnung haben." | "Vielleicht zeigt sich, dass Begegnungen dich aktuell beschäftigen." |
| "Dein Horoskop sagt voraus, was kommt." | "Kein Horoskop. Eine Signatur." |

### EN

| ❌ Prediction-asserting | ✅ Reflection-framing |
|---|---|
| "Your future will bring change." | "Reflect on which patterns are emerging in your present." |
| "You are destined for greatness." | "Consider which direction feels meaningful right now." |
| "This horoscope predicts your career." | "Not a horoscope. A signature." |

The right-column phrasings are not mandatory templates — they are illustrations of the four principles in action. The Anti-Horoskop position is allowed and welcomed when it is explicit (Beispiel 3 DE / 6 EN).

## Watchwords

Diese Wörter sind nicht verboten. Sie verlangen einen kurzen Editorial-Check beim Review: ist die Verwendung negierend / neu definierend / bewusst kontrastiv? Wenn ja → ok. Wenn nein → umformulieren.

- Horoskop / horoscope
- Schicksal / fate / destiny
- Zukunft / future
- vorhersagen / predict
- versprechen / promise

Das Script `scripts/check-editorial-voice.mjs` flaggt Vorkommnisse als Hinweise — niemals als Fehler. Aufruf via `npm run editorial-hints`.

## How to update this doc

Editorial-Updates per PR an `STK-founder` oder `STK-privacy-compliance-owner` (siehe `.github/CODEOWNERS`). Ein Watchword hinzufügen heißt: ein Beispiel in der Vorher/Nachher-Sektion ergänzen, das zeigt, *warum* das Wort review-würdig ist.
```

**Step 1.3: Verify**

```bash
wc -l 1-spec/editorial-voice.md
grep -c "^## " 1-spec/editorial-voice.md
grep -A 5 "## Watchwords" 1-spec/editorial-voice.md | head -8
```

Expected: ~50 lines; 5 `## ` headings (Stance, Prinzipien, Vorher/Nachher, Watchwords, How to update); the Watchwords section shows the 5 bullets.

**Step 1.4: Commit**

```bash
git add 1-spec/editorial-voice.md
git commit -m "feat(spec): add editorial-voice.md as new source of truth

Replaces the deleted-in-this-pivot 4-deploy/runbooks/editorial-framing-lexicon.md.
4 principles + 6 DE/EN before/after examples + 5 watchwords inline as a
bullet section parseable by the planned scripts/check-editorial-voice.mjs.

Refs: docs/plans/2026-05-07-editorial-framing-pivot-design.md"
```

---

### Task 2: Write failing test for `scripts/check-editorial-voice.mjs`

**TDD red — script does not exist yet.**

**Files:**
- Create: `tests/editorial-voice.test.mjs`

**Step 2.1: Verify test file does not exist**

```bash
ls tests/editorial-voice.test.mjs 2>/dev/null
```

Expected: `No such file or directory`.

**Step 2.2: Create `tests/editorial-voice.test.mjs`**

Write this exact content:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/check-editorial-voice.mjs', import.meta.url));

function runScript(args) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [SCRIPT, ...args]);
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function setupFixtures(voiceContent, targetContent) {
  const dir = await mkdtemp(join(tmpdir(), 'editorial-voice-'));
  const voice = join(dir, 'voice.md');
  const target = join(dir, 'target.html');
  await writeFile(voice, voiceContent);
  await writeFile(target, targetContent);
  return { dir, voice, target };
}

test('emits hint and exits 0 when watchword appears in target', async () => {
  const { dir, voice, target } = await setupFixtures(
    `# x\n\n## Watchwords\n\n- Horoskop / horoscope\n- Schicksal\n\n## End\n`,
    `<p>Kein Horoskop-Versprechen.</p>\n<p>Ohne Schicksalsdeutung.</p>\n`,
  );

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0, 'script must exit 0 even when hits are found');
  assert.match(stdout, /watchword: "Horoskop"/);
  assert.match(stdout, /watchword: "Schicksal"/);
  assert.match(stdout, /Kein Horoskop-Versprechen/);
  assert.match(stdout, /Schicksalsdeutung/);

  await rm(dir, { recursive: true });
});

test('exits 0 with informational message when no watchword hits', async () => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n- Horoskop\n\n## End\n`,
    `<p>Bazodiac is a reflection model.</p>\n`,
  );

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  assert.match(stdout, /no watchword hits/);

  await rm(dir, { recursive: true });
});

test('splits slash-delimited watchwords into separate entries', async () => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n- fate / destiny / Schicksal\n\n## End\n`,
    `<p>your destiny awaits</p>\n<p>Schicksal is heavy</p>\n<p>fate is not a fact</p>\n`,
  );

  const { code, stdout } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 0);
  assert.match(stdout, /watchword: "fate"/);
  assert.match(stdout, /watchword: "destiny"/);
  assert.match(stdout, /watchword: "Schicksal"/);

  await rm(dir, { recursive: true });
});

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

test('exits 2 when Watchwords section is empty', async () => {
  const { dir, voice, target } = await setupFixtures(
    `## Watchwords\n\n## End\n`,
    `<p>x</p>`,
  );

  const { code, stderr } = await runScript(['--voice', voice, '--target', target]);
  assert.equal(code, 2);
  assert.match(stderr, /zero entries/);

  await rm(dir, { recursive: true });
});
```

**Step 2.3: Run test to verify it fails**

```bash
node --test tests/editorial-voice.test.mjs 2>&1 | tail -20
```

Expected: tests fail because `scripts/check-editorial-voice.mjs` does not exist (likely `Cannot find module` or non-zero exit code from spawn). The exact message depends on Node's error reporting; the key signal is **non-zero failure count**.

**Step 2.4: Commit (red state)**

```bash
git add tests/editorial-voice.test.mjs
git commit -m "test(scripts): add failing tests for check-editorial-voice.mjs

TDD red. Covers: hint emission with line context, slash-delimited watchword
splitting, zero-hit informational mode, parser-level loud failure for missing
or empty Watchwords section."
```

---

### Task 3: Implement `scripts/check-editorial-voice.mjs`

**TDD green — make Task 2 tests pass.**

**Files:**
- Create: `scripts/check-editorial-voice.mjs`

**Step 3.1: Verify the script does not exist**

```bash
ls scripts/check-editorial-voice.mjs 2>/dev/null
```

Expected: `No such file or directory`.

**Step 3.2: Create the script**

Write this exact content (note the shebang on line 1):

```javascript
#!/usr/bin/env node
// scripts/check-editorial-voice.mjs
//
// Editorial-voice soft-hint linter (DEC-zero-runtime-deps).
// Reads `1-spec/editorial-voice.md`, extracts the `## Watchwords` bullet list,
// scans `public/index.html`, emits non-fatal hints for each match.
// Always exits 0 on content findings — never fails the build.
// Exits 2 only on parser/file-read errors (loud failure for infrastructure faults).

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

function parseArgs(argv) {
  const args = { voice: null, target: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--voice' && argv[i + 1]) { args.voice = argv[++i]; }
    else if (argv[i] === '--target' && argv[i + 1]) { args.target = argv[++i]; }
  }
  return args;
}

function extractWatchwords(voiceMd) {
  const re = /^## Watchwords\s*$([\s\S]*?)(?=^## |\Z)/m;
  const match = voiceMd.match(re);
  if (!match) {
    throw new Error("editorial-voice doc is missing a `## Watchwords` heading");
  }
  const block = match[1];
  const watchwords = [];
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*-\s*(.+?)\s*$/);
    if (!m) continue;
    const tokens = m[1].split('/').map((s) => s.trim()).filter(Boolean);
    watchwords.push(...tokens);
  }
  if (watchwords.length === 0) {
    throw new Error('editorial-voice doc Watchwords section yielded zero entries');
  }
  return watchwords;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findHints(html, watchwords) {
  const lines = html.split('\n');
  const hints = [];
  for (const watchword of watchwords) {
    const re = new RegExp(escapeRegex(watchword), 'i');
    for (let i = 0; i < lines.length; i++) {
      const idx = lines[i].search(re);
      if (idx === -1) continue;
      const start = Math.max(0, idx - 30);
      const end = Math.min(lines[i].length, idx + watchword.length + 40);
      const prefix = start > 0 ? '...' : '';
      const suffix = end < lines[i].length ? '...' : '';
      const excerpt = `${prefix}${lines[i].slice(start, end).trim()}${suffix}`;
      hints.push({ line: i + 1, watchword, excerpt });
    }
  }
  return hints;
}

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
  const hints = findHints(html, watchwords);

  if (hints.length === 0) {
    console.log(
      `editorial-voice: no watchword hits in ${targetPath} (${watchwords.length} watchword(s) scanned).`,
    );
    return;
  }

  for (const h of hints) {
    console.log(`hint  ${targetPath}:${h.line}  "${h.excerpt}"`);
    console.log(`      watchword: "${h.watchword}" → review: negating/redefining/contrastive?`);
  }
  console.log(`\n(${hints.length} hint(s) total — soft suggestions, not failures.)`);
}

main().catch((err) => {
  console.error(`editorial-voice: ${err.message}`);
  process.exit(2);
});
```

**Step 3.3: Make the script executable (cosmetic; node runs it via shebang or `node script.mjs`)**

```bash
chmod +x scripts/check-editorial-voice.mjs
```

**Step 3.4: Run tests to verify green**

```bash
node --test tests/editorial-voice.test.mjs 2>&1 | tail -10
```

Expected: `# pass 5` (5 tests pass), `# fail 0`. If any test fails, read the failure and adjust the script — do NOT adjust the test (the test was approved as the spec).

**Step 3.5: Run full test suite**

```bash
npm test --silent 2>&1 | tail -5
```

Expected: `# tests 38` (33 prior + 5 new), `# pass 38`, `# fail 0`. If any pre-existing test fails, stop and investigate — the script must not affect other code.

**Step 3.6: Commit**

```bash
git add scripts/check-editorial-voice.mjs
git commit -m "feat(scripts): implement check-editorial-voice.mjs

TDD green — all 5 new tests pass, full suite 38/38.

Soft-hint linter:
- Reads 1-spec/editorial-voice.md by default, --voice override for tests.
- Extracts ## Watchwords bullet list via regex; splits slash-delimited
  watchwords into separate entries.
- Scans public/index.html (or --target) case-insensitively, emits hints
  with line + ~80-char excerpt context.
- Always exits 0 on content findings (soft hint, not a build-gate).
- Exits 2 only on parser/file-read errors (loud failure for missing
  voice doc, missing ## Watchwords heading, or empty Watchwords section
  — DEC-data-as-fenced-markdown-blocks's loud-failure principle preserved
  even though that DEC will be deprecated in this same pivot)."
```

---

### Task 4: Add `npm run editorial-hints` to `package.json`

**Files:**
- Modify: `package.json`

**Step 4.1: Inspect current `package.json` scripts**

```bash
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('package.json', 'utf-8')).scripts, null, 2))"
```

Expected: shows the existing scripts (likely `start`, `check`, `test`, `smoke`).

**Step 4.2: Add the new script entry**

Use the Edit tool to find the `"scripts"` block in `package.json` and add a new entry. The exact addition (insert as the LAST entry inside the scripts object, preserve trailing comma rules):

If the existing block looks like:
```json
"scripts": {
  "start": "node server.mjs",
  "check": "node scripts/check.mjs",
  "test": "node --test tests/*.test.mjs",
  "smoke": "node scripts/smoke-test.mjs"
}
```

Change it to:
```json
"scripts": {
  "start": "node server.mjs",
  "check": "node scripts/check.mjs",
  "test": "node --test tests/*.test.mjs",
  "smoke": "node scripts/smoke-test.mjs",
  "editorial-hints": "node scripts/check-editorial-voice.mjs"
}
```

(The exact existing entries may differ — preserve them all and append the new entry. Mind the trailing-comma rule: the previously-last entry now needs a trailing comma.)

**Step 4.3: Verify the script runs and produces hints**

```bash
npm run editorial-hints 2>&1 | head -30
```

Expected: several `hint  public/index.html:NNN  "..."` lines, with watchwords like `Horoskop`, `Schicksal`, etc. (matching the canonical anti-prediction copy in `public/index.html`). Exit code is 0.

```bash
echo "exit code: $?"
```

Expected: `exit code: 0`.

**Step 4.4: Verify `npm run check` is unaffected (the editorial-hints script is NOT wired into check)**

```bash
npm run check --silent 2>&1 | tail -5
```

Expected: same output as before this pivot (no editorial-voice mention). The hints script must only run when explicitly invoked.

**Step 4.5: Commit**

```bash
git add package.json
git commit -m "feat(npm): add editorial-hints script

npm run editorial-hints invokes scripts/check-editorial-voice.mjs.
Standalone — not wired into npm run check (per the pivot design's
'soft hint, never build-gate' principle).

Reviewer invokes voluntarily before opening PRs or after copy edits."
```

---

## Phase 2 — Reference Updates

### Task 5: Rewrite `REQ-USA-editorial-framing-reflection` + revert Status to Draft

**This is a significant artefact change.** Per the SDLC scaffold's Status-Downgrade rule (`1-spec/CLAUDE.spec.md`), modifying an Approved requirement reverts it to Draft for re-approval. The Founder will need to re-approve in a separate step (out of this plan's scope; flagged in CLAUDE.md sync at Task 13).

**Files:**
- Modify: `1-spec/requirements/REQ-USA-editorial-framing-reflection.md` (full rewrite of body, Status flipped to Draft)

**Step 5.1: Read the current file**

```bash
cat 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
```

**Step 5.2: Replace the file content**

Use the Write tool (after Read above). Replace ENTIRE file content with:

```markdown
# REQ-USA-editorial-framing-reflection: Editorial framing of reflection vs. prediction microcopy

**Type**: Usability

**Status**: Draft

**Priority**: Must-have

**Source**: [GOAL-honest-reflection-framing](../goals/GOAL-honest-reflection-framing.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

Frontend microcopy that interprets chart data must use reflection-oriented phrasing — language that invites consideration, suggests exploration, or frames provisionally — rather than prediction-asserting phrasing that claims certainty about future events. This requirement formalizes the editorial intent of `GOAL-honest-reflection-framing`. Verification is **editorial**, not mechanical: a copy reviewer (or AI agent acting as one) consults the project's editorial-voice guideline and judges each piece of copy in context.

The covered surfaces are: hero copy, the six chart tile tooltips and ARIA labels, the interpretation modal headline and body lead-in, the newsletter consent label, and any error-rendering copy that comments on chart contents.

Words from the horoscope tradition (Horoskop, Schicksal, Zukunft, vorhersagen, versprechen) are not forbidden. They may appear in copy, especially in negating, redefining, or contrastive form ("Kein Horoskop-Versprechen. Eine Signatur."), which is in fact Bazodiac's signature voice. The judgment is whether each occurrence supports the reflection-not-prediction stance.

## Acceptance Criteria

- Given the editorial-voice guideline at [`1-spec/editorial-voice.md`](../editorial-voice.md), when a copy reviewer (human or AI) reads any chart-interpretation surface, then they can confidently classify each piece of copy as reflection-aligned or prediction-asserting.
- Given a copy-change PR touching `public/index.html`, when prepared for merge, then the reviewer has consulted `1-spec/editorial-voice.md` and confirmed alignment with its 4 principles. (`.github/CODEOWNERS` adds an automated review-request to `STK-founder` / `STK-privacy-compliance-owner`.)
- Given the soft-hint script `scripts/check-editorial-voice.mjs` (invoked via `npm run editorial-hints`), when run, then it surfaces watchword occurrences as **non-fatal hints** to assist the reviewer — never as build failures.
- Given DE and EN copy, when both are reviewed, then both meet the same standard (parity with [REQ-USA-i18n-de-en-parity](REQ-USA-i18n-de-en-parity.md)).

## Related Constraints

- [CON-active-frontend-public-index](../constraints/CON-active-frontend-public-index.md) — the editorial review applies to the single active frontend; archive variants are not in scope.
- [CON-no-synthesized-data-in-prod](../constraints/CON-no-synthesized-data-in-prod.md) — editorial framing reinforces the no-synthesis posture by avoiding deterministic claims about chart outputs.

## Implementation

The editorial guideline (principles + examples + watchwords) lives in [`1-spec/editorial-voice.md`](../editorial-voice.md). The soft-hint linter is `scripts/check-editorial-voice.mjs`, invoked via `npm run editorial-hints`.

## Pivot context

This requirement was rewritten on 2026-05-07 in the editorial-framing pivot. The prior version mandated a forbidden-phrase blacklist and a fail-build script — that approach was abandoned because it false-flagged Bazodiac's own anti-prediction brand voice ("Kein Horoskop-Versprechen", "Kein Schicksal. Eine Signatur."). The new approach treats brand voice as an editorial values question requiring human judgment, supported (not enforced) by a soft-hint linter. See [`docs/plans/2026-05-07-editorial-framing-pivot-design.md`](../../docs/plans/2026-05-07-editorial-framing-pivot-design.md) for the full rationale.
```

**Step 5.3: Verify Status downgrade**

```bash
grep "^\*\*Status\*\*" 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
```

Expected: `**Status**: Draft`.

**Step 5.4: Commit**

```bash
git add 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
git commit -m "docs(spec): rewrite REQ-USA-editorial-framing-reflection (Approved→Draft)

Editorial-framing pivot: shift from mechanical forbidden-phrase grep
to editorial values judgment supported by a soft-hint linter.

Status: Approved → Draft per the SDLC scaffold's Status-Downgrade
rule (substantive content change). Founder re-approval needed before
phase-gate work resumes.

Acceptance criteria reframed:
- Editorial review (human or AI) of chart-interpretation surfaces
  against 1-spec/editorial-voice.md.
- CODEOWNERS-driven sign-off on copy-change PRs.
- Soft-hint linter (npm run editorial-hints) provides non-fatal hints
  to support — never replace — the reviewer.

Refs: docs/plans/2026-05-07-editorial-framing-pivot-design.md"
```

---

### Task 6: Update `2-design/architecture.md` Frontend section + Coverage row

**Files:**
- Modify: `2-design/architecture.md`

**Step 6.1: Read the Frontend section**

```bash
sed -n '/### Frontend/,/### Adapter/p' 2-design/architecture.md
```

The current text contains a paragraph about the editorial framing blacklist + microtypography (added in the prior plan's Task 5). It must be replaced.

**Step 6.2: Replace the paragraph**

Use Edit tool. Find the existing paragraph:

```
Editorial framing: all chart-interpretation microcopy uses reflection-oriented phrasing, never prediction-asserting (`REQ-USA-editorial-framing-reflection`). The forbidden-phrase blacklist (DE: `Schicksal`, `Vorhersage`, `Horoskop`, `wird sein`, `wird passieren`, `bestimmt sein`; EN: `you will be`, `predicts`, `destined`, `your future`, `horoscope`, `fortune-tells`) and reflection-token requirement are enforced by `scripts/check-editorial-framing.mjs` (planned — to be added to `npm run check`); the reflection-token presence remains a manual editorial review until the lexicon is finalized. Microtypography: essential UI text (`.stat .k`, `.wuxing-vec .lab`, `.wuxing-bars .el .name`, `.bento .ck .label`, `.bento .v small`, `.interpretation .kv span`, `.modal-foot .note`) uses ≥10px (`REQ-USA-no-8px-essential-text`).
```

Replace with:

```
Editorial framing: chart-interpretation microcopy follows the editorial guideline at [`1-spec/editorial-voice.md`](../1-spec/editorial-voice.md), formalized by `REQ-USA-editorial-framing-reflection`. The guideline's 4 principles (rational-vor-mystisch, ehrlich-vor-versprechend, reflexiv-vor-deklarativ, negation-als-markenstimme) are reviewed by humans (or AI acting as reviewers) per PR; the soft-hint linter `scripts/check-editorial-voice.mjs` (invoked via `npm run editorial-hints`) surfaces watchword occurrences as non-fatal hints to assist review — explicitly NOT a build-gate. Words from the horoscope tradition are allowed in negating or redefining form ("Kein Horoskop-Versprechen. Eine Signatur."), which is canonical Bazodiac voice. Microtypography: essential UI text (`.stat .k`, `.wuxing-vec .lab`, `.wuxing-bars .el .name`, `.bento .ck .label`, `.bento .v small`, `.interpretation .kv span`, `.modal-foot .note`) uses ≥10px (`REQ-USA-no-8px-essential-text`).
```

**Step 6.3: Update the Coverage row for the REQ**

Find this row in the `## Requirement Coverage Summary` table:

```
| [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | Frontend microcopy in `public/index.html`; mechanical check via planned `scripts/check-editorial-framing.mjs`; manual editorial review for reflection-token presence |
```

Replace with:

```
| [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | Frontend microcopy in `public/index.html`; editorial review per [`1-spec/editorial-voice.md`](../1-spec/editorial-voice.md); soft-hint linter `scripts/check-editorial-voice.mjs` (npm run editorial-hints) provides non-fatal review hints |
```

**Step 6.4: Verify**

```bash
grep -c "editorial-voice" 2-design/architecture.md
grep -c "check-editorial-framing" 2-design/architecture.md
```

Expected: at least 2 hits for `editorial-voice`; **zero hits** for `check-editorial-framing` (the old script name should be gone).

**Step 6.5: Commit**

```bash
git add 2-design/architecture.md
git commit -m "docs(design): update architecture.md for editorial-framing pivot

Frontend section: replace blacklist+reflection-token paragraph with
reference to 1-spec/editorial-voice.md + soft-hint linter.

Coverage table: REQ-USA-editorial-framing-reflection row updated to
point at editorial-voice.md and the soft-hint linter; old
'mechanical check + manual reflection-token review' wording removed.

Old script name (check-editorial-framing.mjs) no longer mentioned;
new name (check-editorial-voice.mjs) reflected throughout."
```

---

### Task 7: Update `3-code/frontend/CLAUDE.component.md` REQ summary

**Files:**
- Modify: `3-code/frontend/CLAUDE.component.md`

**Step 7.1: Find the REQ row**

```bash
grep "REQ-USA-editorial-framing-reflection" 3-code/frontend/CLAUDE.component.md
```

Expected: one row in the Requirements Addressed table referencing the REQ. Read its context to understand the current summary text.

**Step 7.2: Replace the summary**

Use Edit. The current row (text was set in the prior plan's Task 5 lexicon hardening):

```
| [REQ-USA-editorial-framing-reflection](../../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | Usability | Must-have | Microcopy uses reflection-oriented phrasing, never prediction-asserting; verified via forbidden-phrase grep + manual editorial review. |
```

Replace with:

```
| [REQ-USA-editorial-framing-reflection](../../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | Usability | Must-have | Microcopy follows the editorial guideline at `1-spec/editorial-voice.md`; reviewed editorially per PR; `npm run editorial-hints` provides non-fatal hints. |
```

**Step 7.3: Verify**

```bash
grep "editorial-voice.md" 3-code/frontend/CLAUDE.component.md
grep "forbidden-phrase grep" 3-code/frontend/CLAUDE.component.md
```

Expected: ≥1 hit for `editorial-voice.md`; **zero hits** for `forbidden-phrase grep`.

**Step 7.4: Commit**

```bash
git add 3-code/frontend/CLAUDE.component.md
git commit -m "docs(component): update frontend REQ summary for pivot

REQ-USA-editorial-framing-reflection summary in the Requirements
Addressed table now references 1-spec/editorial-voice.md and
npm run editorial-hints, replacing the old 'forbidden-phrase grep
+ manual editorial review' wording."
```

---

### Task 8: Update `3-code/adapter/CLAUDE.component.md` REQ summary

The adapter component does NOT directly own this REQ (it's a frontend concern), but the prior plan added a reference. Check if it's actually present.

**Files:**
- Modify (conditionally): `3-code/adapter/CLAUDE.component.md`

**Step 8.1: Check if the REQ is referenced**

```bash
grep "REQ-USA-editorial-framing-reflection" 3-code/adapter/CLAUDE.component.md
```

If **no hits** are returned, the REQ isn't in the adapter's table — skip this task entirely (no changes, no commit). Move to Task 9.

If **hits** are returned, proceed to Step 8.2.

**Step 8.2: Update the row (if present)**

Apply the same replacement as Task 7 Step 7.2 (same row text → same new text).

**Step 8.3: Commit (if Step 8.2 ran)**

```bash
git add 3-code/adapter/CLAUDE.component.md
git commit -m "docs(component): update adapter REQ summary for pivot"
```

---

### Task 9: Update `1-spec/CLAUDE.spec.md` Requirements Index summary

**Files:**
- Modify: `1-spec/CLAUDE.spec.md`

**Step 9.1: Find the index row**

```bash
grep "REQ-USA-editorial-framing-reflection" 1-spec/CLAUDE.spec.md
```

Expected: one row. The current Status column shows `Approved`; after this pivot it should be `Draft`. The Summary column has old wording.

**Step 9.2: Replace the row**

Use Edit. Current row:

```
| [REQ-USA-editorial-framing-reflection](requirements/REQ-USA-editorial-framing-reflection.md) | Usability | Must-have | Approved | Frontend microcopy uses reflection-oriented phrasing, not prediction-asserting; verified via forbidden-phrase grep + manual editorial review. |
```

Replace with:

```
| [REQ-USA-editorial-framing-reflection](requirements/REQ-USA-editorial-framing-reflection.md) | Usability | Must-have | Draft | Frontend microcopy follows editorial guideline at editorial-voice.md; editorial review per PR; soft-hint linter provides non-fatal hints. |
```

**Step 9.3: Verify**

```bash
grep "REQ-USA-editorial-framing-reflection" 1-spec/CLAUDE.spec.md
```

Expected: row shows Status `Draft` and the new summary.

**Step 9.4: Commit**

```bash
git add 1-spec/CLAUDE.spec.md
git commit -m "docs(spec): update REQ index for editorial-framing pivot

REQ-USA-editorial-framing-reflection: Status Approved → Draft
(pivot rewrote acceptance criteria; needs re-approval), Summary
updated to reference editorial-voice.md."
```

---

### Task 10: Update `.github/CODEOWNERS`

**Files:**
- Modify: `.github/CODEOWNERS`

**Step 10.1: Read current CODEOWNERS**

```bash
cat .github/CODEOWNERS
```

The file currently has a line:
```
4-deploy/runbooks/editorial-framing-lexicon.md  @DYAI2025
```

This must be replaced (the lexicon file will be deleted in Task 11).

**Step 10.2: Replace the lexicon line**

Use Edit. Find:

```
4-deploy/runbooks/editorial-framing-lexicon.md  @DYAI2025
```

Replace with:

```
1-spec/editorial-voice.md                       @DYAI2025
```

(Match the column-alignment of the surrounding rows — multi-space padding before `@DYAI2025`.)

**Step 10.3: Verify**

```bash
grep "editorial-voice.md" .github/CODEOWNERS
grep "editorial-framing-lexicon.md" .github/CODEOWNERS
```

Expected: 1 hit for `editorial-voice.md`; **zero hits** for `editorial-framing-lexicon.md`.

**Step 10.4: Commit**

```bash
git add .github/CODEOWNERS
git commit -m "docs(governance): update CODEOWNERS for editorial-framing pivot

4-deploy/runbooks/editorial-framing-lexicon.md (about to be deleted)
→ 1-spec/editorial-voice.md (the new editorial source of truth).

Same owner: @DYAI2025 (STK-founder per stakeholders.md)."
```

---

## Phase 3 — Cleanup

### Task 11: Delete `4-deploy/runbooks/editorial-framing-lexicon.md`

**Files:**
- Delete: `4-deploy/runbooks/editorial-framing-lexicon.md`

**Step 11.1: Verify no remaining references**

```bash
grep -rln "editorial-framing-lexicon.md" \
  CLAUDE.md \
  1-spec/ \
  2-design/ \
  3-code/ \
  4-deploy/ \
  decisions/ \
  .github/ \
  scripts/ \
  tests/
```

Expected: no hits **outside the lexicon file itself**. If hits remain, fix those first before deleting (otherwise the file will become an orphan dangling reference).

**Step 11.2: Delete via git**

```bash
git rm 4-deploy/runbooks/editorial-framing-lexicon.md
```

**Step 11.3: Commit**

```bash
git commit -m "docs(runbooks): delete editorial-framing-lexicon.md

Editorial-framing pivot: the lexicon's blacklist + reflection-token
data and parser-contract prose are obsolete. The 4 principles, 6
examples, and 5 watchwords now live in 1-spec/editorial-voice.md.

Refs: docs/plans/2026-05-07-editorial-framing-pivot-design.md"
```

---

### Task 12: Deprecate `DEC-data-as-fenced-markdown-blocks`

Per `decisions/PROCEDURES.md` "Deprecating or Superseding a Decision":

**Files:**
- Modify: `decisions/DEC-data-as-fenced-markdown-blocks.md` (Status field)
- Modify: `decisions/DEC-data-as-fenced-markdown-blocks.history.md` (changelog entry)
- Modify: `1-spec/CLAUDE.spec.md` (remove decisions-index row)
- Modify: `2-design/CLAUDE.design.md` (remove decisions-index row)
- Modify: `4-deploy/CLAUDE.deploy.md` (remove decisions-index row)
- Modify: `3-code/adapter/CLAUDE.component.md` (remove decisions-index row)
- Modify: `2-design/architecture.md` (remove row from the `## Architectural Decisions` section)

**Step 12.1: Read both DEC files**

```bash
cat decisions/DEC-data-as-fenced-markdown-blocks.md
cat decisions/DEC-data-as-fenced-markdown-blocks.history.md
```

**Step 12.2: Update Status in `.md`**

Use Edit. Find:

```
**Status**: Active
```

Replace with:

```
**Status**: Deprecated
```

**Step 12.3: Append a changelog entry in `.history.md`**

Use Edit. Find the existing changelog row:

```
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
```

Replace with:

```
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
| 2026-05-07 | Deprecated — first instance (4-deploy/runbooks/editorial-framing-lexicon.md) deleted in editorial-framing pivot; new design uses bullet-list-under-heading pattern that does not need a recorded fenced-block convention. See docs/plans/2026-05-07-editorial-framing-pivot-design.md. | ai-proposed/human-approved |
```

**Step 12.4: Remove the row from `1-spec/CLAUDE.spec.md` decisions index**

Use Edit. Find and DELETE this row:

```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When a requirement references a "list" or "map" of small string entries to be consumed mechanically. |
```

**Step 12.5: Remove the row from `2-design/CLAUDE.design.md` decisions index**

Same pattern — find and delete:

```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When proposing a new versioned data artefact in `architecture.md`, `data-model.md`, or `api-design.md`. |
```

**Step 12.6: Remove the row from `4-deploy/CLAUDE.deploy.md` decisions index**

```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When authoring a runbook or policy doc that pairs prose with mechanically-consumable lists. |
```

**Step 12.7: Remove the row from `3-code/adapter/CLAUDE.component.md` decisions index**

```
| [DEC-data-as-fenced-markdown-blocks](../../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When implementing a parser for a versioned data file (e.g., `scripts/check-editorial-framing.mjs`). |
```

**Step 12.8: Remove the row from `2-design/architecture.md` `## Architectural Decisions` section**

```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks (governs the editorial-framing lexicon and any future data-as-document policy artefact). |
```

**Step 12.9: Verify**

```bash
grep -l "DEC-data-as-fenced-markdown-blocks" \
  1-spec/CLAUDE.spec.md \
  2-design/CLAUDE.design.md \
  2-design/architecture.md \
  4-deploy/CLAUDE.deploy.md \
  3-code/adapter/CLAUDE.component.md
```

Expected: NO output (every index row has been removed; the DEC files themselves still exist but are not indexed).

```bash
grep "^\*\*Status\*\*" decisions/DEC-data-as-fenced-markdown-blocks.md
```

Expected: `**Status**: Deprecated`.

**Step 12.10: Commit**

```bash
git add decisions/DEC-data-as-fenced-markdown-blocks.md \
        decisions/DEC-data-as-fenced-markdown-blocks.history.md \
        1-spec/CLAUDE.spec.md \
        2-design/CLAUDE.design.md \
        2-design/architecture.md \
        4-deploy/CLAUDE.deploy.md \
        3-code/adapter/CLAUDE.component.md
git commit -m "docs(decisions): deprecate DEC-data-as-fenced-markdown-blocks

Per decisions/PROCEDURES.md:
- Status: Active → Deprecated.
- history-changelog appended.
- Row removed from 5 indexes:
  1-spec/CLAUDE.spec.md, 2-design/CLAUDE.design.md,
  2-design/architecture.md, 4-deploy/CLAUDE.deploy.md,
  3-code/adapter/CLAUDE.component.md.

The DEC was created with the editorial-framing lexicon as its first
and only instance (N=1). The pivot deletes the lexicon and the new
design uses a simpler bullet-list-under-heading pattern that does
not warrant a recorded fenced-block convention. If a future versioned
data artefact emerges that genuinely benefits from fenced blocks,
record a fresh DEC at that point with concrete evidence."
```

---

## Phase 4 — Tasks.md Restructure

### Task 13: Restructure Phase 1 in `3-code/tasks.md`

**Files:**
- Modify: `3-code/tasks.md`

This is one large mechanical edit:
- Cancel 4 old tasks with reasons
- Add 5 new tasks in the redefined Phase 1
- Update the Execution Plan's Phase 1 section

**Step 13.1: Read current Phase 1 in tasks.md**

```bash
grep -n "TASK-" 3-code/tasks.md | head -30
```

Identify the rows for: `TASK-define-editorial-lexicon`, `TASK-implement-check-editorial-framing`, `TASK-test-editorial-framing-script`, `TASK-wire-editorial-framing-into-check`, `TASK-document-editorial-framing-frontend`, `TASK-phase-1-manual-testing`.

**Step 13.2: Update each row**

Apply the following changes (use Edit per row, or one batched MultiEdit if available):

**`TASK-define-editorial-lexicon`** — Status stays `Done`, but Notes column becomes:
```
Superseded by editorial-voice.md in 2026-05-07 pivot. Lexicon file deleted. See docs/plans/2026-05-07-editorial-framing-pivot-design.md.
```

**`TASK-implement-check-editorial-framing`** — Status `Todo` → `Cancelled`, Notes:
```
Cancelled: editorial-framing pivot replaced by TASK-implement-check-editorial-voice (different script name + different semantics: soft hint, not blacklist).
```

**`TASK-test-editorial-framing-script`** — Status `Todo` → `Cancelled`, Notes:
```
Cancelled: replaced by TASK-test-editorial-voice-script. Tests for the new script live in tests/editorial-voice.test.mjs.
```

**`TASK-wire-editorial-framing-into-check`** — Status `Todo` → `Cancelled`, Notes:
```
Cancelled: editorial-framing pivot removed npm run check wiring. Standalone npm run editorial-hints instead. Replaced by TASK-add-editorial-hints-npm-script.
```

**`TASK-document-editorial-framing-frontend`** — Status `Todo` → `Cancelled`, Notes:
```
Cancelled: replaced by TASK-document-editorial-voice-frontend (different doc target).
```

**`TASK-phase-1-manual-testing`** — Status `Todo` → `Cancelled`, Notes:
```
Cancelled: replaced by TASK-phase-1-manual-testing-pivot (different artefacts to manual-test against).
```

**Step 13.3: Add 5 new task rows in the Adapter or Setup-and-Infrastructure section (whichever fits)**

Append (or insert in their natural component-grouped position):

```
| TASK-create-editorial-voice-doc | Create `1-spec/editorial-voice.md` with 4 principles, 6 DE/EN before/after examples, 5 watchwords, governance note | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | - | 2026-05-07 | Pivot supersedes TASK-define-editorial-lexicon. Implemented via plan Task 1. |
| TASK-implement-check-editorial-voice | Build `scripts/check-editorial-voice.mjs` (zero deps, soft hint, exits 0 always on content findings) | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-create-editorial-voice-doc | 2026-05-07 | Pivot supersedes TASK-implement-check-editorial-framing. Implemented via plan Task 3 (TDD green after plan Task 2 red). |
| TASK-test-editorial-voice-script | Add `tests/editorial-voice.test.mjs` covering hint emission, slash-split watchwords, zero-hit, parser loud-failure | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-create-editorial-voice-doc | 2026-05-07 | Pivot supersedes TASK-test-editorial-framing-script. Implemented via plan Task 2 + 3. |
| TASK-add-editorial-hints-npm-script | Add `npm run editorial-hints` to package.json (NOT in npm run check) | P1 | Done | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-implement-check-editorial-voice | 2026-05-07 | Pivot supersedes TASK-wire-editorial-framing-into-check. Implemented via plan Task 4. |
| TASK-document-editorial-voice-frontend | Update `3-code/frontend/README.md` (or create) with the copy-change workflow: edit public/index.html → optionally `npm run editorial-hints` → consult 1-spec/editorial-voice.md → reviewer sign-off via CODEOWNERS | P1 | Todo | [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | TASK-add-editorial-hints-npm-script | 2026-05-07 | Pivot supersedes TASK-document-editorial-framing-frontend. NOT done in this plan — documents the workflow once it exists. |
| TASK-phase-1-manual-testing-pivot | Update `4-deploy/runbooks/editorial-review-process.md` runbook (manual editorial review steps + npm run editorial-hints output explanation); document phase-1 build/run/test commands in `3-code/{frontend,adapter}/README.md` | P1 | Todo | - | TASK-document-editorial-voice-frontend | 2026-05-07 | Pivot supersedes TASK-phase-1-manual-testing. NOT done in this plan. |
```

(Note: 4 of the 6 new tasks are marked `Done` because the plan's Phase 1 already implements them. The remaining 2 — `TASK-document-editorial-voice-frontend` and `TASK-phase-1-manual-testing-pivot` — stay `Todo` because they document a workflow that requires the artefacts to exist first; they're for a future session.)

**Step 13.4: Update the Execution Plan's Phase 1 block**

Find the Phase 1 capabilities + tasks list in the `## Execution Plan` section. Replace the `**Tasks:**` list with the new ordered list:

```
**Tasks:**
1. TASK-create-editorial-voice-doc
2. TASK-test-editorial-voice-script (TDD red)
3. TASK-implement-check-editorial-voice (TDD green)
4. TASK-add-editorial-hints-npm-script
5. TASK-document-editorial-voice-frontend
6. TASK-phase-1-manual-testing-pivot
```

Also update the Phase 1 "Capabilities delivered" prose if it references the old script name or blacklist mechanic — replace with prose reflecting the editorial-voice + soft-hint approach.

**Step 13.5: Verify**

```bash
grep "TASK-implement-check-editorial-voice" 3-code/tasks.md
grep "TASK-implement-check-editorial-framing" 3-code/tasks.md
grep "Cancelled" 3-code/tasks.md | wc -l
```

Expected: ≥1 hit for the new task ID; old task ID still present (it's marked `Cancelled`, not deleted); ≥5 cancelled tasks.

**Step 13.6: Commit**

```bash
git add 3-code/tasks.md
git commit -m "docs(tasks): restructure Phase 1 for editorial-framing pivot

Old Phase 1 tasks Cancelled (per the SDLC scaffold's 'never rename
task IDs' rule):
- TASK-implement-check-editorial-framing → replaced
- TASK-test-editorial-framing-script → replaced
- TASK-wire-editorial-framing-into-check → replaced (no npm run check
  wiring in pivot)
- TASK-document-editorial-framing-frontend → replaced
- TASK-phase-1-manual-testing → replaced

TASK-define-editorial-lexicon stays Done; Notes appended noting
supersession by editorial-voice.md.

New tasks (4 of 6 already Done in this plan, 2 Todo for future):
- TASK-create-editorial-voice-doc (Done)
- TASK-implement-check-editorial-voice (Done)
- TASK-test-editorial-voice-script (Done)
- TASK-add-editorial-hints-npm-script (Done)
- TASK-document-editorial-voice-frontend (Todo)
- TASK-phase-1-manual-testing-pivot (Todo)

Execution Plan Phase 1 ordered list updated."
```

---

## Phase 5 — Status Sync

### Task 14: Sync `CLAUDE.md` Current State

**Files:**
- Modify: `CLAUDE.md`

**Step 14.1: Read the Current State section**

```bash
sed -n '/### Current State/,/^---$/p' CLAUDE.md | head -60
```

**Step 14.2: Apply 4 edits**

Use Edit for each:

**Edit A — Spec phase: REQ count**

Find:
```
- Goals: **6 Approved (all)** — 4 Must-have + 2 Should-have. User Stories: **9 Approved (all)** — 7 Must-have + 2 Should-have. Requirements: **23 Approved (all)** — 18 Must-have + 5 Should-have (Distribution: 12 F, 1 REL, 2 SEC, 5 USA, 2 MNT, 1 COMP).
```

Replace with:
```
- Goals: **6 Approved (all)** — 4 Must-have + 2 Should-have. User Stories: **9 Approved (all)** — 7 Must-have + 2 Should-have. Requirements: **22 Approved + 1 Draft** — 17 Must-have Approved + 5 Should-have Approved + 1 Must-have Draft (`REQ-USA-editorial-framing-reflection`, downgraded by 2026-05-07 editorial-framing pivot).
```

**Edit B — Spec phase: pivot acknowledgement**

Find:
```
- Gap analysis (2026-05-07, post-approval): **0 Critical, 1 Important, 4 Minor.**
```

Replace with:
```
- Gap analysis (2026-05-07, post-approval): **0 Critical, 1 Important, 4 Minor (stale — pivot rewrote REQ-USA-editorial-framing-reflection).**
```

**Edit C — Design phase: decisions count**

Find:
```
- Decisions: 5 Active recorded — [`DEC-layered-adapter`](decisions/DEC-layered-adapter.md), [`DEC-zero-runtime-deps`](decisions/DEC-zero-runtime-deps.md), [`DEC-frozen-error-codes`](decisions/DEC-frozen-error-codes.md), [`DEC-same-origin-monolith`](decisions/DEC-same-origin-monolith.md), [`DEC-data-as-fenced-markdown-blocks`](decisions/DEC-data-as-fenced-markdown-blocks.md). Indexed in `1-spec/CLAUDE.spec.md` (1 entry), `2-design/CLAUDE.design.md` (5 entries), `4-deploy/CLAUDE.deploy.md` (3 entries), and per-component `CLAUDE.component.md` files (frontend: 2; adapter: 5).
```

Replace with:
```
- Decisions: 4 Active + 1 Deprecated — [`DEC-layered-adapter`](decisions/DEC-layered-adapter.md), [`DEC-zero-runtime-deps`](decisions/DEC-zero-runtime-deps.md), [`DEC-frozen-error-codes`](decisions/DEC-frozen-error-codes.md), [`DEC-same-origin-monolith`](decisions/DEC-same-origin-monolith.md). Deprecated 2026-05-07: [`DEC-data-as-fenced-markdown-blocks`](decisions/DEC-data-as-fenced-markdown-blocks.md) (in editorial-framing pivot — first instance deleted, no current instance). Indexed in `1-spec/CLAUDE.spec.md` (0 entries), `2-design/CLAUDE.design.md` (4 entries), `4-deploy/CLAUDE.deploy.md` (2 entries), and per-component `CLAUDE.component.md` files (frontend: 2; adapter: 4).
```

**Edit D — Design phase: completeness assessment stale flag**

Find:
```
- **Completeness assessment (2026-05-07 v2): 0 Critical, 1 Important, 1 Minor.**
```

Replace with:
```
- **Completeness assessment (2026-05-07 v2): 0 Critical, 1 Important, 1 Minor (stale — editorial-framing pivot 2026-05-07 changed architecture.md Frontend section + Coverage row; fresh assessment needed before Phase 1 implementation continues).**
```

**Edit E — Implementation progress: pivot bullet**

Find the Implementation progress block (the bullet listing tasks done so far). Append a new bullet at the end of that block:

```
- 2026-05-07: Editorial-framing pivot — replaced forbidden-phrase blacklist (TASK-define-editorial-lexicon and Phase 1 Tasks 14-18) with editorial-voice doc + soft-hint linter. New artefacts: `1-spec/editorial-voice.md`, `scripts/check-editorial-voice.mjs`, `tests/editorial-voice.test.mjs`, `npm run editorial-hints`. Deleted: `4-deploy/runbooks/editorial-framing-lexicon.md`. Deprecated: `DEC-data-as-fenced-markdown-blocks`. REQ-USA-editorial-framing-reflection rewritten + reverted to Draft (needs founder re-approval). See [`docs/plans/2026-05-07-editorial-framing-pivot-design.md`](docs/plans/2026-05-07-editorial-framing-pivot-design.md).
```

**Step 14.3: Verify**

```bash
grep "Editorial-framing pivot" CLAUDE.md
grep "5 Active recorded" CLAUDE.md
grep "4 Active + 1 Deprecated" CLAUDE.md
```

Expected: pivot bullet present; **zero hits** for `5 Active recorded`; ≥1 hit for `4 Active + 1 Deprecated`.

**Step 14.4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): sync Current State for editorial-framing pivot

- Spec: REQ count 23 Approved → 22 Approved + 1 Draft (REQ-USA-
  editorial-framing-reflection downgraded by pivot rewrite).
- Spec: gap-analysis marked stale.
- Design: decisions 5 Active → 4 Active + 1 Deprecated; index counts
  updated.
- Design: completeness assessment marked stale.
- Implementation progress: pivot bullet added.

Pivot rationale lives in docs/plans/2026-05-07-editorial-framing-pivot-design.md."
```

---

## Phase 6 — Verification

### Task 15: Final verification

**No file changes — runs the full test/script suite to confirm the pivot is internally consistent.**

**Step 15.1: Full test suite**

```bash
npm test --silent 2>&1 | tail -10
```

Expected: `# tests 38`, `# pass 38`, `# fail 0`. Same as Task 3 Step 3.5; included here as a pre-push smoke.

**Step 15.2: Hint script live run**

```bash
npm run editorial-hints
echo "exit code: $?"
```

Expected: several hints (mainly for "Kein Horoskop-Versprechen", "Kein Schicksal. Eine Signatur." in `public/index.html`); exit code `0`.

**Step 15.3: Existing project quality gates still green**

```bash
npm run check --silent 2>&1 | tail -5
```

Expected: same output as before the pivot. The editorial-hints script must not interfere.

```bash
PUBLIC_API_BASE_URL= npm run smoke 2>&1 | tail -5
```

Expected: smoke tests pass (or the same baseline behaviour as before the pivot, depending on environment).

**Step 15.4: No orphan references to deleted/deprecated artefacts**

```bash
echo "=== references to deleted lexicon (expect 0 outside docs/plans archives) ==="
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
  package.json \
  | grep -v "docs/plans"

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

Expected: each grep returns either nothing or only references inside `docs/plans/` (historical plan documents — those are intentional preservation, not orphans).

**Step 15.5: Commit (if any drift was found and fixed)**

If Step 15.4 revealed orphan references that need fixing, fix them and commit. Otherwise — no commit, the verification was clean.

```bash
git status -sb
```

Expected: working tree clean (or only the pivot-design plan + this plan + intentional unrelated changes).

---

## Out of scope (not in this plan)

The following items were considered and intentionally deferred:

1. **Founder re-approval of `REQ-USA-editorial-framing-reflection`** — out of plan scope (requires human decision). The REQ stays `Draft` after this plan; the next session should run `/SDLC-elicit` to re-approve.
2. **Implementation of `TASK-document-editorial-voice-frontend`** — depends on what the frontend team's README format becomes; deferred to a future session.
3. **Implementation of `TASK-phase-1-manual-testing-pivot`** — same reason; depends on the runbook format.
4. **Negation-aware matching in the soft-hint script** — explicitly accepted as a v1 limitation; revisit only if reviewer fatigue emerges (~10 hits in 100KB file is currently tolerable).
5. **Fresh design-completeness-assessment** — flagged as stale in CLAUDE.md but not run in this plan. Run via `/SDLC-design` next session.
6. **Reflection-token concept** — fully removed from the new design (was a positive-signal check for the blacklist approach; soft-hint approach has no need for it).

---

## Summary

| Phase | Tasks | Output |
|-------|-------|--------|
| Pre-flight | 0.1-0.3 | Verify baseline state |
| 1. Forward construction | 1-4 | New doc + script + tests + npm script |
| 2. Reference updates | 5-10 | REQ rewritten + Status downgrade; architecture, components, spec index, CODEOWNERS aligned |
| 3. Cleanup | 11-12 | Lexicon deleted; DEC deprecated |
| 4. Tasks.md restructure | 13 | Phase 1 cancelled+replaced |
| 5. Status sync | 14 | CLAUDE.md Current State |
| 6. Verification | 15 | Smoke checks, no orphan refs |

**Total: 15 tasks, ~12 commits** (Tasks 8 may be a no-op; Task 15 may be a no-op).

The plan respects the SDLC scaffold's invariants: never-rename-task-IDs (cancel + create), Status-downgrade on Approved-artifact rewrite, decisions/PROCEDURES.md for DEC deprecation, bidirectional traceability, Current-State synchronization in the same operation as artifact change.
