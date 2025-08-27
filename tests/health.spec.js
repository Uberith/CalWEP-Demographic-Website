// Basic health test for the dev server using Jest
const { createServer } = require('../dev-server');

describe('dev-server', () => {
  let server;

  beforeAll(async () => {
    const { start } = createServer({ port: 0 }); // random port
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
});

