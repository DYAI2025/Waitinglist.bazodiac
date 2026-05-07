# REQ-USA-editorial-framing-reflection: Editorial framing of reflection vs. prediction microcopy

**Type**: Usability

**Status**: Approved

**Priority**: Must-have

**Source**: [GOAL-honest-reflection-framing](../goals/GOAL-honest-reflection-framing.md)

**Source stakeholder**: [STK-privacy-compliance-owner](../stakeholders.md)

## Description

Frontend microcopy that interprets chart data must use reflection-oriented phrasing — language that invites consideration, suggests exploration, or frames provisionally — rather than prediction-asserting phrasing that claims certainty about future events. This requirement formalizes the editorial intent of `GOAL-honest-reflection-framing` so that copy changes are reviewable both mechanically (forbidden-phrase grep) and editorially (presence of reflection tokens per surface).

The covered surfaces are: hero copy, the six chart tile tooltips and ARIA labels, the interpretation modal headline and body lead-in, the newsletter consent label, and any error-rendering copy that comments on chart contents.

## Acceptance Criteria

- Given the rendered content of `public/index.html` plus any tooltip / aria strings, when grepped against a forbidden-phrases list (DE: `Schicksal`, `Vorhersage`, `Horoskop`, `wird sein`, `wird passieren`, `bestimmt sein`; EN: `you will be`, `predicts`, `destined`, `your future`, `horoscope`, `fortune-tells`), then no occurrence is found inside the covered surfaces.
- Given the same surfaces, when each is reviewed, then each contains at least one reflection token per language (DE: `Reflexion`, `Einladung`, `vielleicht`, `möglich`, `erkunden`, `betrachten`; EN: `reflect`, `invite`, `consider`, `may`, `explore`, `provisional`).
- Given a copy-change PR, when prepared for merge, then a check script `scripts/check-editorial-framing.mjs` (to be added) enforces the forbidden list as a `npm run check` step and fails the build on any forbidden hit. The reflection-token check remains a manual editorial review until the lexicon is finalized.
- Given DE and EN copy, when both are reviewed, then both meet the same standard (parity with [REQ-USA-i18n-de-en-parity](REQ-USA-i18n-de-en-parity.md)).

## Related Constraints

- [CON-active-frontend-public-index](../constraints/CON-active-frontend-public-index.md) — the editorial review applies to the single active frontend; archive variants are not in scope.
- [CON-no-synthesized-data-in-prod](../constraints/CON-no-synthesized-data-in-prod.md) — editorial framing reinforces the no-synthesis posture by avoiding deterministic claims about chart outputs.
