# Puesta en marcha de Gamer Republic

Requisitos: Node.js 22.12 o superior y una base PostgreSQL 16 o superior. El servidor usa Express y pg; el frontend usa React, React Router y Axios.

## Configurar el backend

1. Crear una base vacía llamada gamer_republic en PostgreSQL.
2. Copiar backend/.env.example como backend/.env.
3. Configurar DATABASE_URL con la conexión real.
4. Generar JWT_SECRET con al menos 32 caracteres aleatorios. No usar el valor de ejemplo.
5. Registrar una aplicación confidencial en el portal de desarrolladores de Twitch y configurar TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET. Ver https://api-docs.igdb.com/#account-creation.
6. Elegir DEMO_PASSWORD con al menos 8 caracteres para la cuenta de demostración.

### Sin acceso a IGDB/Twitch (red del colegio): OMDb

Pedir una key gratis en https://www.omdbapi.com/apikey.aspx (llega por mail y hay que activarla con el link) y poner CATALOGO=omdb y OMDB_API_KEY=<la key> en backend/.env. OMDb tiene juegos con póster, sinopsis, género y puntaje de IMDb, pero no plataformas ni desarrolladoras. Solo permite buscar por texto, así que Explorar sin búsqueda muestra los juegos de OMDb guardados en la base, ordenados por cuántos usuarios los tienen (con una base nueva queda vacío hasta que alguien agregue juegos o se corra el seed). La búsqueda trae 10 resultados por página y el filtro de género no aplica. Límite: 1000 consultas por día con la key gratis.

Desde backend:

```sh
npm ci
npm run db:create
npm run migrate
npm run seed
npm run dev
```

La migración es repetible. Conserva las tablas originales del proyecto y agrega estado, horas, puntuación, reseña y metadatos necesarios. Se puede aplicar a una base vacía o a la estructura original. El dump gamerRepublicDB.sql se mantiene como referencia histórica; no hace falta importarlo antes de la migración.

La carga de demo consulta doce títulos reales a IGDB, incluido Cory in the House. Crea doce juegos, cinco favoritos, tres colecciones, cuatro estados, siete puntuaciones, tres reseñas y actividad. Los datos personales de demostración son simulados; los identificadores y metadatos del catálogo se obtienen de IGDB. Si no puede resolver un título exacto, se detiene antes de guardar. Si la cuenta ya existe, se detiene sin sobrescribir datos.

Cuenta: demo@gamerrepublic.app. Contraseña: el valor que configuraste en DEMO_PASSWORD. Los usuarios nuevos empiezan sin juegos.

## Iniciar el frontend

En otra terminal, desde frontend:

```sh
npm ci
npm run dev
```

Abrir http://localhost:5173. Vite redirige /api al backend en el puerto 3000. En este esquema no hace falta cambiar VITE_API_URL. Las cookies son HttpOnly y SameSite=Lax; la sesión dura siete días y la expiración se verifica en el servidor.

Si cambiás la URL local, actualizar FRONTEND_URL y el destino del proxy. Se recomienda mantener frontend y API bajo el mismo origen.

No subir .env ni credenciales. No hay biblioteca ni reseñas en localStorage: se guardan en PostgreSQL.

## Verificaciones

Desde backend:

```sh
npm test
```

Las pruebas de integración usan PostgreSQL en WebAssembly (PGlite) únicamente como dependencia de desarrollo, en memoria y aislado. La aplicación real siempre usa pg contra PostgreSQL. Verifican registro, contraseña con hash, JWT vencido, aislamiento entre usuarios, biblioteca, reseñas, colecciones y persistencia tras volver a iniciar sesión. No sustituyen la verificación final contra la base desplegada.

Desde frontend:

```sh
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright levanta servidores exclusivos en 3099 y 5175, con catálogo determinista y base aislada. Esos datos existen solo durante la prueba y no se usan en producción. Las capturas se guardan en frontend/test-results.

## Publicación

El servidor puede servir el frontend compilado junto con /api, con una sola URL pública y cookies del mismo origen.

En el servicio que aloje el repositorio completo:

- Build: npm ci --prefix frontend && npm run build --prefix frontend && npm ci --prefix backend --omit=dev
- Predeploy: npm run migrate --prefix backend
- Inicio: npm start --prefix backend
- NODE_ENV=production
- FRONTEND_URL=https://tu-dominio-publico
- DATABASE_URL apuntando a PostgreSQL accesible desde el servicio.
- JWT_SECRET, TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET configurados como secretos del proveedor.
- DB_SSL=true solo si el proveedor requiere TLS. Revisar su certificado y configuración antes de publicar.

Ejecutar seed una vez con DEMO_PASSWORD configurado, desde el entorno conectado a la base de producción. Cambiar o retirar DEMO_PASSWORD después de crear la cuenta.

El servidor respeta PORT. El health check es /api/health y comprueba la conexión con PostgreSQL.

La publicación requiere seleccionar el proveedor y configurar su cuenta, dominio, base y secretos. No hay un despliegue público creado por estos archivos.

## Material de entrega del grupo

El README original queda a cargo de los integrantes, como pide la consigna. Agregar allí las URLs reales del sitio, Figma y Trello, acceso de demostración y explicación propia de decisiones técnicas. El historial de ramas, PRs y colaboración debe corresponder a trabajo real de los integrantes; estos archivos no lo crean.

## PostgreSQL 16 en esta máquina Windows

El servicio instalado se llama postgresql-x64-16. Si está detenido, abrir Servicios de Windows con una cuenta administradora e iniciarlo. También se puede ejecutar sc start postgresql-x64-16 desde una terminal administradora. La sesión de desarrollo actual no tiene permisos para iniciarlo.

Después de configurar backend/.env, npm run db:create crea únicamente la base indicada si todavía no existe; no reemplaza ni elimina bases. npm run migrate aplica la estructura. No hace falta ejecutar manualmente el dump histórico en pgAdmin.

Con DB_SSL=true se validan los certificados del servidor. Si el proveedor usa una CA propia, configurar DB_CA_CERT con su certificado PEM.

Referencia visual: https://www.figma.com/design/63cD8wucTgi6x9Vd3rqnLf/GamerRep. Se tomaron los colores y las tipografías de los frames Home, Colecciones y Perfil; las portadas, los usuarios, las cantidades y la actividad son dinámicos.
