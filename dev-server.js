// Development server: serves static files and proxies API requests
// Env vars:
// - PORT: port to listen on (default 5173)
// - STATIC_DIR: directory to serve (default ".")
// - API_BASE: upstream API base for /api/* proxy (default https://nftapi.cyberwiz.io)
// - ALLOW_ORIGINS: comma-separated list of allowed origin hostnames (regex ok); defaults to localhost

const express = require('express');
const path = require('path');

function parseAllowedOrigins() {
  const raw = process.env.ALLOW_ORIGINS;
  if (!raw) return [/^localhost$/i, /^127\.0\.0\.1$/i, /^\[::1\]$/i];
  return raw.split(',').map((s) => s.trim()).filter(Boolean).map((pat) => {
    if (pat.startsWith('/') && pat.endsWith('/')) {
      const body = pat.slice(1, -1);
      return new RegExp(body, 'i');
    }
    return new RegExp(`^${pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  });
}

function createServer(options = {}) {
  const app = express();
  try {
    const compression = require('compression');
    app.use(compression());
  } catch {}
  const port = Number(process.env.PORT || options.port || 5173);
  const staticDir = path.resolve(process.env.STATIC_DIR || options.staticDir || '.');
  const apiBase = String(process.env.API_BASE || options.apiBase || 'https://api.calwep.org');
  const allowed = parseAllowedOrigins();

  // CORS for dev
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      try {
        const hostname = new URL(origin).hostname;
        if (allowed.some((re) => re.test(hostname))) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Vary', 'Origin');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        }
      } catch {}
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Health & info endpoints
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/_info', (req, res) => res.json({
    env: process.env.NODE_ENV || 'development',
    staticDir,
    apiBase,
  }));

  // Proxy /api/* and /demographics* to API_BASE
  const proxyHandler = async (req, res, targetPathBase = '/api') => {
    const targetUrl = new URL(req.originalUrl.replace(new RegExp(`^${targetPathBase}`), ''), apiBase).toString();
    try {
      // Forward a minimal, safe set of headers the upstream may rely on
      const fwdHeaders = {
        'accept': req.headers['accept'],
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'],
        'user-agent': req.headers['user-agent'],
      };
      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: Object.fromEntries(Object.entries(fwdHeaders).filter(([, v]) => !!v)),
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
        redirect: 'manual',
      });
      // Reflect upstream headers, skipping hop-by-hop and size-specific headers
      upstream.headers.forEach((value, key) => {
        if (/^(connection|transfer-encoding|content-length|content-encoding)$/i.test(key)) return;
        res.setHeader(key, value);
      });
      res.status(upstream.status);
      // Use arrayBuffer to support all content types reliably in Node
      const buf = await upstream.arrayBuffer();
      res.send(Buffer.from(buf));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Proxy error →', targetUrl, err);
      res.status(502).json({ error: 'Proxy error', details: String(err) });
    }
  };
  app.use('/api', (req, res) => proxyHandler(req, res, '/api'));
  app.use('/demographics', (req, res) => proxyHandler(req, res, '/'));

  // Static assets (no aggressive caching in dev)
  app.use(express.static(staticDir, { etag: true, lastModified: true, index: false, cacheControl: false }));

  // SPA fallback to index.html with dev-time API base rewrite
  const fs = require('fs');
  app.get('*', (req, res, next) => {
    if (!req.headers.accept || !req.headers.accept.includes('text/html')) return next();
    const indexPath = path.join(staticDir, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, html) => {
      if (err) return next();
      try {
        const origin = `${req.protocol}://${req.headers.host}`;
        // Replace or inject the meta api-base to point at the dev server origin
        let out = html;
        if (out.includes('meta name="api-base"')) {
          out = out.replace(/<meta[^>]*name=["']api-base["'][^>]*>/i, `<meta name="api-base" content="${origin}">`);
        } else {
          out = out.replace(/<head>/i, `<head>\n  <meta name="api-base" content="${origin}">`);
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(out);
      } catch (e) {
        res.sendFile(indexPath);
      }
    });
  });

  const start = () => new Promise((resolve) => {
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Dev server: http://localhost:${server.address().port}`);
      resolve(server);
    });
  });

  return { app, start };
}

if (require.main === module) {
  const { start } = createServer();
  start();
}

module.exports = { createServer };
