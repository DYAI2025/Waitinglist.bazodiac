# ASM-interpretation-vendor-selectable: An interpretation vendor will be procurable at acceptable terms

**Category**: Business

**Status**: Unverified

**Risk if wrong**: Medium — without a viable interpretation vendor, the interpretation modal stays in `INTERPRETATION_UNAVAILABLE` state in production and the chart-only experience is incomplete. Mitigation: the Iteration-2 interpretation provider boundary is generic, so the vendor is swappable; pre-launch experience continues in stub mode.

## Statement

A Gemini-based provider (or an equivalent proxy service such as Vertex AI, OpenRouter, or a self-hosted model) will be procurable at acceptable cost, rate-limit terms, and data-handling terms before production launch.

## Rationale

The Gemini family is widely available, and `src/providers/interpretationProvider.mjs` is intentionally generic so that the vendor can be swapped without changing the public contract or the frontend. Several proxy services offer Gemini-equivalent capabilities under different commercial terms.

## Verification Plan

1. Vendor evaluation matrix: Gemini direct vs. Vertex AI vs. OpenRouter vs. self-hosted (ollama / llama.cpp), scoring on cost per 1k tokens, rate limits, latency, content filtering, and EU data-residency.
2. Cost projection: estimated requests per visitor × target visitor volume × cost per request — compared against pre-launch budget.
3. Contract / data-handling review with the privacy-compliance owner before signing.
4. Runtime verification post-selection: `INTERPRETATION_API_URL` + `GEMINI_API_KEY` set in staging; integration smoke produces non-empty `interpretation.body` against real birth data.

## Related Artifacts

- [GOAL-real-provider-integration](../goals/GOAL-real-provider-integration.md)
- [REQ-F-fusion-interpretation-endpoint](../requirements/REQ-F-fusion-interpretation-endpoint.md)
- [REQ-F-stub-mode-toggle](../requirements/REQ-F-stub-mode-toggle.md)
- [REQ-F-config-validation-live](../requirements/REQ-F-config-validation-live.md)
