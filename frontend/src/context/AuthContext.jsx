import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch((e) => {
        if (active && e.response?.status !== 401) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    return () => {
      active = false;
      window.removeEventListener('session-expired', expired);
    };
  }, []);
  
  async function login(data) {
    setUser(await authService.login(data));
    setError('');
  }
  
  async function register(data) {
    setUser(await authService.register(data));
    setError('');
  }
  
  async function logout() {
    await authService.logout();
    setUser(null);
  }
  
  async function update(data) {
    setUser(await authService.update(data));
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
}
// Auth is shared by protected routes, account forms and navigation.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
