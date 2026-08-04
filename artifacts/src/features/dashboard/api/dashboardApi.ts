import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types';
import type {
  ApplicationQuota,
  ApplicationsPage,
  CandidateRecruiterContact,
  ChangePasswordRequest,
  CreateJobApplicationRequest,
  DashboardQuery,
  Membership,
  NotificationPage,
  SavedJobsPage,
  UpdateUserProfileRequest,
  UserProfile,
} from '../types/dashboardModels';

interface NotificationsQuery extends DashboardQuery {
  isRead?: boolean;
}

// Define the exact flat error structure returned by your backend
export interface DashboardApiError {
  success?: boolean;
  code: string;
  message: string;
  redirectToMembership?: boolean;
}

// Safe Type Guard without using 'any'
export const isDashboardApiError = (error: unknown): error is DashboardApiError => {
  if (!error || typeof error !== 'object') return false;
  
  const potentialError = error as Partial<DashboardApiError>;
  return (
    typeof potentialError.redirectToMembership === 'boolean' || 
    typeof potentialError.message === 'string'
  );
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 120,
  tagTypes: [
    'Profile',
    'SavedJobs',
    'Applications',
    'Notifications',
    'Memberships',
    'ApplicationQuota',
    'RecruiterContact',
  ],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ({ url: API_ENDPOINTS.DASHBOARD.PROFILE }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data,
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<UserProfile, UpdateUserProfileRequest>({
      query: (data) => ({
        data,
        method: 'PUT',
        url: API_ENDPOINTS.DASHBOARD.PROFILE,
      }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data,
      invalidatesTags: ['Profile'],
    }),

    getMemberships: builder.query<Membership[], void>({
      query: () => ({ url: API_ENDPOINTS.DASHBOARD.MEMBERSHIPS }),
      transformResponse: (response: ApiResponse<Membership[]>) => response.data,
      providesTags: ['Memberships'],
    }),

    getApplicationQuota: builder.query<ApplicationQuota, void>({
      query: () => ({
        url: API_ENDPOINTS.CANDIDATE.APPLICATION_QUOTA,
      }),
      transformResponse: (response: ApiResponse<ApplicationQuota>) => response.data,
      providesTags: ['ApplicationQuota'],
    }),

    getRecruiterContact: builder.query<CandidateRecruiterContact, string>({
      query: (jobId) => ({
        url: API_ENDPOINTS.CANDIDATE.RECRUITER_CONTACT(jobId),
      }),
      transformResponse: (response: ApiResponse<CandidateRecruiterContact>) => response.data,
      providesTags: (_result, _error, jobId) => [
        { type: 'RecruiterContact', id: jobId },
      ],
    }),

    getSavedJobs: builder.query<SavedJobsPage, DashboardQuery>({
      query: (params) => ({
        params,
        url: API_ENDPOINTS.DASHBOARD.SAVED_JOBS,
      }),
      transformResponse: (response: ApiResponse<SavedJobsPage>) => response.data,
      providesTags: ['SavedJobs'],
    }),

    saveJob: builder.mutation<void, string>({
      query: (jobId) => ({
        method: 'PUT',
        url: API_ENDPOINTS.DASHBOARD.SAVED_JOB(jobId),
      }),
      invalidatesTags: ['SavedJobs'],
    }),

    removeSavedJob: builder.mutation<void, string>({
      query: (jobId) => ({
        method: 'DELETE',
        url: API_ENDPOINTS.DASHBOARD.SAVED_JOB(jobId),
      }),
      invalidatesTags: ['SavedJobs'],
    }),

    getApplications: builder.query<ApplicationsPage, DashboardQuery>({
      query: (params) => ({
        params,
        url: API_ENDPOINTS.DASHBOARD.APPLIED_JOBS,
      }),
      transformResponse: (response: ApiResponse<ApplicationsPage>) => response.data,
      providesTags: ['Applications'],
    }),

    // ✅ FINAL FIX: Simply return response. It already matches DashboardApiError natively.
    submitApplication: builder.mutation<void, CreateJobApplicationRequest>({
      query: ({ coverLetter, jobId }) => ({
        data: { coverLetter },
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.APPLY(jobId),
      }),
      invalidatesTags: ['Applications', 'ApplicationQuota'],
      transformErrorResponse: (response) => {
        return response; // TypeScript infers this correctly now
      },
    }),

    getNotifications: builder.query<NotificationPage, NotificationsQuery>({
      query: (params) => ({
        params,
        url: API_ENDPOINTS.DASHBOARD.NOTIFICATIONS,
      }),
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
  useGetApplicationQuotaQuery,
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
  useLazyGetRecruiterContactQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useSubmitApplicationMutation,
  useUpdateProfileMutation,
} = dashboardApi;