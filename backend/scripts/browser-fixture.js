import express from 'express';
// Test-only HTTP server: isolated PostgreSQL and a deterministic IGDB fixture.
// This server is never imported by src/index.js or used in production.
import { testDatabase, mockCatalog } from '../test/support/database.js';
process.env.JWT_SECRET = 'browser-test-only-secret-at-least-32-characters';
process.env.FRONTEND_URL = 'http://127.0.0.1:5175';
const db = await testDatabase();
mockCatalog();
const { default: app } = await import('../src/app.js');
let ready = false;
const gate = express();
gate.get('/api/health', (_req, res) => res.status(ready ? 200 : 503).json({ ready }));
gate.use(app);
const server = gate.listen(3099, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = 'http://127.0.0.1:3099/api';
async function post(path, data, cookie) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res;
}
const account = await post('/auth/register', {
  username: 'playerone',
  email: 'browser@example.com',
  password: 'BrowserTest123',
  confirmation: 'BrowserTest123',
});
const cookie = account.headers.get('set-cookie').split(';')[0];
for (let i = 1; i <= 12; i++) {
  const res = await post('/library', { igdbId: i }, cookie),
    { id } = await res.json();
  await fetch(base + '/library/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      estado: ['Jugando', 'Terminado', 'Quiero jugar', 'Abandonado'][i % 4],
      esFavorito: i < 6,
      puntuacion: i < 8 ? 8 : null,
      resena: i < 4 ? 'Un mundo para descubrir.' : '',
      horas: i * 5,
    }),
  });
}
for (const nombre of ['Aventuras inolvidables', 'Indies con alma', 'Mi próximo desafío']) {
  const response = await post('/collections', { nombre }, cookie),
    c = await response.json();
  for (let i = 1; i <= 3; i++)
    await fetch(base + '/collections/' + c.idColeccion + '/games/' + i, {
      method: 'PUT',
      headers: { Cookie: cookie },
    });
}
ready = true;
console.log('Browser fixture ready on 3099');
process.on('SIGTERM', () =>
  server.close(async () => {
    await db.close();
    process.exit(0);
  }),
);
