import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './database/pool.js';
import { fail, text, webUrl } from './errors.js';
export const auth = Router();
const fields = '"idUsuario",username,email,"nombreCompleto","fotoPerfil",biografia,preferencias';
const cookieName = 'gr_session';
function cookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .filter((s) => s.includes('='))
      .map((s) => {
        const i = s.indexOf('=');
        return [s.slice(0, i).trim(), s.slice(i + 1)];
      }),
  );
}
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
export function requireAuth(req, res, next) {
  try {
    req.user = Number(
      jwt.verify(cookies(req)[cookieName], process.env.JWT_SECRET, { algorithms: ['HS256'] }).sub,
    );
    if (!Number.isSafeInteger(req.user)) throw new Error();
    next();
  } catch {
    res.status(401).json({ message: 'Tu sesión venció. Volvé a iniciar sesión.' });
  }
}
function session(res, user) {
  const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(user.idUsuario),
    expiresIn: '7d',
    algorithm: 'HS256',
  });
  res.cookie(cookieName, token, cookieOptions()).json(user);
}
auth.post('/register', async (req, res) => {
  const username = text(req.body.username, 40, true),
    email = text(req.body.email, 255, true).toLowerCase();
  const password = text(req.body.password, 72, true);
  if (!/^[\w.-]{3,40}$/.test(username))
    fail(400, 'El usuario debe tener entre 3 y 40 letras, números, puntos o guiones.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Ingresá un correo válido.');
  if (password.length < 8 || Buffer.byteLength(password) > 72)
    fail(400, 'La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes.');
  if (password !== req.body.confirmation) fail(400, 'Las contraseñas no coinciden.');
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO usuarios (username,email,"passwordHash") VALUES ($1,$2,$3) RETURNING ' + fields,
    [username, email, hash],
  );
  res.status(201);
  session(res, rows[0]);
});
auth.post('/login', async (req, res) => {
  const email = text(req.body.email, 255, true).toLowerCase(),
    password = text(req.body.password, 72, true);
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE lower(email)=$1', [email]);
  const valid = await bcrypt.compare(
    password,
    rows[0]?.passwordHash || '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5z3u0Q7E5S6dVpuBtbRsUapNZZHv1uK',
  );
  if (!rows[0] || !valid) fail(401, 'Correo o contraseña incorrectos.');
  const { rows: users } = await pool.query(
    'SELECT ' + fields + ' FROM usuarios WHERE "idUsuario"=$1',
    [rows[0].idUsuario],
  );
  session(res, users[0]);
});
auth.post('/logout', (_req, res) => {
  res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined }).sendStatus(204);
});
auth.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT ' + fields + ' FROM usuarios WHERE "idUsuario"=$1', [
    req.user,
  ]);
  if (!rows[0]) fail(401, 'La cuenta ya no está disponible.');
  res.json(rows[0]);
});
auth.patch('/me', requireAuth, async (req, res) => {
  const name = text(req.body.nombreCompleto, 120),
    bio = text(req.body.biografia, 1000);
  const avatar = webUrl(text(req.body.fotoPerfil, 2000));
  if (!Array.isArray(req.body.preferencias) || req.body.preferencias.length > 10)
    fail(400, 'Revisá tus preferencias.');
  const preferences = req.body.preferencias.map((p) => text(p, 60, true));
  const { rows } = await pool.query(
    'UPDATE usuarios SET "nombreCompleto"=$2,biografia=$3,"fotoPerfil"=$4,preferencias=$5 WHERE "idUsuario"=$1 RETURNING ' +
      fields,
    [req.user, name, bio, avatar, preferences],
  );
  res.json(rows[0]);
});
