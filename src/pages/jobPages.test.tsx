import { ROUTES } from '@/constants/routes';
import {
  useGetFeaturedJobsQuery,
  useGetJobDetailsQuery,
  useGetLatestJobsQuery,
  useGetNewestJobsQuery,
  useGetPopularCompaniesQuery,
  useGetRelatedJobsQuery,
  useSearchJobsQuery,
} from '@/features/jobs/api/jobsApi';
import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import {
  useGetApplicationQuotaQuery,
  useGetSavedJobsQuery,
  useLazyGetRecruiterContactQuery,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
} from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import { useGetCompanyInterviewInsightSummaryQuery } from '@/features/interviewInsights/api/interviewInsightsApi';
import type * as InterviewInsightsApiModule from '@/features/interviewInsights/api/interviewInsightsApi';
import { ShareButton } from '@/features/jobs/components/ShareButton';
import type { AuthState } from '@/features/auth/store/authSlice';
import {
  EmploymentType,
  ExperienceLevel,
  WorkplaceType,
  type PublicJobDetails,
  type PublicJobSummary,
} from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JobDetailsPage } from './JobDetailsPage';
import { JobsPage } from './JobsPage';

vi.mock('@/features/jobs/api/jobsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof JobsApiModule>();

  return {
    ...actual,
    useGetFeaturedJobsQuery: vi.fn(),
    useGetJobDetailsQuery: vi.fn(),
    useGetLatestJobsQuery: vi.fn(),
    useGetNewestJobsQuery: vi.fn(),
    useGetPopularCompaniesQuery: vi.fn(),
    useGetRelatedJobsQuery: vi.fn(),
    useSearchJobsQuery: vi.fn(),
  };
});

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();

  return {
    ...actual,
    useGetApplicationQuotaQuery: vi.fn(),
    useGetSavedJobsQuery: vi.fn(),
    useLazyGetRecruiterContactQuery: vi.fn(),
    useRemoveSavedJobMutation: vi.fn(),
    useSaveJobMutation: vi.fn(),
    useSubmitApplicationMutation: vi.fn(),
  };
});

vi.mock('@/features/interviewInsights/api/interviewInsightsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof InterviewInsightsApiModule>();
  return { ...actual, useGetCompanyInterviewInsightSummaryQuery: vi.fn() };
});

const mockSearchJobs = vi.mocked(useSearchJobsQuery);
const mockFeaturedJobs = vi.mocked(useGetFeaturedJobsQuery);
const mockJobDetails = vi.mocked(useGetJobDetailsQuery);
const mockLatestJobs = vi.mocked(useGetLatestJobsQuery);
const mockNewestJobs = vi.mocked(useGetNewestJobsQuery);
const mockPopularCompanies = vi.mocked(useGetPopularCompaniesQuery);
const mockRelatedJobs = vi.mocked(useGetRelatedJobsQuery);
const mockApplicationQuota = vi.mocked(useGetApplicationQuotaQuery);
const mockGetSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockGetRecruiterContact = vi.mocked(useLazyGetRecruiterContactQuery);
const mockRemoveSavedJob = vi.mocked(useRemoveSavedJobMutation);
const mockSaveJob = vi.mocked(useSaveJobMutation);
const mockSubmitApplication = vi.mocked(useSubmitApplicationMutation);
const mockCompanyInsightSummary = vi.mocked(useGetCompanyInterviewInsightSummaryQuery);

const refetch = vi.fn();
const submitApplication = vi.fn();
const submitApplicationUnwrap = vi.fn();

const job: PublicJobSummary = {
  categoryId: '22222222-2222-4222-8222-222222222222',
  categoryName: 'Engineering',
  companyId: '11111111-1111-4111-8111-111111111111',
  companyLogoUrl: null,
  companyName: 'Northstar Labs',
  companySlug: 'northstar-labs',
  currencyCode: 'INR',
  companyType: null,
  department: null,
  educationRequirement: null,
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  industry: null,
  internshipDurationMonths: null,
  isFlexibleDuration: false,
  id: '33333333-3333-4333-8333-333333333333',
  isFeatured: true,
  location: 'Pune',
  maximumSalary: 2500000,
  minimumSalary: 1800000,
  maximumExperienceYears: null,
  minimumExperienceYears: null,
  postedByType: null,
  publishedAtUtc: '2026-07-20T00:00:00Z',
  referenceNumber: 'JOB-1001',
  roleCategory: null,
  slug: 'senior-react-engineer',
  title: 'Senior React Engineer',
  workplaceType: WorkplaceType.Hybrid,
};

const jobDetails: PublicJobDetails = {
  ...job,
  applicationUrl: 'https://careers.example.com/jobs/senior-react-engineer',
  benefits: 'Flexible working hours',
  companyDescription: 'A product engineering company.',
  companyWebsiteUrl: 'https://example.com',
  description: 'Build accessible products for millions of people.',
  requirements: 'Strong React and TypeScript experience.',
  responsibilities: 'Lead frontend architecture and mentor engineers.',
};

const unauthenticated: AuthState = {
  accessTokenExpiresAtUtc: null,
  error: null,
  isSubmitting: false,
  status: 'unauthenticated',
  user: null,
};

const authenticated: AuthState = {
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
  isSubmitting: false,
  status: 'authenticated',
  user: {
    email: 'candidate@example.com',
    firstName: 'Avery',
    id: 'user-id',
    lastName: 'Patel',
    role: UserRole.Candidate,
  },
};

const searchResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useSearchJobsQuery>;

const collectionResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: {
      items: [],
      pageNumber: 1,
      pageSize: 3,
      totalCount: 0,
      totalPages: 0,
    },
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetFeaturedJobsQuery>;

const popularCompaniesResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: [],
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetPopularCompaniesQuery>;

const detailsResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetJobDetailsQuery>;

const relatedResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: [],
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetRelatedJobsQuery>;

const LocationProbe = () => {
  const location = useLocation();

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderJobsPage = (initialPath = '/jobs') => {
  const router = createMemoryRouter(
    [
      {
        path: '/jobs',
        element: (
          <>
            <JobsPage />
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries: [initialPath] },
  );

  renderWithProviders(<RouterProvider router={router} />, {
    auth: unauthenticated,
  });
};

const renderDetailsPage = (
  auth: AuthState = unauthenticated,
  initialPath = `/jobs/${job.slug}`,
) => {
  const router = createMemoryRouter(
    [
      { path: '/jobs/:slug', element: <JobDetailsPage /> },
      { path: '/login', element: <p>Login destination</p> },
      { path: '/unauthorized', element: <p>Unauthorized destination</p> },
      { path: '/dashboard/applications', element: <p>Applications destination</p> },
      { path: '/dashboard/membership', element: <p>Membership destination</p> },
    ],
    { initialEntries: [initialPath] },
  );

  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />, { auth }),
  };
};

beforeEach(() => {
  refetch.mockReset();
  submitApplication.mockReset();
  submitApplicationUnwrap.mockReset();
  submitApplicationUnwrap.mockResolvedValue(undefined);
  submitApplication.mockReturnValue({ unwrap: submitApplicationUnwrap });

  mockFeaturedJobs.mockReturnValue(collectionResult());
  mockLatestJobs.mockReturnValue(collectionResult());
  mockNewestJobs.mockReturnValue(collectionResult());
  mockPopularCompanies.mockReturnValue(popularCompaniesResult());
  mockRelatedJobs.mockReturnValue(relatedResult());
  mockCompanyInsightSummary.mockReturnValue({
    data: undefined,
    isError: false,
    isLoading: false,
  } as unknown as ReturnType<typeof useGetCompanyInterviewInsightSummaryQuery>);

  mockApplicationQuota.mockReturnValue({
    data: undefined,
    isError: false,
  } as unknown as ReturnType<typeof useGetApplicationQuotaQuery>);

  mockSubmitApplication.mockReturnValue([
    submitApplication,
    { isLoading: false },
  ] as unknown as ReturnType<typeof useSubmitApplicationMutation>);

  mockGetSavedJobs.mockReturnValue({
    data: {
      items: [],
      pageNumber: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
    },
    isFetching: false,
  } as unknown as ReturnType<typeof useGetSavedJobsQuery>);

  mockRemoveSavedJob.mockReturnValue([vi.fn(), { isLoading: false }] as unknown as ReturnType<
    typeof useRemoveSavedJobMutation
  >);

  mockSaveJob.mockReturnValue([vi.fn(), { isLoading: false }] as unknown as ReturnType<
    typeof useSaveJobMutation
  >);

  mockGetRecruiterContact.mockReturnValue([
    vi.fn().mockResolvedValue({ data: undefined }),
    { data: undefined, isFetching: false },
  ] as unknown as ReturnType<typeof useLazyGetRecruiterContactQuery>);
});

describe('jobs listing page', () => {
  it('shows a loading state', () => {
    mockSearchJobs.mockReturnValue(searchResult({ isFetching: true, isLoading: true }));

    renderJobsPage();

    expect(screen.getByLabelText('Loading jobs')).toBeInTheDocument();
  });

  it('renders successful job results', () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: {
          items: [job],
          pageNumber: 1,
          pageSize: 12,
          totalCount: 1,
          totalPages: 1,
        },
      }),
    );

    renderJobsPage();

    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByText(job.companyName)).toBeInTheDocument();
  });

  it('shows an empty state', () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: {
          items: [],
          pageNumber: 1,
          pageSize: 12,
          totalCount: 0,
          totalPages: 0,
        },
      }),
    );

    renderJobsPage();

    expect(screen.getByText('No jobs match your search')).toBeInTheDocument();
  });

  it('shows an API failure and retries', async () => {
    mockSearchJobs.mockReturnValue(searchResult({ isError: true }));

    renderJobsPage();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalledOnce();
  });

  it('hydrates supported filters from the URL', async () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: {
          items: [job],
          pageNumber: 2,
          pageSize: 20,
          totalCount: 30,
          totalPages: 2,
        },
      }),
    );

    renderJobsPage(
      `/jobs?q=react&location=Pune&companyName=${encodeURIComponent(job.companyName)}&categoryName=${encodeURIComponent(job.categoryName)}&featured=true&workplaceType=remote&page=2&pageSize=20&sort=title-asc`,
    );

    await waitFor(() => {
      expect(mockSearchJobs.mock.calls[0]?.[0]).toMatchObject({
        categoryName: job.categoryName,
        companyName: job.companyName,
        isFeatured: true,
        location: 'Pune',
        pageNumber: 2,
        pageSize: 20,
        search: 'react',
        sortBy: 'title',
        sortDirection: 'asc',
        workplaceType: WorkplaceType.Remote,
      });
    });
  });

  it('applies and clears free-text company and category filters', async () => {
    renderJobsPage('/jobs?page=2');
    const visibleInput = (name: string) =>
      screen
        .getAllByRole('textbox', { name })
        .find((element) => !element.closest('[aria-hidden="true"]'))!;

    await userEvent.type(visibleInput('Company name'), '  HARMAN  ');
    await waitFor(
      () => expect(screen.getByTestId('location')).toHaveTextContent('companyName=HARMAN'),
      {
        timeout: 1_500,
      },
    );
    await userEvent.type(visibleInput('Category name'), 'Artificial Intelligence');
    await waitFor(
      () => {
        const location = screen.getByTestId('location').textContent ?? '';
        expect(location).toContain('companyName=HARMAN');
        expect(location).toContain('categoryName=Artificial+Intelligence');
        expect(location).not.toContain('page=2');
      },
      { timeout: 1_500 },
    );
    expect(screen.getByText('Company: HARMAN')).toBeVisible();
    expect(screen.getByText('Category: Artificial Intelligence')).toBeVisible();
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      companyName: 'HARMAN',
      categoryName: 'Artificial Intelligence',
      pageNumber: 1,
    });

    await userEvent.click(screen.getByText('Company: HARMAN').parentElement!.querySelector('svg')!);
    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      expect(location).not.toContain('companyName');
      expect(location).toContain('categoryName=Artificial+Intelligence');
    });

    const clearAll = screen
      .getAllByRole('button', { name: 'Clear all' })
      .find((element) => !element.closest('[aria-hidden="true"]'))!;
    await userEvent.click(clearAll);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/jobs'));
  });
});

describe('job details page', () => {
  it('renders job details', () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));

    renderDetailsPage();

    expect(screen.getByRole('heading', { name: job.title })).toBeInTheDocument();
    expect(screen.getByText(jobDetails.description)).toBeInTheDocument();
  });

  it('shows a safe company interview-insight summary to candidates without round details', () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    mockCompanyInsightSummary.mockReturnValue({
      data: {
        canReadFull: false,
        companyId: job.companyId,
        companyName: job.companyName,
        helpfulConfirmedCount: 8,
        publishedCount: 3,
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useGetCompanyInterviewInsightSummaryQuery>);

    renderDetailsPage(authenticated);

    expect(screen.getByRole('heading', { name: 'Interview insights' })).toBeVisible();
    expect(screen.getByText(/3 reviewed insights · 8 helpful confirmations/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Explore insights' })).toHaveAttribute(
      'href',
      `/dashboard/interview-insights?companyId=${job.companyId}`,
    );
    expect(screen.getByRole('link', { name: 'Add interview schedule' })).toBeVisible();
    expect(screen.queryByText(/questions or topics/i)).not.toBeInTheDocument();
  });

  it('shows a not-found state for a 404 response', () => {
    mockJobDetails.mockReturnValue(
      detailsResult({
        error: { message: 'Not found', status: 404 },
        isError: true,
      }),
    );

    renderDetailsPage();

    expect(screen.getByText('Job not found')).toBeInTheDocument();
  });

  it('does not render an expired job as available', () => {
    mockJobDetails.mockReturnValue(
      detailsResult({
        data: {
          ...jobDetails,
          expiresAtUtc: '2020-01-01T00:00:00Z',
        },
      }),
    );

    renderDetailsPage();

    expect(screen.getByText('Job no longer available')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply on company site' })).not.toBeInTheDocument();
  });

  it.each([
    {
      expectedQuota: 'Free applications: 9 of 10 used this month',
      quota: {
        isPremium: false,
        limit: 10,
        plan: 'Free',
        remainingApplications: 1,
        resetsAtUtc: '2099-08-31T18:30:00Z',
        usedApplications: 9,
      },
      scenario: 'free Candidate below the monthly limit',
    },
    {
      expectedQuota: 'Premium applications: 34 of 35 used today',
      quota: {
        isPremium: true,
        limit: 35,
        plan: 'Premium',
        remainingApplications: 1,
        resetsAtUtc: '2099-08-03T18:30:00Z',
        usedApplications: 34,
      },
      scenario: 'premium Candidate below the daily limit',
    },
  ])(
    'allows a $scenario and opens the validated external URL',
    async ({ expectedQuota, quota }) => {
      mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
      mockApplicationQuota.mockReturnValue({ data: quota } as unknown as ReturnType<
        typeof useGetApplicationQuotaQuery
      >);
      const open = vi.spyOn(window, 'open').mockReturnValue(null);

      renderDetailsPage(authenticated);

      await clickManualApply();

      expect(submitApplication).toHaveBeenCalledWith({
        applicationMethod: 'External',
        jobId: job.id,
      });
      expect(open).toHaveBeenCalledWith(
        'https://careers.example.com/jobs/senior-react-engineer',
        '_blank',
        'noopener,noreferrer',
      );
      expect(screen.queryByText(expectedQuota)).not.toBeInTheDocument();
      expect(
        await screen.findByText('Opening the employer’s official application page in a new tab.'),
      ).toBeVisible();
      expect(screen.queryByText('Login destination')).not.toBeInTheDocument();

      open.mockRestore();
    },
  );

  it('redirects a free Candidate to membership when the monthly quota is exhausted', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    submitApplicationUnwrap.mockRejectedValue({
      code: 'MONTHLY_JOB_LIMIT_REACHED',
      message:
        "You've reached your monthly application limit of 10 jobs. Upgrade to Premium for more applications.",
      redirectToMembership: true,
      status: 403,
    });
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    const { router } = renderDetailsPage(authenticated);
    await clickManualApply();

    expect(await screen.findByText('Membership destination')).toBeVisible();
    expect(router.state.location.pathname).toBe(ROUTES.MEMBERSHIP);
    expect(router.state.location.search).toContain('returnTo=');
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('redirects before submitting or opening a tab when the quota endpoint reports 10 free applications used', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    mockApplicationQuota.mockReturnValue({
      data: {
        isPremium: false,
        limit: 10,
        plan: 'Free',
        remainingApplications: 0,
        resetsAtUtc: '2099-08-31T18:30:00Z',
        usedApplications: 10,
      },
      isError: false,
    } as unknown as ReturnType<typeof useGetApplicationQuotaQuery>);
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    const { router } = renderDetailsPage(authenticated);
    await clickManualApply();

    expect(await screen.findByText('Membership destination')).toBeVisible();
    expect(submitApplication).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe(ROUTES.MEMBERSHIP);
    open.mockRestore();
  });

  it('shows the premium daily-limit message and stays on the job page', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    submitApplicationUnwrap.mockRejectedValue({
      code: 'premium_daily_limit',
      message: 'Too many requests.',
      status: 429,
    });
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    const { router } = renderDetailsPage(authenticated);
    await clickManualApply();

    expect(
      await screen.findByText(
        'Applications are temporarily limited. You can still save jobs and try applying again later.',
      ),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe(`/jobs/${job.slug}`);
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('shows the duplicate-application message without opening the employer site', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    submitApplicationUnwrap.mockRejectedValue({
      code: 'conflict',
      message: 'You have already applied to this job.',
      status: 409,
    });
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    renderDetailsPage(authenticated);
    await clickManualApply();

    expect(await screen.findByText('You have already applied for this job.')).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Applied' })).toBeDisabled();
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('redirects an unauthenticated user to Login and preserves the return location', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    const { router } = renderDetailsPage(unauthenticated, `/jobs/${job.slug}?source=featured`);
    await clickManualApply();

    expect(await screen.findByText('Login destination')).toBeVisible();
    expect(router.state.location.state).toMatchObject({
      from: { pathname: `/jobs/${job.slug}`, search: '?source=featured' },
    });
    expect(submitApplication.mock.calls).toHaveLength(0);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('prevents an Administrator from applying', () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const administrator: AuthState = {
      ...authenticated,
      user: { ...authenticated.user!, role: UserRole.Administrator },
    };

    renderDetailsPage(administrator);

    expect(screen.getAllByRole('button', { name: 'Apply manually' })[0]).toBeDisabled();
    expect(screen.getByText('Administrator accounts cannot apply for jobs.')).toBeVisible();
    expect(submitApplication.mock.calls).toHaveLength(0);
  });

  it('disables Apply while the backend request is pending', () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    mockSubmitApplication.mockReturnValue([
      submitApplication,
      { isLoading: true },
    ] as unknown as ReturnType<typeof useSubmitApplicationMutation>);

    renderDetailsPage(authenticated);

    expect(screen.getAllByRole('button', { name: 'Processing application…' })[0]).toBeDisabled();
  });

  it('does not render the internal cover-letter application flow', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    renderDetailsPage(authenticated);

    await clickManualApply();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('textbox', { name: 'Cover letter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();

    open.mockRestore();
  });

  it.each(['javascript:alert(1)', '/relative-application-path'])(
    'does not submit or open an unsafe application URL: %s',
    async (applicationUrl) => {
      mockJobDetails.mockReturnValue(detailsResult({ data: { ...jobDetails, applicationUrl } }));

      const open = vi.spyOn(window, 'open').mockReturnValue(null);
      renderDetailsPage(authenticated);

      await clickManualApply();
      expect(
        await screen.findByText('Application link is unavailable for this job.'),
      ).toBeVisible();
      expect(submitApplication).not.toHaveBeenCalled();
      expect(open).not.toHaveBeenCalled();
      open.mockRestore();
    },
  );

  it('submits a Portal application without opening a new tab when no application URL exists', async () => {
    mockJobDetails.mockReturnValue(
      detailsResult({ data: { ...jobDetails, applicationUrl: null } }),
    );
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    renderDetailsPage(authenticated);
    await clickManualApply();

    expect(submitApplication).toHaveBeenCalledWith({ applicationMethod: 'Portal', jobId: job.id });
    expect(open).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Application submitted. This job is now in Applied jobs.'),
    ).toBeVisible();
    open.mockRestore();
  });

  it('keeps save, share, and recruiter-contact actions working', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const save = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) }));
    const loadContact = vi.fn().mockResolvedValue({ data: undefined });
    const share = vi.fn().mockResolvedValue(undefined);
    mockSaveJob.mockReturnValue([save, { isLoading: false }] as unknown as ReturnType<
      typeof useSaveJobMutation
    >);
    mockGetRecruiterContact.mockReturnValue([
      loadContact,
      { data: undefined, isFetching: false },
    ] as unknown as ReturnType<typeof useLazyGetRecruiterContactQuery>);
    mockApplicationQuota.mockReturnValue({
      data: {
        isPremium: true,
        limit: 35,
        plan: 'Premium',
        remainingApplications: 35,
        resetsAtUtc: '2099-01-02T00:00:00Z',
        usedApplications: 0,
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useGetApplicationQuotaQuery>);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    renderDetailsPage(authenticated);

    await userEvent.click(screen.getByRole('button', { name: `Save ${job.title}` }));
    await userEvent.click(screen.getByRole('button', { name: 'Share job' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unlock recruiter contact' }));

    expect(save).toHaveBeenCalledWith(job.id);
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ text: `View ${job.title} at ${job.companyName}` }),
    );
    expect(loadContact).toHaveBeenCalledWith(job.id);
  });

  it('does not promise fixed application volume in the recruiter-contact upsell', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    renderDetailsPage(authenticated);
    await userEvent.click(screen.getByRole('button', { name: 'Unlock recruiter contact' }));
    expect(await screen.findByText('Unlock Recruiter Contact')).toBeVisible();
    expect(screen.queryByText(/35 daily|10 monthly|applications per day/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Premium Plans' })).toBeEnabled();
  });

  it('keeps related jobs visible in the compact sidebar', () => {
    const relatedJob = {
      ...job,
      id: '44444444-4444-4444-8444-444444444444',
      slug: 'design-systems-engineer',
      title: 'Design Systems Engineer',
    };
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    mockRelatedJobs.mockReturnValue(relatedResult({ data: [relatedJob] }));

    renderDetailsPage();

    expect(screen.getByRole('heading', { name: 'Related jobs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: relatedJob.title })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: `View ${relatedJob.title} at ${relatedJob.companyName}` }),
    ).toBeInTheDocument();
  });
});

describe('share button', () => {
  it('uses the clipboard fallback when Web Share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderWithProviders(
      <ShareButton
        text="A job"
        title="Senior React Engineer"
        url="https://example.com/jobs/react"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Share job' }));

    expect(writeText.mock.calls[0]?.[0]).toBe('https://example.com/jobs/react');
  });

  it('offers a keyboard-accessible manual copy fallback', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    renderWithProviders(
      <ShareButton
        text="A job"
        title="Senior React Engineer"
        url="https://example.com/jobs/react"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Share job' }));

    const linkField = await screen.findByRole('textbox', {
      name: 'Job link',
    });

    expect(linkField).toHaveValue('https://example.com/jobs/react');
    expect(linkField).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Copy job link' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Share job' })).toHaveFocus();
    });
  });
});


const clickManualApply = async () => {
  const trigger = screen.getAllByRole('button', { name: 'Apply manually' })[0];
  expect(trigger).toBeDefined();
  if (!trigger) throw new Error('Manual application trigger missing');
  await userEvent.click(trigger);
  const confirmation = screen.queryByRole('button', { name: 'Continue to company website' });
  if (confirmation) await userEvent.click(confirmation);
};
