import { beforeEach, describe, expect, it } from 'vitest';

import { applyRouteMetadataPolicy, setDocumentMetadata } from './documentMetadata';

const metaContent = (selector: string) =>
  document.querySelector<HTMLMetaElement>(selector)?.content;

describe('document metadata', () => {
  beforeEach(() => {
    document.head
      .querySelectorAll('meta[name], meta[property], link[rel="canonical"]')
      .forEach((element) => element.remove());
    document.title = '';
  });

  it('publishes canonical and social metadata for a public job', () => {
    setDocumentMetadata({
      canonicalPath: '/jobs/principal-engineer',
      description: 'Join Example as a principal engineer.',
      noIndex: false,
      title: 'Principal engineer at Example | Career Harbor',
    });

    expect(document.title).toBe('Principal engineer at Example | Career Harbor');
    expect(metaContent('meta[name="description"]')).toBe('Join Example as a principal engineer.');
    expect(metaContent('meta[property="og:title"]')).toBe(document.title);
    expect(metaContent('meta[property="og:site_name"]')).toBe('Career Harbor');
    expect(metaContent('meta[property="og:url"]')).toBe(
      'https://careerharbor.in/jobs/principal-engineer',
    );
    expect(metaContent('meta[name="twitter:card"]')).toBe('summary');
    expect(metaContent('meta[name="robots"]')).toContain('index');
    const canonicalHref = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    expect(canonicalHref && new URL(canonicalHref).pathname).toBe('/jobs/principal-engineer');
  });

  it.each(['/login', '/register', '/terms-of-use', '/privacy-policy'])(
    'allows indexing and publishes a production canonical for %s',
    (pathname) => {
      applyRouteMetadataPolicy(pathname);

      expect(metaContent('meta[name="robots"]')).toContain('index');
      expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
        `https://careerharbor.in${pathname}`,
      );
    },
  );

  it('removes canonical metadata and blocks indexing for private routes', () => {
    applyRouteMetadataPolicy('/jobs/principal-engineer');
    expect(document.querySelector('link[rel="canonical"]')).toBeInTheDocument();

    applyRouteMetadataPolicy('/dashboard/profile');

    expect(metaContent('meta[name="robots"]')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument();
    expect(document.querySelector('meta[property="og:url"]')).not.toBeInTheDocument();
  });
});
