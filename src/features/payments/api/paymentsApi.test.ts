import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppStore } from '@/store/store';
import {
  PaymentProvider,
  PaymentStatus,
  type Payment,
  type PaymentOrder,
} from '../types/paymentModels';
import { paymentsApi } from './paymentsApi';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock('@/api/apiClient', () => ({
  apiClient: { request: mockRequest },
}));

const paymentId = '721e999a-3b15-46aa-aa66-bfdfd174ba14';
const order: PaymentOrder = {
  amountInMinorUnits: 9_900,
  currencyCode: 'INR',
  durationDays: 30,
  keyId: 'rzp_test_public',
  membershipId: '427ac857-ded2-4b2e-94eb-807601308707',
  paymentId,
  planName: 'Candidate Membership',
  providerOrderId: 'order_public',
  receipt: 'receipt_public',
};
const payment: Payment = {
  amount: 99,
  createdAtUtc: '2026-07-29T08:00:00Z',
  currencyCode: 'INR',
  id: paymentId,
  lastReconciledAtUtc: '2026-07-29T08:02:00Z',
  membershipId: order.membershipId,
  paidAtUtc: null,
  provider: PaymentProvider.Razorpay,
  providerOrderCreatedAtUtc: '2026-07-29T08:00:00Z',
  providerOrderId: order.providerOrderId,
  providerPaymentId: null,
  status: PaymentStatus.Pending,
};

describe('Razorpay payment API integration', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('creates an order with the required empty trusted request body', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({ data: { data: order } });

    await store.dispatch(paymentsApi.endpoints.createRazorpayOrder.initiate()).unwrap();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {},
        method: 'POST',
        url: '/payments/razorpay/orders',
      }),
    );
  });

  it('submits only the checkout identifiers and signature for backend confirmation', async () => {
    const store = createAppStore();
    const request = {
      razorpayOrderId: order.providerOrderId,
      razorpayPaymentId: 'pay_public',
      razorpaySignature: 'a'.repeat(64),
    };
    mockRequest.mockResolvedValue({ data: { data: payment } });

    await store
      .dispatch(
        paymentsApi.endpoints.confirmRazorpayPayment.initiate({
          paymentId,
          request,
        }),
      )
      .unwrap();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: request,
        method: 'POST',
        url: `/payments/${paymentId}/razorpay/confirm`,
      }),
    );
  });

  it('loads backend membership status and reconciles a pending payment', async () => {
    const store = createAppStore();
    mockRequest
      .mockResolvedValueOnce({
        data: { data: { latestPayment: payment, membership: null } },
      })
      .mockResolvedValueOnce({ data: { data: payment } });

    await store.dispatch(paymentsApi.endpoints.getPaymentStatus.initiate()).unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', url: '/payments/status' }),
    );

    await store
      .dispatch(paymentsApi.endpoints.reconcileRazorpayPayment.initiate(paymentId))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: `/payments/${paymentId}/razorpay/reconcile`,
      }),
    );
  });

  it('loads Candidate payment transactions and status history', async () => {
    const store = createAppStore();
    const page = {
      items: [],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    };
    mockRequest.mockResolvedValue({ data: { data: page } });

    await store
      .dispatch(paymentsApi.endpoints.getPayments.initiate({ pageNumber: 1, pageSize: 10 }))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: { pageNumber: 1, pageSize: 10 },
        url: '/payments',
      }),
    );

    await store
      .dispatch(paymentsApi.endpoints.getPaymentHistory.initiate({ pageNumber: 1, pageSize: 10 }))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: { pageNumber: 1, pageSize: 10 },
        url: '/payments/history',
      }),
    );
  });
});
