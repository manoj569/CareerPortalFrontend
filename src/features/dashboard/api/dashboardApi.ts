import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types';
import type {
  ApplicationsPage,
  ChangePasswordRequest,
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

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 120,
  tagTypes: ['Profile', 'SavedJobs', 'Applications', 'Notifications', 'Memberships'],
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
    getSavedJobs: builder.query<SavedJobsPage, DashboardQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.DASHBOARD.SAVED_JOBS }),
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
      query: (params) => ({ params, url: API_ENDPOINTS.DASHBOARD.APPLIED_JOBS }),
      transformResponse: (response: ApiResponse<ApplicationsPage>) => response.data,
      providesTags: ['Applications'],
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
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
  useUpdateProfileMutation,
} = dashboardApi;

export const isDashboardApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
