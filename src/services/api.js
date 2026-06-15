const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/admin';

const TOKEN_KEY = 'swarama_admin_token';

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const adminAPI = {
  login: (email, password) =>
    apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  seed: () =>
    apiFetch('/seed', { method: 'POST' }),

  getStats: () => apiFetch('/stats'),

  getMechanics: (status, search) => {
    let url = `/mechanics?`;
    if (status && status !== 'all') url += `status=${status}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    return apiFetch(url);
  },

  getMechanicDetail: (id) => apiFetch(`/mechanics/${id}`),

  approveMechanic: (id) =>
    apiFetch(`/mechanics/${id}/approve`, { method: 'PATCH' }),

  rejectMechanic: (id) =>
    apiFetch(`/mechanics/${id}/reject`, { method: 'PATCH' }),

  blockMechanic: (id) =>
    apiFetch(`/mechanics/${id}/block`, { method: 'PATCH' }),

  getUsers: (search) =>
    apiFetch(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getBookings: (status, search) => {
    let url = `/bookings?`;
    if (status && status !== 'all') url += `status=${status}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    return apiFetch(url);
  },
  deleteBooking: (id) =>
    apiFetch(`/bookings/${id}`, { method: 'DELETE' }),
};
