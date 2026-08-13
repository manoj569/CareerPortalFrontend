import { describe, expect, it } from 'vitest';

import {
  COOKIE_CONSENT_STORAGE_KEY,
  createCookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
} from './cookieConsentStorage';
import { COOKIE_CONSENT_LIFETIME_DAYS } from './cookieConsentTypes';

describe('cookieConsentStorage', () => {
  const now = new Date('2026-08-13T10:00:00.000Z');

  it('round-trips a valid versioned consent record', () => {
    const record = createCookieConsentRecord({ analytics: true }, now);
    expect(writeCookieConsent(record)).toBe(true);
    expect(readCookieConsent(now.getTime())).toEqual(record);
  });

  it.each([
    ['malformed JSON', '{not-json'],
    [
      'an old version',
      JSON.stringify({
        ...createCookieConsentRecord({ analytics: false }, now),
        version: 0,
      }),
    ],
    [
      'an expired record',
      JSON.stringify(
        createCookieConsentRecord(
          { analytics: false },
          new Date(now.getTime() - (COOKIE_CONSENT_LIFETIME_DAYS + 1) * 86_400_000),
        ),
      ),
    ],
  ])('rejects %s and removes it', (_label, storedValue) => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, storedValue);
    expect(readCookieConsent(now.getTime())).toBeNull();
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull();
  });
});
