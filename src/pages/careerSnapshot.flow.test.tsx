import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/features/auth/services/authService';
import { initializeAuth, sessionRefreshed, type AuthState } from '@/features/auth/store/authSlice';
import {
  CareerStage,
  WorkPreference,
  type CandidateProfile,
  type UpdateCareerSnapshotRequest,
} from '@/features/dashboard/types/dashboardModels';
import { authTokenStore } from '@/services/authTokenStore';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole, type AuthenticationResponse } from '@/types';
import { CandidateRoute } from '@/routes/CandidateRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { GuestRoute } from '@/routes/GuestRoute';
import { CandidateCareerSnapshotSummary } from '@/features/dashboard/components/CandidateCareerSnapshotSummary';
import { dashboardApi, useGetProfileQuery } from '@/features/dashboard/api/dashboardApi';
import { CareerSnapshotPage } from './CareerSnapshotPage';
import { RegisterPage } from './RegisterPage';
import { LoginPage } from './LoginPage';

interface SnapshotApiConfig {
  method?: string;
  url: string;
  data?: UpdateCareerSnapshotRequest;
}
const { post, request } = vi.hoisted(() => ({
  post: vi.fn<(url: string, data: unknown, config?: unknown) => Promise<{ data: unknown }>>(),
  request: vi.fn<(config: SnapshotApiConfig) => Promise<{ data: { data: CandidateProfile } }>>(),
}));
vi.mock('@/api/apiClient', () => ({
  apiClient: { post, request },
  refreshAuthentication: async () => {
    const version = authTokenStore.getSessionVersion();
    const response = await post('/auth/refresh', { refreshToken: authTokenStore.getRefreshToken() });
    const session = response.data as AuthenticationResponse;
    if (!authTokenStore.rotate(session, version)) throw new Error('Session changed.');
    return session;
  },
}));
vi.mock('@/features/auth/components/GoogleAuthorizationCodeButton', () => ({
  GoogleAuthorizationCodeButton: ({ onCode }: { onCode: (code: string) => void }) => (
    <button onClick={() => onCode('test-code')}>Continue with Google</button>
  ),
}));

let authentication: AuthenticationResponse;
let profile: CandidateProfile;
let rejected: boolean;
let confirmsCompletion: boolean;
let holdSave: boolean;
let resolveSave: (() => void) | undefined;
const makeAuthentication = (
  required = true,
  role = UserRole.Candidate,
): AuthenticationResponse => ({
  accessToken: 'access',
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  refreshToken: 'refresh',
  refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
  user: {
    id: 'candidate',
    firstName: 'Avery',
    lastName: 'Patel',
    email: 'candidate@example.com',
    role,
    careerSnapshotRequired: required,
  },
});
const makeProfile = (): CandidateProfile => ({
  id: 'candidate',
  email: 'candidate@example.com',
  firstName: 'Avery',
  lastName: 'Patel',
  headline: null,
  bio: null,
  location: null,
  skills: [],
  education: [],
  experience: [],
  linkedInUrl: null,
  portfolioUrl: null,
  preferredJobTypes: [],
  resume: null,
  careerSnapshotRequired: true,
  careerStage: null,
  primaryRole: null,
  yearsOfExperience: null,
  workPreferences: [],
});
const authState = (session: AuthenticationResponse | null): AuthState => ({
  status: session ? 'authenticated' : 'unauthenticated',
  user: session?.user ?? null,
  accessTokenExpiresAtUtc: session?.accessTokenExpiresAtUtc ?? null,
  isSubmitting: false,
  error: null,
});
const ProfileDestination = () => {
  const { data } = useGetProfileQuery();
  return data ? <CandidateCareerSnapshotSummary profile={data} /> : null;
};

const renderFlow = (
  path: string = ROUTES.CAREER_SNAPSHOT,
  session: AuthenticationResponse | null = authentication,
  status?: AuthState['status'],
) => {
  if (session) authTokenStore.set(session);
  const router = createMemoryRouter(
    [
      {
        element: <GuestRoute />,
        children: [
          { path: ROUTES.REGISTER, element: <RegisterPage /> },
          { path: ROUTES.LOGIN, element: <LoginPage /> },
        ],
      },
      {
        element: <CandidateRoute />,
        children: [
          { path: ROUTES.CAREER_SNAPSHOT, element: <CareerSnapshotPage /> },
          { path: ROUTES.DASHBOARD, element: <p>Normal candidate destination</p> },
          { path: ROUTES.PROFILE, element: <ProfileDestination /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/shared-private', element: <p>Shared private destination</p> }],
      },
      { path: ROUTES.ADMIN, element: <p>Admin destination</p> },
      { path: ROUTES.UNAUTHORIZED, element: <p>Unauthorized destination</p> },
      { path: '/public', element: <p>Public content</p> },
    ],
    { initialEntries: [path] },
  );
  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />, {
      auth: { ...authState(session), ...(status ? { status } : {}) },
    }),
  };
};

const createAccount = async () => {
  for (const [label, value] of [
    [/full name/i, 'Avery Patel'],
    [/email address/i, 'candidate@example.com'],
    [/^password/i, 'Secure123!'],
    [/mobile number/i, '9876543210'],
  ] as const)
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await Promise.resolve();
  });
};
const fillSnapshot = async (stage = 'Student') => {
  await screen.findByRole('heading', { name: 'Tell us about your career' });
  fireEvent.click(screen.getByRole('radio', { name: stage }));
  fireEvent.change(screen.getByRole('combobox', { name: /Primary role/ }), {
    target: { value: '.NET Developer' },
  });
  const skills = screen.getByRole('combobox', { name: /Skills/ });
  for (const value of ['C#', 'ASP.NET Core']) {
    fireEvent.change(skills, { target: { value } });
    fireEvent.keyDown(skills, { key: 'Enter', code: 'Enter' });
  }
  fireEvent.change(screen.getByRole('combobox', { name: 'Current city' }), {
    target: { value: 'Pune' },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Remote' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Hybrid' }));
};
const saves = () => request.mock.calls.filter(([config]) => config.method === 'PUT');

beforeEach(() => {
  authentication = makeAuthentication();
  profile = makeProfile();
  rejected = false;
  confirmsCompletion = true;
  holdSave = false;
  resolveSave = undefined;
  post.mockReset();
  request.mockReset();
  authTokenStore.clear();
  post.mockImplementation((url: string) =>
    Promise.resolve({
      data:
        url === '/auth/register'
          ? { message: 'Created', authentication }
          : url === '/auth/google/code'
            ? { data: authentication }
            : authentication,
    }),
  );
  request.mockImplementation(
    async (config: { method?: string; url: string; data?: UpdateCareerSnapshotRequest }) => {
      if (config.method === 'PUT') {
        if (holdSave)
          await new Promise<void>((resolve) => {
            resolveSave = resolve;
          });
        if (rejected)
          throw new ApiRequestError({ status: 503, message: 'Please retry your career profile.' });
        const dto = config.data!;
        profile = {
          ...profile,
          careerSnapshotRequired: !confirmsCompletion,
          primaryRole: dto.primaryRole,
          careerStage: dto.careerStage,
          skills: dto.skills,
          yearsOfExperience: dto.yearsOfExperience,
          location: dto.city,
          workPreferences: dto.workPreferences,
          careerPreferences: {
            preferredJobRoles: [dto.primaryRole],
            preferredCities: [],
            expectedAnnualSalary: null,
            jobTypes: [],
            employmentTypes: [],
            preferredShifts: [],
            salaryUnit: 'INR per annum',
          },
        };
        authentication = {
          ...authentication,
          user: { ...authentication.user, careerSnapshotRequired: profile.careerSnapshotRequired },
        };
      }
      return { data: { data: profile } };
    },
  );
});
afterEach(() => authTokenStore.clear());

describe('Career snapshot account transitions', () => {
  it.each([true, false])(
    'uses returned email registration authentication, required=%s, without a second login',
    async (required) => {
      authentication = makeAuthentication(required);
      const view = renderFlow(ROUTES.REGISTER, null);
      await createAccount();
      await screen.findByText(
        required ? 'Tell us about your career' : 'Normal candidate destination',
      );
      expect(post.mock.calls.map(([url]) => url)).toEqual(['/auth/register']);
      expect(view.store.getState().auth.user?.careerSnapshotRequired).toBe(required);
      expect(authTokenStore.getAccessToken()).toBe('access');
    },
  );
  it.each([true, false])(
    'routes Google registration by the server flag required=%s',
    async (required) => {
      authentication = makeAuthentication(required);
      renderFlow(ROUTES.REGISTER, null);
      fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
      await screen.findByText(
        required ? 'Tell us about your career' : 'Normal candidate destination',
      );
      expect(post).toHaveBeenCalledWith(
        '/auth/google/code',
        { code: 'test-code', intent: 'Register', acceptTerms: true },
        expect.anything(),
      );
    },
  );
  it.each([true, false])(
    'routes password login by the server flag required=%s',
    async (required) => {
      authentication = makeAuthentication(required);
      renderFlow(ROUTES.LOGIN, null);
      fireEvent.change(screen.getByLabelText(/email.*mobile/i), {
        target: { value: 'candidate@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Secure123!' } });
      fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));
      await screen.findByText(
        required ? 'Tell us about your career' : 'Normal candidate destination',
      );
    },
  );
  it.each([ROUTES.DASHBOARD, '/shared-private'])(
    'guards a direct candidate visit to %s',
    async (path) => {
      renderFlow(path);
      await screen.findByRole('heading', { name: 'Tell us about your career' });
    },
  );
  it('restores eligibility from refresh authentication across sessions', async () => {
    authTokenStore.set(authentication);
    const view = renderFlow(ROUTES.DASHBOARD, null, 'idle');
    await act(async () => {
      await view.store.dispatch(initializeAuth());
    });
    await screen.findByRole('heading', { name: 'Tell us about your career' });
    expect(post).toHaveBeenCalledWith(
      '/auth/refresh',
      { refreshToken: 'refresh' },
    );
  });
  it('does not infer onboarding for an incomplete existing candidate', async () => {
    renderFlow(ROUTES.DASHBOARD, makeAuthentication(false));
    await screen.findByText('Normal candidate destination');
    expect(request).not.toHaveBeenCalled();
  });
  it.each([UserRole.Administrator, UserRole.Employer])(
    'does not gate %s on the candidate requirement',
    async (role) => {
      renderFlow('/shared-private', makeAuthentication(true, role));
      await screen.findByText('Shared private destination');
    },
  );
  it('does not gate public routes', async () => {
    renderFlow('/public');
    await screen.findByText('Public content');
  });
  it('completed candidates can visit the snapshot URL without a redirect loop', async () => {
    renderFlow(ROUTES.CAREER_SNAPSHOT, makeAuthentication(false));
    await screen.findByText('Normal candidate destination');
  });
});

describe('Career snapshot canonical submission', () => {
  it('does not repopulate private profile cache after an account change during save', async () => {
    holdSave = true;
    const view = renderFlow();
    await fillSnapshot();
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    await waitFor(() => expect(saves()).toHaveLength(1));
    const pending = view.store.dispatch(dashboardApi.util.getRunningMutationsThunk());
    expect(pending).toHaveLength(1);
    view.unmount();
    const other = makeAuthentication(false);
    other.user.id = 'other-candidate';
    act(() => { view.store.dispatch(sessionRefreshed(other)); });
    await act(async () => {
      resolveSave?.();
      await Promise.all(pending);
      // Also finish the submit continuation after the mutation promise settles.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
    expect(view.store.getState().auth.user?.id).toBe('other-candidate');
    expect(dashboardApi.endpoints.getProfile.select()(view.store.getState()).data).toBeUndefined();
    expect(view.router.state.location.pathname).toBe(ROUTES.CAREER_SNAPSHOT);
  });

  it('preserves the guarded destination including search and hash after completion', async () => {
    const view = renderFlow('/shared-private?job=1#apply');
    await fillSnapshot();
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    await screen.findByText('Shared private destination');
    expect(view.router.state.location).toMatchObject({ pathname: '/shared-private', search: '?job=1', hash: '#apply' });
  });
  it.each(['Student', 'Fresher', 'Experienced Professional'])(
    'saves the exact canonical %s payload and confirms completion',
    async (stage) => {
      const view = renderFlow();
      await fillSnapshot(stage);
      const experience = screen.queryByRole('spinbutton', { name: /Total experience/ });
      if (stage === 'Experienced Professional') {
        expect(experience).toBeVisible();
        fireEvent.change(experience!, { target: { value: '4.2' } });
      } else expect(experience).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
      await screen.findByText('Normal candidate destination');
      expect(saves()).toHaveLength(1);
      expect(saves()[0]![0]).toMatchObject({
        method: 'PUT',
        url: '/candidate/profile/career-snapshot',
        data: {
          careerStage:
            stage === 'Student'
              ? CareerStage.Student
              : stage === 'Fresher'
                ? CareerStage.Fresher
                : CareerStage.Experienced,
          primaryRole: '.NET Developer',
          skills: ['C#', 'ASP.NET Core'],
          yearsOfExperience: stage === 'Experienced Professional' ? 4.2 : null,
          city: 'Pune',
          workPreferences: [WorkPreference.Remote, WorkPreference.Hybrid],
        },
      });
      expect(saves()[0]![0].data).not.toHaveProperty('userId');
      expect(view.store.getState().auth.user?.careerSnapshotRequired).toBe(false);
      await act(async () => {
        await view.router.navigate(ROUTES.PROFILE);
      });
      expect(await screen.findByText('Primary role: .NET Developer')).toBeVisible();
      expect(screen.getByText('Current city: Pune')).toBeVisible();
      expect(screen.getByText('Preferred work mode: Remote, Hybrid')).toBeVisible();
      const restored = await authService.refresh();
      expect(restored.user.careerSnapshotRequired).toBe(false);
    },
  );
  it('requires stage, a specific role and at least one skill', async () => {
    renderFlow();
    await screen.findByRole('heading', { name: 'Tell us about your career' });
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    expect(await screen.findByText('Choose your career stage.')).toBeVisible();
    expect(screen.getByText('Enter your primary role.')).toBeVisible();
    expect(screen.getByText('Add at least one skill.')).toBeVisible();
    expect(saves()).toHaveLength(0);
  });
  it('drops stale experience after switching to Fresher', async () => {
    renderFlow();
    await fillSnapshot('Experienced Professional');
    fireEvent.change(screen.getByRole('spinbutton', { name: /Total experience/ }), {
      target: { value: '4.2' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Fresher' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    await screen.findByText('Normal candidate destination');
    expect(saves()[0]![0].data!.yearsOfExperience).toBeNull();
  });
  it('keeps values and eligibility on failure, and supports retry', async () => {
    rejected = true;
    const view = renderFlow();
    await fillSnapshot();
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    await screen.findByRole('alert');
    expect(view.router.state.location.pathname).toBe(ROUTES.CAREER_SNAPSHOT);
    expect(screen.getByRole('combobox', { name: /Primary role/ })).toHaveValue('.NET Developer');
    expect(screen.getByText('C#')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Current city' })).toHaveValue('Pune');
    expect(view.store.getState().auth.user?.careerSnapshotRequired).toBe(true);
    rejected = false;
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    await screen.findByText('Normal candidate destination');
  });
  it('prevents duplicate requests and does not optimistically clear eligibility', async () => {
    holdSave = true;
    const view = renderFlow();
    await fillSnapshot();
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    fireEvent.click(screen.getByRole('button', { name: /Complete profile|Saving/ }));
    await waitFor(() => expect(saves()).toHaveLength(1));
    expect(view.store.getState().auth.user?.careerSnapshotRequired).toBe(true);
    await act(async () => {
      resolveSave?.();
      await Promise.resolve();
    });
    await screen.findByText('Normal candidate destination');
  });
  it('stays on the snapshot if the response does not confirm completion', async () => {
    confirmsCompletion = false;
    const view = renderFlow();
    await fillSnapshot();
    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));
    await screen.findByRole('alert');
    expect(view.store.getState().auth.user?.careerSnapshotRequired).toBe(true);
    expect(view.router.state.location.pathname).toBe(ROUTES.CAREER_SNAPSHOT);
  });
  it('respects completion confirmed by a fresh profile read', async () => {
    profile.careerSnapshotRequired = false;
    const view = renderFlow();
    await screen.findByText('Normal candidate destination');
    expect(view.store.getState().auth.user?.careerSnapshotRequired).toBe(false);
    expect(saves()).toHaveLength(0);
  });
  it('session refreshed events retain server-owned eligibility', async () => {
    const view = renderFlow(ROUTES.DASHBOARD, makeAuthentication(false));
    act(() => {
      view.store.dispatch(sessionRefreshed(makeAuthentication(true)));
    });
    await screen.findByRole('heading', { name: 'Tell us about your career' });
  });
});
