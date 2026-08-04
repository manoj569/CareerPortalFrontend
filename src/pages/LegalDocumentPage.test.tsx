import { legalService } from '@/features/legal/services/legalService';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivacyPolicyPage, TermsOfUsePage } from './LegalDocumentPage';

vi.mock('@/features/legal/services/legalService', () => ({
  legalService: {
    getPrivacyPolicy: vi.fn(),
    getTermsOfUse: vi.fn(),
  },
}));

const mockedLegalService = vi.mocked(legalService);
const document = {
  content: 'Use Career Portal lawfully.\nKeep your credentials secure.',
  contentType: 'text/plain',
  effectiveDate: '2026-08-01',
  title: 'Terms of Use',
  version: '2026-08-01',
};

describe('legal document pages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders terms content and metadata as safe text', async () => {
    mockedLegalService.getTermsOfUse.mockResolvedValue(document);
    renderWithProviders(
      <MemoryRouter>
        <TermsOfUsePage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Terms of Use' })).toBeVisible();
    expect(screen.getByText(/Use Career Portal lawfully/)).toBeVisible();
    expect(screen.getByText(/Version 2026-08-01/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to Register' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('renders the privacy policy endpoint response', async () => {
    mockedLegalService.getPrivacyPolicy.mockResolvedValue({
      ...document,
      content: 'Passwords and one-time passwords are never stored in plain text.',
      title: 'Privacy Policy',
    });
    renderWithProviders(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    expect(screen.getByText(/never stored in plain text/i)).toBeVisible();
  });

  it('shows an error state and retries', async () => {
    mockedLegalService.getTermsOfUse
      .mockRejectedValueOnce(new Error('Network detail'))
      .mockResolvedValueOnce(document);
    renderWithProviders(
      <MemoryRouter>
        <TermsOfUsePage />
      </MemoryRouter>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Terms of Use' })).toBeVisible();
    expect(mockedLegalService.getTermsOfUse.mock.calls).toHaveLength(2);
  });

  it('shows an empty state for missing content', async () => {
    mockedLegalService.getTermsOfUse.mockResolvedValue({ ...document, content: '  ' });
    renderWithProviders(
      <MemoryRouter>
        <TermsOfUsePage />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Terms of Use unavailable')).toBeVisible();
  });
});
