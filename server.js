const http = require('http');
const zlib = require('zlib');
const Sentry = require('@sentry/node');
require('dotenv').config();

const port = process.env.PORT || 3000;

Sentry.init({ dsn: process.env.SENTRY_DSN || '' });
process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
  throw err;
});
process.on('unhandledRejection', (err) => {
  Sentry.captureException(err);
});

const CSP = "default-src 'self'; script-src 'self' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://nftapi.cyberwiz.io https://api.bigdatacloud.net https://geo.fcc.gov https://api.census.gov https://tigerweb.geo.census.gov https://gis.water.ca.gov https://services.arcgis.com https://overpass-api.de https://api.weather.gov https://maps.googleapis.com https://o0.ingest.sentry.io; img-src 'self' https://maps.googleapis.com data:";
const securityHeaders = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function compressAndSend(req, res, body, headers = {}) {
  const accept = req.headers['accept-encoding'] || '';
  if (accept.includes('br')) {
    const br = zlib.brotliCompressSync(Buffer.from(body));
    res.writeHead(200, { ...headers, 'Content-Encoding': 'br' });
    res.end(br);
  } else if (accept.includes('gzip')) {
    const gz = zlib.gzipSync(Buffer.from(body));
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
    res.end(gz);
  } else {
    res.writeHead(200, headers);
    res.end(body);
  }
}

const server = http.createServer((req, res) => {
  for (const [k, v] of Object.entries(securityHeaders)) {
    res.setHeader(k, v);
  }
  if (req.url === '/api/maps-key') {
    const key = process.env.MAPS_API_KEY;
    if (!key) {
      compressAndSend(
        req,
        res,
        JSON.stringify({ error: 'API key not configured' }),
        { 'Content-Type': 'application/json' }
      );
      return;
    }
    compressAndSend(
      req,
      res,
      JSON.stringify({ key }),
      { 'Content-Type': 'application/json' }
    );
    return;
  }
  res.statusCode = 404;
  res.end();
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
