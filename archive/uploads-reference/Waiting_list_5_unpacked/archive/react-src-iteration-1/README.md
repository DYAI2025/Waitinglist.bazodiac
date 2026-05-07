# react-src-iteration-1

Archived frontend prototype.

## Status

- **Not build-ready.** Missing `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, and the `src/services/` API layer.
- **Not canonical** for Backend Iteration 2.
- Contains reusable React components and UI ideas for a later React port.
- Missing service layer and build configuration.

## Canonical frontend for Backend Iteration 2

[`/public/index.html`](../../public/index.html)

The canonical frontend is the standalone HTML artifact. Backend Iteration 2 must implement against the contract documented in [`/contracts/public-api.md`](../../contracts/public-api.md), not against this archived `src/` tree.

## Why this exists

This `src/` folder is preserved (not deleted) because:

1. The component decomposition (`BirthDataForm`, `FusionChartCard`, `FusionReportModal`, `NewsletterSignupForm`, `ConstellationLayer`) maps 1:1 onto sections in the canonical HTML and will be useful when porting back to React.
2. Type definitions in `types.ts` reflect the same data shapes used by the canonical HTML's `apiClient`.
3. Some component-level UI experiments (animation primitives, layout decisions) are worth referencing during the React port.

## What is missing for build-readiness

To revive this folder as an active React app, you would need to add:

- `package.json` with dependencies (`react`, `react-dom`, `motion`, `lucide-react`, `react-markdown`, `tailwindcss`)
- `vite.config.ts`
- `tsconfig.json`
- `src/main.tsx` entry point
- Root-level `index.html` for Vite
- `src/services/publicApi.ts` with `requestFusionChart`, `requestFusionInterpretation`, `submitNewsletterSignup` wrapping the three endpoints
- Env-driven `API_BASE_URL` (`import.meta.env.VITE_PUBLIC_API_BASE_URL`)
- Surfacing `error.code` from API responses to the UI

## Do not implement Backend Iteration 2 against this folder

If you are an agent or a developer landing here mid-task: stop. The active frontend lives at `/public/index.html`. Backend services must be built against the contract in `/contracts/public-api.md`.
