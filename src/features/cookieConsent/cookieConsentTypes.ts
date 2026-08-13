export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_LIFETIME_DAYS = 180;

export interface CookieConsentRecord {
  version: number;
  necessary: true;
  analytics: boolean;
  personalization: false;
  advertising: false;
  updatedAtUtc: string;
}

export interface CookieConsentSelection {
  analytics: boolean;
}

export type OptionalConsentCategory = 'analytics';

export const deniedCookieConsent: CookieConsentRecord = {
  version: COOKIE_CONSENT_VERSION,
  necessary: true,
  analytics: false,
  personalization: false,
  advertising: false,
  updatedAtUtc: '',
};
