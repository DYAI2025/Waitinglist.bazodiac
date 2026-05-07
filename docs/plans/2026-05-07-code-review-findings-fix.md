# Code Review Findings Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve the 4 actionable findings (3 Important + 1 Minor) from the post-`TASK-define-editorial-lexicon` code review (checklist + elite passes), so the editorial-framing tooling has consistent governance, traceability, and a hardened consumer contract before `TASK-implement-check-editorial-framing` begins.

**Architecture:** This is a documentation + governance fix-up — no source code changes. Four artefacts are produced/edited: (1) a new decision (`DEC-data-as-fenced-markdown-blocks`) that formalises the lexicon-as-fenced-markdown pattern as a project convention, (2) a `.github/CODEOWNERS` entry that gives mechanical teeth to the editorial sign-off requirement, (3) a back-link section in `REQ-USA-editorial-framing-reflection.md` so future readers can navigate from spec → implementation, (4) a hardening pass on the lexicon's "How the check works" section that adds a fail-loud clause and tightens path/whitespace contracts.

**Tech Stack:** Markdown only (specs, decisions, runbooks). No test runner involved — verification is `grep` + visual inspection. Git for frequent commits. The pattern this plan establishes is itself parseable by a future zero-deps Node script per `DEC-zero-runtime-deps`.

---

## Pre-Flight: Project State Verification

Before starting, verify the engineer is at the expected baseline.

**Step 0.1: Confirm git state**

```bash
git status -sb
git log --oneline -3
```

**Expected:**
- Branch `main` is up-to-date with `origin/main` after `a7fe2f7`.
- Working tree may have uncommitted edits from `TASK-define-editorial-lexicon` (lexicon file, tasks.md, CLAUDE.md). If those are not yet committed, **commit them first** before starting this plan.
- If you see other untracked files unrelated to this plan, decide whether to commit, stash, or ignore — do not start tasks below until the working state is intentional.

**Step 0.2: Confirm session prerequisites**

```bash
ls 4-deploy/runbooks/editorial-framing-lexicon.md
ls 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
ls decisions/_template.md decisions/_template.history.md decisions/PROCEDURES.md
ls 3-code/adapter/CLAUDE.component.md
```

**Expected:** all listed files exist. If any is missing, stop — this plan assumes the SDLC retrofit and the editorial-lexicon task have already landed (commits `e79b361` and `a7fe2f7`).

---

## Pre-Flight Decision: Obsolete plan file

Before starting Task 1, decide what to do about `docs/plans/2026-05-07-spec-gap-findings-fix.md`.

**Context:** This file describes a plan to fix the spec-phase gap findings. That plan was implemented during this session via `/SDLC-elicit` (the new `REQ-USA-editorial-framing-reflection`) — the file is now historical.

**Options:**
1. **Keep** — leaves the plan as a historical record alongside this new plan. No action.
2. **Delete** — `rm docs/plans/2026-05-07-spec-gap-findings-fix.md` + commit. Cleaner, but loses the trail.
3. **Move to `docs/plans/archive/`** — preserves history and signals "completed". Best of both.

**Recommendation:** option 3. **This is a user decision** — confirm before proceeding to Task 1.

---

## Task 1: Record `DEC-data-as-fenced-markdown-blocks`

**Why:** Elite review Architectural #1. The lexicon establishes a pattern (markdown documents with named fenced code blocks as machine-readable data) that future similar artefacts (translation inventories, denylists, error-code mappings) will likely want to reuse. Recording it now prevents pattern drift.

**Files:**
- Create: `decisions/DEC-data-as-fenced-markdown-blocks.md`
- Create: `decisions/DEC-data-as-fenced-markdown-blocks.history.md`

**Step 1: Verify the convention does not yet exist as a decision**

```bash
ls decisions/DEC-data-as-fenced-markdown-blocks.md
```

Expected: `No such file or directory`. If it exists, stop — re-run the verification chain to understand why.

**Step 2: Create `decisions/DEC-data-as-fenced-markdown-blocks.md`**

Write this exact content:

````markdown
# DEC-data-as-fenced-markdown-blocks: Versioned data files as Markdown with named fenced code blocks

**Status**: Active

**Category**: Convention

**Scope**: system-wide (data-as-document policy artefacts)

**Source**: [REQ-USA-editorial-framing-reflection](../1-spec/requirements/REQ-USA-editorial-framing-reflection.md), [DEC-zero-runtime-deps](DEC-zero-runtime-deps.md)

**Last updated**: 2026-05-07

## Context

Several upcoming artefacts in this project will consist of small versioned lists or maps consumed mechanically by zero-deps Node scripts: the editorial-framing lexicon (first instance, see source REQ), and likely future entries (forbidden-domain lists for newsletter validation, provider-error-code-to-message-key maps, translation-key inventories). Without a recorded convention, each new artefact would risk inventing a different format (YAML, JSON, TOML, plain text) — drifting away from the project's zero-runtime-deps posture and producing inconsistent reviewer experiences.

## Decision

When a versioned data file (a list or map of small string-valued entries) must be both **human-reviewable in PRs** and **machine-readable by a zero-deps script**, encode it as a Markdown document with one **fenced code block per logical list**, where the fence's language tag identifies the list (e.g., `forbidden-de`, `reflection-en`, `domain-deny`). Each line inside the block is one entry; empty lines and `#`-prefixed lines are comments and are stripped by the parser.

The Markdown document is the source of truth — both for editorial reviewers (who see prose context, examples, and review processes around the data) and for the script (which extracts the named blocks via regex).

## Enforcement

### Trigger conditions

- **Specification phase**: when a requirement references a "list" or "map" of small string entries that will be consumed mechanically.
- **Design phase**: when proposing a new versioned data artefact (architecture, data-model, or API design references such a list).
- **Code phase**: when implementing a parser for a versioned data file or extending an existing one.
- **Deploy phase**: when authoring a runbook or policy doc that pairs prose with mechanically-consumable lists.

### Required patterns

- The data file is a Markdown document under `4-deploy/runbooks/` (or another stable path documented in the consuming script).
- Each list lives in a fenced code block with a deterministic language tag of the form `<class>-<lang>` or `<class>` if language-neutral.
- Block content is line-delimited; one entry per line; empty lines and lines starting with `#` are ignored by the parser.
- The parser is a zero-deps Node script (per `DEC-zero-runtime-deps`) that uses simple regex (` ```<tag>\n([\s\S]*?)``` `) to extract each block.
- The parser **MUST fail loudly** with a non-zero exit code and a clear error message if any expected block is missing, malformed, or empty. A check that silently loads zero entries and reports "no issues" is a worse failure mode than no check at all.

### Required checks

1. New data files follow the structure above (verifiable by reading the file).
2. The consuming script's parser is regex-based, has no third-party dependency, and asserts presence of all expected block tags before parsing.
3. The parser strips per-line whitespace and drops empty lines + `#`-prefixed lines.

### Prohibited patterns

- YAML, TOML, JSON, or other formats requiring a parser dependency, when a fenced-code-block representation is sufficient.
- Plain `.txt` files for the same data without the surrounding Markdown context (loses editorial review affordance).
- Inline data embedded in source code modules (loses version-control granularity for editorial diffs).
- Silent fallbacks in the parser that mask malformed or missing blocks.
````

**Step 3: Create `decisions/DEC-data-as-fenced-markdown-blocks.history.md`**

Write this exact content:

```markdown
# DEC-data-as-fenced-markdown-blocks: Trail

> Companion to `DEC-data-as-fenced-markdown-blocks.md`.
> AI agents read this only when evaluating whether the decision is still
> valid or when proposing a change or supersession.

## Alternatives considered

### Option A: YAML files
- Pros: Common, readable, supports nested structures, editor tooling.
- Cons: Node has no built-in YAML parser; using one breaks `DEC-zero-runtime-deps`. Hand-rolling a YAML parser for trivial lists is over-engineering.

### Option B: JSON files
- Pros: Built-in `JSON.parse`, no dep needed.
- Cons: Ugly for editorial review (no comments, strict syntax fails on trailing commas, prose context cannot live alongside the data without a separate doc file).

### Option C: Plain Markdown headings as section markers
- Pros: Looks natural in PRs.
- Cons: Regex extraction is fragile (heading depth, surrounding paragraphs, formatting drift). No type signal — every `### Foo` looks the same.

### Option D: Separate `.txt` files per list
- Pros: Trivial parsing.
- Cons: Loses editorial context (no surrounding prose, examples, review process). Editors must remember to update prose elsewhere when changing the data.

### Option E (chosen): Markdown document with named fenced code blocks
- Pros: Single file holds prose + data. Block tags act as schema markers (`forbidden-de` is unambiguous). Regex extraction is deterministic. PR review highlights line-level data changes naturally. No dependency required for parsing. Familiar to all engineers (it looks like ordinary documentation).
- Cons: Custom convention rather than a standard format — requires the convention to be documented (this DEC). Slightly more verbose than option D.

## Reasoning

The decisive factor is the combination of `DEC-zero-runtime-deps` (no parser dep allowed) and the editorial-review affordance (the lexicon is touched by reviewers who think in prose, not in code). Option E gives both: the file looks like documentation to a copy editor and like data to a script. Trade-off accepted: each new instance must adhere to the block-tag convention, and the parser must be defensively robust against malformed lexica. Conditions that would invalidate this reasoning: arrival of a versioned data artefact too large for line-delimited representation (nested structures, key-value pairs with multi-line values), at which point YAML or JSON with explicit dependency might be reconsidered.

## Human involvement

**Type**: ai-proposed/human-approved

**Notes**: First proposed during the elite code review of `TASK-define-editorial-lexicon` (2026-05-07). Initially deferred (N=1 evidence), then promoted to recorded decision after the user agreed in the code-review-fix planning session. The lexicon (`4-deploy/runbooks/editorial-framing-lexicon.md`) is the first instance.

## Changelog

| Date | Change | Involvement |
|------|--------|-------------|
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
```

**Step 4: Verify both files exist and parse correctly**

```bash
ls -la decisions/DEC-data-as-fenced-markdown-blocks.md decisions/DEC-data-as-fenced-markdown-blocks.history.md
head -10 decisions/DEC-data-as-fenced-markdown-blocks.md
```

Expected: both files listed; head shows the title and Status: Active line.

**Step 5: Commit**

```bash
git add decisions/DEC-data-as-fenced-markdown-blocks.md decisions/DEC-data-as-fenced-markdown-blocks.history.md
git commit -m "$(cat <<'EOF'
docs(decisions): record DEC-data-as-fenced-markdown-blocks

Formalises the lexicon-as-fenced-markdown pattern as a project convention,
so future versioned data artefacts (forbidden-domain lists, error-code
maps, translation inventories) follow the same shape: Markdown document
with one fenced code block per logical list, parser is regex-based and
zero-deps, parser MUST fail loudly on missing or malformed blocks.

First instance: 4-deploy/runbooks/editorial-framing-lexicon.md (lives in
4-deploy/ because it is editorial policy, not code).

Promoted from N=1 deferred status during code review of
TASK-define-editorial-lexicon. Closes Architectural Finding #1.
EOF
)"
```

---

## Task 2: Update phase decision indexes

**Why:** Per `decisions/PROCEDURES.md`, every decision must be added to every phase index whose trigger conditions match. `DEC-data-as-fenced-markdown-blocks` triggers in Specification, Design, Code, and Deploy phases (all four).

**Files:**
- Modify: `1-spec/CLAUDE.spec.md` (add row to decisions index)
- Modify: `2-design/CLAUDE.design.md` (add row to decisions index)
- Modify: `4-deploy/CLAUDE.deploy.md` (add row to decisions index)
- Modify: `3-code/adapter/CLAUDE.component.md` (add row to component decisions index — the script that consumes the lexicon will live in `adapter`)

**Step 1: Verify current state of each index**

```bash
grep -A 4 "## Decisions Relevant to This Phase" 1-spec/CLAUDE.spec.md
grep -A 6 "## Decisions Relevant to This Phase" 2-design/CLAUDE.design.md
grep -A 6 "## Decisions Relevant to This Phase" 4-deploy/CLAUDE.deploy.md
grep -A 8 "## Relevant Decisions" 3-code/adapter/CLAUDE.component.md
```

Expected: each shows the existing decision rows (or empty placeholder for spec). New row must be added for `DEC-data-as-fenced-markdown-blocks`.

**Step 2: Update `1-spec/CLAUDE.spec.md` decisions index**

Find the line:
```
<!-- Add rows as decisions are recorded. File column: [DEC-kebab-name](../decisions/DEC-kebab-name.md) -->
```

Replace it with:
```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When a requirement references a "list" or "map" of small string entries to be consumed mechanically. |
<!-- Add rows as decisions are recorded. File column: [DEC-kebab-name](../decisions/DEC-kebab-name.md) -->
```

**Step 3: Update `2-design/CLAUDE.design.md` decisions index**

Find the last existing decision row in the index (the `DEC-same-origin-monolith` row) and append the new row after it:

```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When proposing a new versioned data artefact in `architecture.md`, `data-model.md`, or `api-design.md`. |
```

**Step 4: Update `4-deploy/CLAUDE.deploy.md` decisions index**

Find the last existing decision row (the `DEC-same-origin-monolith` row) and append:

```
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When authoring a runbook or policy doc that pairs prose with mechanically-consumable lists. |
```

**Step 5: Update `3-code/adapter/CLAUDE.component.md` decisions index**

Find the `## Relevant Decisions` table and append a row after `DEC-same-origin-monolith`:

```
| [DEC-data-as-fenced-markdown-blocks](../../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When implementing a parser for a versioned data file (e.g., `scripts/check-editorial-framing.mjs`). |
```

**Step 6: Verify all indexes**

```bash
grep -c "DEC-data-as-fenced-markdown-blocks" 1-spec/CLAUDE.spec.md 2-design/CLAUDE.design.md 4-deploy/CLAUDE.deploy.md 3-code/adapter/CLAUDE.component.md
```

Expected: each file returns `1` (one occurrence of the new DEC reference per index).

**Step 7: Commit**

```bash
git add 1-spec/CLAUDE.spec.md 2-design/CLAUDE.design.md 4-deploy/CLAUDE.deploy.md 3-code/adapter/CLAUDE.component.md
git commit -m "docs(decisions): index DEC-data-as-fenced-markdown-blocks across all 4 phases"
```

---

## Task 3: Add `.github/CODEOWNERS` for editorial-policy paths

**Why:** Elite review Governance Finding #1. The lexicon's editorial-sign-off requirement is currently social-only. CODEOWNERS gives it mechanical teeth: GitHub will automatically request review from the owner when paths matching the rule change.

**Files:**
- Create: `.github/CODEOWNERS`

**Step 1: Verify `.github/` does not yet have a CODEOWNERS file**

```bash
ls .github/CODEOWNERS 2>/dev/null
```

Expected: `No such file or directory`. If a CODEOWNERS already exists, **stop and read it first** — extend it instead of overwriting.

**Step 2: Create `.github/` directory if it doesn't exist**

```bash
mkdir -p .github
```

**Step 3: Create `.github/CODEOWNERS`**

Write this exact content (replace `@DYAI2025` with the GitHub username or team handle of the editorial sign-off owner if different):

```
# Code owners for the Bazodiac waitlist preview.
# See https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners.

# Editorial-policy artefacts: copy lives or dies by these.
# Required reviewer when these change: STK-privacy-compliance-owner or STK-founder
# (per REQ-USA-editorial-framing-reflection and the lexicon's review process).
4-deploy/runbooks/editorial-framing-lexicon.md  @DYAI2025
public/index.html                               @DYAI2025

# Spec, decisions, and design artefacts: project-level governance.
1-spec/                                         @DYAI2025
decisions/                                      @DYAI2025
2-design/                                       @DYAI2025
```

**Step 4: Verify the file**

```bash
cat .github/CODEOWNERS
```

Expected: prints the content above. No syntax errors (CODEOWNERS uses gitignore-style patterns + space + `@user-or-team` references).

**Step 5: Commit**

```bash
git add .github/CODEOWNERS
git commit -m "$(cat <<'EOF'
docs(governance): add CODEOWNERS for editorial-policy and SDLC artefacts

Gives the lexicon's editorial-sign-off requirement mechanical teeth:
GitHub will automatically request review from the project owner when
public/index.html or 4-deploy/runbooks/editorial-framing-lexicon.md
change. Same protection extends to 1-spec/, decisions/, and 2-design/.

Closes Governance Finding #1 from the code review.
EOF
)"
```

---

## Task 4: Add lexicon back-link to the requirement

**Why:** Elite review Governance Finding #2. The requirement is opaque about where the canonical phrase lists live; readers must grep to find the lexicon. A one-line back-link fixes this without elevating the lexicon to a Source.

**Files:**
- Modify: `1-spec/requirements/REQ-USA-editorial-framing-reflection.md` (append a section)

**Step 1: Read the current file's tail to find the insertion point**

```bash
tail -10 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
```

Expected: ends with the `## Related Constraints` section. Insertion goes after it.

**Step 2: Append a new `## Implementation` section**

Use Edit (or sed/append) to add this block at the very end of the file:

```markdown

## Implementation

The canonical DE+EN phrase lists and the editorial review process live in [`4-deploy/runbooks/editorial-framing-lexicon.md`](../../4-deploy/runbooks/editorial-framing-lexicon.md). The mechanical check is implemented in `scripts/check-editorial-framing.mjs` (planned in `TASK-implement-check-editorial-framing`). Both are governed by [`DEC-data-as-fenced-markdown-blocks`](../../decisions/DEC-data-as-fenced-markdown-blocks.md).
```

**Step 3: Verify the addition**

```bash
tail -5 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
```

Expected: shows the new `## Implementation` section.

**Step 4: Verify status downgrade did NOT trigger**

Per `CLAUDE.spec.md` Status-Downgrade rule: modifying an Approved artifact reverts it to Draft. **However**, the rule has an exception for non-substantive changes (formatting, link corrections). This addition is a navigation aid, not a substance change.

**Manual judgment call**: append-only, navigation-aid, no acceptance criteria altered → exception applies, status stays `Approved`.

```bash
grep "^\*\*Status\*\*" 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
```

Expected: `**Status**: Approved`. If it reverted (e.g., your editor auto-flipped it), restore to `Approved` manually.

**Step 5: Commit**

```bash
git add 1-spec/requirements/REQ-USA-editorial-framing-reflection.md
git commit -m "$(cat <<'EOF'
docs(spec): add lexicon and DEC back-link to editorial-framing requirement

Closes Governance Finding #2 from the code review. Future readers of
REQ-USA-editorial-framing-reflection now have a one-click navigation aid
to the canonical phrase lists (4-deploy/runbooks/editorial-framing-lexicon.md),
the planned check script, and the governing decision
(DEC-data-as-fenced-markdown-blocks).

Append-only; navigation aid; no acceptance criteria altered. Status
remains Approved per the non-substantive-change exception.
EOF
)"
```

---

## Task 5: Harden the lexicon's "How the check works" section

**Why:** Elite review Production Reliability Finding #1 (loud-failure clause), plus checklist Issues 3 and 4 (vague path, missing whitespace contract). All three changes target the same section in `4-deploy/runbooks/editorial-framing-lexicon.md` and are cheaper to do in one edit than three.

**Files:**
- Modify: `4-deploy/runbooks/editorial-framing-lexicon.md` (replace the "How the check works" section)

**Step 1: Read the current "How the check works" section**

```bash
sed -n '/## How the check works/,/## Editorial review process/p' 4-deploy/runbooks/editorial-framing-lexicon.md
```

Expected: shows the 6 numbered steps as committed in `a7fe2f7`.

**Step 2: Replace the section**

The replacement must:
- (a) Specify the exact lexicon path (Issue 3)
- (b) State the per-line whitespace + comment contract (Issue 4)
- (c) Add a new step 7 about loud-failure on malformed input (Production Finding #1)
- (d) Reference `DEC-data-as-fenced-markdown-blocks` as the governing decision

Use Edit to replace the entire section (from the heading `## How the check works` up to but not including `## Editorial review process`) with:

```markdown
## How the check works

`scripts/check-editorial-framing.mjs` (zero runtime dependencies, per [`DEC-zero-runtime-deps`](../../decisions/DEC-zero-runtime-deps.md); structural pattern per [`DEC-data-as-fenced-markdown-blocks`](../../decisions/DEC-data-as-fenced-markdown-blocks.md)):

1. Reads this file from the canonical path `4-deploy/runbooks/editorial-framing-lexicon.md` (resolved relative to the repository root, or via a `--lexicon` CLI argument for tests).
2. Extracts the four fenced code blocks by their language tags (`forbidden-de`, `forbidden-en`, `reflection-de`, `reflection-en`) using the regex `` /```<tag>\n([\s\S]*?)```/ ``.
3. Per extracted block: splits on newlines, trims each line, drops empty lines and lines starting with `#`. The remaining lines are the canonical phrase list for that tag.
4. Scans `public/index.html`, isolating in-scope surfaces (identified by selector or comment-based markers — exact mechanism documented in the script's source as part of `TASK-implement-check-editorial-framing`).
5. **Fails the check** if any forbidden phrase from either language appears inside an in-scope surface.
6. **Warns** (non-fatal until the lexicon is hardened) if a surface has no reflection tokens in a given language.
7. **MUST fail loudly with a non-zero exit code and a clear error message** if any of the four expected blocks (`forbidden-de`, `forbidden-en`, `reflection-de`, `reflection-en`) is missing, malformed, or yields zero entries after parsing. A check that silently loads zero phrases and reports "no issues" is a worse failure mode than no check at all.
8. Exits with code `0` on pass, non-zero on fail (the warnings stay non-fatal until promoted by an explicit decision).

```

**Step 3: Verify the addition**

```bash
sed -n '/## How the check works/,/## Editorial review process/p' 4-deploy/runbooks/editorial-framing-lexicon.md
```

Expected: 8 numbered steps; step 1 names the canonical path; step 3 names the whitespace/comment contract; step 7 is the loud-failure clause.

**Step 4: Lint-style sanity checks**

```bash
# Confirm DEC links resolve
grep -E "DEC-(zero-runtime-deps|data-as-fenced-markdown-blocks)" 4-deploy/runbooks/editorial-framing-lexicon.md
```

Expected: at least 2 hits (the two referenced DECs).

```bash
# Confirm the canonical path is present
grep "4-deploy/runbooks/editorial-framing-lexicon.md" 4-deploy/runbooks/editorial-framing-lexicon.md
```

Expected: 1 hit (the new step 1 reference).

**Step 5: Commit**

```bash
git add 4-deploy/runbooks/editorial-framing-lexicon.md
git commit -m "$(cat <<'EOF'
docs(lexicon): harden 'How the check works' contract

Three fixes from the code review, all in the same section:

- Specify the canonical lexicon path explicitly (was 'a stable relative
  path', closes checklist Issue 3).
- State per-line whitespace + #-comment + empty-line contract (closes
  checklist Issue 4).
- Add step 7: parser MUST fail loudly on missing or malformed expected
  blocks. A silent-zero-load failure mode is worse than no check at all
  (closes elite review Production Reliability Finding #1).

Reference DEC-data-as-fenced-markdown-blocks as the governing pattern.
EOF
)"
```

---

## Task 6: Sync `CLAUDE.md` Current State

**Why:** Per the cross-skill artifact procedures in `CLAUDE.md`, whenever decisions are recorded or design/spec artefacts are modified, `### Current State` must reflect the change.

**Files:**
- Modify: `CLAUDE.md` (update the Decisions count, append the new DEC link, note the lexicon hardening)

**Step 1: Read the Decisions line in Current State**

```bash
grep -A 1 "Decisions: 4 Active recorded" CLAUDE.md
```

Expected: the line listing the 4 currently-recorded DECs.

**Step 2: Update Decisions count and link list**

Use Edit to change "Decisions: 4 Active recorded" to "Decisions: 5 Active recorded" and append `, [`DEC-data-as-fenced-markdown-blocks`](decisions/DEC-data-as-fenced-markdown-blocks.md)` to the inline list. Also update the index counts in the same line: `2-design/CLAUDE.design.md` (5 entries; was 4), `4-deploy/CLAUDE.deploy.md` (3 entries; was 2), `1-spec/CLAUDE.spec.md` (1 entry; was 0), and adapter component (5 entries; was 4).

Exact replacement (find the existing line and replace):

**Old:**
```
- Decisions: 4 Active recorded — [`DEC-layered-adapter`](decisions/DEC-layered-adapter.md), [`DEC-zero-runtime-deps`](decisions/DEC-zero-runtime-deps.md), [`DEC-frozen-error-codes`](decisions/DEC-frozen-error-codes.md), [`DEC-same-origin-monolith`](decisions/DEC-same-origin-monolith.md). Indexed in `2-design/CLAUDE.design.md` (4 entries), `4-deploy/CLAUDE.deploy.md` (2 entries), and per-component `CLAUDE.component.md` files (frontend: 2; adapter: all 4).
```

**New:**
```
- Decisions: 5 Active recorded — [`DEC-layered-adapter`](decisions/DEC-layered-adapter.md), [`DEC-zero-runtime-deps`](decisions/DEC-zero-runtime-deps.md), [`DEC-frozen-error-codes`](decisions/DEC-frozen-error-codes.md), [`DEC-same-origin-monolith`](decisions/DEC-same-origin-monolith.md), [`DEC-data-as-fenced-markdown-blocks`](decisions/DEC-data-as-fenced-markdown-blocks.md). Indexed in `1-spec/CLAUDE.spec.md` (1 entry), `2-design/CLAUDE.design.md` (5 entries), `4-deploy/CLAUDE.deploy.md` (3 entries), and per-component `CLAUDE.component.md` files (frontend: 2; adapter: 5).
```

**Step 3: Append a code-review-fixes line under "Implementation progress"**

Find the existing line:
```
- 2026-05-07: `TASK-define-editorial-lexicon` Done — ...
```

Append immediately after it (still inside the Implementation progress block):
```
- 2026-05-07: Code-review fix-up batch — recorded `DEC-data-as-fenced-markdown-blocks`, added `.github/CODEOWNERS`, added lexicon back-link in `REQ-USA-editorial-framing-reflection`, hardened lexicon's "How the check works" section (canonical path, whitespace contract, loud-failure clause). Closes 3 Important + 1 Minor finding from the post-task code review.
```

**Step 4: Verify**

```bash
grep "Decisions: 5 Active recorded" CLAUDE.md
grep "DEC-data-as-fenced-markdown-blocks" CLAUDE.md
grep "Code-review fix-up batch" CLAUDE.md
```

Expected: each grep returns at least 1 hit.

**Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): sync Current State after code-review fix-up batch"
```

---

## Verification: end-to-end

After all 5 commits, run the full verification:

```bash
git log --oneline -7
```

Expected: 5 new commits since `a7fe2f7`, in this order:
1. `docs(decisions): record DEC-data-as-fenced-markdown-blocks`
2. `docs(decisions): index DEC-data-as-fenced-markdown-blocks across all 4 phases`
3. `docs(governance): add CODEOWNERS for editorial-policy and SDLC artefacts`
4. `docs(spec): add lexicon and DEC back-link to editorial-framing requirement`
5. `docs(lexicon): harden 'How the check works' contract`
6. `docs(claude): sync Current State after code-review fix-up batch`

(That's 6 commits if you take this plan strictly task-by-task — Task 1 + Task 2 are deliberately separated.)

**Sanity grep:**

```bash
# DEC exists and is indexed everywhere it should be
ls decisions/DEC-data-as-fenced-markdown-blocks.md decisions/DEC-data-as-fenced-markdown-blocks.history.md
grep -l "DEC-data-as-fenced-markdown-blocks" \
  1-spec/CLAUDE.spec.md \
  2-design/CLAUDE.design.md \
  4-deploy/CLAUDE.deploy.md \
  3-code/adapter/CLAUDE.component.md \
  CLAUDE.md \
  4-deploy/runbooks/editorial-framing-lexicon.md \
  1-spec/requirements/REQ-USA-editorial-framing-reflection.md

# CODEOWNERS exists
cat .github/CODEOWNERS

# Lexicon has all three hardenings
grep "canonical path" 4-deploy/runbooks/editorial-framing-lexicon.md
grep "trims each line, drops empty lines" 4-deploy/runbooks/editorial-framing-lexicon.md
grep "MUST fail loudly" 4-deploy/runbooks/editorial-framing-lexicon.md
```

Expected: all 6 indexes return hits; CODEOWNERS prints; all three lexicon greps return at least 1 hit each.

**Push (optional, with user consent):**

```bash
git push origin main
```

---

## Out of scope (deferred to future tasks)

The following findings are deliberately **NOT** in this plan because they belong to `TASK-implement-check-editorial-framing` (the next task in Phase 1):

- Substring matching is too aggressive for `you will be`, `predicts`, `your future`, `may`, `möglich` (Issues 1+2 from checklist review). The matching strategy belongs in the script, not the lexicon.
- Surface detection mechanism (HTML data attributes vs comment markers vs class-based regex) — the script's design problem (Issue 2 from elite review).
- Path coupling / lexicon-as-CLI-arg (Issue Production Reliability #2 from elite review). Already documented as a contract in Task 5 step 2 (`--lexicon` CLI arg).

Architectural Finding #2 from the elite review (extensibility for future languages, e.g., FR) requires no current action — the naming convention already supports it; the script in `TASK-implement-check-editorial-framing` should discover blocks dynamically per the recommendation.

Process Finding #1 from the elite review (Phase header was changed outside the skill's nominal remit) is a one-off pragmatic call; no action required, but the principle is noted for the upstream `pangon/ai-sdlc-scaffold` maintainer as feedback.
