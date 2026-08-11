import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import { useGetFeaturedJobsQuery, useGetLatestJobsQuery, useGetPopularCompaniesQuery } from '@/features/jobs/api/jobsApi';
import { EmploymentType, ExperienceLevel, WorkplaceType, type PublicJobSummary } from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HomePage } from './HomePage';

vi.mock('@/features/jobs/api/jobsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof JobsApiModule>();
  return { ...actual, useGetFeaturedJobsQuery: vi.fn(), useGetLatestJobsQuery: vi.fn(), useGetPopularCompaniesQuery: vi.fn() };
});

const job: PublicJobSummary = {
  categoryId: 'category', categoryName: 'Engineering', companyId: 'company', companyLogoUrl: null,
  companyName: 'Northstar Labs', companySlug: 'northstar-labs', companyType: null,
  currencyCode: 'INR', department: null, educationRequirement: null,
  employmentType: EmploymentType.FullTime, experienceLevel: ExperienceLevel.Mid,
  expiresAtUtc: null, id: 'job', industry: null, internshipDurationMonths: null,
  isFeatured: true, isFlexibleDuration: false, location: 'Pune', maximumExperienceYears: null,
  maximumSalary: null, minimumExperienceYears: null, minimumSalary: null, postedByType: null,
  publishedAtUtc: '2026-08-10T00:00:00Z', referenceNumber: 'JOB-1', roleCategory: null,
  slug: 'react-engineer', title: 'React Engineer', workplaceType: WorkplaceType.Remote,
};

const result = <T,>(data: T) => ({ data, isError: false, isLoading: false, refetch: vi.fn() }) as never;

describe('premium public homepage', () => {
  beforeEach(() => {
    vi.mocked(useGetFeaturedJobsQuery).mockReturnValue(result({ items: [job], pageNumber: 1, pageSize: 6, totalCount: 1, totalPages: 1 }));
    vi.mocked(useGetLatestJobsQuery).mockReturnValue(result({ items: [job], pageNumber: 1, pageSize: 6, totalCount: 1, totalPages: 1 }));
    vi.mocked(useGetPopularCompaniesQuery).mockReturnValue(result([{ activeJobCount: 1, id: 'company', industry: 'Technology', isVerified: true, location: 'Pune', logoUrl: null, name: 'Northstar Labs', slug: 'northstar-labs' }]));
  });

  it('renders verified product sections and real job/company navigation', () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], { initialEntries: ['/'] });
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: /Find the right opportunity/ })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Opportunities for every stage of your career' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Featured Jobs' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Latest Jobs' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'View details for React Engineer at Northstar Labs' })).toHaveAttribute('href', '/jobs/react-engineer');
    expect(screen.getAllByRole('link', { name: /Northstar Labs/ })[0]).toHaveAttribute('href', '/jobs?companyName=Northstar%20Labs');
    expect(screen.queryByText(/AI interviewer|proof.of.work|candidate ranking/i)).toBeNull();
  });

  it('keeps the wide discovery panel complete when the job API is unavailable', () => {
    vi.mocked(useGetFeaturedJobsQuery).mockReturnValue({ data: undefined, isError: true, isLoading: false, refetch: vi.fn() } as never);
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], { initialEntries: ['/'] });
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: 'Jobs are temporarily unavailable' })).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Browse all jobs' })).toHaveLength(2);
  });

  it('submits hero fields into the existing jobs URL contract', async () => {
    const router = createMemoryRouter([
      { path: '/', element: <HomePage /> },
      { path: '/jobs', element: <output data-testid="jobs-url" /> },
    ], { initialEntries: ['/'] });
    renderWithProviders(<RouterProvider router={router} />);
    await userEvent.type(screen.getByLabelText('Job title, skill, or company'), 'React');
    await userEvent.type(screen.getByLabelText('Location'), 'Pune');
    await userEvent.click(screen.getByLabelText('Experience'));
    await userEvent.click(screen.getByRole('option', { name: 'Mid level' }));
    await userEvent.click(screen.getByRole('button', { name: 'Search Jobs' }));
    expect(router.state.location.pathname).toBe('/jobs');
    expect(router.state.location.search).toContain('q=React');
    expect(router.state.location.search).toContain('location=Pune');
    expect(router.state.location.search).toContain('experienceLevel=mid');
  });
});
