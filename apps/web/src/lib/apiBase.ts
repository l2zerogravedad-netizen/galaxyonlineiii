import axios from 'axios';

/**
 * API Railway — los rewrites /api no aplican en Next standalone en producción.
 * Misma URL para web, desktop y móvil.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://galaxyonlineiii-production.up.railway.app';

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

if (typeof window !== 'undefined') {
  axios.defaults.baseURL = API_BASE_URL;
}
