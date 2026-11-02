import { NavLink, Link, Outlet } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  ['/', 'Home'],
  ['/explorar', 'Buscador'],
  ['/biblioteca', 'Biblioteca'],
  ['/colecciones', 'Colecciones'],
  ['/estadisticas', 'Estadísticas'],
];

export default function Layout() {
  const { user } = useAuth();
  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">
          Gamer Republic
        </Link>
        <Link
          to={user ? '/perfil' : '/login'}
          className="avatar"
          aria-label={user ? 'Mi perfil' : 'Iniciar sesión'}
        >
          {user?.fotoPerfil ? (
            <img src={user.fotoPerfil} alt="Tu perfil" />
          ) : (
            <UserRound size={25} />
          )}
        </Link>
      </header>
      <nav className="navbar">
        <div>
          {nav.map(([to, label]) => (
            <NavLink to={to} end={to === '/'} key={to}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="app-shell">
        <main>
          <Outlet />
        </main>
      </div>
      <footer>
        <Link className="footer-brand" to="/">
          GAMER REPUBLIC<span>Tu universo, tus reglas.</span>
        </Link>
        <span>
          Datos de videojuegos provistos por{' '}
          <a href="https://www.igdb.com/" target="_blank" rel="noreferrer">
            IGDB ↗
          </a>
        </span>
        <span>EFSI & DAI · 2026</span>
      </footer>
    </>
  );
}
