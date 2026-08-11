const SITE_URL = 'https://careerharbor.in';
const DEFAULT_TITLE = 'Career Harbor';
const DEFAULT_DESCRIPTION =
  'Discover verified job opportunities and manage your job search with Career Harbor.';
const INDEXABLE_ROUTE = /^\/jobs(?:\/[^/]+)?\/?$/;
const INDEXABLE_STATIC_ROUTES = new Set([
  '/',
  '/login',
  '/privacy-policy',
  '/register',
  '/terms-of-use',
]);

const getDefaultTitle = (pathname: string): string => {
  if (pathname === '/') return 'Career Harbor | Find Jobs and Build Your Career';
  if (pathname === '/jobs') return 'Find Jobs | Career Harbor';
  if (pathname.startsWith('/jobs/')) return 'Job Details | Career Harbor';
  if (pathname === '/login') return 'Log in | Career Harbor';
  if (pathname === '/register') return 'Create an Account | Career Harbor';
  if (pathname === '/terms-of-use') return 'Terms of Use | Career Harbor';
  if (pathname === '/privacy-policy') return 'Privacy Policy | Career Harbor';
  if (pathname.includes('password')) return 'Account Recovery | Career Harbor';
  if (pathname.startsWith('/dashboard')) return 'Candidate Dashboard | Career Harbor';
  if (pathname.startsWith('/admin')) return 'Administration | Career Harbor';
  if (pathname.startsWith('/payment')) return 'Payment | Career Harbor';
  if (pathname === '/unauthorized') return 'Unauthorized | Career Harbor';
  return 'Page Not Found | Career Harbor';
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

const removeMeta = (attribute: 'name' | 'property', key: string): void => {
  document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.remove();
};

const setCanonical = (path: string | null): void => {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (path === null) {
    existing?.remove();
    return;
  }

  const canonical = existing ?? document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = new URL(path, SITE_URL).toString();
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
  setMeta('property', 'og:site_name', 'Career Harbor');
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
  if (canonicalPath !== undefined) {
    setCanonical(canonicalPath);
    if (canonicalPath === null) {
      removeMeta('property', 'og:url');
    } else {
      setMeta('property', 'og:url', new URL(canonicalPath, SITE_URL).toString());
    }
  }
};

export const applyRouteMetadataPolicy = (pathname: string): void => {
  const normalizedPath = pathname !== '/' ? pathname.replace(/\/$/, '') : pathname;
  const isIndexable = INDEXABLE_STATIC_ROUTES.has(normalizedPath) || INDEXABLE_ROUTE.test(pathname);
  setDocumentMetadata({
    canonicalPath: isIndexable ? pathname : null,
    description: DEFAULT_DESCRIPTION,
    noIndex: !isIndexable,
    title: getDefaultTitle(pathname) || DEFAULT_TITLE,
  });
};
