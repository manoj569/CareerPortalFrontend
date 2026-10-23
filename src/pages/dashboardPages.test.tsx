import {
  downloadCandidateResume,
  useAddCandidateSkillMutation,
  useChangePasswordMutation,
  useDeleteCandidateSkillMutation,
  useDeleteResumeMutation,
  useGetApplicationQuery,
  useGetApplicationsQuery,
  useGetCandidateSkillsQuery,
  useGetCandidateBasicDetailsQuery,
  useGetMembershipsQuery,
  useGetOnboardingQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetProfileCompletionQuery,
  useGetResumeStatusQuery,
  useGetSavedJobsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useUpdateCandidateAboutMutation,
  useUpdateCandidateSkillMutation,
  useUploadResumeMutation,
  useUpdateProfileMutation,
  useWithdrawApplicationMutation,
} from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import type * as ReferralMarketplaceModule from '@/features/referrals/api/marketplaceApi';
import type * as InterviewInsightsModule from '@/features/interviewInsights/api/interviewInsightsApi';
import { useGetReferrerInboxQuery } from '@/features/referrals/api/marketplaceApi';
import { useGetMyInterviewContributionsQuery } from '@/features/interviewInsights/api/interviewInsightsApi';
import type { AuthState } from '@/features/auth/store/authSlice';
import {
  JobApplicationStatus,
  MembershipStatus,
  NotificationType,
  type JobApplication,
  type DashboardNotification,
  type Membership,
  type SavedJob,
  type UserProfile,
} from '@/features/dashboard/types/dashboardModels';
import {
  EmploymentType,
  ExperienceLevel,
  WorkplaceType,
  type PublicJobSummary,
} from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import { ROUTES } from '@/constants/routes';
import { UserRole } from '@/types';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { ApplicationsPage } from './ApplicationsPage';
import { ApplicationDetailsPage } from './ApplicationDetailsPage';
import { DashboardPage } from './DashboardPage';
import { NotificationsPage } from './NotificationsPage';
import { ResumePage } from './ResumePage';
import { SavedJobsPage } from './SavedJobsPage';
import { SettingsPage } from './SettingsPage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return {
    ...actual,
    downloadCandidateResume: vi.fn(),
    useAddCandidateSkillMutation: vi.fn(),
    useChangePasswordMutation: vi.fn(),
    useDeleteCandidateSkillMutation: vi.fn(),
    useDeleteResumeMutation: vi.fn(),
    useGetApplicationQuery: vi.fn(),
    useGetApplicationsQuery: vi.fn(),
    useGetCandidateSkillsQuery: vi.fn(),
    useGetCandidateBasicDetailsQuery: vi.fn(),
    useGetMembershipsQuery: vi.fn(),
    useGetOnboardingQuery: vi.fn(),
    useGetNotificationsQuery: vi.fn(),
    useGetProfileQuery: vi.fn(),
    useGetProfileCompletionQuery: vi.fn(),
    useGetResumeStatusQuery: vi.fn(),
    useGetSavedJobsQuery: vi.fn(),
    useMarkAllNotificationsReadMutation: vi.fn(),
    useMarkNotificationReadMutation: vi.fn(),
    useRemoveSavedJobMutation: vi.fn(),
    useSaveJobMutation: vi.fn(),
    useUpdateCandidateAboutMutation: vi.fn(),
    useUpdateCandidateSkillMutation: vi.fn(),
    useUploadResumeMutation: vi.fn(),
    useUpdateProfileMutation: vi.fn(),
    useWithdrawApplicationMutation: vi.fn(),
  };
});
vi.mock('@/features/referrals/api/marketplaceApi', async (importOriginal) => {
  const actual = await importOriginal<typeof ReferralMarketplaceModule>();
  return { ...actual, useGetReferrerInboxQuery: vi.fn() };
});
vi.mock('@/features/interviewInsights/api/interviewInsightsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof InterviewInsightsModule>();
  return { ...actual, useGetMyInterviewContributionsQuery: vi.fn() };
});

const mockProfile = vi.mocked(useGetProfileQuery);
const mockCompletion = vi.mocked(useGetProfileCompletionQuery);
const mockCandidateSkills = vi.mocked(useGetCandidateSkillsQuery);
const mockBasicDetails = vi.mocked(useGetCandidateBasicDetailsQuery);
const mockOnboarding = vi.mocked(useGetOnboardingQuery);
const mockResumeStatus = vi.mocked(useGetResumeStatusQuery);
const mockApplication = vi.mocked(useGetApplicationQuery);
const mockSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockApplications = vi.mocked(useGetApplicationsQuery);
const mockMemberships = vi.mocked(useGetMembershipsQuery);
const mockNotifications = vi.mocked(useGetNotificationsQuery);
const mockReferrerInbox = vi.mocked(useGetReferrerInboxQuery);
const mockInterviewContributions = vi.mocked(useGetMyInterviewContributionsQuery);
const mockUpdateProfile = vi.mocked(useUpdateProfileMutation);
const mockUpdateAbout = vi.mocked(useUpdateCandidateAboutMutation);
const mockAddSkill = vi.mocked(useAddCandidateSkillMutation);
const mockUpdateSkill = vi.mocked(useUpdateCandidateSkillMutation);
const mockDeleteSkill = vi.mocked(useDeleteCandidateSkillMutation);
const mockUploadResume = vi.mocked(useUploadResumeMutation);
const mockDownloadResume = vi.mocked(downloadCandidateResume);
const mockDeleteResume = vi.mocked(useDeleteResumeMutation);
const mockWithdrawApplication = vi.mocked(useWithdrawApplicationMutation);
const mockRemoveSavedJob = vi.mocked(useRemoveSavedJobMutation);
const mockSaveJob = vi.mocked(useSaveJobMutation);
const mockMarkRead = vi.mocked(useMarkNotificationReadMutation);
const mockMarkAllRead = vi.mocked(useMarkAllNotificationsReadMutation);
const mockChangePassword = vi.mocked(useChangePasswordMutation);
const refetch = vi.fn();

const auth: AuthState = {
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
  isSubmitting: false,
  status: 'authenticated',
  user: {
    email: 'avery@example.com',
    firstName: 'Avery',
    id: 'user-id',
    lastName: 'Patel',
    role: UserRole.Candidate,
  },
};

const profile: UserProfile = {
  bio: 'I build accessible web products.',
  education: ['B.Tech Computer Science'],
  email: 'avery@example.com',
  experience: ['Senior engineer at Northstar'],
  firstName: 'Avery',
  headline: 'Senior frontend engineer',
  id: 'user-id',
  lastName: 'Patel',
  linkedInUrl: 'https://linkedin.com/in/avery',
  location: 'Pune',
  portfolioUrl: 'https://avery.example.com',
  preferredJobTypes: [EmploymentType.FullTime],
  resume: null,
  skills: ['React', 'TypeScript'],
};

const job: PublicJobSummary = {
  categoryId: 'category-id',
  categoryName: 'Engineering',
  companyId: 'company-id',
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
  id: 'job-id',
  isFeatured: false,
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

const savedJob: SavedJob = {
  companyName: job.companyName,
  jobId: job.id,
  savedAtUtc: '2026-07-25T10:00:00Z',
  savedJobId: 'saved-id',
  slug: job.slug,
  title: job.title,
};

const application: JobApplication = {
  applicationMethod: 'Portal',
  applicationUrl: null,
  categoryName: job.categoryName,
  closingDate: job.expiresAtUtc,
  companyName: job.companyName,
  coverLetter: 'I would love to join the team.',
  id: 'application-id',
  employmentType: job.employmentType,
  experienceLevel: job.experienceLevel,
  jobId: job.id,
  jobSlug: job.slug,
  jobTitle: job.title,
  location: job.location,
  resumeFileName: 'resume.pdf',
  status: JobApplicationStatus.Submitted,
  submittedAtUtc: '2026-07-26T10:00:00Z',
  withdrawnAtUtc: null,
  workMode: job.workplaceType,
};

const membership: Membership = {
  autoRenew: false,
  endsAtUtc: null,
  id: 'membership-id',
  planName: 'Job Application Access',
  startsAtUtc: '2026-07-01T00:00:00Z',
  status: MembershipStatus.Active,
};

const notification: DashboardNotification = {
  actionUrl: '/dashboard/applications',
  createdAtUtc: '2026-07-27T10:00:00Z',
  id: 'notification-id',
  isRead: false,
  message: 'Your application access was recorded.',
  readAtUtc: null,
  title: 'Application recorded',
  type: NotificationType.Application,
};

const queryResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isError: false,
  isFetching: false,
  isLoading: false,
  refetch,
  ...overrides,
});

const mutationResult = <T,>(value?: T) => {
  const unwrap = vi.fn().mockResolvedValue(value);
  const trigger = vi.fn(() => ({ unwrap }));
  return { trigger, tuple: [trigger, { isLoading: false }] };
};

const renderPage = (page: React.ReactElement) =>
  renderWithProviders(<MemoryRouter>{page}</MemoryRouter>, { auth });

const renderApplicationDetails = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={[`/dashboard/applications/${application.id}`]}>
      <Routes>
        <Route element={<ApplicationDetailsPage />} path="/dashboard/applications/:applicationId" />
      </Routes>
    </MemoryRouter>,
    { auth },
  );

beforeEach(() => {
  refetch.mockReset();
  vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [] } });
  mockProfile.mockReturnValue(queryResult({ data: profile }));
  mockCompletion.mockReturnValue(
    queryResult({
      data: {
        completedSections: ['BasicDetails', 'Skills', 'ProfileSummary'],
        completionPercentage: 60,
        missingSections: ['CareerPreferences', 'Education', 'Employment', 'Resume'],
        nextRecommendedIncompleteStep: 'CareerPreferences',
        sections: [
          { isCompleted: true, section: 'BasicDetails', weight: 15 },
          { isCompleted: true, section: 'Skills', weight: 20 },
          { isCompleted: true, section: 'ProfileSummary', weight: 15 },
          { isCompleted: false, section: 'Resume', weight: 20 },
          { isCompleted: false, section: 'CareerPreferences', weight: 20 },
        ],
      },
    }),
  );
  mockCandidateSkills.mockReturnValue(queryResult({ data: [] }));
  mockOnboarding.mockReturnValue(queryResult());
  mockResumeStatus.mockReturnValue(
    queryResult({
      data: { extractedAtUtc: null, extractionStatus: 0, hasResume: false, message: '' },
    }),
  );
  mockSavedJobs.mockReturnValue(
    queryResult({
      data: { items: [], pageNumber: 1, pageSize: 12, totalCount: 0, totalPages: 0 },
    }),
  );
  mockApplications.mockReturnValue(
    queryResult({
      data: { items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    }),
  );
  mockApplication.mockReturnValue(queryResult({ data: application }));
  mockMemberships.mockReturnValue(queryResult({ data: [] }));
  mockReferrerInbox.mockReturnValue(queryResult({ data: [] }) as ReturnType<typeof useGetReferrerInboxQuery>);
  mockInterviewContributions.mockReturnValue(queryResult({ data: { insightsPublished: 0 } }) as ReturnType<typeof useGetMyInterviewContributionsQuery>);
  mockBasicDetails.mockReturnValue(queryResult({ data: { email: 'avery@example.com', mobileNumber: '+919876543210', mobileVerified: true, workStatus: 'Experienced', isOutsideIndia: false, currentCountry: 'India', currentCity: 'Pune', currentArea: null, noticePeriod: 'OneMonth', availabilityToJoin: null, currentAnnualSalary: null, currentFixedAnnualSalary: null, currentVariableAnnualSalary: null, salaryUnit: 'INR per annum' } }));
  mockNotifications.mockReturnValue(
    queryResult({
      data: {
        page: { items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
        unreadCount: 0,
      },
    }),
  );
  mockUpdateProfile.mockReturnValue(
    mutationResult(profile).tuple as unknown as ReturnType<typeof useUpdateProfileMutation>,
  );
  mockUpdateAbout.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useUpdateCandidateAboutMutation>,
  );
  mockAddSkill.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useAddCandidateSkillMutation>,
  );
  mockUpdateSkill.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useUpdateCandidateSkillMutation>,
  );
  mockDeleteSkill.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useDeleteCandidateSkillMutation>,
  );
  mockUploadResume.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useUploadResumeMutation>,
  );
  mockDownloadResume.mockResolvedValue(new Blob());
  mockDeleteResume.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useDeleteResumeMutation>,
  );
  mockWithdrawApplication.mockReturnValue(
    mutationResult(application).tuple as unknown as ReturnType<
      typeof useWithdrawApplicationMutation
    >,
  );
  mockRemoveSavedJob.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useRemoveSavedJobMutation>,
  );
  mockSaveJob.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useSaveJobMutation>,
  );
  mockMarkRead.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useMarkNotificationReadMutation>,
  );
  mockMarkAllRead.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useMarkAllNotificationsReadMutation>,
  );
  mockChangePassword.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useChangePasswordMutation>,
  );
});

afterEach(() => vi.restoreAllMocks());

describe('candidate dashboard pages', () => {
  it('renders the compact welcome, real dashboard counts, and existing quick-action routes', () => {
    mockSavedJobs.mockReturnValue(
      queryResult({
        data: { items: [savedJob], pageNumber: 1, pageSize: 3, totalCount: 2, totalPages: 1 },
      }),
    );
    mockApplications.mockReturnValue(
      queryResult({
        data: { items: [application], pageNumber: 1, pageSize: 5, totalCount: 32, totalPages: 7 },
      }),
    );
    mockReferrerInbox.mockReturnValue(queryResult({ data: [
      { request: { status: 'Requested' } },
      { request: { status: 'Requested' } },
      { request: { status: 'Accepted' } },
    ] }) as ReturnType<typeof useGetReferrerInboxQuery>);
    mockInterviewContributions.mockReturnValue(queryResult({ data: { insightsPublished: 7 } }) as ReturnType<typeof useGetMyInterviewContributionsQuery>);
    mockMemberships.mockReturnValue(queryResult({ data: [membership] }));
    mockNotifications.mockReturnValue(
      queryResult({
        data: {
          page: {
            items: [notification],
            pageNumber: 1,
            pageSize: 5,
            totalCount: 3,
            totalPages: 1,
          },
          unreadCount: 3,
        },
      }),
    );

    renderPage(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Welcome back, Avery' })).toBeInTheDocument();
    expect(screen.getByLabelText('Saved jobs: 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Applied jobs: 32')).toBeInTheDocument();
    expect(screen.getByLabelText('Pending referrals: 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Insights published: 7')).toBeInTheDocument();
   
    expect(screen.getByText('Job Application Access')).toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Continue with career preferences.')).toBeVisible();
    expect(screen.getByRole('link', { name: /Find jobs for you/ })).toHaveAttribute('href', '/dashboard/jobs');
    expect(screen.getByRole('link', { name: /Get referred/ })).toHaveAttribute('href', '/dashboard/jobs?mode=referral');
    expect(screen.getByRole('link', { name: /Prepare for interviews/ })).toHaveAttribute('href', '/dashboard/interview-insights');
    expect(screen.getByRole('link', { name: /Learn and grow/ })).toHaveAttribute('href', '/career-guidance');
  });

  it('puts Hiring Opportunities before quick actions and removes the marketing carousel from the dashboard', async () => {
    const drive = {
      id: 'dashboard-ad',
      title: 'Candidate hiring drive',
      subtitle: null,
      badgeText: null,
      badgeType: null,
      company: { id: 'company-1', name: 'Example Company', logoUrl: null },
      imageUrl: null,
      locationText: 'Remote',
      experienceText: null,
      isSponsored: false,
      destination: { type: 'external', url: 'https://careers.example.test/apply' },
    };
    const request = vi.spyOn(apiClient, 'request');
    request.mockImplementation((config) => Promise.resolve({ data: { data: config.url === '/job-promotions/active' ? [] : [drive] } }));
    renderPage(<DashboardPage />);

    const hiring = await screen.findByRole('region', { name: 'Hiring Opportunities' });
    const explore = screen.getByRole('heading', { name: 'Explore CareerHarbor' });
    const profileProgress = screen.getByRole('heading', { name: 'Profile progress' });
    expect(screen.queryByRole('region', { name: 'Career Harbor features' })).not.toBeInTheDocument();
    expect(hiring.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(explore.compareDocumentPosition(profileProgress) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await waitFor(() =>
      expect(
        request.mock.calls.some(([config]) => config.url === '/public/hiring-drives/home'),
      ).toBe(true),
    );
    expect(request.mock.calls.some(([config]) => config.url === '/public/hiring-drives')).toBe(
      false,
    );
  });

  it('keeps the dashboard content available while profile data is loading', () => {
    mockProfile.mockReturnValue(queryResult({ isLoading: true }));
    renderPage(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Welcome back, Avery' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Hiring Opportunities' })).toBeInTheDocument();
  });

  it('validates and uploads a supported resume file', async () => {
    const mutation = mutationResult();
    mockUploadResume.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useUploadResumeMutation>,
    );
    renderPage(<ResumePage />);

    const file = new File(['%PDF-resume'], 'candidate.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText('Choose resume'), file);

    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith(file));
  });

  it('rejects an unsupported resume before uploading', async () => {
    const mutation = mutationResult();
    mockUploadResume.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useUploadResumeMutation>,
    );
    renderPage(<ResumePage />);

    await userEvent.upload(
      screen.getByLabelText('Choose resume'),
      new File(['plain text'], 'candidate.txt', { type: 'text/plain' }),
      { applyAccept: false },
    );

    expect(await screen.findByText('Choose a PDF, DOC, or DOCX file.')).toBeInTheDocument();
    expect(mutation.trigger).not.toHaveBeenCalled();
  });

  it('renders saved jobs and removes a saved job through the API mutation', async () => {
    mockSavedJobs.mockReturnValue(
      queryResult({
        data: { items: [savedJob], pageNumber: 1, pageSize: 12, totalCount: 1, totalPages: 1 },
      }),
    );
    const mutation = mutationResult();
    mockRemoveSavedJob.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useRemoveSavedJobMutation>,
    );
    renderPage(<SavedJobsPage />);

    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `${savedJob.companyName} initials` })).toHaveTextContent('NL');
    await userEvent.click(
      screen.getByRole('button', {
        name: `Remove ${job.title} from saved jobs`,
      }),
    );
    expect(mutation.trigger).toHaveBeenCalledWith(job.id);
  });

  it('renders an optional saved-job logo while paging a 10,000-job catalogue on the server', async () => {
    mockSavedJobs.mockReturnValue(
      queryResult({
        data: {
          items: [{ ...savedJob, companyLogoUrl: '/company-logo.svg' }],
          pageNumber: 1, pageSize: 12, totalCount: 10000, totalPages: 834,
        },
      }),
    );
    renderPage(<SavedJobsPage />);
    const image = screen.getByRole('img', { name: `${savedJob.companyName} logo` });
    expect(image).toHaveAttribute('src', '/company-logo.svg');
    expect(image.parentElement).toHaveStyle({ width: '24px', height: '24px' });
    expect(mockSavedJobs).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 12 });
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(mockSavedJobs).toHaveBeenCalledWith({ pageNumber: 2, pageSize: 12 });
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('saves a public job through the authenticated dashboard endpoint', async () => {
    const mutation = mutationResult();
    mockSaveJob.mockReturnValue(mutation.tuple as unknown as ReturnType<typeof useSaveJobMutation>);
    renderPage(<SaveJobButton jobId={job.id} jobTitle={job.title} />);

    await userEvent.click(screen.getByRole('button', { name: `Save ${job.title}` }));
    expect(mutation.trigger).toHaveBeenCalledWith(job.id);
  });

  it('shows the honest saved-jobs empty state', () => {
    renderPage(<SavedJobsPage />);
    expect(screen.getByText('No saved jobs yet')).toBeInTheDocument();
  });

  it('renders backend applications and their real status', () => {
    mockApplications.mockReturnValue(
      queryResult({
        data: { items: [application], pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
      }),
    );
    renderPage(<ApplicationsPage />);

    expect(screen.getByText(/Referral requests have their own lifecycle/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View My Referral Requests' })).toHaveAttribute('href', '/dashboard/my-referral-requests');

    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText(job.categoryName)).toBeInTheDocument();
    expect(screen.getByText('Full time')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view job/i })).toHaveAttribute(
      'href',
      `/jobs/${job.slug}`,
    );
  });

  it('withdraws a Submitted application after confirmation', async () => {
    const mutation = mutationResult({ ...application, status: JobApplicationStatus.Withdrawn });
    mockWithdrawApplication.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useWithdrawApplicationMutation>,
    );
    renderApplicationDetails();

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw application' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm withdrawal' }));

    expect(mutation.trigger).toHaveBeenCalledWith(application.id);
  });

  it('marks a notification as read through the API mutation', async () => {
    mockNotifications.mockReturnValue(
      queryResult({
        data: {
          page: {
            items: [notification],
            pageNumber: 1,
            pageSize: 10,
            totalCount: 1,
            totalPages: 1,
          },
          unreadCount: 1,
        },
      }),
    );
    const mutation = mutationResult();
    mockMarkRead.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useMarkNotificationReadMutation>,
    );
    renderPage(<NotificationsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(mutation.trigger).toHaveBeenCalledWith(notification.id);
  });

  it('submits a backend-compatible password change and clears the revoked session', async () => {
    const mutation = mutationResult();
    mockChangePassword.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useChangePasswordMutation>,
    );
    const { store } = renderPage(<SettingsPage />);

   expect(screen.getByRole('heading', { name: 'Account security' })).toBeVisible();
expect(screen.getByText('Mobile verification')).toBeVisible();

await userEvent.click(screen.getByRole('button', { name: /Membership/i }));

expect(screen.getByRole('heading', { name: 'Membership' })).toBeVisible();
expect(screen.getByRole('link', { name: 'Manage membership' })).toHaveAttribute(
  'href',
  ROUTES.MEMBERSHIP,
);
expect(screen.queryByText(/Other account controls unavailable/i)).not.toBeInTheDocument();

await userEvent.click(screen.getByRole('button', { name: /Security/i }));
    await userEvent.type(screen.getByLabelText(/^Current password/i), 'OldPassword!123');
    await userEvent.type(screen.getByLabelText(/^New password/i), 'NewPassword!123');
    await userEvent.type(screen.getByLabelText(/^Confirm new password/i), 'NewPassword!123');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => {
      expect(mutation.trigger).toHaveBeenCalledWith({
        currentPassword: 'OldPassword!123',
        newPassword: 'NewPassword!123',
      });
      expect(store.getState().auth.status).toBe('unauthenticated');
    });
  });
});
