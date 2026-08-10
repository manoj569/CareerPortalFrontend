import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmploymentType } from '@/features/jobs/types/jobModels';
import { createAppStore } from '@/store/store';
import {
  CareerStage,
  DesiredOpportunity,
  JobApplicationStatus,
  WorkPreference,
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
  resume: null,
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

    await store.dispatch(dashboardApi.endpoints.getProfile.initiate()).unwrap();
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
    const file = new File(['%PDF-resume'], 'candidate.pdf', { type: 'application/pdf' });
    mockRequest.mockResolvedValue({
      data: {
        data: {
          contentType: 'application/pdf',
          fileName: 'resume.pdf',
          sizeBytes: file.size,
          uploadedAtUtc: '2026-07-29T00:00:00Z',
        },
      },
    });

    await store.dispatch(dashboardApi.endpoints.uploadResume.initiate(file)).unwrap();

    const request = mockRequest.mock.calls[0]?.[0] as {
      data: FormData;
      method: string;
      url: string;
    };
    expect(request.method).toBe('PUT');
    expect(request.url).toBe('/candidate/resume');
    expect(request.data).toBeInstanceOf(FormData);
    expect(request.data.get('file')).toBe(file);
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
      .mockResolvedValueOnce({ data: { data: { extractedAtUtc: null, extractionStatus: 2, hasResume: true, message: 'Ready' } } })
      .mockResolvedValueOnce({ data: { data: { extractionStatus: 2, items: [], message: '', pageNumber: 2, pageSize: 20, totalCount: 0, totalPages: 0 } } });
    await store.dispatch(dashboardApi.endpoints.getResumeStatus.initiate()).unwrap();
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
          coverLetter: null,
          jobId: 'job-id',
        }),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { coverLetter: null },
        method: 'POST',
        url: '/candidate/jobs/job-id/applications',
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
});
