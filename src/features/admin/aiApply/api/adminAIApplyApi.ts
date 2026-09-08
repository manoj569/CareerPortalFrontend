import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api';
import type {
  AdminAIApplyApplicationsPage,
  AdminAIApplyApplicationsQuery,
  AdminAIApplyCircuitResponse,
  AdminAIApplyCosts,
  AdminAIApplyFailure,
  AdminAIApplyOverview,
  AdminAIApplyPeriodQuery,
  AdminAIApplyRequeueResponse,
  AdminAIApplySite,
  AdminAIApplySiteStatus,
  AdminAIApplyWorker,
} from '../types/adminAIApplyModels';

export const adminAIApplyApi = createApi({
  reducerPath: 'adminAIApplyApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Overview', 'Applications', 'Failures', 'Sites', 'Workers', 'Costs'],
  endpoints: (builder) => ({
    getAdminAIApplyOverview: builder.query<AdminAIApplyOverview, AdminAIApplyPeriodQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.AI_APPLY.OVERVIEW }),
      transformResponse: (response: ApiResponse<AdminAIApplyOverview>) => response.data,
      providesTags: ['Overview'],
    }),
    getAdminAIApplyApplications: builder.query<
      AdminAIApplyApplicationsPage,
      AdminAIApplyApplicationsQuery
    >({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.AI_APPLY.APPLICATIONS }),
      transformResponse: (response: ApiResponse<AdminAIApplyApplicationsPage>) => response.data,
      providesTags: ['Applications'],
    }),
    getAdminAIApplyFailures: builder.query<AdminAIApplyFailure[], AdminAIApplyPeriodQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.AI_APPLY.FAILURES }),
      transformResponse: (response: ApiResponse<AdminAIApplyFailure[]>) => response.data,
      providesTags: ['Failures'],
    }),
    getAdminAIApplySites: builder.query<AdminAIApplySiteStatus[], void>({
      query: () => ({ url: API_ENDPOINTS.ADMIN.AI_APPLY.SITES }),
      transformResponse: (response: ApiResponse<AdminAIApplySiteStatus[]>) => response.data,
      providesTags: ['Sites'],
    }),
    getAdminAIApplyWorkers: builder.query<AdminAIApplyWorker[], void>({
      query: () => ({ url: API_ENDPOINTS.ADMIN.AI_APPLY.WORKERS }),
      transformResponse: (response: ApiResponse<AdminAIApplyWorker[]>) => response.data,
      providesTags: ['Workers'],
    }),
    getAdminAIApplyCosts: builder.query<AdminAIApplyCosts, AdminAIApplyPeriodQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.AI_APPLY.COSTS }),
      transformResponse: (response: ApiResponse<AdminAIApplyCosts>) => response.data,
      providesTags: ['Costs'],
    }),
    requeueAdminAIApplyApplication: builder.mutation<AdminAIApplyRequeueResponse, string>({
      query: (id) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.AI_APPLY.REQUEUE(id) }),
      transformResponse: (response: ApiResponse<AdminAIApplyRequeueResponse>) => response.data,
      invalidatesTags: ['Overview', 'Applications', 'Failures', 'Workers'],
    }),
    openAdminAIApplySite: builder.mutation<AdminAIApplyCircuitResponse, AdminAIApplySite>({
      query: (site) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.AI_APPLY.OPEN_SITE(site) }),
      transformResponse: (response: ApiResponse<AdminAIApplyCircuitResponse>) => response.data,
      invalidatesTags: ['Overview', 'Sites'],
    }),
    closeAdminAIApplySite: builder.mutation<AdminAIApplyCircuitResponse, AdminAIApplySite>({
      query: (site) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.AI_APPLY.CLOSE_SITE(site) }),
      transformResponse: (response: ApiResponse<AdminAIApplyCircuitResponse>) => response.data,
      invalidatesTags: ['Overview', 'Sites'],
    }),
  }),
});

export const isAdminAIApplyApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);

export const {
  useCloseAdminAIApplySiteMutation,
  useGetAdminAIApplyApplicationsQuery,
  useGetAdminAIApplyCostsQuery,
  useGetAdminAIApplyFailuresQuery,
  useGetAdminAIApplyOverviewQuery,
  useGetAdminAIApplySitesQuery,
  useGetAdminAIApplyWorkersQuery,
  useOpenAdminAIApplySiteMutation,
  useRequeueAdminAIApplyApplicationMutation,
} = adminAIApplyApi;
