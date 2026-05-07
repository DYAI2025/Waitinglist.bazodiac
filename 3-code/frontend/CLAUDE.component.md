# Frontend

**Responsibility**: Bilingual (DE/EN) preview landing experience — chart submission UI, six chart tiles, consent-gated newsletter signup, live language toggle. Renders backend `error.code` verbatim with no synthesized fallback.

**Technology**: Single-file HTML/CSS/JS in [`public/index.html`](../../public/index.html). No bundler, no build step, no runtime dependencies. Embeds the only `apiClient` the browser uses today (default `API_BASE_URL=""` → same-origin). The React variants under `archive/` are reference-only and not build-ready (`CON-react-archive-inactive`).

## Interfaces

- **Outbound HTTP to `adapter`** (same-origin, default; `API_BASE_URL` overridable):
  - `POST /api/public/fusion-chart` — submit birth data, receive fusion chart.
  - `POST /api/public/fusion-interpretation` — submit prior chart, receive interpretation modal payload.
  - `POST /api/public/newsletter-signup` — submit email + name + consent, receive subscription envelope.
- **Inbound from `adapter`**:
  - `GET /` and `GET /index.html` — initial HTML delivery (with SPA fallback for unknown paths).
  - `GET /<asset>` — static asset delivery (long-lived `cache-control: public, max-age=31536000, immutable`).

The browser side renders `error.code` from the envelope verbatim. No client-side translation table; no fallback strings.

## Requirements Addressed

| File | Type | Priority | Summary |
|------|------|----------|---------|
| [REQ-F-language-toggle-live](../../1-spec/requirements/REQ-F-language-toggle-live.md) | Functional | Must-have | Language toggle updates the entire UI live, without page reload. |
| [REQ-F-null-birth-time-accepted](../../1-spec/requirements/REQ-F-null-birth-time-accepted.md) | Functional | Must-have | UI exposes the "I don't know my birth time" path; sends `birthTime: null`. |
| [REQ-USA-i18n-de-en-parity](../../1-spec/requirements/REQ-USA-i18n-de-en-parity.md) | Usability | Must-have | All visible UI text exists in both DE and EN with full parity. |
| [REQ-USA-error-code-rendered-verbatim](../../1-spec/requirements/REQ-USA-error-code-rendered-verbatim.md) | Usability | Must-have | Frontend renders backend `error.code` verbatim; no synthesized fallback. |
| [REQ-USA-editorial-framing-reflection](../../1-spec/requirements/REQ-USA-editorial-framing-reflection.md) | Usability | Must-have | Microcopy follows the editorial guideline at `1-spec/editorial-voice.md`; reviewed editorially per PR; `npm run editorial-hints` provides non-fatal hints. |
| [REQ-USA-keyboard-accessible-tiles](../../1-spec/requirements/REQ-USA-keyboard-accessible-tiles.md) | Usability | Should-have | Six chart tiles keyboard-focusable; live-localized ARIA; Escape dismiss. |
| [REQ-USA-no-8px-essential-text](../../1-spec/requirements/REQ-USA-no-8px-essential-text.md) | Usability | Should-have | No essential UI text uses `font-size: 8px`. |

## Relevant Decisions

| File | Title | Trigger |
|------|-------|---------|
| [DEC-frozen-error-codes](../../decisions/DEC-frozen-error-codes.md) | Frozen ALL_CAPS error code set as contract surface | When rendering or referencing `error.code` values; when adding new UI states for error codes. |
| [DEC-same-origin-monolith](../../decisions/DEC-same-origin-monolith.md) | Same-origin Node monolith (static + API in one process) | When introducing or changing the API base URL; when proposing a separate frontend deployment (CDN, Vercel, Netlify). |
