import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Loading, Empty } from './components/UI';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Detail from './pages/Detail';
import Library from './pages/Library';
import Collections from './pages/Collections';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Auth from './pages/Auth';
import './App.css';
function Protected() {
  const { user, loading } = useAuth(),
    location = useLocation();
  if (loading) return <Loading />;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explorar" element={<Explore />} />
            <Route path="juego/:id" element={<Detail />} />
            <Route path="login" element={<Auth />} />
            <Route path="registro" element={<Auth register />} />
            <Route element={<Protected />}>
              <Route path="biblioteca" element={<Library />} />
              <Route path="favoritos" element={<Library favorites />} />
              <Route path="colecciones" element={<Collections />} />
              <Route path="colecciones/:id" element={<Collections />} />
              <Route path="estadisticas" element={<Stats />} />
              <Route path="perfil" element={<Profile />} />
              <Route path="actividad" element={<Activity />} />
            </Route>
            <Route
              path="*"
              element={
                <Empty
                  title="Esta aventura todavía no existe"
                  text="Volvé a explorar el catálogo para encontrar tu camino."
                />
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
