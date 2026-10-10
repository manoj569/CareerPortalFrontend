/** Shared by the browser configuration and Vite's production build check. */
export const parseApiBaseUrl = (value: string | undefined, production: boolean): string => {
  if (!value?.trim()) throw new Error('VITE_API_BASE_URL must be configured.');
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid absolute URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.');
  }
  if (production) {
    const hostname = url.hostname
      .replace(/^\[|\]$/g, '')
      .replace(/\.$/, '')
      .toLowerCase();
    const loopback =
      ['localhost', '::1', '::', '0.0.0.0'].includes(hostname) ||
      hostname.endsWith('.localhost') ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname);
    if (loopback)
      throw new Error('Production VITE_API_BASE_URL must not use localhost or a loopback address.');
    if (url.protocol !== 'https:') throw new Error('Production VITE_API_BASE_URL must use HTTPS.');
    if (
      url.pathname.replace(/\/+$/, '') !== '/api' ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    ) {
      throw new Error(
        'Production VITE_API_BASE_URL must end with /api without credentials, a query, or a fragment.',
      );
    }
  }
  return url.toString().replace(/\/+$/, '');
};
