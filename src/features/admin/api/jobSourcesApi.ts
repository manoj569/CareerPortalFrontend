import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse, PaginatedResponse } from '@/types';
import { adminApi } from './adminApi';
import type { JobSource, JobSourceRunResult, SaveJobSourceRequest } from '../types/jobSourceModels';

const endpoints = API_ENDPOINTS.ADMIN.JOB_SOURCES;

export const jobSourcesApi = adminApi
  .enhanceEndpoints({ addTagTypes: ['JobSources'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getJobSources: builder.query<JobSource[], void>({
        // Search and error filtering are not supported server-side. Fetch every page
        // so client filters and overview counts never silently cover only page one.
        async queryFn(_arg, _api, _options, baseQuery) {
          const items: JobSource[] = [];
          let pageNumber = 1;
          let totalPages = 1;
          do {
            const result = await baseQuery({
              url: endpoints.LIST,
              params: { pageNumber, pageSize: 100 },
            });
            if (result.error) return { error: result.error };
            const page = (result.data as ApiResponse<PaginatedResponse<JobSource>>).data;
            items.push(...page.items);
            totalPages = page.totalPages;
            pageNumber++;
          } while (pageNumber <= totalPages);
          return { data: [...new Map(items.map((item) => [item.id, item])).values()] };
        },
        providesTags: ['JobSources'],
      }),
      getJobSource: builder.query<JobSource, string>({
        query: (id) => ({ url: endpoints.DETAILS(id) }),
        transformResponse: (response: ApiResponse<JobSource>) => response.data,
        providesTags: ['JobSources'],
      }),
      createJobSource: builder.mutation<JobSource, SaveJobSourceRequest>({
        query: (data) => ({ url: endpoints.LIST, method: 'POST', data }),
        transformResponse: (response: ApiResponse<JobSource>) => response.data,
        invalidatesTags: ['JobSources'],
      }),
      updateJobSource: builder.mutation<JobSource, { id: string; request: SaveJobSourceRequest }>({
        query: ({ id, request }) => ({ url: endpoints.DETAILS(id), method: 'PUT', data: request }),
        transformResponse: (response: ApiResponse<JobSource>) => response.data,
        invalidatesTags: ['JobSources'],
      }),
      deleteJobSource: builder.mutation<void, string>({
        query: (id) => ({ url: endpoints.DETAILS(id), method: 'DELETE' }),
        invalidatesTags: ['JobSources'],
      }),
      runJobSource: builder.mutation<JobSourceRunResult, string>({
        // A manual run includes fetching and ingesting the complete ATS board.
        query: (id) => ({ url: endpoints.RUN(id), method: 'POST', timeout: 300_000 }),
        transformResponse: (response: ApiResponse<JobSourceRunResult>) => response.data,
        // Failed runs can also change bookkeeping or partially ingest drafts.
        invalidatesTags: ['JobSources', 'AdminJobs', 'Statistics'],
      }),
    }),
  });

export const {
  useGetJobSourcesQuery,
  useLazyGetJobSourceQuery,
  useCreateJobSourceMutation,
  useUpdateJobSourceMutation,
  useDeleteJobSourceMutation,
  useRunJobSourceMutation,
} = jobSourcesApi;
