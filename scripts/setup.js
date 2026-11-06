// Se ejecuta después de `npm i` en la raíz: instala backend y frontend, y crea backend/.env
// a partir de backend/.env.example (con un JWT_SECRET aleatorio) si todavía no existe.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

for (const dir of ['backend', 'frontend']) {
  console.log('\nInstalando dependencias de ' + dir + '...');
  execSync('npm install', { cwd: dir, stdio: 'inherit' });
}

if (!existsSync('backend/.env')) {
  const env = readFileSync('backend/.env.example', 'utf8').replace(
    /^JWT_SECRET=.*$/m,
    'JWT_SECRET=' + randomBytes(32).toString('hex'),
  );
  writeFileSync('backend/.env', env);
  console.log('\nSe creó backend/.env. Completá DATABASE_URL y las claves de la API del catálogo.');
}
