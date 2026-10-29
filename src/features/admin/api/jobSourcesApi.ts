import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse, PaginatedResponse } from '@/types';
import { adminApi } from './adminApi';
import { AtsType } from '../types/jobSourceModels';
import type {
  JobSource,
  JobSourceConnectionResult,
  JobSourceConnectionTestRequest,
  DurableJobSourceRun,
  SaveJobSourceRequest,
} from '../types/jobSourceModels';

const endpoints = API_ENDPOINTS.ADMIN.JOB_SOURCES;

export const jobSourcesApi = adminApi
  .enhanceEndpoints({ addTagTypes: ['JobSources'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      testJobSourceConfiguration: builder.mutation<JobSourceConnectionResult | null, JobSourceConnectionTestRequest>({
        query: (data) => ({ url: `${endpoints.LIST}/test`, method: 'POST', data, timeout: 60000 }),
        transformResponse: (response: ApiResponse<JobSourceConnectionResult> | null) => response?.data ?? null,
      }),
      testJobSource: builder.mutation<JobSourceConnectionResult | null, string>({
        query: (id) => ({ url: `${endpoints.DETAILS(id)}/test`, method: 'POST', timeout: 60000 }),
        transformResponse: (response: ApiResponse<JobSourceConnectionResult> | null) => response?.data ?? null,
      }),
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
        query: (data) => ({ url: endpoints.LIST, method: 'POST', data,
          ...(data.atsType === AtsType.RippleHire ? { timeout: 60000 } : {}) }),
        transformResponse: (response: ApiResponse<JobSource>) => response.data,
        invalidatesTags: ['JobSources'],
      }),
      updateJobSource: builder.mutation<JobSource, { id: string; request: SaveJobSourceRequest }>({
        query: ({ id, request }) => ({ url: endpoints.DETAILS(id), method: 'PUT', data: request,
          ...(request.atsType === AtsType.RippleHire ? { timeout: 60000 } : {}) }),
        transformResponse: (response: ApiResponse<JobSource>) => response.data,
        invalidatesTags: ['JobSources'],
      }),
      deleteJobSource: builder.mutation<void, string>({
        query: (id) => ({ url: endpoints.DETAILS(id), method: 'DELETE' }),
        invalidatesTags: ['JobSources'],
      }),
      runJobSource: builder.mutation<DurableJobSourceRun, string>({
        // Axios accepts 202. Acceptance queues work; only GET status proves completion.
        query: (id) => ({ url: endpoints.RUN(id), method: 'POST' }),
        transformResponse: (response: ApiResponse<DurableJobSourceRun>) => response.data,
      }),
      getJobSourceRun: builder.query<DurableJobSourceRun, { sourceId: string; runId: string }>({
        // Build the authenticated route from IDs; never follow an arbitrary response URL.
        query: ({ sourceId, runId }) => ({
          url: `${endpoints.DETAILS(sourceId)}/runs/${encodeURIComponent(runId)}`,
        }),
        transformResponse: (response: ApiResponse<DurableJobSourceRun>) => response.data,
        keepUnusedDataFor: 0,
      }),
    }),
  });

export const {
  useTestJobSourceConfigurationMutation,
  useTestJobSourceMutation,
  useGetJobSourcesQuery,
  useLazyGetJobSourceQuery,
  useCreateJobSourceMutation,
  useUpdateJobSourceMutation,
  useDeleteJobSourceMutation,
  useRunJobSourceMutation,
  useLazyGetJobSourceRunQuery,
} = jobSourcesApi;
