const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const localHostnames = new Set(['127.0.0.1', '::1', 'localhost']);

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured.');
}

const parseApiBaseUrl = (value: string): string => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid absolute URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.');
  }

  if (import.meta.env.PROD && (url.protocol !== 'https:' || localHostnames.has(url.hostname))) {
    throw new Error('Production VITE_API_BASE_URL must use HTTPS and a non-local hostname.');
  }

  return url.toString().replace(/\/+$/, '');
};

export const environment = Object.freeze({
  apiBaseUrl: parseApiBaseUrl(apiBaseUrl),
  apiTimeoutMs: parsePositiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, 30_000),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});
