import {
  useApplyToJobMutation,
  useGetJobDetailsQuery,
  useSearchJobsQuery,
} from '@/features/jobs/api/jobsApi';
import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import {
  useGetSavedJobsQuery,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
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
    useGetJobDetailsQuery: vi.fn(),
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
  };
});

const mockSearchJobs = vi.mocked(useSearchJobsQuery);
const mockJobDetails = vi.mocked(useGetJobDetailsQuery);
const mockApplyToJob = vi.mocked(useApplyToJobMutation);
const mockGetSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockRemoveSavedJob = vi.mocked(useRemoveSavedJobMutation);
const mockSaveJob = vi.mocked(useSaveJobMutation);
const refetch = vi.fn();

const job: PublicJobSummary = {
  categoryId: 'category-id',
  categoryName: 'Engineering',
  companyId: 'company-id',
  companyLogoUrl: null,
  companyName: 'Northstar Labs',
  companySlug: 'northstar-labs',
  currencyCode: 'INR',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  id: 'job-id',
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

const applyResult = (
  unwrapResult: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue({
    applicationUrl: null,
    companyId: null,
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
    ],
    { initialEntries: [`/jobs/${job.slug}`] },
  );
  renderWithProviders(<RouterProvider router={router} />, { auth });
};

beforeEach(() => {
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
      '/jobs?q=react&location=Pune&workplaceType=remote&page=2&pageSize=20&sort=title-asc',
    );

    await waitFor(() => {
      const firstCall = mockSearchJobs.mock.calls[0]?.[0];
      expect(firstCall).toMatchObject({
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

  it('disables Apply for an expired job', () => {
    mockJobDetails.mockReturnValue(
      detailsResult({ data: { ...jobDetails, expiresAtUtc: '2020-01-01T00:00:00Z' } }),
    );
    renderDetailsPage();
    expect(screen.getByRole('button', { name: 'Applications closed' })).toBeDisabled();
  });

  it('redirects unauthenticated visitors to login when applying', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    renderDetailsPage();
    await userEvent.click(screen.getByRole('button', { name: 'Apply now' }));
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  it('redirects authenticated candidates without entitlement to payments', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const unwrap = vi.fn().mockResolvedValue({
      applicationUrl: null,
      companyId: job.companyId,
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

  it('continues to the employer application when backend access is granted', async () => {
    mockJobDetails.mockReturnValue(detailsResult({ data: jobDetails }));
    const unwrap = vi.fn().mockResolvedValue({
      applicationUrl: 'https://apply.example.com/role',
      companyId: job.companyId,
      message: 'Application access granted.',
      status: ApplicationAccessStatus.Granted,
    });
    mockApplyToJob.mockReturnValue(applyResult(unwrap));
    renderDetailsPage(authenticated);

    await userEvent.click(screen.getByRole('button', { name: 'Apply now' }));

    expect(await screen.findByRole('link', { name: /continue to the employer/i })).toHaveAttribute(
      'href',
      'https://apply.example.com/role',
    );
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
