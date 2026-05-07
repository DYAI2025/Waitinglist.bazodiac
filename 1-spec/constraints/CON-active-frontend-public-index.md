# CON-active-frontend-public-index: Single active frontend in `public/index.html`

**Category**: Technical

**Status**: Active

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

The active frontend artifact is the single file `public/index.html`. All UI work — markup, styling, embedded JavaScript, DE/EN i18n dictionaries, motion-profile manager, animations, API client, modal flow, newsletter form — lives inline in this file. The Node adapter (`server.mjs` → `src/app.mjs`) serves it directly from `/`.

## Rationale

Single-file delivery keeps the deployable surface minimal: no bundler, no build step, no dependency tree on the frontend. This matches the zero-runtime-dependencies stack chosen for the backend and lets `scripts/check.mjs` verify the entire frontend (inline-script syntax, duplicate IDs, accessibility regressions, opt-in flag presence) in one pass without a separate frontend toolchain.

## Impact

- Frontend changes must edit `public/index.html` directly; there is no module split, transpiler, or asset pipeline.
- New animations, components, or data bindings live inline.
- The archived React iteration in `archive/react-src-iteration-1/` is preserved for reference but is **not** the source of the running product (see [CON-react-archive-inactive](CON-react-archive-inactive.md)).
- Future migration to a multi-file or bundled frontend would lift this constraint and require a new deployment-shape decision.
