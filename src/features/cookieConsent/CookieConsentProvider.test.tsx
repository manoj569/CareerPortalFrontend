import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import { CookieConsentProvider } from './CookieConsentProvider';
import { CookieSettingsButton } from './CookieSettingsButton';
import {
  registerConsentAwareIntegration,
  resetConsentIntegrationsForTests,
} from './cookieConsentIntegrations';
import { COOKIE_CONSENT_STORAGE_KEY, createCookieConsentRecord } from './cookieConsentStorage';
import { COOKIE_CONSENT_LIFETIME_DAYS } from './cookieConsentTypes';

const RouteChanger = () => {
  const navigate = useNavigate();
  return <button onClick={() => void navigate('/jobs')}>Change route</button>;
};

const renderConsent = (children = <CookieSettingsButton />) =>
  renderWithProviders(
    <MemoryRouter>
      <CookieConsentProvider>{children}</CookieConsentProvider>
    </MemoryRouter>,
  );

const readStoredConsent = () =>
  JSON.parse(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? 'null') as {
    necessary: boolean;
    analytics: boolean;
  } | null;

describe('CookieConsentProvider', () => {
  beforeEach(() => resetConsentIntegrationsForTests());

  it('shows the accurate necessary-only banner and both legal links on first visit', () => {
    renderConsent();
    const banner = screen.getByTestId('cookie-consent-banner');
    expect(banner).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Your privacy choices' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy-policy',
    );
    expect(screen.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute(
      'href',
      '/cookie-policy',
    );
    expect(
      screen.getByText(
        'Career Harbor uses essential browser storage for secure login, registration verification and remembering your privacy preferences. See our Privacy Policy and Cookie Policy for details.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage preferences' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Reject all' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept all' })).not.toBeInTheDocument();
  });

  it('continues with necessary storage only and never alters authentication storage', async () => {
    sessionStorage.setItem('careerPortal.refreshToken', 'necessary-refresh-token');
    renderConsent();
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(readStoredConsent()).toMatchObject({ analytics: false, necessary: true });
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBe('necessary-refresh-token');
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
  });

  it('accepts all supported optional categories, persists, and initializes analytics afterward', async () => {
    const enable = vi.fn();
    const disable = vi.fn();
    registerConsentAwareIntegration({ category: 'analytics', disable, enable });
    renderConsent();

    expect(enable).not.toHaveBeenCalled();
    expect(disable).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Accept all' }));

    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    expect(readStoredConsent()).toMatchObject({ analytics: true, necessary: true });
    await waitFor(() => expect(enable).toHaveBeenCalledTimes(1));
  });

  it('offers rejection when a real optional integration is active without touching authentication storage', async () => {
    sessionStorage.setItem('careerPortal.refreshToken', 'necessary-refresh-token');
    registerConsentAwareIntegration({ category: 'analytics', disable: vi.fn(), enable: vi.fn() });
    renderConsent();
    await userEvent.click(screen.getByRole('button', { name: 'Reject all' }));

    expect(readStoredConsent()).toMatchObject({ analytics: false, necessary: true });
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBe('necessary-refresh-token');
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
  });

  it('shows only necessary information in preferences when no optional integration is active', async () => {
    renderConsent();
    await userEvent.click(screen.getByRole('button', { name: 'Manage preferences' }));

    const dialog = screen.getByRole('dialog', { name: 'Cookie preferences' });
    expect(dialog).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Strictly necessary' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Strictly necessary' })).toBeDisabled();
    expect(screen.queryByRole('switch', { name: 'Analytics' })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'No analytics, advertising, or personalization technology is currently active.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Read the Cookie Policy' })).toHaveAttribute(
      'href',
      '/cookie-policy',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(readStoredConsent()).toMatchObject({ analytics: false, necessary: true });
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Cookie preferences' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('derives the Analytics preference from a currently registered integration', async () => {
    registerConsentAwareIntegration({ category: 'analytics', disable: vi.fn(), enable: vi.fn() });
    renderConsent();
    await userEvent.click(screen.getByRole('button', { name: 'Manage preferences' }));
    expect(screen.getByRole('switch', { name: 'Analytics' })).not.toBeChecked();

    await userEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(readStoredConsent()).toMatchObject({ analytics: true, necessary: true });
  });

  it('closes customization with Escape without accepting and leaves the first-visit banner open', async () => {
    renderConsent();
    await userEvent.click(screen.getByRole('button', { name: 'Manage preferences' }));
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Cookie preferences' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId('cookie-consent-banner')).toBeVisible();
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull();
  });

  it('respects a valid saved choice across reload and route changes', async () => {
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(createCookieConsentRecord({ analytics: false })),
    );
    const view = renderConsent(<RouteChanger />);
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Change route' }));
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    view.unmount();

    renderConsent();
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
  });

  it.each([
    ['malformed', '{invalid-json'],
    [
      'old-version',
      JSON.stringify({ ...createCookieConsentRecord({ analytics: false }), version: 0 }),
    ],
    [
      'expired',
      JSON.stringify(
        createCookieConsentRecord(
          { analytics: false },
          new Date(Date.now() - (COOKIE_CONSENT_LIFETIME_DAYS + 1) * 86_400_000),
        ),
      ),
    ],
  ])('prompts again for a %s stored preference', (_label, value) => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    renderConsent();
    expect(screen.getByTestId('cookie-consent-banner')).toBeVisible();
  });

  it('reopens settings and applies withdrawal immediately', async () => {
    const enable = vi.fn();
    const disable = vi.fn();
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(createCookieConsentRecord({ analytics: true })),
    );
    registerConsentAwareIntegration({ category: 'analytics', disable, enable });
    renderConsent();
    await waitFor(() => expect(enable).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'Cookie settings' }));
    await userEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(readStoredConsent()).toMatchObject({ analytics: false, necessary: true });
    await waitFor(() => expect(disable).toHaveBeenCalled());
  });
});
