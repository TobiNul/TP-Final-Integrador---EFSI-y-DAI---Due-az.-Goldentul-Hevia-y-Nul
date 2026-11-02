import { states } from '../constants';
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Check, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoad } from '../hooks/useLoad';
import { catalogService, personalService } from '../services/api';
import { Cover, ErrorBox, Loading } from '../components/UI';

export default function Detail() {
  const { id } = useParams(),
    { user } = useAuth(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  
  const loader = useCallback(async () => {
    const [library, collections] = await Promise.all([
      user ? personalService.library() : Promise.resolve([]),
      user ? personalService.collections() : Promise.resolve([]),
    ]);
    const stored = library.find((g) => String(g.idExterno) === id);
    const game = stored
      ? { ...stored, id: Number(stored.idExterno) }
      : await catalogService.detail(id);
    return [game, library, collections];
  }, [id, user]);
  
  const loaded = useLoad(loader);
  
  if (loaded.error) return <ErrorBox message={loaded.error} retry={loaded.reload} />;
  
  if (loaded.loading || !loaded.data) return <Loading />;
  
  const [game, library, collections] = loaded.data,
    entry = library.find((g) => String(g.idExterno) === id);
  
  async function action(fn, message) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await fn();
      setSuccess(message);
      loaded.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  
  function save(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    action(
      () =>
        personalService.update(entry.id, {
          estado: f.get('estado'),
          esFavorito: f.get('favorite') === 'on',
          puntuacion: f.get('rating') ? Number(f.get('rating')) : null,
          resena: f.get('review'),
          horas: Number(f.get('hours')),
        }),
      'Cambios guardados.',
    );
  }
  
  return (
    <>
      <Link className="back-link" to="/explorar">
        <ArrowLeft size={16} />
        Volver a explorar
      </Link>
      <section
        className="detail-hero"
        style={
          game.imagen
            ? {
                backgroundImage:
                  'linear-gradient(0deg,#211e32, #211e3280),url(' + game.imagen + ')',
              }
            : {}
        }
      >
        <Cover className="detail-cover" src={game.portadaUrl} title={game.titulo} />
        <div>
          <span className="eyebrow">EN TU RADAR · IGDB</span>
          <h1>{game.titulo}</h1>
          <div className="tags">
            {game.generos.map((g) => (
              <span key={g}>{g}</span>
            ))}
          </div>
          <p>
            {game.desarrolladora || 'Desarrollador sin informar'} ·{' '}
            {game.fechaLanzamiento || 'Fecha sin confirmar'}
          </p>
          <div className="detail-actions">
            {!user ? (
              <Link className="button primary" to="/login">
                Ingresá para guardar
              </Link>
            ) : entry ? (
              <span className="button subtle">
                <Check size={17} />
                En tu biblioteca
              </span>
            ) : (
              <button
                className="button primary"
                disabled={busy}
                onClick={() =>
                  action(() => personalService.add(id), 'Juego agregado a tu biblioteca.')
                }
              >
                <Plus size={17} />
                Agregar a mi biblioteca
              </button>
            )}
            {game.puntuacionApi && (
              <span className="rating-large">
                ★ {game.puntuacionApi}
                <small>IGDB / 10</small>
              </span>
            )}
          </div>
        </div>
      </section>
      {error && <ErrorBox message={error} />}
      <p role="status" className="success">
        {success}
      </p>
      <div className="detail-columns">
        <section className="panel">
          <h2>Acerca del juego</h2>
          <p className="description">{game.descripcion}</p>
          <h3>Plataformas</h3>
          <div className="tags">
            {game.plataformas.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
          <p className="muted">
            Información y portadas: IGDB. Las descripciones conservan el idioma del catálogo.
          </p>
        </section>
        <aside className="panel">
          <h2>Tu experiencia</h2>
          {entry ? (
            <>
              <form
                key={
                  entry.id +
                  '-' +
                  entry.estado +
                  '-' +
                  entry.puntuacion +
                  '-' +
                  entry.esFavorito +
                  '-' +
                  entry.resena +
                  '-' +
                  entry.horas
                }
                onSubmit={save}
              >
                <label>
                  Estado
                  <select name="estado" defaultValue={entry.estado}>
                    {states.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <div className="form-row">
                  <label>
                    Tu puntuación
                    <select name="rating" defaultValue={entry.puntuacion || ''}>
                      <option value="">Sin puntuar</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} / 10
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Horas jugadas
                    <input
                      name="hours"
                      type="number"
                      min="0"
                      max="999999"
                      step=".1"
                      defaultValue={entry.horas}
                    />
                  </label>
                </div>
                <label className="checkbox">
                  <input type="checkbox" name="favorite" defaultChecked={entry.esFavorito} />
                  <Heart size={16} />
                  Es uno de mis favoritos
                </label>
                <label>
                  Tu reseña
                  <textarea
                    name="review"
                    maxLength={5000}
                    rows={4}
                    defaultValue={entry.resena}
                    placeholder="¿Qué te pareció esta aventura?"
                  />
                </label>
                <button className="button primary full" disabled={busy}>
                  Guardar experiencia
                </button>
              </form>
              <label>
                Agregar a una colección
                <select
                  value=""
                  disabled={busy}
                  onChange={(e) =>
                    e.target.value &&
                    action(
                      () => personalService.addToCollection(e.target.value, entry.id),
                      'Juego agregado a la colección.',
                    )
                  }
                >
                  <option value="">Elegí una colección</option>
                  {collections.map((c) => (
                    <option key={c.idColeccion} value={c.idColeccion}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="danger-link"
                disabled={busy}
                onClick={() =>
                  action(() => personalService.remove(entry.id), 'Juego quitado de la biblioteca.')
                }
              >
                Quitar de mi biblioteca
              </button>
            </>
          ) : (
            <p className="muted">
              Guardá este juego para registrar tu progreso, puntuación y reseña.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
