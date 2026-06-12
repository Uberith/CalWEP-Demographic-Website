// Basic health test for the dev server using Jest
const { createServer } = require('../dev-server');

describe('dev-server', () => {
  let server;

  beforeAll(async () => {
    const { start } = createServer({ port: 0, host: '127.0.0.1' }); // random local-only port
    server = await start();
  });

  afterAll(async () => {
    if (server) await new Promise((r) => server.close(r));
  });

  test('returns ok on /health', async () => {
    const { port } = server.address();
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('injects same-origin API base for dev HTML', async () => {
    const { port } = server.address();
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      headers: { accept: 'text/html' },
    });
    expect(res.ok).toBe(true);
    const html = await res.text();
    expect(html).toContain('<meta name="api-base" content="self">');
  });
});
