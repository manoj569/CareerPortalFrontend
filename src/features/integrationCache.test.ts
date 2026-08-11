import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { JobApplicationStatus, MembershipStatus } from '@/features/dashboard/types/dashboardModels';
import { paymentsApi } from '@/features/payments/api/paymentsApi';
import { PaymentProvider, PaymentStatus } from '@/features/payments/types/paymentModels';
import { createAppStore } from '@/store/store';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock('@/api/apiClient', () => ({
  apiClient: { request: mockRequest },
}));

describe('cross-module cache consistency', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('refreshes applications after a candidate submits an application', async () => {
    const store = createAppStore();
    await store.dispatch(
      dashboardApi.util.upsertQueryData(
        'getApplications',
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
    mockRequest.mockResolvedValue({
      data: {
        data: {
          companyName: 'Northstar',
          applicationMethod: 'Portal',
          id: 'application-id',
          jobId: 'job-id',
          jobSlug: 'frontend-engineer',
          jobTitle: 'Frontend Engineer',
          resumeFileName: null,
          status: JobApplicationStatus.Submitted,
          submittedAtUtc: '2026-07-29T00:00:00Z',
          withdrawnAtUtc: null,
        },
      },
    });

    await store
      .dispatch(
        dashboardApi.endpoints.submitApplication.initiate({
          applicationMethod: 'Portal',
          jobId: 'job-id',
        }),
      )
      .unwrap();

    await waitFor(() => {
      expect(Object.keys(store.getState().dashboardApi.queries)).toHaveLength(0);
    });
  });

  it('refreshes memberships only after backend payment confirmation succeeds', async () => {
    const store = createAppStore();
    await store.dispatch(
      dashboardApi.util.upsertQueryData('getMemberships', undefined, [
        {
          autoRenew: false,
          endsAtUtc: null,
          id: 'membership-id',
          planName: 'Application access',
          startsAtUtc: '2026-01-01T00:00:00Z',
          status: MembershipStatus.Pending,
        },
      ]),
    );
    mockRequest.mockResolvedValue({
      data: {
        data: {
          amount: 499,
          createdAtUtc: '2026-01-01T00:00:00Z',
          currencyCode: 'INR',
          id: 'payment-id',
          membershipId: 'membership-id',
          paidAtUtc: '2026-01-01T00:01:00Z',
          provider: PaymentProvider.Razorpay,
          providerOrderId: 'order-id',
          providerPaymentId: 'provider-payment-id',
          status: PaymentStatus.Paid,
        },
      },
    });

    await store
      .dispatch(
        paymentsApi.endpoints.confirmRazorpayPayment.initiate({
          paymentId: 'payment-id',
          request: {
            razorpayOrderId: 'order-id',
            razorpayPaymentId: 'provider-payment-id',
            razorpaySignature: 'a'.repeat(64),
          },
        }),
      )
      .unwrap();

    await waitFor(() => {
      expect(Object.keys(store.getState().dashboardApi.queries)).toHaveLength(0);
    });
  });
});
