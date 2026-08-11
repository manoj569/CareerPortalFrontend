import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import {
  useAddCandidateSkillMutation,
  useDeleteCandidateSkillMutation,
  useGetCandidateSkillsQuery,
  useGetOnboardingQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
  useGetResumeStatusQuery,
  useUpdateCandidateAboutMutation,
  useUpdateCandidateSkillMutation,
  useUpdateProfileMutation,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import {
  CareerStage,
  DesiredOpportunity,
  ResumeExtractionStatus,
  WorkPreference,
  type CandidateSkill,
  type UserProfile,
} from '@/features/dashboard/types/dashboardModels';
import { EmploymentType } from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ProfilePage } from './ProfilePage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return {
    ...actual,
    useAddCandidateSkillMutation: vi.fn(),
    useDeleteCandidateSkillMutation: vi.fn(),
    useGetCandidateSkillsQuery: vi.fn(),
    useGetOnboardingQuery: vi.fn(),
    useGetProfileCompletionQuery: vi.fn(),
    useGetProfileQuery: vi.fn(),
    useGetResumeStatusQuery: vi.fn(),
    useUpdateCandidateAboutMutation: vi.fn(),
    useUpdateCandidateSkillMutation: vi.fn(),
    useUpdateProfileMutation: vi.fn(),
    useUploadResumeMutation: vi.fn(),
  };
});

const profile: UserProfile = {
  bio: 'I build accessible products.',
  education: [],
  email: 'avery@example.com',
  experience: [],
  firstName: 'Avery',
  headline: 'Senior frontend engineer',
  id: 'candidate-id',
  lastName: 'Patel',
  linkedInUrl: null,
  location: 'Pune',
  portfolioUrl: null,
  preferredJobTypes: [EmploymentType.FullTime],
  resume: null,
  skills: [],
};

const skill: CandidateSkill = {
  createdAtUtc: '2026-08-12T00:00:00Z',
  id: 'skill-id',
  name: 'React',
  proficiency: 'Advanced',
  updatedAtUtc: null,
  yearsOfExperience: 4.5,
};

const completion = {
  completedSections: ['basicDetails', 'resumeHeadline', 'profileSummary'],
  completionPercentage: 40,
  missingSections: ['skills', 'resume', 'careerPreferences'],
  sections: [
    { isCompleted: true, section: 'basicDetails', weight: 15 },
    { isCompleted: true, section: 'resumeHeadline', weight: 10 },
    { isCompleted: true, section: 'profileSummary', weight: 15 },
    { isCompleted: false, section: 'skills', weight: 20 },
    { isCompleted: false, section: 'resume', weight: 20 },
    { isCompleted: false, section: 'careerPreferences', weight: 20 },
  ],
};

const queryResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  }) as never;

const mutationResult = (options: { isLoading?: boolean; rejection?: unknown } = {}) => {
  const unwrap = options.rejection
    ? vi.fn().mockRejectedValue(options.rejection)
    : vi.fn().mockResolvedValue(undefined);
  const trigger = vi.fn(() => ({ unwrap }));
  return {
    trigger,
    tuple: [trigger, { isLoading: options.isLoading ?? false }] as never,
  };
};

const mocks = {
  add: vi.mocked(useAddCandidateSkillMutation),
  delete: vi.mocked(useDeleteCandidateSkillMutation),
  getCompletion: vi.mocked(useGetProfileCompletionQuery),
  getOnboarding: vi.mocked(useGetOnboardingQuery),
  getProfile: vi.mocked(useGetProfileQuery),
  getResumeStatus: vi.mocked(useGetResumeStatusQuery),
  getSkills: vi.mocked(useGetCandidateSkillsQuery),
  updateAbout: vi.mocked(useUpdateCandidateAboutMutation),
  updateProfile: vi.mocked(useUpdateProfileMutation),
  updateSkill: vi.mocked(useUpdateCandidateSkillMutation),
  uploadResume: vi.mocked(useUploadResumeMutation),
};

const renderPage = () => renderWithProviders(<MemoryRouter><ProfilePage /></MemoryRouter>);

beforeEach(() => {
  mocks.getProfile.mockReturnValue(queryResult({ data: profile }));
  mocks.getCompletion.mockReturnValue(queryResult({ data: completion }));
  mocks.getSkills.mockReturnValue(queryResult({ data: [] }));
  mocks.getResumeStatus.mockReturnValue(
    queryResult({
      data: {
        extractedAtUtc: null,
        extractionStatus: ResumeExtractionStatus.NotStarted,
        hasResume: false,
        message: '',
      },
    }),
  );
  mocks.getOnboarding.mockReturnValue(
    queryResult({
      data: {
        careerStage: CareerStage.Experienced,
        city: 'Pune',
        college: null,
        completedAtUtc: '2026-08-12T00:00:00Z',
        degree: null,
        desiredOpportunities: [DesiredOpportunity.ExperiencedJob],
        graduationYear: null,
        skills: [],
        workPreferences: [WorkPreference.Hybrid],
        yearsOfExperience: 4,
      },
    }),
  );
  mocks.updateAbout.mockReturnValue(mutationResult().tuple);
  mocks.add.mockReturnValue(mutationResult().tuple);
  mocks.updateSkill.mockReturnValue(mutationResult().tuple);
  mocks.delete.mockReturnValue(mutationResult().tuple);
  mocks.uploadResume.mockReturnValue(mutationResult().tuple);
  mocks.updateProfile.mockReturnValue(mutationResult().tuple);
});

describe('Candidate Profile Phase 1', () => {
  it('renders real profile data, backend completion, missing sections, and career navigation', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Avery Patel' })).toBeVisible();
    expect(screen.getByText('avery@example.com')).toBeVisible();
    expect(screen.getByText('40% complete')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Profile completion: 40%' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
    expect(screen.getByText('3 of 6 sections complete')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Key skills' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Manage career preferences' })).toHaveAttribute(
      'href',
      '/onboarding',
    );
  });

  it('prepopulates and submits the exact trimmed about request', async () => {
    const mutation = mutationResult();
    mocks.updateAbout.mockReturnValue(mutation.tuple);
    renderPage();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit headline and summary' })[0]!);
    const headline = screen.getByRole('textbox', { name: 'Resume headline' });
    const summary = screen.getByRole('textbox', { name: 'Profile summary' });
    expect(headline).toHaveValue(profile.headline);
    expect(summary).toHaveValue(profile.bio);
    expect(headline).toHaveAttribute('maxlength', '180');
    expect(summary).toHaveAttribute('maxlength', '2000');

    await userEvent.clear(headline);
    await userEvent.type(headline, '  Principal engineer  ');
    await userEvent.clear(summary);
    await userEvent.type(summary, '  Builds inclusive platforms.  ');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mutation.trigger).toHaveBeenCalledWith({
        profileSummary: 'Builds inclusive platforms.',
        resumeHeadline: 'Principal engineer',
      }),
    );
  });

  it('shows the structured skills empty state and adds a skill with the exact contract', async () => {
    const mutation = mutationResult();
    mocks.add.mockReturnValue(mutation.tuple);
    renderPage();
    expect(screen.getByText(/add structured skills/i)).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Add your first skill' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Skill name' }), '  TypeScript  ');
    await userEvent.click(screen.getByRole('combobox', { name: 'Proficiency' }));
    await userEvent.click(screen.getByRole('option', { name: 'Advanced' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Years of experience' }), '3.5');
    await userEvent.click(screen.getByRole('button', { name: 'Add skill' }));

    await waitFor(() =>
      expect(mutation.trigger).toHaveBeenCalledWith({
        name: 'TypeScript',
        proficiency: 'Advanced',
        yearsOfExperience: 3.5,
      }),
    );
  });

  it('edits and deletes an existing skill using its backend ID', async () => {
    const update = mutationResult();
    const remove = mutationResult();
    mocks.getSkills.mockReturnValue(queryResult({ data: [skill] }));
    mocks.updateSkill.mockReturnValue(update.tuple);
    mocks.delete.mockReturnValue(remove.tuple);
    renderPage();

    const skillsSection = screen.getByRole('heading', { name: 'Key skills' }).closest('section')!;
    await userEvent.click(within(skillsSection).getByRole('button', { name: 'Edit' }));
    const name = screen.getByRole('textbox', { name: 'Skill name' });
    await userEvent.clear(name);
    await userEvent.type(name, 'React Native');
    await userEvent.click(screen.getByRole('button', { name: 'Save skill' }));
    await waitFor(() =>
      expect(update.trigger).toHaveBeenCalledWith({
        data: { name: 'React Native', proficiency: 'Advanced', yearsOfExperience: 4.5 },
        skillId: 'skill-id',
      }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Edit React' })).not.toBeInTheDocument(),
    );
    const refreshedSkillsSection = screen
      .getByRole('heading', { name: 'Key skills' })
      .closest('section')!;
    await userEvent.click(
      within(refreshedSkillsSection).getByRole('button', { name: 'Delete' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Delete React?' });
    expect(within(dialog).getByText('Delete React from your key skills?')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete skill' }));
    await waitFor(() => expect(remove.trigger).toHaveBeenCalledWith('skill-id'));
  });

  it('preserves and displays a safe duplicate-skill API message', async () => {
    const mutation = mutationResult({
      rejection: { message: 'This skill already exists in your profile.', status: 409 },
    });
    mocks.add.mockReturnValue(mutation.tuple);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Add your first skill' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Skill name' }), 'React');
    await userEvent.click(screen.getByRole('button', { name: 'Add skill' }));
    expect(await screen.findByText('This skill already exists in your profile.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Skill name' })).toHaveValue('React');
  });

  it('disables duplicate about and skill submissions while requests are pending', async () => {
    mocks.updateAbout.mockReturnValue(mutationResult({ isLoading: true }).tuple);
    const view = renderPage();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit headline and summary' })[0]!);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

    view.unmount();
    mocks.updateAbout.mockReturnValue(mutationResult().tuple);
    mocks.add.mockReturnValue(mutationResult({ isLoading: true }).tuple);
    renderPage();

    const addSkill = screen.getByRole('button', { name: 'Add skill' });
    expect(addSkill).toBeDisabled();
  });

  it('reuses secure resume validation and upload behavior', async () => {
    const mutation = mutationResult();
    mocks.uploadResume.mockReturnValue(mutation.tuple);
    renderPage();

    const input = screen.getByLabelText('Choose resume');
    const invalid = new File(['text'], 'resume.txt', { type: 'text/plain' });
    await userEvent.upload(input, invalid, { applyAccept: false });
    expect(screen.getByText('Choose a PDF, DOC, or DOCX file.')).toBeVisible();
    expect(mutation.trigger).not.toHaveBeenCalled();

    const file = new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);
    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith(file));
  });

  it('renders loading and API-error retry states', () => {
    mocks.getCompletion.mockReturnValue(queryResult({ isError: true }));
    mocks.getSkills.mockReturnValue(queryResult({ isError: true }));
    mocks.getResumeStatus.mockReturnValue(queryResult({ isError: true }));
    renderPage();

    expect(screen.getByText(/completion guidance is temporarily unavailable/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry profile completion' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry skills' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry resume status' })).toBeVisible();
  });
});
