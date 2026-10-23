import { adminApi } from '@/features/admin/api/adminApi';
import { jobsApi } from '@/features/jobs/api/jobsApi';
import type { ApiResponse } from '@/types';
import type { ActiveJobPromotion, JobPromotionConfiguration, JobPromotionPage, SaveJobPromotionRequest } from './types';

export const jobPromotionsApi = jobsApi
  .enhanceEndpoints({ addTagTypes: ['ActiveJobPromotions'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getActiveJobPromotions: builder.query<ActiveJobPromotion[], void>({
        query: () => ({ url: '/job-promotions/active' }),
        transformResponse: (response: ApiResponse<ActiveJobPromotion[]>) => response.data,
        providesTags: ['ActiveJobPromotions'],
      }),
    }),
  });

export const { useGetActiveJobPromotionsQuery } = jobPromotionsApi;

export const adminJobPromotionsApi = adminApi.enhanceEndpoints({ addTagTypes: ['AdminJobPromotions'] }).injectEndpoints({
  endpoints: (builder) => ({
    getAdminJobPromotions: builder.query<JobPromotionPage, { pageNumber?: number; pageSize?: number; isEnabled?: boolean }>({
      query: ({ pageNumber = 1, pageSize = 100, isEnabled } = {}) => ({ url: '/admin/job-promotions', params: { pageNumber, pageSize, ...(isEnabled === undefined ? {} : { isEnabled }) } }),
      transformResponse: (response: ApiResponse<JobPromotionPage>) => response.data,
      providesTags: ['AdminJobPromotions'],
    }),
    getAdminJobPromotion: builder.query<JobPromotionConfiguration, string>({
      query: (jobId) => ({ url: `/admin/jobs/${encodeURIComponent(jobId)}/promotion` }),
      transformResponse: (response: ApiResponse<JobPromotionConfiguration>) => response.data,
    }),
    saveAdminJobPromotion: builder.mutation<JobPromotionConfiguration, { jobId: string; data: SaveJobPromotionRequest }>({
      query: ({ jobId, data }) => ({ url: `/admin/jobs/${encodeURIComponent(jobId)}/promotion`, method: 'PUT', data }),
      transformResponse: (response: ApiResponse<JobPromotionConfiguration>) => response.data,
      invalidatesTags: (_result, _error, { jobId }) => ['AdminJobPromotions', { type: 'AdminJobs', id: jobId }, { type: 'AdminJobs', id: 'LIST' }],
    }),
    disableAdminJobPromotion: builder.mutation<JobPromotionConfiguration, string>({
      query: (jobId) => ({ url: `/admin/jobs/${encodeURIComponent(jobId)}/promotion`, method: 'DELETE' }),
      transformResponse: (response: ApiResponse<JobPromotionConfiguration>) => response.data,
      invalidatesTags: (_result, _error, jobId) => ['AdminJobPromotions', { type: 'AdminJobs', id: jobId }, { type: 'AdminJobs', id: 'LIST' }],
    }),
    uploadAdminJobPromotionBanner: builder.mutation<JobPromotionConfiguration, { jobId: string; file: File }>({
      query: ({ jobId, file }) => {
        const data = new FormData();
        data.append('file', file);
        return { url: `/admin/jobs/${encodeURIComponent(jobId)}/promotion/banner`, method: 'PUT', data };
      },
      transformResponse: (response: ApiResponse<JobPromotionConfiguration>) => response.data,
      invalidatesTags: (_result, _error, { jobId }) => ['AdminJobPromotions', { type: 'AdminJobs', id: jobId }, { type: 'AdminJobs', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdminJobPromotionsQuery,
  useLazyGetAdminJobPromotionQuery,
  useGetAdminJobPromotionQuery,
  useSaveAdminJobPromotionMutation,
  useDisableAdminJobPromotionMutation,
  useUploadAdminJobPromotionBannerMutation,
} = adminJobPromotionsApi;
