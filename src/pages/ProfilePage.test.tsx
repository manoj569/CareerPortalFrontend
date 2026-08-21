import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import type * as PortfolioApiModule from '@/features/portfolio/api/portfolioApi';
import {
  downloadCandidateResume,
  useAddCandidateSkillMutation,
  useDeleteCandidateSkillMutation,
  useGetCandidateSkillsQuery,
  useGetCandidateBasicDetailsQuery,
  useGetCandidateCareerPreferencesQuery,
  useGetOnboardingQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
  useGetResumeStatusQuery,
  useUpdateCandidateAboutMutation,
  useUpdateCandidateCareerPreferencesMutation,
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
import {
  useAddPortfolioEducationMutation,
  useAddPortfolioExperienceMutation,
  useDeletePortfolioEducationMutation,
  useDeletePortfolioExperienceMutation,
  useGetPortfolioEducationQuery,
  useGetPortfolioExperiencesQuery,
  useUpdatePortfolioEducationMutation,
  useUpdatePortfolioExperienceMutation,
} from '@/features/portfolio/api/portfolioApi';
import type { PortfolioEducation, PortfolioExperience } from '@/features/portfolio/types/portfolioModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CandidateProfileContent, ProfilePage } from './ProfilePage';

interface MockApiRequest {
  data?: unknown;
  method?: string;
  url?: string;
}

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn<(request: MockApiRequest) => Promise<{ data: unknown }>>(),
}));

vi.mock('@/features/portfolio/api/portfolioApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PortfolioApiModule>();
  return {
    ...actual,
    useGetPortfolioEducationQuery: vi.fn(() => ({ data: [], isError: false, isLoading: false })),
    useGetPortfolioExperiencesQuery: vi.fn(() => ({ data: [], isError: false, isLoading: false })),
    useAddPortfolioEducationMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useUpdatePortfolioEducationMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useDeletePortfolioEducationMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useAddPortfolioExperienceMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useUpdatePortfolioExperienceMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useDeletePortfolioExperienceMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

vi.mock('@/api/apiClient', () => ({
  apiClient: {
    request: apiRequestMock,
  },
}));

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return {
    ...actual,
    downloadCandidateResume: vi.fn(),
    useAddCandidateSkillMutation: vi.fn(),
    useDeleteCandidateSkillMutation: vi.fn(),
    useGetCandidateSkillsQuery: vi.fn(),
    useGetCandidateBasicDetailsQuery: vi.fn(),
    useGetCandidateCareerPreferencesQuery: vi.fn(),
    useGetOnboardingQuery: vi.fn(),
    useGetProfileCompletionQuery: vi.fn(),
    useGetProfileQuery: vi.fn(),
    useGetResumeStatusQuery: vi.fn(),
    useUpdateCandidateAboutMutation: vi.fn(),
    useUpdateCandidateCareerPreferencesMutation: vi.fn(),
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

const education: PortfolioEducation = {
  courseType: 'FullTime',
  description: 'Core computer science curriculum',
  displayOrder: 2,
  endYear: 2021,
  fieldOfStudy: 'Computer Science',
  grade: '8.7 CGPA',
  gradingSystem: 'CGPA',
  id: 'education-id',
  institution: 'Pune University',
  isCurrentlyStudying: false,
  qualification: 'Bachelor of Technology',
  startYear: 2017,
};

const careerPreferences = {
  employmentTypes: ['FullTime'] as const,
  expectedAnnualSalary: 1800000,
  jobTypes: ['Permanent'] as const,
  preferredCities: ['Pune', 'Bengaluru'],
  preferredJobRoles: ['Frontend Engineer', 'UI Engineer'],
  preferredShifts: ['Day'] as const,
  salaryUnit: 'INR per annum',
};

const employment: PortfolioExperience = {
  annualSalary: 1200000,
  companyName: 'Harbor Labs',
  description: 'Built accessible candidate experiences.',
  displayOrder: 1,
  employmentType: EmploymentType.Internship,
  endDate: '2022-06-30',
  id: 'employment-id',
  isCurrent: false,
  jobTitle: 'Frontend Engineer',
  location: 'Pune',
  noticePeriod: '30 days',
  skillsUsed: ['React', 'TypeScript'],
  startDate: '2021-07-01',
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

const mutationResult = (options: { isLoading?: boolean; rejection?: unknown; result?: unknown } = {}) => {
  const unwrap = options.rejection
    ? vi.fn().mockRejectedValue(options.rejection)
    : vi.fn().mockResolvedValue(options.result);
  const trigger = vi.fn((request?: unknown) => {
    void request;
    return { unwrap };
  });
  return {
    trigger,
    tuple: [trigger, { isLoading: options.isLoading ?? false }] as never,
  };
};

const mocks = {
  add: vi.mocked(useAddCandidateSkillMutation),
  delete: vi.mocked(useDeleteCandidateSkillMutation),
  getCompletion: vi.mocked(useGetProfileCompletionQuery),
  getBasicDetails: vi.mocked(useGetCandidateBasicDetailsQuery),
  getCareerPreferences: vi.mocked(useGetCandidateCareerPreferencesQuery),
  getOnboarding: vi.mocked(useGetOnboardingQuery),
  getProfile: vi.mocked(useGetProfileQuery),
  getResumeStatus: vi.mocked(useGetResumeStatusQuery),
  getSkills: vi.mocked(useGetCandidateSkillsQuery),
  updateAbout: vi.mocked(useUpdateCandidateAboutMutation),
  updateCareerPreferences: vi.mocked(useUpdateCandidateCareerPreferencesMutation),
  updateProfile: vi.mocked(useUpdateProfileMutation),
  updateSkill: vi.mocked(useUpdateCandidateSkillMutation),
  uploadResume: vi.mocked(useUploadResumeMutation),
  downloadResume: vi.mocked(downloadCandidateResume),
};

const educationMocks = {
  add: vi.mocked(useAddPortfolioEducationMutation),
  delete: vi.mocked(useDeletePortfolioEducationMutation),
  get: vi.mocked(useGetPortfolioEducationQuery),
  update: vi.mocked(useUpdatePortfolioEducationMutation),
};

const employmentMocks = {
  add: vi.mocked(useAddPortfolioExperienceMutation),
  delete: vi.mocked(useDeletePortfolioExperienceMutation),
  get: vi.mocked(useGetPortfolioExperiencesQuery),
  update: vi.mocked(useUpdatePortfolioExperienceMutation),
};

const renderPage = () => renderWithProviders(<MemoryRouter><ProfilePage /></MemoryRouter>);
const renderEducation = () => renderWithProviders(
  <MemoryRouter initialEntries={['/dashboard/portfolio?tab=profile&section=education']}>
    <CandidateProfileContent hidePageHeader />
  </MemoryRouter>,
);
const renderEmployment = () => renderWithProviders(
  <MemoryRouter initialEntries={['/dashboard/portfolio?tab=profile&section=employment']}>
    <CandidateProfileContent hidePageHeader />
  </MemoryRouter>,
);

beforeEach(() => {
  apiRequestMock.mockReset().mockRejectedValue(new Error('No profile photo configured for this test.'));
  mocks.getBasicDetails.mockReturnValue(queryResult({ data: { email: 'avery@example.com', mobile: null, workStatus: 'Experienced', isOutsideIndia: false, currentCountry: 'India', currentCity: 'Pune', currentArea: null, availabilityToJoin: null, currentAnnualSalary: null, currentFixedAnnualSalary: null, currentVariableAnnualSalary: null, salaryUnit: 'INR per annum' } }));
  mocks.getCareerPreferences.mockReturnValue(queryResult({ data: { preferredJobRoles: [], preferredCities: [], expectedAnnualSalary: null, jobTypes: [], employmentTypes: [], preferredShifts: [], salaryUnit: 'INR per annum' } }));
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
  mocks.updateCareerPreferences.mockReturnValue(mutationResult().tuple);
  mocks.add.mockReturnValue(mutationResult().tuple);
  mocks.updateSkill.mockReturnValue(mutationResult().tuple);
  mocks.delete.mockReturnValue(mutationResult().tuple);
  mocks.uploadResume.mockReturnValue(mutationResult().tuple);
  mocks.updateProfile.mockReturnValue(mutationResult().tuple);
  mocks.downloadResume.mockReset();
  mocks.downloadResume.mockResolvedValue(new Blob(['resume'], { type: 'application/pdf' }));
  educationMocks.get.mockReturnValue(queryResult({ data: [] }));
  educationMocks.add.mockReturnValue(mutationResult().tuple);
  educationMocks.update.mockReturnValue(mutationResult().tuple);
  educationMocks.delete.mockReturnValue(mutationResult().tuple);
  employmentMocks.get.mockReturnValue(queryResult({ data: [] }));
  employmentMocks.add.mockReturnValue(mutationResult().tuple);
  employmentMocks.update.mockReturnValue(mutationResult().tuple);
  employmentMocks.delete.mockReturnValue(mutationResult().tuple);
});

describe('Candidate profile workspace', () => {
  it('renders real profile data, backend completion, missing sections, and career navigation', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Avery Patel' })).toBeVisible();
    expect(screen.getAllByText('avery@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('40% profile completion')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Profile completion: 40%' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
    expect(screen.getByText('3 of 6 sections complete')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Key skills' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Career preferences' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Employment' })).toBeVisible();
    expect(screen.queryByRole('tablist', { name: 'Profile sections' })).not.toBeInTheDocument();
  });

  it('prepopulates and submits the exact trimmed about request', async () => {
    const mutation = mutationResult();
    mocks.updateAbout.mockReturnValue(mutation.tuple);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Edit about' }));
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
    expect(screen.getByText(/add skills to help employers/i)).toBeVisible();

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
    await userEvent.click(within(skillsSection).getByRole('button', { name: 'Edit React' }));
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
      within(refreshedSkillsSection).getByRole('button', { name: 'Delete React' }),
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

    await userEvent.click(screen.getByRole('button', { name: 'Edit about' }));
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

  it('uses real-name initials and never renders a fabricated photo or verification badge', () => {
    renderPage();

    expect(screen.getByLabelText('Avery Patel initials')).toHaveTextContent('AP');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(/verified email/i)).toBeVisible();
    expect(screen.queryByText(/phone|profile views|open to work/i)).not.toBeInTheDocument();
  });

  it('uses the completed profile copy without Phase 1 wording', () => {
    mocks.getCompletion.mockReturnValue(
      queryResult({
        data: {
          ...completion,
          completedSections: completion.sections.map((section) => section.section),
          completionPercentage: 100,
          missingSections: [],
          sections: completion.sections.map((section) => ({ ...section, isCompleted: true })),
        },
      }),
    );
    renderPage();

    expect(screen.getByText('Your candidate profile is complete.')).toBeVisible();
    expect(screen.queryByText(/phase 1/i)).not.toBeInTheDocument();
  });

  it('shows at most three backend missing-section actions', () => {
    mocks.getCompletion.mockReturnValue(
      queryResult({
        data: {
          ...completion,
          missingSections: ['resumeHeadline', 'profileSummary', 'skills', 'resume', 'basicDetails'],
        },
      }),
    );
    renderPage();

    const strength = screen.getByRole('heading', { name: 'Profile strength' }).closest('section')!;
    expect(within(strength).getAllByRole('button')).toHaveLength(3);
    expect(within(strength).queryByRole('button', { name: 'Upload resume' })).not.toBeInTheDocument();
  });

  it('renders processing and failed resume states without exposing internal errors', () => {
    const resumeProfile = {
      ...profile,
      resume: {
        contentType: 'application/pdf',
        fileName: 'resume.pdf',
        sizeBytes: 1000,
        uploadedAtUtc: '2026-08-12T00:00:00Z',
      },
    };
    mocks.getProfile.mockReturnValue(queryResult({ data: resumeProfile }));
    mocks.getResumeStatus.mockReturnValue(
      queryResult({
        data: {
          extractedAtUtc: null,
          extractionStatus: ResumeExtractionStatus.Processing,
          hasResume: true,
          message: 'private parser detail',
        },
      }),
    );
    const processing = renderPage();
    expect(screen.getByText('Processing')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Processing resume' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Update resume' })).toBeDisabled();
    expect(screen.queryByText('private parser detail')).not.toBeInTheDocument();

    processing.unmount();
    mocks.getResumeStatus.mockReturnValue(
      queryResult({
        data: {
          extractedAtUtc: null,
          extractionStatus: ResumeExtractionStatus.Failed,
          hasResume: true,
          message: 'private parser detail',
        },
      }),
    );
    renderPage();
    expect(screen.getByText('Failed')).toBeVisible();
    expect(screen.getByText(/resume is stored, but recommendations could not be prepared/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Update resume' })).toBeEnabled();
  });

  it('downloads the ready resume securely with a sanitized backend filename', async () => {
    mocks.getProfile.mockReturnValue(
      queryResult({
        data: {
          ...profile,
          resume: {
            contentType: 'application/pdf',
            fileName: '../../team<lead>.pdf',
            sizeBytes: 1000,
            uploadedAtUtc: '2026-08-12T00:00:00Z',
          },
        },
      }),
    );
    mocks.getResumeStatus.mockReturnValue(
      queryResult({
        data: {
          extractedAtUtc: '2026-08-12T00:01:00Z',
          extractionStatus: ResumeExtractionStatus.Ready,
          hasResume: true,
          message: '',
        },
      }),
    );
    const createObjectUrl = vi.fn().mockReturnValue('blob:resume');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
    let downloadName = '';
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });

    renderPage();
    expect(screen.getByText('team-lead-.pdf')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => expect(mocks.downloadResume).toHaveBeenCalledOnce());
    expect(downloadName).toBe('team-lead-.pdf');
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:resume');
    click.mockRestore();
  });

  it('loads a private photo, opens the keyboard-accessible dialog, and restores trigger focus', async () => {
    const createUrl = vi.fn().mockReturnValue('blob:profile-photo');
    const revokeUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeUrl });
    apiRequestMock.mockResolvedValueOnce({ data: new Blob(['photo'], { type: 'image/png' }) });

    const view = renderPage();
    const trigger = screen.getByRole('button', { name: 'Change profile photo' });
    await waitFor(() => expect(createUrl).toHaveBeenCalledOnce());
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Profile photo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Replace photo' })).toBeVisible();
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Profile photo' }), { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveFocus());
    view.unmount();
    expect(revokeUrl).toHaveBeenCalledWith('blob:profile-photo');
  });

  it('uploads and replaces a valid photo using the multipart file field', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValueOnce('blob:preview').mockReturnValueOnce('blob:saved') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    apiRequestMock
      .mockRejectedValueOnce(new Error('missing'))
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: new Blob(['saved'], { type: 'image/webp' }) });
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Change profile photo' }));
    expect(screen.getByRole('button', { name: 'Upload photo' })).toBeVisible();
    const file = new File(['image'], 'profile.webp', { type: 'image/webp' });
    await userEvent.upload(screen.getByLabelText('Choose profile photo'), file);
    await userEvent.click(screen.getByRole('button', { name: 'Save photo' }));
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: '/candidate/profile/photo' })));
    const upload = apiRequestMock.mock.calls.find(([request]) => request.method === 'PUT')?.[0].data;
    expect(upload).toBeInstanceOf(FormData);
    if (!(upload instanceof FormData)) throw new Error('Expected the photo request to use FormData.');
    expect(upload.get('file')).toBe(file);
  });

  it('rejects unsupported and oversized photos before making an upload request', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Change profile photo' }));
    const input = screen.getByLabelText('Choose profile photo');
    fireEvent.change(input, { target: { files: [new File(['x'], 'profile.svg', { type: 'image/svg+xml' })] } });
    expect(screen.getByText('Choose a JPEG, PNG, or WebP image.')).toBeVisible();
    fireEvent.change(input, { target: { files: [new File([new Uint8Array(1024 * 1024 + 1)], 'large.png', { type: 'image/png' })] } });
    expect(screen.getByText('Profile photo must be no larger than 1 MB.')).toBeVisible();
    expect(apiRequestMock.mock.calls.some(([request]) => request.method === 'PUT')).toBe(false);
  });

  it('requires confirmation before removal and shows safe upload/delete failures', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValue('blob:photo') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    apiRequestMock.mockResolvedValueOnce({ data: new Blob(['photo']) }).mockRejectedValueOnce(new Error('private delete detail'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Change profile photo' })).toBeVisible());
    await userEvent.click(screen.getByRole('button', { name: 'Change profile photo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(screen.getByRole('dialog', { name: 'Remove profile photo?' })).toBeVisible();
    expect(apiRequestMock.mock.calls.some(([request]) => request.method === 'DELETE')).toBe(false);
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Remove profile photo?' })).getByRole('button', { name: 'Remove photo' }));
    expect(await screen.findByText('Unable to remove your profile photo. Please try again.')).toBeVisible();
    expect(screen.queryByText('private delete detail')).not.toBeInTheDocument();
  });

  it('removes a photo only after confirmation and returns to initials', async () => {
    const createUrl = vi.fn().mockReturnValue('blob:photo');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    apiRequestMock.mockResolvedValueOnce({ data: new Blob(['photo']) }).mockResolvedValueOnce({ data: undefined });
    renderPage();
    await waitFor(() => expect(createUrl).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Change profile photo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Remove profile photo?' })).getByRole('button', { name: 'Remove photo' }));
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE', url: '/candidate/profile/photo' })));
    expect(screen.getByLabelText('Avery Patel initials')).toHaveTextContent('AP');
  });

  it('shows a safe server error when photo upload fails', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValue('blob:preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    apiRequestMock.mockRejectedValueOnce(new Error('missing')).mockRejectedValueOnce(new Error('private upload detail'));
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Change profile photo' }));
    fireEvent.change(screen.getByLabelText('Choose profile photo'), { target: { files: [new File(['image'], 'profile.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Save photo' }));
    expect(await screen.findByText('Unable to update your profile photo. Please try again.')).toBeVisible();
    expect(screen.queryByText('private upload detail')).not.toBeInTheDocument();
  });

  it('loads and displays existing Career Preferences from the canonical query', () => {
    mocks.getCareerPreferences.mockReturnValue(queryResult({ data: careerPreferences }));
    renderPage();
    expect(screen.getByText('Frontend Engineer')).toBeVisible();
    expect(screen.getByText('Bengaluru')).toBeVisible();
    expect(screen.getByText('INR 18,00,000 per year')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit career preferences' })).toBeEnabled();
  });

  it('saves the exact Career Preferences payload, refetches, and displays the persisted response', async () => {
    const refetch = vi.fn();
    const persisted = {
      employmentTypes: ['FullTime'] as const,
      expectedAnnualSalary: 2000000,
      jobTypes: ['Contractual'] as const,
      preferredCities: ['Hyderabad'],
      preferredJobRoles: ['Platform Engineer'],
      preferredShifts: ['Flexible'] as const,
      salaryUnit: 'INR per annum',
    };
    const mutation = mutationResult({ result: persisted });
    mocks.getCareerPreferences.mockReturnValue(queryResult({ data: { ...careerPreferences, employmentTypes: [], expectedAnnualSalary: null, jobTypes: [], preferredCities: [], preferredJobRoles: [], preferredShifts: [] }, refetch }));
    mocks.updateCareerPreferences.mockReturnValue(mutation.tuple);
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Edit career preferences' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Preferred job roles' }), { target: { value: '  Platform Engineer  ' } });
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]!);
    fireEvent.change(screen.getByRole('textbox', { name: 'Preferred cities' }), { target: { value: '  Hyderabad  ' } });
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[1]!);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Expected annual salary' }), { target: { value: '2000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Contractual' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Full-time' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Flexible' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }));

    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith({
      employmentTypes: ['FullTime'],
      expectedAnnualSalary: 2000000,
      jobTypes: ['Contractual'],
      preferredCities: ['Hyderabad'],
      preferredJobRoles: ['Platform Engineer'],
      preferredShifts: ['Flexible'],
    }));
    expect(await screen.findByText('Career preferences saved.')).toBeVisible();
    expect(refetch).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit career preferences' })).not.toBeInTheDocument());
    expect(screen.getByText('Platform Engineer')).toBeVisible();
  });

  it('keeps Career Preferences input after a failed canonical mutation', async () => {
    const mutation = mutationResult({ rejection: { message: 'Career preferences could not be saved.', status: 400 } });
    mocks.getCareerPreferences.mockReturnValue(queryResult({ data: careerPreferences }));
    mocks.updateCareerPreferences.mockReturnValue(mutation.tuple);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Edit career preferences' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Expected annual salary' }), { target: { value: '2100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(await screen.findByText('Career preferences could not be saved.')).toBeVisible();
    expect(screen.getByRole('spinbutton', { name: 'Expected annual salary' })).toHaveValue(2100000);
    expect(screen.getByRole('dialog', { name: 'Edit career preferences' })).toBeVisible();
  });

  it('enforces Career Preferences chip limits, prevents duplicates, and supports removal', () => {
    mocks.getCareerPreferences.mockReturnValue(queryResult({ data: {
      ...careerPreferences,
      preferredCities: ['Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai'],
      preferredJobRoles: ['Role 1', 'Role 2', 'Role 3'],
    } }));
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Edit career preferences' }));
    expect(screen.getByRole('textbox', { name: 'Preferred job roles' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Preferred cities' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Remove Role 1'));
    expect(screen.getByRole('textbox', { name: 'Preferred job roles' })).toBeEnabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Preferred job roles' }), { target: { value: 'Role 2' } });
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]!);
    expect(screen.getByText('That job role is already selected.')).toBeVisible();
  });

  it('renders Education loading, error with Retry, and empty states', async () => {
    educationMocks.get.mockReturnValue(queryResult({ isLoading: true }));
    const loading = renderEducation();
    expect(screen.getByRole('status')).toHaveTextContent('Loading education…');

    loading.unmount();
    const refetch = vi.fn();
    educationMocks.get.mockReturnValue(queryResult({ isError: true, refetch }));
    const failed = renderEducation();
    expect(screen.getByText('Education records are temporarily unavailable.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();

    failed.unmount();
    educationMocks.get.mockReturnValue(queryResult({ data: [] }));
    renderEducation();
    expect(screen.getByText(/education helps employers understand your academic background/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add education' })).toBeVisible();
  });

  it('adds education using the exact canonical API payload', async () => {
    const mutation = mutationResult();
    educationMocks.add.mockReturnValue(mutation.tuple);
    renderEducation();

    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.change(screen.getByRole('textbox', { name: /education level/i }), { target: { value: '  Master of Science  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: /university \/ institute/i }), { target: { value: '  Delhi University  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: /course \/ specialization/i }), { target: { value: '  Data Science  ' } });
    await userEvent.click(screen.getByRole('combobox', { name: 'Course type' }));
    await userEvent.click(screen.getByRole('option', { name: 'Part-time' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Start year' }), { target: { value: '2022' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'End year' }), { target: { value: '2024' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Grading system' }), { target: { value: '  Percentage  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Grade / score' }), { target: { value: '  87%  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));

    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith({
      courseType: 'PartTime',
      description: null,
      displayOrder: 0,
      endYear: 2024,
      fieldOfStudy: 'Data Science',
      grade: '87%',
      gradingSystem: 'Percentage',
      institution: 'Delhi University',
      isCurrentlyStudying: false,
      qualification: 'Master of Science',
      startYear: 2022,
    }));
  });

  it('edits education using its ID and preserves the canonical record fields', async () => {
    const mutation = mutationResult();
    educationMocks.get.mockReturnValue(queryResult({ data: [education] }));
    educationMocks.update.mockReturnValue(mutation.tuple);
    renderEducation();

    fireEvent.click(screen.getByRole('button', { name: 'Edit education' }));
    const qualification = screen.getByRole('textbox', { name: /education level/i });
    fireEvent.change(qualification, { target: { value: 'Bachelor of Engineering' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));

    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith({
      id: 'education-id',
      data: {
        courseType: 'FullTime',
        description: 'Core computer science curriculum',
        displayOrder: 2,
        endYear: 2021,
        fieldOfStudy: 'Computer Science',
        grade: '8.7 CGPA',
        gradingSystem: 'CGPA',
        institution: 'Pune University',
        isCurrentlyStudying: false,
        qualification: 'Bachelor of Engineering',
        startYear: 2017,
      },
    }));
  });

  it('clears and disables End year for a current course', async () => {
    const mutation = mutationResult();
    educationMocks.get.mockReturnValue(queryResult({ data: [education] }));
    educationMocks.update.mockReturnValue(mutation.tuple);
    renderEducation();

    await userEvent.click(screen.getByRole('button', { name: 'Edit education' }));
    const endYear = screen.getByRole('spinbutton', { name: 'End year' });
    expect(endYear).toHaveValue(2021);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Currently studying' }));
    expect(endYear).toBeDisabled();
    expect(endYear).toHaveValue(null);
    await userEvent.click(screen.getByRole('button', { name: 'Save education' }));
    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledOnce());
    const updateRequest: unknown = mutation.trigger.mock.calls[0]?.[0];
    expect(updateRequest).toMatchObject({
      data: { endYear: null, isCurrentlyStudying: true },
      id: 'education-id',
    });
  });

  it('blocks invalid education client data before saving', () => {
    const mutation = mutationResult();
    educationMocks.add.mockReturnValue(mutation.tuple);
    renderEducation();
    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));
    expect(screen.getByText('Education level and university / institute are required.')).toBeVisible();
    expect(mutation.trigger).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox', { name: /education level/i }), { target: { value: 'BSc' } });
    fireEvent.change(screen.getByRole('textbox', { name: /university \/ institute/i }), { target: { value: 'Pune University' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Start year' }), { target: { value: '2025' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'End year' }), { target: { value: '2024' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));
    expect(screen.getByText('End year cannot be before start year.')).toBeVisible();
    expect(mutation.trigger).not.toHaveBeenCalled();
  });

  it('keeps the education dialog open and shows a safe backend save error', async () => {
    const mutation = mutationResult({ rejection: { message: 'Education could not be saved.', status: 400 } });
    educationMocks.add.mockReturnValue(mutation.tuple);
    renderEducation();
    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.change(screen.getByRole('textbox', { name: /education level/i }), { target: { value: 'BSc' } });
    fireEvent.change(screen.getByRole('textbox', { name: /university \/ institute/i }), { target: { value: 'Pune University' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));
    expect(await screen.findByText('Education could not be saved.')).toBeVisible();
    expect(screen.getByRole('dialog', { name: 'Add education' })).toBeVisible();
  });

  it('names the record in delete confirmation and deletes by canonical ID', async () => {
    const mutation = mutationResult();
    educationMocks.get.mockReturnValue(queryResult({ data: [education] }));
    educationMocks.delete.mockReturnValue(mutation.tuple);
    renderEducation();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete education?' });
    expect(within(dialog).getByText(/“Bachelor of Technology” at Pune University/)).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete education' }));
    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith('education-id'));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Delete education?' })).not.toBeInTheDocument());
  });

  it('shows a safe delete API error and leaves confirmation available', async () => {
    const mutation = mutationResult({ rejection: { message: 'Education could not be deleted.', status: 409 } });
    educationMocks.get.mockReturnValue(queryResult({ data: [education] }));
    educationMocks.delete.mockReturnValue(mutation.tuple);
    renderEducation();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete education' }));
    expect(await screen.findByText('Education could not be deleted.')).toBeVisible();
    expect(screen.getByRole('dialog', { name: 'Delete education?' })).toBeVisible();
  });

  it('provides an accessible Education pencil Tooltip without subsection navigation', async () => {
    educationMocks.get.mockReturnValue(queryResult({ data: [education] }));
    renderEducation();
    expect(screen.queryByRole('tablist', { name: 'Profile sections' })).not.toBeInTheDocument();
    const edit = screen.getByRole('button', { name: 'Edit education' });
    expect(edit).toBeEnabled();
    await userEvent.hover(edit);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit education');
  });

  it('renders Employment loading, retryable error, and Experienced empty states', async () => {
    employmentMocks.get.mockReturnValue(queryResult({ isLoading: true }));
    const loading = renderEmployment();
    expect(screen.getByRole('status')).toHaveTextContent('Loading employment…');

    loading.unmount();
    const refetch = vi.fn();
    employmentMocks.get.mockReturnValue(queryResult({ isError: true, refetch }));
    const failed = renderEmployment();
    expect(screen.getByText('Employment records are temporarily unavailable.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();

    failed.unmount();
    employmentMocks.get.mockReturnValue(queryResult({ data: [] }));
    renderEmployment();
    expect(screen.getByText(/add employment history to complete your experienced candidate profile/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add employment' })).toBeVisible();
  });

  it('renders the Fresher-specific optional Employment empty state', () => {
    mocks.getBasicDetails.mockReturnValue(queryResult({ data: { email: 'avery@example.com', mobile: null, workStatus: 'Fresher' } }));
    renderEmployment();
    expect(screen.getByText('Employment history is optional for freshers.')).toBeVisible();
  });

  it('opens Add employment and validates required fields and date order', async () => {
    const mutation = mutationResult();
    employmentMocks.add.mockReturnValue(mutation.tuple);
    renderEmployment();
    fireEvent.click(screen.getByRole('button', { name: 'Add employment' }));
    expect(screen.getByRole('dialog', { name: 'Add employment' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Save employment' }));
    expect(screen.getByText(/company name, job title, employment type, joining date/i)).toBeVisible();
    expect(mutation.trigger).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox', { name: 'Company name' }), { target: { value: 'Harbor Labs' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Job title' }), { target: { value: 'Engineer' } });
    await userEvent.click(screen.getByRole('combobox', { name: 'Employment type' }));
    await userEvent.click(screen.getByRole('option', { name: 'Full-time' }));
    fireEvent.change(screen.getByLabelText(/Joining date/i), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText(/Leaving date/i), { target: { value: '2024-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save employment' }));
    expect(screen.getByText('Joining date cannot be after leaving date.')).toBeVisible();
    expect(mutation.trigger).not.toHaveBeenCalled();
  });

  it('clears and disables Leaving date for a current company', async () => {
    employmentMocks.get.mockReturnValue(queryResult({ data: [employment] }));
    renderEmployment();
    fireEvent.click(screen.getByRole('button', { name: 'Edit employment' }));
    const leavingDate = screen.getByLabelText(/Leaving date/i);
    expect(leavingDate).toHaveValue('2022-06-30');
    await userEvent.click(screen.getByRole('radio', { name: 'Yes' }));
    expect(leavingDate).toBeDisabled();
    expect(leavingDate).toHaveValue('');
  });

  it('creates a current employment record using the exact API payload', async () => {
    const mutation = mutationResult();
    employmentMocks.add.mockReturnValue(mutation.tuple);
    renderEmployment();
    fireEvent.click(screen.getByRole('button', { name: 'Add employment' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Yes' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'Employment type' }));
    await userEvent.click(screen.getByRole('option', { name: 'Full-time' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Company name' }), { target: { value: '  Career Harbor  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Job title' }), { target: { value: '  Senior Engineer  ' } });
    fireEvent.change(screen.getByLabelText(/Joining date/i), { target: { value: '2022-01-15' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /current annual salary/i }), { target: { value: '2400000' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Skills used' }), { target: { value: ' React, TypeScript, React ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Job profile / responsibilities' }), { target: { value: '  Leads accessible frontend delivery.  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: /notice period/i }), { target: { value: '  30 days  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save employment' }));

    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith({
      annualSalary: 2400000,
      companyName: 'Career Harbor',
      description: 'Leads accessible frontend delivery.',
      displayOrder: 0,
      employmentType: EmploymentType.FullTime,
      endDate: null,
      isCurrent: true,
      jobTitle: 'Senior Engineer',
      location: null,
      noticePeriod: '30 days',
      skillsUsed: ['React', 'TypeScript', 'React'],
      startDate: '2022-01-15',
    }));
  });

  it('edits employment by ID with the exact canonical API payload', async () => {
    const mutation = mutationResult();
    employmentMocks.get.mockReturnValue(queryResult({ data: [employment] }));
    employmentMocks.update.mockReturnValue(mutation.tuple);
    renderEmployment();
    fireEvent.click(screen.getByRole('button', { name: 'Edit employment' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Job title' }), { target: { value: 'Senior Frontend Engineer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save employment' }));

    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith({
      id: 'employment-id',
      data: {
        annualSalary: 1200000,
        companyName: 'Harbor Labs',
        description: 'Built accessible candidate experiences.',
        displayOrder: 1,
        employmentType: EmploymentType.Internship,
        endDate: '2022-06-30',
        isCurrent: false,
        jobTitle: 'Senior Frontend Engineer',
        location: 'Pune',
        noticePeriod: '30 days',
        skillsUsed: ['React', 'TypeScript'],
        startDate: '2021-07-01',
      },
    }));
  });

  it('preserves employment input and shows safe mutation failure feedback', async () => {
    const mutation = mutationResult({ rejection: { message: 'Employment could not be saved.', status: 400 } });
    employmentMocks.add.mockReturnValue(mutation.tuple);
    renderEmployment();
    fireEvent.click(screen.getByRole('button', { name: 'Add employment' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'Employment type' }));
    await userEvent.click(screen.getByRole('option', { name: 'Internship' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Company name' }), { target: { value: 'Harbor Labs' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Job title' }), { target: { value: 'Intern' } });
    fireEvent.change(screen.getByLabelText(/Joining date/i), { target: { value: '2021-01-01' } });
    fireEvent.change(screen.getByLabelText(/Leaving date/i), { target: { value: '2021-06-30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save employment' }));
    expect(await screen.findByText('Employment could not be saved.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Company name' })).toHaveValue('Harbor Labs');
  });

  it('confirms and deletes employment by ID', async () => {
    const mutation = mutationResult();
    employmentMocks.get.mockReturnValue(queryResult({ data: [employment] }));
    employmentMocks.delete.mockReturnValue(mutation.tuple);
    renderEmployment();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete employment?' });
    expect(within(dialog).getByText(/“Frontend Engineer” at Harbor Labs/)).toBeVisible();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete employment' }));
    await waitFor(() => expect(mutation.trigger).toHaveBeenCalledWith('employment-id'));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Delete employment?' })).not.toBeInTheDocument());
  });

  it('shows populated employment safely with an accessible pencil action', async () => {
    employmentMocks.get.mockReturnValue(queryResult({ data: [employment] }));
    renderEmployment();
    expect(screen.queryByRole('tablist', { name: 'Profile sections' })).not.toBeInTheDocument();
    expect(screen.getByText('Harbor Labs')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Built accessible candidate experiences.')).toBeVisible();
    expect(screen.queryByText('1200000')).not.toBeInTheDocument();
    expect(screen.queryByText('30 days')).not.toBeInTheDocument();
    const edit = screen.getByRole('button', { name: 'Edit employment' });
    await userEvent.hover(edit);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit employment');
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
