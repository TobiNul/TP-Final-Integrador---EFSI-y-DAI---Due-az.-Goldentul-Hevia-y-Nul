import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';
try {
  await pool.query(await readFile(new URL('./001-app.sql', import.meta.url), 'utf8'));
  console.log('Migración aplicada.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
