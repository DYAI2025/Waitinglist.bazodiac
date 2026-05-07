// FuFirE provider — translates the public Bazodiac contract to/from the
// internal Fusion Firmament Engine schema. The mapping is the contract
// surface between this repository and the upstream engine; changes here
// must be reflected in BAZODIAC_BACKEND_ITERATION_2_REPORT.md.
import { fufireUnavailable, configurationError } from '../errors.mjs';

const ZODIAC_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const ZODIAC_DE = [
  'Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
  'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische',
];

const ELEMENT_DE_TO_EN = Object.freeze({
  Holz: 'Wood', Feuer: 'Fire', Erde: 'Earth', Metall: 'Metal', Wasser: 'Water',
  // accept already-English values too:
  Wood: 'Wood', Fire: 'Fire', Earth: 'Earth', Metal: 'Metal', Water: 'Water',
});

export function buildLocalDatetime(birthDate, birthTime) {
  // birthTime: null → noon fallback; emit a marker so callers know it's provisional.
  if (birthTime === null || birthTime === undefined) {
    return { local_datetime: `${birthDate}T12:00:00`, provisional: true };
  }
  const [h, m] = String(birthTime).split(':');
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return { local_datetime: `${birthDate}T${hh}:${mm}:00`, provisional: false };
}

export function ascendantSignFromDegrees(degree, language = 'en') {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return null;
  const normalized = ((degree % 360) + 360) % 360;
  const idx = Math.floor(normalized / 30) % 12;
  return language === 'de' ? ZODIAC_DE[idx] : ZODIAC_EN[idx];
}

function normalizeElement(value) {
  if (typeof value !== 'string' || !value) return null;
  return ELEMENT_DE_TO_EN[value] || value;
}

export function buildFufireRequest(input) {
  const { local_datetime, provisional } = buildLocalDatetime(input.birthDate, input.birthTime);
  return {
    payload: {
      local_datetime,
      tz_id: input.timezone ?? input.tz_id ?? null,
      geo_lon_deg: input.geo_lon_deg ?? null,
      geo_lat_deg: input.geo_lat_deg ?? null,
      dst_policy: 'error',
      bodies: null,
      include_validation: false,
      time_standard: 'CIVIL',
      day_boundary: 'midnight',
    },
    provisional,
  };
}

export function mapFufireResponse(raw, { language = 'en', provisional = false } = {}) {
  if (!raw || typeof raw !== 'object') {
    throw fufireUnavailable('FuFirE returned an empty response.');
  }
  const positions = raw.positions || {};
  const bazi = raw.bazi || {};
  const wuxing = raw.wuxing || {};
  const fromPlanets = wuxing.from_planets || {};
  const angles = raw.angles || {};

  const sunSign = positions.Sun?.sign || positions.sun?.sign || null;
  const moonSign = positions.Moon?.sign || positions.moon?.sign || null;

  let ascendant = null;
  if (!provisional) {
    const ascDegree = angles.Ascendant?.degree ?? angles.Ascendant ?? null;
    ascendant = ascendantSignFromDegrees(ascDegree, language) || angles.Ascendant?.sign || null;
  }

  const baziYearAnimal = bazi.pillars?.year?.animal || null;
  const baziDaymaster = bazi.day_master || bazi.daymaster || null;
  const dominantElement = normalizeElement(wuxing.dominant_planet ?? wuxing.dominant_bazi ?? wuxing.dominant ?? null);
  const coherenceIndex = typeof wuxing.harmony_index === 'number' ? wuxing.harmony_index : null;

  return {
    sunSign,
    moonSign,
    ascendant,
    baziYearAnimal,
    baziDaymaster,
    dominantElement,
    coherenceIndex,
    wuXing: {
      wood: numericOrZero(fromPlanets.Holz ?? fromPlanets.Wood),
      fire: numericOrZero(fromPlanets.Feuer ?? fromPlanets.Fire),
      earth: numericOrZero(fromPlanets.Erde ?? fromPlanets.Earth),
      metal: numericOrZero(fromPlanets.Metall ?? fromPlanets.Metal),
      water: numericOrZero(fromPlanets.Wasser ?? fromPlanets.Water),
    },
    cosmicSignature: raw.cosmic_signature || raw.cosmicSignature || null,
    computedAt: raw.computed_at || raw.computedAt || new Date().toISOString(),
  };
}

function numericOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function callFufire(input, { config, fetchImpl = fetch } = {}) {
  if (!config?.fufire?.baseUrl) throw configurationError('FUFIRE_BASE_URL is not set.');
  if (!config?.fufire?.apiKey) throw configurationError('FUFIRE_API_KEY is not set.');

  const { payload, provisional } = buildFufireRequest(input);
  const url = `${config.fufire.baseUrl.replace(/\/$/, '')}/chart`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.fufire.timeoutMs);

  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'X-API-Key': config.fufire.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    throw fufireUnavailable(`FuFirE request failed: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw fufireUnavailable(`FuFirE returned HTTP ${response.status}.`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw fufireUnavailable('FuFirE returned a non-JSON response.');
  }
  return mapFufireResponse(body, { language: input.language, provisional });
}
