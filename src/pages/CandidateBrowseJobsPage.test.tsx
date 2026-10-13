import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import {
  useGetApplicationQuotaQuery,
  useGetProfileQuery,
  useGetRecommendedJobsQuery,
  useGetResumeStatusQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetSavedJobsQuery,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
  useUploadResumeMutation,
  downloadCandidateResume,
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
  PublicJobSort,
  WorkplaceType,
  type PublicJobFilterOptions,
  type PublicJobQuery,
  type PublicJobSummary,
} from '@/features/jobs/types/jobModels';
import type { AuthState } from '@/features/auth/store/authSlice';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';
import { UserDashboardLayout } from '@/layouts/UserDashboardLayout';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { JobCard } from '@/features/jobs/components/JobCard';
import { CandidateBrowseJobsPage } from './CandidateBrowseJobsPage';

vi.mock('@/features/aiApply/components/AIApplyToJobButton', () => ({
  AIApplyToJobButton: () => <button type="button">AI Apply</button>,
}));

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
    useGetNotificationsQuery: vi.fn(),
    useGetSavedJobsQuery: vi.fn(),
    useRemoveSavedJobMutation: vi.fn(),
    useSaveJobMutation: vi.fn(),
    useSubmitApplicationMutation: vi.fn(),
    useUploadResumeMutation: vi.fn(),
    downloadCandidateResume: vi.fn(),
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
const mockNotifications = vi.mocked(useGetNotificationsQuery);
const mockSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockSaveJob = vi.mocked(useSaveJobMutation);
const mockRemoveSavedJob = vi.mocked(useRemoveSavedJobMutation);
const mockSubmitApplication = vi.mocked(useSubmitApplicationMutation);
const mockDownloadResume = vi.mocked(downloadCandidateResume);
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
    { count: 8, value: CompanyType.Corporate },
    { count: 7, value: CompanyType.IndianMnc },
    { count: 6, value: CompanyType.ForeignMnc },
    { count: 5, value: CompanyType.Consultant },
  ],
  departments: [
    { count: 12, value: 'Engineering' },
    { count: 8, value: 'Design' },
    { count: 7, value: 'Product' },
    { count: 6, value: 'Sales' },
    { count: 5, value: 'Operations' },
    { count: 4, value: 'Marketing' },
    { count: 2, value: 'Support' },
    { count: 1, value: 'Security' },
  ].map((option) => ({ ...option, label: option.value })),
  educationRequirements: [
    { count: 9, value: 'MBA/PGDM' },
    { count: 8, value: 'Any Postgraduate' },
    { count: 7, value: 'M.Tech' },
    { count: 6, value: 'MCA' },
    { count: 5, value: 'B.Tech', label: 'B.Tech / B.E.' },
    { count: 4, value: 'Any Graduate' },
  ].map((option) => ({ ...option, label: option.label ?? option.value })),
  employmentTypes: [
    { count: 15, value: EmploymentType.FullTime },
    { count: 5, value: EmploymentType.Internship },
  ],
  experienceRange: { count: 18, maximum: 8, minimum: 0 },
  industries: [{ count: 10, value: 'Technology' }],
  internshipDurations: [{ count: 5, isFlexible: false, label: '3 months', months: 3 }],
  locations: [
    { count: 12, value: 'Pune' },
    { count: 11, value: 'bengaluru', label: 'Bengaluru' },
    { count: 10, value: 'Hyderabad' },
    { count: 9, value: 'Chennai' },
    { count: 8, value: 'Delhi / NCR' },
    { count: 7, value: 'Mumbai (All Areas)' },
    { count: 3, value: ' pune ' },
  ].map((option) => ({ ...option, label: option.label ?? option.value })),
  postedByTypes: [{ count: 16, value: PostedByType.Company }],
  roleCategories: [
    { count: 11, value: 'software', label: 'Software Development' },
    { count: 4, value: 'product', label: 'Product Management - Technology' },
  ],
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
    currentData: data,
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
  return {
    ...renderWithProviders(<RouterProvider router={router} />, { auth: candidateAuth }),
    router,
  };
};

it('keeps Browse Jobs card content and logo geometry at a 360px viewport', () => {
  const previousWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 });
  try {
    mockSearchJobs.mockReturnValue(
      queryResult({
        items: [{ ...job, companyLogoUrl: 'https://assets.example.test/northstar.png' }],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      }) as ReturnType<typeof useSearchJobsQuery>,
    );
    renderPage();
    const image = screen.getByRole('img', { name: 'Northstar Labs logo' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.parentElement).toHaveStyle({ width: '52px', height: '52px', flexShrink: '0' });
    expect(image.parentElement).toHaveStyle({
      'background-color': 'rgba(0, 0, 0, 0)',
      'border-radius': '0',
      'max-width': '100%',
    });
    expect(screen.getByRole('article')).toHaveStyle({
      minWidth: '0',
      display: 'flex',
      flexDirection: 'column',
    });
    expect(screen.getByRole('heading', { name: job.title })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply manually' })).toBeVisible();
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Northstar Labs initials' })).toHaveTextContent('NL');
    expect(screen.getByRole('heading', { name: job.title })).toBeVisible();
  } finally {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth });
  }
});

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
  mockProfile.mockReturnValue(
    queryResult({ resume: null }) as ReturnType<typeof useGetProfileQuery>,
  );
  mockResumeStatus.mockReturnValue(
    queryResult(
      { extractedAtUtc: null, extractionStatus: 0, hasResume: false, message: 'Upload a resume.' },
      { fulfilledTimeStamp: Date.now() },
    ) as ReturnType<typeof useGetResumeStatusQuery>,
  );
  mockRecommended.mockReturnValue(
    queryResult({
      extractionStatus: 2,
      items: [],
      message: '',
      pageNumber: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    }) as ReturnType<typeof useGetRecommendedJobsQuery>,
  );
  mockUploadResume.mockReturnValue(
    mutationResult() as unknown as ReturnType<typeof useUploadResumeMutation>,
  );
  mockMemberships.mockReturnValue(queryResult([]) as ReturnType<typeof useGetMembershipsQuery>);
  mockNotifications.mockReturnValue(
    queryResult({
      items: [],
      pageNumber: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 0,
      unreadCount: 0,
    }) as ReturnType<typeof useGetNotificationsQuery>,
  );
  mockDownloadResume.mockResolvedValue(new Blob(['resume'], { type: 'application/pdf' }));
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

afterEach(() => vi.useRealTimers());

describe('Candidate Browse jobs', () => {
  it('restores cross-facet selections from shared URLs and synchronizes chips, back and forward', async () => {
    const { router } = renderPage(
      '/dashboard/jobs?roleCategories=software&locations=Pune&departments=Engineering&educationRequirements=B.Tech&page=3',
    );
    for (const name of [
      'Software Development, 11 jobs',
      'Pune, 12 jobs',
      'Engineering, 12 jobs',
      'B.Tech / B.E., 5 jobs',
    ]) {
      expect(screen.getByRole('checkbox', { name })).toBeChecked();
    }
    expect(mockFilterOptions.mock.calls.at(-1)?.[0]).toMatchObject({
      roleCategories: ['software'],
      locations: ['Pune'],
      departments: ['Engineering'],
      educationRequirements: ['B.Tech'],
    });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Hyderabad, 10 jobs' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      locations: ['Pune', 'Hyderabad'],
      roleCategories: ['software'],
      pageNumber: 1,
    });
    const params = new URLSearchParams(router.state.location.search);
    expect(params.getAll('locations')).toEqual(['Pune', 'Hyderabad']);
    expect(params.has('page')).toBe(false);
    await userEvent.click(screen.getByLabelText('Software Development. Remove filter'));
    expect(
      screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' }),
    ).not.toBeChecked();
    expect(
      (mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).roleCategories,
    ).toBeUndefined();
    await act(() => router.navigate(-1));
    expect(screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' })).toBeChecked();
    await act(() => router.navigate(1));
    expect(
      screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' }),
    ).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(router.state.location.search).toBe('?mode=all');
    expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
  });

  it('preserves existing facets while refetching and does not depend on supplemental counts', () => {
    mockFilterOptions.mockReturnValue(
      queryResult(options, { isFetching: true }) as ReturnType<typeof useGetJobFilterOptionsQuery>,
    );
    mockSupplementalCounts.mockReturnValue(
      queryResult(undefined, { isError: true }) as ReturnType<
        typeof useGetSupplementalJobFilterCountsQuery
      >,
    );
    renderPage();
    expect(screen.getByText('Updating filters…')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Pune, 12 jobs' })).toBeEnabled();
    expect(screen.getByText('Pune')).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Last 24 hours' })).toBeEnabled();
    expect(screen.getByText('Last 24 hours')).toBeVisible();
    expect(screen.queryByLabelText('Loading job filters')).not.toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeVisible();
  });

  it('hides empty string facets without hiding job results', () => {
    mockFilterOptions.mockReturnValue(
      queryResult({
        ...options,
        roleCategories: [],
        locations: [],
        departments: [],
        educationRequirements: [],
      }) as ReturnType<typeof useGetJobFilterOptionsQuery>,
    );
    renderPage();
    for (const name of ['Role category', 'Location', 'Department', 'Education'])
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    expect(screen.queryByText('No options available.')).not.toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeVisible();
  });

  it('keeps date filtering contextual and resets pagination', async () => {
    renderPage('/dashboard/jobs?roleCategories=software&page=4');
    await userEvent.click(screen.getByRole('radio', { name: 'Last 24 hours (3)' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      freshnessDays: 1,
      roleCategories: ['software'],
      pageNumber: 1,
    });
    expect(mockFilterOptions.mock.calls.at(-1)?.[0]).toMatchObject({
      freshnessDays: 1,
      roleCategories: ['software'],
    });
  });
  it.each([
    { score: 92, color: 'Success' },
    { score: 74, color: 'Info' },
    { score: 58, color: 'Warning' },
  ])('shows one $score% badge without inventing empty match reasons', ({ score, color }) => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([
          {
            path: '/',
            element: <JobCard compact job={job} match={{ matchScore: score, matchReasons: [] }} />,
          },
        ])}
      />,
    );
    expect(screen.getAllByText(`${score}% Match`)).toHaveLength(1);
    expect(screen.getByText(`${score}% Match`).closest('.MuiChip-root')).toHaveClass(
      `MuiChip-color${color}`,
    );
    expect(
      screen.queryByRole('list', { name: 'Why this job matches you' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: job.title })).toBeVisible();
  });

  it('keeps selected facets in the URL and renders exact backend counts', async () => {
    renderPage('/dashboard/jobs?workMode=remote&page=2');

    expect(screen.getByRole('checkbox', { name: 'Remote, 14 jobs' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Last 24 hours (3)' })).toBeInTheDocument();
    expect(screen.getByText('Applied (1)')).toBeVisible();
    expect(screen.queryByText(/applications:.*used/)).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Pune, 12 jobs' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Security, 1 jobs' })).toBeNull();
    expect(screen.getByRole('button', { name: 'View more department' })).toBeVisible();
    expect(mockSearchJobs.mock.calls[0]?.[0]).toMatchObject({
      pageNumber: 2,
      workModes: [WorkplaceType.Remote],
    });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Hybrid, 7 jobs' }));
    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      expect(location).toContain('workMode=remote');
      expect(location).toContain('workMode=hybrid');
      expect(location).not.toContain('page=2');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(await screen.findByTestId('location')).toHaveTextContent('/dashboard/jobs?mode=all');
  });

  it('debounces keyword search into shareable URL state', async () => {
    renderPage();
    vi.useFakeTimers();
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' }),
      {
        target: { value: 'react' },
      },
    );
    await act(() => vi.advanceTimersByTimeAsync(400));
    vi.useRealTimers();
    expect(screen.getByTestId('location')).toHaveTextContent('q=react');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      pageNumber: 1,
    });
  });

  it('uses one shared 54px height for every search-row control', () => {
    renderPage();

    ['job-search-keyword', 'job-search-location', 'job-search-submit'].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-control-height', '54');
    });
  });

  it('uses backend role values for multi-select and removes stale company-name state', async () => {
    renderPage('/dashboard/jobs?page=3&companyName=HARMAN');
    expect(screen.queryByRole('checkbox', { name: /Northstar Labs/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Company' })).toBeNull();
    await waitFor(() =>
      expect(screen.getByTestId('location')).not.toHaveTextContent('companyName=HARMAN'),
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' }));
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Product Management - Technology, 4 jobs' }),
    );
    await waitFor(
      () => {
        const location = screen.getByTestId('location').textContent ?? '';
        expect(location).toContain('roleCategories=software');
        expect(location).toContain('roleCategories=product');
        expect(location).not.toContain('page=3');
      },
      { timeout: 4_000 },
    );
    expect(screen.getByLabelText('Software Development. Remove filter')).toBeVisible();
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      roleCategories: ['software', 'product'],
      pageNumber: 1,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Filters (2)' }));
    const mobileFilters = screen.getByLabelText('Candidate job filters');
    expect(
      within(mobileFilters).getByRole('checkbox', { name: 'Software Development, 11 jobs' }),
    ).toBeChecked();
    expect(within(mobileFilters).queryByRole('textbox', { name: 'Company name' })).toBeNull();
  });

  it('opens and closes the responsive filter drawer', async () => {
    renderPage();
    const filterTrigger = screen.getByRole('button', { name: 'Filters' });
    await userEvent.click(filterTrigger);
    const drawer = screen.getByLabelText('Candidate job filters');
    expect(drawer).toBeVisible();
    expect(drawer.querySelectorAll('[data-filter-group]')).toHaveLength(9);
    expect(screen.getByRole('button', { name: 'Show jobs' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Show jobs' }));
    expect(screen.getByRole('button', { hidden: true, name: 'Filters' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await waitFor(() => expect(filterTrigger).toHaveFocus());
  });

  it('renders the redesigned filter groups and supports individual removal and Clear all', async () => {
    renderPage('/dashboard/jobs?workMode=remote&department=Engineering');

    const panel = screen.getByTestId('candidate-job-filter-groups');
    expect(
      Array.from(panel.querySelectorAll('[data-filter-group]')).map((group) =>
        group.getAttribute('data-filter-group'),
      ),
    ).toEqual([
      'Date posted',
      'Experience',
      'Work mode',
      'Salary',
      'Company type',
      'Role category',
      'Location',
      'Department',
      'Education',
    ]);
    ['Date posted', 'Experience', 'Work mode', 'Salary'].forEach((name) =>
      expect(within(panel).getByRole('button', { name })).toHaveAttribute('aria-expanded', 'true'),
    );
    [
      'Company',
      'Job type',
      'Featured',
      'Internship duration',
      'Category',
      'Posted by',
      'Industry',
    ].forEach((name) => expect(within(panel).queryByRole('button', { name })).toBeNull());

    await userEvent.click(screen.getByLabelText('Remote. Remove filter'));
    await waitFor(() =>
      expect(screen.getByTestId('location')).not.toHaveTextContent('workMode=remote'),
    );
    expect(screen.getByTestId('location')).toHaveTextContent('departments=Engineering');

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).not.toHaveTextContent('departments=Engineering'),
    );
  });

  it('commits accessible experience and annual-salary sliders using backend units', async () => {
    renderPage('/dashboard/jobs?page=3');
    const maximumExperience = screen.getByRole('slider', { name: 'Maximum experience' });
    const minimumSalary = screen.getByRole('slider', { name: 'Minimum annual salary' });

    expect(maximumExperience).toHaveAttribute('aria-valuemax', '45');
    expect(maximumExperience).toHaveAttribute('aria-valuetext', '45+ years');
    expect(minimumSalary).toHaveAttribute('aria-valuemin', '0');
    expect(screen.getByText('₹50+ LPA')).toBeVisible();

    const experienceSlider = maximumExperience.closest('.MuiSlider-root');
    expect(experienceSlider).not.toBeNull();
    vi.spyOn(experienceSlider!, 'getBoundingClientRect').mockReturnValue({
      bottom: 20,
      height: 20,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.mouseDown(experienceSlider!, { button: 0, clientX: 80 });
    expect(
      (mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).maxExperienceYears,
    ).toBeUndefined();
    fireEvent.mouseUp(document, { clientX: 80 });
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('maxExperience=36'),
    );
    expect(screen.getByTestId('location')).not.toHaveTextContent('page=3');

    const salarySlider = minimumSalary.closest('.MuiSlider-root');
    expect(salarySlider).not.toBeNull();
    vi.spyOn(salarySlider!, 'getBoundingClientRect').mockReturnValue({
      bottom: 20,
      height: 20,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.mouseDown(salarySlider!, { button: 0, clientX: 10 });
    expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).minAmount).toBeUndefined();
    fireEvent.mouseUp(document, { clientX: 10 });
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('minAmount=500000'),
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ minAmount: 500_000 });
    expect(screen.getByLabelText('Salary: ₹5–₹50+ LPA. Remove filter')).toBeVisible();
  });

  it('treats the experience and salary UI upper endpoints as unbounded', async () => {
    renderPage('/dashboard/jobs?maxExperience=45&maxAmount=5000000');

    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      expect(location).not.toContain('maxExperience');
      expect(location).not.toContain('maxAmount');
    });
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      maxAmount: undefined,
      maxExperienceYears: undefined,
    });
  });

  it('uses temporary View more selections and applies them once', async () => {
    renderPage();
    const viewMore = screen.getByRole('button', { name: 'View more department' });

    await userEvent.click(viewMore);
    let dialog = screen.getByRole('dialog', { name: 'Select departments' });
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Search departments' }),
      'Marketing',
    );
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Marketing, 4 jobs' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByTestId('location')).not.toHaveTextContent('departments=Marketing');

    await userEvent.click(viewMore);
    dialog = screen.getByRole('dialog', { name: 'Select departments' });
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Search departments' }),
      'Marketing',
    );
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Marketing, 4 jobs' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('departments=Marketing'),
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ departments: ['Marketing'] });
    await waitFor(() => expect(viewMore).toHaveFocus());
  });

  it('renders backend location and education labels without changing query values or summing counts', async () => {
    renderPage();
    const locationGroup = screen.getByRole('button', { name: 'Location' });
    expect(locationGroup).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('checkbox', { name: 'Bengaluru, 11 jobs' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Pune, 12 jobs' })).toBeInTheDocument();

    const educationGroup = screen.getByRole('button', { name: 'Education' });
    expect(educationGroup).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('checkbox', { name: 'B.Tech / B.E., 5 jobs' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'B.Tech / B.E., 5 jobs' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('educationRequirements=B.Tech'),
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      educationRequirements: ['B.Tech'],
    });
  });

  it('cleans every removed filter parameter without reintroducing removed chips', async () => {
    renderPage(
      '/dashboard/jobs?companyName=HARMAN&employmentType=internship&featured=true&duration=3&flexibleDuration=true&roleCategory=Software&postedBy=company&industry=Technology',
    );

    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      [
        'companyName',
        'featured',
        'duration',
        'flexibleDuration',
        'roleCategory',
        'postedBy',
        'industry',
      ].forEach((name) => expect(location).not.toContain(name));
    });
    expect(screen.queryByLabelText(/Company: HARMAN.*Remove filter/)).toBeNull();
    expect(screen.queryByLabelText(/Featured.*Remove filter/)).toBeNull();
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
    expect(screen.getByText(job.title)).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
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
    await userEvent.click(screen.getByRole('button', { name: 'Apply manually' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to company website' }));
    expect(saveMutation[0]).toHaveBeenCalledWith(job.id);
    expect(mockFetchJobApplicationUrl).toHaveBeenCalledWith(job.slug);
    await waitFor(() =>
      expect(applicationMutation[0]).toHaveBeenCalledWith({
        applicationMethod: 'External',
        jobId: job.id,
      }),
    );
    await waitFor(() => expect(screen.queryByText(job.title)).not.toBeInTheDocument());
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
    expect(screen.getAllByRole('link', { name: 'Applied jobs' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Resume' })).toBeNull();
    expect(mockNotifications).toHaveBeenCalledWith(
      { pageNumber: 1, pageSize: 1 },
      { pollingInterval: 60000, refetchOnMountOrArgChange: true },
    );
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
    expect(screen.queryByRole('link', { name: 'Applied jobs' })).toBeNull();
  });

  it('renders all five modes in order and maps them to backend query fields', async () => {
    renderPage('/dashboard/jobs?page=3');

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'All jobs',
      'Referral jobs',
      'Resume matches',
      'Internships',
      'Fresher',
      'Experienced',
    ]);
    expect(screen.getByRole('tab', { name: 'All jobs' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Resume matches' })).toBeDisabled();
    expect(screen.queryByRole('tab', { name: 'Recommended for you' })).toBeNull();
    expect(screen.queryByText(/Your resume helps us suggest roles/i)).toBeNull();
    expect(
      screen.queryByText(
        'Search and filters apply to All jobs. Recommended jobs are ranked from your resume.',
      ),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: `View details for ${job.title} at ${job.companyName}` }),
    ).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Internships' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('mode=internships'),
    );
    expect(screen.getByTestId('location')).not.toHaveTextContent('page=3');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      employmentTypes: [EmploymentType.Internship],
      pageNumber: 1,
    });

    await userEvent.click(screen.getByRole('tab', { name: 'Fresher' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('mode=fresher'));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      maxExperienceYears: 1,
      minExperienceYears: 0,
      pageNumber: 1,
    });

    await userEvent.click(screen.getByRole('tab', { name: 'Experienced' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('mode=experienced'),
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      minExperienceYears: 2,
      pageNumber: 1,
    });
    expect(
      (mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).maxExperienceYears,
    ).toBeUndefined();
  });

  it('restores Fresher and Experienced query mappings from URL mode state', () => {
    const fresher = renderPage('/dashboard/jobs?mode=fresher');
    expect(screen.getByRole('tab', { name: 'Fresher' })).toHaveAttribute('aria-selected', 'true');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      maxExperienceYears: 1,
      minExperienceYears: 0,
    });
    fresher.unmount();

    renderPage('/dashboard/jobs?mode=experienced');
    expect(screen.getByRole('tab', { name: 'Experienced' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ minExperienceYears: 2 });
  });

  it('collapses and restores the desktop filters without clearing selected values', async () => {
    renderPage('/dashboard/jobs?workMode=remote');

    await userEvent.click(screen.getByRole('button', { name: 'Collapse job filters' }));
    const expand = screen.getByRole('button', { name: 'Expand job filters' });
    expect(expand).toHaveTextContent('Filters (1)');
    expect(screen.getByText(job.title)).toBeVisible();

    await userEvent.click(expand);
    expect(screen.getByRole('checkbox', { name: 'Remote, 14 jobs' })).toBeChecked();
  });

  it('does not announce a zero result count while jobs are loading', () => {
    mockSearchJobs.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useSearchJobsQuery>,
    );

    renderPage();

    expect(screen.getByRole('heading', { name: 'Finding jobs…' })).toBeVisible();
    expect(screen.queryByText(/0 (active )?jobs/i)).toBeNull();
  });
  it('submits keyword and location immediately, preserves Experienced mode and cancels debounce', async () => {
    renderPage('/dashboard/jobs?mode=experienced&page=3');
    vi.useFakeTimers();
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' }),
      { target: { value: 'pwc' } },
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Location' }), {
      target: { value: 'Pune' },
    });
    fireEvent.submit(screen.getByRole('search'));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'pwc',
      locations: ['Pune'],
      minExperienceYears: 2,
      pageNumber: 1,
    });
    const url = screen.getByTestId('location').textContent;
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(screen.getByTestId('location').textContent).toBe(url);
    expect(refetchJobs).not.toHaveBeenCalled();
  });

  it('debounces both inputs including single-character searches', async () => {
    renderPage();
    vi.useFakeTimers();
    const keyword = screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' });
    fireEvent.change(keyword, { target: { value: 'R' } });
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'R' });
    expect(screen.getByTestId('location')).toHaveTextContent('q=R');
    fireEvent.change(keyword, { target: { value: 'react' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Location' }), {
      target: { value: 'Pune' },
    });
    await act(() => vi.advanceTimersByTimeAsync(349));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'R' });
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      locations: ['Pune'],
    });
  });

  it('restores search drafts on Back and cancels typing started before navigation', async () => {
    const { router } = renderPage('/dashboard/jobs?q=pwc&locations=Pune');
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' }),
      { target: { value: 'react' } },
    );
    fireEvent.submit(screen.getByRole('search'));
    vi.useFakeTimers();
    fireEvent.change(screen.getByRole('textbox', { name: 'Location' }), {
      target: { value: 'Mumbai' },
    });
    await act(() => router.navigate(-1));
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(
      screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' }),
    ).toHaveValue('pwc');
    expect(screen.getByRole('textbox', { name: 'Location' })).toHaveValue('Pune');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'pwc',
      locations: ['Pune'],
    });
  });

  it('normalizes disabled Resume Matches URLs to All jobs', () => {
    renderPage('/dashboard/jobs?mode=recommended&q=react');
    expect(screen.getByRole('tab', { name: 'Resume matches' })).toBeDisabled();
    expect(screen.getByTestId('location')).toHaveTextContent('mode=all');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'react' });
  });
  it('Enter submits immediately and chip removal clears the input and query', async () => {
    renderPage('/dashboard/jobs?page=3');
    const input = screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' });
    fireEvent.change(input, { target: { value: 'pwc' } });
    input.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'pwc', pageNumber: 1 });
    fireEvent.click(screen.getByLabelText('Search: pwc. Remove filter'));
    expect(input).toHaveValue('');
    expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).keyword).toBeUndefined();
  });

  it('keeps server counts and search filters while paging', async () => {
    mockSearchJobs.mockReturnValue(
      queryResult({ items: [job], totalCount: 222, totalPages: 23 }) as ReturnType<
        typeof useSearchJobsQuery
      >,
    );
    renderPage('/dashboard/jobs?q=react&locations=Pune&freshness=7');
    expect(screen.getByRole('heading', { name: '222 jobs found' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      locations: ['Pune'],
      freshnessDays: 7,
      pageNumber: 2,
    });
  });

  it('shows searching instead of a stale count during refetch', () => {
    mockSearchJobs.mockReturnValue(
      queryResult(
        { items: [job], totalCount: 222, totalPages: 23 },
        { isFetching: true },
      ) as ReturnType<typeof useSearchJobsQuery>,
    );
    renderPage('/dashboard/jobs?q=react');
    expect(screen.getByRole('heading', { name: 'Finding jobs…' })).toBeVisible();
    expect(screen.queryByText('222 jobs found')).toBeNull();
    expect(screen.getByText(job.title)).toBeVisible();
  });
  it('applies date and sort immediately, resetting page and preserving search', () => {
    renderPage('/dashboard/jobs?q=react&locations=Pune&page=3');
    fireEvent.click(screen.getByRole('radio', { name: 'Last 7 days (12)' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      locations: ['Pune'],
      freshnessDays: 7,
      pageNumber: 1,
    });
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Latest published' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      freshnessDays: 7,
      sortBy: PublicJobSort.LatestPublished,
      pageNumber: 1,
    });
    expect(screen.getByTestId('location')).toHaveTextContent('sort=latest');
    fireEvent.click(screen.getByRole('button', { name: 'Reset all' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard/jobs?mode=all');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      sortBy: PublicJobSort.Recommended,
      pageNumber: 1,
    });
  });
  it.each([
    ['Work mode', 'Remote, 14 jobs', { workModes: [WorkplaceType.Remote] }, 'workMode=remote'],
    ['Location', 'Pune, 12 jobs', { locations: ['Pune'] }, 'locations=Pune'],
    [
      'Role category',
      'Software Development, 11 jobs',
      { roleCategories: ['software'] },
      'roleCategories=software',
    ],
    [
      'Department',
      'Engineering, 12 jobs',
      { departments: ['Engineering'] },
      'departments=Engineering',
    ],
    [
      'Education',
      'B.Tech / B.E., 5 jobs',
      { educationRequirements: ['B.Tech'] },
      'educationRequirements=B.Tech',
    ],
  ])('applies the %s server filter immediately', (group, label, query, url) => {
    renderPage('/dashboard/jobs?q=react&page=3');
    fireEvent.click(screen.getByRole('button', { name: group }));
    fireEvent.click(screen.getByRole('checkbox', { name: label }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      ...(query as object),
      keyword: 'react',
      pageNumber: 1,
    });
    expect(screen.getByTestId('location')).toHaveTextContent(url);
    expect(screen.getByTestId('location')).not.toHaveTextContent('page=3');
  });
  it('preserves pending drafts when a date filter applies before debounce', async () => {
    renderPage();
    vi.useFakeTimers();
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' }),
      { target: { value: 'react' } },
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Location' }), {
      target: { value: 'Pune' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Last 7 days (12)' }));
    expect(screen.getByRole('textbox', { name: 'Location' })).toHaveValue('Pune');
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      locations: ['Pune'],
      freshnessDays: 7,
      pageNumber: 1,
    });
  });
  describe('draft keyword regression', () => {
    const keywordInput = () =>
      screen.getByRole('textbox', { name: 'Job title, skills, company or keywords' });

    it('keeps every character of software and applies only the final settled keyword', async () => {
      renderPage();
      vi.useFakeTimers();
      for (let length = 1; length <= 'software'.length; length += 1) {
        const draft = 'software'.slice(0, length);
        fireEvent.change(keywordInput(), { target: { value: draft } });
        expect(keywordInput()).toHaveValue(draft);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search jobs');
        expect(screen.getByText(job.title)).toBeVisible();
        await act(() => vi.advanceTimersByTimeAsync(40));
        expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).keyword).toBeUndefined();
      }
      await act(() => vi.advanceTimersByTimeAsync(309));
      expect(screen.getByTestId('location')).not.toHaveTextContent('q=software');
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(keywordInput()).toHaveValue('software');
      const keywords = mockSearchJobs.mock.calls
        .map(([arg]) => (arg as PublicJobQuery).keyword)
        .filter(Boolean);
      expect(new Set(keywords)).toEqual(new Set(['software']));
      expect(screen.getByTestId('location')).toHaveTextContent('q=software');
    });

    it.each(['C#', 'C++', 'R', 'Go', 'AI', 'QA'])(
      'debounces the valid short search %s',
      async (keyword) => {
        renderPage();
        vi.useFakeTimers();
        fireEvent.change(keywordInput(), { target: { value: keyword } });
        await act(() => vi.advanceTimersByTimeAsync(350));
        expect(keywordInput()).toHaveValue(keyword);
        expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword, pageNumber: 1 });
        expect(
          new URLSearchParams(screen.getByTestId('location').textContent?.split('?')[1]).get('q'),
        ).toBe(keyword);
      },
    );

    it('keeps react applied and its results while python is still a draft', async () => {
      renderPage('/dashboard/jobs?q=react');
      vi.useFakeTimers();
      fireEvent.change(keywordInput(), { target: { value: 'python' } });
      await act(() => vi.advanceTimersByTimeAsync(349));
      expect(keywordInput()).toHaveValue('python');
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'react' });
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search jobs');
      expect(screen.getByText(job.title)).toBeVisible();
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'python' });
    });

    it.each(['button', 'Enter'])(
      'applies once immediately with %s and cancels pending debounce',
      async (action) => {
        const { router } = renderPage('/dashboard/jobs?q=react&page=3');
        vi.useFakeTimers();
        const navigations: string[] = [];
        const unsubscribe = router.subscribe(({ location }) => {
          navigations.push(location.key);
        });
        fireEvent.change(keywordInput(), { target: { value: 'python' } });
        if (action === 'button') {
          fireEvent.click(screen.getByRole('button', { name: 'Search jobs' }));
        } else {
          // Native Enter wiring is covered by the real-keyboard test above.
          fireEvent.submit(screen.getByRole('search'));
        }
        expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
          keyword: 'python',
          pageNumber: 1,
        });
        const queryCalls = mockSearchJobs.mock.calls.length;
        await act(() => vi.advanceTimersByTimeAsync(500));
        expect(mockSearchJobs.mock.calls).toHaveLength(queryCalls);
        expect(new Set(navigations).size).toBe(1);
        expect(refetchJobs).not.toHaveBeenCalled();
        unsubscribe();
      },
    );

    it('hydrates Back and Forward but ignores internal URL canonicalization while typing', async () => {
      const { router } = renderPage('/dashboard/jobs?q=react&locations=Pune');
      vi.useFakeTimers();
      fireEvent.change(keywordInput(), { target: { value: 'python' } });
      // This unmarked replace triggers the same URL normalization path as legacy aliases.
      await act(() => router.navigate('/dashboard/jobs?q=react&location=Pune', { replace: true }));
      expect(keywordInput()).toHaveValue('python');
      await act(() => vi.advanceTimersByTimeAsync(350));
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'python' });
      await act(() => router.navigate(-1));
      expect(keywordInput()).toHaveValue('react');
      await act(() => router.navigate(1));
      expect(keywordInput()).toHaveValue('python');
    });

    it.each(['', '   '])(
      'clears only an intentionally empty/whitespace draft after debounce',
      async (draft) => {
        renderPage('/dashboard/jobs?q=react');
        vi.useFakeTimers();
        fireEvent.change(keywordInput(), { target: { value: draft } });
        await act(() => vi.advanceTimersByTimeAsync(349));
        expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'react' });
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search jobs');
        await act(() => vi.advanceTimersByTimeAsync(1));
        expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).keyword).toBeUndefined();
        expect(screen.getByTestId('location')).not.toHaveTextContent('q=');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Find your next opportunity',
        );
        expect(keywordInput()).toHaveValue(draft);
      },
    );

    it('preserves a draft across filter, pagination, sort and tab changes', async () => {
      mockSearchJobs.mockReturnValue(
        queryResult({ items: [job], totalCount: 222, totalPages: 23 }) as ReturnType<
          typeof useSearchJobsQuery
        >,
      );
      renderPage('/dashboard/jobs?q=react');
      vi.useFakeTimers();
      fireEvent.change(keywordInput(), { target: { value: 'python' } });
      fireEvent.click(screen.getByRole('radio', { name: 'Last 7 days (12)' }));
      fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
      fireEvent.mouseDown(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Latest published' }));
      fireEvent.click(screen.getByRole('tab', { name: 'Experienced' }));
      expect(keywordInput()).toHaveValue('python');
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: 'react' });
      await act(() => vi.advanceTimersByTimeAsync(350));
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
        keyword: 'python',
        freshnessDays: 7,
        sortBy: PublicJobSort.LatestPublished,
        minExperienceYears: 2,
        pageNumber: 1,
      });
    });

    it('applies the pending keyword with a newly selected location filter', async () => {
      renderPage('/dashboard/jobs?q=react');
      vi.useFakeTimers();
      fireEvent.change(keywordInput(), { target: { value: 'python' } });
      fireEvent.click(screen.getByRole('button', { name: 'Location' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Pune, 12 jobs' }));
      expect(keywordInput()).toHaveValue('python');
      await act(() => vi.advanceTimersByTimeAsync(350));
      expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
        keyword: 'python',
        locations: ['Pune'],
        pageNumber: 1,
      });
    });

    it.each(['Search chip', 'Reset'])(
      'intentionally clears both draft and applied search with %s',
      async (action) => {
        renderPage(
          action === 'Reset' ? '/dashboard/jobs?q=react&freshness=7' : '/dashboard/jobs?q=react',
        );
        vi.useFakeTimers();
        fireEvent.change(keywordInput(), { target: { value: 'python' } });
        fireEvent.click(
          action === 'Search chip'
            ? screen.getByLabelText('Search: react. Remove filter')
            : screen.getByRole('button', { name: 'Reset all' }),
        );
        expect(keywordInput()).toHaveValue('');
        await act(() => vi.advanceTimersByTimeAsync(500));
        expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).keyword).toBeUndefined();
        expect(screen.getByTestId('location')).not.toHaveTextContent('q=');
      },
    );
  });
});
