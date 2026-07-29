import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import {
  buildMembershipPath,
  getSafeJobReturnPath,
  getSafePaymentRetryPath,
} from './paymentReturnUrl';

describe('payment return URL safety', () => {
  it('keeps local job URLs and preserves their query string', () => {
    expect(getSafeJobReturnPath('/jobs/frontend-engineer?source=featured')).toBe(
      '/jobs/frontend-engineer?source=featured',
    );
  });

  it.each([
    'https://evil.example/jobs/frontend',
    '//evil.example/jobs/frontend',
    '/admin/users',
    'javascript:alert(1)',
  ])('rejects unsafe or out-of-scope return URL %s', (value) => {
    expect(getSafeJobReturnPath(value)).toBe(ROUTES.JOBS);
  });

  it('builds a membership path with an encoded application return URL', () => {
    expect(buildMembershipPath('frontend engineer')).toBe(
      '/dashboard/membership?returnTo=%2Fjobs%2Ffrontend%2520engineer%3Fapply%3D1',
    );
  });

  it('normalizes membership retry URLs and rejects external routes', () => {
    expect(
      getSafePaymentRetryPath(
        '/dashboard/membership?paymentId=5aeb6d48-035e-4f58-aa6f-c222ffe27e97&returnTo=%2Fjobs%2Ffrontend%3Fapply%3D1',
      ),
    ).toBe('/dashboard/membership?returnTo=%2Fjobs%2Ffrontend%3Fapply%3D1');
    expect(getSafePaymentRetryPath('/admin?returnTo=/jobs/frontend')).toBe(ROUTES.JOBS);
  });
});
