import { describe, expect, it } from 'vitest';

import { getSafeRedirectLocation, getSafeRedirectPath } from './safeRedirect';

describe('safe redirect handling', () => {
  it('accepts internal application locations with supported search and hash values', () => {
    const input = { hash: '#section', pathname: '/dashboard/portfolio', search: '?tab=preview' };
    expect(getSafeRedirectLocation(input)).toEqual(input);
    expect(getSafeRedirectPath(input)).toBe('/dashboard/portfolio?tab=preview#section');
  });

  it.each([
    undefined,
    null,
    'https://evil.example',
    { pathname: '//evil.example' },
    { pathname: 'https://evil.example' },
    { pathname: '/https://evil.example' },
    { pathname: '/javascript:alert(1)' },
    { pathname: '/dashboard\\portfolio' },
    { pathname: '/dashboard/portfolio', search: 'tab=preview' },
    { pathname: '/dashboard/portfolio', hash: 'section' },
    { pathname: 42 },
  ])('rejects malformed, absolute, protocol-relative, and unsupported destination state: %j', (value) => {
    expect(getSafeRedirectLocation(value)).toBeNull();
    expect(getSafeRedirectPath(value)).toBeNull();
  });
});
