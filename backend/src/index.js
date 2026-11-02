import 'dotenv/config';
import app from './app.js';
import { pool } from './database/pool.js';

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.startsWith('reemplazar')
) {
  throw new Error('Configurá JWT_SECRET con un secreto aleatorio de al menos 32 caracteres.');
}

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => console.log('Gamer Republic: http://localhost:' + port));

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
