import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import type * as InsightsApiModule from '@/features/interviewInsights/api/interviewInsightsApi';
import { JobDetailsPage } from './JobDetailsPage';

const { logoUrl } = vi.hoisted(() => ({ logoUrl: 'https://assets.example.test/kyndryl.png' }));
vi.mock('@/features/jobs/api/jobsApi', async (importOriginal) => ({
  ...await importOriginal<typeof JobsApiModule>(),
  useGetJobDetailsQuery: () => ({ data: {
    id: 'job-1', companyId: 'company-1', companyName: 'Kyndryl', companyLogoUrl: logoUrl,
    slug: 'engineer', title: 'Engineer', categoryName: 'Engineering', description: 'Build products.',
    location: 'Pune', employmentType: 1, workplaceType: 1, experienceLevel: 1,
    minimumSalary: null, maximumSalary: null, publishedAtUtc: '2026-10-13T00:00:00Z',
    expiresAtUtc: null, companyWebsiteUrl: null,
  } }),
  useGetRelatedJobsQuery: () => ({ data: [] }),
}));
vi.mock('@/features/interviewInsights/api/interviewInsightsApi', async (importOriginal) => ({
  ...await importOriginal<typeof InsightsApiModule>(),
  useGetCompanyInterviewInsightSummaryQuery: () => ({ data: undefined }),
}));
// Isolate logo rendering from unrelated authenticated action APIs.
vi.mock('@/features/dashboard/components/ApplicationQuotaIndicator', () => ({ ApplicationQuotaIndicator: () => null }));
vi.mock('@/features/dashboard/components/ApplyToJobButton', () => ({ ApplyToJobButton: () => <button>Apply manually</button> }));
vi.mock('@/features/dashboard/components/SaveJobButton', () => ({ SaveJobButton: () => <button>Save</button> }));
vi.mock('@/features/jobs/components/RecruiterContactCard', () => ({ RecruiterContactCard: () => null }));

describe('Job Details company logo', () => {
  it('uses the supplied logo in both existing slots and preserves details after an image failure', () => {
    renderWithProviders(<MemoryRouter initialEntries={['/jobs/engineer']}><Routes><Route path="/jobs/:slug" element={<JobDetailsPage />} /></Routes></MemoryRouter>);
    const images = screen.getAllByRole('img', { name: 'Kyndryl logo' });
    expect(images).toHaveLength(2);
    images.forEach((image) => {
      expect(image).toHaveAttribute('src', logoUrl);
      expect(image).toHaveStyle({ objectFit: 'contain' });
    });
    expect(images[0]?.parentElement).toHaveStyle({ width: '76px', height: '76px' });
    fireEvent.error(images[0]!);
    expect(screen.getByRole('img', { name: 'Kyndryl initials' })).toHaveTextContent('K');
    expect(screen.getByRole('heading', { name: 'Engineer', level: 1 })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply manually' })).toBeVisible();
  });
});
