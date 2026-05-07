Phase-specific instructions for the **Design** phase. Extends [../CLAUDE.md](../CLAUDE.md).

## Purpose

This phase defines **how** we're building the system. Focus on architecture, data models, APIs, and key technical decisions.

## Files in This Phase

| File | Purpose |
|------|---------|
| [`architecture.md`](architecture.md) | System architecture overview and diagrams |
| [`data-model.md`](data-model.md) | Data structures, schemas, and relationships |
| [`api-design.md`](api-design.md) | API specifications and contracts |

---

## Decisions Relevant to This Phase

| File | Title | Trigger |
|------|-------|---------|
| [DEC-layered-adapter](../decisions/DEC-layered-adapter.md) | Layered adapter with stub-mode short-circuit at service layer | When adding a new endpoint, modifying provider boundaries, or proposing a new fallback mechanism. |
| [DEC-zero-runtime-deps](../decisions/DEC-zero-runtime-deps.md) | Zero runtime dependencies (Node built-ins only) | When proposing a new HTTP framework, runtime dependency, or build-tool integration. |
| [DEC-frozen-error-codes](../decisions/DEC-frozen-error-codes.md) | Frozen ALL_CAPS error code set as contract surface | When adding or changing an error code in `api-design.md` or `data-model.md`. |
| [DEC-same-origin-monolith](../decisions/DEC-same-origin-monolith.md) | Same-origin Node monolith (static + API in one process) | When proposing component boundaries, deployment topology, or a CDN integration. |
| [DEC-data-as-fenced-markdown-blocks](../decisions/DEC-data-as-fenced-markdown-blocks.md) | Versioned data files as Markdown with named fenced code blocks | When proposing a new versioned data artefact in `architecture.md`, `data-model.md`, or `api-design.md`. |
<!-- Add rows as decisions are recorded. File column: [DEC-kebab-name](../decisions/DEC-kebab-name.md) -->

---

## Linking to Other Phases

- Reference requirements from `1-spec/` to justify design choices
- Design documents guide implementation in `3-code/`
- Infrastructure design informs deployment in `4-deploy/`
