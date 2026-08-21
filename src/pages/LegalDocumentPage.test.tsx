import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import {
  CookiePolicyPage,
  GrievanceRedressalPolicyPage,
  PrivacyPolicyPage,
  RefundAndCancellationPolicyPage,
  TermsOfUsePage,
} from './LegalDocumentPage';
import { AboutUsPage, ContactUsPage, MembershipPricingPage } from './PublicInformationPages';

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
    expect(screen.getByText('Last updated: 21 August 2026')).toBeVisible();
    expect(screen.getByText('Career Harbor is operated by NEXORA TECHNOLOGIES.')).toBeVisible();
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
    expect(screen.getByRole('heading', { name: '8. Payments' })).toBeVisible();
    expect(
      screen.getByText(/does not collect or store card numbers, CVV, UPI PINs/i),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Razorpay Privacy Policy/ })).toHaveAttribute(
      'href',
      'https://razorpay.com/privacy-policy/',
    );
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

  it('renders the Cookie Policy independently with the actual browser-storage inventory', () => {
    renderPage(<CookiePolicyPage />);

    expect(screen.getByRole('heading', { name: 'Cookie Policy' })).toBeVisible();
    expect(screen.getByText(/careerPortal\.refreshTokenExpiresAtUtc/)).toBeVisible();
    expect(screen.getByText(/careerPortal\.registrationChallenge/)).toBeVisible();
    expect(screen.getByText(/careerharbor_cookie_consent/)).toBeVisible();
    expect(screen.getByText(/No analytics, advertising, remarketing/)).toBeVisible();
    expect(
      screen.getByText(
        /Google Identity Services is available only on the Login and Register pages/,
      ),
    ).toBeVisible();
    expect(screen.getByText(/does not store that Google credential/)).toBeVisible();
    expect(screen.getByText(/never logs you out/)).toBeVisible();
    expect(document.title).toBe('Cookie Policy | Career Harbor');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://careerharbor.in/cookie-policy',
    );
  });

  it('publishes the confirmed membership price, duration, renewal, and disclaimer', () => {
    renderPage(<MembershipPricingPage />);

    expect(screen.getByRole('heading', { name: 'Career Harbor Membership' })).toBeVisible();
    expect(screen.getByText('₹99')).toBeVisible();
    expect(screen.getByText(/Valid for 30 days from successful payment/)).toBeVisible();
    expect(screen.getByText(/No auto-renewal or recurring billing at launch/)).toBeVisible();
    expect(screen.getByText(/does not guarantee a job listing, recruiter response/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Refund and Cancellation Policy' })).toHaveAttribute(
      'href',
      '/refund-and-cancellation-policy',
    );
  });

  it('renders refund rules and links to contact and grievance escalation', () => {
    renderPage(<RefundAndCancellationPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Refund and Cancellation Policy' })).toBeVisible();
    expect(screen.getByText(/Effective date: 21 August 2026/)).toBeVisible();
    expect(screen.getByText(/duplicate successful charge/)).toBeVisible();
    expect(screen.getByText(/within 5–7 business days after approval/)).toBeVisible();
    expect(
      screen.getByText(/Refunds are not automatic and remain subject to verification/),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact-us');
    expect(screen.getByRole('link', { name: 'Grievance Redressal Policy' })).toHaveAttribute(
      'href',
      '/grievance-redressal-policy',
    );
  });

  it('renders the approved grievance officer, contact details, and timelines', () => {
    renderPage(<GrievanceRedressalPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Grievance Redressal Policy' })).toBeVisible();
    expect(screen.getByText(/account access, membership payments, refunds, privacy/)).toBeVisible();
    expect(screen.getByText(/within 2 business days/)).toBeVisible();
    expect(screen.getByText(/within 15 business days/)).toBeVisible();
    expect(screen.getByText(/Manoj Shivaji Shekapure/)).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: 'Email the Grievance Officer at grievance@careerharbor.in',
      }),
    ).toHaveAttribute('href', 'mailto:grievance@careerharbor.in');
    expect(screen.getByRole('link', { name: '+91 80808 75878' })).toHaveAttribute(
      'href',
      'tel:+918080875878',
    );
  });

  it('renders public About and Contact pages with payment support and policy links', () => {
    const { unmount } = renderPage(<AboutUsPage />);
    expect(screen.getByRole('heading', { name: 'About Us' })).toBeVisible();
    expect(screen.getByText(/online career and employment platform/)).toBeVisible();
    expect(screen.getByText('27GKZPS1273Q1ZR')).toBeVisible();
    expect(screen.getByText(/GROUND, GUT NO-52\/2/)).toBeVisible();
    unmount();

    renderPage(<ContactUsPage />);
    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    expect(screen.getByText('Business and support details')).toBeVisible();
    expect(screen.getByRole('link', { name: 'support@careerharbor.in' })).toHaveAttribute(
      'href',
      'mailto:support@careerharbor.in',
    );
    expect(screen.getByRole('link', { name: '+91 80808 75878' })).toHaveAttribute(
      'href',
      'tel:+918080875878',
    );
    expect(screen.getByRole('link', { name: 'Email support' })).toHaveAttribute(
      'href',
      'mailto:support@careerharbor.in?subject=Career%20Harbor%20support%20request',
    );
    expect(screen.getByText(/does not collect or submit contact-form data/)).toBeVisible();
    expect(screen.getByRole('link', { name: /Privacy: privacy@careerharbor\.in/ })).toHaveAttribute(
      'href',
      'mailto:privacy@careerharbor.in',
    );
    expect(screen.queryByText(/Configuration required|not configured/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Refund and Cancellation Policy' })).toHaveAttribute(
      'href',
      '/refund-and-cancellation-policy',
    );
    expect(screen.getByRole('link', { name: 'Grievance Redressal Policy' })).toHaveAttribute(
      'href',
      '/grievance-redressal-policy',
    );
  });
});
