# Phase 2 — Vendor Selection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (stays in this session) or superpowers:executing-plans (parallel session).

**Goal:** Resolve all 4 vendor-related decisions blocking `GOAL-real-provider-integration` — FuFirE deployment readiness, geocoding+timezone vendor, interpretation provider, newsletter vendor — by recording a `DEC-*` artefact per choice, linking the affected `ASM-*` files, and producing a vendor-selection runbook. Each decision is a HUMAN choice; this plan structures research → comparison → choice → recording.

**Architecture:** Per-vendor task structure: (a) AI gathers comparison data (pricing, features, GDPR fit, integration complexity), (b) presents matrix to user with recommendation, (c) **stops and asks** for the choice, (d) records the chosen vendor as a `DEC-*.md` + `.history.md` per `decisions/PROCEDURES.md`, (e) updates phase decision indexes. All 4 vendor tasks share this shape; differences are in the candidate set and evaluation criteria. Phase 2 ends with assumption-status updates and a runbook capturing the vendor-decision rationale.

**Tech Stack:** Markdown only. No source code touched. Possible web research via `WebFetch`/`WebSearch` to confirm current pricing/feature data for the public vendors (Mapbox, OpenCage, Brevo, etc.) — current as of 2026-05-08; plan accommodates the case where pricing changed.

---

## Pre-Flight: State Verification

**Step 0.1: Confirm git state**

```bash
git status -sb
git log --oneline -3
```

**Expected:** branch `main`, up-to-date with `origin/main` after the previous shipping commit. Working tree clean for in-repo paths.

**Step 0.2: Confirm Phase 2 prerequisites**

```bash
# Phase 1 must be reasonably complete (editorial-framing pivot shipped)
ls 1-spec/editorial-voice.md scripts/check-editorial-voice.mjs

# tasks.md still has the 6 Phase 2 tasks in Todo
grep "TASK-decide-" 3-code/tasks.md

# decisions/PROCEDURES.md and templates exist
ls decisions/_template.md decisions/_template.history.md decisions/PROCEDURES.md
```

**Expected:** all listed files exist; `grep` finds 4 `TASK-decide-*` rows in Todo state.

**Step 0.3: Confirm REQ-USA-editorial-framing-reflection re-approval is NOT a blocker**

Phase 2 vendor-selection work is for `GOAL-real-provider-integration` — a separate goal from `GOAL-honest-reflection-framing` (whose REQ is currently Draft pending re-approval). Confirm by checking that the 4 Approved Should-have requirements under `GOAL-real-provider-integration` are still Approved:

```bash
grep -E "REQ-F-stub-mode-toggle|REQ-F-config-validation-live|REQ-F-fufire-chart-mapping|REQ-REL-explicit-provider-failure|REQ-F-envelope-byte-compat" 1-spec/CLAUDE.spec.md | grep -v "Draft"
```

Expected: 5 hits (all the required Phase 2 source REQs, all Approved). If any show Draft, stop and re-approve before proceeding.

---

## Task 1: `TASK-decide-fufire-deployment` — FuFirE engine readiness + `DEC-fufire-baseline`

**Why first:** the FuFirE chart engine is the project's internal upstream service (not a vendor selection per se). The "decision" is about deployment readiness — is the engine reachable, what URL, what API key, what's the rollout pattern. Lower research burden than the public-vendor choices.

**Files:**
- Create: `decisions/DEC-fufire-baseline.md`
- Create: `decisions/DEC-fufire-baseline.history.md`
- Modify: `1-spec/assumptions/ASM-fufire-api-available.md` (link to new DEC)
- Modify: `1-spec/CLAUDE.spec.md`, `2-design/CLAUDE.design.md`, `4-deploy/CLAUDE.deploy.md`, `3-code/adapter/CLAUDE.component.md` (add DEC to indexes per PROCEDURES.md trigger conditions)

**Step 1.1: Gather FuFirE deployment context**

The FuFirE engine source is referenced in `2-design/architecture.md` and `1-spec/constraints/CON-fufire-chart-endpoint.md`. Read both and identify:
- Is FuFirE running in any environment today? (likely no — the project is in fixture-mode preview)
- Where would it run? (internal infrastructure, external host, etc.)
- Who owns it? (`STK-upstream-provider-maintainers`)
- What's the integration shape? (`POST {FUFIRE_BASE_URL}/chart`, header `X-API-Key`)

```bash
cat 1-spec/constraints/CON-fufire-chart-endpoint.md
grep -A 5 "FuFirE" 2-design/architecture.md | head -30
```

**Step 1.2: Present readiness assessment to user**

Output a structured summary:

```
FuFirE deployment readiness — current state:
  - Endpoint contract: POST {FUFIRE_BASE_URL}/chart, header X-API-Key
  - Production URL: NOT SET (no FUFIRE_BASE_URL in any active env)
  - Production API key: NOT SET
  - Deployment owner: STK-upstream-provider-maintainers (internal team)
  - Stub mode behavior: returns canonical fixture chart at fc_2719ae

Decision needed: rollout pattern. Options:
  A) Wait — defer until the upstream team commits a deployment timeline
  B) Self-host — set up an internal instance for staging integration tests
  C) Mock vendor — use a different chart engine (Astrolog, Swiss Ephemeris) and rewrite mapFufireResponse
```

**Step 1.3: Ask user for the decision**

Use `AskUserQuestion` to get the choice. The chosen option drives the DEC content.

**Step 1.4: Record `DEC-fufire-baseline.md` and `.history.md`**

Use the templates at `decisions/_template.md` / `_template.history.md`. The DEC's body reflects the chosen option (A/B/C). Trigger conditions: Code phase (when implementing/testing live FuFirE integration), Deploy phase (when configuring production env vars). Source: `REQ-F-fufire-chart-mapping`, `CON-fufire-chart-endpoint`, `ASM-fufire-api-available`.

**Step 1.5: Update phase decision indexes**

Per `decisions/PROCEDURES.md`: add a row to every phase index whose trigger conditions match. Likely 4 indexes (1-spec/CLAUDE.spec.md if Spec trigger matches, 2-design/CLAUDE.design.md, 4-deploy/CLAUDE.deploy.md, 3-code/adapter/CLAUDE.component.md).

**Step 1.6: Add DEC link to `ASM-fufire-api-available.md`**

Per the bidirectional-link rule: the assumption file gets a "Resolved by" section referencing the new DEC.

**Step 1.7: Mark `TASK-decide-fufire-deployment` Done in `3-code/tasks.md`**

**Step 1.8: Commit (single commit covering all 7 file changes)**

```bash
git add decisions/DEC-fufire-baseline.md decisions/DEC-fufire-baseline.history.md \
        1-spec/assumptions/ASM-fufire-api-available.md \
        1-spec/CLAUDE.spec.md 2-design/CLAUDE.design.md 4-deploy/CLAUDE.deploy.md \
        3-code/adapter/CLAUDE.component.md \
        3-code/tasks.md
git commit -m "$(cat <<'EOF'
docs(decisions): record DEC-fufire-baseline (Phase 2 Task 1)

[chosen rollout pattern: A/B/C as decided]

Closes TASK-decide-fufire-deployment. Links ASM-fufire-api-available
to the new DEC. Indexed in [N] phase decision indexes per
PROCEDURES.md trigger conditions.
EOF
)"
```

---

## Task 2: `TASK-decide-geocoding-vendor` — geocoding + timezone vendor + `DEC-geocoding-vendor`

**Why next:** independent of FuFirE; can be researched in parallel but executed serially per the never-parallel-implementation rule.

**Files:**
- Create: `decisions/DEC-geocoding-vendor.md`
- Create: `decisions/DEC-geocoding-vendor.history.md`
- Modify: `1-spec/assumptions/ASM-geocoding-vendor-affordable.md`
- Modify: 4 phase indexes per trigger conditions
- Modify: `3-code/tasks.md` (mark Done)

**Step 2.1: Research candidate vendors**

Three serious candidates per the plan:
- **Mapbox Geocoding API** — paid, generous free tier, EU/US data centers, IANA timezone via separate API or pre-resolution.
- **OpenCage Geocoding API** — paid, simple, GDPR-conscious EU hosting.
- **Google Geocoding API + Time Zone API** — paid, accurate, but EU privacy concerns and pricing model is least flexible.

Use `WebFetch` or `WebSearch` to confirm CURRENT (2026-05-08) pricing per 1k requests, free-tier limits, and IANA timezone support. Note: pricing changes; the matrix below is illustrative — fill in actual numbers during research.

**Step 2.2: Build comparison matrix**

```
| Vendor      | Free tier      | Paid /1k     | EU hosting | IANA TZ  | Setup    |
|-------------|----------------|--------------|------------|----------|----------|
| Mapbox      | [verify]       | [verify]     | yes        | separate | medium   |
| OpenCage    | [verify]       | [verify]     | yes        | included | low      |
| Google Geo  | [verify]       | [verify]     | partial    | separate | medium   |
```

Plus a one-paragraph "fit for Bazodiac" summary per vendor: which one matches `ASM-geocoding-vendor-affordable` (Medium-risk Unverified) and the project's privacy posture best.

**Step 2.3: Present matrix to user**

Output the matrix + recommendation. The candidate that hits the sweet spot of (price reasonable for preview-iteration traffic) + (IANA TZ included or easily resolvable) + (EU hosting for GDPR fit) is likely OpenCage, but **the user picks**.

**Step 2.4: Ask user via `AskUserQuestion`**

**Step 2.5-2.8: Record DEC + update indexes + ASM + tasks.md + commit**

Same shape as Task 1. The DEC's `Required patterns` section names the chosen vendor's environment-variable layout (`GEOCODING_API_URL`, `GEOCODING_API_KEY`).

---

## Task 3: `TASK-decide-interpretation-vendor` — interpretation provider + `DEC-interpretation-vendor`

**Files:**
- Create: `decisions/DEC-interpretation-vendor.md`
- Create: `decisions/DEC-interpretation-vendor.history.md`
- Modify: `1-spec/assumptions/ASM-interpretation-vendor-selectable.md`
- Modify: 4 phase indexes
- Modify: `3-code/tasks.md`

**Step 3.1: Research interpretation integration patterns**

Two main paths per the project's existing `INTERPRETATION_API_URL` env var:
- **Direct Gemini API** — call Google's Gemini 2.x via SDK or REST. Fast, cheap, but tightly couples to Google.
- **Proxy / abstraction layer** — call a self-hosted or third-party LLM router (LangChain server, Anthropic Claude, OpenAI GPT-4 via OpenRouter) that can swap providers. Slower, more complex, more flexible.

Cross-check: the project's `.env.example` already names `GEMINI_API_KEY` — that suggests the original assumption was Gemini-direct. Verify by reading.

**Step 3.2: Build comparison matrix**

```
| Path           | Latency       | Cost /1k tok    | Lock-in    | EU/data residency  |
|----------------|---------------|-----------------|------------|--------------------|
| Gemini direct  | low           | [verify 2026]   | high       | partial            |
| Proxy/router   | +50-200ms     | +overhead       | low        | depends on router  |
```

Plus: which path matches the bilingual content quality requirement (DE+EN reflection-framing copy needs nuanced output).

**Step 3.3-3.8:** present, ask, record DEC, update indexes, mark task Done, commit.

---

## Task 4: `TASK-decide-newsletter-vendor` — GDPR-compliant newsletter vendor + `DEC-newsletter-vendor`

**Files:**
- Create: `decisions/DEC-newsletter-vendor.md`
- Create: `decisions/DEC-newsletter-vendor.history.md`
- Modify: `1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md`
- Modify: 4 phase indexes
- Modify: `3-code/tasks.md`

**Step 4.1: Research GDPR-compliant newsletter vendors with double opt-in**

Three serious candidates per the plan:
- **Brevo** (formerly Sendinblue) — French/EU, generous free tier (up to 300 emails/day), double opt-in built in, REST API.
- **ConvertKit** — US-based, creator-focused, paid from day 1, GDPR-compliant via DPA.
- **Buttondown** — small, indie, US-based, simple API, GDPR-conscious.

Confirm 2026 pricing + features via web research.

**Step 4.2: Build matrix focusing on GDPR + double opt-in + API + price**

```
| Vendor      | GDPR/EU host | Double opt-in | API quality | Pricing 2026   |
|-------------|--------------|---------------|-------------|----------------|
| Brevo       | yes          | built-in      | good REST   | [verify]       |
| ConvertKit  | DPA only     | built-in      | good REST   | [verify]       |
| Buttondown  | DPA only     | built-in      | good REST   | [verify]       |
```

Plus the consent-flow integration cost (Brevo's API gives the cleanest "subscribe-with-confirmation-link" call, matching `REQ-SEC-consent-required`).

**Step 4.3-4.8:** present, ask, record DEC, update indexes, mark task Done, commit.

---

## Task 5: `TASK-update-assumption-statuses` — link 4 `ASM-*` files to their `DEC-*` records

**Why now:** Tasks 1-4 each linked one ASM to one DEC during the per-task work. This task does a final cross-cutting sweep to ensure all 4 assumptions consistently reference their resolving DECs and record the next-step transition (still `Unverified` until live test in Phase 4, but now linked).

**Files:**
- Modify: `1-spec/assumptions/ASM-fufire-api-available.md`
- Modify: `1-spec/assumptions/ASM-geocoding-vendor-affordable.md`
- Modify: `1-spec/assumptions/ASM-interpretation-vendor-selectable.md`
- Modify: `1-spec/assumptions/ASM-newsletter-vendor-gdpr-compliant.md`
- Modify: `1-spec/CLAUDE.spec.md` (Assumptions Index — add "Resolved by DEC-*" column or note where applicable)
- Modify: `3-code/tasks.md` (mark Done)

**Step 5.1: For each ASM**

Read the file. Add or update a `## Resolved by` (or `## Related Artifacts`) section to link the corresponding DEC. Status remains `Unverified` (Phase 4 flips to `Verified` after live smoke).

**Step 5.2: Update Assumptions Index summary**

In `1-spec/CLAUDE.spec.md`, update each row's Summary to mention the linked DEC.

**Step 5.3: Mark Done + commit**

ONE commit covering the 5 file edits.

---

## Task 6: `TASK-phase-2-manual-testing` — vendor-selection runbook

**Files:**
- Create: `4-deploy/runbooks/vendor-selection.md`
- Modify: `3-code/tasks.md` (mark Done)

**Step 6.1: Create the runbook**

```markdown
# Vendor Selection Rationale

> Recorded 2026-05-08 as part of Phase 2 of the implementation plan.

## Decisions

| Provider          | Chosen vendor / approach    | Decision file                                    |
|-------------------|------------------------------|-------------------------------------------------|
| FuFirE chart      | [chosen rollout pattern]    | [DEC-fufire-baseline](../../decisions/DEC-fufire-baseline.md) |
| Geocoding+TZ      | [chosen vendor]             | [DEC-geocoding-vendor](...)                     |
| Interpretation    | [chosen path]               | [DEC-interpretation-vendor](...)                |
| Newsletter        | [chosen vendor]             | [DEC-newsletter-vendor](...)                    |

## Comparison criteria used

[paste the 4 matrices used during decision]

## Rollout plan per provider

[1-paragraph plan per provider — who configures the env vars, when, in
 which staging environment first, what's the smoke-test gate]

## Open questions / followups

[anything the user explicitly deferred during the decision conversation]
```

**Step 6.2: Mark Done + commit**

---

## Phase 2 outcome

After Tasks 1-6 land:
- 4 new `DEC-*` artefacts (FuFirE-baseline, geocoding, interpretation, newsletter), all `Active`, all indexed in 1-spec/2-design/4-deploy/3-code/adapter per trigger conditions.
- 4 `ASM-*` files linked to their resolving DECs (status still `Unverified` until Phase 4 live smoke).
- 1 new runbook `4-deploy/runbooks/vendor-selection.md` capturing rationale.
- 6 Phase 2 tasks `Done` in `3-code/tasks.md`.
- `CLAUDE.md` Current State: 4 Active → 8 Active decisions (still 1 Deprecated); index counts updated.

This unblocks Phase 3 (Live-mode integration) — each provider's `configure-*-live` task can now reference its resolving DEC for env-var layout and integration semantics.

---

## Out of scope for Phase 2

- **Actually wiring credentials in production env** — that's Phase 3's `configure-*-live` tasks.
- **Verifying the assumptions live** — that's Phase 4's `mark-assumptions-verified`.
- **Updating `CLAUDE.md` Current State** — happens incrementally during Tasks 1-4 (decisions count) and Task 6 (runbook reference).

---

## Summary

| Task | Type | User input needed? | Output |
|---|---|---|---|
| 1 | TASK-decide-fufire-deployment | Yes (rollout choice A/B/C) | DEC-fufire-baseline |
| 2 | TASK-decide-geocoding-vendor | Yes (vendor choice) | DEC-geocoding-vendor |
| 3 | TASK-decide-interpretation-vendor | Yes (path choice) | DEC-interpretation-vendor |
| 4 | TASK-decide-newsletter-vendor | Yes (vendor choice) | DEC-newsletter-vendor |
| 5 | TASK-update-assumption-statuses | No | 4 ASMs linked to DECs |
| 6 | TASK-phase-2-manual-testing | No (uses prior decisions) | vendor-selection runbook |

**Total: 6 tasks, ~6 commits, 4 user-decision gates.**

Each task = one commit covering all artefacts touched. Subagent-driven works but each implementer subagent must explicitly use the "ask questions" affordance to get the user's vendor choice before recording the DEC. Alternative execution: orchestrator (you) handles each task directly to keep the user-decision turn-around fast — for a 4-decision phase, that may be more pragmatic than 4 separate implementer dispatches.
