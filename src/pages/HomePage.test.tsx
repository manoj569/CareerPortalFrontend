import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import type * as PortfolioApiModule from '@/features/portfolio/api/portfolioApi';
import { useGetFeaturedJobsQuery, useGetLatestJobsQuery, useGetPopularCompaniesQuery } from '@/features/jobs/api/jobsApi';
import { useGetPublicPortfolioQuery } from '@/features/portfolio/api/portfolioApi';
import type { AuthState } from '@/features/auth/store/authSlice';
import { EmploymentType, ExperienceLevel, WorkplaceType, type PublicJobSummary } from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { HomePage } from './HomePage';

vi.mock('@/features/jobs/api/jobsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof JobsApiModule>();
  return { ...actual, useGetFeaturedJobsQuery: vi.fn(), useGetLatestJobsQuery: vi.fn(), useGetPopularCompaniesQuery: vi.fn() };
});

vi.mock('@/features/portfolio/api/portfolioApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PortfolioApiModule>();
  return { ...actual, useGetPublicPortfolioQuery: vi.fn() };
});

const candidateAuth: AuthState = {
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
  isSubmitting: false,
  status: 'authenticated',
  user: {
    email: 'candidate@example.com',
    firstName: 'Avery',
    id: 'candidate-id',
    lastName: 'Patel',
    role: UserRole.Candidate,
  },
};

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
    expect(
      screen.getByRole('heading', {
        name: 'Your career, presented through one professional link',
      }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Featured Jobs' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Latest Jobs' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'View details for React Engineer at Northstar Labs' })).toHaveAttribute('href', '/jobs/react-engineer');
    expect(screen.getAllByRole('link', { name: /Northstar Labs/ })[0]).toHaveAttribute('href', '/jobs?companyName=Northstar%20Labs');
    expect(screen.queryByText(/AI interviewer|proof.of.work|candidate ranking/i)).toBeNull();
  });

  it('publishes the preferred homepage metadata and structured brand data', async () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], { initialEntries: ['/'] });
    const view = renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() =>
      expect(document.title).toBe('Career Harbor | Find Jobs and Build Your Career'),
    );
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Discover job opportunities and create a professional portfolio to showcase your skills, projects and experience with Career Harbor.',
    );
    const script = document.getElementById('career-harbor-home-structured-data');
    expect(script).toHaveAttribute('type', 'application/ld+json');
    expect(JSON.parse(script?.textContent ?? '{}')).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        expect.objectContaining({
          '@type': 'WebSite',
          alternateName: 'Career Portal',
          name: 'Career Harbor',
          url: 'https://careerharbor.in/',
        }),
        expect.objectContaining({
          '@type': 'Organization',
          logo: 'https://careerharbor.in/favicon.svg',
          name: 'Career Harbor',
          url: 'https://careerharbor.in/',
        }),
      ],
    });

    view.unmount();
    expect(document.getElementById('career-harbor-home-structured-data')).toBeNull();
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

  it('keeps Browse jobs primary and sends logged-out portfolio intent safely through registration state', async () => {
    const router = createMemoryRouter(
      [
        { path: '/', element: <HomePage /> },
        { path: '/register', element: <p>Registration destination</p> },
      ],
      { initialEntries: ['/'] },
    );
    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: 'Browse jobs' })).toHaveAttribute('href', '/jobs');
    await userEvent.click(screen.getByRole('link', { name: 'Create portfolio' }));
    expect(router.state.location.pathname).toBe('/register');
    expect(router.state.location.state).toEqual({ from: { pathname: '/dashboard/portfolio' } });
  });

  it('routes authenticated Candidates directly to the portfolio editor without creating or publishing', () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], {
      initialEntries: ['/'],
    });
    renderWithProviders(<RouterProvider router={router} />, { auth: candidateAuth });

    expect(screen.getByRole('link', { name: 'Create portfolio' })).toHaveAttribute(
      'href',
      '/dashboard/portfolio',
    );
    expect(screen.getByRole('link', { name: 'Create your portfolio' })).toHaveAttribute(
      'href',
      '/dashboard/portfolio',
    );
  });

  it('routes Interview Insights intent safely for guests and directly for Candidates', async () => {
    const guestRouter = createMemoryRouter([
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <p>Login destination</p> },
    ], { initialEntries: ['/'] });
    const guestView = renderWithProviders(<RouterProvider router={guestRouter} />);
    await userEvent.click(screen.getByRole('link', { name: 'Explore interview insights' }));
    expect(guestRouter.state.location.pathname).toBe('/login');
    expect(guestRouter.state.location.state).toEqual({ from: { pathname: '/dashboard/interview-insights' } });
    guestView.unmount();

    const candidateRouter = createMemoryRouter([{ path: '/', element: <HomePage /> }], { initialEntries: ['/'] });
    renderWithProviders(<RouterProvider router={candidateRouter} />, { auth: candidateAuth });
    expect(screen.getByRole('link', { name: 'Explore interview insights' })).toHaveAttribute('href', '/dashboard/interview-insights');
  });

  it('renders an accessible illustrative preview and the complete three-step flow without private API calls', () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], {
      initialEntries: ['/'],
    });
    renderWithProviders(<RouterProvider router={router} />);

    expect(
      screen.getByText(
        'Showcase your skills, projects, experience, education and certifications in a portfolio designed to be shared with recruiters and professional connections.',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('img', {
        name: 'Illustrative Career Harbor portfolio preview for a fictional full stack developer',
      }),
    ).toBeVisible();
    expect(screen.getByText('Aarav Mehta')).toBeVisible();
    expect(screen.getByText('Job Application Tracker')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Step 1: Complete your profile' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Step 2: Build your portfolio' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Step 3: Preview and publish' })).toBeVisible();
    expect(vi.mocked(useGetPublicPortfolioQuery)).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'View example portfolio' })).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /AI portfolio generation|unlimited templates|custom domains|recruiter analytics|verified skills|free forever/i,
      ),
    ).not.toBeInTheDocument();
  });
});
