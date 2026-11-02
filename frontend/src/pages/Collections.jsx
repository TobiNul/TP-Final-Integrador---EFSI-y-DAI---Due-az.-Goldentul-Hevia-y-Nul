import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Layers, ArrowUpRight, ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { personalService } from '../services/api';
import { useLoad } from '../hooks/useLoad';
import { PageTitle, ErrorBox, Loading, GameGrid, Cover, Empty } from '../components/UI';

const load = () => Promise.all([personalService.collections(), personalService.library()]);

export default function Collections() {
  const { id } = useParams(),
    navigate = useNavigate(),
    { data, error, loading, reload } = useLoad(load);
  
  const [form, setForm] = useState(false),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  
  const [collections = [], games = []] = data || [],
    selected = id ? collections.find((c) => String(c.idColeccion) === id) : null;
  async function run(fn, done) {
    setBusy(true);
    setMessage('');
    try {
      await fn();
      done?.();
      reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  
  function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    run(
      () =>
        editing
          ? personalService.editCollection(editing.idColeccion, values)
          : personalService.createCollection(values),
      () => {
        setForm(false);
        setEditing(null);
      },
    );
  }
  
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading) return <Loading />;
  
  if (id && !selected)
    return (
      <Empty
        title="Colección no encontrada"
        text="La colección no existe o no pertenece a tu cuenta."
        action={false}
      />
    );
  
  return (
    <>
      {id && (
        <Link className="back-link" to="/colecciones">
          <ArrowLeft size={16} />
          Todas mis colecciones
        </Link>
      )}
      <PageTitle
        title={selected?.nombre || 'Mis colecciones'}
        eyebrow="A TU MANERA"
        description={selected?.descripcion || 'Ordená tus aventuras. Creá algo muy tuyo.'}
      >
        <button
          className="button primary"
          onClick={() => {
            setEditing(selected);
            setForm(!form);
          }}
        >
          {selected ? <Pencil size={17} /> : <Plus size={17} />}{' '}
          {selected ? 'Editar colección' : 'Nueva colección'}
        </button>
      </PageTitle>
      {message && <ErrorBox message={message} />}{' '}
      {form && (
        <form
          className="panel collection-form"
          key={editing?.idColeccion || 'new'}
          onSubmit={submit}
        >
          <h2>{editing ? 'Editar colección' : 'Un lugar para tus juegos'}</h2>
          <label>
            Nombre
            <input
              name="nombre"
              required
              maxLength={100}
              defaultValue={editing?.nombre || ''}
              placeholder="Por ejemplo: Aventuras inolvidables"
            />
          </label>
          <label>
            Descripción
            <textarea
              name="descripcion"
              maxLength={1000}
              defaultValue={editing?.descripcion || ''}
              placeholder="¿Qué une a estos juegos?"
            />
          </label>
          <div className="button-row">
            <button className="button primary" disabled={busy}>
              Guardar colección
            </button>
            <button type="button" className="button" onClick={() => setForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      
      {selected ? (
        <>
          <div className="filterbar">
            <span>{selected.juegos.length} juegos</span>
            <button
              className="danger-link"
              disabled={busy}
              onClick={() =>
                run(
                  () => personalService.deleteCollection(selected.idColeccion),
                  () => navigate('/colecciones'),
                )
              }
            >
              <Trash2 size={15} />
              Borrar colección
            </button>
          </div>
          <GameGrid games={games.filter((g) => selected.juegos.includes(g.id))}>
            {(g) => (
              <button
                className="danger-link"
                disabled={busy}
                onClick={() =>
                  run(() => personalService.removeFromCollection(selected.idColeccion, g.id))
                }
              >
                Quitar de colección
              </button>
            )}
          </GameGrid>
          <p className="muted collection-tip">
            Agregá juegos a esta colección desde el detalle de cualquier título de tu biblioteca.
          </p>
        </>
      ) : collections.length ? (
        <div className="collections-grid">
          {collections.map((c) => (
            <Link
              className="collection-card"
              to={'/colecciones/' + c.idColeccion}
              key={c.idColeccion}
            >
              <div className="collection-mosaic">
                {games
                  .filter((g) => c.juegos.includes(g.id))
                  .slice(0, 3)
                  .map((g) => (
                    <Cover key={g.id} src={g.portadaUrl} title={g.titulo} />
                  ))}
                {!c.juegos.length && <Layers size={50} />}
              </div>
              <div className="collection-card-body">
                <span className="eyebrow">COLECCIÓN PERSONAL</span>
                <h2>{c.nombre}</h2>
                <p>{c.descripcion || 'Una selección de tu universo gamer.'}</p>
                <span>
                  {c.juegos.length} juegos
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </Link>
          ))}
          <button
            className="new-collection"
            onClick={() => {
              setEditing(null);
              setForm(true);
            }}
          >
            <Plus size={34} />
            <strong>Tu próxima colección</strong>
            <span>Un nuevo lugar para tus historias</span>
          </button>
        </div>
      ) : (
        <Empty
          title="Tu colección, tus reglas"
          text="Creá tu primera colección con el botón de arriba."
          action={false}
        />
      )}
    </>
  );
}
