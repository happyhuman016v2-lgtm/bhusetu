/**
 * BhuSetu Unified API Configuration
 *
 * Resolves API Base URL based on environment:
 * - In local dev (Vite proxy): '/api' -> forwarded to 'http://127.0.0.1:8000'
 * - In production Netlify with rewrite rules: '/api' -> forwarded to hosted backend (Render/Railway)
 * - In production with direct VITE_API_BASE_URL: e.g. 'https://bhusetu-backend.onrender.com/api'
 */

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE = getApiBaseUrl();
