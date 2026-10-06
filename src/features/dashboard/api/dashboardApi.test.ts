import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmploymentType } from '@/features/jobs/types/jobModels';
import { createAppStore } from '@/store/store';
import {
  CareerStage,
  DesiredOpportunity,
  JobApplicationStatus,
  WorkPreference,
  type UpdateCandidateCareerPreferencesRequest,
  type UserProfile,
} from '../types/dashboardModels';
import { dashboardApi, downloadCandidateResume } from './dashboardApi';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock('@/api/apiClient', () => ({
  apiClient: { request: mockRequest },
}));

const profile: UserProfile = {
  bio: null,
  education: [],
  email: 'candidate@example.com',
  experience: [],
  firstName: 'Candidate',
  headline: null,
  id: 'candidate-id',
  lastName: 'User',
  linkedInUrl: null,
  location: null,
  portfolioUrl: null,
  preferredJobTypes: [EmploymentType.FullTime],
  resume: {
    resumeId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    fileName: 'candidate-resume.pdf',
    contentType: 'application/pdf',
    sizeBytes: 128,
    uploadedAtUtc: '2026-07-29T00:00:00Z',
  },
  skills: [],
};

const application = {
  companyName: 'Northstar',
  coverLetter: null,
  id: 'application-id',
  jobId: 'job-id',
  jobSlug: 'frontend-engineer',
  jobTitle: 'Frontend Engineer',
  resumeFileName: null,
  status: JobApplicationStatus.Submitted,
  submittedAtUtc: '2026-07-29T00:00:00Z',
  withdrawnAtUtc: null,
};

describe('Candidate API integration', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('loads and updates the candidate profile contract', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({ data: { data: profile } });

    const loadedProfile = await store.dispatch(dashboardApi.endpoints.getProfile.initiate()).unwrap();
    expect(loadedProfile.resume?.resumeId).toBe(profile.resume?.resumeId);
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', url: '/candidate/profile' }),
    );

    await store
      .dispatch(
        dashboardApi.endpoints.updateProfile.initiate({
          bio: null,
          education: [],
          experience: [],
          headline: null,
          linkedInUrl: null,
          location: null,
          portfolioUrl: null,
          preferredJobTypes: [EmploymentType.FullTime],
          skills: [],
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PUT', url: '/candidate/profile' }),
    );
  });

  it('uses the exact Candidate about and completion contracts', async () => {
    const store = createAppStore();
    mockRequest
      .mockResolvedValueOnce({
        data: { data: { profileSummary: 'Builds accessible products.', resumeHeadline: 'Frontend engineer' } },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            completedSections: ['basicDetails'],
            completionPercentage: 15,
            missingSections: ['resumeHeadline'],
            sections: [{ isCompleted: true, section: 'basicDetails', weight: 15 }],
          },
        },
      });

    await store
      .dispatch(
        dashboardApi.endpoints.updateCandidateAbout.initiate({
          profileSummary: 'Builds accessible products.',
          resumeHeadline: 'Frontend engineer',
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: {
          profileSummary: 'Builds accessible products.',
          resumeHeadline: 'Frontend engineer',
        },
        method: 'PUT',
        url: '/candidate/profile/about',
      }),
    );

    await store.dispatch(dashboardApi.endpoints.getProfileCompletion.initiate()).unwrap();
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ method: 'GET', url: '/candidate/profile/completion' }),
    );
  });

  it('sends corrected basic-details mobile and canonical Career Preference enum values', async () => {
    const store = createAppStore();
    const basicRequest = {
      availabilityToJoin: null,
      currentAnnualSalary: null,
      currentArea: null,
      currentCity: 'Pune',
      currentCountry: 'India',
      currentFixedAnnualSalary: null,
      currentVariableAnnualSalary: null,
      isOutsideIndia: false,
      mobileNumber: '9876543210',
      workStatus: 'Experienced' as const,
    };
    const preferencesRequest: UpdateCandidateCareerPreferencesRequest = {
      employmentTypes: ['FullTime'],
      expectedAnnualSalary: 1800000,
      jobTypes: ['Contractual'],
      preferredCities: ['Pune'],
      preferredJobRoles: ['Frontend Engineer'],
      preferredShifts: ['Flexible'],
    };
    mockRequest
      .mockResolvedValueOnce({ data: { data: { ...basicRequest, email: 'candidate@example.com', mobileVerified: false, salaryUnit: 'INR per annum' } } })
      .mockResolvedValueOnce({ data: { data: { ...preferencesRequest, salaryUnit: 'INR per annum' } } });

    await store.dispatch(dashboardApi.endpoints.updateCandidateBasicDetails.initiate(basicRequest)).unwrap();
    await store.dispatch(dashboardApi.endpoints.updateCandidateCareerPreferences.initiate(preferencesRequest)).unwrap();

    expect(mockRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
      data: basicRequest,
      method: 'PUT',
      url: '/candidate/profile/basic-details',
    }));
    expect(mockRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: preferencesRequest,
      method: 'PUT',
      url: '/candidate/profile/career-preferences',
    }));
  });

  it('uses exact structured skill CRUD contracts and accepts an empty 204 delete response', async () => {
    const store = createAppStore();
    const skill = {
      createdAtUtc: '2026-08-12T00:00:00Z',
      id: 'skill-id',
      name: 'ASP.NET Core',
      proficiency: 'Advanced',
      updatedAtUtc: null,
      yearsOfExperience: 3.5,
    };
    const request = {
      name: 'ASP.NET Core',
      proficiency: 'Advanced' as const,
      yearsOfExperience: 3.5,
    };
    mockRequest
      .mockResolvedValueOnce({ data: { data: [skill] } })
      .mockResolvedValueOnce({ data: { data: skill } })
      .mockResolvedValueOnce({ data: { data: { ...skill, proficiency: 'Expert' } } })
      .mockResolvedValueOnce({ data: undefined, status: 204 });

    const skillsSubscription = store.dispatch(
      dashboardApi.endpoints.getCandidateSkills.initiate(),
    );
    await skillsSubscription.unwrap();
    skillsSubscription.unsubscribe();
    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ method: 'GET', url: '/candidate/profile/skills' }),
    );

    await store.dispatch(dashboardApi.endpoints.addCandidateSkill.initiate(request)).unwrap();
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: request, method: 'POST', url: '/candidate/profile/skills' }),
    );

    await store
      .dispatch(
        dashboardApi.endpoints.updateCandidateSkill.initiate({
          data: { ...request, proficiency: 'Expert' },
          skillId: 'skill/id',
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: { ...request, proficiency: 'Expert' },
        method: 'PUT',
        url: '/candidate/profile/skills/skill%2Fid',
      }),
    );

    await expect(
      store.dispatch(dashboardApi.endpoints.deleteCandidateSkill.initiate('skill/id')).unwrap(),
    ).resolves.toBeUndefined();
    expect(mockRequest).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ method: 'DELETE', url: '/candidate/profile/skills/skill%2Fid' }),
    );
  });

  it('refetches both the authoritative profile and skills collection after a skill mutation', async () => {
    const store = createAppStore();
    const savedSkill = {
      createdAtUtc: '2026-08-23T00:00:00Z',
      id: 'skill-id',
      name: 'React',
      proficiency: null,
      updatedAtUtc: null,
      yearsOfExperience: null,
    };
    mockRequest.mockImplementation((request: { method: string; url: string }) => {
      if (request.url === '/candidate/profile/skills' && request.method === 'POST') {
        return Promise.resolve({ data: { data: savedSkill } });
      }
      if (request.url === '/candidate/profile/skills') return Promise.resolve({ data: { data: [savedSkill] } });
      if (request.url === '/candidate/profile') return Promise.resolve({ data: { data: profile } });
      return Promise.reject(new Error(`Unexpected request: ${request.method} ${request.url}`));
    });

    const profileSubscription = store.dispatch(dashboardApi.endpoints.getProfile.initiate());
    const skillsSubscription = store.dispatch(dashboardApi.endpoints.getCandidateSkills.initiate());
    await Promise.all([profileSubscription.unwrap(), skillsSubscription.unwrap()]);

    await store.dispatch(dashboardApi.endpoints.addCandidateSkill.initiate({
      name: 'React',
      proficiency: null,
      yearsOfExperience: null,
    })).unwrap();

    await vi.waitFor(() => {
      const requests = mockRequest.mock.calls.map(([request]) => request as { method: string; url: string });
      expect(requests.filter((request) => request.method === 'GET' && request.url === '/candidate/profile')).toHaveLength(2);
      expect(requests.filter((request) => request.method === 'GET' && request.url === '/candidate/profile/skills')).toHaveLength(2);
    });
    profileSubscription.unsubscribe();
    skillsSubscription.unsubscribe();
  });

  it('loads and saves the real Candidate onboarding contract', async () => {
    const store = createAppStore();
    const onboarding = {
      careerStage: CareerStage.Student,
      city: 'Pune',
      college: 'City College',
      completedAtUtc: '2026-07-30T00:00:00Z',
      degree: 'B.Tech',
      desiredOpportunities: [DesiredOpportunity.Internship],
      graduationYear: 2027,
      skills: ['React', 'TypeScript'],
      workPreferences: [WorkPreference.Hybrid],
      yearsOfExperience: null,
    };
    mockRequest.mockResolvedValue({ data: { data: onboarding } });

    await store.dispatch(dashboardApi.endpoints.getOnboarding.initiate()).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', url: '/candidate/onboarding' }),
    );

    await store
      .dispatch(
        dashboardApi.endpoints.updateOnboarding.initiate({
          careerStage: CareerStage.Student,
          city: 'Pune',
          college: 'City College',
          degree: 'B.Tech',
          desiredOpportunities: [DesiredOpportunity.Internship],
          graduationYear: 2027,
          skills: ['React', 'TypeScript'],
          workPreferences: [WorkPreference.Hybrid],
          yearsOfExperience: null,
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        url: '/candidate/onboarding',
      }),
    );
  });

  it('uploads resumes as multipart form data to the secure candidate endpoint', async () => {
    const store = createAppStore();
    const file = new File(['%PDF-resume'], 'Manoj_Shekapure_DotNet_Resume.pdf', {
      type: 'application/pdf',
    });
    mockRequest.mockResolvedValue({
      data: {
        data: {
          resumeId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
          contentType: 'application/pdf',
          fileName: file.name,
          sizeBytes: file.size,
          uploadedAtUtc: '2026-07-29T00:00:00Z',
        },
      },
    });

    const uploaded = await store.dispatch(dashboardApi.endpoints.uploadResume.initiate(file)).unwrap();
    expect(uploaded.resumeId).toBe('cccccccc-cccc-cccc-cccc-cccccccccccc');

    const request = mockRequest.mock.calls[0]?.[0] as {
      data: FormData;
      method: string;
      url: string;
    };
    expect(request.method).toBe('PUT');
    expect(request.url).toBe('/candidate/resume');
    expect(request.data).toBeInstanceOf(FormData);
    expect(request.data.get('file')).toBe(file);
    expect((request.data.get('file') as File).name).toBe('Manoj_Shekapure_DotNet_Resume.pdf');
  });

  it('downloads resumes through the authenticated client without caching binary data', async () => {
    const resume = new Blob(['%PDF-resume'], { type: 'application/pdf' });
    mockRequest.mockResolvedValue({ data: resume });

    await expect(downloadCandidateResume()).resolves.toBe(resume);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        responseType: 'blob',
        url: '/candidate/resume',
      }),
    );
    expect('downloadResume' in dashboardApi.endpoints).toBe(false);
  });

  it('uses the resume-status and pagination-only recommendation contracts', async () => {
    const store = createAppStore();
    mockRequest
      .mockResolvedValueOnce({ data: { data: { extractedAtUtc: null, extractionStatus: 2, hasResume: true, message: 'Ready', resumeId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' } } })
      .mockResolvedValueOnce({ data: { data: { extractionStatus: 2, items: [], message: '', pageNumber: 2, pageSize: 20, totalCount: 0, totalPages: 0 } } });
    const resumeStatus = await store.dispatch(dashboardApi.endpoints.getResumeStatus.initiate()).unwrap();
    expect(resumeStatus.resumeId).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    await store.dispatch(dashboardApi.endpoints.getRecommendedJobs.initiate({ pageNumber: 2, pageSize: 20 })).unwrap();
    expect(mockRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({ url: '/candidate/resume/status' }));
    expect(mockRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({ params: { pageNumber: 2, pageSize: 20 }, url: '/candidate/jobs/recommended' }));
  });

  it('uses Candidate saved-job endpoints for save and removal', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({ data: undefined });

    await store.dispatch(dashboardApi.endpoints.saveJob.initiate('job-id')).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'PUT', url: '/candidate/saved-jobs/job-id' }),
    );

    await store.dispatch(dashboardApi.endpoints.removeSavedJob.initiate('job-id')).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'DELETE', url: '/candidate/saved-jobs/job-id' }),
    );
  });

  it('submits and withdraws real candidate applications', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({ data: { data: application } });

    await store
      .dispatch(
        dashboardApi.endpoints.submitApplication.initiate({
          applicationMethod: 'Portal',
          jobId: 'job-id',
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { applicationMethod: 'Portal' },
        method: 'POST',
        url: '/candidate/jobs/job-id/apply',
      }),
    );

    await store
      .dispatch(dashboardApi.endpoints.withdrawApplication.initiate('application-id'))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/candidate/applications/application-id/withdraw',
      }),
    );
  });

  it('loads paginated applied jobs with the exact candidate query', async () => {
    const store = createAppStore();
    const page = { items: [application], pageNumber: 2, pageSize: 20, totalCount: 21, totalPages: 2 };
    mockRequest.mockResolvedValue({ data: { data: page } });

    await store.dispatch(dashboardApi.endpoints.getApplications.initiate({ pageNumber: 2, pageSize: 20 })).unwrap();

    expect(mockRequest).toHaveBeenLastCalledWith(expect.objectContaining({
      method: 'GET',
      params: { pageNumber: 2, pageSize: 20 },
      url: '/candidate/applications',
    }));
  });
});
