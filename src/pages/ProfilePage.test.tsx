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
  useUpdateCandidateBasicDetailsMutation,
  useUpdateCandidateCareerPreferencesMutation,
  useUpdateCandidateSkillMutation,
  useUpdateProfileMutation,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import {
  CareerStage,
  CandidateAvailability,
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
    useUpdateCandidateBasicDetailsMutation: vi.fn(),
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
  noticePeriod: null,
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
  updateBasicDetails: vi.mocked(useUpdateCandidateBasicDetailsMutation),
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
  mocks.getBasicDetails.mockReturnValue(queryResult({ data: { email: 'avery@example.com', mobileNumber: null, mobileVerified: false, workStatus: 'Experienced', isOutsideIndia: false, currentCountry: 'India', currentCity: 'Pune', currentArea: null, availabilityToJoin: null, currentAnnualSalary: null, currentFixedAnnualSalary: null, currentVariableAnnualSalary: null, salaryUnit: 'INR per annum' } }));
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
  mocks.updateAbout.mockReturnValue(mutationResult({ result: { profileSummary: profile.bio, resumeHeadline: profile.headline } }).tuple);
  mocks.updateBasicDetails.mockReturnValue(mutationResult().tuple);
  mocks.updateCareerPreferences.mockReturnValue(mutationResult().tuple);
  mocks.add.mockReturnValue(mutationResult().tuple);
  mocks.updateSkill.mockReturnValue(mutationResult().tuple);
  mocks.delete.mockReturnValue(mutationResult().tuple);
  mocks.uploadResume.mockReturnValue(mutationResult().tuple);
  mocks.updateProfile.mockReturnValue(mutationResult({ result: profile }).tuple);
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
    expect(screen.getByText(/avery@example\.com/)).toBeVisible();
    expect(screen.getAllByText('40%').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('progressbar', { name: 'Profile completion: 40%' })[0]).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
    expect(screen.queryByRole('heading', { name: 'Profile strength' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Basic details' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Career preferences' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Employment' })).toBeVisible();
    expect(screen.queryByRole('tablist', { name: 'Profile sections' })).not.toBeInTheDocument();
  });

  it('opens an Edit basic details dialog containing no section tabs or unrelated editors', async () => {
    renderPage();
    expect(screen.queryByRole('heading', { name: 'Basic details' })).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit profile' })[0]!);
    const dialog = screen.getByRole('dialog', { name: 'Edit basic details' });
    expect(within(dialog).queryByRole('tab')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: 'Resume headline' })).toBeRequired();
    expect(within(dialog).getByRole('textbox', { name: 'Mobile number' })).toBeEnabled();
    expect(within(dialog).getByRole('textbox', { name: 'City' })).toBeRequired();
    expect(within(dialog).getByRole('textbox', { name: 'State' })).toBeRequired();
    expect(within(dialog).getByRole('textbox', { name: 'Skills' })).toBeVisible();
    expect(within(dialog).queryByText('Career preferences')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Education')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Employment')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('About')).not.toBeInTheDocument();
  });

  it('saves hero fields through deployed APIs, refetches authoritative data, and renders the refreshed values', async () => {
    const profileRefetch = vi.fn();
    const skillsRefetch = vi.fn();
    const completionRefetch = vi.fn();
    let currentProfile = { ...profile };
    let currentSkills: CandidateSkill[] = [skill];
    const updateTrigger = vi.fn((request: Record<string, unknown>) => ({
      unwrap: vi.fn(() => {
        currentProfile = { ...currentProfile, headline: request.headline as string, location: request.location as string };
        return Promise.resolve(currentProfile);
      }),
    }));
    const addTrigger = vi.fn((request: { name: string }) => ({
      unwrap: vi.fn(() => {
        const added = { ...skill, id: 'typescript-id', name: request.name };
        currentSkills = [...currentSkills, added];
        return Promise.resolve(added);
      }),
    }));
    mocks.getProfile.mockImplementation(() => queryResult({ data: currentProfile, refetch: profileRefetch }));
    mocks.getSkills.mockImplementation(() => queryResult({ data: currentSkills, refetch: skillsRefetch }));
    mocks.getCompletion.mockReturnValue(queryResult({ data: completion, refetch: completionRefetch }));
    mocks.getBasicDetails.mockReturnValue(queryResult({ data: {
      email: 'avery@example.com', mobileNumber: '+918080875878', mobileVerified: true, workStatus: 'Experienced', isOutsideIndia: false,
      currentCountry: 'India', currentCity: 'Pune', currentArea: null, availabilityToJoin: null,
      currentAnnualSalary: null, currentFixedAnnualSalary: null, currentVariableAnnualSalary: null, salaryUnit: 'INR per annum',
    } }));
    mocks.updateProfile.mockReturnValue([updateTrigger, { isLoading: false }] as never);
    mocks.add.mockReturnValue([addTrigger, { isLoading: false }] as never);
    renderPage();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit profile' })[0]!);
    const dialog = screen.getByRole('dialog', { name: 'Edit basic details' });
    expect(within(dialog).getByRole('textbox', { name: 'Mobile number' })).toHaveValue('+918080875878');
    expect(within(dialog).getByRole('textbox', { name: 'Mobile number' })).toBeDisabled();
    expect(within(dialog).getByText('Verified mobile number')).toBeVisible();
    await userEvent.clear(within(dialog).getByRole('textbox', { name: 'Resume headline' }));
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Resume headline' }), 'Principal frontend engineer');
    await userEvent.clear(within(dialog).getByRole('textbox', { name: 'State' }));
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'State' }), 'Maharashtra');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Skills' }), 'TypeScript');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add skill' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save basic details' }));

    await waitFor(() => expect(updateTrigger).toHaveBeenCalledWith(expect.objectContaining({
      headline: 'Principal frontend engineer',
      location: 'Pune, Maharashtra',
    })));
    expect(addTrigger).toHaveBeenCalledWith({ name: 'TypeScript', proficiency: null, yearsOfExperience: null });
    expect(profileRefetch).toHaveBeenCalled();
    expect(skillsRefetch).toHaveBeenCalled();
    expect(completionRefetch).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit basic details' })).not.toBeInTheDocument());
    expect(screen.getByText('Principal frontend engineer')).toBeVisible();
    expect(screen.getByText('Pune, Maharashtra')).toBeVisible();
    expect(screen.getByText('+918080875878')).toBeVisible();
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getByText('TypeScript')).toBeVisible();
  });

  it('submits a missing mobile through basic details and maps a 400 error to that input', async () => {
    const basicRefetch = vi.fn();
    const mobileError = 'Mobile number must be a valid 10-digit Indian mobile number.';
    mocks.getBasicDetails.mockReturnValue(queryResult({ data: {
      email: 'avery@example.com', mobileNumber: null, mobileVerified: false, workStatus: 'Experienced', isOutsideIndia: false,
      currentCountry: 'India', currentCity: 'Pune', currentArea: null, availabilityToJoin: null,
      currentAnnualSalary: 1200000, currentFixedAnnualSalary: 1000000, currentVariableAnnualSalary: 200000, salaryUnit: 'INR per annum',
    }, refetch: basicRefetch }));
    mocks.getSkills.mockReturnValue(queryResult({ data: [skill] }));
    const basicMutation = mutationResult({ rejection: { errors: { MobileNumber: [mobileError] }, message: 'One or more validation errors occurred.', status: 400 } });
    mocks.updateBasicDetails.mockReturnValue(basicMutation.tuple);
    renderPage();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit profile' })[0]!);
    const dialog = screen.getByRole('dialog', { name: 'Edit basic details' });
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Mobile number' }), '9876543210');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'State' }), 'Maharashtra');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save basic details' }));

    await waitFor(() => expect(basicMutation.trigger).toHaveBeenCalledWith({
      availabilityToJoin: null,
      currentAnnualSalary: 1200000,
      currentArea: null,
      currentCity: 'Pune',
      currentCountry: 'India',
      currentFixedAnnualSalary: 1000000,
      currentVariableAnnualSalary: 200000,
      isOutsideIndia: false,
      mobileNumber: '9876543210',
      workStatus: 'Experienced',
    }));
    expect(within(dialog).getByRole('textbox', { name: 'Mobile number' })).toHaveAccessibleDescription(mobileError);
    expect(basicRefetch).toHaveBeenCalled();
    expect(dialog).toBeVisible();
  });

  it('shows an existing unverified mobile as readonly without calling it verified', async () => {
    mocks.getBasicDetails.mockReturnValue(queryResult({ data: {
      email: 'avery@example.com', mobileNumber: '+919876543210', mobileVerified: false, workStatus: 'Experienced', isOutsideIndia: false,
      currentCountry: 'India', currentCity: 'Pune', currentArea: null, availabilityToJoin: null,
      currentAnnualSalary: null, currentFixedAnnualSalary: null, currentVariableAnnualSalary: null, salaryUnit: 'INR per annum',
    } }));
    renderPage();
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit profile' })[0]!);
    const mobile = within(screen.getByRole('dialog', { name: 'Edit basic details' })).getByRole('textbox', { name: 'Mobile number' });
    expect(mobile).toBeDisabled();
    expect(mobile).toHaveAccessibleDescription('Mobile number is not verified');
  });

  it('prepopulates and submits the exact trimmed about request', async () => {
    const mutation = mutationResult({ result: { profileSummary: 'Builds inclusive platforms.', resumeHeadline: profile.headline } });
    mocks.updateAbout.mockReturnValue(mutation.tuple);
    renderPage();
    const aboutSection = screen.getByRole('heading', { name: 'About' }).closest('section')!;
    expect(within(aboutSection).getByText('Profile summary')).toBeVisible();
    expect(within(aboutSection).queryByText('Resume headline')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Edit about' }));
    const summary = screen.getByRole('textbox', { name: 'Profile summary' });
    expect(summary).toHaveValue(profile.bio);
    expect(summary).toHaveAttribute('maxlength', '2000');
    expect(screen.queryByRole('textbox', { name: 'Resume headline' })).not.toBeInTheDocument();

    await userEvent.clear(summary);
    await userEvent.type(summary, '  Builds inclusive platforms.  ');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mutation.trigger).toHaveBeenCalledWith({
        profileSummary: 'Builds inclusive platforms.',
        resumeHeadline: profile.headline,
      }),
    );
  });

  it('disables duplicate about submissions while a request is pending', async () => {
    mocks.updateAbout.mockReturnValue(mutationResult({ isLoading: true }).tuple);
    const view = renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Edit about' }));
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

    view.unmount();
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
    expect(screen.getByText('avery@example.com')).toBeVisible();
    expect(screen.queryByText(/verified email/i)).not.toBeInTheDocument();
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

    expect(screen.getByText('100%')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Profile strength' })).not.toBeInTheDocument();
    expect(screen.queryByText(/phase 1/i)).not.toBeInTheDocument();
  });

  it('keeps missing-section guidance out of a separate Profile strength card', () => {
    mocks.getCompletion.mockReturnValue(
      queryResult({
        data: {
          ...completion,
          missingSections: ['resumeHeadline', 'profileSummary', 'skills', 'resume', 'basicDetails'],
        },
      }),
    );
    renderPage();

    expect(screen.queryByRole('heading', { name: 'Profile strength' })).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Profile completion: 40%' })).toBeVisible();
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
    expect(screen.getByText('Permanent')).toBeVisible();
    expect(screen.getByText('Full-time')).toBeVisible();
    expect(screen.getByText('Day')).toBeVisible();
    expect(screen.getByText('Desired roles:')).toBeVisible();
    expect(screen.getByText('Preferred locations:')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit career preferences' })).toBeEnabled();
  });

  it('saves the exact Career Preferences payload, refetches, and displays the persisted response', async () => {
    const refetch = vi.fn();
    let persisted = { ...careerPreferences, employmentTypes: [] as ('FullTime' | 'PartTime')[], expectedAnnualSalary: null as number | null, jobTypes: [] as ('Permanent' | 'Contractual')[], preferredCities: [] as string[], preferredJobRoles: [] as string[], preferredShifts: [] as ('Day' | 'Night' | 'Flexible')[] };
    const trigger = vi.fn((payload: Omit<typeof persisted, 'salaryUnit'>) => ({
      unwrap: vi.fn(() => {
        persisted = { ...payload, salaryUnit: 'INR per annum' };
        return Promise.resolve(persisted);
      }),
    }));
    mocks.getCareerPreferences.mockImplementation(() => queryResult({ data: persisted, refetch }));
    mocks.updateCareerPreferences.mockReturnValue([trigger, { isLoading: false }] as never);
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

    await waitFor(() => expect(trigger).toHaveBeenCalledWith({
      employmentTypes: ['FullTime'],
      expectedAnnualSalary: 2000000,
      jobTypes: ['Contractual'],
      preferredCities: ['Hyderabad'],
      preferredJobRoles: ['Platform Engineer'],
      preferredShifts: ['Flexible'],
    }));
    expect(refetch).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit career preferences' })).not.toBeInTheDocument());
    expect(screen.getByText('Platform Engineer')).toBeVisible();
    expect(screen.getByText('Hyderabad')).toBeVisible();
    expect(screen.getByText('Contractual')).toBeVisible();
    expect(screen.getByText('Full-time')).toBeVisible();
    expect(screen.getByText('Flexible')).toBeVisible();
    expect(screen.getByText('INR 20,00,000 per year')).toBeVisible();
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

  it('shows a Career Preferences 400 validation error under the matching enum field', async () => {
    const message = 'The value must be one of: FullTime, PartTime.';
    const mutation = mutationResult({ rejection: { errors: { 'employmentTypes[0]': [message] }, message: 'One or more validation errors occurred.', status: 400 } });
    mocks.getCareerPreferences.mockReturnValue(queryResult({ data: careerPreferences }));
    mocks.updateCareerPreferences.mockReturnValue(mutation.tuple);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Edit career preferences' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByText('Employment type').parentElement).toContainElement(screen.getByText(message));
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
    const refetch = vi.fn();
    let records: PortfolioEducation[] = [];
    const trigger = vi.fn((payload: Omit<PortfolioEducation, 'id'>) => ({
      unwrap: vi.fn(() => {
        const created = { ...payload, id: 'new-education-id' };
        records = [created];
        return Promise.resolve(created);
      }),
    }));
    educationMocks.get.mockImplementation(() => queryResult({ data: records, refetch }));
    educationMocks.add.mockReturnValue([trigger, { isLoading: false }] as never);
    renderEducation();

    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.change(screen.getByRole('textbox', { name: /education level/i }), { target: { value: '  Master of Science  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: /university \/ institute/i }), { target: { value: '  Delhi University  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: /course \/ specialization/i }), { target: { value: '  Data Science  ' } });
    await userEvent.click(screen.getByRole('combobox', { name: 'Course type' }));
    await userEvent.click(screen.getByRole('option', { name: 'Distance learning' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Start year' }), { target: { value: '2022' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'End year' }), { target: { value: '2024' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Grading system' }), { target: { value: '  Percentage  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Grade / score' }), { target: { value: '  87%  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));

    await waitFor(() => expect(trigger).toHaveBeenCalledWith({
      courseType: 'CorrespondenceOrDistance',
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
    expect(refetch).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add education' })).not.toBeInTheDocument());
    expect(await screen.findByText('Master of Science · Data Science')).toBeVisible();
    expect(screen.getByText('Delhi University')).toBeVisible();
    expect(screen.getByText('2022 – 2024')).toBeVisible();
    expect(within(screen.getByRole('heading', { name: 'Education' }).closest('section')!).getByText('Distance learning')).toBeVisible();
  });

  it('renders multiple canonical education records with saved degree details', () => {
    educationMocks.get.mockReturnValue(queryResult({ data: [education, {
      ...education,
      endYear: null,
      fieldOfStudy: 'Artificial Intelligence',
      id: 'education-id-2',
      institution: 'Indian Institute of Technology',
      isCurrentlyStudying: true,
      qualification: 'Master of Technology',
      startYear: 2023,
    }] }));
    renderEducation();
    expect(screen.getByText('Bachelor of Technology · Computer Science')).toBeVisible();
    expect(screen.getByText('Master of Technology · Artificial Intelligence')).toBeVisible();
    expect(screen.getByText('Indian Institute of Technology')).toBeVisible();
    expect(screen.getByText('2023 – Present')).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'Edit education' })).toHaveLength(2);
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
    expect(screen.getByRole('textbox', { name: /education level/i })).toHaveAccessibleDescription('Education level is required.');
    expect(screen.getByRole('textbox', { name: /university \/ institute/i })).toHaveAccessibleDescription('University / institute is required.');
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
    const courseTypeError = 'The value must be one of: FullTime, PartTime, CorrespondenceOrDistance.';
    const mutation = mutationResult({ rejection: { errors: { CourseType: [courseTypeError] }, message: 'Education could not be saved.', status: 400 } });
    educationMocks.add.mockReturnValue(mutation.tuple);
    renderEducation();
    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.change(screen.getByRole('textbox', { name: /education level/i }), { target: { value: 'BSc' } });
    fireEvent.change(screen.getByRole('textbox', { name: /university \/ institute/i }), { target: { value: 'Pune University' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save education' }));
    expect(await screen.findByText('Education could not be saved.')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Course type' })).toHaveAccessibleDescription(courseTypeError);
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
    mocks.getBasicDetails.mockReturnValue(queryResult({ data: { email: 'avery@example.com', mobileNumber: null, mobileVerified: false, workStatus: 'Fresher' } }));
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
    expect(screen.getByRole('textbox', { name: 'Company name' })).toHaveAccessibleDescription('Company name is required.');
    expect(screen.getByRole('textbox', { name: 'Job title' })).toHaveAccessibleDescription('Job title is required.');
    expect(screen.getByRole('combobox', { name: 'Employment type' })).toHaveAccessibleDescription('Employment type is required.');
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
    const refetch = vi.fn();
    let records: PortfolioExperience[] = [];
    const trigger = vi.fn((payload: Omit<PortfolioExperience, 'id'>) => ({
      unwrap: vi.fn(() => {
        const created = { ...payload, id: 'new-employment-id' };
        records = [created];
        return Promise.resolve(created);
      }),
    }));
    employmentMocks.get.mockImplementation(() => queryResult({ data: records, refetch }));
    employmentMocks.add.mockReturnValue([trigger, { isLoading: false }] as never);
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
    await userEvent.click(screen.getByRole('combobox', { name: /notice period/i }));
    await userEvent.click(screen.getByRole('option', { name: '1 month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save employment' }));

    await waitFor(() => expect(trigger).toHaveBeenCalledWith({
      annualSalary: 2400000,
      companyName: 'Career Harbor',
      description: 'Leads accessible frontend delivery.',
      displayOrder: 0,
      employmentType: EmploymentType.FullTime,
      endDate: null,
      isCurrent: true,
      jobTitle: 'Senior Engineer',
      location: null,
      noticePeriod: CandidateAvailability.OneMonth,
      skillsUsed: ['React', 'TypeScript'],
      startDate: '2022-01-15',
    }));
    expect(refetch).toHaveBeenCalled();
    expect(await screen.findByText('Senior Engineer')).toBeVisible();
    expect(screen.getByText('Career Harbor')).toBeVisible();
    expect(screen.getByText(/Jan 2022.*Present/)).toBeVisible();
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
        noticePeriod: null,
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
    employmentMocks.get.mockReturnValue(queryResult({ data: [employment, {
      ...employment,
      companyName: 'Career Harbor',
      description: null,
      endDate: null,
      id: 'employment-id-2',
      isCurrent: true,
      jobTitle: 'Senior Engineer',
      skillsUsed: ['Design systems'],
      startDate: '2024-10-01',
    }] }));
    renderEmployment();
    expect(screen.queryByRole('tablist', { name: 'Profile sections' })).not.toBeInTheDocument();
    expect(screen.getByText('Harbor Labs')).toBeVisible();
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getByText('Built accessible candidate experiences.')).toBeVisible();
    expect(screen.getByText(/Oct 2024.*Present/)).toBeVisible();
    expect(screen.getByText('1 yr 10 mos')).toBeVisible();
    expect(screen.queryByText('1200000')).not.toBeInTheDocument();
    expect(screen.queryByText('30 days')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit employment' })).toHaveLength(2);
    const edit = screen.getAllByRole('button', { name: 'Edit employment' })[0]!;
    await userEvent.hover(edit);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit employment');
  });

  it('renders loading and API-error retry states', async () => {
    mocks.getCompletion.mockReturnValue(queryResult({ isError: true }));
    mocks.getSkills.mockReturnValue(queryResult({ isError: true }));
    mocks.getResumeStatus.mockReturnValue(queryResult({ isError: true }));
    renderPage();

    expect(screen.queryByRole('heading', { name: 'Profile strength' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry resume status' })).toBeVisible();
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit profile' })[0]!);
    expect(within(screen.getByRole('dialog', { name: 'Edit basic details' })).getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
