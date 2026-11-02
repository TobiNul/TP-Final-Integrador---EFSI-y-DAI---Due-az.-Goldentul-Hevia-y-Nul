import { Link } from 'react-router-dom';
import { ArrowUpRight, Gamepad2, Heart, Search, AlertCircle, LoaderCircle } from 'lucide-react';
import { states } from '../constants';
export function Loading() {
  return (
    <div className="empty" role="status">
      <LoaderCircle className="spin" />
      <p>Cargando tu próximo universo…</p>
    </div>
  );
}
export function ErrorBox({ message, retry }) {
  return (
    <div className="error" role="alert">
      <AlertCircle size={19} />
      <span>{message}</span>
      {retry && <button onClick={retry}>Reintentar</button>}
    </div>
  );
}
export function Empty({
  title = 'Todavía no hay juegos por acá',
  text = 'Explorá el catálogo y empezá tu colección.',
  action = true,
}) {
  return (
    <div className="empty">
      <Gamepad2 size={42} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <Link className="button primary" to="/explorar">
          <Search size={16} />
          Explorar juegos
        </Link>
      )}
    </div>
  );
}
export function PageTitle({ eyebrow = 'TU UNIVERSO GAMER', title, description, children }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {title}
          <span className="accent">.</span>
        </h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Cover({ src, title, className = '' }) {
  return src ? (
    <img
      className={className}
      src={src}
      alt={title}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden';
      }}
    />
  ) : (
    <div className={'cover-placeholder ' + className}>
      <Gamepad2 size={36} />
    </div>
  );
}
export function GameCard({ game, children }) {
  const href = '/juego/' + (game.idExterno || game.id);
  return (
    <article className="game-card">
      <Link to={href} className="game-cover">
        <Cover src={game.portadaUrl} title={game.titulo} />
        <span className="cover-shade" />
        {game.esFavorito && (
          <span className="favorite-badge">
            <Heart size={15} fill="currentColor" />
          </span>
        )}
        {game.puntuacionApi && <span className="score">★ {game.puntuacionApi}</span>}
        <span className="cover-action">
          Ver juego <ArrowUpRight size={16} />
        </span>
      </Link>
      <div className="game-info">
        <span className="game-genre">{game.generos?.slice(0, 2).join(' · ') || 'Videojuego'}</span>
        <Link to={href}>
          <h3>{game.titulo}</h3>
        </Link>
        <div className="game-meta">
          <span>{game.fechaLanzamiento?.slice(0, 4) || 'Sin fecha'}</span>
          {game.estado ? (
            <span className={'status status-' + states.indexOf(game.estado)}>
              <i />
              {game.estado}
            </span>
          ) : (
            <span>{game.plataformas?.[0] || 'Multiplataforma'}</span>
          )}
        </div>
        {children}
      </div>
    </article>
  );
}
export function GameGrid({ games, children }) {
  return games.length ? (
    <div className="game-grid">
      {games.map((g) => (
        <GameCard key={g.id} game={g}>
          {children?.(g)}
        </GameCard>
      ))}
    </div>
  ) : (
    <Empty />
  );
}
export function SectionTitle({ title, to, label = 'Ver todos' }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {to && (
        <Link to={to}>
          {label}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function ActivityList({ items, limit = 10 }) {
  const labels = {
    juego_agregado: 'Agregaste un juego a tu biblioteca',
    juego_actualizado: 'Actualizaste un juego',
    juego_quitado: 'Quitaste un juego',
    coleccion_creada: 'Creaste una colección',
    coleccion_editada: 'Editaste una colección',
    coleccion_borrada: 'Borraste una colección',
    juego_agregado_coleccion: 'Agregaste un juego a una colección',
    juego_quitado_coleccion: 'Quitaste un juego de una colección',
  };
  return items.length ? (
    <div className="activity-list">
      {items.slice(0, limit).map((a) => (
        <div className="activity-item" key={a.idActividad}>
          <span className="activity-icon">
            <Gamepad2 size={17} />
          </span>
          <div>
            <strong>{a.detalle.titulo || a.detalle.nombre || 'Tu colección'}</strong>
            <p>{labels[a.tipo] || 'Actividad registrada'}</p>
          </div>
          <time>
            {new Date(a.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
          </time>
        </div>
      ))}
    </div>
  ) : (
    <p className="muted">Tu historia empieza con el primer juego.</p>
  );
}
