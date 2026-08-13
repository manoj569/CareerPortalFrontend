import { useSyncExternalStore } from 'react';

import {
  deniedCookieConsent,
  type CookieConsentRecord,
  type OptionalConsentCategory,
} from './cookieConsentTypes';

interface ConsentAwareIntegration {
  category: OptionalConsentCategory;
  enable: () => void;
  disable: () => void;
}

const integrations = new Set<ConsentAwareIntegration>();
const listeners = new Set<() => void>();
let activeConsent: CookieConsentRecord = deniedCookieConsent;

const applyIntegration = (integration: ConsentAwareIntegration) => {
  if (activeConsent[integration.category]) integration.enable();
  else integration.disable();
};

/**
 * Future analytics code must register here instead of initializing at module load.
 * No analytics integration is currently configured in Career Harbor.
 */
export const registerConsentAwareIntegration = (integration: ConsentAwareIntegration) => {
  integrations.add(integration);
  applyIntegration(integration);
  listeners.forEach((listener) => listener());
  return () => {
    integrations.delete(integration);
    listeners.forEach((listener) => listener());
  };
};

export const applyCookieConsentToIntegrations = (consent: CookieConsentRecord) => {
  activeConsent = consent;
  integrations.forEach(applyIntegration);
};

export const getConsentForIntegrations = (): CookieConsentRecord => activeConsent;

const hasActiveIntegration = (category: OptionalConsentCategory): boolean =>
  Array.from(integrations).some((integration) => integration.category === category);

const subscribeToIntegrations = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useActiveConsentCategories = (): OptionalConsentCategory[] => {
  const hasAnalytics = useSyncExternalStore(
    subscribeToIntegrations,
    () => hasActiveIntegration('analytics'),
    () => false,
  );
  return hasAnalytics ? ['analytics'] : [];
};

export const resetConsentIntegrationsForTests = () => {
  integrations.clear();
  listeners.forEach((listener) => listener());
  activeConsent = deniedCookieConsent;
};
