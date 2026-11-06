import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool, transaction, activity } from './pool.js';
import { saveGame } from '../library.js';
import { games, game } from '../igdb.js';
const titles = [
  'Elden Ring',
  'The Witcher 3: Wild Hunt',
  'Red Dead Redemption 2',
  'Cyberpunk 2077',
  'Hollow Knight',
  'Stardew Valley',
  'Hades',
  'Celeste',
  'Portal 2',
  'God of War',
  'Grand Theft Auto V',
  'Cory in the House',
];
try {
  if (
    !process.env.DEMO_PASSWORD ||
    process.env.DEMO_PASSWORD.length < 8 ||
    Buffer.byteLength(process.env.DEMO_PASSWORD) > 72
  )
    throw new Error('Configurá DEMO_PASSWORD (al menos 8 caracteres) para crear la cuenta demo.');
  const existing = await pool.query('SELECT 1 FROM usuarios WHERE email=$1', [
    'demo@gamerrepublic.app',
  ]);
  if (existing.rowCount) throw new Error('La cuenta demo ya existe. No se modificaron sus datos.');
  const catalog = [];
  for (const title of titles) {
    const results = await games({ q: title });
    const found = results.find((g) => g.titulo.toLowerCase() === title.toLowerCase());
    if (!found)
      throw new Error((process.env.CATALOGO === 'omdb' ? 'OMDb' : 'IGDB') + ' no devolvió el título exacto: ' + title + '. No se cargaron datos.');
    catalog.push(process.env.CATALOGO === 'omdb' ? await game(found.id) : found);
  }
  const hash = await bcrypt.hash(process.env.DEMO_PASSWORD, 12);
  await transaction(async (db) => {
    const { rows } = await db.query(
      'INSERT INTO usuarios (username,email,"passwordHash","nombreCompleto","fotoPerfil",biografia,preferencias) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING "idUsuario"',
      [
        'playerone',
        'demo@gamerrepublic.app',
        hash,
        'Player One',
        'https://api.dicebear.com/9.x/bottts/svg?seed=Republic',
        'Entre mundos abiertos, aventuras indie y una partida más.',
        ['RPG', 'Aventura', 'Indie'],
      ],
    );
    const user = rows[0].idUsuario,
      collections = [];
    for (const [nombre, descripcion] of [
      ['Aventuras inolvidables', 'Historias que dejan huella.'],
      ['Indies con alma', 'Pequeños mundos, grandes ideas.'],
      ['Mi próximo desafío', 'Una partida más, un nuevo comienzo.'],
    ]) {
      const { rows } = await db.query(
        'INSERT INTO colecciones ("idUsuario",nombre,descripcion) VALUES ($1,$2,$3) RETURNING "idColeccion"',
        [user, nombre, descripcion],
      );
      collections.push(rows[0].idColeccion);
      await activity(db, user, 'coleccion_creada', null, rows[0].idColeccion, { nombre });
    }
    for (let i = 0; i < catalog.length; i++) {
      const g = catalog[i],
        gid = await saveGame(db, g),
        estado = ['Terminado', 'Jugando', 'Quiero jugar', 'Abandonado'][i % 4];
      await db.query(
        'INSERT INTO biblioteca ("idUsuario","idVideojuego",estado,"esFavorito",puntuacion,resena,horas,"fechaAgregado") VALUES ($1,$2,$3,$4,$5,$6,$7,now()-($8::int*interval \'1 day\'))',
        [
          user,
          gid,
          estado,
          i < 5,
          i < 7 ? 10 - (i % 4) : null,
          i < 3
            ? [
                'Un mundo que invita a explorar cada rincón.',
                'Una historia inolvidable, con personajes excelentes.',
                'La ambientación hace que cada viaje valga la pena.',
              ][i]
            : '',
          i < 8 ? 12 + i * 7 : 0,
          12 - i,
        ],
      );
      await db.query(
        'INSERT INTO "coleccionesVideojuegos" ("idColeccion","idVideojuego") VALUES ($1,$2)',
        [collections[i % 3], gid],
      );
      await activity(db, user, 'juego_agregado', gid, null, { titulo: g.titulo });
      if (i < 7)
        await activity(db, user, 'juego_actualizado', gid, null, {
          titulo: g.titulo,
          estado,
          puntuacion: 10 - (i % 4),
          favorito: i < 5,
          resena: i < 3,
        });
    }
  });
  console.log('Demo creada: demo@gamerrepublic.app. Usá la contraseña de DEMO_PASSWORD.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
