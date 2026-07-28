import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { ApplicationAccessStatus } from '../types/jobModels';
import type {
  ApplicationAccessResponse,
  BackendApiResponse,
  PagedResponse,
  PublicJobDetails,
  PublicJobQuery,
  PublicJobSummary,
} from '../types/jobModels';

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    searchJobs: builder.query<PagedResponse<PublicJobSummary>, PublicJobQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.JOBS.SEARCH }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicJobSummary>>) =>
        response.data,
    }),
    getFeaturedJobs: builder.query<PagedResponse<PublicJobSummary>, { pageSize: number }>({
      query: ({ pageSize }) => ({
        params: { pageNumber: 1, pageSize },
        url: API_ENDPOINTS.JOBS.FEATURED,
      }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicJobSummary>>) =>
        response.data,
    }),
    getJobDetails: builder.query<PublicJobDetails, string>({
      query: (slug) => ({ url: API_ENDPOINTS.JOBS.DETAILS(slug) }),
      transformResponse: (response: BackendApiResponse<PublicJobDetails>) => response.data,
    }),
    applyToJob: builder.mutation<ApplicationAccessResponse, string>({
      query: (slug) => ({
        method: 'POST',
        url: API_ENDPOINTS.MEMBERSHIPS.APPLY_TO_JOB(slug),
        validateStatus: (status) => (status >= 200 && status < 300) || status === 402,
      }),
      transformResponse: (response: BackendApiResponse<ApplicationAccessResponse>) => response.data,
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.status === ApplicationAccessStatus.Granted) {
            dispatch(dashboardApi.util.invalidateTags(['Applications']));
          }
        } catch {
          // Failed access checks must not alter candidate application history.
        }
      },
    }),
  }),
});

export const {
  useApplyToJobMutation,
  useGetFeaturedJobsQuery,
  useGetJobDetailsQuery,
  useSearchJobsQuery,
} = jobsApi;

export const isJobsApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
