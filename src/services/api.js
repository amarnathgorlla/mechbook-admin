const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/admin';

const TOKEN_KEY = 'swarama_admin_token';

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    // Decode base64url payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && endpoint !== '/login') {
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

  getFeedback: (senderType, search) => {
    let url = `/feedback?`;
    if (senderType && senderType !== 'all') url += `senderType=${senderType}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    return apiFetch(url);
  },
};
