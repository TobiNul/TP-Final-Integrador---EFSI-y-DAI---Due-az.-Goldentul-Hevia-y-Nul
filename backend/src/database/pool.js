import 'dotenv/config';
import pg from 'pg';
import { dbConfig } from '../configs/db-config.js';
export const pool = new pg.Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: dbConfig.ssl }
    : dbConfig,
);
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
export async function activity(db, user, type, game = null, collection = null, detail = {}) {
  await db.query(
    'INSERT INTO actividad ("idUsuario",tipo,"idVideojuego","idColeccion",detalle) VALUES ($1,$2,$3,$4,$5)',
    [user, type, game, collection, detail],
  );
}
