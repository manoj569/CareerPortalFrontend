import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Vercel document security headers', () => {
  it('allows Google OAuth popups while preserving the SPA rewrite configuration', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
      headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
      rewrites: Array<{ source: string; destination: string }>;
    };
    expect(config.headers).toContainEqual({
      source: '/(.*)',
      headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }],
    });
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });
});
