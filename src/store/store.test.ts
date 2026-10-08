import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { adminApi } from '@/features/admin/api/adminApi';
import { sessionExpired, sessionRefreshed } from '@/features/auth/store/authSlice';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { paymentsApi } from '@/features/payments/api/paymentsApi';
import { referralsApi } from '@/features/referrals/api/referralsApi';
import { UserRole } from '@/types';
import { createAppStore } from './store';

const profile = {
  bio: null,
  education: [],
  email: 'candidate@example.com',
  experience: [],
  firstName: 'Candidate',
  headline: null,
  id: 'candidate-id',
  lastName: 'User',
  linkedInUrl: null,
  location: null,
  portfolioUrl: null,
  preferredJobTypes: [],
  resume: null,
  skills: [],
};

const statistics = {
  expiredJobs: 0,
  featuredJobs: 0,
  generatedAtUtc: '2026-01-01T00:00:00Z',
  paidUsers: 0,
  publishedJobs: 0,
  revenue: [],
  totalCategories: 0,
  totalCompanies: 0,
  totalJobs: 0,
  totalUsers: 0,
};

describe('private server-state lifecycle', () => {
  it('clears candidate, payment, and administrator caches after session expiration', async () => {
    const store = createAppStore();
    await store.dispatch(referralsApi.util.upsertQueryData('unlockReferralContact', 'job-1', {
      status: 'Granted', message: '', contact: { referrerLabel: 'Employee Referrer', email: 'private@example.test', phoneNumber: null, linkedInUrl: null },
    }));
    await store.dispatch(dashboardApi.util.upsertQueryData('getProfile', undefined, profile));
    await store.dispatch(
      paymentsApi.util.upsertQueryData(
        'getPayments',
        { pageNumber: 1, pageSize: 10 },
        {
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
        },
      ),
    );
    await store.dispatch(
      adminApi.util.upsertQueryData('getAdminStatistics', undefined, statistics),
    );

    store.dispatch(sessionExpired());

    await waitFor(() => {
      expect(Object.keys(store.getState().dashboardApi.queries)).toHaveLength(0);
      expect(Object.keys(store.getState().paymentsApi.queries)).toHaveLength(0);
      expect(Object.keys(store.getState().referralsApi.queries)).toHaveLength(0);
      expect(Object.keys(store.getState().adminApi.queries)).toHaveLength(0);
    });
  });

  it('clears private caches when a refreshed session belongs to another account', async () => {
    const store = createAppStore({
      auth: {
        accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
        error: null,
        isSubmitting: false,
        status: 'authenticated',
        user: { ...profile, role: UserRole.Candidate },
      },
    });
    await store.dispatch(dashboardApi.util.upsertQueryData('getProfile', undefined, profile));

    store.dispatch(
      sessionRefreshed({
        accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
        user: {
          email: 'other@example.com',
          firstName: 'Other',
          id: 'other-id',
          lastName: 'User',
          role: UserRole.Candidate,
        },
      }),
    );

    await waitFor(() => {
      expect(Object.keys(store.getState().dashboardApi.queries)).toHaveLength(0);
    });
  });
});
