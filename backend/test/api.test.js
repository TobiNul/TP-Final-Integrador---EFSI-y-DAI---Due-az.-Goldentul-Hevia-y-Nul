import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { testDatabase, mockCatalog } from './support/database.js';
import app from '../src/app.js';

process.env.JWT_SECRET = 'test-secret-only-at-least-32-characters';

test('API integrada: cuentas aisladas, JWT, biblioteca, colecciones y persistencia', async () => {
  
  const db = await testDatabase(),
    restore = mockCatalog(),
    server = app.listen(0, '127.0.0.1');
  
  await new Promise((r) => server.once('listening', r));
  
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  
  async function call(path, method = 'GET', body, cookie) {
    const response = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const value = response.status === 204 ? null : await response.json();
    return {
      status: response.status,
      value,
      cookie: response.headers.get('set-cookie')?.split(';')[0],
    };
  }
  
  try {
    
    assert.equal((await call('/library')).status, 401);
    
    assert.equal(
      (
        await call('/auth/register', 'POST', {
          username: 'a',
          email: 'bad',
          password: '123',
          confirmation: '456',
        })
      ).status,
      400,
    );
    
    const account = {
      username: 'player1',
      email: 'one@example.com',
      password: 'Password123',
      confirmation: 'Password123',
    };
    
    const one = await call('/auth/register', 'POST', account);
    
    assert.equal(one.status, 201);
    
    assert.ok(one.cookie);
    
    assert.equal(one.value.passwordHash, undefined);
    
    assert.equal((await call('/auth/register', 'POST', account)).status, 409);
    
    const two = await call('/auth/register', 'POST', {
      ...account,
      username: 'player2',
      email: 'two@example.com',
    });
    
    assert.equal(two.status, 201);
    
    assert.equal(
      (await call('/auth/login', 'POST', { email: account.email, password: 'incorrect' })).status,
      401,
    );
    
    const added = await call('/library', 'POST', { igdbId: 1 }, one.cookie);
    
    assert.equal(added.status, 201);
    
    const game = added.value.id;
    
    const update = {
      estado: 'Terminado',
      esFavorito: true,
      puntuacion: 9,
      resena: 'Una gran aventura',
      horas: 25.5,
    };
    
    assert.equal((await call('/library/' + game, 'PATCH', update, one.cookie)).status, 204);
    
    assert.equal((await call('/library/' + game, 'PATCH', update, two.cookie)).status, 404);
    
    assert.equal(
      (await call('/library/' + game, 'PATCH', { ...update, puntuacion: 11 }, one.cookie)).status,
      400,
    );
    
    assert.equal((await call('/library', 'GET', null, two.cookie)).value.length, 0);
    
    const collection = await call('/collections', 'POST', { nombre: 'Favoritos' }, one.cookie);
    
    assert.equal(collection.status, 201);
    
    const cid = collection.value.idColeccion;
    
    assert.equal(
      (await call('/collections/' + cid + '/games/' + game, 'PUT', {}, two.cookie)).status,
      404,
    );
    
    assert.equal(
      (await call('/collections/' + cid + '/games/' + game, 'PUT', {}, one.cookie)).status,
      204,
    );
    
    assert.deepEqual((await call('/collections', 'GET', null, one.cookie)).value[0].juegos, [game]);
    
    assert.equal((await call('/collections/' + cid, 'DELETE', null, two.cookie)).status, 404);
    
    const stats = (await call('/stats', 'GET', null, one.cookie)).value;
    
    assert.equal(stats.completed, 1);
    
    assert.equal(stats.hours, 25.5);
    
    assert.equal(stats.average, 9);
    
    assert.equal(stats.reviews, 1);
    
    assert.ok((await call('/activity', 'GET', null, one.cookie)).value.length >= 4);
    const expired =
      'gr_session=' +
      jwt.sign({}, process.env.JWT_SECRET, { subject: String(one.value.idUsuario), expiresIn: -1 });
    
    assert.equal((await call('/library', 'GET', null, expired)).status, 401);
    
    const logout = await call('/auth/logout', 'POST', {}, one.cookie);
    
    assert.equal(logout.status, 204);
    
    assert.equal(logout.cookie, 'gr_session=');
    
    const login = await call('/auth/login', 'POST', {
      email: account.email,
      password: account.password,
    });
    
    assert.equal(login.status, 200);
    
    assert.equal(
      (await call('/library', 'GET', null, login.cookie)).value[0].resena,
      update.resena,
    );
    
    assert.equal((await call('/library/' + game, 'DELETE', null, login.cookie)).status, 204);
    
    assert.deepEqual((await call('/collections', 'GET', null, login.cookie)).value[0].juegos, []);
    
    assert.equal((await call('/stats', 'GET', null, login.cookie)).value.total, 0);
  } finally {
    restore();
    await new Promise((r) => server.close(r));
    await db.close();
  }
});
