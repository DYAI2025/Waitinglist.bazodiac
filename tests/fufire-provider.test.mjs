import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocalDatetime,
  ascendantSignFromDegrees,
  buildFufireRequest,
  mapFufireResponse,
  callFufire,
} from '../src/providers/fufireProvider.mjs';
import { loadConfig } from '../src/config.mjs';
import { ERROR_CODES } from '../src/errors.mjs';

test('buildLocalDatetime: HH:MM time produces ISO local datetime, not provisional', () => {
  const r = buildLocalDatetime('1990-04-12', '08:30');
  assert.equal(r.local_datetime, '1990-04-12T08:30:00');
  assert.equal(r.provisional, false);
});

test('buildLocalDatetime: null birthTime falls back to noon and is provisional', () => {
  const r = buildLocalDatetime('1990-04-12', null);
  assert.equal(r.local_datetime, '1990-04-12T12:00:00');
  assert.equal(r.provisional, true);
});

test('ascendantSignFromDegrees maps degrees to the right tropical sign in EN and DE', () => {
  assert.equal(ascendantSignFromDegrees(0, 'en'), 'Aries');
  assert.equal(ascendantSignFromDegrees(45, 'en'), 'Taurus');
  assert.equal(ascendantSignFromDegrees(95, 'en'), 'Cancer');
  assert.equal(ascendantSignFromDegrees(95, 'de'), 'Krebs');
  assert.equal(ascendantSignFromDegrees(359.99, 'en'), 'Pisces');
  assert.equal(ascendantSignFromDegrees(-10, 'en'), 'Pisces'); // wraps
  assert.equal(ascendantSignFromDegrees(null, 'en'), null);
});

test('buildFufireRequest sets the FuFirE-fixed payload constants', () => {
  const { payload } = buildFufireRequest({
    birthDate: '1990-04-12',
    birthTime: '08:30',
    timezone: 'Europe/Berlin',
    geo_lon_deg: 13.4,
    geo_lat_deg: 52.5,
  });
  assert.equal(payload.local_datetime, '1990-04-12T08:30:00');
  assert.equal(payload.tz_id, 'Europe/Berlin');
  assert.equal(payload.geo_lon_deg, 13.4);
  assert.equal(payload.geo_lat_deg, 52.5);
  assert.equal(payload.dst_policy, 'error');
  assert.equal(payload.bodies, null);
  assert.equal(payload.include_validation, false);
  assert.equal(payload.time_standard, 'CIVIL');
  assert.equal(payload.day_boundary, 'midnight');
});

test('mapFufireResponse maps Sun/Moon/Ascendant + BaZi + WuXing (German keys)', () => {
  const raw = {
    positions: { Sun: { sign: 'Aries' }, Moon: { sign: 'Scorpio' } },
    angles: { Ascendant: { degree: 95 } },
    bazi: { pillars: { year: { animal: 'Horse' } }, day_master: 'Geng' },
    wuxing: {
      dominant_planet: 'Feuer',
      harmony_index: 0.82,
      from_planets: { Holz: 0.08, Feuer: 0.42, Erde: 0.18, Metall: 0.12, Wasser: 0.20 },
    },
    cosmic_signature: 'FU-2719-AE',
    computed_at: '2026-05-06T12:00:00Z',
  };
  const out = mapFufireResponse(raw, { language: 'en', provisional: false });
  assert.equal(out.sunSign, 'Aries');
  assert.equal(out.moonSign, 'Scorpio');
  assert.equal(out.ascendant, 'Cancer'); // 95° → Cancer
  assert.equal(out.baziYearAnimal, 'Horse');
  assert.equal(out.baziDaymaster, 'Geng');
  assert.equal(out.dominantElement, 'Fire'); // Feuer → Fire
  assert.equal(out.coherenceIndex, 0.82);
  assert.deepEqual(out.wuXing, { wood: 0.08, fire: 0.42, earth: 0.18, metal: 0.12, water: 0.20 });
  assert.equal(out.cosmicSignature, 'FU-2719-AE');
});

test('mapFufireResponse with provisional=true blanks the ascendant', () => {
  const out = mapFufireResponse(
    {
      positions: { Sun: { sign: 'Aries' }, Moon: { sign: 'Scorpio' } },
      angles: { Ascendant: { degree: 95 } },
      bazi: { pillars: { year: { animal: 'Horse' } }, day_master: 'Geng' },
      wuxing: { dominant_planet: 'Feuer', harmony_index: 0.82, from_planets: {} },
    },
    { language: 'en', provisional: true },
  );
  assert.equal(out.ascendant, null);
});

test('callFufire calls POST {baseUrl}/chart with X-API-Key and JSON content-type', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          positions: { Sun: { sign: 'Aries' }, Moon: { sign: 'Scorpio' } },
          angles: { Ascendant: { degree: 0 } },
          bazi: { pillars: { year: { animal: 'Horse' } }, day_master: 'Geng' },
          wuxing: {
            dominant_planet: 'Fire',
            harmony_index: 0.5,
            from_planets: { Wood: 0.2, Fire: 0.2, Earth: 0.2, Metal: 0.2, Water: 0.2 },
          },
          cosmic_signature: 'FU-TEST',
          computed_at: '2026-01-01T00:00:00Z',
        };
      },
    };
  };
  const config = loadConfig({
    PUBLIC_API_STUB_MODE: 'false',
    FUFIRE_BASE_URL: 'https://example.test/',
    FUFIRE_API_KEY: 'secret-key',
  });
  const out = await callFufire(
    {
      birthDate: '1990-04-12',
      birthTime: '08:30',
      timezone: 'Europe/Berlin',
      geo_lon_deg: 13.4,
      geo_lat_deg: 52.5,
      language: 'en',
    },
    { config, fetchImpl: fakeFetch },
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://example.test/chart');
  assert.equal(calls[0].init.headers['X-API-Key'], 'secret-key');
  assert.equal(calls[0].init.headers['content-type'], 'application/json');
  const sentBody = JSON.parse(calls[0].init.body);
  assert.equal(sentBody.local_datetime, '1990-04-12T08:30:00');
  assert.equal(sentBody.tz_id, 'Europe/Berlin');
  assert.equal(out.sunSign, 'Aries');
  assert.equal(out.dominantElement, 'Fire');
});

test('callFufire surfaces FUFIRE_UNAVAILABLE on non-ok HTTP response', async () => {
  const fakeFetch = async () => ({ ok: false, status: 503, async json() { return {}; } });
  const config = loadConfig({
    PUBLIC_API_STUB_MODE: 'false',
    FUFIRE_BASE_URL: 'https://example.test',
    FUFIRE_API_KEY: 'k',
  });
  await assert.rejects(
    () =>
      callFufire(
        {
          birthDate: '1990-04-12',
          birthTime: '08:30',
          timezone: 'Europe/Berlin',
          geo_lon_deg: 0,
          geo_lat_deg: 0,
          language: 'en',
        },
        { config, fetchImpl: fakeFetch },
      ),
    (err) => err.code === ERROR_CODES.FUFIRE_UNAVAILABLE,
  );
});
