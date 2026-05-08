# Phase 2 Design: FuFirE-Alignment statt Vendor-Entscheidung

**Datum:** 2026-05-08
**Status:** Approved (User-Freigabe 2026-05-08)
**Vorgänger:** [`2026-05-08-phase-2-vendor-selection.md`](2026-05-08-phase-2-vendor-selection.md) (verworfen — basierte auf der Annahme, FuFirE existiere noch nicht)

---

## Goal

Die Waitinglist-Artefakte mit der Wahrheit der bereits deployten BAFE-Engine in Einklang bringen. `ASM-fufire-api-available` wird Verified, ein konkretes `DEC-fufire-baseline` ersetzt das spekulative "Wait/Self-host/Mock"-Trio, und `CON-fufire-chart-endpoint` wird auf den realen Endpoint umgestellt.

## Why now

Die mitgelieferte API-Dokumentation (vom User in der Brainstorm-Session, Stand 2026-05-08) zeigt:

- BAFE läuft live unter `https://bafe-2u0e2a.fly.dev` (Fallback `https://bafe-production.up.railway.app`).
- Die Engine hat **keinen** `/chart`-Endpoint — sie hat `/v1/fusion`, `/v1/bazi`, `/v1/western`, `/v1/experience/bootstrap`, `/v1/experience/daily`, `/v1/experience/signature-delta`.
- API-Key-Tier `ff_pro_*` mit Rate Limit 30 req/min auf `/v1/fusion` und `/v1/experience/*`.
- CORS-Whitelist erforderlich; Wildcard explizit verboten.

Der Status quo der SDLC-Artefakte (`ASM-fufire-api-available` Unverified, `CON-fufire-chart-endpoint` schreibt `/chart`) ist nachweislich falsch. Die Wahrheit muss ins Repo, bevor Phase-3-Code-Arbeit gegen die falsche Spezifikation läuft.

---

## Scope (in)

### 1. `decisions/DEC-fufire-baseline.md` + `.history.md`

**Status:** Active. **Source:** `REQ-F-fufire-chart-mapping`, `CON-fufire-chart-endpoint`, `ASM-fufire-api-available`.

**Inhalt:**

- Production-URL: `https://bafe-2u0e2a.fly.dev`
- Fallback-URL: `https://bafe-production.up.railway.app`
- API-Key-Tier: `ff_pro_*`, Rate Limit 30 req/min
- CORS-Whitelist-Anforderung (Wildcard verboten — `bazodiac.space` muss in `CORS_ALLOWED_ORIGINS` stehen)
- Gewählter Upstream-Endpoint für Waitinglist-`/api/public/fusion-chart`: `POST /v1/fusion`
- Bekannte Lücke: Response-Shape von `/v1/fusion` aus der gelieferten Doku nicht vollständig rekonstruierbar — Verifikation gegen `WuXing`-DTO ist Phase-3-Aufgabe (siehe `TASK-configure-fufire-live`).
- Offene Frage: Zwei Production-URLs (Fly.io für Web/Mobile, Railway für Signatur-App). Nicht in dieser Phase aufgelöst.

**Trigger conditions:**

- **Code-Phase:** Wenn `FUFIRE_BASE_URL` / `FUFIRE_API_KEY` gesetzt oder `mapFufireResponse` modifiziert wird.
- **Deploy-Phase:** Wenn Production-Env-Vars konfiguriert werden.
- **Spec-Phase:** Wenn `CON-fufire-chart-endpoint` zur Re-Approval kommt.

### 2. `1-spec/constraints/CON-fufire-chart-endpoint.md`

- Endpoint-Spezifikation: `/chart` → `/v1/fusion`.
- Status: Approved → **Draft** (Status-Downgrade-Regel: substanzielle Inhaltsänderung an einem Approved-Artefakt).
- Re-Approval erforderlich, bevor Phase-3-Code-Arbeit den Constraint als Source heranzieht.

### 3. `1-spec/assumptions/ASM-fufire-api-available.md`

- Status: Unverified → **Verified**.
- Verification-Evidence: API-Doku im Repo (siehe `2-design/external-context/bafe-api-reference.md`) + Live-`/health`-Endpoint erreichbar.
- Resolved-by: `DEC-fufire-baseline`.

### 4. `2-design/external-context/bafe-api-reference.md` (neu)

- Mitgelieferte API-Dokumentation 1:1 ablegen.
- Header: Quelle ("Cowork-Analyse, automatisch generiert aus Codebase"), Stand-Datum (2026-05-08), Hinweis "Snapshot — kann veralten; bei Konflikt mit Live-`/health` ist die Live-Engine Wahrheit".
- Zweck: zukünftige Agenten finden den Upstream-Stand, ohne ihn neu zu entdecken.

### 5. Phase-Decision-Indexe

In folgenden Files Zeile für `DEC-fufire-baseline` ergänzen:

- `1-spec/CLAUDE.spec.md`
- `2-design/CLAUDE.design.md`
- `4-deploy/CLAUDE.deploy.md`
- `3-code/adapter/CLAUDE.component.md`

### 6. `3-code/tasks.md`

- `TASK-decide-fufire-deployment` → **Done** (Datum 2026-05-08).
- `TASK-decide-interpretation-vendor` → Briefing umschreiben: "Erst prüfen, ob `/v1/experience/daily` die Interpretation nativ liefert (`summary`, `themes`, `caution`, `opportunity`); falls ja, Empfehlung `DEC-no-separate-interpretation-vendor`."
- `TASK-decide-geocoding-vendor` → Briefing umschreiben: "BAFE nimmt `lat`/`lon` direkt im `birth.lat`/`birth.lon`-Feld; Geocoding wird nur noch für Place-Label-Eingabe-Auflösung im Frontend benötigt — Vendor möglicherweise überflüssig, vor Auswahl prüfen."
- `TASK-update-assumption-statuses` bleibt Todo (nur 1 von 4 ASMs in dieser Runde aktualisiert).

### 7. `CLAUDE.md` Current State

- Phase-2-Eintrag in der Implementation-progress-Liste mit Datum 2026-05-08 und Alignment-Zusammenfassung.
- Decisions-Zähler 4 Active → 5 Active (1 Deprecated bleibt).
- Constraint-Status: 7 Active → 6 Active + 1 Draft (`CON-fufire-chart-endpoint`).
- Assumption-Status: 5 Unverified → 4 Unverified + 1 Verified.

---

## Scope (out — bewusst verschoben)

| Was | Warum nicht jetzt | Wohin |
|---|---|---|
| Code-Rewrite `src/providers/fufireProvider.mjs` + `mapFufireResponse` an `/v1/fusion`-Response-Shape | Verifikation des Response-Shape gegen Live-Engine ist eigene Arbeit | Phase 3, `TASK-configure-fufire-live` |
| Waitinglist-Vertrag um `experience-bootstrap`/`-daily`/`-signature-delta` erweitern | Scope-Sprung von Preview auf Produkt | Eigene Phase, frühestens nach Live-Cutover |
| Vendor-Entscheidungen geocoding/interpretation/newsletter | Briefings müssen aktualisiert werden, bevor Recherche sinnvoll ist | Phase 2, Folge-Tasks (mit neuen Briefings, siehe Punkt 6 oben) |
| Auflösung der zwei Production-URLs (Fly.io vs Railway) | Klärung mit `STK-upstream-provider-maintainers` nötig | Vermerk im DEC + bafe-api-reference; Aktion in einer Folge-Session |

---

## Architektur / Komponenten

Reine Markdown-Arbeit, kein Quellcode wird berührt. Touch-Set: ~9 Dateien.

| Datei | Änderungstyp |
|---|---|
| `decisions/DEC-fufire-baseline.md` | neu |
| `decisions/DEC-fufire-baseline.history.md` | neu |
| `1-spec/constraints/CON-fufire-chart-endpoint.md` | modifiziert + Status-Downgrade |
| `1-spec/assumptions/ASM-fufire-api-available.md` | modifiziert (Status + Resolved-by) |
| `2-design/external-context/bafe-api-reference.md` | neu |
| `1-spec/CLAUDE.spec.md` | Index-Zeile ergänzt |
| `2-design/CLAUDE.design.md` | Index-Zeile ergänzt |
| `4-deploy/CLAUDE.deploy.md` | Index-Zeile ergänzt |
| `3-code/adapter/CLAUDE.component.md` | Index-Zeile ergänzt |
| `3-code/tasks.md` | 1 Task Done + 2 Briefings umgeschrieben |
| `CLAUDE.md` | Current State aktualisiert |

---

## Trade-offs / Risiken

- **Status-Downgrade von `CON-fufire-chart-endpoint`** erzeugt einen nicht-Approved Constraint mit Wirkung auf `GOAL-real-provider-integration`, `REQ-F-fufire-chart-mapping`, `REQ-F-fusion-chart-endpoint`. Mitigation: User-Re-Approval in Folge-Session, sobald der neue Constraint-Text geprüft ist.
- **`/v1/fusion` ist Annahme**: Response-Shape aus mitgelieferter Doku nicht vollständig rekonstruierbar. Mitigation: bekannte Lücke im DEC dokumentieren; Verifikation Phase 3.
- **`/v1/experience/bootstrap` als Alternative**: liefert reicheren Output (Soulprint, Signatur-Blueprint), kostet mehr Adapter-Komplexität. Default bleibt `/v1/fusion`; `/v1/experience/bootstrap` als Upgrade-Pfad im DEC dokumentieren.

---

## Testing

Keine Code-Tests — Konsistenz wird verifiziert durch:

- `npm test` muss 40/40 grün bleiben (kein Code geändert).
- `grep -r "/chart" 1-spec/constraints/` darf nur historische Erwähnungen zeigen, nicht den aktiven Endpoint-Text.
- Index-Konsistenz: Anzahl Active-DECs in `CLAUDE.md` muss mit Index-Einträgen in den Phase-Files übereinstimmen.

---

## Erwartetes Resultat

2 Commits:

1. **Reference-Doku-Aufnahme** — fügt `2-design/external-context/bafe-api-reference.md` hinzu (separater Commit, weil "Aufnahme einer externen Quelle" eine eigenständige Aktion ist und der spätere DEC darauf verweisen kann).
2. **DEC + Constraint + ASM + Indexe + tasks.md + CLAUDE.md** — die eigentliche Alignment-Arbeit, in einem zusammenhängenden Commit.

Nach diesen 2 Commits ist Phase 2 Schritt 1 von 3 abgeschlossen (FuFirE alignt). Die offenen Schritte 2 und 3 (Geocoding-Re-Briefing, Interpretation-Re-Briefing) folgen mit aktualisierten Tasks in einer separaten Session.
