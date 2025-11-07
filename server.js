const express = require('express');
const app = express();

const DEV_ALLOWED = [/^localhost$/i, /^127\.0\.0\.1$/i, /^\[::1\]$/i];
const DEFAULT_ALLOWED = [/\.calwep\.org$/i];
const FRAME_ALLOWED_ORIGINS = [
  'https://calwep.org',
  'https://www.calwep.org',
  'https://insights.calwep.org',
  'https://cyberwiz.io',
  'https://www.cyberwiz.io',
  'https://demographics.cyberwiz.io',
];
const EXTRA_ALLOWED = (process.env.ALLOW_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((pat) => (pat.startsWith('/') && pat.endsWith('/'))
    ? new RegExp(pat.slice(1, -1), 'i')
    : new RegExp(`^${pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
const ALLOWED_ORIGINS = [
  ...DEFAULT_ALLOWED,
  ...(process.env.NODE_ENV === 'development' ? DEV_ALLOWED : []),
  ...EXTRA_ALLOWED,
];

function applyFrameHeaders(res) {
  const frameAncestors = `frame-ancestors 'self' ${FRAME_ALLOWED_ORIGINS.join(' ')};`;
  res.setHeader('Content-Security-Policy', frameAncestors);
  res.setHeader('X-Frame-Options', FRAME_ALLOWED_ORIGINS.map((origin) => `ALLOW-FROM ${origin}`));
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      if (ALLOWED_ORIGINS.some((re) => re.test(hostname))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      }
    } catch (err) {
      // ignore invalid origin
    }
  }
  if (req.method === 'OPTIONS') {
    applyFrameHeaders(res);
    return res.sendStatus(204);
  }
  next();
});

app.use(async (req, res) => {
  const target = `https://api.calwep.org${req.originalUrl}`;
  try {
    const upstream = await fetch(target);
    const body = await upstream.text();
    upstream.headers.forEach((value, key) => {
      if (/^(x-frame-options|content-security-policy)$/i.test(key)) return;
      res.setHeader(key, value);
    });
    applyFrameHeaders(res);
    res.status(upstream.status).send(body);
  } catch (err) {
    applyFrameHeaders(res);
    res.status(502).json({ error: 'Proxy error', details: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`CORS proxy listening on ${port}`);
});
