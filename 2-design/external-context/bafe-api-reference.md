---
title: BAFE / FuFirE API Reference (Snapshot)
source: Cowork-Analyse, automatisch generiert aus Codebase
upstream: BAFE — Bazodiac Astro Fusion Engine (https://bafe-2u0e2a.fly.dev)
captured: 2026-05-08
status: snapshot — kann veralten
---

> **Authoritative source:** the live `/health` endpoint of the BAFE engine.
> If this snapshot conflicts with what the engine returns, the engine wins.
> Re-capture this file by re-running the upstream Cowork-Analyse and overwriting in place.

# API-Endpunkt-Dokumentation — Bazodiac Dashboard, Tagespuls & Signatur

**Stand:** 2026-05-08 | **Autor:** Cowork-Analyse (automatisch generiert aus Codebase)

---

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│  Bazodiac Web App (Next.js)                                     │
│  bazodiac.space  ←→  Astro-Noctum / QuizzMe-main               │
├─────────────────────────────────────────────────────────────────┤
│  Bazodiac Mobile App (React Native / Expo)                      │
│  Astro-IOs  ←→  bazodiac.space (API-Proxy)                     │
├─────────────────────────────────────────────────────────────────┤
│  FuFirE – Fusion Firmament Engine (FastAPI / Python)            │
│  https://bafe-2u0e2a.fly.dev  (Production: Fly.io)              │
│  Fallback: https://bafe-production.up.railway.app               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (Postgres + Realtime)                                 │
│  Tabellen: astro_profiles, profiles, birth_data, natal_charts   │
└─────────────────────────────────────────────────────────────────┘
```

**Base URL (FuFirE):** `https://bafe-2u0e2a.fly.dev`
**Base URL (Next.js API):** `https://bazodiac.space/api`
**Base URL (Mobile):** `EXPO_PUBLIC_API_BASE_URL` → Default: `https://bazodiac.space`

---

## 1. FuFirE Engine — Vollständige Endpunkt-Liste

### Authentication
Alle `/v1/*` Business-Endpunkte erfordern:
```
X-API-Key: ff_pro_<secret>
```
| Prefix | Tier | Req/Tag | Req/Min |
|---|---|---|---|
| `ff_free_` | free | 100 | 5 |
| `ff_starter_` | starter | 1.000 | 20 |
| `ff_pro_` | pro | 10.000 | 100 |
| `ff_enterprise_` | enterprise | unlimited | unlimited |

---

### 1.1 Info / Health (Kein API-Key erforderlich)

| Method | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/health` | Liveness-Check, Ephemeris-Status |
| `GET` | `/ready` | Readiness für Load-Balancer |
| `GET` | `/build` | Build-Metadaten (Version, Deploy-ID) |
| `GET` | `/` | Root: Service-Name + Version |
| `GET` | `/api` | Legacy-Endpunkt (Datum/Zeit-Parameter) |
| `GET` | `/info/wuxing-mapping` | Wu-Xing Planeten-Mapping |

**Auch unter `/v1/` verfügbar** (identisch, CORS-geprüft für bazodiac.space).

---

### 1.2 BaZi (Vier Säulen)

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/bazi` | BaZi-Berechnung (Geburtsdaten → 4 Säulen) |
| `POST` | `/v1/bazi` | Identisch, versioniert |

**Request-Body (beide Varianten):**
```json
{
  "birth_local": "1990-07-04T12:00:00",
  "timezone": "Europe/Berlin",
  "longitude_deg": 13.405,
  "latitude_deg": 52.52
}
```

**Response (Beispiel):**
```json
{
  "pillars": {
    "year":  { "stamm": "Geng", "zweig": "Wu",  "tier": "Pferd", "element": "Metall" },
    "month": { "stamm": "Ren",  "zweig": "Wu",  "tier": "Pferd", "element": "Wasser" },
    "day":   { "stamm": "Geng", "zweig": "Wu",  "tier": "Pferd", "element": "Metall" },
    "hour":  { "stamm": "Ren",  "zweig": "Wu",  "tier": "Pferd", "element": "Wasser" }
  },
  "dates": {
    "birth_local": "1990-07-04T12:00:00+02:00",
    "birth_utc":   "1990-07-04T10:00:00+00:00",
    "lichun_local": "1990-02-04T03:14:00+01:00"
  },
  "precision": { "birth_time_known": true, "provisional_fields": [] }
}
```

---

### 1.3 Western Astrology

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/western` | Westliches Horoskop (Planeten, Häuser, Aspekte) |
| `POST` | `/v1/western` | Identisch, versioniert |

---

### 1.4 Fusion / Wu-Xing

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/fusion` | Wu-Xing Fusion-Analyse (BaZi + Western kombiniert) |
| `POST` | `/v1/fusion` | Identisch, versioniert |

---

### 1.5 Transit

| Method | Pfad | Beschreibung |
|---|---|---|
| `GET`  | `/transit/now` | Aktuelle Planetenpositionen (Swiss Ephemeris) |
| `GET`  | `/v1/transit/now` | Identisch, versioniert |
| `GET`  | `/transit/timeline` | Mehrtägige Transit-Prognose (1–30 Tage) |
| `GET`  | `/v1/transit/timeline` | Identisch, versioniert |
| `POST` | `/transit/state` | Personalisierter Transit-Zustand |
| `POST` | `/v1/transit/state` | Identisch, versioniert |
| `POST` | `/transit/narrative` | Text-Narration aus Transit-Zustand |
| `POST` | `/v1/transit/narrative` | Identisch, versioniert |

**GET `/transit/now` Query-Parameter:**
```
?datetime=2026-05-08T12:00:00Z   # Optional, default: jetzt
```

**GET `/transit/timeline` Query-Parameter:**
```
?days=7   # 1–30, default: 7
```

**POST `/transit/state` Request-Body:**
```json
{
  "soulprint_sectors": [0.1, 0.2, ...],   // 12 Werte [0..1]
  "quiz_sectors":      [0.1, 0.2, ...]    // 12 Werte [0..1]
}
```

---

### 1.6 Experience (Tageshoroskop / Daily Pulse — KERNENDPUNKT)

Dies sind die zentralen Endpunkte für Dashboard, Tagespuls und Signatur.

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/experience/bootstrap` | Vollständiges Profil-Bootstrap aus Geburtsdaten |
| `POST` | `/v1/experience/bootstrap` | Identisch, versioniert |
| `POST` | `/experience/signature-delta` | Signatur-Update nach Quiz-Antwort |
| `POST` | `/v1/experience/signature-delta` | Identisch, versioniert |
| `POST` | `/experience/daily` | **Tageshoroskop** (Western + Eastern + Fusion) |
| `POST` | `/v1/experience/daily` | Identisch, versioniert |

#### POST `/experience/bootstrap`
Berechnet das vollständige Astroprofil aus Geburtsdaten inkl. Soulprint-Sektoren und Signatur-Blueprint.

**Rate Limit:** 30/Minute

**Request-Body:**
```json
{
  "birth": {
    "date": "1990-07-04",
    "time": "12:00:00",
    "tz": "Europe/Berlin",
    "lat": 52.52,
    "lon": 13.405,
    "place_label": "Berlin, Germany"
  },
  "locale": "de-DE"
}
```

**Response:**
```json
{
  "profile": {
    "sun_sign": "Krebs",
    "moon_sign": "Stier",
    "ascendant_sign": "Waage",
    "day_master": "Geng",
    "harmony_index": 0.7342
  },
  "soulprint_sectors": [0.12, 0.08, 0.05, ...],   // 12 Werte
  "signature_blueprint": {
    "seed": "abc123...",
    "visual": {
      "symmetry": 0.6,
      "curvature": 0.4,
      "angularity": 0.3,
      "density": 0.5,
      "contrast": 0.7,
      "orbit_count": 3
    },
    "elements": {
      "Holz": 0.18, "Feuer": 0.24, "Erde": 0.20, "Metall": 0.22, "Wasser": 0.16
    }
  },
  "meta": { "engine_version": "x.y.z", "generated_at": "2026-05-08T12:00:00Z" }
}
```

---

#### POST `/experience/daily` — TAGESHOROSKOP / TAGESPULS

**Der zentrale Endpunkt für das Dashboard-Tageshoroskop.**

**Rate Limit:** 30/Minute

**Request-Body:**
```json
{
  "birth": {
    "date": "1990-07-04",
    "time": "12:00:00",
    "tz": "Europe/Berlin",
    "lat": 52.52,
    "lon": 13.405,
    "place_label": "Berlin"
  },
  "soulprint_sectors": [0.12, 0.08, 0.05, ...],   // 12 Werte aus /bootstrap
  "quiz_sectors":      [0.10, 0.09, 0.06, ...],   // 12 Werte aus Quiz
  "target_date": "2026-05-08",
  "locale": "de-DE",
  "include": ["impact"]   // Optional: erweiterte Impact-Analyse einschließen
}
```

**Response:**
```json
{
  "date": "2026-05-08",
  "western": {
    "summary": "...",
    "themes": ["Kommunikation", "Transformation"],
    "caution": "...",
    "opportunity": "...",
    "evidence": {
      "transit_sectors": [0, 3, 7],
      "natal_focus": ["Sun", "Mercury"],
      "weekday": "Freitag"
    },
    "weekday_note": "..."
  },
  "eastern": {
    "summary": "...",
    "themes": ["Wasser", "Metall"],
    "caution": "...",
    "opportunity": "...",
    "evidence": {
      "day_master": "Geng",
      "daily_pillar": { "stem": "Geng", "branch": "Wu" },
      "relation_to_day_master": "Selbst-Element",
      "jieqi": null,
      "weekday": "Freitag"
    },
    "jieqi_note": null,
    "weekday_note": "..."
  },
  "fusion": {
    "summary": "...",
    "synthesis": "...",
    "action": "...",
    "pushworthy": true,
    "push_text": "Heute Nachmittag: Gelegenheit für Entscheidungen nutzen",
    "jieqi_note": null,
    "weekday_note": "..."
  },
  "meta": { "engine_version": "x.y.z", "generated_at": "2026-05-08T12:00:00Z" },
  "impact": { ... }   // Nur wenn include=["impact"] gesetzt
}
```

**Impact-Block (wenn `include=["impact"]`):**
Enthält `harmony_index`, `day_mode`, `intensity`, `active_planets`, `space_weather`, `resonance_badges`, `top_sector`, `day_master`.

---

#### POST `/experience/signature-delta`
Inkrementelles Signatur-Update nach Quiz-Antwort (kein vollständiger Neuberechnungs-Aufruf nötig).

**Rate Limit:** 60/Minute

**Request-Body:**
```json
{
  "soulprint_sectors": [0.12, 0.08, ...],    // 12 Werte
  "signature_blueprint": { "seed": "...", "visual": {...}, "elements": {...} },
  "quiz_answer": { "keyword": "Kreativität" }
}
```

---

### 1.7 Impact / Space Weather

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/impact/...` | Impact-Berechnung (aktive Planeten, Resonanz) |
| `POST` | `/v1/impact/...` | Identisch, versioniert |

Space Weather wird intern in `/experience/daily` mit `include=["impact"]` aufgerufen (kein direkter App-Call nötig).

---

### 1.8 Validation

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/validate` | Contract-Validierung gegen JSON-Schema |
| `POST` | `/v1/validate` | Identisch, versioniert |

---

### 1.9 Superglue (API-Proxy-Layer)

| Method | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/api/calculate/{endpoint}` | Proxy für bazi, western, wuxing, fusion, tst |
| `POST` | `/v1/calculate/{endpoint}` | Identisch, versioniert |

Erlaubte `{endpoint}`-Werte: `bazi`, `western`, `wuxing`, `fusion`, `tst`

---

## 2. Next.js API Routes (bazodiac.space)

### 2.1 Mobile App API

**Base URL für Mobile:** `https://bazodiac.space`

| Method | Pfad | Beschreibung | Datei |
|---|---|---|---|
| `GET`  | `/api/mobile/bootstrap` | Bootstrap für Mobile (Schema-validiert) | `lib/api.ts: fetchMobileBootstrap()` |
| `GET`  | `/api/space-weather` | Kp-Index (5-min Cache) | `hooks/useSpaceWeather.ts` |
| `POST` | `/api/share` | Share-Link für Profil generieren | `screens/DashboardScreen.tsx` |

**Headers für alle Mobile-Requests:**
```
X-App-Platform: ios | android
X-App-Version: <semver>
X-Device-Id: <uuid>
Authorization: Bearer <supabase-session-token>   // nur bei authedFetch
```

---

### 2.2 Web App API Routes (QuizzMe / Astro-Noctum)

| Method | Pfad | Beschreibung | Handler |
|---|---|---|---|
| `POST` | `/api/astro-compute` | Astro-Berechnung aus Supabase-Profil, cached | `astroComputeHandler.ts` |
| `POST` | `/api/astro/compute` | Identisch (alternative Route) | `astroComputeHandler.ts` |
| `POST` | `/api/contribute` | Quiz-Beitrag ingesten, Profil updaten | `contribute/route.ts` |
| `GET`  | `/api/profile/snapshot` | Profil-Snapshot laden | `profile/snapshot/route.ts` |
| `GET`  | `/api/profile/snapshot?userId=<id>` | Snapshot für User-ID | `profile/snapshot/route.ts` |

---

### 2.3 Signatur Proxy (Signatur-App)

**Datei:** `Signatur/fusion_ring_website/nextjs_space/app/api/calculate/[endpoint]/route.ts`

| Method | Pfad | Upstream-URL |
|---|---|---|
| `POST` | `/api/calculate/bazi` | `{BAFE_BASE_URL}/calculate/bazi` |
| `POST` | `/api/calculate/western` | `{BAFE_BASE_URL}/calculate/western` |
| `POST` | `/api/calculate/wuxing` | `{BAFE_BASE_URL}/calculate/wuxing` |
| `POST` | `/api/calculate/fusion` | `{BAFE_BASE_URL}/calculate/fusion` |
| `POST` | `/api/calculate/tst` | `{BAFE_BASE_URL}/calculate/tst` |

**BAFE_BASE_URL:** `BAFE_BASE_URL` env var → Default: `https://bafe-production.up.railway.app`

> ⚠️ **Wichtig:** Die Signatur-App zeigt noch auf Railway (`bafe-production.up.railway.app`), die Haupt-App auf Fly.io (`bafe-2u0e2a.fly.dev`). Hier gibt es zwei verschiedene Production-URLs!

---

## 3. Supabase Direkt-Queries (kein HTTP, Realtime-Client)

| Tabelle | Zugriff | Beschreibung |
|---|---|---|
| `astro_profiles` | SELECT, INSERT | Astro-Berechnungsergebnisse + Interpretation |
| `profiles` | SELECT | User-Tier (free/premium) |
| `birth_data` | INSERT | Geburtsdaten persistieren |
| `natal_charts` | INSERT | Natal-Chart persistieren |

**Supabase Realtime-Subscription (Mobile):**
```typescript
supabase.channel(`mobile-profile-${userId}`)
  .on("postgres_changes", { event: "*", table: "profiles", filter: `id=eq.${userId}` }, ...)
  .subscribe()
```
→ Löst automatisch Profil-Refresh aus.

---

## 4. Tageshoroskop — Vollständiger Datenfluss

```
User öffnet Dashboard
        │
        ▼
[Mobile] useBootstrap → GET /api/mobile/bootstrap
        │
        ▼
[Web] useAstroCompute → POST /api/astro-compute
        │  (liest astro_profiles aus Supabase)
        ▼
App hat: soulprint_sectors, quiz_sectors aus Profil
        │
        ▼
POST /experience/daily (FuFirE)
        │
        ├─ generate_western_daily()  → Planeten vs. Natal-Sonne
        ├─ generate_eastern_daily()  → BaZi Day-Pillar, Jieqi
        ├─ generate_fusion_daily()   → Western + Eastern kombiniert
        └─ _compute_impact_for_daily() (optional, wenn include=["impact"])
              │
              ├─ find_active_planets()
              ├─ fetch_space_weather() → Kp-Index
              └─ compute_harmony_index()
        │
        ▼
Response: { western, eastern, fusion, meta, impact? }
        │
        ▼
Dashboard rendert:
  - Aphorismus (aus fusion.summary)
  - Tagespuls-Karte (fusion.action, fusion.pushworthy)
  - Energie-Layer (western.themes + eastern.themes)
  - Mondphase (transit/now oder intern berechnet)
  - Signatur (via /experience/signature-delta nach Quiz)
```

---

## 5. Tageshoroskop-Seite (Web, `/verticals/horoscope/daily`)

Diese Seite arbeitet **rein client-seitig**, ohne direkte FuFirE-Calls:

1. `getSnapshotClient()` → `GET /api/profile/snapshot` (Next.js)
2. `calculateDailyTransits(natalChart, new Date())` → **lokale Berechnung** in `lib/astro/compute.ts`
3. `calculateEnergyPeaks(transits)` → lokal
4. `getDayQuality(transits)` → lokal
5. `getInterpretation(transitKey)` → lokal aus Interpretations-Lookup

> ⚠️ **Architekturentscheidung:** Die `/verticals/horoscope/daily`-Seite verwendet eine **vereinfachte Client-seitige Berechnung** (nur Sun-Sign-basierte Transits, kein Swiss Ephemeris). Das ist die _Freemium-Schicht_. Die präzise Berechnung erfolgt ausschließlich über FuFirE `/experience/daily`.

---

## 6. Design-Entscheidungen (aus Code extrahiert)

### Dashboard (Mobile — DashboardScreen.tsx)
- **Cosmic Profile Card:** Sun/Moon/Asc aus `profile.sun_sign`, `moon_sign`, `asc_sign`
- **Space Weather Card:** Kp-Index aus `/api/space-weather`, Polling alle 5 Minuten
- **Interpretation Card:** `profile.astro_json.interpretation` (gespeicherter Text aus Onboarding)
- **Tier-Gate:** Premium-Button → `beginCheckout(bootstrap)` → Stripe via `/api/...`
- **Share:** `POST /api/share { source: "mobile" }` → gibt `shareUrl` zurück

### Signatur-Berechnung
- Signatur wird **beim Bootstrap** aus Soulprint + Wu-Xing-Vektor + Harmony-Index berechnet
- **Quiz-Updates** sind inkrementell: Nur Delta wird via `/experience/signature-delta` berechnet
- Blend-Formel: `blended[i] = soulprint[i] * 0.7 + quiz[i] * 0.3`
- **Normalisierung:** Sektoren werden auf Summe=1 normiert

### CORS-Whitelist (FuFirE)
```
https://bazodiac.space
https://www.bazodiac.space
http://localhost:5173
http://localhost:3000
```
Konfigurierbar via `CORS_ALLOWED_ORIGINS` env var. Wildcard (`*`) ist explizit verboten.

### Rate Limits
- `/experience/bootstrap`: 30/Min
- `/experience/daily`: 30/Min
- `/experience/signature-delta`: 60/Min
- `/transit/now`: 60/Min (Standard)

---

## 7. Standard-Response-Headers (alle FuFirE-Endpunkte)

```
X-Request-ID: <uuid>          # Correlation-ID (wird vom Client echoed)
X-API-Version: <version>      # Engine-Version
X-Response-Time-ms: <ms>      # Server-Prozessierungszeit
X-RateLimit-Limit: <n>        # Requests/Min für Key-Tier
X-RateLimit-Remaining: <n>    # Verbleibende Requests
```

---

## 8. Offene Fragen / Identified Gaps

1. **Zwei Production-URLs:** Signatur-App zeigt auf Railway (`bafe-production.up.railway.app`), Mobile/Web auf Fly.io (`bafe-2u0e2a.fly.dev`). Ist das gewollt?
2. **`/api/mobile/bootstrap`:** Diese Next.js-Route ist im Code als Ziel referenziert, aber keine `route.ts`-Datei dafür gefunden. Muss verifiziert werden.
3. **Tageshoroskop-Dualität:** `/verticals/horoscope/daily` (client-seitig, simplified) vs. `/experience/daily` (FuFirE, präzise). Für den produktiven Tagespuls ist FuFirE der Canonical Path.
4. **`/api/calculate/{endpoint}` vs. `/experience/*`:** Die Signatur-App nutzt den älteren Superglue-Proxy. Sollte auf `/experience/bootstrap` + `/experience/daily` migriert werden.
