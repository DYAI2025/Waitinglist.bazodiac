# Stakeholders

Everyone with a stake in the system: those who use it, fund it, maintain it, or are affected by it. Every requirement should trace back to a stakeholder need.

## Influence Levels

- **High** — can approve or veto decisions; priority conflicts resolved in their favor
- **Medium** — consulted during review; concerns addressed but may be overruled
- **Low** — informed of decisions; needs considered but not blocking

## Stakeholder Table

| ID | Role | Description | Interests | Influence |
|----|------|-------------|-----------|-----------|
| STK-founder | Project owner & initiator (Benjamin Poersch / DYAI2025) | Defines product vision, approves scope, owns the repository, decides on stakeholder priorities. | Pre-launch validation; Bazodiac brand integrity; a deployable preview before the upstream backend services are connected. | High |
| STK-prospective-user | Visitor of the waitlist landing page (DE/EN, B2C) | Anonymous web visitor who may submit birth data and (optionally) sign up for newsletter updates. Today the experience runs in stub mode against fixture data. | Honest reflection-framing (not a predictive horoscope); short flow time; works even without a known birth time; full bilingual parity (DE/EN). | Medium |
| STK-newsletter-subscriber | Visitor who consents to release updates | The prospective user after consenting to email updates — at that moment becomes a GDPR data subject (lawful basis: consent). | Lawful processing of email + name + chart-session reference; ability to withdraw; no PII leakage in logs or error messages; clear retention. | Medium |
| STK-upstream-provider-maintainers | Maintainers of the upstream chart engine, geocoding/timezone, interpretation, and newsletter provider services | Internal teams responsible for the FuFirE/BAFE chart engine, the geocoding/timezone vendor, the Gemini-based interpretation service, and the newsletter delivery vendor. They jointly own the real-mode contract surface that the adapter must conform to. | Stable downstream contract; predictable request load; clear error semantics from the adapter; provider boundaries that map cleanly to their service shapes. | High |
| STK-railway-platform | Hosting platform (Railway, via Nixpacks) | The deployment target. Imposes conventions on runtime, port binding, healthchecks, env-var injection, and build entry. | Healthcheck `/healthz` reachable; single `npm start` entry point; standard `PORT`/`HOST` env-var handling; no host-binding hacks; restart on failure. | Low |
| STK-privacy-compliance-owner | Privacy / data protection accountability owner (not necessarily a formal DPO) | Accountable for lawful handling of birth data, email, consent, provider transfer, and deletion / withdrawal expectations across the stub and production modes. | GDPR-safe consent flow; no unnecessary PII exposure (logs, error bodies); clear provider-boundary documentation; no fake or silent data processing in any mode. | High |
