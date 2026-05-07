import { createReadStream } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sendJson, sendText, sendError, corsHeaders } from './http.mjs';
import { methodNotAllowed } from './errors.mjs';
import { PUBLIC_API_ROUTES, getInterpretationDownloadBody } from './routes/publicApi.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function findRoute(method, pathname) {
  return PUBLIC_API_ROUTES.find((r) => r.method === method && r.path === pathname);
}

function serveStatic(req, res, pathname, config) {
  const requested = pathname === '/' ? 'index.html' : pathname.slice(1);
  const safe = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = join(publicDir, safe);
  if (!filePath.startsWith(publicDir)) {
    sendText(res, 403, 'Forbidden', { cors: config.corsOrigin });
    return;
  }
  const stream = createReadStream(filePath);
  let opened = false;
  stream.on('open', () => {
    opened = true;
    res.writeHead(200, {
      'content-type': MIME.get(extname(filePath)) || 'application/octet-stream',
      'cache-control':
        pathname === '/' || pathname.endsWith('.html')
          ? 'no-cache'
          : 'public, max-age=31536000, immutable',
      ...corsHeaders(config.corsOrigin),
    });
    stream.pipe(res);
  });
  stream.on('error', () => {
    if (opened) return;
    if (req.method === 'GET' && !pathname.startsWith('/api/')) {
      // SPA fallback
      const indexStream = createReadStream(join(publicDir, 'index.html'));
      indexStream.on('error', () => sendText(res, 404, 'Not found', { cors: config.corsOrigin }));
      indexStream.on('open', () => {
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-cache',
          ...corsHeaders(config.corsOrigin),
        });
        indexStream.pipe(res);
      });
    } else {
      sendText(res, 404, 'Not found', { cors: config.corsOrigin });
    }
  });
}

export function createHandler(config) {
  return async function handler(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const { pathname } = url;

      if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders(config.corsOrigin));
        res.end();
        return;
      }

      if (pathname === '/healthz' && (req.method === 'GET' || req.method === 'HEAD')) {
        sendJson(res, 200, { ok: true, service: 'bazodiac-fusion-preview' }, { cors: config.corsOrigin });
        return;
      }

      const route = findRoute(req.method, pathname);
      if (route) {
        await route.handle(req, res, { config });
        return;
      }

      // Legacy interpretation downloads — kept for the existing UI.
      if (req.method === 'GET' && pathname.endsWith('/download.txt')) {
        const body = await getInterpretationDownloadBody();
        sendText(res, 200, body, { cors: config.corsOrigin });
        return;
      }
      if (req.method === 'GET' && pathname.endsWith('/download.pdf')) {
        const body = await getInterpretationDownloadBody();
        sendText(res, 200, body, {
          cors: config.corsOrigin,
          headers: { 'content-disposition': 'attachment; filename="bazodiac-fusion-report.txt"' },
        });
        return;
      }

      // Reject method-mismatched API hits explicitly so curl users see why.
      if (pathname.startsWith('/api/') && req.method !== 'GET' && req.method !== 'HEAD') {
        throw methodNotAllowed();
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        throw methodNotAllowed();
      }

      serveStatic(req, res, pathname, config);
    } catch (err) {
      sendError(res, err, { cors: config.corsOrigin });
    }
  };
}
