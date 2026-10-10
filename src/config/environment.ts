import { parseApiBaseUrl } from './apiBaseUrl';

export const environment = Object.freeze({
  apiBaseUrl: parseApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.PROD),
  apiTimeoutMs: 30_000,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});
