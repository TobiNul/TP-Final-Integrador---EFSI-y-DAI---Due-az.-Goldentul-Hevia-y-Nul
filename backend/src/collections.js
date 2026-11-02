import { Router } from 'express';
import { pool, transaction, activity } from './database/pool.js';
import { fail, id, text } from './errors.js';

export const collections = Router();

collections.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT c.*,COALESCE(array_agg(cv."idVideojuego") FILTER (WHERE cv."idVideojuego" IS NOT NULL),\'{}\') AS juegos FROM colecciones c LEFT JOIN "coleccionesVideojuegos" cv USING ("idColeccion") WHERE c."idUsuario"=$1 GROUP BY c."idColeccion" ORDER BY c."fechaCreacion" DESC',
    [req.user],
  );
  res.json(rows);
});

collections.post('/', async (req, res) => {
  const name = text(req.body.nombre, 100, true),
    description = text(req.body.descripcion || '', 1000);
  const result = await transaction(async (db) => {
    const { rows } = await db.query(
      'INSERT INTO colecciones ("idUsuario",nombre,descripcion) VALUES ($1,$2,$3) RETURNING *',
      [req.user, name, description],
    );
    await activity(db, req.user, 'coleccion_creada', null, rows[0].idColeccion, { nombre: name });
    return rows[0];
  });
  res.status(201).json(result);
});

collections.patch('/:id', async (req, res) => {
  const name = text(req.body.nombre, 100, true),
    description = text(req.body.descripcion || '', 1000);
  await transaction(async (db) => {
    const { rowCount } = await db.query(
      'UPDATE colecciones SET nombre=$3,descripcion=$4 WHERE "idUsuario"=$1 AND "idColeccion"=$2',
      [req.user, id(req.params.id), name, description],
    );
    if (!rowCount) fail(404, 'Colección no encontrada.');
    await activity(db, req.user, 'coleccion_editada', null, id(req.params.id), { nombre: name });
  });
  res.sendStatus(204);
});

collections.delete('/:id', async (req, res) => {
  await transaction(async (db) => {
    const { rows } = await db.query(
      'DELETE FROM colecciones WHERE "idUsuario"=$1 AND "idColeccion"=$2 RETURNING nombre',
      [req.user, id(req.params.id)],
    );
    if (!rows[0]) fail(404, 'Colección no encontrada.');
    await activity(db, req.user, 'coleccion_borrada', null, null, { nombre: rows[0].nombre });
  });
  res.sendStatus(204);
});

collections.put('/:id/games/:gameId', async (req, res) => {
  const collection = id(req.params.id),
    game = id(req.params.gameId);
  await transaction(async (db) => {
    const { rows } = await db.query(
      'SELECT nombre FROM colecciones WHERE "idUsuario"=$1 AND "idColeccion"=$2 FOR UPDATE',
      [req.user, collection],
    );
    if (!rows[0]) fail(404, 'Colección no encontrada.');
    const own = await db.query(
      'SELECT 1 FROM biblioteca WHERE "idUsuario"=$1 AND "idVideojuego"=$2',
      [req.user, game],
    );
    if (!own.rowCount) fail(400, 'Primero agregá el juego a tu biblioteca.');
    const added = await db.query(
      'INSERT INTO "coleccionesVideojuegos" ("idColeccion","idVideojuego") VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [collection, game],
    );
    if (added.rowCount)
      await activity(db, req.user, 'juego_agregado_coleccion', game, collection, {
        nombre: rows[0].nombre,
      });
  });
  res.sendStatus(204);
});

collections.delete('/:id/games/:gameId', async (req, res) => {
  await transaction(async (db) => {
    const { rowCount } = await db.query(
      'DELETE FROM "coleccionesVideojuegos" WHERE "idColeccion"=$2 AND "idVideojuego"=$3 AND "idColeccion" IN (SELECT "idColeccion" FROM colecciones WHERE "idUsuario"=$1)',
      [req.user, id(req.params.id), id(req.params.gameId)],
    );
    if (!rowCount) fail(404, 'El juego no pertenece a esta colección.');
    await activity(
      db,
      req.user,
      'juego_quitado_coleccion',
      id(req.params.gameId),
      id(req.params.id),
    );
  });
  res.sendStatus(204);
});
