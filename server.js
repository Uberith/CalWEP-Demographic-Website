const http = require('http');

const port = process.env.PORT || 3000;

const CSP = "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://nftapi.cyberwiz.io https://api.bigdatacloud.net https://geo.fcc.gov https://api.census.gov https://tigerweb.geo.census.gov https://gis.water.ca.gov https://services.arcgis.com https://overpass-api.de https://api.weather.gov https://maps.googleapis.com; img-src 'self' https://maps.googleapis.com data:";
const securityHeaders = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const server = http.createServer((req, res) => {
  for (const [k, v] of Object.entries(securityHeaders)) {
    res.setHeader(k, v);
  }
  if (req.url === '/api/maps-key') {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API key not configured' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ key }));
    return;
  }
  res.statusCode = 404;
  res.end();
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
