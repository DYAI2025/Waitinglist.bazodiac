import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { readFile } from 'node:fs/promises';

const port = 4173;
const baseUrl = process.env.PUBLIC_API_BASE_URL || `http://127.0.0.1:${port}`;

let server;
if (!process.env.PUBLIC_API_BASE_URL) {
  server = spawn(process.execPath, ['server.mjs'], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', PUBLIC_API_STUB_MODE: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

let logs = '';
if (server) {
  server.stdout.on('data', (chunk) => { logs += chunk; });
  server.stderr.on('data', (chunk) => { logs += chunk; });
}

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(`${baseUrl}/healthz`);
      if (res.ok) return;
    } catch {}
    await delay(125);
  }
  throw new Error(`Server did not become healthy. Logs:\n${logs}`);
}

async function postFixture(path, fixture) {
  const body = JSON.parse(await readFile(`contracts/fixtures/${fixture}`, 'utf8'));
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(`${path} failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

try {
  await waitForServer();

  const home = await fetch(`${baseUrl}/`);
  if (!home.ok) throw new Error(`GET / failed: ${home.status}`);
  const html = await home.text();
  if (!html.includes('Bazodiac')) throw new Error('GET / did not return the Bazodiac page');

  const chart = await postFixture('/api/public/fusion-chart', 'fusion-chart.request.valid.json');
  if (!chart.chartSessionId || !chart.chart) throw new Error('fusion-chart response missing chart payload');

  const interpretation = await postFixture('/api/public/fusion-interpretation', 'fusion-interpretation.request.valid.json');
  if (!interpretation.interpretation?.body) throw new Error('fusion-interpretation response missing body');

  const signup = await postFixture('/api/public/newsletter-signup', 'newsletter-signup.request.valid.json');
  if (!signup.subscribed) throw new Error('newsletter-signup response missing subscribed=true');

  // Negative path: consent:false must surface CONSENT_REQUIRED.
  const invalid = await fetch(`${baseUrl}/api/public/newsletter-signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', language: 'de', consent: false, chartSessionId: 'fc_2719ae' }),
  });
  const invalidJson = await invalid.json();
  if (invalid.status !== 400 || invalidJson.error?.code !== 'CONSENT_REQUIRED') {
    throw new Error(`Expected CONSENT_REQUIRED, got ${invalid.status} ${JSON.stringify(invalidJson)}`);
  }

  // Negative path: malformed JSON must surface MALFORMED_JSON.
  const malformed = await fetch(`${baseUrl}/api/public/fusion-chart`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{not-json}',
  });
  const malformedJson = await malformed.json();
  if (malformed.status !== 400 || malformedJson.error?.code !== 'MALFORMED_JSON') {
    throw new Error(`Expected MALFORMED_JSON, got ${malformed.status} ${JSON.stringify(malformedJson)}`);
  }

  // Negative path: wrong content-type must surface UNSUPPORTED_MEDIA_TYPE.
  const wrongType = await fetch(`${baseUrl}/api/public/fusion-chart`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: 'whatever',
  });
  const wrongTypeJson = await wrongType.json();
  if (wrongType.status !== 415 || wrongTypeJson.error?.code !== 'UNSUPPORTED_MEDIA_TYPE') {
    throw new Error(`Expected UNSUPPORTED_MEDIA_TYPE, got ${wrongType.status} ${JSON.stringify(wrongTypeJson)}`);
  }

  // CORS preflight.
  const options = await fetch(`${baseUrl}/api/public/fusion-chart`, { method: 'OPTIONS' });
  if (options.status !== 204 || !options.headers.get('access-control-allow-methods')?.includes('POST')) {
    throw new Error(`Expected CORS preflight 204 with POST methods, got ${options.status}`);
  }

  console.log('Smoke test passed');
} finally {
  if (server) server.kill('SIGTERM');
}
