export interface SafeRedirectLocation {
  pathname: string;
  search?: string;
  hash?: string;
}

interface RequestedLocation {
  pathname?: unknown;
  search?: unknown;
  hash?: unknown;
}

const isSafePath = (path: string): boolean =>
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('://') &&
  !/(?:^|\/)[a-z][a-z\d+.-]*:/i.test(path) &&
  !path.includes('\\') &&
  !path.includes('?') &&
  !path.includes('#');

export const getSafeRedirectLocation = (value: unknown): SafeRedirectLocation | null => {
  if (!value || typeof value !== 'object') return null;

  const location = value as RequestedLocation;
  if (typeof location.pathname !== 'string' || !isSafePath(location.pathname)) return null;
  if (location.search !== undefined && (typeof location.search !== 'string' || !location.search.startsWith('?'))) {
    return null;
  }
  if (location.hash !== undefined && (typeof location.hash !== 'string' || !location.hash.startsWith('#'))) {
    return null;
  }

  return {
    pathname: location.pathname,
    ...(location.search ? { search: location.search } : {}),
    ...(location.hash ? { hash: location.hash } : {}),
  };
};

export const getSafeRedirectPath = (value: unknown): string | null => {
  const location = getSafeRedirectLocation(value);
  return location ? `${location.pathname}${location.search ?? ''}${location.hash ?? ''}` : null;
};
