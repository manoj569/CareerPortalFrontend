import { createApi } from '@reduxjs/toolkit/query/react';

import { apiClient } from '@/api/apiClient';
import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { jobsApi } from '@/features/jobs/api/jobsApi';
import type { ApiResponse } from '@/types';
import type {
  AdminChartsQuery,
  AdminApplicationDetail,
  AdminApplicationQuery,
  AdminApplicationsPage,
  AdminAuditLogsPage,
  AdminAuditLogsQuery,
  AdminCategoriesPage,
  AdminCategoriesQuery,
  AdminCategory,
  AdminCategoryRequest,
  AdminCompaniesPage,
  AdminCompaniesQuery,
  AdminCompany,
  AdminCompanyRequest,
  AdminDashboardCharts,
  AdminDashboardStatistics,
  AdminCsvImportKind,
  AdminCsvImportResult,
  AdminJob,
  AdminJobRequest,
  AdminJobsPage,
  AdminJobsQuery,
  AdminOption,
  RecentAdminPayment,
  RecentAdminUser,
  SetAdminJobFlagArgs,
  UpdateAdminApplicationStatusArgs,
  UpdateAdminCategoryArgs,
  UpdateAdminCompanyArgs,
  UpdateAdminJobArgs,
  AdminRecruiterContact,
  UpdateAdminRecruiterContactArgs,
} from '../types/adminModels';

const csvUpload = (file: File): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

const refreshPublicJobs = async (
  queryFulfilled: Promise<unknown>,
  dispatch: (
    action:
      | ReturnType<typeof jobsApi.util.resetApiState>
      | ReturnType<typeof dashboardApi.util.invalidateTags>,
  ) => void,
) => {
  try {
    await queryFulfilled;
    dispatch(jobsApi.util.resetApiState());
    dispatch(dashboardApi.util.invalidateTags(['SavedJobs', 'Applications']));
  } catch {
    // The mutation result exposes the backend error; public caches remain untouched.
  }
};

const rawAdminBaseQuery = axiosBaseQuery();
const adminBaseQuery: typeof rawAdminBaseQuery = async (args, api) => {
  const result = await rawAdminBaseQuery(args, api);
  if (result.error?.status === 401 || result.error?.status === 403) {
    api.dispatch(sessionExpired());
  }
  return result;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: adminBaseQuery,
  keepUnusedDataFor: 60,
  tagTypes: [
    'Statistics',
    'Charts',
    'RecentPayments',
    'RecentUsers',
    'AdminJobs',
    'AdminCompanies',
    'AdminCategories',
    'AdminApplications',
    'AdminAuditLogs',
    'RecruiterContact',
  ],
  endpoints: (builder) => ({
    getAdminStatistics: builder.query<AdminDashboardStatistics, void>({
      query: () => ({ url: API_ENDPOINTS.ADMIN.DASHBOARD_STATISTICS }),
      transformResponse: (response: ApiResponse<AdminDashboardStatistics>) => response.data,
      providesTags: ['Statistics'],
    }),
    getAdminRecentPayments: builder.query<RecentAdminPayment[], number>({
      query: (limit) => ({
        params: { limit },
        url: API_ENDPOINTS.ADMIN.DASHBOARD_RECENT_PAYMENTS,
      }),
      transformResponse: (response: ApiResponse<RecentAdminPayment[]>) => response.data,
      providesTags: ['RecentPayments'],
    }),
    getAdminRecentUsers: builder.query<RecentAdminUser[], number>({
      query: (limit) => ({
        params: { limit },
        url: API_ENDPOINTS.ADMIN.DASHBOARD_RECENT_USERS,
      }),
      transformResponse: (response: ApiResponse<RecentAdminUser[]>) => response.data,
      providesTags: ['RecentUsers'],
    }),
    getAdminCharts: builder.query<AdminDashboardCharts, AdminChartsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.DASHBOARD_CHARTS }),
      transformResponse: (response: ApiResponse<AdminDashboardCharts>) => response.data,
      providesTags: ['Charts'],
    }),
    previewAdminCompaniesImport: builder.mutation<AdminCsvImportResult, File>({
      query: (file) => ({
        data: csvUpload(file),
        method: 'POST',
        url: API_ENDPOINTS.ADMIN.IMPORTS.COMPANIES_PREVIEW,
      }),
      transformResponse: (response: ApiResponse<AdminCsvImportResult>) => response.data,
    }),
    commitAdminCompaniesImport: builder.mutation<AdminCsvImportResult, File>({
      query: (file) => ({
        data: csvUpload(file),
        method: 'POST',
        url: API_ENDPOINTS.ADMIN.IMPORTS.COMPANIES_COMMIT,
      }),
      transformResponse: (response: ApiResponse<AdminCsvImportResult>) => response.data,
      invalidatesTags: [
        'Statistics',
        'Charts',
        { id: 'LIST', type: 'AdminCompanies' },
        { id: 'OPTIONS', type: 'AdminCompanies' },
      ],
    }),
    previewAdminJobsImport: builder.mutation<AdminCsvImportResult, File>({
      query: (file) => ({
        data: csvUpload(file),
        method: 'POST',
        url: API_ENDPOINTS.ADMIN.IMPORTS.JOBS_PREVIEW,
      }),
      transformResponse: (response: ApiResponse<AdminCsvImportResult>) => response.data,
    }),
    commitAdminJobsImport: builder.mutation<AdminCsvImportResult, File>({
      query: (file) => ({
        data: csvUpload(file),
        method: 'POST',
        url: API_ENDPOINTS.ADMIN.IMPORTS.JOBS_COMMIT,
      }),
      transformResponse: (response: ApiResponse<AdminCsvImportResult>) => response.data,
      invalidatesTags: ['Statistics', 'Charts', { id: 'LIST', type: 'AdminJobs' }],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    getAdminJobs: builder.query<AdminJobsPage, AdminJobsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.JOBS }),
      transformResponse: (response: ApiResponse<AdminJobsPage>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((job) => ({ id: job.id, type: 'AdminJobs' as const })),
              { id: 'LIST', type: 'AdminJobs' as const },
            ]
          : [{ id: 'LIST', type: 'AdminJobs' as const }],
    }),
    getAdminJob: builder.query<AdminJob, string>({
      query: (jobId) => ({ url: API_ENDPOINTS.ADMIN.JOB(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      providesTags: (_, __, jobId) => [{ id: jobId, type: 'AdminJobs' }],
    }),
    getAdminRecruiterContact: builder.query<AdminRecruiterContact, string>({
      query: (jobId) => ({
        url: API_ENDPOINTS.ADMIN.JOB_RECRUITER_CONTACT(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminRecruiterContact>) => response.data,
      providesTags: (_, __, jobId) => [{ id: jobId, type: 'RecruiterContact' }],
    }),

    updateAdminRecruiterContact: builder.mutation<
      AdminRecruiterContact,
      UpdateAdminRecruiterContactArgs
    >({
      query: ({ jobId, request }) => ({
        data: request,
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB_RECRUITER_CONTACT(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminRecruiterContact>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [{ id: jobId, type: 'RecruiterContact' }],
    }),
    createAdminJob: builder.mutation<AdminJob, AdminJobRequest>({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.ADMIN.JOBS }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: ['Statistics', 'Charts', { id: 'LIST', type: 'AdminJobs' }],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    updateAdminJob: builder.mutation<AdminJob, UpdateAdminJobArgs>({
      query: ({ jobId, request }) => ({
        data: request,
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    publishAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_PUBLISH(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    unpublishAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_UNPUBLISH(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    closeAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_CLOSE(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    featureAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_FEATURE(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    unfeatureAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_UNFEATURE(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    archiveAdminJob: builder.mutation<AdminJob, string>({
      query: (jobId) => ({ method: 'POST', url: API_ENDPOINTS.ADMIN.JOB_ARCHIVE(jobId) }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, jobId) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    setAdminJobFeatured: builder.mutation<AdminJob, SetAdminJobFlagArgs>({
      query: ({ jobId, value }) => ({
        data: { value },
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB_FEATURED(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    setAdminJobHidden: builder.mutation<AdminJob, SetAdminJobFlagArgs>({
      query: ({ jobId, value }) => ({
        data: { value },
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.JOB_HIDDEN(jobId),
      }),
      transformResponse: (response: ApiResponse<AdminJob>) => response.data,
      invalidatesTags: (_, __, { jobId }) => [
        'Statistics',
        'Charts',
        { id: jobId, type: 'AdminJobs' },
        { id: 'LIST', type: 'AdminJobs' },
      ],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    softDeleteAdminJob: builder.mutation<void, string>({
      query: (jobId) => ({ method: 'DELETE', url: API_ENDPOINTS.ADMIN.JOB(jobId) }),
      invalidatesTags: ['Statistics', 'Charts', { id: 'LIST', type: 'AdminJobs' }],
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void refreshPublicJobs(queryFulfilled, dispatch);
      },
    }),
    getAdminCompanies: builder.query<AdminCompaniesPage, AdminCompaniesQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.COMPANIES }),
      transformResponse: (response: ApiResponse<AdminCompaniesPage>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                id: item.id,
                type: 'AdminCompanies' as const,
              })),
              { id: 'LIST', type: 'AdminCompanies' as const },
            ]
          : [{ id: 'LIST', type: 'AdminCompanies' as const }],
    }),
    getAdminCompany: builder.query<AdminCompany, string>({
      query: (companyId) => ({ url: API_ENDPOINTS.ADMIN.COMPANY(companyId) }),
      transformResponse: (response: ApiResponse<AdminCompany>) => response.data,
      providesTags: (_, __, companyId) => [{ id: companyId, type: 'AdminCompanies' }],
    }),
    getAdminCompanyOptions: builder.query<AdminOption[], void>({
      query: () => ({ url: API_ENDPOINTS.ADMIN.COMPANY_OPTIONS }),
      transformResponse: (response: ApiResponse<AdminOption[]>) => response.data,
      providesTags: [{ id: 'OPTIONS', type: 'AdminCompanies' }],
    }),
    createAdminCompany: builder.mutation<AdminCompany, AdminCompanyRequest>({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.ADMIN.COMPANIES }),
      transformResponse: (response: ApiResponse<AdminCompany>) => response.data,
      invalidatesTags: [
        'Statistics',
        'Charts',
        { id: 'LIST', type: 'AdminCompanies' },
        { id: 'OPTIONS', type: 'AdminCompanies' },
      ],
    }),
    updateAdminCompany: builder.mutation<AdminCompany, UpdateAdminCompanyArgs>({
      query: ({ companyId, request }) => ({
        data: request,
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.COMPANY(companyId),
      }),
      transformResponse: (response: ApiResponse<AdminCompany>) => response.data,
      invalidatesTags: (_, __, { companyId }) => [
        'Charts',
        { id: companyId, type: 'AdminCompanies' },
        { id: 'LIST', type: 'AdminCompanies' },
        { id: 'OPTIONS', type: 'AdminCompanies' },
      ],
    }),
    deleteAdminCompany: builder.mutation<void, string>({
      query: (companyId) => ({
        method: 'DELETE',
        url: API_ENDPOINTS.ADMIN.COMPANY(companyId),
      }),
      invalidatesTags: [
        'Statistics',
        'Charts',
        { id: 'LIST', type: 'AdminCompanies' },
        { id: 'OPTIONS', type: 'AdminCompanies' },
      ],
    }),
    getAdminCategories: builder.query<AdminCategoriesPage, AdminCategoriesQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.CATEGORIES }),
      transformResponse: (response: ApiResponse<AdminCategoriesPage>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                id: item.id,
                type: 'AdminCategories' as const,
              })),
              { id: 'LIST', type: 'AdminCategories' as const },
            ]
          : [{ id: 'LIST', type: 'AdminCategories' as const }],
    }),
    getAdminCategory: builder.query<AdminCategory, string>({
      query: (categoryId) => ({ url: API_ENDPOINTS.ADMIN.CATEGORY(categoryId) }),
      transformResponse: (response: ApiResponse<AdminCategory>) => response.data,
      providesTags: (_, __, categoryId) => [{ id: categoryId, type: 'AdminCategories' }],
    }),
    getAdminCategoryOptions: builder.query<AdminOption[], void>({
      query: () => ({ url: API_ENDPOINTS.ADMIN.CATEGORY_OPTIONS }),
      transformResponse: (response: ApiResponse<AdminOption[]>) => response.data,
      providesTags: [{ id: 'OPTIONS', type: 'AdminCategories' }],
    }),
    createAdminCategory: builder.mutation<AdminCategory, AdminCategoryRequest>({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.ADMIN.CATEGORIES }),
      transformResponse: (response: ApiResponse<AdminCategory>) => response.data,
      invalidatesTags: [
        'Statistics',
        'Charts',
        { id: 'LIST', type: 'AdminCategories' },
        { id: 'OPTIONS', type: 'AdminCategories' },
      ],
    }),
    updateAdminCategory: builder.mutation<AdminCategory, UpdateAdminCategoryArgs>({
      query: ({ categoryId, request }) => ({
        data: request,
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.CATEGORY(categoryId),
      }),
      transformResponse: (response: ApiResponse<AdminCategory>) => response.data,
      invalidatesTags: (_, __, { categoryId }) => [
        'Charts',
        { id: categoryId, type: 'AdminCategories' },
        { id: 'LIST', type: 'AdminCategories' },
        { id: 'OPTIONS', type: 'AdminCategories' },
      ],
    }),
    deleteAdminCategory: builder.mutation<void, string>({
      query: (categoryId) => ({
        method: 'DELETE',
        url: API_ENDPOINTS.ADMIN.CATEGORY(categoryId),
      }),
      invalidatesTags: [
        'Statistics',
        'Charts',
        { id: 'LIST', type: 'AdminCategories' },
        { id: 'OPTIONS', type: 'AdminCategories' },
      ],
    }),
    getAdminApplications: builder.query<AdminApplicationsPage, AdminApplicationQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.APPLICATIONS }),
      transformResponse: (response: ApiResponse<AdminApplicationsPage>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                id: item.id,
                type: 'AdminApplications' as const,
              })),
              { id: 'LIST', type: 'AdminApplications' as const },
            ]
          : [{ id: 'LIST', type: 'AdminApplications' as const }],
    }),
    getAdminApplication: builder.query<AdminApplicationDetail, string>({
      query: (applicationId) => ({
        url: API_ENDPOINTS.ADMIN.APPLICATION(applicationId),
      }),
      transformResponse: (response: ApiResponse<AdminApplicationDetail>) => response.data,
      providesTags: (_, __, applicationId) => [{ id: applicationId, type: 'AdminApplications' }],
    }),
    updateAdminApplicationStatus: builder.mutation<
      AdminApplicationDetail,
      UpdateAdminApplicationStatusArgs
    >({
      query: ({ applicationId, request }) => ({
        data: request,
        method: 'PUT',
        url: API_ENDPOINTS.ADMIN.APPLICATION_STATUS(applicationId),
      }),
      transformResponse: (response: ApiResponse<AdminApplicationDetail>) => response.data,
      invalidatesTags: (_, __, { applicationId }) => [
        { id: applicationId, type: 'AdminApplications' },
        { id: 'LIST', type: 'AdminApplications' },
      ],
    }),
    getAdminAuditLogs: builder.query<AdminAuditLogsPage, AdminAuditLogsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.ADMIN.AUDIT_LOGS }),
      transformResponse: (response: ApiResponse<AdminAuditLogsPage>) => response.data,
      providesTags: ['AdminAuditLogs'],
    }),
  }),
});

export const {
  useArchiveAdminJobMutation,
  useCloseAdminJobMutation,
  useCommitAdminCompaniesImportMutation,
  useCommitAdminJobsImportMutation,
  useCreateAdminCategoryMutation,
  useCreateAdminCompanyMutation,
  useCreateAdminJobMutation,
  useDeleteAdminCategoryMutation,
  useDeleteAdminCompanyMutation,
  useFeatureAdminJobMutation,
  useGetAdminApplicationQuery,
  useGetAdminApplicationsQuery,
  useGetAdminAuditLogsQuery,
  useGetAdminCategoriesQuery,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCategoryQuery,
  useGetAdminChartsQuery,
  useGetAdminCompaniesQuery,
  useGetAdminCompanyOptionsQuery,
  useGetAdminCompanyQuery,
  useGetAdminJobQuery,
  useGetAdminJobsQuery,
  useGetAdminRecentPaymentsQuery,
  useGetAdminRecentUsersQuery,
  useGetAdminStatisticsQuery,
  usePublishAdminJobMutation,
  usePreviewAdminCompaniesImportMutation,
  usePreviewAdminJobsImportMutation,
  useSetAdminJobFeaturedMutation,
  useSetAdminJobHiddenMutation,
  useSoftDeleteAdminJobMutation,
  useUnfeatureAdminJobMutation,
  useUnpublishAdminJobMutation,
  useUpdateAdminApplicationStatusMutation,
  useUpdateAdminCategoryMutation,
  useUpdateAdminCompanyMutation,
  useUpdateAdminJobMutation,
  useGetAdminRecruiterContactQuery,
  useUpdateAdminRecruiterContactMutation,
} = adminApi;

export const downloadAdminImportTemplate = async (kind: AdminCsvImportKind): Promise<Blob> => {
  const response = await apiClient.request<Blob>({
    method: 'GET',
    responseType: 'blob',
    url:
      kind === 'companies'
        ? API_ENDPOINTS.ADMIN.IMPORTS.COMPANIES_TEMPLATE
        : API_ENDPOINTS.ADMIN.IMPORTS.JOBS_TEMPLATE,
  });

  return response.data;
};

export const downloadAdminApplicationResume = async (applicationId: string): Promise<Blob> => {
  const response = await apiClient.request<Blob>({
    method: 'GET',
    responseType: 'blob',
    url: API_ENDPOINTS.ADMIN.APPLICATION_RESUME(applicationId),
  });

  return response.data;
};

export const isAdminApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
