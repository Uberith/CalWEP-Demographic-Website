const express = require('express');
const app = express();

const ALLOWED_ORIGINS = [/\.calwep\.org$/i, /\.cyberwiz\.io$/i];

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
    return res.sendStatus(204);
  }
  next();
});

app.use(async (req, res) => {
  const target = `https://nftapi.cyberwiz.io${req.originalUrl}`;
  try {
    const upstream = await fetch(target);
    const body = await upstream.text();
    upstream.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', details: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`CORS proxy listening on ${port}`);
});
