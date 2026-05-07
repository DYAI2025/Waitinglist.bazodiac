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
