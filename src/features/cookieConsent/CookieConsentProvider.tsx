import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { CookieConsentBanner } from './CookieConsentBanner';
import { CookieConsentContext, type CookieConsentContextValue } from './CookieConsentContext';
import {
  applyCookieConsentToIntegrations,
  useActiveConsentCategories,
} from './cookieConsentIntegrations';
import {
  createCookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
} from './cookieConsentStorage';
import { deniedCookieConsent, type CookieConsentSelection } from './cookieConsentTypes';
import { CookiePreferencesDialog } from './CookiePreferencesDialog';

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(() => {
    const savedConsent = readCookieConsent();
    return { savedConsent, isBannerOpen: savedConsent === null };
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const activeOptionalCategories = useActiveConsentCategories();
  const { isBannerOpen, savedConsent } = state;
  const consent = savedConsent ?? deniedCookieConsent;

  useEffect(() => {
    applyCookieConsentToIntegrations(consent);
  }, [consent]);

  const persist = useCallback((selection: CookieConsentSelection) => {
    const record = createCookieConsentRecord(selection);
    writeCookieConsent(record);
    setState({ savedConsent: record, isBannerOpen: false });
    setIsPreferencesOpen(false);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      activeOptionalCategories,
      hasSavedChoice: savedConsent !== null,
      isBannerOpen,
      isPreferencesOpen,
      acceptAll: () => persist({ analytics: activeOptionalCategories.includes('analytics') }),
      continueWithNecessary: () => persist({ analytics: false }),
      rejectAll: () => persist({ analytics: false }),
      savePreferences: persist,
      openPreferences: () => setIsPreferencesOpen(true),
      closePreferences: () => setIsPreferencesOpen(false),
    }),
    [activeOptionalCategories, consent, isBannerOpen, isPreferencesOpen, persist, savedConsent],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <CookieConsentBanner />
      <CookiePreferencesDialog />
    </CookieConsentContext.Provider>
  );
};
