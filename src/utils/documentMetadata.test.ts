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
      title: 'Principal engineer at Example | Career Portal',
    });

    expect(document.title).toBe('Principal engineer at Example | Career Portal');
    expect(metaContent('meta[name="description"]')).toBe('Join Example as a principal engineer.');
    expect(metaContent('meta[property="og:title"]')).toBe(document.title);
    expect(metaContent('meta[name="twitter:card"]')).toBe('summary');
    expect(metaContent('meta[name="robots"]')).toContain('index');
    const canonicalHref = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    expect(canonicalHref && new URL(canonicalHref).pathname).toBe('/jobs/principal-engineer');
  });

  it('removes canonical metadata and blocks indexing for private routes', () => {
    applyRouteMetadataPolicy('/jobs/principal-engineer');
    expect(document.querySelector('link[rel="canonical"]')).toBeInTheDocument();

    applyRouteMetadataPolicy('/dashboard/profile');

    expect(metaContent('meta[name="robots"]')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument();
  });
});
