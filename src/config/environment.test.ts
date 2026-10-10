// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import { loadEnv } from 'vite';
import { afterAll, afterEach, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { parseApiBaseUrl } from './apiBaseUrl';
// The repository's shared cleanup calls these browser APIs even in Node suites.
vi.stubGlobal('localStorage', { clear: () => undefined });
vi.stubGlobal('sessionStorage', { clear: () => undefined });
afterAll(() => vi.unstubAllGlobals());
const productionUrl = 'https://job-portal-lgjc.onrender.com/api';
const root = fileURLToPath(new URL('../..', import.meta.url));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it('uses the checked-in Render URL in production instead of the development localhost URL', () => {
  vi.stubEnv('VITE_API_BASE_URL', undefined);
  expect(readFileSync(new URL('../../.env.production', import.meta.url), 'utf8').trim()).toBe(
    `VITE_API_BASE_URL=${productionUrl}`,
  );
  expect(loadEnv('production', root, 'VITE_').VITE_API_BASE_URL).toBe(productionUrl);
});
it('honors a deployment environment override and rejects an override using localhost', () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://preview-api.example.com/api');
  expect(parseApiBaseUrl(loadEnv('production', root, 'VITE_').VITE_API_BASE_URL, true)).toBe(
    'https://preview-api.example.com/api',
  );
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5259/api');
  expect(() =>
    parseApiBaseUrl(loadEnv('production', root, 'VITE_').VITE_API_BASE_URL, true),
  ).toThrow(/localhost/);
});
it('passes the production URL into the existing runtime environment', async () => {
  vi.stubEnv('VITE_API_BASE_URL', productionUrl);
  vi.stubEnv('PROD', true);
  vi.resetModules();
  const { environment } = await import('./environment');
  expect(environment.apiBaseUrl).toBe(productionUrl);
  expect(environment.isProduction).toBe(true);
});
it.each([
  [API_ENDPOINTS.DASHBOARD.NOTIFICATIONS, '/api/dashboard/notifications'],
  [
    API_ENDPOINTS.DASHBOARD.NOTIFICATION_READ('notification-id'),
    '/api/dashboard/notifications/notification-id/read',
  ],
  [API_ENDPOINTS.DASHBOARD.NOTIFICATIONS_READ_ALL, '/api/dashboard/notifications/read-all'],
  [API_ENDPOINTS.AUTH.LOGIN, '/api/auth/login'],
  [API_ENDPOINTS.AUTH.REFRESH_TOKEN, '/api/auth/refresh'],
  [API_ENDPOINTS.ADMIN.JOBS_COMPOSE, '/api/admin/jobs/compose'],
])('resolves %s to the correct Render API endpoint', (endpoint, expected) => {
  expect(axios.getUri({ baseURL: parseApiBaseUrl(productionUrl, true), url: endpoint })).toBe(
    `https://job-portal-lgjc.onrender.com${expected}`,
  );
});
it.each([
  'http://localhost:5259/api',
  'https://localhost/api',
  'https://localhost./api',
  'https://service.localhost/api',
  'https://127.0.0.1/api',
  'https://127.1/api',
  'https://[::1]/api',
  'https://0.0.0.0/api',
  'http://job-portal-lgjc.onrender.com/api',
  'https://job-portal-lgjc.onrender.com',
  'https://job-portal-lgjc.onrender.com/api/api',
  'https://job-portal-lgjc.onrender.com/api?redirect=localhost',
  '',
  'not-a-url',
  'ftp://job-portal-lgjc.onrender.com/api',
])('rejects invalid production API configuration %s', (value) =>
  expect(() => parseApiBaseUrl(value, true)).toThrow(),
);
it('normalizes trailing slashes and preserves local development configuration', () => {
  expect(parseApiBaseUrl(` ${productionUrl}/ `, true)).toBe(productionUrl);
  expect(parseApiBaseUrl('http://localhost:5259/api', false)).toBe('http://localhost:5259/api');
});
