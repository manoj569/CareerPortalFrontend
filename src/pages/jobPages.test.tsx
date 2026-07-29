import {
  useApplyToJobMutation,
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
  useGetSavedJobsQuery,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
} from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import { ShareButton } from '@/features/jobs/components/ShareButton';
import type { AuthState } from '@/features/auth/store/authSlice';
import {
  ApplicationAccessStatus,
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
    useApplyToJobMutation: vi.fn(),
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
    useGetSavedJobsQuery: vi.fn(),
    useRemoveSavedJobMutation: vi.fn(),
    useSaveJobMutation: vi.fn(),
    useSubmitApplicationMutation: vi.fn(),
  };
});

const mockSearchJobs = vi.mocked(useSearchJobsQuery);
const mockFeaturedJobs = vi.mocked(useGetFeaturedJobsQuery);
const mockJobDetails = vi.mocked(useGetJobDetailsQuery);
const mockLatestJobs = vi.mocked(useGetLatestJobsQuery);
const mockNewestJobs = vi.mocked(useGetNewestJobsQuery);
const mockPopularCompanies = vi.mocked(useGetPopularCompaniesQuery);
const mockRelatedJobs = vi.mocked(useGetRelatedJobsQuery);
const mockApplyToJob = vi.mocked(useApplyToJobMutation);
const mockGetSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockRemoveSavedJob = vi.mocked(useRemoveSavedJobMutation);
const mockSaveJob = vi.mocked(useSaveJobMutation);
const mockSubmitApplication = vi.mocked(useSubmitApplicationMutation);
const refetch = vi.fn();

const job: PublicJobSummary = {
  categoryId: '22222222-2222-4222-8222-222222222222',
  categoryName: 'Engineering',
  companyId: '11111111-1111-4111-8111-111111111111',
  companyLogoUrl: null,
  companyName: 'Northstar Labs',
  companySlug: 'northstar-labs',
  currencyCode: 'INR',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  id: '33333333-3333-4333-8333-333333333333',
  isFeatured: true,
  location: 'Pune',
  maximumSalary: 2500000,
  minimumSalary: 1800000,
  publishedAtUtc: '2026-07-20T00:00:00Z',
  referenceNumber: 'JOB-1001',
  slug: 'senior-react-engineer',
  title: 'Senior React Engineer',
  workplaceType: WorkplaceType.Hybrid,
};

const jobDetails: PublicJobDetails = {
  ...job,
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
    data: { items: [], pageNumber: 1, pageSize: 3, totalCount: 0, totalPages: 0 },
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

const applyResult = (
  unwrapResult: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue({
    applicationUrl: null,
    message: 'Granted',
    status: ApplicationAccessStatus.Granted,
  }),
) => {
  const trigger = vi.fn(() => ({ unwrap: unwrapResult }));
  return [trigger, { isLoading: false }] as unknown as ReturnType<typeof useApplyToJobMutation>;
};

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
  renderWithProviders(<RouterProvider router={router} />, { auth: unauthenticated });
};

const renderDetailsPage = (auth: AuthState = unauthenticated) => {
  const router = createMemoryRouter(
    [
      { path: '/jobs/:slug', element: <JobDetailsPage /> },
      { path: '/login', element: <p>Login destination</p> },
      {
        path: '/payment',
        element: (
          <>
            <p>Payments destination</p>
            <LocationProbe />
          </>
        ),
      },
      { path: '/dashboard/applications/:applicationId', element: <p>Application destination</p> },
    ],
    { initialEntries: [`/jobs/${job.slug}`] },
  );
  renderWithProviders(<RouterProvider router={router} />, { auth });
};

beforeEach(() => {
  mockFeaturedJobs.mockReturnValue(collectionResult());
  mockLatestJobs.mockReturnValue(collectionResult());
  mockNewestJobs.mockReturnValue(collectionResult());
  mockPopularCompanies.mockReturnValue(popularCompaniesResult());
  mockRelatedJobs.mockReturnValue(relatedResult());
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
  mockSubmitApplication.mockReturnValue([vi.fn(), { isLoading: false }] as unknown as ReturnType<
    typeof useSubmitApplicationMutation
  >);
});

describe('jobs listing page', () => {
  beforeEach(() => {
    refetch.mockReset();
    mockApplyToJob.mockReturnValue(applyResult());
  });

  it('shows a loading state', () => {
    mockSearchJobs.mockReturnValue(searchResult({ isFetching: true, isLoading: true }));
    renderJobsPage();
    expect(screen.getByLabelText('Loading jobs')).toBeInTheDocument();
  });

  it('renders successful job results', () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [job], pageNumber: 1, pageSize: 12, totalCount: 1, totalPages: 1 },
      }),
    );
    renderJobsPage();
    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByText(job.companyName)).toBeInTheDocument();
  });

  it('renders featured, latest, newest, and popular-company discovery data', async () => {
    const latestJob = { ...job, id: '44444444-4444-4444-8444-444444444444', title: 'Latest role' };
    const newestJob = { ...job, id: '55555555-5555-4555-8555-555555555555', title: 'Newest role' };
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [], pageNumber: 1, pageSize: 12, totalCount: 0, totalPages: 0 },
      }),
    );
    mockFeaturedJobs.mockReturnValue(
      collectionResult({
        data: { items: [job], pageNumber: 1, pageSize: 3, totalCount: 1, totalPages: 1 },
      }),
    );
    mockLatestJobs.mockReturnValue(
      collectionResult({
        data: { items: [latestJob], pageNumber: 1, pageSize: 3, totalCount: 1, totalPages: 1 },
      }),
    );
    mockNewestJobs.mockReturnValue(
      collectionResult({
        data: { items: [newestJob], pageNumber: 1, pageSize: 3, totalCount: 1, totalPages: 1 },
      }),
    );
    mockPopularCompanies.mockReturnValue(
      popularCompaniesResult({
        data: [
          {
            activeJobCount: 4,
            id: job.companyId,
            industry: 'Software',
            isVerified: true,
            location: 'Pune',
            logoUrl: null,
            name: job.companyName,
            slug: job.companySlug,
          },
        ],
      }),
    );
    renderJobsPage();

    expect(screen.getByRole('heading', { name: 'Discover jobs' })).toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Latest published' }));
    expect(screen.getByText('Latest role')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Newest added' }));
    expect(screen.getByText('Newest role')).toBeInTheDocument();
    await userEvent.click(screen.getByText(`${job.companyName} (4)`));
    expect(await screen.findByTestId('location')).toHaveTextContent(
      `/jobs?companyId=${job.companyId}`,
    );
  });

  it('shows an empty state', () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [], pageNumber: 1, pageSize: 12, totalCount: 0, totalPages: 0 },
      }),
    );
    renderJobsPage();
    expect(screen.getByText('No jobs match your search')).toBeInTheDocument();
  });

  it('shows an API failure and retries', async () => {
    mockSearchJobs.mockReturnValue(searchResult({ isError: true }));
    renderJobsPage();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch.mock.calls).toHaveLength(1);
  });

  it('hydrates supported filters from the URL', async () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [job], pageNumber: 2, pageSize: 20, totalCount: 30, totalPages: 2 },
      }),
    );
    renderJobsPage(
      `/jobs?q=react&location=Pune&companyId=${job.companyId}&categoryId=${job.categoryId}&featured=true&workplaceType=remote&page=2&pageSize=20&sort=title-asc`,
    );

    await waitFor(() => {
      const firstCall = mockSearchJobs.mock.calls[0]?.[0];
      expect(firstCall).toMatchObject({
        categoryId: job.categoryId,
        companyId: job.companyId,
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

  it('debounces keyword input into the URL and API query', async () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [job], pageNumber: 1, pageSize: 12, totalCount: 1, totalPages: 1 },
      }),
    );
    renderJobsPage();

    await userEvent.type(screen.getByRole('textbox', { name: 'Keywords' }), 'react');

    await waitFor(
      () => {
        expect(screen.getByTestId('location')).toHaveTextContent('/jobs?q=react');
        expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ search: 'react' });
      },
      { timeout: 1_500 },
    );
  });

  it('updates the URL and query when pagination changes', async () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [job], pageNumber: 1, pageSize: 12, totalCount: 24, totalPages: 2 },
      }),
    );
    renderJobsPage();
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/jobs?page=2');
    await waitFor(() => {
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ pageNumber: 2 });
    });
  });

  it('clears URL-backed filters', async () => {
    mockSearchJobs.mockReturnValue(
      searchResult({
        data: { items: [job], pageNumber: 1, pageSize: 12, totalCount: 1, totalPages: 1 },
      }),
    );
    renderJobsPage(`/jobs?q=react&location=Pune&featured=true&companyId=${job.companyId}`);

    await userEvent.click(screen.getAllByRole('button', { name: 'Clear all' })[0] as HTMLElement);
    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/jobs$/);
  });
});

describe('job details page', () => {
  beforeEach(() => {
    mockApplyToJob.mockReturnValue(applyResult());
  });

  it('renders job details', () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    renderDetailsPage();
    expect(screen.getByRole('heading', { name: job.title })).toBeInTheDocument();
    expect(screen.getByText(jobDetails.description)).toBeInTheDocument();
  });

  it('shows a not-found state for a 404 response', () => {
    mockJobDetails.mockReturnValue(
      detailsResult({ error: { message: 'Not found', status: 404 }, isError: true }),
    );
    renderDetailsPage();
    expect(screen.getByText('Job not found')).toBeInTheDocument();
  });

  it('does not render a stale expired job as an available opportunity', () => {
    mockJobDetails.mockReturnValue(
      detailsResult({ data: { ...jobDetails, expiresAtUtc: '2020-01-01T00:00:00Z' } }),
    );
    renderDetailsPage();
    expect(screen.getByText('Job no longer available')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply now' })).not.toBeInTheDocument();
  });

  it('renders related jobs from the dedicated endpoint', () => {
    const relatedJob = {
      ...job,
      id: '66666666-6666-4666-8666-666666666666',
      slug: 'related-role',
      title: 'Related frontend role',
    };
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    mockRelatedJobs.mockReturnValue(relatedResult({ data: [relatedJob] }));
    renderDetailsPage();

    expect(screen.getByRole('heading', { name: 'Related jobs' })).toBeInTheDocument();
    expect(screen.getByText('Related frontend role')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to login when applying', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    renderDetailsPage();
    await userEvent.click(screen.getByRole('button', { name: 'Apply now' }));
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to login when saving', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    renderDetailsPage();
    await userEvent.click(screen.getByRole('button', { name: `Save ${job.title}` }));
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  it('redirects authenticated candidates without entitlement to payments', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const unwrap = vi.fn().mockResolvedValue({
      applicationUrl: null,
      message: 'Payment Required',
      status: ApplicationAccessStatus.PaymentRequired,
    });
    mockApplyToJob.mockReturnValue(applyResult(unwrap));
    renderDetailsPage(authenticated);

    await userEvent.click(screen.getByRole('button', { name: 'Apply now' }));

    expect(await screen.findByText('Payments destination')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      `/payment?jobId=${job.id}&returnTo=%2Fjobs%2F${job.slug}`,
    );
  });

  it('submits a confirmed application when backend access is granted', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const unwrap = vi.fn().mockResolvedValue({
      applicationUrl: 'https://apply.example.com/role',
      message: 'Application access granted.',
      status: ApplicationAccessStatus.Granted,
    });
    mockApplyToJob.mockReturnValue(applyResult(unwrap));
    const submitUnwrap = vi.fn().mockResolvedValue({
      companyName: job.companyName,
      coverLetter: 'Please consider my application.',
      id: 'application-id',
      jobId: job.id,
      jobSlug: job.slug,
      jobTitle: job.title,
      resumeFileName: null,
      status: 1,
      submittedAtUtc: '2026-07-29T00:00:00Z',
      withdrawnAtUtc: null,
    });
    const submit = vi.fn(() => ({ unwrap: submitUnwrap }));
    mockSubmitApplication.mockReturnValue([submit, { isLoading: false }] as unknown as ReturnType<
      typeof useSubmitApplicationMutation
    >);
    renderDetailsPage(authenticated);

    await userEvent.click(screen.getByRole('button', { name: 'Apply now' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Cover letter' }),
      'Please consider my application.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    expect(submit).toHaveBeenCalledWith({
      coverLetter: 'Please consider my application.',
      jobId: job.id,
    });
    expect(await screen.findByText('Application destination')).toBeInTheDocument();
  });
});

describe('share button', () => {
  it('uses the clipboard fallback when Web Share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
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

  it('offers a keyboard-accessible manual copy fallback when browser APIs are unavailable', async () => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });

    renderWithProviders(
      <ShareButton
        text="A job"
        title="Senior React Engineer"
        url="https://example.com/jobs/react"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share job' }));

    const linkField = await screen.findByRole('textbox', { name: 'Job link' });
    expect(linkField).toHaveValue('https://example.com/jobs/react');
    expect(linkField).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Copy job link' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Share job' })).toHaveFocus();
    });
  });
});
