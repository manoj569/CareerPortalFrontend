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
  UpdateReferralContactRequest,
} from '../types/referralModels';

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['MyReferrals', 'Marketplace', 'PublicReferrals'],
  endpoints: (builder) => ({
    updateReferralContact: builder.mutation<
      JobReferralSubmission,
      { id: string; body: UpdateReferralContactRequest }
    >({
      query: ({ id, body }) => ({
        url: `/referrals/${encodeURIComponent(id)}/contact-preferences`,
        method: 'put',
        data: body,
      }),
      transformResponse: (response: BackendApiResponse<JobReferralSubmission>) => response.data,
      invalidatesTags: ['MyReferrals', 'Marketplace', 'PublicReferrals'],
    }),
    getPublicReferralJobs: builder.query<
      PagedResponse<PublicReferralJob>,
      { pageNumber: number; pageSize: number }
    >({
      providesTags: ['PublicReferrals'],
      query: ({ pageNumber, pageSize }) => ({
        params: { pageNumber, pageSize },
        url: API_ENDPOINTS.REFERRALS.PUBLIC,
      }),
      transformResponse: (
        response: BackendApiResponse<
          PagedResponse<PublicReferralJob & { id?: string; title?: string }>
        >,
      ) => ({
        ...response.data,
        items: response.data.items.map((job) => ({
          companyName: job.companyName,
          location: job.location,
          referrerLabel: job.referrerLabel,
          referralId: job.referralId,
          companyId: job.companyId,
          companyLogoUrl: job.companyLogoUrl,
          companyIsVerified: job.companyIsVerified,
          jobSlug: job.jobSlug,
          applicationUrl: job.applicationUrl,
          employmentType: job.employmentType,
          workplaceType: job.workplaceType,
          minimumExperienceYears: job.minimumExperienceYears,
          maximumExperienceYears: job.maximumExperienceYears,
          skills: job.skills,
          referralAvailable: job.referralAvailable,
          referralSlots: job.referralSlots,
          acceptedReferralCount: job.acceptedReferralCount,
          remainingReferralSlots: job.remainingReferralSlots,
          contactAccessStatus: job.contactAccessStatus,
          canViewReferrerContact: job.canViewReferrerContact,
          isContactLocked: job.isContactLocked,
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
      invalidatesTags: ['MyReferrals', 'Marketplace', 'PublicReferrals'],
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
      query: ({ search, status, pageNumber = 1, pageSize = 10 }) => ({
        params: {
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(status ? { status } : {}),
          pageNumber,
          pageSize,
        },
        url: API_ENDPOINTS.REFERRALS.MINE,
      }),
      transformResponse: (response: BackendApiResponse<PagedResponse<JobReferralSubmission>>) =>
        response.data,
    }),
    unlockReferralContact: builder.query<ReferralUnlockResult, string>({
      keepUnusedDataFor: 0,
      query: (jobId) => ({
        url: API_ENDPOINTS.REFERRALS.UNLOCK(jobId),
      }),

      transformResponse: (
        response: BackendApiResponse<
          Omit<ReferralUnlockResult, 'status'> & {
            status: ReferralUnlockResult['status'] | number;
          }
        >,
      ): ReferralUnlockResult => {
        const raw = response.data;

        const status =
          raw.status === 1 || raw.status === 'Granted'
            ? 'Granted'
            : raw.status === 2 || raw.status === 'LoginRequired'
              ? 'LoginRequired'
              : raw.status === 3 || raw.status === 'MembershipRequired'
                ? 'MembershipRequired'
                : 'RequestRequired';

        return {
          ...raw,
          status,
          contact: status === 'Granted' ? raw.contact : null,
        };
      },
    }),
  }),
});

export const {
  useUpdateReferralContactMutation,
  useGetPublicReferralJobsQuery,
  useGetReferralCategoryOptionsQuery,
  useExtractJobFromUrlMutation,
  useSubmitJobReferralMutation,
  useGetMyReferralsQuery,
  useLazyUnlockReferralContactQuery,
} = referralsApi;
