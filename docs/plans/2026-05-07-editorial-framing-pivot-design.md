# Editorial-Framing Pivot — Design Doc

**Date**: 2026-05-07
**Status**: Approved (brainstorming output)
**Trigger**: Cumulative-effects review of `2026-05-07-code-review-findings-fix` plan revealed the lexicon-as-blacklist approach false-flags Bazodiac's own anti-prediction copy ("Kein Horoskop-Versprechen", "Kein Schicksal. Eine Signatur."). Fundamental redirection requested by `STK-founder` rather than incremental fix.

## Decision

Replace the **forbidden-phrase blacklist** (with mechanical fail-build enforcement) with an **editorial guideline + soft-hint linter** approach. Brand-voice is treated as a values question requiring human editorial judgment, not a pattern-matching question. Words like "Horoskop" / "Schicksal" are **not forbidden** — they may appear in copy, especially in negating, redefining, or contrastive form ("Kein Horoskop-Versprechen. Eine Signatur."), which is in fact Bazodiac's signature voice.

Automated checks are reduced to **non-blocking hints** that surface watchwords for editorial review; they never fail builds.

## Brainstorming outcomes (Q&A)

| # | Question | Decision |
|---|----------|----------|
| Q1 | Survives any auto-check after the pivot? | **Yes, as soft hint** — no build-gate, no fail-exit |
| Q2 | Form of the new editorial guide? | **1-page editorial-voice.md in `1-spec/`** — principles + examples + watchwords inline |
| Q3 | How does the soft-hint script generate hints? | **Watchword-Hints** — small list of "review carefully" words, script flags occurrences with line + context, never fails |
| Q4 | Where do watchwords live? | **Inline in `1-spec/editorial-voice.md`** as a `## Watchwords` bullet section, parsed by the script |
| Q5 | Fate of `DEC-data-as-fenced-markdown-blocks`? | **Deprecate** — pattern had N=1 (the lexicon), instance is being deleted, new design uses bullet-list-under-heading (different shape) |

## Architecture

### Artefact layout (after pivot)

| Action | File | Purpose |
|---|---|---|
| **New** | `1-spec/editorial-voice.md` | 1-page source of truth: principles + examples + watchword list, all in one file |
| **Delete** | `4-deploy/runbooks/editorial-framing-lexicon.md` | Lexicon concept (forbidden/reflection lists, parser contract, loud-failure clause) is obsolete |
| **Deprecate** | `decisions/DEC-data-as-fenced-markdown-blocks.md` | Per `decisions/PROCEDURES.md`: Status → Deprecated, index entries removed in 4 phases, history-changelog appended |
| **New** | `scripts/check-editorial-voice.mjs` | Soft-hint linter; reads `## Watchwords` from editorial-voice.md, scans `public/index.html`, emits hints, exits 0 always |
| **New** | `tests/editorial-voice.test.mjs` | Tests watchword parsing + hint emission against fixture content |
| **Update** | `package.json` | Add `npm run editorial-hints` script (standalone, NOT in `npm run check`) |

### `1-spec/editorial-voice.md` skeleton

```markdown
# Editorial Voice

> **Status**: Active
> **Source**: GOAL-honest-reflection-framing
> **Source stakeholder**: STK-privacy-compliance-owner

## Stance in one paragraph

Bazodiac ist kein Horoskop. Es ist ein Reflexionsmodell, das aus echten
Chartdaten eine Cosmic Signature destilliert — keine Zukunftsvorhersage,
keine Schicksalsdeutung, keine Mystifizierung. Unsere Sprache muss diese
Position spiegeln: rational, ehrlich, reflexiv. Begriffe der Horoskop-
Tradition (Horoskop, Schicksal, Zukunft) dürfen vorkommen, aber **nur**
in negierender oder neu definierender Form ("Kein Horoskop. Eine
Signatur.") oder als bewusst markierter Kontrast.

## 4 Prinzipien

1. **Rational vor mystisch** — Begriffe wie "Cosmic Signature", "Wu-Xing",
   "BaZi" werden präzise verwendet, nicht poetisch verschleiert.
2. **Ehrlich vor versprechend** — keine Aussagen über Zukunft,
   Persönlichkeit oder Lebensweg in Indikativ-Form. Konjunktiv und
   Reflexionsfragen sind erwünscht.
3. **Reflexiv vor deklarativ** — Texte laden ein zu erkunden, statt
   Antworten zu liefern. "Vielleicht zeigt sich…" > "Du bist…".
4. **Negation als Markenstimme** — die Anti-Horoskop-Position wird
   *explizit* benannt. "Kein Schicksal. Eine Signatur." ist kanonische
   Bazodiac-Stimme, nicht ein Verstoß.

## 6 Vorher/Nachher-Beispiele

[3 DE + 3 EN: schlechte vs. gute Formulierung mit kurzem Kommentar]

## Watchwords

Diese Wörter sind nicht verboten. Sie verlangen einen kurzen
Editorial-Check beim Review: ist die Verwendung negierend / neu
definierend / bewusst kontrastiv? Wenn ja → ok. Wenn nein → umformulieren.

- Horoskop / horoscope
- Schicksal / fate / destiny
- Zukunft / future
- vorhersagen / predict
- versprechen / promise

Das Script `scripts/check-editorial-voice.mjs` flaggt Vorkommnisse als
Hinweise — niemals als Fehler.

## How to update this doc

Editorial-Updates per PR an `STK-founder` oder `STK-privacy-compliance-owner`
(via `.github/CODEOWNERS`). Ein Watchword hinzufügen heißt: ein Beispiel
in der Vorher/Nachher-Sektion ergänzen, das zeigt, *warum* das Wort
review-würdig ist.
```

Total: ~50 lines. Watchwords reduced from the original 12 (6 forbidden + 6 reflection) to 5.

### Script: `scripts/check-editorial-voice.mjs`

**Behaviour**:
1. Reads `1-spec/editorial-voice.md` (canonical path; overridable via `--voice <path>` CLI arg for tests).
2. Extracts the bullet list under `## Watchwords` heading via regex (`/^## Watchwords\s*$([\s\S]*?)^## /m` then per-line bullet parse). Splits each bullet on `/` so "Horoskop / horoscope" yields two watchwords.
3. Scans `public/index.html` for case-insensitive whole-line-context matches of each watchword.
4. For each match emits one plain-text hint:
   ```
   hint  public/index.html:780  "...Kein Horoskop-Versprechen..."
         watchword: "Horoskop" → review: negating/redefining/contrastive?
   ```
5. **Always exits 0**. Never fails the build.
6. Loud-failure remains for parser-level errors only (missing file, missing `## Watchwords` heading, malformed bullets) — these are infrastructure faults, not content findings.

**Constraints**:
- Zero runtime dependencies (`DEC-zero-runtime-deps`).
- No negation detection in v1. The "Kein X" / "No X" check would be ergonomic but contradicts the pivot's lesson ("don't reduce values to pattern matching"). Defer until reviewer fatigue is observed.
- Output is plain text, no JSON / SARIF. Reviewer reads with their eyes; if a CI mode is wanted later, add a `--json` flag.

**Build integration**: standalone `npm run editorial-hints` — explicitly NOT in `npm run check`. Reviewer invokes voluntarily before opening PR or after copy edits. Rationale: a never-failing check in CI just produces noise; explicit invocation respects the "soft hint" intent.

## Action map (clusters for the implementation plan)

The implementation plan (next step: `writing-plans`) will turn these clusters into ordered, atomic tasks. Listed in dependency order; tasks within a cluster can be parallelized.

### A. Forward construction
1. Create `1-spec/editorial-voice.md` (skeleton above)
2. Implement `scripts/check-editorial-voice.mjs` (spec above)
3. Add `npm run editorial-hints` entry to `package.json`
4. Add `tests/editorial-voice.test.mjs` (watchword parsing + sample-content hint emission)

### B. Reference updates (parallel to A after step 1 lands)
5. `1-spec/requirements/REQ-USA-editorial-framing-reflection.md` — rewrite acceptance criteria + revert Status: Approved → Draft (per Status-Downgrade rule). New AC summary: "the editorial review process documented in `1-spec/editorial-voice.md` is followed for all chart-interpretation copy". Founder re-approval needed.
6. `2-design/architecture.md` Frontend section — replace blacklist paragraph with reference to editorial-voice.md; update Coverage table row's "Covered by" cell.
7. `3-code/frontend/CLAUDE.component.md` — update REQ summary text in Requirements Addressed table.
8. `3-code/adapter/CLAUDE.component.md` — adapter's Requirements Addressed table also lists this REQ; update summary.
9. `1-spec/CLAUDE.spec.md` — Requirements Index summary update for the REQ.
10. `.github/CODEOWNERS` — replace `4-deploy/runbooks/editorial-framing-lexicon.md` line with `1-spec/editorial-voice.md`.

### C. Cleanup (after B has fully landed)
11. Delete `4-deploy/runbooks/editorial-framing-lexicon.md`.
12. Deprecate `DEC-data-as-fenced-markdown-blocks` per `decisions/PROCEDURES.md`:
    - `.md` Status → `Deprecated`
    - `.history.md` changelog entry: "2026-05-07 | Deprecated — first instance (editorial-framing-lexicon.md) removed in pivot; new design uses simpler bullet-under-heading pattern that does not need a recorded convention | ai-proposed/human-approved"
    - Remove rows from 4 phase indexes (`1-spec/CLAUDE.spec.md`, `2-design/CLAUDE.design.md`, `4-deploy/CLAUDE.deploy.md`, `3-code/adapter/CLAUDE.component.md`)

### D. Tasks.md restructure (Phase 1 of the original implementation plan)
13. `TASK-define-editorial-lexicon` (Done) — keep status Done, append Notes: "Superseded by editorial-voice.md in 2026-05-07 pivot. Lexicon file deleted. See docs/plans/2026-05-07-editorial-framing-pivot-design.md for rationale."
14. `TASK-implement-check-editorial-framing` → **Status: Cancelled** with reason "Renamed/redefined as TASK-implement-check-editorial-voice in 2026-05-07 pivot." Create new `TASK-implement-check-editorial-voice` with redefined scope.
15. `TASK-test-editorial-framing-script` → **Cancelled**, replaced by `TASK-test-editorial-voice-script`.
16. `TASK-wire-editorial-framing-into-check` → **Cancelled** with reason "Pivot removed npm-run-check wiring; standalone editorial-hints script instead." Replaced by new task `TASK-add-editorial-hints-npm-script`.
17. `TASK-document-editorial-framing-frontend` → **Cancelled**, replaced by `TASK-document-editorial-voice-frontend`.
18. `TASK-phase-1-manual-testing` → **Cancelled**, replaced by new manual-testing task targeting the voice doc + hint script.
19. **New** at top of Phase 1: `TASK-create-editorial-voice-doc` (precondition for everything else in Phase 1).

Convention: the pivot follows the SDLC scaffold's "never rename pre-existing task IDs" rule by **cancelling old IDs and creating new ones** rather than renaming in place. Git history shows the supersession trail.

### E. Status sync (`CLAUDE.md` Current State)
20. Spec phase block:
    - Goal/Story/Req approval counts: Reqs from "23 Approved" → "22 Approved + 1 Draft (REQ-USA-editorial-framing-reflection, downgraded by pivot rewrite)"
    - Add line: "Editorial-framing pivot 2026-05-07 — see `docs/plans/2026-05-07-editorial-framing-pivot-design.md`"
21. Design phase block:
    - Decisions count: 5 Active → 4 Active (DEC-data-as-fenced-markdown-blocks deprecated)
    - Index counts: 1-spec (1→0), 2-design (5→4), 4-deploy (3→2), adapter (5→4)
    - Mark completeness assessment as stale: spec rewrite invalidates prior assessment.
22. Implementation progress block:
    - Add bullet: "2026-05-07: Editorial-framing pivot — replaced blacklist approach with editorial-voice doc + soft-hint script. Tasks 14-18 from Phase 1 cancelled and replaced; see pivot design doc for rationale."
23. Gap analysis: append "(stale — pivot rewrote REQ-USA-editorial-framing-reflection)"; fresh analysis required before phase-gate work resumes.

### F. Design-completeness-assessment refresh
24. After E lands, run a fresh design-completeness-assessment via `/SDLC-design`. Expected outcome: 0 Critical (no broken refs), possibly 1 Important (REQ on Draft after rewrite), 1-3 Minor (vendor assumptions still unverified).

## Trade-offs explicitly accepted

- **Pivot generates ~10 commits of doc/process churn** for what is fundamentally a values clarification, not a code change. Acceptable: the prior approach was on track to produce a script that would fail-build on Bazodiac's own canonical brand voice. Better to spend the doc churn now than the debugging churn later.
- **Status downgrade on the REQ** triggers formal re-approval. Acceptable: the new acceptance criteria are substantively different and warrant founder sign-off as a fresh check.
- **Watchword reduction from 12 → 5** loses the "reflection-token presence" signal entirely. Acceptable: positive-signal checks ("does this surface contain at least one reflection token?") were always going to fail in nuanced ways; the pivot's soft-hint approach inherently relies on human review for positive judgment.
- **No negation detection in v1** means reviewers will see hints for "Kein Horoskop" copy and need to confirm-then-dismiss them. Acceptable at the project's current scale (~10 hits in 100KB file). If fatigue emerges, add it later as a `--smart` flag.

## Constraints respected

- `DEC-zero-runtime-deps` — script uses `node:fs`, `node:path` only.
- `CON-active-frontend-public-index` — only `public/index.html` is in scope; no `archive/`.
- `CON-no-synthesized-data-in-prod` — orthogonal, not affected.
- `GOAL-honest-reflection-framing` — strengthened, not weakened: the editorial guideline makes the goal's "copy frames reflection, not prediction" success criterion *more* enforceable through clearer guidance, even though enforcement shifts from mechanical to editorial.

## Next step

Invoke `superpowers:writing-plans` to turn the action map (clusters A-F above) into an ordered, atomic implementation plan with TDD-style steps and frequent commits. The plan will live alongside this design doc as `docs/plans/2026-05-07-editorial-framing-pivot-plan.md`.
