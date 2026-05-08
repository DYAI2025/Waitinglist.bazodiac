# Runbook: Editorial Review Process

## Overview

Manual editorial review for changes to `public/index.html` chart-interpretation copy, supported by the soft-hint linter `npm run editorial-hints`. Implements [`REQ-USA-editorial-framing-reflection`](../../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) and the editorial-voice guideline at [`1-spec/editorial-voice.md`](../../1-spec/editorial-voice.md).

The review is **editorial, not mechanical**. The linter surfaces watchwords as hints; humans (or AI agents acting as reviewers) judge each occurrence in context against the 4 principles.

## Prerequisites

- Local clone of the repo with `npm` available (no special tools).
- Read access to [`1-spec/editorial-voice.md`](../../1-spec/editorial-voice.md) — the editorial source of truth (4 principles + 6 examples + 5 watchwords).
- For the reviewer: assignment as `STK-founder` or `STK-privacy-compliance-owner` per [`.github/CODEOWNERS`](../../.github/CODEOWNERS) (auto-assigned by GitHub on `public/index.html` changes).

## Procedure

### Step 1: Run the soft-hint linter

```bash
npm run editorial-hints
```

Expected output: zero or more `hint  public/index.html:NNN  "...excerpt..."` lines, each followed by `watchword: "X" → review: negating/redefining/contrastive?`. The script always exits 0 — it never fails the build.

If the script exits 2, that is an **infrastructure error** (missing or malformed `1-spec/editorial-voice.md`), not an editorial finding. Fix the doc.

### Step 2: Classify each hint

For each emitted hint, classify the watchword's use in context:

| Classification | Decision |
|---|---|
| **Negating** — the watchword is preceded by *kein/keine/no/not a/never/niemals* | ✅ OK. This is canonical Bazodiac voice (e.g., `"Kein Horoskop. Eine Signatur."`). |
| **Redefining** — the watchword is being explicitly contrasted with the project's positioning | ✅ OK. Example: `"Bazodiac is not a horoscope service. It's a reflection model."` |
| **Contrastive** — the watchword names a tradition the copy is distancing from | ✅ OK. Example: `"Without horoscope-style fate-talk."` |
| **Prediction-asserting** — the watchword is used in indicative form to claim certainty about future events or destiny | ❌ Needs rewrite. |

If unsure, default to "needs rewrite" and flag for `STK-founder` adjudication.

### Step 3: Apply the 4 principles

For each piece of chart-interpretation copy in scope (hero, six chart tiles + ARIA labels, interpretation modal headline + body lead-in, newsletter consent label, error-rendering copy that comments on chart contents):

1. **Rational vor mystisch** — terms like "Cosmic Signature", "Wu-Xing", "BaZi" used precisely, not poetically obscured.
2. **Ehrlich vor versprechend** — no statements about future, personality, or life-path in indicative form. Subjunctive and reflection questions welcome.
3. **Reflexiv vor deklarativ** — copy invites exploration, not declares answers. *"Vielleicht zeigt sich…"* > *"Du bist…"*.
4. **Negation als Markenstimme** — the anti-horoscope position is *explicitly* named. *"Kein Schicksal. Eine Signatur."* is canonical, not a violation.

Six DE/EN before/after examples in `1-spec/editorial-voice.md` show the principles in action.

### Step 4: DE/EN parity check

Per [`REQ-USA-i18n-de-en-parity`](../../1-spec/requirements/REQ-USA-i18n-de-en-parity.md), every visible change must apply equally to DE and EN content. Verify both language entries in `public/index.html`'s i18n dictionary.

### Step 5: Sign off

In the PR review, either:
- **Approve** — copy aligns with the 4 principles in DE and EN; any watchword hits are negating/redefining/contrastive.
- **Request changes** — list the specific hints that need rewrite, with proposed alternatives where possible.

If the change introduces a **new watchword pattern** worth flagging in future reviews, add it to `1-spec/editorial-voice.md` `## Watchwords` section in the same PR (or a follow-up).

## Rollback

The editorial review is a PR-time gate; nothing to roll back at the repo level. If a problematic copy change reaches production, rollback is via standard git revert + redeploy — no editorial-specific rollback procedure.

## Troubleshooting

### "The linter reports no hits but I see a problematic phrase"

The watchword list in `1-spec/editorial-voice.md` is intentionally small (5 entries). It's not exhaustive — it's a checklist of the most common prediction-asserting traps. The reviewer's editorial judgment is the actual gate; the linter is a mechanical aid.

If a recurring phrase deserves automated flagging, add it to the watchword list in a follow-up PR.

### "The linter exits with code 2 / error 'missing Watchwords heading'"

The voice doc is malformed or missing. Verify `1-spec/editorial-voice.md` exists and has a `## Watchwords` section with at least one bullet. If the doc was renamed, update the script's default path or pass `--voice <path>` explicitly.

### "I'm not sure if a watchword use is negating or prediction-asserting"

When in doubt, escalate to `STK-founder` (`@DYAI2025`) via PR comment. Editorial calls on borderline cases are project-level decisions; better to ask than to merge ambiguous voice.

### "The linter is slow / produces too many hits"

Current state: ~13 hits in `public/index.html`, runs in <1s. If hits ever exceed ~30, consider:
- Tightening watchword definitions (move some to a "warning-only, less prominent" tier — would require a script change).
- Introducing negation-aware matching as a `--smart` flag (deliberately deferred in v1 per the editorial-framing pivot design).

## Related artefacts

- [`1-spec/editorial-voice.md`](../../1-spec/editorial-voice.md) — editorial source of truth (4 principles + examples + watchwords)
- [`scripts/check-editorial-voice.mjs`](../../scripts/check-editorial-voice.mjs) — soft-hint linter implementation
- [`tests/editorial-voice.test.mjs`](../../tests/editorial-voice.test.mjs) — linter test suite (7 tests)
- [`.github/CODEOWNERS`](../../.github/CODEOWNERS) — automated reviewer assignment
- [`docs/plans/2026-05-07-editorial-framing-pivot-design.md`](../../docs/plans/2026-05-07-editorial-framing-pivot-design.md) — pivot rationale (why this is editorial, not mechanical)
