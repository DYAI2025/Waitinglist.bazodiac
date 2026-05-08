# Frontend Component

The Bazodiac waitlist frontend is a **single-file** static experience: HTML + CSS + JS in [`public/index.html`](../../public/index.html), no bundler, no build step.

> **Component definition**: [`CLAUDE.component.md`](CLAUDE.component.md) — responsibility, interfaces, requirements, decisions.

## Files in scope

| Path | Role |
|---|---|
| [`public/index.html`](../../public/index.html) | The entire frontend (~100 KB). HTML + inline CSS + inline JS + DE/EN i18n + apiClient |
| `archive/` | Reference-only; **NOT** build-ready. Out of scope per [`CON-react-archive-inactive`](../../1-spec/constraints/CON-react-archive-inactive.md). |

## Local serving

The frontend is served by the adapter (same-origin per [`DEC-same-origin-monolith`](../../decisions/DEC-same-origin-monolith.md)):

```bash
npm start
# → http://localhost:3000
```

In the browser, the homepage GET serves `public/index.html`. The frontend's embedded `apiClient` calls `/api/public/*` against the same origin.

## Copy-change workflow

When you edit chart-interpretation copy (hero, six chart tiles, interpretation modal, newsletter consent label, error rendering):

1. **Edit `public/index.html`** directly. Both DE strings (`data-i18n` keys + the i18n dictionary at the bottom of the file) and EN strings.
2. **Consult [`1-spec/editorial-voice.md`](../../1-spec/editorial-voice.md)** — the 4 principles + 5 watchwords are the editorial source of truth.
3. **Run the soft-hint linter** to surface watchword occurrences:
   ```bash
   npm run editorial-hints
   ```
   Read each hint. For each one, classify the use as **negating/redefining/contrastive** (OK — that's Bazodiac's signature voice, e.g. *"Kein Horoskop-Versprechen. Eine Signatur."*) or **prediction-asserting** (needs rewrite). Hints are non-fatal — the script never fails the build.
4. **Open a PR**. [`.github/CODEOWNERS`](../../.github/CODEOWNERS) auto-assigns `@DYAI2025` (`STK-founder` / `STK-privacy-compliance-owner`) as required reviewer for `public/index.html` changes.
5. **Reviewer applies the 4 principles** from `editorial-voice.md` and signs off (or requests changes). Detailed reviewer steps live in [`4-deploy/runbooks/editorial-review-process.md`](../../4-deploy/runbooks/editorial-review-process.md).

### When to update the watchword list

Watchwords live as a bullet list in `## Watchwords` of `1-spec/editorial-voice.md`. Add a watchword when:
- A new copy review surfaced a recurring prediction-asserting term.
- The new term should be flagged for future reviewer attention (without becoming forbidden).

To add: edit the `## Watchwords` section in `editorial-voice.md`, also add a Vorher/Nachher example showing why the term is review-worthy. PR review goes through CODEOWNERS the same way.

## DE/EN parity

Per [`REQ-USA-i18n-de-en-parity`](../../1-spec/requirements/REQ-USA-i18n-de-en-parity.md), every visible UI string exists in both DE and EN with full parity. The dictionary at the bottom of `public/index.html` is the canonical place; `data-i18n` keys reference it. Language toggle is live (no page reload) per [`REQ-F-language-toggle-live`](../../1-spec/requirements/REQ-F-language-toggle-live.md).

When adding a new visible string:
1. Add to the DE dictionary entry.
2. Add to the EN dictionary entry.
3. Reference via `data-i18n="key.path"` in the HTML.
4. Smoke-test by toggling DE↔EN in the running page.

## What lives elsewhere

- The HTTP server, contract surface, error envelope: [`adapter`](../adapter/) component.
- The editorial guideline (4 principles + 6 examples + 5 watchwords): `1-spec/editorial-voice.md`.
- The soft-hint linter implementation: `scripts/check-editorial-voice.mjs` (in the adapter component's tree but used from frontend reviews).
