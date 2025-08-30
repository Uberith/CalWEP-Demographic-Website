// Development server: serves static files and proxies API requests
// Env vars:
// - PORT: port to listen on (default 5173)
// - STATIC_DIR: directory to serve (default ".")
// - API_BASE: upstream API base for /api/* proxy (default https://api.calwep.org)
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
  // Proxy common API endpoints to API_BASE
  app.use('/api', (req, res) => proxyHandler(req, res, '/api'));
  app.use('/demographics', (req, res) => proxyHandler(req, res, '/'));
  app.use('/lookup', (req, res) => proxyHandler(req, res, '/'));
  app.use('/census-tracts', (req, res) => proxyHandler(req, res, '/'));

  // Simple in-memory cache for ACS (api.census.gov) requests during development
  const acsCache = new Map(); // key -> { status, headers, body: Buffer, expiresAt }
  const ACS_TTL_MS = Number(process.env.ACS_CACHE_TTL_MS || 10 * 60 * 1000); // 10 minutes default
  const ACS_MAX_ENTRIES = Number(process.env.ACS_CACHE_MAX || 500);

  function acsCacheGet(key) {
    const entry = acsCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      acsCache.delete(key);
      return null;
    }
    return entry;
  }
  function acsCacheSet(key, value) {
    if (acsCache.size >= ACS_MAX_ENTRIES) {
      const firstKey = acsCache.keys().next().value;
      if (firstKey) acsCache.delete(firstKey);
    }
    acsCache.set(key, { ...value, expiresAt: Date.now() + ACS_TTL_MS });
  }

  app.use('/proxy/acs', async (req, res) => {
    try {
      if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
      const suffix = req.originalUrl.replace(/^\/proxy\/acs/, '') || '/';
      const target = `https://api.census.gov${suffix}`;
      const key = target;
      const cached = acsCacheGet(key);
      if (cached) {
        for (const [k, v] of Object.entries(cached.headers)) res.setHeader(k, v);
        return res.status(cached.status).send(cached.body);
      }
      const upstream = await fetch(target, { headers: { 'accept': 'application/json', 'user-agent': 'CalWEP-Dev-Server' } });
      const buf = Buffer.from(await upstream.arrayBuffer());
      const headers = {};
      upstream.headers.forEach((value, key) => {
        if (/^(connection|transfer-encoding|content-length|content-encoding)$/i.test(key)) return;
        headers[key] = value;
        res.setHeader(key, value);
      });
      res.status(upstream.status).send(buf);
      if (upstream.ok && buf.length && ACS_TTL_MS > 0) acsCacheSet(key, { status: upstream.status, headers, body: buf });
    } catch (e) {
      res.status(502).json({ error: 'ACS proxy error', details: String(e) });
    }
  });

  // Proxy for Census Geocoder to avoid browser CORS issues in dev
  app.use('/proxy/geocoder', async (req, res) => {
    try {
      if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
      const suffix = req.originalUrl.replace(/^\/proxy\/geocoder/, '') || '/';
      const target = `https://geocoding.geo.census.gov${suffix}`;
      const upstream = await fetch(target, { headers: { 'accept': req.headers['accept'] || 'application/json', 'user-agent': 'CalWEP-Dev-Server' } });
      const buf = Buffer.from(await upstream.arrayBuffer());
      upstream.headers.forEach((value, key) => {
        if (/^(connection|transfer-encoding|content-length|content-encoding)$/i.test(key)) return;
        res.setHeader(key, value);
      });
      res.status(upstream.status).send(buf);
    } catch (e) {
      res.status(502).json({ error: 'Geocoder proxy error', details: String(e) });
    }
  });

  // Static assets (no aggressive caching in dev)
  app.use(express.static(staticDir, { etag: true, lastModified: true, index: false, cacheControl: false }));

  // SPA fallback to index.html; keep API base pointed at api.calwep.org
  const fs = require('fs');
  app.get('*', (req, res, next) => {
    if (!req.headers.accept || !req.headers.accept.includes('text/html')) return next();
    const indexPath = path.join(staticDir, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, html) => {
      if (err) return next();
      try {
        // Ensure there's a meta api-base pointing to api.calwep.org
        let out = html;
        const desired = '<meta name="api-base" content="https://api.calwep.org">';
        if (out.includes('meta name="api-base"')) {
          out = out.replace(/<meta[^>]*name=["']api-base["'][^>]*>/i, desired);
        } else {
          out = out.replace(/<head>/i, `<head>\n  ${desired}`);
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
