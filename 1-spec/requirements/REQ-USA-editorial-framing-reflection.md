# REQ-USA-editorial-framing-reflection: Editorial framing of reflection vs. prediction microcopy

**Type**: Usability

**Status**: Approved

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
