import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auth, requireAuth } from './auth.js';
import { library } from './library.js';
import { collections } from './collections.js';
import { games, game } from './igdb.js';
import { pool } from './database/pool.js';
const app = express();
app.disable('x-powered-by');
const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== origin
  )
    return res.status(403).json({ message: 'Origen no autorizado.' });
  next();
});
const attempts = new Map();
app.use('/api/auth', (req, res, next) => {
  if (req.method !== 'POST' || !['/login', '/register'].includes(req.path)) return next();
  const key = req.ip,
    now = Date.now();
  if (attempts.size > 10000) for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const attempt = attempts.get(key);
  if (!attempt || attempt.until < now) attempts.set(key, { count: 1, until: now + 600000 });
  else if (++attempt.count > 30)
    return res
      .status(429)
      .json({ message: 'Demasiados intentos. Volvé a intentar en 10 minutos.' });
  next();
});
app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ success: true, message: 'Servidor y PostgreSQL activos' });
});
app.use('/api/auth', auth);
app.get('/api/games', async (req, res) => res.json(await games(req.query)));
app.get('/api/games/:id', async (req, res) => res.json(await game(req.params.id)));
app.use('/api', requireAuth, library);
app.use('/api/collections', requireAuth, collections);
app.use('/api', (_req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));
if (process.env.NODE_ENV === 'production') {
  const dist = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
  app.use(express.static(dist));
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.use((error, _req, res, _next) => {
  if (error.code === '23505')
    return res.status(409).json({ message: 'El usuario o correo ya está registrado.' });
  const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(error.message);
  res
    .status(status)
    .json({
      message:
        status < 500 || error.status
          ? error.message
          : 'No pudimos completar la operación. Revisá la conexión del servidor con PostgreSQL.',
    });
});
export default app;
