import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { pool } from '../../src/database/pool.js';
export async function testDatabase() {
  const db = new PGlite();
  await db.exec(await readFile(new URL('../../src/database/001-app.sql', import.meta.url), 'utf8'));
  const query = async (sql, params) => {
    const result = params ? await db.query(sql, params) : (await db.exec(sql)).at(-1);
    return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
  };
  pool.query = query;
  pool.connect = async () => ({ query, release() {} });
  return db;
}
export function mockCatalog() {
  const original = globalThis.fetch;
  const names = [
    'Elden Ring',
    'Hollow Knight',
    'Stardew Valley',
    'Hades',
    'Celeste',
    'Portal 2',
    'The Witcher 3: Wild Hunt',
    'Cyberpunk 2077',
    'God of War',
    'Red Dead Redemption 2',
    'Cory in the House',
    'Grand Theft Auto V',
  ];
  globalThis.fetch = async (url, options) => {
    if (String(url).startsWith('https://id.twitch.tv/'))
      return Response.json({ access_token: 'test-only', expires_in: 3600 });
    if (String(url).startsWith('https://api.igdb.com/')) {
      const body = String(options?.body || ''),
        match = body.match(/where id = (\d+)/);
      const all = names.map((name, i) => ({
        id: i + 1,
        name,
        summary: 'Una aventura de prueba para verificar catálogo, biblioteca y persistencia.',
        genres: [{ name: i % 2 ? 'Adventure' : 'RPG' }],
        platforms: [{ name: 'PC (Microsoft Windows)' }],
        first_release_date: 1645747200,
        total_rating: 90 - i,
        involved_companies: [{ developer: true, company: { name: 'Estudio de prueba' } }],
      }));
      const search = body.match(/search ("(?:[^"\\]|\\.)*")/);
      const data = match
        ? all.filter((g) => g.id === Number(match[1]))
        : search
          ? all.filter((g) => g.name.toLowerCase().includes(JSON.parse(search[1]).toLowerCase()))
          : all;
      return Response.json(data);
    }
    return original(url, options);
  };
  process.env.TWITCH_CLIENT_ID = 'test';
  process.env.TWITCH_CLIENT_SECRET = 'test';
  return () => {
    globalThis.fetch = original;
  };
}
