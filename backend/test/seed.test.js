import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { testDatabase, mockCatalog } from './support/database.js';
test('la carga demo cumple las cantidades y la migración conserva los datos', async () => {
  const db = await testDatabase(),
    restore = mockCatalog();
  process.env.DEMO_PASSWORD = 'Demo-test-password-123';
  try {
    await import('../src/database/seed.js');
    const { rows } = await db.query(
      'SELECT count(*)::int AS total,count(*) FILTER (WHERE "esFavorito")::int AS favorites,count(*) FILTER (WHERE puntuacion IS NOT NULL)::int AS ratings,count(*) FILTER (WHERE resena<>\'\')::int AS reviews,count(DISTINCT estado)::int AS states FROM biblioteca',
    );
    assert.deepEqual(rows[0], { total: 12, favorites: 5, ratings: 7, reviews: 3, states: 4 });
    assert.equal((await db.query('SELECT count(*)::int AS n FROM colecciones')).rows[0].n, 3);
    assert.ok((await db.query('SELECT count(*)::int AS n FROM actividad')).rows[0].n >= 15);
    const { rows: users } = await db.query('SELECT * FROM usuarios');
    assert.ok(users[0].passwordHash.startsWith('$2b$12$'));
    assert.equal(users[0].email, 'demo@gamerrepublic.app');
    assert.ok(users[0].fotoPerfil);
    assert.ok(users[0].preferencias.length);
    await db.exec(await readFile(new URL('../src/database/001-app.sql', import.meta.url), 'utf8'));
    assert.equal((await db.query('SELECT count(*)::int AS n FROM biblioteca')).rows[0].n, 12);
  } finally {
    restore();
    await db.close();
  }
});
