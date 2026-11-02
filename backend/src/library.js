import { Router } from 'express';
import { pool, transaction, activity } from './database/pool.js';
import { fail, id, text } from './errors.js';
import { game } from './igdb.js';
import { statistics } from './stats.js';

export const library = Router();

export const gameFields =
  'v."idVideojuego" AS id,v."idExterno",v.titulo,v.descripcion,v."portadaUrl",v.imagen,v.generos,v.plataformas,v."fechaLanzamiento",v."puntuacionApi",v.desarrolladora';

export async function items(user) {
  return (
    await pool.query(
      'SELECT ' +
        gameFields +
        ',b.* FROM biblioteca b JOIN videojuegos v USING ("idVideojuego") WHERE b."idUsuario"=$1 ORDER BY b."fechaAgregado" DESC',
      [user],
    )
  ).rows;
}

export async function saveGame(db, g) {
  const { rows } = await db.query(
    'INSERT INTO videojuegos ("proveedorApi","idExterno",titulo,descripcion,"portadaUrl",imagen,generos,plataformas,"fechaLanzamiento","puntuacionApi",desarrolladora) VALUES (\'igdb\',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT ("proveedorApi","idExterno") DO UPDATE SET titulo=EXCLUDED.titulo, descripcion=EXCLUDED.descripcion,"portadaUrl"=EXCLUDED."portadaUrl",imagen=EXCLUDED.imagen,generos=EXCLUDED.generos,plataformas=EXCLUDED.plataformas RETURNING "idVideojuego"',
    [
      String(g.id),
      g.titulo,
      g.descripcion,
      g.portadaUrl,
      g.imagen,
      g.generos,
      g.plataformas,
      g.fechaLanzamiento,
      g.puntuacionApi,
      g.desarrolladora,
    ],
  );
  return rows[0].idVideojuego;
}

library.get('/library', async (req, res) => res.json(await items(req.user)));

library.post('/library', async (req, res) => {
  const g = await game(id(req.body.igdbId));
  const created = await transaction(async (db) => {
    const gameId = await saveGame(db, g);
    const { rowCount } = await db.query(
      'INSERT INTO biblioteca ("idUsuario","idVideojuego") VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user, gameId],
    );
    if (rowCount)
      await activity(db, req.user, 'juego_agregado', gameId, null, { titulo: g.titulo });
    return gameId;
  });
  res.status(201).json({ id: created });
});

library.patch('/library/:id', async (req, res) => {
  const gameId = id(req.params.id);
  const { estado, esFavorito, puntuacion, resena, horas } = req.body;
  if (!['Quiero jugar', 'Jugando', 'Terminado', 'Abandonado'].includes(estado))
    fail(400, 'Estado inválido.');
  if (typeof esFavorito !== 'boolean') fail(400, 'Favorito inválido.');
  if (puntuacion !== null && (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 10))
    fail(400, 'La puntuación va de 1 a 10.');
  if (typeof horas !== 'number' || !Number.isFinite(horas) || horas < 0 || horas > 999999)
    fail(400, 'Las horas deben estar entre 0 y 999999.');
  const review = text(resena, 5000);
  await transaction(async (db) => {
    const { rows } = await db.query(
      'UPDATE biblioteca SET estado=$3,"esFavorito"=$4,puntuacion=$5,resena=$6,horas=$7 WHERE "idUsuario"=$1 AND "idVideojuego"=$2 RETURNING *',
      [req.user, gameId, estado, esFavorito, puntuacion, review, horas],
    );
    if (!rows[0]) fail(404, 'Ese juego no está en tu biblioteca.');
    const { rows: games } = await db.query(
      'SELECT titulo FROM videojuegos WHERE "idVideojuego"=$1',
      [gameId],
    );
    await activity(db, req.user, 'juego_actualizado', gameId, null, {
      titulo: games[0].titulo,
      estado,
      puntuacion,
      favorito: esFavorito,
      resena: !!review,
    });
  });
  res.sendStatus(204);
});

library.delete('/library/:id', async (req, res) => {
  const gameId = id(req.params.id);
  await transaction(async (db) => {
    const result = await db.query(
      'DELETE FROM biblioteca WHERE "idUsuario"=$1 AND "idVideojuego"=$2 RETURNING *',
      [req.user, gameId],
    );
    if (!result.rowCount) fail(404, 'Ese juego no está en tu biblioteca.');
    await db.query(
      'DELETE FROM "coleccionesVideojuegos" WHERE "idVideojuego"=$2 AND "idColeccion" IN (SELECT "idColeccion" FROM colecciones WHERE "idUsuario"=$1)',
      [req.user, gameId],
    );
    await activity(db, req.user, 'juego_quitado', gameId);
  });
  res.sendStatus(204);
});

library.get('/stats', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT count(*)::int AS total FROM colecciones WHERE "idUsuario"=$1',
    [req.user],
  );
  res.json(statistics(await items(req.user), rows[0].total));
});

library.get('/activity', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM actividad WHERE "idUsuario"=$1 ORDER BY fecha DESC,"idActividad" DESC LIMIT 100',
    [req.user],
  );
  res.json(rows);
});
