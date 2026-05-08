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
| [DEC-fufire-baseline](../decisions/DEC-fufire-baseline.md) | Consume the deployed BAFE engine as the FuFirE provider | When modifying the upstream-FuFirE schema mapping in `data-model.md` or `api-design.md`, or when introducing a new BAFE endpoint to the architecture. |
<!-- Add rows as decisions are recorded. File column: [DEC-kebab-name](../decisions/DEC-kebab-name.md) -->

---

## External context

Verbatim snapshots of upstream documentation referenced by design and decision artefacts live under [`external-context/`](external-context/). These files preserve the source language per the language-policy carve-out in [`../CLAUDE.md`](../CLAUDE.md); the live source-of-truth named in each file's frontmatter takes precedence on conflict.

| File | Purpose |
|------|---------|
| [`external-context/bafe-api-reference.md`](external-context/bafe-api-reference.md) | BAFE / FuFirE engine API documentation snapshot (captured 2026-05-08); referenced by [`DEC-fufire-baseline`](../decisions/DEC-fufire-baseline.md), [`CON-fufire-chart-endpoint`](../1-spec/constraints/CON-fufire-chart-endpoint.md), and [`ASM-fufire-api-available`](../1-spec/assumptions/ASM-fufire-api-available.md). |

---

## Linking to Other Phases

- Reference requirements from `1-spec/` to justify design choices
- Design documents guide implementation in `3-code/`
- Infrastructure design informs deployment in `4-deploy/`
