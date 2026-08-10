import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import {
  useGetApplicationQuotaQuery,
  useGetProfileQuery,
  useGetRecommendedJobsQuery,
  useGetResumeStatusQuery,
  useGetMembershipsQuery,
  useGetSavedJobsQuery,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import {
  fetchJobApplicationUrl,
  useGetJobFilterOptionsQuery,
  useGetSupplementalJobFilterCountsQuery,
  useSearchJobsQuery,
} from '@/features/jobs/api/jobsApi';
import {
  CompanyType,
  EmploymentType,
  ExperienceLevel,
  PostedByType,
  WorkplaceType,
  type PublicJobFilterOptions,
  type PublicJobSummary,
} from '@/features/jobs/types/jobModels';
import type { AuthState } from '@/features/auth/store/authSlice';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';
import { UserDashboardLayout } from '@/layouts/UserDashboardLayout';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { CandidateBrowseJobsPage } from './CandidateBrowseJobsPage';

vi.mock('@/features/jobs/api/jobsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof JobsApiModule>();
  return {
    ...actual,
    fetchJobApplicationUrl: vi.fn(),
    useGetJobFilterOptionsQuery: vi.fn(),
    useGetSupplementalJobFilterCountsQuery: vi.fn(),
    useSearchJobsQuery: vi.fn(),
  };
});

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return {
    ...actual,
    useGetApplicationQuotaQuery: vi.fn(),
    useGetProfileQuery: vi.fn(),
    useGetRecommendedJobsQuery: vi.fn(),
    useGetResumeStatusQuery: vi.fn(),
    useGetMembershipsQuery: vi.fn(),
    useGetSavedJobsQuery: vi.fn(),
    useRemoveSavedJobMutation: vi.fn(),
    useSaveJobMutation: vi.fn(),
    useSubmitApplicationMutation: vi.fn(),
    useUploadResumeMutation: vi.fn(),
  };
});

const mockSearchJobs = vi.mocked(useSearchJobsQuery);
const mockFetchJobApplicationUrl = vi.mocked(fetchJobApplicationUrl);
const mockFilterOptions = vi.mocked(useGetJobFilterOptionsQuery);
const mockSupplementalCounts = vi.mocked(useGetSupplementalJobFilterCountsQuery);
const mockQuota = vi.mocked(useGetApplicationQuotaQuery);
const mockProfile = vi.mocked(useGetProfileQuery);
const mockRecommended = vi.mocked(useGetRecommendedJobsQuery);
const mockResumeStatus = vi.mocked(useGetResumeStatusQuery);
const mockUploadResume = vi.mocked(useUploadResumeMutation);
const mockMemberships = vi.mocked(useGetMembershipsQuery);
const mockSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockSaveJob = vi.mocked(useSaveJobMutation);
const mockRemoveSavedJob = vi.mocked(useRemoveSavedJobMutation);
const mockSubmitApplication = vi.mocked(useSubmitApplicationMutation);
const refetchJobs = vi.fn();
const refetchFilters = vi.fn();

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
  categoryId: '22222222-2222-4222-8222-222222222222',
  categoryName: 'Engineering',
  companyId: '11111111-1111-4111-8111-111111111111',
  companyLogoUrl: null,
  companyName: 'Northstar Labs',
  companySlug: 'northstar-labs',
  companyType: CompanyType.Startup,
  currencyCode: 'INR',
  department: 'Engineering',
  educationRequirement: 'B.Tech',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Mid,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  id: '33333333-3333-4333-8333-333333333333',
  industry: 'Technology',
  internshipDurationMonths: null,
  isFeatured: true,
  isFlexibleDuration: false,
  location: 'Pune',
  maximumExperienceYears: 5,
  maximumSalary: 2_500_000,
  minimumExperienceYears: 2,
  minimumSalary: 1_800_000,
  postedByType: PostedByType.Company,
  publishedAtUtc: '2026-07-20T00:00:00Z',
  referenceNumber: 'JOB-1001',
  roleCategory: 'Software Development',
  slug: 'senior-react-engineer',
  title: 'Senior React Engineer',
  workplaceType: WorkplaceType.Remote,
};

const options: PublicJobFilterOptions = {
  companies: [{ count: 9, id: job.companyId, name: job.companyName }],
  companyTypes: [
    { count: 9, value: CompanyType.Startup },
    { count: 0, value: CompanyType.Corporate },
  ],
  departments: [
    { count: 12, value: 'Engineering' },
    { count: 8, value: 'Design' },
    { count: 7, value: 'Product' },
    { count: 6, value: 'Sales' },
    { count: 5, value: 'Operations' },
    { count: 4, value: 'Marketing' },
  ],
  educationRequirements: [{ count: 7, value: 'B.Tech' }],
  employmentTypes: [
    { count: 15, value: EmploymentType.FullTime },
    { count: 5, value: EmploymentType.Internship },
  ],
  experienceRange: { count: 18, maximum: 8, minimum: 0 },
  industries: [{ count: 10, value: 'Technology' }],
  internshipDurations: [{ count: 5, isFlexible: false, label: '3 months', months: 3 }],
  locations: [
    { count: 12, value: 'Pune' },
    { count: 0, value: 'Mumbai' },
  ],
  postedByTypes: [{ count: 16, value: PostedByType.Company }],
  roleCategories: [{ count: 11, value: 'Software Development' }],
  salaryRange: { count: 16, maximum: 3_000_000, minimum: 100_000 },
  workModes: [
    { count: 14, value: WorkplaceType.Remote },
    { count: 7, value: WorkplaceType.Hybrid },
    { count: 0, value: WorkplaceType.OnSite },
  ],
};

const queryResult = <T,>(data: T | undefined, overrides: Record<string, unknown> = {}) =>
  ({
    data,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  }) as unknown;

const mutationResult = () => {
  const unwrap = vi.fn().mockResolvedValue(undefined);
  const trigger = vi.fn(() => ({ unwrap }));
  return [trigger, { isLoading: false }] as const;
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderPage = (initialEntry = '/dashboard/jobs') => {
  const router = createMemoryRouter(
    [
      {
        path: '/dashboard/jobs',
        element: (
          <>
            <CandidateBrowseJobsPage />
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries: [initialEntry] },
  );
  return renderWithProviders(<RouterProvider router={router} />, { auth: candidateAuth });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchJobs.mockReturnValue(
    queryResult(
      { items: [job], pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
      { refetch: refetchJobs },
    ) as ReturnType<typeof useSearchJobsQuery>,
  );
  mockFilterOptions.mockReturnValue(
    queryResult(options, { refetch: refetchFilters }) as ReturnType<
      typeof useGetJobFilterOptionsQuery
    >,
  );
  mockSupplementalCounts.mockReturnValue(
    queryResult({
      featured: 6,
      freshness: { 1: 3, 3: 7, 7: 12, 15: 16, 30: 20 },
    }) as ReturnType<typeof useGetSupplementalJobFilterCountsQuery>,
  );
  mockQuota.mockReturnValue(
    queryResult({
      isPremium: false,
      limit: 10,
      plan: 'Free',
      remainingApplications: 7,
      resetsAtUtc: '2026-08-31T00:00:00Z',
      usedApplications: 3,
    }) as ReturnType<typeof useGetApplicationQuotaQuery>,
  );
  mockProfile.mockReturnValue(queryResult({ resume: null }) as ReturnType<typeof useGetProfileQuery>);
  mockResumeStatus.mockReturnValue(
    queryResult({ extractedAtUtc: null, extractionStatus: 0, hasResume: false, message: 'Upload a resume.' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
  );
  mockRecommended.mockReturnValue(
    queryResult({ extractionStatus: 2, items: [], message: '', pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0 }) as ReturnType<typeof useGetRecommendedJobsQuery>,
  );
  mockUploadResume.mockReturnValue(mutationResult() as unknown as ReturnType<typeof useUploadResumeMutation>);
  mockMemberships.mockReturnValue(queryResult([]) as ReturnType<typeof useGetMembershipsQuery>);
  mockSavedJobs.mockReturnValue(
    queryResult({
      items: [],
      pageNumber: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
    }) as ReturnType<typeof useGetSavedJobsQuery>,
  );
  mockSaveJob.mockReturnValue(mutationResult() as unknown as ReturnType<typeof useSaveJobMutation>);
  mockRemoveSavedJob.mockReturnValue(
    mutationResult() as unknown as ReturnType<typeof useRemoveSavedJobMutation>,
  );
  mockFetchJobApplicationUrl.mockResolvedValue(
    'https://careers.example.com/jobs/senior-react-engineer',
  );
  mockSubmitApplication.mockReturnValue(
    mutationResult() as unknown as ReturnType<typeof useSubmitApplicationMutation>,
  );
});

describe('Candidate Browse jobs', () => {
  it('keeps selected facets in the URL and renders exact backend counts', async () => {
    renderPage('/dashboard/jobs?workMode=remote&page=2');

    expect(screen.getByRole('checkbox', { name: 'Remote (14)' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Last 24 hours (3)' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Featured jobs only (6)' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Work from office (0)' })).toBeNull();
    expect(screen.getByText('Applied (1)')).toBeVisible();
    expect(screen.getByText('Free applications: 3 of 10 used this month')).toBeVisible();
    expect(screen.queryByRole('checkbox', { name: 'Marketing (4)' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'View more (1)' }));
    expect(screen.getByRole('checkbox', { name: 'Marketing (4)' })).toBeInTheDocument();
    expect(mockSearchJobs.mock.calls[0]?.[0]).toMatchObject({
      pageNumber: 2,
      workModes: [WorkplaceType.Remote],
    });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Hybrid (7)' }));
    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      expect(location).toContain('workMode=remote');
      expect(location).toContain('workMode=hybrid');
      expect(location).not.toContain('page=2');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(await screen.findByTestId('location')).toHaveTextContent('/dashboard/jobs');
  });

  it('debounces keyword search into shareable URL state', async () => {
    renderPage();
    await userEvent.type(screen.getByRole('textbox', { name: 'Search jobs' }), 'react');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('q=react'), {
      timeout: 1_500,
    });
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      pageNumber: 1,
    });
  });

  it('uses free-text company and category filters on desktop and mobile', async () => {
    renderPage('/dashboard/jobs?page=3');
    expect(screen.queryByRole('checkbox', { name: /Northstar Labs/ })).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Company name' }), ' HARMAN ');
    await waitFor(
      () => expect(screen.getByTestId('location')).toHaveTextContent('companyName=HARMAN'),
      { timeout: 1_500 },
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Category name' }),
      'Artificial Intelligence',
    );
    await waitFor(
      () => {
        const location = screen.getByTestId('location').textContent ?? '';
        expect(location).toContain('companyName=HARMAN');
        expect(location).toContain('categoryName=Artificial+Intelligence');
        expect(location).not.toContain('page=3');
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

    await userEvent.click(screen.getByRole('button', { name: 'Filters (2)' }));
    const mobileFilters = screen.getByLabelText('Candidate job filters');
    expect(within(mobileFilters).getByRole('textbox', { name: 'Company name' })).toBeVisible();
    expect(within(mobileFilters).getByRole('textbox', { name: 'Category name' })).toBeVisible();
  });

  it('opens and closes the responsive filter drawer', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByLabelText('Candidate job filters')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Close job filters' }));
    await waitFor(() => expect(screen.queryByLabelText('Candidate job filters')).toBeNull());
  });

  it('renders loading, retryable error, and empty result states', async () => {
    mockSearchJobs.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useSearchJobsQuery>,
    );
    const loading = renderPage();
    expect(screen.getByLabelText('Loading Candidate jobs')).toBeVisible();
    loading.unmount();

    mockSearchJobs.mockReturnValue(
      queryResult(undefined, { isError: true, refetch: refetchJobs }) as ReturnType<
        typeof useSearchJobsQuery
      >,
    );
    const failed = renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetchJobs).toHaveBeenCalledOnce();
    failed.unmount();

    mockSearchJobs.mockReturnValue(
      queryResult({
        items: [],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      }) as ReturnType<typeof useSearchJobsQuery>,
    );
    renderPage('/dashboard/jobs?q=missing');
    expect(screen.getByText('No jobs match your search')).toBeVisible();
  });

  it('keeps results usable while facet loading and errors are handled separately', async () => {
    mockFilterOptions.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useGetJobFilterOptionsQuery>,
    );
    const loading = renderPage();
    expect(screen.getByLabelText('Loading job filters')).toBeVisible();
    expect(screen.getByText(job.title)).toBeVisible();
    loading.unmount();

    mockFilterOptions.mockReturnValue(
      queryResult(undefined, { isError: true, refetch: refetchFilters }) as ReturnType<
        typeof useGetJobFilterOptionsQuery
      >,
    );
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Retry filters' }));
    expect(refetchFilters).toHaveBeenCalledOnce();
  });

  it('hides the optional quota indicator when the quota endpoint is unavailable', () => {
    mockQuota.mockReturnValue(
      queryResult(undefined, { isError: true }) as ReturnType<typeof useGetApplicationQuotaQuery>,
    );

    renderPage();

    expect(screen.getByText(job.title)).toBeVisible();
    expect(screen.queryByText(/applications:.*used/i)).toBeNull();
    expect(screen.queryByText(/quota is unavailable/i)).toBeNull();
  });

  it('uses the real saved-job and application actions', async () => {
    const saveMutation = mutationResult();
    const applicationMutation = mutationResult();
    mockSaveJob.mockReturnValue(saveMutation as unknown as ReturnType<typeof useSaveJobMutation>);
    mockSubmitApplication.mockReturnValue(
      applicationMutation as unknown as ReturnType<typeof useSubmitApplicationMutation>,
    );
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: `Save ${job.title}` }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(saveMutation[0]).toHaveBeenCalledWith(job.id);
    expect(mockFetchJobApplicationUrl).toHaveBeenCalledWith(job.slug);
    expect(applicationMutation[0]).toHaveBeenCalledWith({ coverLetter: null, jobId: job.id });
    expect(open).toHaveBeenCalledWith(
      'https://careers.example.com/jobs/senior-react-engineer',
      '_blank',
      'noopener,noreferrer',
    );
    open.mockRestore();
  });

  it('shows Browse jobs only in the Candidate dashboard navigation', () => {
    const candidateRouter = createMemoryRouter(
      [
        {
          path: '/dashboard',
          element: <UserDashboardLayout />,
          children: [{ index: true, element: <p>Dashboard</p> }],
        },
      ],
      { initialEntries: ['/dashboard'] },
    );
    const candidateView = renderWithProviders(<RouterProvider router={candidateRouter} />, {
      auth: candidateAuth,
    });
    expect(screen.getAllByRole('link', { name: 'Browse jobs' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Resume' })).toBeNull();
    candidateView.unmount();

    const adminRouter = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <AdminDashboardLayout />,
          children: [{ index: true, element: <p>Admin</p> }],
        },
      ],
      { initialEntries: ['/admin'] },
    );
    renderWithProviders(<RouterProvider router={adminRouter} />, {
      auth: { ...candidateAuth, user: { ...candidateAuth.user!, role: UserRole.Administrator } },
    });
    expect(screen.queryByRole('link', { name: 'Browse jobs' })).toBeNull();
  });

  it('shows resume states and uploads through the existing secure mutation', async () => {
    const upload = mutationResult();
    const refetchStatus = vi.fn().mockResolvedValue(undefined);
    mockUploadResume.mockReturnValue(upload as unknown as ReturnType<typeof useUploadResumeMutation>);
    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 0, hasResume: false, message: '' }, { fulfilledTimeStamp: Date.now(), refetch: refetchStatus }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    renderPage();
    expect(screen.getByText('Upload your resume to receive personalized job recommendations')).toBeVisible();
    await userEvent.upload(screen.getByLabelText('Choose resume'), new File(['resume'], 'resume.pdf', { type: 'application/pdf' }));
    expect(upload[0]).toHaveBeenCalledOnce();
    await waitFor(() => expect(refetchStatus).toHaveBeenCalledOnce());
  });

  it('uses recommendation mode without sending All jobs filters', () => {
    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: '2026-08-10T00:00:00Z', extractionStatus: 2, hasResume: true, message: 'Ready' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    mockProfile.mockReturnValue(queryResult({ resume: { fileName: 'career.pdf' } }) as ReturnType<typeof useGetProfileQuery>);
    mockRecommended.mockReturnValue(
      queryResult({ extractionStatus: 2, items: [{
        categoryId: job.categoryId, categoryName: job.categoryName, companyId: job.companyId,
        companyLogoUrl: null, companyName: job.companyName, companySlug: job.companySlug,
        employmentType: job.employmentType, experienceLevel: job.experienceLevel,
        expiresAtUtc: job.expiresAtUtc, id: job.id, isFeatured: job.isFeatured,
        location: job.location, matchReasons: ['Matches skills: React'], matchScore: 92,
        publishedAtUtc: job.publishedAtUtc, referenceNumber: job.referenceNumber,
        slug: job.slug, title: job.title, workplaceType: job.workplaceType,
      }], message: 'Personalized recommendations based on your resume.', pageNumber: 1, pageSize: 20, totalCount: 1, totalPages: 1 }) as ReturnType<typeof useGetRecommendedJobsQuery>,
    );
    renderPage('/dashboard/jobs?mode=recommended&companyName=Ignored&page=3');
    expect(screen.getByText('Resume match 92%')).toBeVisible();
    expect(screen.getByText('• Matches skills: React')).toBeVisible();
    expect(mockRecommended).toHaveBeenCalledWith({ pageNumber: 3, pageSize: 20 }, { skip: false });
    expect(mockSearchJobs.mock.calls.at(-1)?.[1]).toEqual({ skip: true });
  });

  it('shows a View all jobs action when recommendations are empty', async () => {
    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 2, hasResume: true, message: 'Ready' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    renderPage('/dashboard/jobs?mode=recommended');
    await userEvent.click(screen.getByRole('button', { name: 'View all jobs' }));
    expect(screen.getByTestId('location')).toHaveTextContent('mode=all');
  });

  it('shows safe Processing and Failed resume states without internal details', () => {
    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 1, hasResume: true, message: 'Internal processing detail' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    const processing = renderPage();
    expect(screen.getByText('Processing')).toBeVisible();
    expect(screen.queryByText('Internal processing detail')).toBeNull();
    processing.unmount();

    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 3, hasResume: true, message: 'Private parser error' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    renderPage();
    expect(screen.getByText(/Failed — your resume is stored/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Replace resume' })).toBeVisible();
    expect(screen.queryByText('Private parser error')).toBeNull();
  });
});
