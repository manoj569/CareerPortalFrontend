import {
  downloadCandidateResume,
  useAddCandidateSkillMutation,
  useChangePasswordMutation,
  useDeleteCandidateSkillMutation,
  useDeleteResumeMutation,
  useGetApplicationQuery,
  useGetApplicationsQuery,
  useGetCandidateSkillsQuery,
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
import { UserRole } from '@/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationsPage } from './ApplicationsPage';
import { ApplicationDetailsPage } from './ApplicationDetailsPage';
import { DashboardPage } from './DashboardPage';
import { NotificationsPage } from './NotificationsPage';
import { ProfilePage } from './ProfilePage';
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

const mockProfile = vi.mocked(useGetProfileQuery);
const mockCompletion = vi.mocked(useGetProfileCompletionQuery);
const mockCandidateSkills = vi.mocked(useGetCandidateSkillsQuery);
const mockOnboarding = vi.mocked(useGetOnboardingQuery);
const mockResumeStatus = vi.mocked(useGetResumeStatusQuery);
const mockApplication = vi.mocked(useGetApplicationQuery);
const mockSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockApplications = vi.mocked(useGetApplicationsQuery);
const mockMemberships = vi.mocked(useGetMembershipsQuery);
const mockNotifications = vi.mocked(useGetNotificationsQuery);
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
  mockProfile.mockReturnValue(queryResult({ data: profile }));
  mockCompletion.mockReturnValue(
    queryResult({
      data: {
        completedSections: ['basicDetails', 'resumeHeadline', 'profileSummary', 'skills'],
        completionPercentage: 60,
        missingSections: ['resume', 'careerPreferences'],
        sections: [
          { isCompleted: true, section: 'basicDetails', weight: 15 },
          { isCompleted: true, section: 'resumeHeadline', weight: 10 },
          { isCompleted: true, section: 'profileSummary', weight: 15 },
          { isCompleted: true, section: 'skills', weight: 20 },
          { isCompleted: false, section: 'resume', weight: 20 },
          { isCompleted: false, section: 'careerPreferences', weight: 20 },
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

describe('candidate dashboard pages', () => {
  it('renders a live overview from dashboard endpoints', () => {
    mockSavedJobs.mockReturnValue(
      queryResult({
        data: { items: [savedJob], pageNumber: 1, pageSize: 3, totalCount: 2, totalPages: 1 },
      }),
    );
    mockApplications.mockReturnValue(
      queryResult({
        data: { items: [application], pageNumber: 1, pageSize: 5, totalCount: 1, totalPages: 1 },
      }),
    );
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

    expect(screen.getByRole('heading', { name: 'Welcome, Avery' })).toBeInTheDocument();
    expect(
      within(screen.getByText('Saved jobs').parentElement!).getByText('2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Job Application Access')).toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute(
      'href',
      '/dashboard/portfolio',
    );
  });

  it('renders the overview loading state', () => {
    mockProfile.mockReturnValue(queryResult({ isLoading: true }));
    renderPage(<DashboardPage />);
    expect(screen.getByLabelText('Loading candidate dashboard')).toBeInTheDocument();
  });

  it('keeps existing additional profile updates through the Candidate API', async () => {
    const updated = { ...profile, location: 'Bengaluru' };
    const mutation = mutationResult(updated);
    mockUpdateProfile.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useUpdateProfileMutation>,
    );
    renderPage(<ProfilePage />);

    const profileDetails = screen.getByRole('heading', { name: 'Profile details' }).closest('section')!;
    await userEvent.click(within(profileDetails).getByRole('button', { name: 'Edit' }));
    const location = screen.getByRole('textbox', { name: 'Current location' });
    await userEvent.clear(location);
    await userEvent.type(location, 'Bengaluru');
    await userEvent.click(screen.getByRole('button', { name: 'Save additional details' }));

    await waitFor(() => {
      expect(mutation.trigger).toHaveBeenCalledWith(
        expect.objectContaining({ location: 'Bengaluru' }),
      );
    });
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
    await userEvent.click(
      screen.getByRole('button', {
        name: `Remove ${job.title} from saved jobs`,
      }),
    );
    expect(mutation.trigger).toHaveBeenCalledWith(job.id);
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
