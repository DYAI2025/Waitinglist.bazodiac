import { malformedJson, unsupportedMediaType, asEnvelope, statusFor } from './errors.mjs';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const TEXT_HEADERS = { 'content-type': 'text/plain; charset=utf-8' };

export function corsHeaders(corsOrigin = '*') {
  return {
    'access-control-allow-origin': corsOrigin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}

export function sendJson(res, status, body, { cors = '*' } = {}) {
  res.writeHead(status, { ...JSON_HEADERS, ...corsHeaders(cors) });
  res.end(JSON.stringify(body));
}

export function sendText(res, status, body, { cors = '*', headers = {} } = {}) {
  res.writeHead(status, { ...TEXT_HEADERS, ...headers, ...corsHeaders(cors) });
  res.end(body);
}

export function sendError(res, err, { cors = '*' } = {}) {
  sendJson(res, statusFor(err), asEnvelope(err), { cors });
}

export async function readJson(req) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw unsupportedMediaType();
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw malformedJson();
  }
}
