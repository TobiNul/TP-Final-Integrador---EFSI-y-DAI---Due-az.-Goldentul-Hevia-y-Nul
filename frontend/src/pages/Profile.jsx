import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, UserRound, Gamepad2, Heart, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { personalService } from '../services/api';
import { useLoad } from '../hooks/useLoad';
import {
  PageTitle,
  ErrorBox,
  Loading,
  GameGrid,
  SectionTitle,
  ActivityList,
} from '../components/UI';

const load = () =>
  Promise.all([personalService.library(), personalService.activity(), personalService.stats()]);

export default function Profile() {
  const navigate = useNavigate();
  const { user, update, logout } = useAuth(),
    { data, error, loading, reload } = useLoad(load),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const [games = [], activity = [], stats = {}] = data || [];
  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setMessage('');
    try {
      await update({
        ...f,
        preferencias: f.preferencias
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setEditing(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function exit() {
    setBusy(true);
    setMessage('');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  
  return (
    <>
      <PageTitle title="Mi perfil" description="El jugador detrás de cada aventura." />
      <section className="profile-banner">
        <span className="profile-avatar">
          {user.fotoPerfil ? (
            <img src={user.fotoPerfil} alt={user.username} />
          ) : (
            <UserRound size={42} />
          )}
        </span>
        <div>
          <span className="eyebrow">MIEMBRO DE LA REPUBLIC</span>
          <h2>{user.nombreCompleto || user.username}</h2>
          <span className="muted">@{user.username}</span>
          <p>{user.biografia || 'Tu historia está por escribirse.'}</p>
          <div className="tags">
            {user.preferencias.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
        <button className="button primary" onClick={() => setEditing(!editing)}>
          <Pencil size={15} />
          Editar perfil
        </button>
      </section>
      {message && <ErrorBox message={message} />}{' '}
      {editing && (
        <form className="panel profile-form" onSubmit={submit}>
          <h2>Hacé tuyo este espacio</h2>
          <label>
            Nombre visible
            <input name="nombreCompleto" maxLength={120} defaultValue={user.nombreCompleto || ''} />
          </label>
          <label>
            Avatar (URL HTTPS)
            <input
              name="fotoPerfil"
              type="url"
              maxLength={2000}
              defaultValue={user.fotoPerfil || ''}
              placeholder="https://…"
            />
          </label>
          <label>
            Biografía
            <textarea name="biografia" maxLength={1000} defaultValue={user.biografia || ''} />
          </label>
          <label>
            Preferencias, separadas por comas
            <input
              name="preferencias"
              defaultValue={user.preferencias.join(', ')}
              placeholder="RPG, Aventura, Cooperativo"
            />
          </label>
          <div className="button-row">
            <button className="button primary" disabled={busy}>
              Guardar perfil
            </button>
            <button className="button" type="button" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {error ? (
        <ErrorBox message={error} retry={reload} />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <div className="profile-numbers">
            {[
              [Gamepad2, stats.total, 'juegos'],
              [Heart, stats.favorites, 'favoritos'],
              [Trophy, stats.completed, 'completados'],
            ].map(([Icon, n, label]) => (
              <div key={label}>
                <Icon size={20} />
                <strong>{n}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <SectionTitle title="Juegos que me definen" to="/favoritos" />
          <GameGrid games={games.filter((g) => g.esFavorito).slice(0, 6)} />
          <section className="panel profile-activity">
            <SectionTitle title="Mi historia reciente" to="/actividad" />
            <ActivityList items={activity} limit={5} />
          </section>
          <Link className="button" to="/estadisticas">
            Ver todas mis estadísticas ↗
          </Link>
          <button className="button" style={{ marginLeft: 12 }} disabled={busy} onClick={exit}>
            Cerrar sesión
          </button>
        </>
      )}
    </>
  );
}
