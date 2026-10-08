import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';
import type { BackendApiResponse, PagedResponse } from '@/features/jobs/types/jobModels';
import { referralsApi } from './referralsApi';
import type {
  ReferralMetrics,
  ReferrerRequestRecord,
  ReferralRequestRecord,
  ReferralQuota,
} from '../types/marketplaceModels';
import type {
  JobReferralSubmission,
  ReferrerContactDetails,
  PublicReferralJob,
} from '../types/referralModels';
import { jobsApi } from '@/features/jobs/api/jobsApi';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { SavedJob } from '@/features/dashboard/types/dashboardModels';
const unwrap = <T>(response: BackendApiResponse<T>) => response.data;
const loadError = (message: string) => ({
  message,
  code: undefined,
  errors: undefined,
  status: undefined,
  redirectToMembership: undefined,
  retryAfterSeconds: undefined,
});
const tags = ['Marketplace', 'MyReferrals', 'PublicReferrals'] as const;
const refreshNotifications = async (
  _: unknown,
  {
    dispatch,
    queryFulfilled,
  }: { dispatch: BaseQueryApi['dispatch']; queryFulfilled: Promise<unknown> },
) => {
  try {
    await queryFulfilled;
  } catch {
    return;
  }
  dispatch(dashboardApi.util.invalidateTags(['Notifications']));
};
export const marketplaceApi = referralsApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferralSavedJobs: builder.query<SavedJob[], void>({
      keepUnusedDataFor: 0,
      async queryFn(_, api, _extra, baseQuery) {
        const items: SavedJob[] = [];
        for (let pageNumber = 1; !api.signal.aborted; pageNumber++) {
          const result = await baseQuery({
            url: API_ENDPOINTS.CANDIDATE.SAVED_JOBS,
            params: { pageNumber, pageSize: 100 },
          });
          if (result.error) return { error: result.error };
          const page = (result.data as BackendApiResponse<PagedResponse<SavedJob>>).data;
          items.push(...page.items.map((item) => ({ ...item })));
          if (items.length >= page.totalCount) return { data: items };
          if (!page.items.length)
            return { error: loadError('Saved jobs changed. Please refresh.') };
        }
        return { error: loadError('Request cancelled.') };
      },
    }),
    getReferralCatalogue: builder.query<(PublicReferralJob & { categoryName?: string })[], void>({
      providesTags: ['PublicReferrals'],
      async queryFn(_, api, _extra, baseQuery) {
        const items: (PublicReferralJob & { categoryName?: string })[] = [];
        for (let pageNumber = 1; !api.signal.aborted; pageNumber++) {
          const result = await baseQuery({
            url: '/referrals/public',
            params: { pageNumber, pageSize: 100 },
          });
          if (result.error) return { error: result.error };
          const page = (result.data as BackendApiResponse<PagedResponse<PublicReferralJob>>).data;
          items.push(...page.items.map((item) => ({ ...item })));
          if (items.length >= page.totalCount) break;
          if (!page.items.length)
            return { error: loadError('Referral catalogue changed. Please refresh.') };
        }
        if (api.signal.aborted) return { error: loadError('Request cancelled.') };
        // Share the existing public details cache, including in-flight requests from job pages.
        // One published job may have several referral opportunities. Refresh metadata after
        // 120 seconds; capacity always comes from the fresh referral listing.
        const groups = new Map<string, typeof items>();
        for (const job of items) {
          if (!job.jobSlug) continue;
          const group = groups.get(job.jobSlug) ?? [];
          group.push(job);
          groups.set(job.jobSlug, group);
        }
        const entries = [...groups.entries()];
        let next = 0;
        await Promise.all(
          Array.from({ length: Math.min(4, entries.length) }, async () => {
            while (next < entries.length && !api.signal.aborted) {
              const [slug, group] = entries[next++]!;
              try {
                const details = await api
                  .dispatch(
                    jobsApi.endpoints.getJobDetails.initiate(slug, {
                      subscribe: false,
                      forceRefetch: 120,
                    }),
                  )
                  .unwrap();
                for (const job of group)
                  if (details.id === job.jobId) job.categoryName = details.categoryName;
              } catch {
                // Unavailable metadata remains unknown; referral jobs stay visible.
              }
            }
          }),
        );
        if (api.signal.aborted) return { error: loadError('Request cancelled.') };
        return { data: items };
      },
    }),
    getCandidateActivity: builder.query<
      { items: ReferralRequestRecord[]; quota: ReferralQuota },
      void
    >({
      providesTags: ['Marketplace'],
      keepUnusedDataFor: 0,
      async queryFn(_, api, _extra, baseQuery) {
        const items: ReferralRequestRecord[] = [];
        for (let pageNumber = 1; !api.signal.aborted; pageNumber++) {
          const result = await baseQuery({
            url: '/referral-requests/mine',
            params: { pageNumber, pageSize: 100 },
          });
          if (result.error) return { error: result.error };
          const page = (
            result.data as BackendApiResponse<{
              requests: PagedResponse<ReferralRequestRecord>;
              quota: ReferralQuota;
            }>
          ).data;
          items.push(...page.requests.items);
          if (items.length >= page.requests.totalCount)
            return { data: { items, quota: page.quota } };
          if (!page.requests.items.length)
            return { error: loadError('Request list changed. Please refresh.') };
        }
        return { error: loadError('Request cancelled.') };
      },
    }),
    getReferralMetrics: builder.query<ReferralMetrics, void>({
      query: () => ({ url: '/referrer/metrics' }),
      transformResponse: unwrap<ReferralMetrics>,
      providesTags: ['Marketplace'],
    }),
    // The backend has no opportunity-scoped inbox. Fetch every authorized page before deriving scoped counts.
    getReferrerInbox: builder.query<ReferrerRequestRecord[], void>({
      keepUnusedDataFor: 0,
      providesTags: ['Marketplace'],
      async queryFn(_, api, _extra, baseQuery) {
        const items: ReferrerRequestRecord[] = [];
        for (let pageNumber = 1; !api.signal.aborted; pageNumber++) {
          const result = await baseQuery({
            url: '/referrer/referral-requests',
            params: { pageNumber, pageSize: 100 },
          });
          if (result.error) return { error: result.error };
          const page = (result.data as BackendApiResponse<PagedResponse<ReferrerRequestRecord>>)
            .data;
          items.push(...page.items);
          if (items.length >= page.totalCount) return { data: items };
          if (!page.items.length)
            return {
              error: {
                code: undefined,
                errors: undefined,
                redirectToMembership: undefined,
                retryAfterSeconds: undefined,
                status: undefined,
                message: 'The request list changed while loading. Please refresh.',
              },
            };
        }
        return {
          error: {
            code: undefined,
            errors: undefined,
            redirectToMembership: undefined,
            retryAfterSeconds: undefined,
            status: undefined,
            message: 'Request cancelled.',
          },
        };
      },
    }),
    getOwnedOpportunities: builder.query<JobReferralSubmission[], void>({
      providesTags: ['MyReferrals'],
      async queryFn(_, api, _extra, baseQuery) {
        const items: JobReferralSubmission[] = [];
        for (let pageNumber = 1; !api.signal.aborted; pageNumber++) {
          const result = await baseQuery({
            url: '/referrals/mine',
            params: { pageNumber, pageSize: 50 },
          });
          if (result.error) return { error: result.error };
          const page = (result.data as BackendApiResponse<PagedResponse<JobReferralSubmission>>)
            .data;
          items.push(...page.items);
          if (items.length >= page.totalCount) return { data: items };
          if (!page.items.length)
            return {
              error: {
                code: undefined,
                errors: undefined,
                redirectToMembership: undefined,
                retryAfterSeconds: undefined,
                status: undefined,
                message: 'The opportunity list changed while loading. Please refresh.',
              },
            };
        }
        return {
          error: {
            code: undefined,
            errors: undefined,
            redirectToMembership: undefined,
            retryAfterSeconds: undefined,
            status: undefined,
            message: 'Request cancelled.',
          },
        };
      },
    }),
    getReferrerRequest: builder.query<ReferrerRequestRecord, string>({
      query: (id) => ({ url: `/referrer/referral-requests/${encodeURIComponent(id)}` }),
      transformResponse: unwrap<ReferrerRequestRecord>,
      providesTags: ['Marketplace'],
      keepUnusedDataFor: 0,
    }),
    acceptReferralRequest: builder.mutation<ReferrerRequestRecord, string>({
      query: (id) => ({
        url: `/referrer/referral-requests/${encodeURIComponent(id)}/accept`,
        method: 'post',
      }),
      transformResponse: unwrap<ReferrerRequestRecord>,
      invalidatesTags: tags,
      onQueryStarted: refreshNotifications,
    }),
    rejectReferralRequest: builder.mutation<ReferrerRequestRecord, string>({
      query: (id) => ({
        url: `/referrer/referral-requests/${encodeURIComponent(id)}/reject`,
        method: 'post',
        data: { reason: null },
      }),
      transformResponse: unwrap<ReferrerRequestRecord>,
      invalidatesTags: tags,
      onQueryStarted: refreshNotifications,
    }),
    markReferralSubmitted: builder.mutation<ReferrerRequestRecord, string>({
      query: (id) => ({
        url: `/referrer/referral-requests/${encodeURIComponent(id)}/mark-referred`,
        method: 'post',
        data: { referralSubmissionReference: null },
      }),
      transformResponse: unwrap<ReferrerRequestRecord>,
      invalidatesTags: tags,
      onQueryStarted: refreshNotifications,
    }),
    createReferralRequest: builder.mutation<
      ReferralRequestRecord,
      { referralId: string; candidateMessage: string }
    >({
      query: ({ referralId, candidateMessage }) => ({
        url: `/referrals/${encodeURIComponent(referralId)}/requests`,
        method: 'post',
        data: { candidateMessage: candidateMessage.trim() || null },
      }),
      transformResponse: unwrap<ReferralRequestRecord>,
      invalidatesTags: tags,
      onQueryStarted: refreshNotifications,
    }),
    getCandidateRequests: builder.query<
      { requests: PagedResponse<ReferralRequestRecord>; quota: ReferralQuota },
      { pageNumber: number }
    >({
      query: (params) => ({ url: '/referral-requests/mine', params: { ...params, pageSize: 10 } }),
      transformResponse: unwrap<{
        requests: PagedResponse<ReferralRequestRecord>;
        quota: ReferralQuota;
      }>,
      providesTags: ['Marketplace'],
      keepUnusedDataFor: 0,
    }),
    getCandidateRequest: builder.query<ReferralRequestRecord, string>({
      query: (id) => ({ url: `/referral-requests/${encodeURIComponent(id)}` }),
      transformResponse: unwrap<ReferralRequestRecord>,
      providesTags: ['Marketplace'],
      keepUnusedDataFor: 0,
    }),
    getAcceptedContact: builder.query<ReferrerContactDetails, string>({
      query: (id) => ({ url: `/referral-requests/${encodeURIComponent(id)}/contact` }),
      transformResponse: unwrap<ReferrerContactDetails>,
      keepUnusedDataFor: 0,
      providesTags: ['Marketplace'],
    }),
    confirmReferralReceipt: builder.mutation<ReferralRequestRecord, string>({
      query: (id) => ({
        url: `/referral-requests/${encodeURIComponent(id)}/confirm`,
        method: 'post',
      }),
      transformResponse: unwrap<ReferralRequestRecord>,
      invalidatesTags: tags,
      onQueryStarted: refreshNotifications,
    }),
    reportReferralNotReceived: builder.mutation<ReferralRequestRecord, string>({
      query: (id) => ({
        url: `/referral-requests/${encodeURIComponent(id)}/not-received`,
        method: 'post',
      }),
      transformResponse: unwrap<ReferralRequestRecord>,
      invalidatesTags: tags,
      onQueryStarted: refreshNotifications,
    }),
  }),
});
export const {
  useGetReferralSavedJobsQuery,
  useGetReferralCatalogueQuery,
  useGetCandidateActivityQuery,
  useGetReferralMetricsQuery,
  useGetReferrerInboxQuery,
  useGetOwnedOpportunitiesQuery,
  useGetReferrerRequestQuery,
  useAcceptReferralRequestMutation,
  useRejectReferralRequestMutation,
  useMarkReferralSubmittedMutation,
  useCreateReferralRequestMutation,
  useGetCandidateRequestsQuery,
  useGetCandidateRequestQuery,
  useGetAcceptedContactQuery,
  useConfirmReferralReceiptMutation,
  useReportReferralNotReceivedMutation,
} = marketplaceApi;
