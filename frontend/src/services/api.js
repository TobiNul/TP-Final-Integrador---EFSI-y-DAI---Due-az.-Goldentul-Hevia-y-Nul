import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 25000,
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) window.dispatchEvent(new Event('session-expired'));
    error.message =
      error.response?.data?.message ||
      'No hay conexión con el servidor. Comprobá que el backend esté activo.';
    return Promise.reject(error);
  },
);

export const get = async (path, config) => (await api.get(path, config)).data;

export const authService = {
  me: () => get('/auth/me'),
  login: async (data) => (await api.post('/auth/login', data)).data,
  register: async (data) => (await api.post('/auth/register', data)).data,
  logout: () => api.post('/auth/logout'),
  update: async (data) => (await api.patch('/auth/me', data)).data,
};

export const catalogService = {
  list: (params, signal) => get('/games', { params, signal }),
  detail: (id, signal) => get('/games/' + id, { signal }),
};

export const personalService = {
  library: () => get('/library'),
  collections: () => get('/collections'),
  activity: () => get('/activity'),
  stats: () => get('/stats'),
  add: (igdbId) => api.post('/library', { igdbId: Number(igdbId) }),
  update: (id, data) => api.patch('/library/' + id, data),
  remove: (id) => api.delete('/library/' + id),
  createCollection: (data) => api.post('/collections', data),
  editCollection: (id, data) => api.patch('/collections/' + id, data),
  deleteCollection: (id) => api.delete('/collections/' + id),
  addToCollection: (id, game) => api.put('/collections/' + id + '/games/' + game),
  removeFromCollection: (id, game) => api.delete('/collections/' + id + '/games/' + game),
};
