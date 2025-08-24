const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
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
