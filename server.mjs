import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(rootDir, 'public');
const fixtureDir = join(rootDir, 'contracts', 'fixtures');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' };
const textHeaders = { 'content-type': 'text/plain; charset=utf-8' };
const corsHeaders = {
  'access-control-allow-origin': process.env.CORS_ORIGIN || '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon']
]);

async function fixture(name) {
  const raw = await readFile(join(fixtureDir, name), 'utf8');
  return JSON.parse(raw);
}

function sendJson(res, status, body) {
  res.writeHead(status, { ...jsonHeaders, ...corsHeaders });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body, headers = textHeaders) {
  res.writeHead(status, { ...headers, ...corsHeaders });
  res.end(body);
}

async function readJson(req) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const err = new Error('Content-Type must be application/json.');
    err.status = 415;
    err.code = 'UNSUPPORTED_MEDIA_TYPE';
    err.field = 'content-type';
    throw err;
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Request body must be valid JSON.');
    err.status = 400;
    err.code = 'MALFORMED_JSON';
    err.field = 'body';
    throw err;
  }
}

function validationError(message, field, code = 'VALIDATION_ERROR') {
  const err = new Error(message);
  err.status = 400;
  err.code = code;
  err.field = field;
  return err;
}

function ensureLanguage(language) {
  if (!['de', 'en'].includes(language)) {
    throw validationError('language must be either de or en', 'language');
  }
}

function scaleWuXing(chart) {
  // Contract values are 0..1. Keep the API canonical and let the UI scale for bars.
  return chart;
}

async function handleFusionChart(req, res) {
  const body = await readJson(req);
  if (!body.birthDate) throw validationError('birthDate is required', 'birthDate');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) throw validationError('birthDate must be YYYY-MM-DD', 'birthDate');
  if (!Object.hasOwn(body, 'birthTime')) throw validationError('birthTime is required', 'birthTime');
  if (body.birthTime !== null && !/^\d{1,2}:\d{2}$/.test(String(body.birthTime))) {
    throw validationError('birthTime must be HH:MM or null', 'birthTime');
  }
  if (!body.birthPlace || typeof body.birthPlace !== 'string') throw validationError('birthPlace is required', 'birthPlace');
  ensureLanguage(body.language);

  const response = await fixture('fusion-chart.response.success.json');
  response.chart = scaleWuXing(response.chart);
  sendJson(res, 200, response);
}

async function handleFusionInterpretation(req, res) {
  const body = await readJson(req);
  ensureLanguage(body.language);
  if (!body.chartSessionId) throw validationError('chartSessionId is required', 'chartSessionId');
  if (!body.chart || typeof body.chart !== 'object') throw validationError('chart is required', 'chart');

  const response = await fixture('fusion-interpretation.response.success.json');
  response.interpretation.language = body.language;
  sendJson(res, 200, response);
}

async function handleNewsletterSignup(req, res) {
  const body = await readJson(req);
  if (!body.consent) throw validationError('Consent must be granted before subscribing.', 'consent', 'CONSENT_REQUIRED');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw validationError('email must be valid', 'email', 'INVALID_EMAIL');
  }
  ensureLanguage(body.language);
  if (!body.chartSessionId) throw validationError('chartSessionId is required', 'chartSessionId');

  const response = await fixture('newsletter-signup.response.success.json');
  response.subscription.email = body.email;
  sendJson(res, 200, response);
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const normalized = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = join(publicDir, normalized);

  if (!filePath.startsWith(publicDir)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (req.method === 'GET' && !pathname.startsWith('/api/')) {
      createReadStream(join(publicDir, 'index.html'))
        .on('error', () => sendText(res, 404, 'Not found'))
        .pipe(res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }));
    } else {
      sendText(res, 404, 'Not found');
    }
  });
  stream.on('open', () => {
    res.writeHead(200, {
      'content-type': mimeTypes.get(extname(filePath)) || 'application/octet-stream',
      'cache-control': pathname === '/' || pathname.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
    });
  });
  stream.pipe(res);
}

async function route(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (url.pathname === '/healthz') {
    sendJson(res, 200, { ok: true, service: 'bazodiac-fusion-preview' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/public/fusion-chart') return handleFusionChart(req, res);
  if (req.method === 'POST' && url.pathname === '/api/public/fusion-interpretation') return handleFusionInterpretation(req, res);
  if (req.method === 'POST' && url.pathname === '/api/public/newsletter-signup') return handleNewsletterSignup(req, res);

  if (req.method === 'GET' && url.pathname.endsWith('/download.txt')) {
    const response = await fixture('fusion-interpretation.response.success.json');
    sendText(res, 200, response.interpretation.body);
    return;
  }

  if (req.method === 'GET' && url.pathname.endsWith('/download.pdf')) {
    const response = await fixture('fusion-interpretation.response.success.json');
    sendText(res, 200, response.interpretation.body, {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': 'attachment; filename="bazodiac-fusion-report.txt"'
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' } });
    return;
  }

  await serveStatic(req, res);
}

const server = createServer((req, res) => {
  route(req, res).catch((err) => {
    const status = err.status || 500;
    const code = err.code || 'INTERNAL_ERROR';
    sendJson(res, status, {
      ok: false,
      error: {
        code,
        message: err.message || 'Unexpected server error.',
        ...(err.field ? { field: err.field } : {})
      }
    });
  });
});

server.listen(port, host, () => {
  console.log(`Bazodiac Fusion Preview listening on http://${host}:${port}`);
});
