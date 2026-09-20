import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AdminApiModule from '@/features/admin/api/adminApi';
import {
  useArchiveAdminJobMutation,
  useCloseAdminJobMutation,
  useComposeAdminJobMutation,
  useCreateAdminJobMutation,
  useFeatureAdminJobMutation,
  useGetAdminApplicationsQuery,
  useGetAdminCategoryOptionsQuery,
  useGetAdminChartsQuery,
  useGetAdminCompanyOptionsQuery,
  useGetAdminJobQuery,
  useGetAdminJobsQuery,
  useGetAdminRecentPaymentsQuery,
  useGetAdminRecentUsersQuery,
  useGetAdminStatisticsQuery,
  usePublishAdminJobMutation,
  useSetAdminJobFeaturedMutation,
  useSetAdminJobHiddenMutation,
  useSoftDeleteAdminJobMutation,
  useUnfeatureAdminJobMutation,
  useUnpublishAdminJobMutation,
  useUpdateAdminJobMutation,
} from '@/features/admin/api/adminApi';
import { AdminJobForm } from '@/features/admin/components/AdminJobForm';
import {
  JobStatus,
  UserStatus,
  type AdminDashboardCharts,
  type AdminDashboardStatistics,
  type AdminJob,
  type AdminJobRequest,
  type RecentAdminPayment,
  type RecentAdminUser,
} from '@/features/admin/types/adminModels';
import { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';
import { PaymentProvider, PaymentStatus } from '@/features/payments/types/paymentModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AdminApplicationDetailsPage } from './AdminApplicationDetailsPage';
import { AdminApplicationsPage } from './AdminApplicationsPage';
import { AdminCreateJobPage } from './AdminCreateJobPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminEditJobPage } from './AdminEditJobPage';
import { AdminJobsPage } from './AdminJobsPage';
import { AdminPaymentDetailsPage } from './AdminPaymentDetailsPage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminUserDetailsPage } from './AdminUserDetailsPage';
import { AdminUsersPage } from './AdminUsersPage';

vi.mock('@/features/admin/api/adminApi', async (importOriginal) => {
  const actual = await importOriginal<typeof AdminApiModule>();
  return {
    ...actual,
    useArchiveAdminJobMutation: vi.fn(),
    useCloseAdminJobMutation: vi.fn(),
    useComposeAdminJobMutation: vi.fn(),
    useCreateAdminJobMutation: vi.fn(),
    useFeatureAdminJobMutation: vi.fn(),
    useGetAdminApplicationsQuery: vi.fn(),
    useGetAdminCategoryOptionsQuery: vi.fn(),
    useGetAdminChartsQuery: vi.fn(),
    useGetAdminCompanyOptionsQuery: vi.fn(),
    useGetAdminJobQuery: vi.fn(),
    useGetAdminJobsQuery: vi.fn(),
    useGetAdminRecentPaymentsQuery: vi.fn(),
    useGetAdminRecentUsersQuery: vi.fn(),
    useGetAdminStatisticsQuery: vi.fn(),
    usePublishAdminJobMutation: vi.fn(),
    useSetAdminJobFeaturedMutation: vi.fn(),
    useSetAdminJobHiddenMutation: vi.fn(),
    useSoftDeleteAdminJobMutation: vi.fn(),
    useUnfeatureAdminJobMutation: vi.fn(),
    useUnpublishAdminJobMutation: vi.fn(),
    useUpdateAdminJobMutation: vi.fn(),
  };
});

const mockStatistics = vi.mocked(useGetAdminStatisticsQuery);
const mockRecentPayments = vi.mocked(useGetAdminRecentPaymentsQuery);
const mockRecentUsers = vi.mocked(useGetAdminRecentUsersQuery);
const mockCharts = vi.mocked(useGetAdminChartsQuery);
const mockJobs = vi.mocked(useGetAdminJobsQuery);
const mockJob = vi.mocked(useGetAdminJobQuery);
const mockCreate = vi.mocked(useCreateAdminJobMutation);
const mockCompose = vi.mocked(useComposeAdminJobMutation);
const mockUpdate = vi.mocked(useUpdateAdminJobMutation);
const mockPublish = vi.mocked(usePublishAdminJobMutation);
const mockArchive = vi.mocked(useArchiveAdminJobMutation);
const mockClose = vi.mocked(useCloseAdminJobMutation);
const mockUnpublish = vi.mocked(useUnpublishAdminJobMutation);
const mockFeature = vi.mocked(useFeatureAdminJobMutation);
const mockUnfeature = vi.mocked(useUnfeatureAdminJobMutation);
const mockFeatured = vi.mocked(useSetAdminJobFeaturedMutation);
const mockHidden = vi.mocked(useSetAdminJobHiddenMutation);
const mockDelete = vi.mocked(useSoftDeleteAdminJobMutation);
const mockCompanyOptions = vi.mocked(useGetAdminCompanyOptionsQuery);
const mockCategoryOptions = vi.mocked(useGetAdminCategoryOptionsQuery);
const mockApplications = vi.mocked(useGetAdminApplicationsQuery);
const refetch = vi.fn();
const jobId = '5aeb6d48-035e-4f58-aa6f-c222ffe27e97';
const companyId = 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276';
const categoryId = '51741c58-0587-4c68-866e-acfe9b36836c';
const userId = 'a785e48e-edeb-433b-a02e-f610d5620e87';
const paymentId = '721e999a-3b15-46aa-aa66-bfdfd174ba14';

const job: AdminJob = {
  applicationUrl: 'https://apply.example.com',
  benefits: 'Flexible work',
  categoryId,
  categoryName: 'Engineering',
  companyId,
  companyName: 'Northstar Labs',
  createdAtUtc: '2026-07-27T08:00:00Z',
  currencyCode: 'INR',
  deletedAtUtc: null,
  description: 'Build accessible products.',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  id: jobId,
  isDeleted: false,
  isFeatured: false,
  isHidden: false,
  location: 'Pune',
  maximumSalary: 2500000,
  minimumSalary: 1800000,
  publishedAtUtc: null,
  referenceNumber: 'JOB-20260727-1234ABCD',
  requirements: 'TypeScript experience.',
  responsibilities: 'Lead frontend delivery.',
  slug: 'frontend-engineer-1234abcd',
  status: JobStatus.Draft,
  title: 'Frontend Engineer',
  updatedAtUtc: null,
  workplaceType: WorkplaceType.Hybrid,
};

const user: RecentAdminUser = {
  createdAtUtc: '2026-07-27T08:00:00Z',
  email: 'avery@example.com',
  emailConfirmed: true,
  firstName: 'Avery',
  id: userId,
  lastLoginAtUtc: '2026-07-28T08:00:00Z',
  lastName: 'Patel',
  status: UserStatus.Active,
};

const payment: RecentAdminPayment = {
  amount: 499,
  createdAtUtc: '2026-07-28T08:00:00Z',
  currencyCode: 'INR',
  id: paymentId,
  paidAtUtc: '2026-07-28T08:01:00Z',
  provider: PaymentProvider.Razorpay,
  providerPaymentId: 'pay_safe_reference',
  status: PaymentStatus.Paid,
  userEmail: user.email,
  userId,
  userName: `${user.firstName} ${user.lastName}`,
};

const charts: AdminDashboardCharts = {
  categories: [{ id: categoryId, label: 'Engineering', value: 3 }],
  companies: [{ id: companyId, label: 'Northstar Labs', value: 2 }],
  jobs: [],
  revenue: [],
  users: [],
};

const statistics: AdminDashboardStatistics = {
  expiredJobs: 2,
  featuredJobs: 3,
  generatedAtUtc: '2026-07-28T08:00:00Z',
  paidUsers: 8,
  publishedJobs: 10,
  revenue: [{ currencyCode: 'INR', thisMonth: 1500, total: 5000 }],
  totalCategories: 6,
  totalCompanies: 4,
  totalJobs: 15,
  totalUsers: 42,
};

const queryResult = <T,>(data?: T, overrides: Record<string, unknown> = {}) =>
  ({
    data,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown;

const mutationResult = <T,>(value?: T) => {
  const unwrap = vi.fn().mockResolvedValue(value);
  const trigger = vi.fn((argument?: unknown) => {
    void argument;
    return { unwrap };
  });
  return { trigger, tuple: [trigger, { isLoading: false }] };
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderPage = (element: React.ReactElement) =>
  renderWithProviders(<MemoryRouter>{element}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  mockStatistics.mockReturnValue(
    queryResult(statistics) as ReturnType<typeof useGetAdminStatisticsQuery>,
  );
  mockRecentPayments.mockReturnValue(
    queryResult([payment]) as ReturnType<typeof useGetAdminRecentPaymentsQuery>,
  );
  mockRecentUsers.mockReturnValue(
    queryResult([user]) as ReturnType<typeof useGetAdminRecentUsersQuery>,
  );
  mockCharts.mockReturnValue(queryResult(charts) as ReturnType<typeof useGetAdminChartsQuery>);
  mockCompanyOptions.mockReturnValue(
    queryResult([{ id: companyId, name: 'Northstar Labs', slug: 'northstar-labs' }]) as ReturnType<
      typeof useGetAdminCompanyOptionsQuery
    >,
  );
  mockCategoryOptions.mockReturnValue(
    queryResult([{ id: categoryId, name: 'Engineering', slug: 'engineering' }]) as ReturnType<
      typeof useGetAdminCategoryOptionsQuery
    >,
  );
  mockApplications.mockReturnValue(
    queryResult({
      items: [],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }) as ReturnType<typeof useGetAdminApplicationsQuery>,
  );
  mockJobs.mockReturnValue(
    queryResult({
      items: [job],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 11,
      totalPages: 2,
    }) as ReturnType<typeof useGetAdminJobsQuery>,
  );
  mockJob.mockReturnValue(queryResult(job) as ReturnType<typeof useGetAdminJobQuery>);
  mockCreate.mockReturnValue(
    mutationResult(job).tuple as unknown as ReturnType<typeof useCreateAdminJobMutation>,
  );
  mockCompose.mockReturnValue(
    mutationResult({
      id: job.id,
      slug: job.slug,
      status: JobStatus.Draft,
      company: { id: companyId, name: 'Northstar Labs', created: false },
      category: { id: categoryId, name: 'Engineering', created: false },
    }).tuple as unknown as ReturnType<typeof useComposeAdminJobMutation>,
  );
  mockUpdate.mockReturnValue(
    mutationResult(job).tuple as unknown as ReturnType<typeof useUpdateAdminJobMutation>,
  );
  mockPublish.mockReturnValue(
    mutationResult({ ...job, status: JobStatus.Published }).tuple as unknown as ReturnType<
      typeof usePublishAdminJobMutation
    >,
  );
  mockArchive.mockReturnValue(
    mutationResult({ ...job, status: JobStatus.Archived }).tuple as unknown as ReturnType<
      typeof useArchiveAdminJobMutation
    >,
  );
  mockClose.mockReturnValue(
    mutationResult({ ...job, status: JobStatus.Closed }).tuple as unknown as ReturnType<
      typeof useCloseAdminJobMutation
    >,
  );
  mockUnpublish.mockReturnValue(
    mutationResult({ ...job, status: JobStatus.Draft }).tuple as unknown as ReturnType<
      typeof useUnpublishAdminJobMutation
    >,
  );
  mockFeature.mockReturnValue(
    mutationResult({ ...job, isFeatured: true }).tuple as unknown as ReturnType<
      typeof useFeatureAdminJobMutation
    >,
  );
  mockUnfeature.mockReturnValue(
    mutationResult({ ...job, isFeatured: false }).tuple as unknown as ReturnType<
      typeof useUnfeatureAdminJobMutation
    >,
  );
  mockFeatured.mockReturnValue(
    mutationResult(job).tuple as unknown as ReturnType<typeof useSetAdminJobFeaturedMutation>,
  );
  mockHidden.mockReturnValue(
    mutationResult(job).tuple as unknown as ReturnType<typeof useSetAdminJobHiddenMutation>,
  );
  mockDelete.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useSoftDeleteAdminJobMutation>,
  );
});

describe('admin overview', () => {
  it('renders a loading state', () => {
    const loading = queryResult(undefined, { isLoading: true });
    mockStatistics.mockReturnValue(loading as ReturnType<typeof useGetAdminStatisticsQuery>);
    mockRecentPayments.mockReturnValue(
      loading as ReturnType<typeof useGetAdminRecentPaymentsQuery>,
    );
    mockRecentUsers.mockReturnValue(loading as ReturnType<typeof useGetAdminRecentUsersQuery>);
    mockCharts.mockReturnValue(loading as ReturnType<typeof useGetAdminChartsQuery>);
    mockJobs.mockReturnValue(loading as ReturnType<typeof useGetAdminJobsQuery>);
    renderPage(<AdminDashboardPage />);
    expect(screen.getByLabelText('Loading admin overview')).toBeInTheDocument();
  });

  it('renders real overview statistics and recent activity', () => {
    renderPage(<AdminDashboardPage />);
    expect(
      within(screen.getByText('Total users').parentElement!).getByText('42'),
    ).toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByText(user.email, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/₹5,000/)).toBeInTheDocument();
  });

  it('renders a retryable complete API failure', () => {
    const failed = queryResult(undefined, { isError: true });
    mockStatistics.mockReturnValue(failed as ReturnType<typeof useGetAdminStatisticsQuery>);
    mockRecentPayments.mockReturnValue(failed as ReturnType<typeof useGetAdminRecentPaymentsQuery>);
    mockRecentUsers.mockReturnValue(failed as ReturnType<typeof useGetAdminRecentUsersQuery>);
    mockCharts.mockReturnValue(failed as ReturnType<typeof useGetAdminChartsQuery>);
    mockJobs.mockReturnValue(failed as ReturnType<typeof useGetAdminJobsQuery>);
    renderPage(<AdminDashboardPage />);
    expect(screen.getByText('Admin overview unavailable')).toBeInTheDocument();
  });
});

describe('admin jobs', () => {
  it('opens the draft moderation queue using the existing status query', async () => {
    renderPage(<AdminJobsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Review draft jobs' }));
    expect(screen.getByRole('heading', { name: 'Draft job moderation' })).toBeVisible();
    await waitFor(() => expect(mockJobs.mock.calls.at(-1)?.[0]).toMatchObject({ status: JobStatus.Draft, pageNumber: 1, isDeleted: false }));
    expect(screen.getAllByRole('button', { name: 'Publish' }).length).toBeGreaterThan(0);
  });
  it('opens the jobs CSV import dialog beside the create action', async () => {
    renderPage(<AdminJobsPage />);
    expect(screen.getByRole('link', { name: 'Create job' })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Manage companies|Manage categories/ })).toBeNull();
    expect(screen.queryByRole('combobox', { name: /Company|Category/ })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    expect(screen.getByRole('dialog', { name: 'Import jobs CSV' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Download job CSV template' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview import' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Commit import' })).toBeDisabled();
    expect(screen.queryByText(/companies CSV|categories CSV/i)).toBeNull();
  });

  it('preserves search and pagination in URL-backed filters', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin/jobs',
          element: (
            <>
              <AdminJobsPage />
              <LocationProbe />
            </>
          ),
        },
      ],
      { initialEntries: ['/admin/jobs'] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Search jobs' }), 'react');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('search=react'), {
      timeout: 1_500,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(await screen.findByTestId('location')).toHaveTextContent('page=2');
    await waitFor(() =>
      expect(mockJobs.mock.calls.at(-1)?.[0]).toMatchObject({
        pageNumber: 2,
        search: 'react',
      }),
    );
  });

  it('requires confirmation before publishing', async () => {
    const mutation = mutationResult({ ...job, status: JobStatus.Published });
    mockPublish.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof usePublishAdminJobMutation>,
    );
    renderPage(<AdminJobsPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Publish' })[0]!);
    expect(mutation.trigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Publish job' }));
    expect(mutation.trigger).toHaveBeenCalledWith(job.id);
  });

  it('requires confirmation before soft deletion', async () => {
    const mutation = mutationResult();
    mockDelete.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useSoftDeleteAdminJobMutation>,
    );
    renderPage(<AdminJobsPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    expect(mutation.trigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete job' }));
    expect(mutation.trigger).toHaveBeenCalledWith(job.id);
  });

  it('integrates unpublish, close, and feature lifecycle actions for published jobs', async () => {
    const publishedJob = { ...job, status: JobStatus.Published };
    mockJobs.mockReturnValue(
      queryResult({
        items: [publishedJob],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      }) as ReturnType<typeof useGetAdminJobsQuery>,
    );
    const unpublish = mutationResult({ ...publishedJob, status: JobStatus.Draft });
    const close = mutationResult({ ...publishedJob, status: JobStatus.Closed });
    const feature = mutationResult({ ...publishedJob, isFeatured: true });
    mockUnpublish.mockReturnValue(
      unpublish.tuple as unknown as ReturnType<typeof useUnpublishAdminJobMutation>,
    );
    mockClose.mockReturnValue(
      close.tuple as unknown as ReturnType<typeof useCloseAdminJobMutation>,
    );
    mockFeature.mockReturnValue(
      feature.tuple as unknown as ReturnType<typeof useFeatureAdminJobMutation>,
    );
    renderPage(<AdminJobsPage />);

    await userEvent.click(screen.getAllByRole('button', { name: 'Unpublish' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Unpublish job' }));
    expect(unpublish.trigger).toHaveBeenCalledWith(job.id);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Close job' }));
    expect(close.trigger).toHaveBeenCalledWith(job.id);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(screen.getAllByRole('button', { name: 'Feature' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Feature job' }));
    expect(feature.trigger).toHaveBeenCalledWith(job.id);
  });

  it('renders backend text safely instead of interpreting markup', () => {
    mockJobs.mockReturnValue(
      queryResult({
        items: [{ ...job, title: '<img src=x onerror=alert(1)>' }],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      }) as ReturnType<typeof useGetAdminJobsQuery>,
    );
    renderPage(<AdminJobsPage />);
    expect(screen.getAllByText('<img src=x onerror=alert(1)>').length).toBeGreaterThan(0);
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
});

describe('admin job forms', () => {
  it('shows create-job validation errors', async () => {
    renderPage(<AdminCreateJobPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    expect(await screen.findByText('Job title is required.')).toBeInTheDocument();
    expect(screen.queryByText('Description is required.')).not.toBeInTheDocument();
  });

  it('creates a valid backend draft once', async () => {
    const mutation = mutationResult({
      id: job.id,
      slug: job.slug,
      status: JobStatus.Draft,
      company: { id: companyId, name: 'Northstar Labs', created: false },
      category: { id: categoryId, name: 'Engineering', created: false },
    });
    mockCompose.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useComposeAdminJobMutation>,
    );
    const router = createMemoryRouter(
      [
        { path: '/admin/jobs/create', element: <AdminCreateJobPage /> },
        { path: '/admin/jobs/:jobId/edit', element: <p>Edit destination</p> },
      ],
      { initialEntries: ['/admin/jobs/create'] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    await userEvent.type(screen.getByRole('textbox', { name: /job title/i }), 'Frontend Engineer');
    await userEvent.type(screen.getByRole('textbox', { name: /company name/i }), 'Northstar Labs');
    await userEvent.type(screen.getByRole('textbox', { name: /category name/i }), 'Engineering');
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
    expect(await screen.findByText('Edit destination')).toBeInTheDocument();
    expect(mutation.trigger).toHaveBeenCalledOnce();
  });

  it('renders edit loading and submits the required private application URL', async () => {
    mockJob.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useGetAdminJobQuery>,
    );
    const loadingRouter = createMemoryRouter(
      [{ path: '/admin/jobs/:jobId/edit', element: <AdminEditJobPage /> }],
      { initialEntries: [`/admin/jobs/${jobId}/edit`] },
    );
    const view = renderWithProviders(<RouterProvider router={loadingRouter} />);
    expect(screen.getByLabelText('Loading job editor')).toBeInTheDocument();
    view.unmount();

    mockJob.mockReturnValue(queryResult(job) as ReturnType<typeof useGetAdminJobQuery>);
    const mutation = mutationResult(job);
    mockUpdate.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useUpdateAdminJobMutation>,
    );
    const router = createMemoryRouter(
      [{ path: '/admin/jobs/:jobId/edit', element: <AdminEditJobPage /> }],
      { initialEntries: [`/admin/jobs/${jobId}/edit`] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('textbox', { name: /application url/i })).toHaveValue(
      'https://apply.example.com',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledOnce());
    const updateArgument = mutation.trigger.mock.calls[0]?.[0] as
      { jobId: string; request: AdminJobRequest } | undefined;
    expect(updateArgument?.jobId).toBe(jobId);
    expect(updateArgument?.request.applicationUrl).toBe('https://apply.example.com');
  });

  it('prevents simultaneous form submissions', async () => {
    let finishSubmission: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmission = resolve;
        }),
    );
    renderPage(
      <AdminJobForm
        categories={charts.categories}
        companies={charts.companies}
        initialJob={job}
        isSaving={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        submitLabel="Save changes"
      />,
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: /application url/i }),
      'https://apply.example.com',
    );
    const submit = screen.getByRole('button', { name: 'Save changes' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    finishSubmission?.();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
  });
});

describe('limited admin modules', () => {
  it('filters the displayed recent-user report and exposes no account mutation', async () => {
    renderPage(<AdminUsersPage />);
    expect(screen.getAllByText(user.email).length).toBeGreaterThan(0);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Filter displayed users' }),
      'missing',
    );
    expect(await screen.findByText('No users found')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /activate|deactivate|role/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the integrated empty application state and honest user-detail state', () => {
    const router = createMemoryRouter(
      [
        { path: '/admin/applications', element: <AdminApplicationsPage /> },
        {
          path: '/admin/applications/:applicationId',
          element: <AdminApplicationDetailsPage />,
        },
        { path: '/admin/users/:userId', element: <AdminUserDetailsPage /> },
      ],
      { initialEntries: ['/admin/applications'] },
    );
    const view = renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByText('No applications found')).toBeInTheDocument();
    view.unmount();

    const detailRouter = createMemoryRouter(
      [{ path: '/admin/users/:userId', element: <AdminUserDetailsPage /> }],
      { initialEntries: [`/admin/users/${userId}`] },
    );
    renderWithProviders(<RouterProvider router={detailRouter} />);
    expect(screen.getByText('User details unavailable')).toBeInTheDocument();
  });

  it('renders safe recent-payment summaries and read-only details', async () => {
    const router = createMemoryRouter(
      [
        { path: '/admin/payments', element: <AdminPaymentsPage /> },
        { path: '/admin/payments/:paymentId', element: <AdminPaymentDetailsPage /> },
      ],
      { initialEntries: ['/admin/payments'] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getAllByText(payment.id).length).toBeGreaterThan(0);
    await userEvent.click(screen.getAllByRole('link', { name: 'View summary' })[0]!);
    expect(await screen.findByRole('heading', { name: 'Payment summary' })).toBeInTheDocument();
    expect(screen.getByText(/strictly read-only/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /reconcile|refund|activate/i }),
    ).not.toBeInTheDocument();
  });
});
