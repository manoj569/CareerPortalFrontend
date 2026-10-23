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
  it('uses API-hosted banner, real fields, and exactly one View Details action using jobSlug', () => {
    renderWithProviders(<MemoryRouter initialEntries={['/dashboard']}><Routes>
      <Route path="/dashboard" element={<PromotedJobCard promotion={promotion} />} />
      <Route path="/dashboard/jobs/:slug" element={<Location />} />
    </Routes></MemoryRouter>);
    expect(screen.getByAltText('Example Co and QA Engineer')).toHaveAttribute('src', resolveApiAssetUrl(promotion.bannerImageUrl));
    expect(screen.getByText('Fresher')).toBeInTheDocument();
    expect(screen.getByText(/Entry Level/)).toBeInTheDocument();
    expect(screen.getByText('B.Tech')).toBeInTheDocument();
    expect(screen.queryByText(/Salary|Not disclosed/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard/jobs/verified-job-slug');
  });

  it('resolves API-relative banner paths against the configured API origin without duplicating /api', () => {
    const resolved = resolveApiAssetUrl('/api/job-promotions/job-1/banner');
    expect(resolved).toBeTruthy();
    expect(new URL(resolved!).pathname).toBe('/api/job-promotions/job-1/banner');
  });
});
