import {
  useChangePasswordMutation,
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useUpdateProfileMutation,
} from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import type { AuthState } from '@/features/auth/store/authSlice';
import {
  JobHistoryAction,
  MembershipStatus,
  NotificationType,
  type AppliedJobHistory,
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
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationsPage } from './ApplicationsPage';
import { DashboardPage } from './DashboardPage';
import { NotificationsPage } from './NotificationsPage';
import { ProfilePage } from './ProfilePage';
import { SavedJobsPage } from './SavedJobsPage';
import { SettingsPage } from './SettingsPage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return {
    ...actual,
    useChangePasswordMutation: vi.fn(),
    useGetApplicationsQuery: vi.fn(),
    useGetMembershipsQuery: vi.fn(),
    useGetNotificationsQuery: vi.fn(),
    useGetProfileQuery: vi.fn(),
    useGetSavedJobsQuery: vi.fn(),
    useMarkAllNotificationsReadMutation: vi.fn(),
    useMarkNotificationReadMutation: vi.fn(),
    useRemoveSavedJobMutation: vi.fn(),
    useSaveJobMutation: vi.fn(),
    useUpdateProfileMutation: vi.fn(),
  };
});

const mockProfile = vi.mocked(useGetProfileQuery);
const mockSavedJobs = vi.mocked(useGetSavedJobsQuery);
const mockApplications = vi.mocked(useGetApplicationsQuery);
const mockMemberships = vi.mocked(useGetMembershipsQuery);
const mockNotifications = vi.mocked(useGetNotificationsQuery);
const mockUpdateProfile = vi.mocked(useUpdateProfileMutation);
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
  createdAtUtc: '2025-01-10T08:00:00Z',
  email: 'avery@example.com',
  emailConfirmed: true,
  firstName: 'Avery',
  headline: 'Senior frontend engineer',
  id: 'user-id',
  lastLoginAtUtc: '2026-07-27T08:00:00Z',
  lastName: 'Patel',
  phoneNumber: '+91 98765 43210',
  profileImageUrl: null,
};

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
  isFeatured: false,
  location: 'Pune',
  maximumSalary: 2500000,
  minimumSalary: 1800000,
  publishedAtUtc: '2026-07-20T00:00:00Z',
  referenceNumber: 'JOB-1001',
  slug: 'senior-react-engineer',
  title: 'Senior React Engineer',
  workplaceType: WorkplaceType.Hybrid,
};

const savedJob: SavedJob = {
  job,
  savedAtUtc: '2026-07-25T10:00:00Z',
  savedJobId: 'saved-id',
};

const application: AppliedJobHistory = {
  action: JobHistoryAction.Applied,
  companyName: job.companyName,
  id: 'application-id',
  jobId: job.id,
  jobSlug: job.slug,
  jobTitle: job.title,
  notes: null,
  occurredAtUtc: '2026-07-26T10:00:00Z',
};

const membership: Membership = {
  autoRenew: false,
  companyId: job.companyId,
  companyName: job.companyName,
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

beforeEach(() => {
  refetch.mockReset();
  mockProfile.mockReturnValue(queryResult({ data: profile }));
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
  });

  it('renders the overview loading state', () => {
    mockProfile.mockReturnValue(queryResult({ isLoading: true }));
    renderPage(<DashboardPage />);
    expect(screen.getByLabelText('Loading candidate dashboard')).toBeInTheDocument();
  });

  it('updates the profile and synchronizes the authenticated user name', async () => {
    const updated = { ...profile, firstName: 'Priya' };
    const mutation = mutationResult(updated);
    mockUpdateProfile.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useUpdateProfileMutation>,
    );
    const { store } = renderPage(<ProfilePage />);

    const firstName = screen.getByRole('textbox', { name: 'First name' });
    await userEvent.clear(firstName);
    await userEvent.type(firstName, 'Priya');
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(mutation.trigger).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Priya' }),
      );
      expect(store.getState().auth.user?.firstName).toBe('Priya');
    });
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

  it('renders backend application history and the capability limitation', () => {
    mockApplications.mockReturnValue(
      queryResult({
        data: { items: [application], pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
      }),
    );
    renderPage(<ApplicationsPage />);

    expect(screen.getByText(job.title)).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText(/no application-detail/i)).toBeInTheDocument();
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
