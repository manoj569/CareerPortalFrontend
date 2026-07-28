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
import { adminApi } from './adminApi';
import { JobStatus, type AdminJob, type AdminJobRequest } from '../types/adminModels';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

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
});
