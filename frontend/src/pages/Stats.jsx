import { Trophy, Gamepad2, Clock3, Heart, Star, Layers, MessageSquare, Target } from 'lucide-react';
import { personalService } from '../services/api';
import { useLoad } from '../hooks/useLoad';
import { PageTitle, ErrorBox, Loading, Empty } from '../components/UI';

export default function Stats() {
  const { data: s, error, loading, reload } = useLoad(personalService.stats);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !s) return <Loading />;
  const metrics = [
    [Gamepad2, s.total, 'Juegos en la biblioteca'],
    [Trophy, s.completed, 'Aventuras completadas'],
    [Clock3, s.hours + ' h', 'Horas de juego'],
    [Heart, s.favorites, 'Juegos favoritos'],
    [Star, s.average ? s.average + ' / 10' : '—', 'Puntuación promedio'],
    [Layers, s.collections, 'Colecciones creadas'],
    [MessageSquare, s.reviews, 'Reseñas escritas'],
    [Target, s.completion + '%', 'Biblioteca completada'],
  ];
  
  return (
    <>
      <PageTitle
        title="Tu vida en videojuegos"
        eyebrow="ESTADÍSTICAS"
        description="Cada partida cuenta. Así se ve tu historia."
      />
      <div className="metric-grid">
        {metrics.map(([Icon, value, label]) => (
          <article className="panel metric" key={label}>
            <Icon size={22} />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      {!s.total ? (
        <Empty
          title="Tus números empiezan con un juego"
          text="Sumá títulos y registrá tu experiencia para ver tus estadísticas."
        />
      ) : (
        <div className="stats-columns">
          <section className="panel">
            <h2>El estado de tus aventuras</h2>
            <div
              className="progress-ring"
              style={{ background: 'conic-gradient(#9c6bff ' + s.completion + '%,#373047 0)' }}
            >
              <div>
                <strong>{s.completion}%</strong>
                <span>COMPLETADO</span>
              </div>
            </div>
            {[
              ['Quiero jugar', s.backlog],
              ['Jugando', s.playing],
              ['Terminado', s.completed],
              ['Abandonado', s.abandoned],
            ].map(([name, value], i) => (
              <div className="status-row" key={name}>
                <span className={'status status-' + i}>
                  <i />
                  {name}
                </span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>
          <section className="panel">
            <h2>Los géneros que te definen</h2>
            <p className="muted">Según los títulos de tu biblioteca.</p>
            {s.genres.slice(0, 7).map((g) => (
              <div className="bar-chart" key={g.name}>
                <div>
                  <span>{g.name}</span>
                  <strong>{g.value}</strong>
                </div>
                <div className="bar-track">
                  <span style={{ width: (g.value / s.total) * 100 + '%' }} />
                </div>
              </div>
            ))}
          </section>
          <section className="panel">
            <h2>Tus plataformas</h2>
            <p className="muted">Disponibilidad de los juegos que guardaste.</p>
            {s.platforms.slice(0, 7).map((g) => (
              <div className="bar-chart" key={g.name}>
                <div>
                  <span>{g.name}</span>
                  <strong>{g.value}</strong>
                </div>
                <div className="bar-track teal">
                  <span style={{ width: (g.value / s.total) * 100 + '%' }} />
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </>
  );
}
