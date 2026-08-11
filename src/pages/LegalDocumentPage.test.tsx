import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import { PrivacyPolicyPage, TermsOfUsePage } from './LegalDocumentPage';

const legalMocks = vi.hoisted(() => ({
  getPrivacyPolicy: vi.fn(),
  getTermsOfUse: vi.fn(),
}));

vi.mock('@/features/legal/services/legalService', () => ({
  legalService: legalMocks,
}));

const renderPage = (page: React.ReactNode) =>
  renderWithProviders(<MemoryRouter>{page}</MemoryRouter>);

describe('static legal document pages', () => {
  it('renders the original Terms of Use independently without an API request', () => {
    renderPage(<TermsOfUsePage />);

    expect(screen.getByRole('heading', { name: 'Terms of Use' })).toBeVisible();
    expect(screen.getByText('Last updated: 9 August 2026')).toBeVisible();
    expect(screen.getByRole('heading', { name: '1. Purpose of Career Harbor' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '7. Prohibited conduct' })).toBeVisible();
    expect(screen.queryByText(/Information we collect/)).toBeNull();
    expect(screen.getByRole('link', { name: 'Back to registration' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(legalMocks.getTermsOfUse).not.toHaveBeenCalled();
    expect(legalMocks.getPrivacyPolicy).not.toHaveBeenCalled();
    expect(document.title).toBe('Terms of Use | Career Harbor');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://careerharbor.in/terms-of-use',
    );
  });

  it('renders the original Privacy Policy independently with different content', () => {
    renderPage(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '1. Information we collect' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '4. Resume privacy' })).toBeVisible();
    expect(screen.queryByText(/Purpose of Career Harbor/)).toBeNull();
    expect(legalMocks.getTermsOfUse).not.toHaveBeenCalled();
    expect(legalMocks.getPrivacyPolicy).not.toHaveBeenCalled();
    expect(document.title).toBe('Privacy Policy | Career Harbor');
  });

  it('provides separate in-page tables of contents', () => {
    renderPage(<TermsOfUsePage />);
    expect(
      screen.getByRole('navigation', { name: 'Terms of Use table of contents' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Acceptable use' })).toHaveAttribute(
      'href',
      '#acceptable-use',
    );
  });
});
