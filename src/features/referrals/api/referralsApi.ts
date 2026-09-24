import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { BackendApiResponse, PagedResponse } from '@/features/jobs/types/jobModels';
import type {
  ExtractedJobDetails,
  JobReferralSubmission,
  PublicReferralJob,
  ReferralUnlockResult,
  SubmitJobReferralRequest,
  ReferralCategoryOption,
} from '../types/referralModels';

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['MyReferrals'],
  endpoints: (builder) => ({
    getPublicReferralJobs: builder.query<
      PagedResponse<PublicReferralJob>,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        params: { pageNumber, pageSize },
        url: API_ENDPOINTS.REFERRALS.PUBLIC,
      }),
      transformResponse: (response: BackendApiResponse<PagedResponse<PublicReferralJob & { id?: string; title?: string }>>) => ({
        ...response.data,
        items: response.data.items.map((job) => ({
          ...job,
          jobId: job.jobId ?? job.id ?? '',
          jobTitle: job.jobTitle ?? job.title ?? '',
        })),
      }),
    }),
    getReferralCategoryOptions: builder.query<ReferralCategoryOption[], void>({
      query: () => ({ url: API_ENDPOINTS.CATEGORIES.OPTIONS }),
      transformResponse: (response: BackendApiResponse<ReferralCategoryOption[]>) => response.data,
    }),
    extractJobFromUrl: builder.mutation<ExtractedJobDetails, string>({
      query: (url) => ({
        data: { url },
        method: 'post',
        url: API_ENDPOINTS.REFERRALS.EXTRACT_FROM_URL,
      }),
      transformResponse: (response: BackendApiResponse<ExtractedJobDetails>) => response.data,
    }),
    submitJobReferral: builder.mutation<JobReferralSubmission, SubmitJobReferralRequest>({
      invalidatesTags: ['MyReferrals'],
      query: (body) => ({ data: body, method: 'post', url: API_ENDPOINTS.REFERRALS.SUBMIT }),
      transformResponse: (response: BackendApiResponse<JobReferralSubmission>) => response.data,
    }),
 getMyReferrals: builder.query<
  PagedResponse<JobReferralSubmission>,
  {
    search?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }
>({
  providesTags: ['MyReferrals'],
  query: ({
    search,
    status,
    pageNumber = 1,
    pageSize = 10,
  }) => ({
    params: {
      ...(search?.trim() ? { search: search.trim() } : {}),
      ...(status ? { status } : {}),
      pageNumber,
      pageSize,
    },
    url: API_ENDPOINTS.REFERRALS.MINE,
  }),
  transformResponse: (
    response: BackendApiResponse<PagedResponse<JobReferralSubmission>>,
  ) => response.data,
}),
    unlockReferralContact: builder.query<ReferralUnlockResult, string>({
      query: (jobId) => ({ url: API_ENDPOINTS.REFERRALS.UNLOCK(jobId) }),
      transformResponse: (response: BackendApiResponse<ReferralUnlockResult>) => response.data,
    }),
  }),
});

export const {
  useGetPublicReferralJobsQuery,
  useGetReferralCategoryOptionsQuery,
  useExtractJobFromUrlMutation,
  useSubmitJobReferralMutation,
  useGetMyReferralsQuery,
  useLazyUnlockReferralContactQuery,
} = referralsApi;
