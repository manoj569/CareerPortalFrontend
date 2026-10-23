import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
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

  it('falls back from a failed banner to company branding', () => {
    const withLogo = { ...promotion, companyLogoUrl: 'https://example.test/logo.png' };
    renderWithProviders(<MemoryRouter><PromotedJobCard promotion={withLogo} /></MemoryRouter>);
    fireEvent.error(screen.getByAltText('Example Co promotional banner for QA Engineer'));
    expect(screen.getAllByAltText('Example Co logo').length).toBeGreaterThan(0);
  });

  it('falls back to company initials when its logo image fails', () => {
    const withoutBanner = { ...promotion, bannerImageUrl: null, companyLogoUrl: 'https://example.test/logo.png' };
    renderWithProviders(<MemoryRouter><PromotedJobCard promotion={withoutBanner} /></MemoryRouter>);
    const companyLogos = screen.getAllByAltText('Example Co logo');
    fireEvent.error(companyLogos[companyLogos.length - 1]!);
    expect(screen.getAllByRole('img', { name: 'Example Co initials' }).length).toBeGreaterThan(0);
  });
});
