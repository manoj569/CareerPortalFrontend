const DEFAULT_TITLE = 'Career Portal';
const DEFAULT_DESCRIPTION =
  'Discover published career opportunities and manage your job search with Career Portal.';
const INDEXABLE_ROUTE = /^\/jobs(?:\/[^/]+)?\/?$/;

const getDefaultTitle = (pathname: string): string => {
  if (pathname === '/') return 'Career Portal | Find your next opportunity';
  if (pathname === '/jobs') return 'Find jobs | Career Portal';
  if (pathname.startsWith('/jobs/')) return 'Job details | Career Portal';
  if (pathname === '/login') return 'Log in | Career Portal';
  if (pathname === '/register') return 'Create an account | Career Portal';
  if (pathname.includes('password')) return 'Account recovery | Career Portal';
  if (pathname.startsWith('/dashboard')) return 'Candidate dashboard | Career Portal';
  if (pathname.startsWith('/admin')) return 'Administration | Career Portal';
  if (pathname.startsWith('/payment')) return 'Payment | Career Portal';
  if (pathname === '/unauthorized') return 'Unauthorized | Career Portal';
  return 'Page not found | Career Portal';
};

const ensureMeta = (attribute: 'name' | 'property', key: string): HTMLMetaElement => {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  return element;
};

const setMeta = (attribute: 'name' | 'property', key: string, content: string): void => {
  ensureMeta(attribute, key).content = content;
};

const setCanonical = (path: string | null): void => {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (path === null) {
    existing?.remove();
    return;
  }

  const canonical = existing ?? document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = new URL(path, window.location.origin).toString();
  if (!existing) document.head.appendChild(canonical);
};

interface DocumentMetadata {
  canonicalPath?: string | null;
  description: string;
  noIndex?: boolean;
  title: string;
}

export const setDocumentMetadata = ({
  canonicalPath,
  description,
  noIndex,
  title,
}: DocumentMetadata): void => {
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:type', 'website');
  setMeta('name', 'twitter:card', 'summary');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);

  if (noIndex !== undefined) {
    setMeta(
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );
  }
  if (canonicalPath !== undefined) setCanonical(canonicalPath);
};

export const applyRouteMetadataPolicy = (pathname: string): void => {
  const isIndexable = pathname === '/' || INDEXABLE_ROUTE.test(pathname);
  setDocumentMetadata({
    canonicalPath: isIndexable ? pathname : null,
    description: DEFAULT_DESCRIPTION,
    noIndex: !isIndexable,
    title: getDefaultTitle(pathname) || DEFAULT_TITLE,
  });
};
