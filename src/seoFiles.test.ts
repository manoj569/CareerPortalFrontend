import { describe, expect, it } from 'vitest';

import indexHtml from '../index.html?raw';
import robotsTxt from '../public/robots.txt?raw';
import sitemapXml from '../public/sitemap.xml?raw';

const publicRoutes = [
  'https://careerharbor.in/',
  'https://careerharbor.in/jobs',
  'https://careerharbor.in/login',
  'https://careerharbor.in/register',
  'https://careerharbor.in/terms-of-use',
  'https://careerharbor.in/privacy-policy',
];

describe('static search discovery files', () => {
  it('publishes the preferred homepage search and social metadata', () => {
    expect(indexHtml).toContain('<title>Career Harbor | Find Jobs and Build Your Career</title>');
    expect(indexHtml).toContain('<link rel="canonical" href="https://careerharbor.in/" />');
    expect(indexHtml).toContain('<meta property="og:site_name" content="Career Harbor" />');
    expect(indexHtml).toContain('<meta property="og:url" content="https://careerharbor.in/" />');
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary" />');
  });

  it('allows public crawling and advertises the production sitemap', () => {
    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
    expect(robotsTxt).toContain('Sitemap: https://careerharbor.in/sitemap.xml');
    expect(robotsTxt).not.toContain('Disallow: /login');
    expect(robotsTxt).not.toContain('Disallow: /register');
  });

  it('contains only the requested canonical public routes in valid XML', () => {
    const document = new DOMParser().parseFromString(sitemapXml, 'application/xml');
    expect(document.querySelector('parsererror')).toBeNull();
    expect(Array.from(document.querySelectorAll('loc'), (node) => node.textContent)).toEqual(
      publicRoutes,
    );
  });
});
