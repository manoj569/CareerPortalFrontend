import { createApi } from '@reduxjs/toolkit/query/react';

import { apiClient } from '@/api/apiClient';
import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types';
import type {
  ApplicationsPage,
  ApplicationsQuery,
  CandidateOnboarding,
  ChangePasswordRequest,
  CreateJobApplicationRequest,
  DashboardQuery,
  JobApplication,
  Membership,
  NotificationPage,
  ResumeMetadata,
  SavedJobsPage,
  UpdateCandidateProfileRequest,
  UpdateCandidateOnboardingRequest,
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
    'Onboarding',
    'Resume',
    'SavedJobs',
    'Applications',
    'Notifications',
    'Memberships',
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
      invalidatesTags: ['Profile'],
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
      invalidatesTags: ['Onboarding', 'Profile'],
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
      invalidatesTags: ['Profile', 'Resume'],
    }),
    deleteResume: builder.mutation<void, void>({
      query: () => ({
        method: 'DELETE',
        url: API_ENDPOINTS.CANDIDATE.RESUME,
      }),
      invalidatesTags: ['Profile', 'Resume'],
    }),
    getMemberships: builder.query<Membership[], void>({
      query: () => ({ url: API_ENDPOINTS.DASHBOARD.MEMBERSHIPS }),
      transformResponse: (response: ApiResponse<Membership[]>) => response.data,
      providesTags: ['Memberships'],
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
    submitApplication: builder.mutation<JobApplication, CreateJobApplicationRequest>({
      query: ({ coverLetter, jobId }) => ({
        data: { coverLetter },
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.APPLY(jobId),
      }),
      transformResponse: (response: ApiResponse<JobApplication>) => response.data,
      invalidatesTags: ['Applications'],
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
  useChangePasswordMutation,
  useDeleteResumeMutation,
  useGetApplicationQuery,
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetOnboardingQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
  useUploadResumeMutation,
  useUpdateProfileMutation,
  useUpdateOnboardingMutation,
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
