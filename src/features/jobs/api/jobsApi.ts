import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type {
  ApplicationAccessResponse,
  BackendApiResponse,
  PagedResponse,
  PopularCompany,
  PublicJobDetails,
  PublicJobQuery,
  PublicJobSummary,
} from '../types/jobModels';

interface JobPreviewQuery {
  pageSize: number;
}

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
    getFeaturedJobs: builder.query<PagedResponse<PublicJobSummary>, JobPreviewQuery>({
      query: ({ pageSize }) => ({
        params: { pageNumber: 1, pageSize },
        url: API_ENDPOINTS.JOBS.FEATURED,
      }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicJobSummary>>) =>
        response.data,
    }),
    getLatestJobs: builder.query<PagedResponse<PublicJobSummary>, JobPreviewQuery>({
      query: ({ pageSize }) => ({
        params: { pageNumber: 1, pageSize },
        url: API_ENDPOINTS.JOBS.LATEST,
      }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicJobSummary>>) =>
        response.data,
    }),
    getNewestJobs: builder.query<PagedResponse<PublicJobSummary>, JobPreviewQuery>({
      query: ({ pageSize }) => ({
        params: { pageNumber: 1, pageSize },
        url: API_ENDPOINTS.JOBS.NEWEST,
      }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicJobSummary>>) =>
        response.data,
    }),
    getPopularCompanies: builder.query<PopularCompany[], { limit: number }>({
      query: ({ limit }) => ({
        params: { limit },
        url: API_ENDPOINTS.JOBS.POPULAR_COMPANIES,
      }),
      transformResponse: (response: BackendApiResponse<PopularCompany[]>) => response.data,
    }),
    getJobDetails: builder.query<PublicJobDetails, string>({
      query: (slug) => ({ url: API_ENDPOINTS.JOBS.DETAILS(slug) }),
      transformResponse: (response: BackendApiResponse<PublicJobDetails>) => response.data,
    }),
    getRelatedJobs: builder.query<PublicJobSummary[], { limit: number; slug: string }>({
      query: ({ limit, slug }) => ({
        params: { limit },
        url: API_ENDPOINTS.JOBS.RELATED(slug),
      }),
      transformResponse: (response: BackendApiResponse<PublicJobSummary[]>) => response.data,
    }),
    applyToJob: builder.mutation<ApplicationAccessResponse, string>({
      query: (slug) => ({
        method: 'POST',
        url: API_ENDPOINTS.MEMBERSHIPS.APPLY_TO_JOB(slug),
        validateStatus: (status) => (status >= 200 && status < 300) || status === 402,
      }),
      transformResponse: (response: BackendApiResponse<ApplicationAccessResponse>) => response.data,
    }),
  }),
});

export const {
  useApplyToJobMutation,
  useGetFeaturedJobsQuery,
  useGetJobDetailsQuery,
  useGetLatestJobsQuery,
  useGetNewestJobsQuery,
  useGetPopularCompaniesQuery,
  useGetRelatedJobsQuery,
  useSearchJobsQuery,
} = jobsApi;

export const isJobsApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
