import {
  COOKIE_CONSENT_LIFETIME_DAYS,
  COOKIE_CONSENT_VERSION,
  type CookieConsentRecord,
  type CookieConsentSelection,
} from './cookieConsentTypes';

export const COOKIE_CONSENT_STORAGE_KEY = 'careerharbor_cookie_consent';

const CONSENT_LIFETIME_MS = COOKIE_CONSENT_LIFETIME_DAYS * 24 * 60 * 60 * 1_000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1_000;

const isConsentRecord = (value: unknown, now: number): value is CookieConsentRecord => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<CookieConsentRecord>;
  const updatedAt =
    typeof candidate.updatedAtUtc === 'string' ? Date.parse(candidate.updatedAtUtc) : Number.NaN;

  return (
    candidate.version === COOKIE_CONSENT_VERSION &&
    candidate.necessary === true &&
    typeof candidate.analytics === 'boolean' &&
    candidate.personalization === false &&
    candidate.advertising === false &&
    Number.isFinite(updatedAt) &&
    updatedAt <= now + MAX_CLOCK_SKEW_MS &&
    now - updatedAt < CONSENT_LIFETIME_MS
  );
};

export const createCookieConsentRecord = (
  selection: CookieConsentSelection,
  now = new Date(),
): CookieConsentRecord => ({
  version: COOKIE_CONSENT_VERSION,
  necessary: true,
  analytics: selection.analytics,
  personalization: false,
  advertising: false,
  updatedAtUtc: now.toISOString(),
});

export const readCookieConsent = (now = Date.now()): CookieConsentRecord | null => {
  try {
    const serialized = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!serialized) return null;

    const parsed: unknown = JSON.parse(serialized);
    if (isConsentRecord(parsed, now)) return parsed;
  } catch {
    // Storage can be unavailable or contain malformed data; either case requires a new choice.
  }

  try {
    localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch {
    // The banner still works in memory when browser storage is unavailable.
  }
  return null;
};

export const writeCookieConsent = (record: CookieConsentRecord): boolean => {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
};
