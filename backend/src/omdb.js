// Catálogo con OMDb (https://www.omdbapi.com), alternativa a IGDB cuando Twitch está bloqueado.
// Se activa con CATALOGO=omdb y OMDB_API_KEY en backend/.env.
// OMDb solo permite buscar por texto: sin búsqueda se listan los juegos de OMDb que ya están
// guardados en la base (los que agregaron los usuarios), ordenados por popularidad.
import { fail, id } from './errors.js';
import { pool } from './database/pool.js';

const cache = new Map();

async function request(params) {
  if (!process.env.OMDB_API_KEY) fail(503, 'Falta configurar OMDB_API_KEY en el backend.');
  const url =
    'https://www.omdbapi.com/?' +
    new URLSearchParams({ apikey: process.env.OMDB_API_KEY, type: 'game', ...params });
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) return cached.data;
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch {
    fail(502, 'OMDb no está disponible. Revisá la conexión o si la red la bloquea.');
  }
  const data = await response.json().catch(() => ({}));
  if (data.Response === 'False') {
    if (/api key/i.test(data.Error || '')) fail(502, 'OMDb rechazó la OMDB_API_KEY: ' + data.Error);
    if (/limit/i.test(data.Error || '')) fail(429, 'Se alcanzó el límite diario de OMDb.');
    return null; // "Movie not found!" / "Too many results."
  }
  if (!response.ok) fail(502, 'OMDb no está disponible. Reintentá en unos segundos.');
  if (cache.size > 300) cache.clear();
  cache.set(url, { data, expires: Date.now() + 3600000 });
  return data;
}

const value = (v) => (v && v !== 'N/A' ? v : null);
const toId = (imdbID) => Number(String(imdbID).replace(/^tt/, ''));
const toImdb = (n) => 'tt' + String(n).padStart(7, '0');

function date(released, year) {
  const parsed = value(released) && new Date(released + ' UTC');
  if (parsed && !isNaN(parsed)) return parsed.toISOString().slice(0, 10);
  const y = String(year || '').match(/\d{4}/);
  return y ? y[0] + '-01-01' : null;
}

export function normalize(d) {
  const rating = Number(value(d.imdbRating));
  return {
    id: toId(d.imdbID),
    titulo: d.Title,
    descripcion: value(d.Plot) || 'Este título todavía no tiene una descripción disponible en OMDb.',
    portadaUrl: value(d.Poster),
    imagen: null,
    generos: value(d.Genre) ? d.Genre.split(',').map((g) => g.trim()) : [],
    plataformas: [],
    fechaLanzamiento: date(d.Released, d.Year),
    puntuacionApi: rating || null,
    desarrolladora: value(d.Production) || '',
  };
}

async function saved({ sort, page }) {
  const { rows } = await pool.query(
    'SELECT v."idExterno" AS id,v.titulo,v.descripcion,v."portadaUrl",v.imagen,v.generos,v.plataformas,' +
      'to_char(v."fechaLanzamiento",\'YYYY-MM-DD\') AS "fechaLanzamiento",v."puntuacionApi"::float AS "puntuacionApi",v.desarrolladora ' +
      'FROM videojuegos v LEFT JOIN biblioteca b USING ("idVideojuego") WHERE v."proveedorApi"=\'omdb\' ' +
      'GROUP BY v."idVideojuego" ORDER BY ' +
      (sort === 'newest' ? 'v."fechaLanzamiento" DESC NULLS LAST' : 'count(b."idUsuario") DESC, v.titulo') +
      ' LIMIT 24 OFFSET $1',
    [(page - 1) * 24],
  );
  return rows.map((g) => ({ ...g, id: Number(g.id) }));
}

export async function omdbGames({ q = '', sort = 'rating', page = 1 } = {}) {
  if (typeof q !== 'string' || q.length > 100)
    fail(400, 'La búsqueda admite hasta 100 caracteres.');
  const n = id(page);
  if (!q.trim()) return saved({ sort, page: n });
  const search = await request({ s: q.trim(), page: String(n) });
  return (search?.Search || []).map((s) => ({
    id: toId(s.imdbID),
    titulo: s.Title,
    descripcion: '',
    portadaUrl: value(s.Poster),
    imagen: null,
    generos: [],
    plataformas: [],
    fechaLanzamiento: date(null, s.Year),
    puntuacionApi: null,
    desarrolladora: '',
  }));
}

export async function omdbGame(idValue) {
  const d = await request({ i: toImdb(id(idValue)), plot: 'full' });
  if (!d) fail(404, 'No encontramos ese juego en OMDb.');
  return normalize(d);
}
