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
