import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
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
  return { ...renderWithProviders(<RouterProvider router={router} />, { auth: candidateAuth }), router };
};

it('keeps Browse Jobs card content and logo geometry at a 360px viewport', () => {
  const previousWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 });
  try {
    mockSearchJobs.mockReturnValue(queryResult({
      items: [{ ...job, companyLogoUrl: 'https://assets.example.test/northstar.png' }],
      pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1,
    }) as ReturnType<typeof useSearchJobsQuery>);
    renderPage();
    const image = screen.getByRole('img', { name: 'Northstar Labs logo' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.parentElement).toHaveStyle({ width: '52px', height: '52px', flexShrink: '0' });
    expect(screen.getByRole('article')).toHaveStyle({ minWidth: '0', display: 'flex', flexDirection: 'column' });
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
  mockProfile.mockReturnValue(queryResult({ resume: null }) as ReturnType<typeof useGetProfileQuery>);
  mockResumeStatus.mockReturnValue(
    queryResult({ extractedAtUtc: null, extractionStatus: 0, hasResume: false, message: 'Upload a resume.' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
  );
  mockRecommended.mockReturnValue(
    queryResult({ extractionStatus: 2, items: [], message: '', pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0 }) as ReturnType<typeof useGetRecommendedJobsQuery>,
  );
  mockUploadResume.mockReturnValue(mutationResult() as unknown as ReturnType<typeof useUploadResumeMutation>);
  mockMemberships.mockReturnValue(queryResult([]) as ReturnType<typeof useGetMembershipsQuery>);
  mockNotifications.mockReturnValue(
    queryResult({ items: [], pageNumber: 1, pageSize: 1, totalCount: 0, totalPages: 0, unreadCount: 0 }) as ReturnType<typeof useGetNotificationsQuery>,
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

describe('Candidate Browse jobs', () => {
  it('restores cross-facet selections from shared URLs and synchronizes chips, back and forward', async () => {
    const { router } = renderPage('/dashboard/jobs?roleCategories=software&locations=Pune&departments=Engineering&educationRequirements=B.Tech&page=3');
    for (const name of ['Software Development, 11 jobs', 'Pune, 12 jobs', 'Engineering, 12 jobs', 'B.Tech / B.E., 5 jobs']) {
      expect(screen.getByRole('checkbox', { name })).toBeChecked();
    }
    expect(mockFilterOptions.mock.calls.at(-1)?.[0]).toMatchObject({ roleCategories: ['software'], locations: ['Pune'], departments: ['Engineering'], educationRequirements: ['B.Tech'] });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Hyderabad, 10 jobs' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ locations: ['Pune', 'Hyderabad'], roleCategories: ['software'], pageNumber: 1 });
    const params = new URLSearchParams(router.state.location.search);
    expect(params.getAll('locations')).toEqual(['Pune', 'Hyderabad']);
    expect(params.has('page')).toBe(false);
    await userEvent.click(screen.getByLabelText('Software Development. Remove filter'));
    expect(screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' })).not.toBeChecked();
    expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).roleCategories).toBeUndefined();
    await act(() => router.navigate(-1));
    expect(screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' })).toBeChecked();
    await act(() => router.navigate(1));
    expect(screen.getByRole('checkbox', { name: 'Software Development, 11 jobs' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(router.state.location.search).toBe('?mode=all');
    expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
  });

  it('preserves existing facets while refetching and does not depend on supplemental counts', () => {
    mockFilterOptions.mockReturnValue(queryResult(options, { isFetching: true }) as ReturnType<typeof useGetJobFilterOptionsQuery>);
    mockSupplementalCounts.mockReturnValue(queryResult(undefined, { isError: true }) as ReturnType<typeof useGetSupplementalJobFilterCountsQuery>);
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
    mockFilterOptions.mockReturnValue(queryResult({ ...options, roleCategories: [], locations: [], departments: [], educationRequirements: [] }) as ReturnType<typeof useGetJobFilterOptionsQuery>);
    renderPage();
    for (const name of ['Role category', 'Location', 'Department', 'Education']) expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    expect(screen.queryByText('No options available.')).not.toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeVisible();
  });

  it('keeps date filtering contextual and resets pagination', async () => {
    renderPage('/dashboard/jobs?roleCategories=software&page=4');
    await userEvent.click(screen.getByRole('radio', { name: 'Last 24 hours (3)' }));
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({ freshnessDays: 1, roleCategories: ['software'], pageNumber: 1 });
    expect(mockFilterOptions.mock.calls.at(-1)?.[0]).toMatchObject({ freshnessDays: 1, roleCategories: ['software'] });
  });
  it.each([
    { score: 92, color: 'Success' },
    { score: 74, color: 'Info' },
    { score: 58, color: 'Warning' },
  ])('shows one $score% badge without inventing empty match reasons', ({ score, color }) => {
    renderWithProviders(<RouterProvider router={createMemoryRouter([{ path: '/', element: <JobCard compact job={job} match={{ matchScore: score, matchReasons: [] }} /> }])} />);
    expect(screen.getAllByText(`${score}% Match`)).toHaveLength(1);
    expect(screen.getByText(`${score}% Match`).closest('.MuiChip-root')).toHaveClass(`MuiChip-color${color}`);
    expect(screen.queryByRole('list', { name: 'Why this job matches you' })).not.toBeInTheDocument();
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Skills, job title or company' }), {
      target: { value: 'react' },
    });
    await act(() => vi.advanceTimersByTimeAsync(400));
    vi.useRealTimers();
    expect(screen.getByTestId('location')).toHaveTextContent('q=react');
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      keyword: 'react',
      pageNumber: 1,
    });
  });

  it('uses one shared 52px height for every search-row control', () => {
    renderPage();

    [
      'job-search-keyword',
      'job-search-location',
      'job-search-experience',
      'job-search-submit',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-control-height', '52');
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
    await userEvent.click(screen.getByRole('checkbox', { name: 'Product Management - Technology, 4 jobs' }));
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
    expect(within(mobileFilters).getByRole('checkbox', { name: 'Software Development, 11 jobs' })).toBeChecked();
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
    ['Company', 'Job type', 'Featured', 'Internship duration', 'Category', 'Posted by', 'Industry']
      .forEach((name) => expect(within(panel).queryByRole('button', { name })).toBeNull());

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
    expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).maxExperienceYears)
      .toBeUndefined();
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
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('minAmount=500000'));
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
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Search departments' }), 'Marketing');
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Marketing, 4 jobs' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByTestId('location')).not.toHaveTextContent('departments=Marketing');

    await userEvent.click(viewMore);
    dialog = screen.getByRole('dialog', { name: 'Select departments' });
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Search departments' }), 'Marketing');
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
      ['companyName', 'employmentType', 'featured', 'duration', 'flexibleDuration', 'roleCategory', 'postedBy', 'industry']
        .forEach((name) => expect(location).not.toContain(name));
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
    await waitFor(() => expect(applicationMutation[0]).toHaveBeenCalledWith({ applicationMethod: 'External', jobId: job.id }));
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

  it('shows the original uploaded filename only after profile metadata refresh', async () => {
    const upload = mutationResult();
    let profileData: { resume: null | { fileName: string; uploadedAtUtc: string } } = {
      resume: null,
    };
    let resumeStatusData = {
      extractedAtUtc: null,
      extractionStatus: 0,
      hasResume: false,
      message: '',
    };
    const refetchProfile = vi.fn().mockImplementation(() => {
      profileData = {
        resume: {
          fileName: 'Manoj_Shekapure_DotNet_Resume.pdf',
          uploadedAtUtc: '2026-08-14T08:00:00Z',
        },
      };
      return Promise.resolve();
    });
    const refetchStatus = vi.fn().mockImplementation(() => {
      resumeStatusData = {
        extractedAtUtc: null,
        extractionStatus: 1,
        hasResume: true,
        message: '',
      };
      return Promise.resolve();
    });
    mockUploadResume.mockReturnValue(upload as unknown as ReturnType<typeof useUploadResumeMutation>);
    mockProfile.mockImplementation(
      () =>
        queryResult(profileData, { refetch: refetchProfile }) as ReturnType<
          typeof useGetProfileQuery
        >,
    );
    mockResumeStatus.mockImplementation(
      () =>
        queryResult(resumeStatusData, {
          fulfilledTimeStamp: Date.now(),
          refetch: refetchStatus,
        }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    renderPage();
    expect(screen.getByText('Upload your resume to get personalized job matches.')).toBeVisible();
    expect(screen.getByText('PDF, DOC, or DOCX up to 5 MB.')).toBeVisible();
    const file = new File(['resume'], 'Manoj_Shekapure_DotNet_Resume.pdf', {
      type: 'application/pdf',
    });
    await userEvent.upload(screen.getByLabelText('Choose resume'), file);
    expect(upload[0]).toHaveBeenCalledWith(file);
    await waitFor(() => expect(refetchProfile).toHaveBeenCalledOnce());
    await waitFor(() => expect(refetchStatus).toHaveBeenCalledOnce());
    expect(await screen.findByText('Manoj_Shekapure_DotNet_Resume.pdf')).toBeVisible();
    expect(screen.queryByText('resume.pdf')).toBeNull();
  });

  it('uses recommendation mode without sending All jobs filters and removes an applied recommendation', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
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
    expect(screen.getAllByText('92% Match')).toHaveLength(1);
    expect(screen.getByText('Matches skills: React').closest('article')).toContainElement(screen.getByText('92% Match'));
    expect(screen.getByText('Matches skills: React')).toBeVisible();
    expect(mockRecommended).toHaveBeenCalledWith({ pageNumber: 3, pageSize: 20 }, { skip: false });
    expect(mockSearchJobs.mock.calls.at(-1)?.[1]).toEqual({ skip: true });
    await userEvent.click(screen.getByRole('button', { name: 'Apply manually' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to company website' }));
    await waitFor(() => expect(screen.queryByText(job.title)).not.toBeInTheDocument());
    open.mockRestore();
  });

  it('shows a View all jobs action when recommendations are empty', async () => {
    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 2, hasResume: true, message: 'Ready' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    renderPage('/dashboard/jobs?mode=recommended');
    await userEvent.click(screen.getByRole('button', { name: 'Browse all jobs' }));
    expect(screen.getByTestId('location')).toHaveTextContent('mode=all');
  });

  it('shows safe Processing and Failed resume states with the API filename', () => {
    mockProfile.mockReturnValue(
      queryResult({ resume: { fileName: 'Avery-Patel-Resume.docx' } }) as ReturnType<
        typeof useGetProfileQuery
      >,
    );
    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 1, hasResume: true, message: 'Internal processing detail' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    const processing = renderPage();
    expect(screen.getByText('Avery-Patel-Resume.docx')).toBeVisible();
    expect(screen.getByText('Analyzing resume…')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh matches' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update resume' })).toBeVisible();
    expect(screen.queryByText('Internal processing detail')).toBeNull();
    processing.unmount();

    mockResumeStatus.mockReturnValue(
      queryResult({ extractedAtUtc: null, extractionStatus: 3, hasResume: true, message: 'Private parser error' }, { fulfilledTimeStamp: Date.now() }) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    renderPage();
    expect(screen.getByText('Avery-Patel-Resume.docx')).toBeVisible();
    expect(screen.getByText(/Your resume is stored, but recommendations could not be prepared/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Update resume' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry status' })).toBeVisible();
    expect(screen.queryByText('Private parser error')).toBeNull();
  });

  it('renders all five modes in order and maps them to backend query fields', async () => {
    renderPage('/dashboard/jobs?page=3');

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'All jobs',
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
    expect(screen.getByRole('link', { name: `View details for ${job.title} at ${job.companyName}` })).toBeVisible();

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
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('mode=fresher'),
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      maxExperienceYears: 1,
      minExperienceYears: 0,
      pageNumber: 1,
    });
    expect(screen.getByRole('slider', { name: 'Minimum experience' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByRole('slider', { name: 'Maximum experience' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );

    await userEvent.click(screen.getByRole('tab', { name: 'Experienced' }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('mode=experienced'),
    );
    expect(mockSearchJobs.mock.calls.at(-1)?.[0]).toMatchObject({
      minExperienceYears: 2,
      pageNumber: 1,
    });
    expect((mockSearchJobs.mock.calls.at(-1)?.[0] as PublicJobQuery).maxExperienceYears).toBeUndefined();
    expect(screen.getByRole('slider', { name: 'Minimum experience' })).toHaveAttribute(
      'aria-valuenow',
      '2',
    );
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

  it('downloads a ready resume securely and revokes the temporary object URL', async () => {
    const createObjectUrl = vi.fn().mockReturnValue('blob:career-harbor-resume');
    const revokeObjectUrl = vi.fn();
    let downloadedFileName = '';
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFileName = this.download;
      });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
    mockResumeStatus.mockReturnValue(
      queryResult(
        {
          extractedAtUtc: '2026-08-10T00:00:00Z',
          extractionStatus: 2,
          hasResume: true,
          message: 'Ready',
        },
        { fulfilledTimeStamp: Date.now() },
      ) as ReturnType<typeof useGetResumeStatusQuery>,
    );
    mockProfile.mockReturnValue(
      queryResult({ resume: { fileName: 'Manoj_Shekapure_DotNet_Resume.pdf', uploadedAtUtc: '2026-08-09T12:00:00Z' } }) as ReturnType<typeof useGetProfileQuery>,
    );
    let resolveDownload!: (blob: Blob) => void;
    mockDownloadResume.mockReturnValue(
      new Promise<Blob>((resolve) => {
        resolveDownload = resolve;
      }),
    );

    renderPage();
    expect(screen.getByText('Manoj_Shekapure_DotNet_Resume.pdf')).toBeVisible();
    expect(screen.getByText('Resume analyzed')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Update resume' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh matches' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Upload resume' })).toBeNull();

    const downloadButton = screen.getByRole('button', { name: 'Download resume' });
    await userEvent.click(downloadButton);
    expect(screen.getByRole('button', { name: 'Downloading…' })).toBeDisabled();
    fireEvent.click(downloadButton);
    await waitFor(() => expect(mockDownloadResume).toHaveBeenCalledOnce());
    resolveDownload(new Blob(['resume'], { type: 'application/pdf' }));
    await waitFor(() => expect(revokeObjectUrl).toHaveBeenCalledWith('blob:career-harbor-resume'));
    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(downloadedFileName).toBe('Manoj_Shekapure_DotNet_Resume.pdf');
    expect(anchorClick).toHaveBeenCalledOnce();
    anchorClick.mockRestore();
  });

  it('does not announce a zero result count while jobs are loading', () => {
    mockSearchJobs.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useSearchJobsQuery>,
    );

    renderPage();

    expect(screen.getByRole('heading', { name: 'Finding jobs…' })).toBeVisible();
    expect(screen.queryByText(/0 (active )?jobs/i)).toBeNull();
  });
});
