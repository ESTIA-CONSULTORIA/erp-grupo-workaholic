import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar token JWT automáticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('erp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirigir al login si el token expira
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Helpers de formato ────────────────────────────────────────
export const fmt = (n: number | null | undefined) =>
  new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' }).format(n || 0);

export const fmtPct = (n: number | null | undefined) =>
  `${((n || 0) * 100).toFixed(1)}%`;

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });

export const mesActual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};
