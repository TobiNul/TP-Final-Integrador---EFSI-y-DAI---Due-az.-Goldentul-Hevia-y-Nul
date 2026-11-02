import { states } from '../constants';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Search } from 'lucide-react';
import { personalService } from '../services/api';
import { useLoad } from '../hooks/useLoad';
import { PageTitle, GameGrid, ErrorBox, Loading, Empty } from '../components/UI';
export default function Library({ favorites = false }) {
  const { data, error, loading, reload } = useLoad(personalService.library);
  const [filter, setFilter] = useState('Todos'),
    [query, setQuery] = useState(''),
    [sort, setSort] = useState('recent');
  let games = (data || []).filter(
    (g) =>
      (!favorites || g.esFavorito) &&
      (filter === 'Todos' || g.estado === filter) &&
      g.titulo.toLowerCase().includes(query.toLowerCase()),
  );
  if (sort === 'title') games = [...games].sort((a, b) => a.titulo.localeCompare(b.titulo));
  if (sort === 'rating')
    games = [...games].sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
  return (
    <>
      <PageTitle
        title={favorites ? 'Mis favoritos' : 'Mi biblioteca'}
        eyebrow="TU COLECCIÓN PERSONAL"
        description={
          favorites
            ? 'Los juegos que tienen un lugar especial.'
            : 'Cada juego, una historia. Acá están las tuyas.'
        }
      >
        <Link className="button primary" to="/explorar">
          <Plus size={17} />
          Agregar juegos
        </Link>
      </PageTitle>
      <div className="library-summary">
        <span>
          <strong>{(data || []).filter((g) => !favorites || g.esFavorito).length}</strong> juegos en
          tu {favorites ? 'selección' : 'biblioteca'}
        </span>
        <span>
          <Heart size={15} />
          {(data || []).filter((g) => g.esFavorito).length} favoritos
        </span>
      </div>
      <div className="tabs">
        {['Todos', ...states].map((s) => (
          <button className={filter === s ? 'selected' : ''} key={s} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="filterbar">
        <div className="input-icon">
          <Search size={16} />
          <input
            aria-label="Buscar en la biblioteca"
            placeholder="Buscar en mi biblioteca…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Ordenar biblioteca"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="recent">Agregados recientemente</option>
          <option value="title">Nombre A–Z</option>
          <option value="rating">Mi puntuación</option>
        </select>
      </div>
      {error ? (
        <ErrorBox message={error} retry={reload} />
      ) : loading ? (
        <Loading />
      ) : games.length ? (
        <GameGrid games={games} />
      ) : (
        <Empty
          title="Un espacio para tu próxima aventura"
          text="Agregá juegos desde Explorar o probá con otro filtro."
        />
      )}
    </>
  );
}
