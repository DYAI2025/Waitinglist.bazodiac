# DEC-frozen-error-codes: Trail

> Companion to `DEC-frozen-error-codes.md`.
> AI agents read this only when evaluating whether the decision is still
> valid or when proposing a change or supersession.

## Alternatives considered

### Option A: HTTP status alone as discriminator
- Pros: Simplest possible; no envelope needed; standard.
- Cons: Frontend wants to render verbatim, distinguishable strings (e.g., `FUFIRE_UNAVAILABLE` vs `INTERPRETATION_UNAVAILABLE` are both 502 but require different UI copy). HTTP status cannot encode that distinction. Conflicts directly with `REQ-USA-error-code-rendered-verbatim`.

### Option B: Numeric error codes (e.g., `1001`, `1002`)
- Pros: Compact; easy to sort.
- Cons: Self-documenting value lost — `code: 1004` does not tell a debugger or `curl` user what went wrong without a lookup table. Harder to grep across logs and code. Numeric drift across versions is harder to spot than ALL_CAPS string drift.

### Option C: Free-form strings ("rate limit hit, try again", "invalid email format")
- Pros: Trivial to add; reads like English in logs.
- Cons: Strings drift between deploys (typos, capitalization, punctuation) and break exact-match frontend rendering. Smoke tests cannot pin them. i18n becomes the frontend's problem on a moving target.

### Option D (chosen): Frozen ALL_CAPS string set
- Pros: Self-documenting (`FUFIRE_UNAVAILABLE` reads correctly in `curl`, logs, smoke tests, and the UI). Greppable across server + frontend. Drift is detected by adding a value not in `ERROR_CODES` (mechanical check). Safe to ship to a verbatim-rendering frontend.
- Cons: Adding a code requires touching three files (`errors.mjs` + `contracts/public-api.md` + `contracts/SMOKE_CHECKLIST.md`). Acceptable because the friction is exactly proportional to the contract impact.

## Reasoning

The frontend explicitly chose to render `error.code` verbatim (rather than translate or substitute) because the preview iteration cannot afford a translation table that drifts away from backend reality. That choice forces the codes to be a stable contract: every value users may see is a value the backend may emit and vice versa. Option D enforces that with the smallest amount of process. Trade-off accepted: small bookkeeping tax on every new error code. Conditions that would invalidate this reasoning: if the frontend introduces a translation layer with explicit fallback ("unknown error: please retry"), the contract pressure on backend codes lessens and looser conventions could be considered.

## Human involvement

**Type**: ai-proposed/human-approved

**Notes**: Proposed by `/SDLC-design` skill from the as-built code in `src/errors.mjs` (commit `7737da9`). Approved.

## Changelog

| Date | Change | Involvement |
|------|--------|-------------|
| 2026-05-07 | Initial decision | ai-proposed/human-approved |
