import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { environment } from '@/config/environment';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PromotedJobCard } from './PromotedJobCard';
import { resolveApiAssetUrl } from './assetUrl';
import type { ActiveJobPromotion } from './types';

const promotion: ActiveJobPromotion = {
  jobId: 'job-1', jobSlug: 'verified-job-slug', title: 'QA Engineer', companyName: 'Example Co', companyLogoUrl: null,
  bannerImageUrl: '/api/job-promotions/job-1/banner', jobCategory: 'Fresher', location: 'Pune',
  workplaceType: 'Remote', employmentType: 'FullTime', minimumExperienceYears: 0, maximumExperienceYears: null,
  educationRequirement: 'B.Tech', minimumSalary: null, maximumSalary: null, currencyCode: null,
  skills: ['Testing', 'SQL', 'Automation', 'CI'], postedAtUtc: null, detailsUrl: '/dashboard/jobs/verified-job-slug',
};
const hclTechPromotion: ActiveJobPromotion = {
  jobId: 'df1a41db-b8ad-445a-91c0-477ff4871ee6',
  jobSlug: 'developer-jobs-at-hcltech-chennai-freshers-eligible-df1a41db',
  title: 'Developer Jobs at HCLTech (Chennai) | Freshers Eligible',
  companyName: 'HCLTech',
  companyLogoUrl: 'https://brain.talentd.in/static/company_logos/hcltech_128.jpg',
  bannerImageUrl: '/api/job-promotions/df1a41db-b8ad-445a-91c0-477ff4871ee6/banner',
  jobCategory: 'Software Engineering',
  location: 'Chennai, IN',
  workplaceType: 0,
  employmentType: 1,
  minimumExperienceYears: 0,
  maximumExperienceYears: 1,
  educationRequirement: null,
  minimumSalary: 400000,
  maximumSalary: 800000,
  currencyCode: 'INR',
  skills: ['Debugging', 'Developer', 'Software Development', 'Support', 'Troubleshooting', 'coding', 'documentation'],
  postedAtUtc: null,
  detailsUrl: '/dashboard/jobs/developer-jobs-at-hcltech-chennai-freshers-eligible-df1a41db',
};
const Location = () => <output data-testid="path">{useLocation().pathname}</output>;

describe('PromotedJobCard', () => {
  it('renders the exact numeric-enum PhonePe production record without throwing', () => {
    const phonePePromotion: ActiveJobPromotion = {
      jobId: 'aafac721-b1eb-404b-8939-c59515dd958f',
      jobSlug: 'intern-company-secretary-aafac721',
      title: 'Intern, Company Secretary',
      companyName: 'PhonePe',
      companyLogoUrl: 'https://brain.talentd.in/static/company_logos/phonepe_128.jpg',
      bannerImageUrl: '/api/job-promotions/aafac721-b1eb-404b-8939-c59515dd958f/banner',
      jobCategory: 'Legal & Compliance',
      location: 'Bengaluru, Karnataka, in',
      workplaceType: 1,
      employmentType: 4,
      minimumExperienceYears: null,
      maximumExperienceYears: null,
      educationRequirement: null,
      minimumSalary: null,
      maximumSalary: null,
      currencyCode: null,
      skills: [],
      postedAtUtc: '2026-10-22T07:56:52.799318Z',
      detailsUrl: '/dashboard/jobs/intern-company-secretary-aafac721',
    };
    renderWithProviders(<MemoryRouter initialEntries={['/dashboard']}><Routes>
      <Route path="/dashboard" element={<PromotedJobCard promotion={phonePePromotion} />} />
      <Route path="/dashboard/jobs/:slug" element={<Location />} />
    </Routes></MemoryRouter>);
    expect(screen.getByText('PhonePe')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Intern, Company Secretary' })).toBeInTheDocument();
    expect(screen.getByText(/Internship/)).toBeInTheDocument();
    expect(screen.getByText(/On site/)).toBeInTheDocument();
    expect(screen.getByText('Legal & Compliance')).toBeInTheDocument();
    expect(screen.queryByText(/experience/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/salary|not disclosed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/education/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Apply Now/i })).not.toBeInTheDocument();
    expect(screen.getByAltText('PhonePe promotional banner for Intern, Company Secretary')).toHaveAttribute('src', resolveApiAssetUrl(phonePePromotion.bannerImageUrl));
    expect(new URL(resolveApiAssetUrl(phonePePromotion.bannerImageUrl)!).pathname).toBe('/api/job-promotions/aafac721-b1eb-404b-8939-c59515dd958f/banner');
    expect(screen.getByText('Promoted')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Opportunity' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard/jobs/intern-company-secretary-aafac721');
  });

  it('uses API-hosted banner, real fields, and exactly one View Details action using jobSlug', () => {
    renderWithProviders(<MemoryRouter initialEntries={['/dashboard']}><Routes>
      <Route path="/dashboard" element={<PromotedJobCard promotion={promotion} />} />
      <Route path="/dashboard/jobs/:slug" element={<Location />} />
    </Routes></MemoryRouter>);
    expect(screen.getByAltText('Example Co promotional banner for QA Engineer')).toHaveAttribute('src', resolveApiAssetUrl(promotion.bannerImageUrl));
    expect(screen.getByText('Fresher')).toBeInTheDocument();
    expect(screen.getByText(/Entry Level/)).toBeInTheDocument();
    expect(screen.getByText('B.Tech')).toBeInTheDocument();
    expect(screen.queryByText(/Salary|Not disclosed/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'View Opportunity' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard/jobs/verified-job-slug');
  });

  it('resolves API-relative banner paths against the configured API origin without duplicating /api', () => {
    const resolved = resolveApiAssetUrl('/api/job-promotions/job-1/banner');
    expect(resolved).toBeTruthy();
    expect(new URL(resolved!).pathname).toBe('/api/job-promotions/job-1/banner');
  });

  it('renders the production HCLTech banner from the configured backend origin as the primary visual', () => {
    renderWithProviders(<MemoryRouter><PromotedJobCard promotion={hclTechPromotion} /></MemoryRouter>);
    const banner = screen.getByAltText('HCLTech promotional banner for Developer Jobs at HCLTech (Chennai) | Freshers Eligible');
    const resolved = new URL(banner.getAttribute('src')!);
    expect(resolved.origin).toBe(new URL(environment.apiBaseUrl).origin);
    expect(resolved.pathname).toBe('/api/job-promotions/df1a41db-b8ad-445a-91c0-477ff4871ee6/banner');
    expect(resolved.pathname).not.toContain('/api/api/');
    expect(banner).toBeVisible();
    expect(screen.getAllByAltText('HCLTech logo')).toHaveLength(1);
    expect(screen.queryByRole('img', { name: 'HCLTech initials' })).not.toBeInTheDocument();
  });

  it('resolves bare api paths without duplicating the configured API prefix and preserves absolute URLs', () => {
    const barePath = resolveApiAssetUrl('api/job-promotions/job-1/banner');
    expect(barePath).toBe(`${new URL(environment.apiBaseUrl).origin}/api/job-promotions/job-1/banner`);
    expect(resolveApiAssetUrl('/api/job-promotions/df1a41db-b8ad-445a-91c0-477ff4871ee6/banner', 'https://job-portal-lgjc.onrender.com/api')).toBe(
      'https://job-portal-lgjc.onrender.com/api/job-promotions/df1a41db-b8ad-445a-91c0-477ff4871ee6/banner',
    );
    const absolute = 'https://cdn.example.test/promotion/banner.png?size=large';
    expect(resolveApiAssetUrl(absolute)).toBe(absolute);
  });

  it('falls back from a failed banner to company branding', () => {
    const withLogo = { ...promotion, companyLogoUrl: 'https://example.test/logo.png' };
    renderWithProviders(<MemoryRouter><PromotedJobCard promotion={withLogo} /></MemoryRouter>);
    fireEvent.error(screen.getByAltText('Example Co promotional banner for QA Engineer'));
    expect(screen.getAllByAltText('Example Co logo').length).toBeGreaterThan(0);
  });

  it('resets banner failure when a reused card changes from PhonePe to HCLTech and back', () => {
    const phonePePromotion: ActiveJobPromotion = {
      ...promotion,
      jobId: 'aafac721-b1eb-404b-8939-c59515dd958f',
      jobSlug: 'intern-company-secretary-aafac721',
      title: 'Intern, Company Secretary',
      companyName: 'PhonePe',
      companyLogoUrl: 'https://brain.talentd.in/static/company_logos/phonepe_128.jpg',
      bannerImageUrl: '/api/job-promotions/aafac721-b1eb-404b-8939-c59515dd958f/banner',
    };
    const view = renderWithProviders(<MemoryRouter><PromotedJobCard promotion={phonePePromotion} /></MemoryRouter>);
    fireEvent.error(screen.getByAltText('PhonePe promotional banner for Intern, Company Secretary'));
    expect(screen.getAllByAltText('PhonePe logo').length).toBeGreaterThan(0);

    view.rerender(<MemoryRouter><PromotedJobCard promotion={hclTechPromotion} /></MemoryRouter>);
    expect(screen.getByAltText('HCLTech promotional banner for Developer Jobs at HCLTech (Chennai) | Freshers Eligible')).toBeVisible();
    fireEvent.error(screen.getByAltText('HCLTech promotional banner for Developer Jobs at HCLTech (Chennai) | Freshers Eligible'));

    view.rerender(<MemoryRouter><PromotedJobCard promotion={phonePePromotion} /></MemoryRouter>);
    expect(screen.getByAltText('PhonePe promotional banner for Intern, Company Secretary')).toBeVisible();
  });

  it('falls back to company initials when its logo image fails', () => {
    const withoutBanner = { ...promotion, bannerImageUrl: null, companyLogoUrl: 'https://example.test/logo.png' };
    renderWithProviders(<MemoryRouter><PromotedJobCard promotion={withoutBanner} /></MemoryRouter>);
    const companyLogos = screen.getAllByAltText('Example Co logo');
    fireEvent.error(companyLogos[companyLogos.length - 1]!);
    expect(screen.getAllByRole('img', { name: 'Example Co initials' }).length).toBeGreaterThan(0);
  });
});
