import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { jobsApi } from '@/features/jobs/api/jobsApi';
import type { ApiResponse } from '@/types';
import type {
  AdminChartsQuery,
  AdminDashboardCharts,
  AdminDashboardStatistics,
  AdminJob,
  AdminJobRequest,
  AdminJobsPage,
  AdminJobsQuery,
  RecentAdminPayment,
  RecentAdminUser,
  SetAdminJobFlagArgs,
  UpdateAdminJobArgs,
} from '../types/adminModels';

const refreshPublicJobs = async (
  queryFulfilled: Promise<unknown>,
  dispatch: (
    action:
      | ReturnType<typeof jobsApi.util.resetApiState>
      | ReturnType<typeof dashboardApi.util.invalidateTags>,
  ) => void,
) => {
  try {
    await queryFulfilled;
    dispatch(jobsApi.util.resetApiState());
    dispatch(dashboardApi.util.invalidateTags(['SavedJobs', 'Applications']));
  } catch {
    // The mutation result exposes the backend error; public caches remain untouched.
  }
};

const rawAdminBaseQuery = axiosBaseQuery();
const adminBaseQuery: typeof rawAdminBaseQuery = async (args, api) => {
  const result = await rawAdminBaseQuery(args, api);
  if (result.error?.status === 401 || result.error?.status === 403) {
    api.dispatch(sessionExpired());
  }
  return result;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  keepUnusedDataFor: 60,
  tagTypes: ['Statistics', 'Charts', 'RecentPayments', 'RecentUsers', 'AdminJobs'],
  endpoints: (builder) => ({
    getAdminStatistics: builder.query<AdminDashboardStatistics, void>({
      query: () => ({ url: API_ENDPOINTS.ADMIN.DASHBOARD_STATISTICS }),
      transformResponse: (response: ApiResponse<AdminDashboardStatistics>) => response.data,
      providesTags: ['Statistics'],
    }),
    getAdminRecentPayments: builder.query<RecentAdminPayment[], number>({
      query: (limit) => ({
        params: { limit },
        url: API_ENDPOINTS.ADMIN.DASHBOARD_RECENT_PAYMENTS,
      }),
      transformResponse: (response: ApiResponse<RecentAdminPayment[]>) => response.data,
      providesTags: ['RecentPayments'],
    }),
    getAdminRecentUsers: builder.query<RecentAdminUser[], number>({
      query: (limit) => ({
        params: { limit },
        url: API_ENDPOINTS.ADMIN.DASHBOARD_RECENT_USERS,
      }),
      transformResponse: (response: ApiResponse<RecentAdminUser[]>) => response.data,
      providesTags: ['RecentUsers'],
    }),
    getAdminCharts: builder.query<AdminDashboardCharts, AdminChartsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.DASHBOARD_CHARTS }),
      transformResponse: (response: ApiResponse<AdminDashboardCharts>) => response.data,
      providesTags: ['Charts'],
    }),
    getAdminJobs: builder.query<AdminJobsPage, AdminJobsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.JOBS }),
      transformResponse: (response: ApiResponse<AdminJobsPage>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((job) => ({ id: job.id, type: 'AdminJobs' as const })),
              { id: 'LIST', type: 'AdminJobs' as const },
            ]
          : [{ id: 'LIST', type: 'AdminJobs' as const }],
    }),
    getAdminJob: builder.query<AdminJob, string>({
      query: (jobId) => ({ url: API_ENDPOINTS.ADMIN.JOB(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      providesTags: (_, __, jobId) => [{ id: jobId, type: 'AdminJobs' }],
    }),
    createAdminJob: builder.mutation<AdminJob, AdminJobRequest>({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.ADMIN.JOBS }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: ['Statistics', 'Charts', { id: 'LIST', type: 'AdminJobs' }],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    updateAdminJob: builder.mutation<AdminJob, UpdateAdminJobArgs>({
      query: ({ jobId, request }) => ({
        data: request,
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    publishAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_PUBLISH(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    archiveAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_ARCHIVE(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    setAdminJobFeatured: builder.mutation<AdminJob, SetAdminJobFlagArgs>({
      query: ({ jobId, value }) => ({
        data: { value },
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB_FEATURED(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    setAdminJobHidden: builder.mutation<AdminJob, SetAdminJobFlagArgs>({
      query: ({ jobId, value }) => ({
        data: { value },
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB_HIDDEN(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    softDeleteAdminJob: builder.mutation<void, string>({
      query: (jobId) => ({ method: 'DELETE', url: API_ENDPOINTS.ADMIN.JOB(jobId) }),
      invalidatesTags: ['Statistics', 'Charts', { id: 'LIST', type: 'AdminJobs' }],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
  }),
});

export const {
  useArchiveAdminJobMutation,
  useCreateAdminJobMutation,
  useGetAdminChartsQuery,
  useGetAdminJobQuery,
  useGetAdminJobsQuery,
  useGetAdminRecentPaymentsQuery,
  useGetAdminRecentUsersQuery,
  useGetAdminStatisticsQuery,
  usePublishAdminJobMutation,
  useSetAdminJobFeaturedMutation,
  useSetAdminJobHiddenMutation,
  useSoftDeleteAdminJobMutation,
  useUpdateAdminJobMutation,
} = adminApi;

export const isAdminApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
