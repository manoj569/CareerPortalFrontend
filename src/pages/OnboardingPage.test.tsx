import {
  useGetOnboardingQuery,
  useUpdateOnboardingMutation,
} from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import type { AuthState } from '@/features/auth/store/authSlice';
import {
  CareerStage,
  DesiredOpportunity,
  WorkPreference,
  type CandidateOnboarding,
} from '@/features/dashboard/types/dashboardModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingPage } from './OnboardingPage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return {
    ...actual,
    useGetOnboardingQuery: vi.fn(),
    useUpdateOnboardingMutation: vi.fn(),
  };
});

const mockGetOnboarding = vi.mocked(useGetOnboardingQuery);
const mockUpdateOnboarding = vi.mocked(useUpdateOnboardingMutation);
const refetch = vi.fn();
const update = vi.fn();

const auth: AuthState = {
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

const emptyOnboarding: CandidateOnboarding = {
  careerStage: null,
  city: null,
  college: null,
  completedAtUtc: null,
  degree: null,
  desiredOpportunities: [],
  graduationYear: null,
  skills: [],
  workPreferences: [],
  yearsOfExperience: null,
};

const queryResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: emptyOnboarding,
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as ReturnType<typeof useGetOnboardingQuery>;

const renderOnboarding = () =>
  renderWithProviders(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>,
    { auth },
  );

const chooseStageAndOpportunity = async (stage: string, opportunity = 'Internship') => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('radio', { name: new RegExp(stage, 'i') }));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('checkbox', { name: opportunity }));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  return user;
};

const fillCorePreferences = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: /^City/ }), 'Pune');
  await user.type(screen.getByRole('textbox', { name: /^Skills/ }), 'React, TypeScript');
  await user.click(screen.getByRole('checkbox', { name: 'Hybrid' }));
};

beforeEach(() => {
  refetch.mockReset();
  update.mockReset();
  mockGetOnboarding.mockReturnValue(queryResult());
  update.mockImplementation((request) => ({
    unwrap: vi.fn().mockResolvedValue({
      ...emptyOnboarding,
      ...request,
      completedAtUtc: '2026-07-30T00:00:00Z',
    }),
  }));
  mockUpdateOnboarding.mockReturnValue([update, { isLoading: false }] as unknown as ReturnType<
    typeof useUpdateOnboardingMutation
  >);
});

describe('Candidate onboarding', () => {
  it('saves a Student internship flow and offers optional resume setup', async () => {
    renderOnboarding();
    const user = await chooseStageAndOpportunity('Student');
    await fillCorePreferences(user);
    await user.type(screen.getByLabelText('College'), 'City College');
    await user.type(screen.getByLabelText('Degree or course'), 'B.Tech');
    await user.type(screen.getByLabelText('Graduation year'), '2027');
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(update).toHaveBeenCalledWith({
      careerStage: CareerStage.Student,
      city: 'Pune',
      college: 'City College',
      degree: 'B.Tech',
      desiredOpportunities: [DesiredOpportunity.Internship],
      graduationYear: 2027,
      skills: ['React', 'TypeScript'],
      workPreferences: [WorkPreference.Hybrid],
      yearsOfExperience: null,
    });
    expect(await screen.findByRole('link', { name: /add an optional resume/i })).toHaveAttribute(
      'href',
      '/dashboard/resume',
    );
  });

  it('shows early-career fields for a Fresher flow', async () => {
    renderOnboarding();
    const user = await chooseStageAndOpportunity('Fresher', 'Fresher job');
    await fillCorePreferences(user);

    expect(screen.getByRole('textbox', { name: 'College' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Degree or course' })).toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', { name: /^Years of experience/ }),
    ).not.toBeInTheDocument();
  });

  it('requires experience and hides education fields for an Experienced flow', async () => {
    renderOnboarding();
    const user = await chooseStageAndOpportunity('Experienced professional', 'Experienced job');
    await fillCorePreferences(user);

    expect(screen.queryByRole('textbox', { name: 'College' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(
      await screen.findByText(/years of experience is required for experienced professionals/i),
    ).toBeInTheDocument();

    await user.type(screen.getByRole('spinbutton', { name: /^Years of experience/ }), '4.5');
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        careerStage: CareerStage.Experienced,
        college: null,
        degree: null,
        graduationYear: null,
        yearsOfExperience: 4.5,
      }),
    );
  });

  it('announces backend field validation without inventing a successful save', async () => {
    update.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        errors: { City: ['Choose a supported city.'] },
        message: 'Validation failed.',
        status: 400,
      }),
    });
    renderOnboarding();
    const user = await chooseStageAndOpportunity('Student');
    await fillCorePreferences(user);
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(await screen.findByText('Choose a supported city.')).toBeInTheDocument();
    expect(screen.queryByText(/profile preferences are ready/i)).not.toBeInTheDocument();
  });

  it('shows loading, error, retry, and safe skip states', async () => {
    mockGetOnboarding.mockReturnValue(queryResult({ data: undefined, isLoading: true }));
    const loadingView = renderOnboarding();
    expect(
      screen.getByRole('status', { name: /loading candidate onboarding/i }),
    ).toBeInTheDocument();
    loadingView.unmount();

    mockGetOnboarding.mockReturnValue(
      queryResult({ data: undefined, isError: true, isLoading: false }),
    );
    renderOnboarding();
    expect(
      screen.getByRole('heading', { name: /onboarding is temporarily unavailable/i }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
