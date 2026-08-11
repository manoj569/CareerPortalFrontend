import { createApi } from '@reduxjs/toolkit/query/react';

import { apiClient } from '@/api/apiClient';
import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { CandidateRecruiterContact } from '@/features/jobs/types/jobModels';
import type { ApiResponse } from '@/types';
import type {
  ApplicationQuota,
  ApplyJobResponse,
  ApplicationsPage,
  ApplicationsQuery,
  CandidateOnboarding,
  CandidateProfileCompletion,
  CandidateAboutResponse,
  CandidateSkill,
  ChangePasswordRequest,
  CreateJobApplicationRequest,
  DashboardQuery,
  JobApplication,
  Membership,
  NotificationPage,
  ResumeMetadata,
  RecommendedJobsResponse,
  ResumeStatusResponse,
  SavedJobsPage,
  UpdateCandidateProfileRequest,
  UpdateCandidateAboutRequest,
  UpdateCandidateOnboardingRequest,
  UpsertCandidateSkillRequest,
  UserProfile,
} from '../types/dashboardModels';

interface NotificationsQuery extends DashboardQuery {
  isRead?: boolean;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 120,
  tagTypes: [
    'Profile',
    'ProfileCompletion',
    'ProfileSkills',
    'Onboarding',
    'Resume',
    'SavedJobs',
    'Applications',
    'Notifications',
    'Memberships',
    'ApplicationQuota',
    'RecruiterContact',
  ],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.PROFILE }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data,
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<UserProfile, UpdateCandidateProfileRequest>({
      query: (data) => ({
        data,
        method: 'PUT',
        url: API_ENDPOINTS.CANDIDATE.PROFILE,
      }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data,
      invalidatesTags: ['Profile', 'ProfileCompletion'],
    }),

    updateCandidateAbout: builder.mutation<CandidateAboutResponse, UpdateCandidateAboutRequest>({
      query: (data) => ({
        data,
        method: 'PUT',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_ABOUT,
      }),
      transformResponse: (response: ApiResponse<CandidateAboutResponse>) => response.data,
      invalidatesTags: ['Profile', 'ProfileCompletion'],
    }),

    getCandidateSkills: builder.query<CandidateSkill[], void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.PROFILE_SKILLS }),
      transformResponse: (response: ApiResponse<CandidateSkill[]>) => response.data,
      providesTags: ['ProfileSkills'],
    }),

    addCandidateSkill: builder.mutation<CandidateSkill, UpsertCandidateSkillRequest>({
      query: (data) => ({
        data,
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_SKILLS,
      }),
      transformResponse: (response: ApiResponse<CandidateSkill>) => response.data,
      invalidatesTags: ['ProfileSkills', 'ProfileCompletion'],
    }),

    updateCandidateSkill: builder.mutation<
      CandidateSkill,
      { data: UpsertCandidateSkillRequest; skillId: string }
    >({
      query: ({ data, skillId }) => ({
        data,
        method: 'PUT',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_SKILL(skillId),
      }),
      transformResponse: (response: ApiResponse<CandidateSkill>) => response.data,
      invalidatesTags: ['ProfileSkills', 'ProfileCompletion'],
    }),

    deleteCandidateSkill: builder.mutation<void, string>({
      query: (skillId) => ({
        method: 'DELETE',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_SKILL(skillId),
      }),
      invalidatesTags: ['ProfileSkills', 'ProfileCompletion'],
    }),

    getProfileCompletion: builder.query<CandidateProfileCompletion, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.PROFILE_COMPLETION }),
      transformResponse: (response: ApiResponse<CandidateProfileCompletion>) => response.data,
      providesTags: ['ProfileCompletion'],
    }),

    getOnboarding: builder.query<CandidateOnboarding, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.ONBOARDING }),
      transformResponse: (response: ApiResponse<CandidateOnboarding>) => response.data,
      providesTags: ['Onboarding'],
    }),

    updateOnboarding: builder.mutation<CandidateOnboarding, UpdateCandidateOnboardingRequest>({
      query: (data) => ({
        data,
        method: 'PUT',
        url: API_ENDPOINTS.CANDIDATE.ONBOARDING,
      }),
      transformResponse: (response: ApiResponse<CandidateOnboarding>) => response.data,
      invalidatesTags: ['Onboarding', 'Profile', 'ProfileCompletion'],
    }),

    uploadResume: builder.mutation<ResumeMetadata, File>({
      query: (file) => {
        const data = new FormData();
        data.append('file', file);

        return {
          data,
          method: 'PUT',
          url: API_ENDPOINTS.CANDIDATE.RESUME,
        };
      },
      transformResponse: (response: ApiResponse<ResumeMetadata>) => response.data,
      invalidatesTags: ['Profile', 'Resume', 'ProfileCompletion'],
    }),
    getResumeStatus: builder.query<ResumeStatusResponse, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.RESUME_STATUS }),
      transformResponse: (response: ApiResponse<ResumeStatusResponse>) => response.data,
      providesTags: ['Resume'],
    }),
    getRecommendedJobs: builder.query<
      RecommendedJobsResponse,
      { pageNumber: number; pageSize: number }
    >({
      query: (params) => ({ params, url: API_ENDPOINTS.CANDIDATE.RECOMMENDED_JOBS }),
      transformResponse: (response: ApiResponse<RecommendedJobsResponse>) => response.data,
    }),

    deleteResume: builder.mutation<void, void>({
      query: () => ({
        method: 'DELETE',
        url: API_ENDPOINTS.CANDIDATE.RESUME,
      }),
      invalidatesTags: ['Profile', 'Resume', 'ProfileCompletion'],
    }),

    getMemberships: builder.query<Membership[], void>({
      query: () => ({ url: API_ENDPOINTS.DASHBOARD.MEMBERSHIPS }),
      transformResponse: (response: ApiResponse<Membership[]>) => response.data,
      providesTags: ['Memberships'],
    }),

    getApplicationQuota: builder.query<ApplicationQuota, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.APPLICATION_QUOTA }),
      transformResponse: (response: ApiResponse<ApplicationQuota>) => response.data,
      providesTags: ['ApplicationQuota'],
    }),

    getRecruiterContact: builder.query<CandidateRecruiterContact, string>({
      query: (jobId) => ({
        url: API_ENDPOINTS.CANDIDATE.RECRUITER_CONTACT(jobId),
      }),
      transformResponse: (response: ApiResponse<CandidateRecruiterContact>) => response.data,
      providesTags: (_, __, jobId) => [{ id: jobId, type: 'RecruiterContact' }],
    }),

    getSavedJobs: builder.query<SavedJobsPage, DashboardQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.CANDIDATE.SAVED_JOBS }),
      transformResponse: (response: ApiResponse<SavedJobsPage>) => response.data,
      providesTags: ['SavedJobs'],
    }),

    saveJob: builder.mutation<void, string>({
      query: (jobId) => ({
        method: 'PUT',
        url: API_ENDPOINTS.CANDIDATE.SAVED_JOB(jobId),
      }),
      invalidatesTags: ['SavedJobs'],
    }),

    removeSavedJob: builder.mutation<void, string>({
      query: (jobId) => ({
        method: 'DELETE',
        url: API_ENDPOINTS.CANDIDATE.SAVED_JOB(jobId),
      }),
      invalidatesTags: ['SavedJobs'],
    }),

    getApplications: builder.query<ApplicationsPage, ApplicationsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.CANDIDATE.APPLICATIONS }),
      transformResponse: (response: ApiResponse<ApplicationsPage>) => response.data,
      providesTags: ['Applications'],
    }),

    getApplication: builder.query<JobApplication, string>({
      query: (applicationId) => ({
        url: API_ENDPOINTS.CANDIDATE.APPLICATION(applicationId),
      }),
      transformResponse: (response: ApiResponse<JobApplication>) => response.data,
      providesTags: (_, __, applicationId) => [
        'Applications',
        { id: applicationId, type: 'Applications' },
      ],
    }),

    submitApplication: builder.mutation<ApplyJobResponse, CreateJobApplicationRequest>({
      query: ({ applicationMethod, jobId }) => ({
        data: { applicationMethod },
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.APPLY(jobId),
      }),
      transformResponse: (response: ApiResponse<ApplyJobResponse>) => response.data,
      invalidatesTags: ['Applications', 'ApplicationQuota'],
    }),

    withdrawApplication: builder.mutation<JobApplication, string>({
      query: (applicationId) => ({
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.WITHDRAW_APPLICATION(applicationId),
      }),
      transformResponse: (response: ApiResponse<JobApplication>) => response.data,
      invalidatesTags: (_, __, applicationId) => [
        'Applications',
        { id: applicationId, type: 'Applications' },
      ],
    }),

    getNotifications: builder.query<NotificationPage, NotificationsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.DASHBOARD.NOTIFICATIONS }),
      transformResponse: (response: ApiResponse<NotificationPage>) => response.data,
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        method: 'PUT',
        url: API_ENDPOINTS.DASHBOARD.NOTIFICATION_READ(notificationId),
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        method: 'PUT',
        url: API_ENDPOINTS.DASHBOARD.NOTIFICATIONS_READ_ALL,
      }),
      invalidatesTags: ['Notifications'],
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (data) => ({
        data,
        method: 'POST',
        url: API_ENDPOINTS.DASHBOARD.CHANGE_PASSWORD,
      }),
    }),
  }),
});

export const {
  useAddCandidateSkillMutation,
  useChangePasswordMutation,
  useDeleteCandidateSkillMutation,
  useDeleteResumeMutation,
  useGetApplicationQuery,
  useGetApplicationQuotaQuery,
  useGetApplicationsQuery,
  useGetCandidateSkillsQuery,
  useGetMembershipsQuery,
  useGetOnboardingQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetProfileCompletionQuery,
  useGetRecommendedJobsQuery,
  useGetResumeStatusQuery,
  useGetSavedJobsQuery,
  useLazyGetRecruiterContactQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
  useUpdateOnboardingMutation,
  useUpdateCandidateAboutMutation,
  useUpdateCandidateSkillMutation,
  useUpdateProfileMutation,
  useUploadResumeMutation,
  useWithdrawApplicationMutation,
} = dashboardApi;

export const downloadCandidateResume = async (): Promise<Blob> => {
  const response = await apiClient.request<Blob>({
    method: 'GET',
    responseType: 'blob',
    url: API_ENDPOINTS.CANDIDATE.RESUME,
  });

  return response.data;
};

export const isDashboardApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
