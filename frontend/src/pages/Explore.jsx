import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { catalogService } from '../services/api';
import { useLoad } from '../hooks/useLoad';
import { PageTitle, ErrorBox, Loading, GameGrid, Empty } from '../components/UI';
export default function Explore() {
  const [params, setParams] = useSearchParams(),
    q = params.get('q') || '',
    genre = params.get('genre') || '',
    sort = params.get('sort') || 'rating',
    page = Number(params.get('page')) || 1;
  const [query, setQuery] = useState(q);
  const loader = useCallback(
    () => catalogService.list({ q, genre, sort, page }),
    [q, genre, sort, page],
  );
  const { data, error, loading, reload } = useLoad(loader);
  function change(key, value) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }
  return (
    <>
      <PageTitle
        title="Descubrí tu próximo juego"
        eyebrow="EXPLORAR"
        description="Un nuevo mundo está a una búsqueda de distancia."
      />
      <form
        className="explore-search"
        onSubmit={(e) => {
          e.preventDefault();
          change('q', query);
        }}
      >
        <Search size={22} />
        <input
          aria-label="Título del juego"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá entre miles de videojuegos…"
        />
        <button className="button primary">Buscar</button>
      </form>
      <div className="filterbar">
        <span>
          <SlidersHorizontal size={16} />
          Filtrar por
        </span>
        <select aria-label="Género" value={genre} onChange={(e) => change('genre', e.target.value)}>
          <option value="">Todos los géneros</option>
          <option value="12">RPG</option>
          <option value="31">Aventura</option>
          <option value="5">Shooter</option>
          <option value="8">Plataformas</option>
          <option value="15">Estrategia</option>
          <option value="32">Indie</option>
        </select>
        <select
          aria-label="Orden"
          disabled={!!q}
          value={sort}
          onChange={(e) => change('sort', e.target.value)}
        >
          <option value="rating">Más populares</option>
          <option value="newest">Lanzamiento más reciente</option>
        </select>
        {q && (
          <button
            onClick={() => {
              setParams({});
              setQuery('');
            }}
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
      <div className="section-title">
        <h2>{q ? 'Resultados para “' + q + '”' : 'Tu próxima obsesión'}</h2>
        <span className="muted">CATÁLOGO IGDB</span>
      </div>
      {error ? (
        <ErrorBox message={error} retry={reload} />
      ) : loading ? (
        <Loading />
      ) : data?.length ? (
        <>
          <GameGrid games={data} />
          <div className="pagination">
            <button
              className="button"
              disabled={page === 1}
              onClick={() => change('page', String(page - 1))}
            >
              <ArrowLeft size={16} />
              Anterior
            </button>
            <span>Página {page}</span>
            <button
              className="button"
              disabled={data.length < 24}
              onClick={() => change('page', String(page + 1))}
            >
              Siguiente
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <Empty
          title="No encontramos ese juego"
          text="Probá con otro título o cambiá el filtro de género."
          action={false}
        />
      )}
    </>
  );
}
