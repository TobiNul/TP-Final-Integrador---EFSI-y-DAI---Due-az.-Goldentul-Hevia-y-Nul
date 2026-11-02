import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoad } from '../hooks/useLoad';
import { catalogService, personalService } from '../services/api';
import { SectionTitle, ErrorBox, Loading, ActivityList, Cover, Empty } from '../components/UI';
export default function Home() {
  const { user } = useAuth(),
    catalog = useLoad(catalogService.list);
  const loader = useCallback(
    () =>
      user
        ? Promise.all([
            personalService.library(),
            personalService.collections(),
            personalService.stats(),
            personalService.activity(),
          ])
        : Promise.resolve(null),
    [user],
  );
  const personal = useLoad(loader),
    [library = [], collections = [], stats = {}, activity = []] = personal.data || [];
  const featured = catalog.data?.[0],
    favorites = library.filter((g) => g.esFavorito),
    completed = library.filter((g) => g.estado === 'Terminado');
  function gameRows(games) {
    return games.slice(0, 3).map((g) => (
      <Link className="home-game-row" to={'/juego/' + g.idExterno} key={g.id}>
        <Cover src={g.portadaUrl} title={g.titulo} />
        <div>
          <strong>{g.titulo}</strong>
          <span>
            {g.estado}
            {g.puntuacion ? ' · ★ ' + g.puntuacion + '/10' : ''}
          </span>
        </div>
      </Link>
    ));
  }
  return (
    <>
      <div className="page-title home-title">
        <div>
          <h1>Home</h1>
          <p>Datos generales y más.</p>
        </div>
        {!user && (
          <Link className="button primary" to="/login">
            Iniciar sesión
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {personal.error && <ErrorBox message={personal.error} retry={personal.reload} />}
      <div className="figma-home-columns">
        <div>
          <section className="panel home-data">
            <div>
              <h2>Data</h2>
              <p>
                Este sitio te sirve para buscar juegos, listarlos, compararlos y formar una
                comunidad a partir de ellos.
              </p>
              <span className="muted">API: IGDB</span>
            </div>
            <Link className="home-featured" to={featured ? '/juego/' + featured.id : '/explorar'}>
              <Cover src={featured?.portadaUrl} title={featured?.titulo || 'Explorar juegos'} />
              <span>Juegos</span>
            </Link>
          </section>
          {catalog.error && <ErrorBox message={catalog.error} retry={catalog.reload} />}
          <div className="home-personal-columns">
            <section className="panel">
              <h2 className="underlined">
                <Heart size={19} />
                Favoritos
              </h2>
              {personal.loading && user ? (
                <Loading />
              ) : favorites.length ? (
                gameRows(favorites)
              ) : (
                <p className="muted">Guardá los juegos que más te gustan.</p>
              )}
              <Link className="button primary full" to="/favoritos">
                Ver más
              </Link>
            </section>
            <section className="panel">
              <h2 className="underlined">
                <Trophy size={19} />
                Progreso
              </h2>
              {completed.length ? (
                gameRows(completed)
              ) : (
                <p className="muted">Completá aventuras para ver tu progreso.</p>
              )}
              <div className="home-progress-summary">
                <strong>{stats.completion || 0}%</strong>
                <span>de tu biblioteca completada</span>
              </div>
              <Link className="button primary full" to="/estadisticas">
                Ver más
              </Link>
            </section>
          </div>
        </div>
        <aside className="figma-home-right">
          <section className="panel">
            <h2 className="underlined">Colecciones</h2>
            {collections.length ? (
              collections.slice(0, 3).map((c) => {
                const first = library.find((g) => c.juegos.includes(g.id));
                return (
                  <Link
                    className="home-game-row"
                    to={'/colecciones/' + c.idColeccion}
                    key={c.idColeccion}
                  >
                    <Cover src={first?.portadaUrl} title={c.nombre} />
                    <div>
                      <strong>{c.nombre}</strong>
                      <span>
                        {c.juegos.length} juegos · {c.descripcion || 'Tu selección personal'}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="muted">Organizá tus videojuegos en colecciones personalizadas.</p>
            )}
            <Link className="button primary" to="/colecciones">
              Ver más
            </Link>
          </section>
          <section className="panel">
            <SectionTitle title="Actividad reciente" to="/actividad" label="Ver más" />
            <ActivityList items={activity} limit={3} />
          </section>
        </aside>
      </div>
      {!user && (
        <div className="home-register">
          <h2>Tu colección empieza con una cuenta.</h2>
          <Link className="button primary" to="/registro">
            Crear cuenta
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
      {user && !library.length && <Empty />}
    </>
  );
}
