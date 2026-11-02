import { fail, id } from './errors.js';
let access,
  expiration = 0,
  pending;
const cache = new Map();
let queue = Promise.resolve();
let lastRequest = 0;
async function token() {
  if (access && Date.now() < expiration) return access;
  if (!pending)
    pending = (async () => {
      if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET)
        fail(503, 'Falta configurar TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET en el backend.');
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) fail(502, 'No se pudo autenticar con Twitch.');
      const data = await response.json();
      access = data.access_token;
      expiration = Date.now() + (data.expires_in - 60) * 1000;
      return access;
    })().finally(() => {
      pending = undefined;
    });
  return pending;
}
async function request(body) {
  const run = queue
    .catch(() => {})
    .then(async () => {
      const wait = Math.max(0, 270 - (Date.now() - lastRequest));
      if (wait) await new Promise((r) => setTimeout(r, wait));
      lastRequest = Date.now();
      const credential = await token();
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: 'Bearer ' + credential,
          'Content-Type': 'text/plain',
        },
        body,
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 401) {
        access = undefined;
        fail(502, 'IGDB rechazó la sesión. Reintentá la consulta.');
      }
      if (!response.ok)
        fail(
          response.status === 429 ? 429 : 502,
          'IGDB no está disponible. Reintentá en unos segundos.',
        );
      return response.json();
    });
  queue = run;
  return run;
}
export function normalize(game) {
  const image = (url, size) =>
    url ? ('https:' + url.replace(/^https?:/, '')).replace('t_thumb', size) : null;
  return {
    id: game.id,
    titulo: game.name,
    descripcion: game.summary || 'Este título todavía no tiene una descripción disponible en IGDB.',
    portadaUrl: image(game.cover?.url, 't_cover_big'),
    imagen: image(game.screenshots?.[0]?.url, 't_screenshot_huge'),
    generos: (game.genres || []).map((g) => g.name),
    plataformas: (game.platforms || []).map((p) => p.name),
    fechaLanzamiento: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
    puntuacionApi: game.total_rating ? Number((game.total_rating / 10).toFixed(1)) : null,
    desarrolladora: (game.involved_companies || [])
      .filter((c) => c.developer)
      .map((c) => c.company.name)
      .join(', '),
  };
}
const fields =
  'fields name,summary,cover.url,screenshots.url,genres.name,platforms.name,first_release_date,total_rating,involved_companies.developer,involved_companies.company.name;';
export async function games({ q = '', sort = 'rating', genre = '', page = 1 } = {}) {
  if (typeof q !== 'string' || q.length > 100)
    fail(400, 'La búsqueda admite hasta 100 caracteres.');
  if (genre && !/^\d{1,6}$/.test(genre)) fail(400, 'Género inválido.');
  const offset = (id(page) - 1) * 24;
  if (offset > 4800) fail(400, 'No hay más páginas disponibles.');
  const search = q.trim() ? 'search ' + JSON.stringify(q.trim()) + ';' : '';
  const order = search
    ? ''
    : sort === 'newest'
      ? 'sort first_release_date desc;'
      : 'sort total_rating_count desc;';
  const body =
    fields +
    search +
    'where cover != null' +
    (genre ? ' & genres = ' + genre : '') +
    ';' +
    order +
    'limit 24; offset ' +
    offset +
    ';';
  const cached = cache.get(body);
  if (cached && cached.expires > Date.now()) return cached.data;
  const data = (await request(body)).map(normalize);
  if (cache.size > 100) cache.clear();
  cache.set(body, { data, expires: Date.now() + 300000 });
  return data;
}
export async function game(idValue) {
  const data = await request(fields + 'where id = ' + id(idValue) + '; limit 1;');
  if (!data[0]) fail(404, 'No encontramos ese juego en IGDB.');
  return normalize(data[0]);
}
