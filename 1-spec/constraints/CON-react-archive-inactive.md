# CON-react-archive-inactive: React archive is reference-only, not build-ready

**Category**: Technical

**Status**: Active

**Source stakeholder**: [STK-founder](../stakeholders.md)

## Description

The directories `archive/react-src-iteration-1/`, `archive/standalone/`, and `archive/uploads-reference/` are reference-only. They preserve historical iterations of the design (component tree, copy choices, asset experiments) but are **not** build-ready and must not be imported, bundled, deployed, or treated as a parallel implementation path.

## Rationale

Two parallel frontends would create drift between the deployed surface (`public/index.html`) and the archive, plus ambiguity about which artifact is canonical. Keeping the archive read-only avoids accidentally shipping stale code or confusing contributors about which file is authoritative.

## Impact

- Tooling, CI, and contributors (human or AI) must treat `archive/` as documentation. Edits there do not modify the running product.
- Static checks (`scripts/check.mjs`) and the smoke test (`scripts/smoke-test.mjs`) explicitly target only `public/index.html` and the live `server.mjs` flow.
- If a future iteration revives the React variant, this constraint must be lifted and the new build pipeline integrated into the deployment shape ([CON-same-origin-node-deployment](CON-same-origin-node-deployment.md) would also need revisiting).
