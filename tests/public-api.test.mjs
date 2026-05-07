import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.mjs';
import { createHandler } from '../src/app.mjs';

let server;
let baseUrl;

async function postJson(path, body, { contentType = 'application/json', raw = false } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: raw ? body : JSON.stringify(body),
  });
}

async function loadFixtureRaw(name) {
  return JSON.parse(await readFile(`contracts/fixtures/${name}`, 'utf8'));
}

before(async () => {
  const config = loadConfig({ PUBLIC_API_STUB_MODE: 'true', PORT: '0', HOST: '127.0.0.1' });
  server = createServer(createHandler(config));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /healthz returns ok envelope with service marker', async () => {
  const res = await fetch(`${baseUrl}/healthz`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, 'bazodiac-fusion-preview');
});

test('OPTIONS preflight on a public endpoint returns 204 with CORS headers', async () => {
  const res = await fetch(`${baseUrl}/api/public/fusion-chart`, { method: 'OPTIONS' });
  assert.equal(res.status, 204);
  assert.match(res.headers.get('access-control-allow-methods') || '', /POST/);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});

test('POST /api/public/fusion-chart with the canonical fixture returns ok+chart', async () => {
  const body = await loadFixtureRaw('fusion-chart.request.valid.json');
  const res = await postJson('/api/public/fusion-chart', body);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.ok(json.chartSessionId);
  assert.ok(json.chart && typeof json.chart === 'object');
});

test('POST /api/public/fusion-chart accepts birthTime:null without error', async () => {
  const body = await loadFixtureRaw('fusion-chart.request.valid.json');
  body.birthTime = null;
  const res = await postJson('/api/public/fusion-chart', body);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
});

test('POST /api/public/fusion-chart missing birthDate → VALIDATION_ERROR with field=birthDate', async () => {
  const body = await loadFixtureRaw('fusion-chart.request.valid.json');
  delete body.birthDate;
  const res = await postJson('/api/public/fusion-chart', body);
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error.code, 'VALIDATION_ERROR');
  assert.equal(json.error.field, 'birthDate');
});

test('POST /api/public/fusion-chart with invalid language → field=language', async () => {
  const body = await loadFixtureRaw('fusion-chart.request.valid.json');
  body.language = 'fr';
  const res = await postJson('/api/public/fusion-chart', body);
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.error.code, 'VALIDATION_ERROR');
  assert.equal(json.error.field, 'language');
});

test('POST /api/public/fusion-interpretation echoes language and chartSessionId', async () => {
  const body = await loadFixtureRaw('fusion-interpretation.request.valid.json');
  body.language = 'en';
  body.chartSessionId = 'fc_zzz999';
  const res = await postJson('/api/public/fusion-interpretation', body);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.equal(json.interpretation.language, 'en');
  assert.equal(json.interpretation.chartSessionId, 'fc_zzz999');
});

test('POST /api/public/fusion-interpretation missing chartSessionId → field=chartSessionId', async () => {
  const body = await loadFixtureRaw('fusion-interpretation.request.valid.json');
  delete body.chartSessionId;
  const res = await postJson('/api/public/fusion-interpretation', body);
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.error.code, 'VALIDATION_ERROR');
  assert.equal(json.error.field, 'chartSessionId');
});

test('POST /api/public/newsletter-signup with valid fixture confirms subscription', async () => {
  const body = await loadFixtureRaw('newsletter-signup.request.valid.json');
  const res = await postJson('/api/public/newsletter-signup', body);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.equal(json.subscribed, true);
  assert.equal(json.subscription.email, body.email);
});

test('POST /api/public/newsletter-signup with consent:false → CONSENT_REQUIRED', async () => {
  const body = await loadFixtureRaw('newsletter-signup.request.valid.json');
  body.consent = false;
  const res = await postJson('/api/public/newsletter-signup', body);
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.error.code, 'CONSENT_REQUIRED');
  assert.equal(json.error.field, 'consent');
});

test('POST /api/public/newsletter-signup with malformed email → INVALID_EMAIL', async () => {
  const body = await loadFixtureRaw('newsletter-signup.request.valid.json');
  body.email = 'not-an-email';
  const res = await postJson('/api/public/newsletter-signup', body);
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.error.code, 'INVALID_EMAIL');
});

test('Malformed JSON body → MALFORMED_JSON', async () => {
  const res = await postJson('/api/public/fusion-chart', '{not-json}', { raw: true });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.error.code, 'MALFORMED_JSON');
});

test('Non-JSON content-type → UNSUPPORTED_MEDIA_TYPE (415)', async () => {
  const res = await fetch(`${baseUrl}/api/public/fusion-chart`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: 'whatever',
  });
  assert.equal(res.status, 415);
  const json = await res.json();
  assert.equal(json.error.code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('GET / serves the Bazodiac landing page', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Bazodiac/i);
});
