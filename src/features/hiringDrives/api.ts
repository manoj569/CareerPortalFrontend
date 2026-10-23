import { jobsApi } from '@/features/jobs/api/jobsApi';
import { adminApi } from '@/features/admin/api/adminApi';
import type { ApiResponse } from '@/types';
import type {
  HiringDrive,
  HiringDestination,
  AdminHiringDrive,
  HiringDriveInput,
  HiringDrivePage,
} from './types';

// The configured API base URL already ends in /api.
export const hiringDrivesApi = jobsApi
  .enhanceEndpoints({ addTagTypes: ['HiringDrives'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getHiringDrives: builder.query<HiringDrive[], void>({
        query: () => ({ url: '/public/hiring-drives' }),
        transformResponse: (response: ApiResponse<HiringDrive[]>) => response.data,
        providesTags: ['HiringDrives'],
      }),
      clickHiringDrive: builder.mutation<HiringDestination, string>({
        query: (id) => ({
          url: `/public/hiring-drives/${encodeURIComponent(id)}/click`,
          method: 'POST',
        }),
        transformResponse: (response: ApiResponse<HiringDestination>) => response.data,
      }),
      recordHiringImpressions: builder.mutation<void, string[]>({
        query: (driveIds) => ({
          url: '/public/hiring-drives/impressions',
          method: 'POST',
          data: { driveIds },
        }),
      }),
    }),
  });
export const {
  useGetHiringDrivesQuery,
  useClickHiringDriveMutation,
  useRecordHiringImpressionsMutation,
} = hiringDrivesApi;
export const adminHiringDrivesApi = adminApi
  .enhanceEndpoints({ addTagTypes: ['AdminHiringDrives'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getAdminHiringDrives: builder.query<
        HiringDrivePage<AdminHiringDrive>,
        { pageNumber?: number; pageSize?: number }
      >({
        query: ({ pageNumber = 1, pageSize = 20 } = {}) => ({
          url: '/admin/hiring-drives',
          params: { pageNumber, pageSize },
        }),
        transformResponse: (response: ApiResponse<HiringDrivePage<AdminHiringDrive>>) =>
          response.data,
        providesTags: ['AdminHiringDrives'],
        keepUnusedDataFor: 0,
      }),
      getAdminHiringDrive: builder.query<AdminHiringDrive, string>({
        query: (id) => ({ url: `/admin/hiring-drives/${encodeURIComponent(id)}` }),
        transformResponse: (response: ApiResponse<AdminHiringDrive>) => response.data,
        keepUnusedDataFor: 0,
      }),
      deleteAdminHiringDrive: builder.mutation<void, string>({
        query: (id) => ({
          url: `/admin/hiring-drives/${encodeURIComponent(id)}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['AdminHiringDrives'],
      }),
      saveAdminHiringDrive: builder.mutation<
        AdminHiringDrive,
        { id?: string; data: HiringDriveInput }
      >({
        query: ({ id, data }) => ({
          url: `/admin/hiring-drives${id ? `/${encodeURIComponent(id)}` : ''}`,
          method: id ? 'PUT' : 'POST',
          data,
        }),
        transformResponse: (response: ApiResponse<AdminHiringDrive>) => response.data,
        invalidatesTags: ['AdminHiringDrives'],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(hiringDrivesApi.util.invalidateTags(['HiringDrives']));
          } catch {
            /* Form displays the failure. */
          }
        },
      }),
    }),
  });
export const {
  useGetAdminHiringDrivesQuery,
  useGetAdminHiringDriveQuery,
  useDeleteAdminHiringDriveMutation,
  useSaveAdminHiringDriveMutation,
} = adminHiringDrivesApi;
