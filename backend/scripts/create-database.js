import 'dotenv/config';
import pg from 'pg';
import { dbConfig } from '../src/configs/db-config.js';
let client;
try {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  const name = url ? decodeURIComponent(url.pathname.slice(1)) : process.env.DB_NAME;
  if (!name || Buffer.byteLength(name) > 63)
    throw new Error(
      'Configurá DATABASE_URL o DB_NAME en backend/.env (nombre de base de hasta 63 bytes).',
    );
  const target = url ? new URL(url) : null;
  if (target) target.pathname = '/postgres';
  client = new pg.Client(
    target
      ? { connectionString: target.href, ssl: dbConfig.ssl }
      : { ...dbConfig, database: 'postgres' },
  );
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [name]);
  if (rowCount) console.log('La base ya existe; no se modificó.');
  else {
    await client.query('CREATE DATABASE "' + name.replace(/"/g, '""') + '"');
    console.log('Base creada: ' + name);
  }
  console.log('Continuá con npm run migrate y npm run seed.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (client) await client.end();
}
