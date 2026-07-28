import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import {
  buildPaymentPath,
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

  it('builds a payment path with an encoded job return URL', () => {
    expect(buildPaymentPath('5aeb6d48-035e-4f58-aa6f-c222ffe27e97', 'frontend engineer')).toBe(
      '/payment?jobId=5aeb6d48-035e-4f58-aa6f-c222ffe27e97&returnTo=%2Fjobs%2Ffrontend%2520engineer',
    );
  });

  it('only accepts retry URLs for payment with a valid job identifier', () => {
    expect(
      getSafePaymentRetryPath(
        '/payment?jobId=5aeb6d48-035e-4f58-aa6f-c222ffe27e97&returnTo=%2Fjobs%2Ffrontend',
      ),
    ).toBe('/payment?jobId=5aeb6d48-035e-4f58-aa6f-c222ffe27e97&returnTo=%2Fjobs%2Ffrontend');
    expect(getSafePaymentRetryPath('/payment?jobId=bad&returnTo=/jobs/frontend')).toBe(ROUTES.JOBS);
  });
});
