import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiRequestError } from '@/api/apiError';
import {
  EmploymentType,
  ExperienceLevel,
  WorkplaceType,
  type PublicJobQuery,
} from '@/features/jobs/types/jobModels';
import { jobsApi } from '@/features/jobs/api/jobsApi';
import { sessionExpired } from '@/features/auth/store/authSlice';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { createAppStore } from '@/store/store';
import { UserRole } from '@/types';
import { adminApi, downloadAdminApplicationResume, downloadAdminImportTemplate } from './adminApi';
import {
  AdminApplicationStatus,
  JobStatus,
  type AdminCategoryRequest,
  type AdminCompanyRequest,
  type AdminJob,
  type AdminJobRequest,
} from '../types/adminModels';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

interface CapturedRequestConfig {
  data?: unknown;
  method?: string;
  params?: unknown;
  url?: string;
}

vi.mock('@/api/apiClient', () => ({
  apiClient: { request: mockRequest },
}));
const jobId = '5aeb6d48-035e-4f58-aa6f-c222ffe27e97';
const companyId = 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276';
const categoryId = '51741c58-0587-4c68-866e-acfe9b36836c';

const request: AdminJobRequest = {
  applicationUrl: 'https://apply.example.com',
  benefits: null,
  categoryId,
  companyId,
  currencyCode: 'INR',
  description: 'Build products.',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  location: 'Pune',
  maximumSalary: 200,
  minimumSalary: 100,
  requirements: null,
  responsibilities: null,
  title: 'Frontend Engineer',
  workplaceType: WorkplaceType.Hybrid,
};

const createdJob: AdminJob = {
  ...request,
  benefits: null,
  categoryName: 'Engineering',
  companyName: 'Northstar Labs',
  createdAtUtc: '2026-07-28T00:00:00Z',
  deletedAtUtc: null,
  id: jobId,
  isDeleted: false,
  isFeatured: false,
  isHidden: false,
  publishedAtUtc: null,
  referenceNumber: 'JOB-20260728-1234ABCD',
  requirements: null,
  responsibilities: null,
  slug: 'frontend-engineer-1234abcd',
  status: JobStatus.Draft,
  updatedAtUtc: null,
};

const publicQuery: PublicJobQuery = {
  pageNumber: 1,
  pageSize: 12,
  sortBy: 'publishedAt',
  sortDirection: 'desc',
};

const importResult = {
  canCommit: true,
  duplicateRows: 1,
  importedRows: 2,
  invalidRows: 0,
  rows: [
    { errors: [], rowNumber: 2, status: 'Valid' },
    { errors: [], rowNumber: 3, status: 'Skip duplicate' },
  ],
  skippedRows: 1,
  totalRows: 3,
  validRows: 2,
};

describe('admin API cache consistency', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('clears public job cache after a successful administrator job mutation', async () => {
    const store = createAppStore();
    await store.dispatch(
      jobsApi.util.upsertQueryData('searchJobs', publicQuery, {
        items: [],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 0,
        totalPages: 0,
      }),
    );
    await store.dispatch(
      dashboardApi.util.upsertQueryData(
        'getSavedJobs',
        { pageNumber: 1, pageSize: 12 },
        {
          items: [],
          pageNumber: 1,
          pageSize: 12,
          totalCount: 0,
          totalPages: 0,
        },
      ),
    );
    expect(Object.keys(store.getState().jobsApi.queries)).toHaveLength(1);
    expect(Object.keys(store.getState().dashboardApi.queries)).toHaveLength(1);

    mockRequest.mockResolvedValue({
      data: { data: createdJob },
    });
    await store.dispatch(adminApi.endpoints.createAdminJob.initiate(request)).unwrap();

    await waitFor(() => {
      expect(Object.keys(store.getState().jobsApi.queries)).toHaveLength(0);
      expect(Object.keys(store.getState().dashboardApi.queries)).toHaveLength(0);
    });
  });

  it('clears administrator cache when the session expires', async () => {
    const store = createAppStore();
    await store.dispatch(
      adminApi.util.upsertQueryData('getAdminStatistics', undefined, {
        expiredJobs: 0,
        featuredJobs: 0,
        generatedAtUtc: '2026-07-28T00:00:00Z',
        paidUsers: 0,
        publishedJobs: 0,
        revenue: [],
        totalCategories: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalUsers: 0,
      }),
    );
    expect(Object.keys(store.getState().adminApi.queries)).toHaveLength(1);
    store.dispatch(sessionExpired());
    await waitFor(() => {
      expect(Object.keys(store.getState().adminApi.queries)).toHaveLength(0);
    });
  });

  it('invalidates a stale administrator session after a backend forbidden response', async () => {
    const store = createAppStore({
      auth: {
        accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
        error: null,
        isSubmitting: false,
        status: 'authenticated',
        user: {
          email: 'admin@example.com',
          firstName: 'Admin',
          id: 'admin-id',
          lastName: 'User',
          role: UserRole.Administrator,
        },
      },
    });
    mockRequest.mockRejectedValue(new ApiRequestError({ message: 'Forbidden', status: 403 }));
    await store.dispatch(adminApi.endpoints.getAdminStatistics.initiate());
    expect(store.getState().auth.status).toBe('unauthenticated');
    expect(store.getState().auth.user).toBeNull();
  });

  it('uses the complete company and category CRUD/options contracts', async () => {
    const store = createAppStore();
    const companyRequest: AdminCompanyRequest = {
      description: null,
      employeeCount: 25,
      industry: 'Technology',
      isVerified: true,
      location: 'Pune',
      logoUrl: null,
      name: 'Northstar Labs',
      slug: null,
      websiteUrl: 'https://northstar.example',
    };
    const categoryRequest: AdminCategoryRequest = {
      description: null,
      displayOrder: 1,
      name: 'Engineering',
      parentCategoryId: null,
      slug: null,
    };
    mockRequest.mockResolvedValue({ data: { data: { id: companyId } } });

    await store.dispatch(adminApi.endpoints.createAdminCompany.initiate(companyRequest)).unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: companyRequest,
        method: 'POST',
        url: '/admin/companies',
      }),
    );
    await store.dispatch(
      adminApi.endpoints.updateAdminCompany.initiate({
        companyId,
        request: companyRequest,
      }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PUT', url: `/admin/companies/${companyId}` }),
    );
    await store.dispatch(adminApi.endpoints.deleteAdminCompany.initiate(companyId));
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: `/admin/companies/${companyId}` }),
    );
    await store.dispatch(adminApi.endpoints.getAdminCompanyOptions.initiate());
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/admin/companies/options' }),
    );

    mockRequest.mockResolvedValue({ data: { data: { id: categoryId } } });
    await store.dispatch(adminApi.endpoints.createAdminCategory.initiate(categoryRequest));
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: categoryRequest,
        method: 'POST',
        url: '/admin/categories',
      }),
    );
    await store.dispatch(
      adminApi.endpoints.updateAdminCategory.initiate({
        categoryId,
        request: categoryRequest,
      }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PUT', url: `/admin/categories/${categoryId}` }),
    );
    await store.dispatch(adminApi.endpoints.deleteAdminCategory.initiate(categoryId));
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: `/admin/categories/${categoryId}` }),
    );
    await store.dispatch(adminApi.endpoints.getAdminCategoryOptions.initiate());
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/admin/categories/options' }),
    );
  });

  it('sends exactly one file field to every CSV preview and commit endpoint', async () => {
    const store = createAppStore();
    const file = new File(['name\nNorthstar Labs'], 'companies.csv', { type: 'text/csv' });
    mockRequest.mockResolvedValue({ data: { data: importResult } });

    const requests = [
      adminApi.endpoints.previewAdminCompaniesImport.initiate(file),
      adminApi.endpoints.commitAdminCompaniesImport.initiate(file),
      adminApi.endpoints.previewAdminJobsImport.initiate(file),
      adminApi.endpoints.commitAdminJobsImport.initiate(file),
    ];
    for (const requestAction of requests) {
      await store.dispatch(requestAction).unwrap();
    }

    const requestConfigs = mockRequest.mock.calls.map(
      ([requestConfig]) => requestConfig as CapturedRequestConfig,
    );
    expect(mockRequest).toHaveBeenCalledTimes(4);
    expect(requestConfigs.map((requestConfig) => requestConfig.url)).toEqual([
      '/admin/imports/companies/preview',
      '/admin/imports/companies/commit',
      '/admin/imports/jobs/preview',
      '/admin/imports/jobs/commit',
    ]);
    for (const requestConfig of requestConfigs) {
      expect(requestConfig.method).toBe('POST');
      expect(requestConfig.data).toBeInstanceOf(FormData);
      expect(Array.from((requestConfig.data as FormData).entries())).toEqual([['file', file]]);
    }
  });

  it('uses relative discovery URLs and sends selected item IDs only', async () => {
    const store = createAppStore();
    const runId = 'a4f14bb7-d7af-447a-863c-17fb036ad9ac';
    const itemId = 'c4bdc15b-6293-426c-b0a9-c46a08d4c518';
    const run = {
      candidateCount: 1, completedAtUtc: null, duplicateCount: 0, errorSummary: null,
      id: runId, importedCount: 0, startedAtUtc: '2026-08-10T10:00:00Z',
      status: 'Completed', trigger: 'Manual',
    };
    mockRequest
      .mockResolvedValueOnce({ data: { data: run } })
      .mockResolvedValueOnce({ data: { data: [run] } })
      .mockResolvedValueOnce({ data: { data: { ...run, items: [] } } })
      .mockResolvedValueOnce({ data: { data: importResult } })
      .mockResolvedValueOnce({ data: { data: { import: importResult, selected: 1 } } });

    await store.dispatch(adminApi.endpoints.runAdminJobDiscovery.initiate({})).unwrap();
    await store.dispatch(adminApi.endpoints.getAdminJobDiscoveryRuns.initiate(25)).unwrap();
    await store.dispatch(adminApi.endpoints.getAdminJobDiscoveryRun.initiate(runId)).unwrap();
    const request = { itemIds: [itemId] };
    await store.dispatch(adminApi.endpoints.previewAdminJobDiscovery.initiate({ request, runId })).unwrap();
    await store.dispatch(adminApi.endpoints.commitAdminJobDiscovery.initiate({ request, runId })).unwrap();

    const configs = mockRequest.mock.calls.map(([config]) => config as CapturedRequestConfig);
    expect(configs).toEqual(expect.arrayContaining([
      expect.objectContaining({ data: {}, method: 'POST', url: '/admin/job-discovery/run' }),
      expect.objectContaining({ params: { take: 25 }, url: '/admin/job-discovery/runs' }),
      expect.objectContaining({ url: `/admin/job-discovery/runs/${runId}` }),
      expect.objectContaining({ data: request, method: 'POST', url: `/admin/job-discovery/runs/${runId}/preview` }),
      expect.objectContaining({ data: request, method: 'POST', url: `/admin/job-discovery/runs/${runId}/commit` }),
    ]));
    expect(configs.every((config) => !config.url?.startsWith('/api/'))).toBe(true);
  });

  it('downloads the backend CSV template for each import type', async () => {
    const template = new Blob(['header\nvalue'], { type: 'text/csv' });
    mockRequest.mockResolvedValue({ data: template });

    await expect(downloadAdminImportTemplate('companies')).resolves.toBe(template);
    await expect(downloadAdminImportTemplate('jobs')).resolves.toBe(template);

    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'GET',
        responseType: 'blob',
        url: '/admin/imports/templates/companies',
      }),
    );
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'GET',
        responseType: 'blob',
        url: '/admin/imports/templates/jobs',
      }),
    );
  });

  it('uses job lifecycle, application review, resume, and read-only audit endpoints', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({ data: { data: createdJob } });
    await store.dispatch(adminApi.endpoints.unpublishAdminJob.initiate(jobId));
    await store.dispatch(adminApi.endpoints.closeAdminJob.initiate(jobId));
    await store.dispatch(adminApi.endpoints.featureAdminJob.initiate(jobId));
    await store.dispatch(adminApi.endpoints.unfeatureAdminJob.initiate(jobId));
    for (const action of ['unpublish', 'close', 'feature', 'unfeature']) {
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: `/admin/jobs/${jobId}/${action}`,
        }),
      );
    }

    await store.dispatch(
      adminApi.endpoints.updateAdminApplicationStatus.initiate({
        applicationId: jobId,
        request: {
          internalNote: 'Private review note.',
          status: AdminApplicationStatus.Reviewed,
        },
      }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          internalNote: 'Private review note.',
          status: AdminApplicationStatus.Reviewed,
        },
        method: 'PUT',
        url: `/admin/applications/${jobId}/status`,
      }),
    );

    mockRequest.mockResolvedValue({ data: new Blob(['resume']) });
    await downloadAdminApplicationResume(jobId);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        responseType: 'blob',
        url: `/admin/applications/${jobId}/resume`,
      }),
    );

    mockRequest.mockResolvedValue({
      data: {
        data: { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0 },
      },
    });
    await store.dispatch(
      adminApi.endpoints.getAdminAuditLogs.initiate({
        correlationId: 'request-123',
        pageNumber: 1,
        pageSize: 20,
      }),
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        params: { correlationId: 'request-123', pageNumber: 1, pageSize: 20 },
        url: '/admin/audit-logs',
      }),
    );
  });
});
