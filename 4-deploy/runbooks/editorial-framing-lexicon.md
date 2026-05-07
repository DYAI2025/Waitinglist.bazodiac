# Editorial Framing Lexicon

> **Source of truth** for the editorial-framing check enforced by [`REQ-USA-editorial-framing-reflection`](../../1-spec/requirements/REQ-USA-editorial-framing-reflection.md). Consumed mechanically by `scripts/check-editorial-framing.mjs` (planned in `TASK-implement-check-editorial-framing`).
>
> Update this file when a new pattern of prediction-asserting language is observed in copy review, or when a new reflection token enters the editorial vocabulary. Updates require an editorial sign-off, not just a code review.

## Purpose

Bazodiac's positioning is **reflection, not prediction** ([`GOAL-honest-reflection-framing`](../../1-spec/goals/GOAL-honest-reflection-framing.md)). The frontend renders chart interpretations and microcopy that must invite consideration rather than assert determined futures. This lexicon is the formal contract for what that means: a list of phrases that are **forbidden** because they assert predictions, and a list of **reflection tokens** that confirm a surface uses inviting, provisional language.

The forbidden list is the mechanical floor — any hit fails `npm run check`. The reflection-token list is a positive signal — surfaces should contain at least one per language. The reflection-token check remains a manual editorial review until the lexicon is finalized; the forbidden-phrase check is fully automated.

## Surfaces in scope

The check applies to user-facing copy on these surfaces inside `public/index.html`:

- **Hero copy** — the landing-page header, subhead, and call-to-action language.
- **Chart tile tooltips and ARIA labels** — the six tiles (sun, moon, ascendant, BaZi year animal, daymaster, dominant element).
- **Interpretation modal** — headline and body lead-in (the first paragraph; deeper body content is fed by the upstream interpretation provider and reviewed separately).
- **Newsletter consent label** — the consent checkbox label and any explanatory copy adjacent to it.
- **Error-rendering copy** — any user-facing string that *comments on chart contents* (not generic system errors like `MALFORMED_JSON`).

Out of scope:
- Backend `error.message` strings (these are debug-grade English-only per [`REQ-SEC-no-pii-in-logs`](../../1-spec/requirements/REQ-SEC-no-pii-in-logs.md)).
- Stable `error.code` values (frozen ALL_CAPS per [`DEC-frozen-error-codes`](../../decisions/DEC-frozen-error-codes.md)).
- Comments inside HTML/CSS/JS that are not rendered to users.
- `archive/` and reference variants (per [`CON-react-archive-inactive`](../../1-spec/constraints/CON-react-archive-inactive.md)).

## Lexicon

The check script reads the four fenced code blocks below as line-delimited lists. Each line is a phrase to match (case-insensitive, whole-substring match). Empty lines and lines starting with `#` (in-block comments) are ignored.

### Forbidden phrases — DE

Phrases that assert prediction, fate, or determined futures in German. Any occurrence inside an in-scope surface fails the check.

```forbidden-de
Schicksal
Vorhersage
Horoskop
wird sein
wird passieren
bestimmt sein
```

### Forbidden phrases — EN

Phrases that assert prediction, fate, or determined futures in English. Any occurrence inside an in-scope surface fails the check.

```forbidden-en
you will be
predicts
destined
your future
horoscope
fortune-tells
```

### Reflection tokens — DE

Words that signal reflection, invitation, or provisional framing in German. At least one per language is expected per surface.

```reflection-de
Reflexion
Einladung
vielleicht
möglich
erkunden
betrachten
```

### Reflection tokens — EN

Words that signal reflection, invitation, or provisional framing in English. At least one per language is expected per surface.

```reflection-en
reflect
invite
consider
may
explore
provisional
```

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

## Editorial review process

When making copy changes:

1. Edit `public/index.html` as usual.
2. Run `npm run check` locally; fix any forbidden-phrase hits before pushing.
3. If `npm run check` warns about missing reflection tokens, decide whether to:
   - Add a reflection token to the surface (preferred), or
   - Justify the absence in the PR description (e.g., a one-word button label has no room for reflection vocabulary).
4. If the change introduces new copy patterns that this lexicon does not yet cover, **propose a lexicon update in the same PR** — add a forbidden phrase you noticed in review, or a reflection token you want to make canonical.

Lexicon updates require:
- Editorial sign-off from `STK-privacy-compliance-owner` or `STK-founder` (per the source-stakeholder linkage in `REQ-USA-editorial-framing-reflection`).
- A short rationale in the PR description (why this phrase matters; example of where it could appear).

## Examples

### DE

| ❌ Prediction-asserting | ✅ Reflection-framing |
|---|---|
| „Dein Schicksal: Du wirst eine große Reise machen." | „Eine Einladung zur Reflexion: möglich, dass eine Reise dich aktuell beschäftigt." |
| „Die Sterne sagen voraus, dass…" | „Die Sterne laden ein, zu betrachten, dass…" |
| „Das wird passieren, wenn…" | „Vielleicht erkundest du, was bei dir auftaucht, wenn…" |

### EN

| ❌ Prediction-asserting | ✅ Reflection-framing |
|---|---|
| "Your future will be shaped by…" | "You may consider how your present is shaped by…" |
| "This horoscope predicts…" | "This reading invites you to reflect on…" |
| "You are destined to meet…" | "You may explore the possibility of meeting…" |

## Versioning

This file is version-controlled in git. Treat the four fenced code blocks as data, not prose — additions and removals are reviewable as line-level diffs in PRs.

The lexicon is intentionally **small** at this stage (six entries per list) so editorial reviewers can keep the full vocabulary in working memory. As more copy ships and reviewers identify recurring patterns, the lexicon can grow — but each addition should pass the test "is this a phrase a reasonable copy reviewer would also flag?".

When the lexicon stabilizes (a few iterations without churn), promote the warnings to fatal in `scripts/check-editorial-framing.mjs` so the reflection-token check becomes mechanical too.
