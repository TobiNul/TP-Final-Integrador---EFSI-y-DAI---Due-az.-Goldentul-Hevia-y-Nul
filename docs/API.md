# API REST

Base: /api. JSON en cuerpos y respuestas. Autenticación mediante cookie gr_session HttpOnly con JWT HS256, expira a los 7 días. Axios usa withCredentials. Las rutas personales obtienen el usuario del token; no aceptan un usuario enviado por el cliente.

Errores: { "message": "Descripción" }. Códigos: 400 datos inválidos; 401 sesión ausente, vencida o credenciales incorrectas; 403 origen no autorizado; 404 recurso inexistente o de otra cuenta; 409 usuario/correo ocupado; 429 límite de intentos; 502 problema de IGDB/Twitch; 503 IGDB sin configurar; 500 error interno.

## Rutas públicas

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| GET | /health | — | 200 {success,message}, comprueba PostgreSQL |
| POST | /auth/register | username, email, password, confirmation | 201 perfil y cookie |
| POST | /auth/login | email, password | 200 perfil y cookie |
| POST | /auth/logout | — | 204 y cookie borrada |
| GET | /games | q, genre (ID IGDB), sort=rating o newest, page | 200 array de hasta 24 juegos |
| GET | /games/:id | ID externo IGDB | 200 juego |

La búsqueda es por título libre. El orden rating usa la cantidad de valoraciones como criterio de popularidad; las búsquedas por texto conservan la relevancia de IGDB. El filtro genre se aplica en IGDB. Se permiten 201 páginas como máximo.

Juego de catálogo: {id,titulo,descripcion,portadaUrl,imagen,generos:[],plataformas:[],fechaLanzamiento,puntuacionApi,desarrolladora}. La puntuación IGDB se convierte a escala de 10. Cada llamada a IGDB se ejecuta en el servidor, con token de Twitch renovado al vencer; las búsquedas tienen caché de cinco minutos y cola para respetar el límite del proveedor.

## Rutas privadas

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | /auth/me | — | 200 perfil, sin hash |
| PATCH | /auth/me | nombreCompleto, fotoPerfil (HTTPS o vacío), biografia, preferencias (array) | 200 perfil actualizado |
| GET | /library | — | 200 juegos personales |
| POST | /library | {igdbId: numero} | 201 {id: ID interno} |
| PATCH | /library/:id | estado, esFavorito, puntuacion, resena, horas | 204 |
| DELETE | /library/:id | — | 204, también quita el juego de colecciones propias |
| GET | /collections | — | 200 colecciones con juegos: array de IDs internos |
| POST | /collections | nombre, descripcion opcional | 201 colección |
| PATCH | /collections/:id | nombre, descripcion opcional | 204 |
| DELETE | /collections/:id | — | 204 |
| PUT | /collections/:id/games/:gameId | — | 204 |
| DELETE | /collections/:id/games/:gameId | — | 204 |
| GET | /activity | — | 200 últimas 100 actividades |
| GET | /stats | — | 200 estadísticas calculadas |

Los IDs de biblioteca y colecciones son internos; el catálogo y las URLs /juego/:id usan ID externo de IGDB. Agregar un mismo juego a la biblioteca o a una colección es idempotente. Solo se pueden agregar a colecciones juegos de la propia biblioteca.

PATCH biblioteca recibe todos los campos de experiencia; para borrar reseña enviar resena:"", para quitar una puntuación enviar puntuacion:null.

Ejemplo:

```json
{
  "estado": "Jugando",
  "esFavorito": true,
  "puntuacion": 9,
  "resena": "Una aventura inolvidable.",
  "horas": 24.5
}
```

Estados: Quiero jugar, Jugando, Terminado, Abandonado. Puntuación entera 1–10 o null; horas 0–999999; reseña hasta 5000 caracteres.

Perfil: {idUsuario,username,email,nombreCompleto,fotoPerfil,biografia,preferencias}. Usuario de 3–40 letras, números, puntos o guiones; contraseña de 8 caracteres como mínimo y 72 bytes como máximo; bcrypt con coste 12.

Estadísticas: total, completed, playing, backlog, abandoned, favorites, hours, average, reviews, completion, collections, genres y platforms. Los géneros y las plataformas cuentan las apariciones en los juegos de la biblioteca; no representan telemetría de una consola. Las horas son informadas por el usuario.

## Esquema y transacciones

Migración: backend/src/database/001-app.sql.

- usuarios 1:N biblioteca; videojuegos 1:N biblioteca. Clave compuesta usuario/juego. Estado, favorito, puntuación, reseña y horas pertenecen a esta relación.
- usuarios 1:N colecciones; colecciones N:M videojuegos mediante coleccionesVideojuegos.
- usuarios 1:N actividad. Referencias opcionales a juego y colección, fecha y detalle JSON.
- videojuegos conserva metadatos y el ID estable con unicidad (proveedorApi,idExterno). No necesita volver a consultar IGDB para reconstruir la biblioteca.

Las operaciones que afectan a juegos, colecciones y actividad usan transacciones. Las consultas SQL son parametrizadas. Los controles de propiedad están en el backend; las rutas protegidas de React son adicionales.
