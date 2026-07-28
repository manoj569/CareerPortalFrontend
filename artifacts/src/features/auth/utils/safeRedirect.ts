interface RequestedLocation {
  pathname?: unknown;
  search?: unknown;
  hash?: unknown;
}

const isSafePath = (path: string): boolean =>
  path.startsWith('/') && !path.startsWith('//') && !path.includes('://');

export const getSafeRedirectPath = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const location = value as RequestedLocation;
  if (typeof location.pathname !== 'string' || !isSafePath(location.pathname)) return null;

  const search =
    typeof location.search === 'string' && location.search.startsWith('?') ? location.search : '';
  const hash =
    typeof location.hash === 'string' && location.hash.startsWith('#') ? location.hash : '';

  return `${location.pathname}${search}${hash}`;
};
