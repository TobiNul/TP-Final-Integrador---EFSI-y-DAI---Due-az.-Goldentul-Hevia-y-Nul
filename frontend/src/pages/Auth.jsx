import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Gamepad2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ErrorBox } from '../components/UI';
export default function Auth({ register = false }) {
  const { user, login, register: signup } = useAuth(),
    location = useLocation();
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to={location.state?.from || '/'} replace />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await (register ? signup : login)(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <span className="eyebrow">BIENVENIDO A GAMER REPUBLIC</span>
        <Gamepad2 className="auth-gamepad" size={100} />
        <h1>
          Las mejores historias
          <br />
          se juegan<span className="accent">.</span>
        </h1>
        <p>Guardá tus favoritos, organizá tu biblioteca y descubrí tu próxima gran aventura.</p>
        <span className="auth-caption">
          <ShieldCheck size={17} />
          Tu colección, siempre con vos.
        </span>
      </section>
      <section className="panel auth-panel">
        <span className="eyebrow">TU PARTIDA EMPIEZA ACÁ</span>
        <h2>{register ? 'Creá tu cuenta' : 'Qué bueno verte de nuevo'}</h2>
        <p>
          {register
            ? 'Un lugar para todos los juegos que te definen.'
            : 'Ingresá para seguir construyendo tu colección.'}
        </p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Nombre de usuario
              <input
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={40}
                placeholder="Tu nombre gamer"
              />
            </label>
          )}
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="vos@ejemplo.com"
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              minLength={8}
              maxLength={72}
              placeholder="Al menos 8 caracteres"
            />
          </label>
          {register && (
            <label>
              Confirmá tu contraseña
              <input
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
          )}
          {error && <ErrorBox message={error} />}
          <button className="button primary" disabled={busy}>
            {busy ? 'Un momento…' : register ? 'Crear cuenta' : 'Iniciar sesión'}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? '¿Ya tenés cuenta?' : '¿Todavía no tenés cuenta?'}{' '}
          <Link to={register ? '/login' : '/registro'}>
            {register ? 'Iniciá sesión' : 'Registrate'}
          </Link>
        </p>
        <Link className="muted" to="/explorar">
          Explorar el catálogo sin una cuenta ↗
        </Link>
      </section>
    </div>
  );
}
