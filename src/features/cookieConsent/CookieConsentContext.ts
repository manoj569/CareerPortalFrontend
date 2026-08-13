import { createContext, useContext } from 'react';

import type {
  CookieConsentRecord,
  CookieConsentSelection,
  OptionalConsentCategory,
} from './cookieConsentTypes';

export interface CookieConsentContextValue {
  consent: CookieConsentRecord;
  hasSavedChoice: boolean;
  isBannerOpen: boolean;
  isPreferencesOpen: boolean;
  activeOptionalCategories: OptionalConsentCategory[];
  continueWithNecessary: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (selection: CookieConsentSelection) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export const useOptionalCookieConsent = (): CookieConsentContextValue | null =>
  useContext(CookieConsentContext);

export const useCookieConsent = (): CookieConsentContextValue => {
  const context = useOptionalCookieConsent();
  if (!context) throw new Error('useCookieConsent must be used within CookieConsentProvider.');
  return context;
};
