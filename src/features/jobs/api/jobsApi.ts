import { createApi } from '@reduxjs/toolkit/query/react';

import { apiClient } from '@/api/apiClient';
import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type {
  ApplicationAccessResponse,
  BackendApiResponse,
  PagedResponse,
  PopularCompany,
  PublicJobFilterOptions,
  PublicJobDetails,
  PublicJobQuery,
  PublicJobSummary,
  SupplementalJobFilterCounts,
} from '../types/jobModels';

interface JobPreviewQuery {
  pageSize: number;
}

export const toJobApiSearchParams = (query: PublicJobQuery): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    params.set(key, String(value));
  });

  return params;
};

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    searchJobs: builder.query<PagedResponse<PublicJobSummary>, PublicJobQuery>({
      query: (query) => ({ params: toJobApiSearchParams(query), url: API_ENDPOINTS.JOBS.SEARCH }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicJobSummary>>) =>
        response.data,
    }),
    getJobFilterOptions: builder.query<PublicJobFilterOptions, PublicJobQuery>({
      query: (query) => ({
        params: toJobApiSearchParams(query),
        url: API_ENDPOINTS.JOBS.FILTER_OPTIONS,
      }),
      transformResponse: (response: BackendApiResponse<PublicJobFilterOptions>) => response.data,
    }),
    getSupplementalJobFilterCounts: builder.query<SupplementalJobFilterCounts, PublicJobQuery>({
      queryFn: async (query, _api, _extraOptions, baseQuery) => {
        const baseQueryParameters: PublicJobQuery = {
          ...query,
          featuredOnly: undefined,
          freshnessDays: undefined,
          isFeatured: undefined,
          pageNumber: 1,
          pageSize: 1,
        };
        const freshnessDays = [1, 3, 7, 15, 30] as const;
        const requests = [
          ...freshnessDays.map((days) => ({ ...baseQueryParameters, freshnessDays: days })),
          { ...baseQueryParameters, featuredOnly: true },
        ];
        const responses = await Promise.all(
          requests.map((request) =>
            baseQuery({
              params: toJobApiSearchParams(request),
              url: API_ENDPOINTS.JOBS.SEARCH,
            }),
          ),
        );
        const failedResponse = responses.find((response) => response.error);
        if (failedResponse?.error) return { error: failedResponse.error };

        const readTotalCount = (value: unknown): number | null => {
          if (!value || typeof value !== 'object' || !('data' in value)) return null;
          const data = value.data;
          if (!data || typeof data !== 'object' || !('totalCount' in data)) return null;
          return typeof data.totalCount === 'number' ? data.totalCount : null;
        };
        const counts = responses.map((response) => readTotalCount(response.data));
        if (counts.some((count) => count === null)) {
          // ✅ FIX: Added 'redirectToMembership: false' to satisfy the strict type check
          return {
            error: {
              code: undefined,
              errors: undefined,
              message: 'The job filter counts response was invalid.',
              redirectToMembership: false,
              retryAfterSeconds: undefined,
              status: undefined,
            },
          };
        }

        return {
          data: {
            featured: counts[5] ?? 0,
            freshness: {
              1: counts[0] ?? 0,
              3: counts[1] ?? 0,
              7: counts[2] ?? 0,
              15: counts[3] ?? 0,
              30: counts[4] ?? 0,
            },
          },
        };
      },
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
  useGetFeaturedJobsQuery,
  useGetJobFilterOptionsQuery,
  useGetSupplementalJobFilterCountsQuery,
  useGetJobDetailsQuery,
  useGetLatestJobsQuery,
  useGetNewestJobsQuery,
  useGetPopularCompaniesQuery,
  useGetRelatedJobsQuery,
  useSearchJobsQuery,
} = jobsApi;

export const isJobsApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);

export const fetchJobApplicationUrl = async (slug: string): Promise<string | null> => {
  const response = await apiClient.get<BackendApiResponse<PublicJobDetails>>(
    API_ENDPOINTS.JOBS.DETAILS(slug),
  );
  return response.data.data.applicationUrl ?? null;
};
