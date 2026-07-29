import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MembershipStatus } from '@/features/dashboard/types/dashboardModels';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import {
  useGetPaymentHistoryQuery,
  useGetPaymentsQuery,
  useGetPaymentStatusQuery,
} from '@/features/payments/api/paymentsApi';
import {
  PaymentProvider,
  PaymentStatus,
  type Payment,
} from '@/features/payments/types/paymentModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PaymentsPage } from './PaymentsPage';

vi.mock('@/features/payments/api/paymentsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PaymentsApiModule>();
  return {
    ...actual,
    useGetPaymentHistoryQuery: vi.fn(),
    useGetPaymentsQuery: vi.fn(),
    useGetPaymentStatusQuery: vi.fn(),
  };
});

const mockHistory = vi.mocked(useGetPaymentHistoryQuery);
const mockPayments = vi.mocked(useGetPaymentsQuery);
const mockStatus = vi.mocked(useGetPaymentStatusQuery);
const payment: Payment = {
  amount: 99,
  createdAtUtc: '2026-07-28T08:00:00Z',
  currencyCode: 'INR',
  id: '721e999a-3b15-46aa-aa66-bfdfd174ba14',
  lastReconciledAtUtc: null,
  membershipId: '427ac857-ded2-4b2e-94eb-807601308707',
  paidAtUtc: '2026-07-28T08:01:00Z',
  provider: PaymentProvider.Razorpay,
  providerOrderCreatedAtUtc: '2026-07-28T08:00:00Z',
  providerOrderId: 'order_public',
  providerPaymentId: 'payment_public',
  status: PaymentStatus.Paid,
};

const queryResult = <T,>(data?: T, overrides: Record<string, unknown> = {}) =>
  ({
    data,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  }) as unknown;

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <PaymentsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockPayments.mockReturnValue(
    queryResult({
      items: [payment],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }) as ReturnType<typeof useGetPaymentsQuery>,
  );
  mockHistory.mockReturnValue(
    queryResult({
      items: [
        {
          currentStatus: PaymentStatus.Paid,
          id: 'history-id',
          occurredAtUtc: '2026-07-28T08:01:00Z',
          paymentId: payment.id,
          previousStatus: PaymentStatus.Authorized,
          providerEventId: 'provider-event-is-not-rendered',
          reason: 'provider-reason-is-not-rendered',
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }) as ReturnType<typeof useGetPaymentHistoryQuery>,
  );
  mockStatus.mockReturnValue(
    queryResult({
      latestPayment: payment,
      membership: {
        autoRenew: false,
        endsAtUtc: '2099-07-28T00:00:00Z',
        id: payment.membershipId,
        planName: 'Candidate Membership',
        startsAtUtc: '2026-07-28T08:01:00Z',
        status: MembershipStatus.Active,
      },
    }) as ReturnType<typeof useGetPaymentStatusQuery>,
  );
});

describe('payment history page', () => {
  it('renders its loading skeleton', () => {
    mockPayments.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useGetPaymentsQuery>,
    );
    renderPage();
    expect(screen.getByLabelText('Loading membership and payment history')).toBeInTheDocument();
  });

  it('renders an honest empty state', () => {
    mockPayments.mockReturnValue(
      queryResult({
        items: [],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      }) as ReturnType<typeof useGetPaymentsQuery>,
    );
    renderPage();
    expect(screen.getByText('No payments yet')).toBeInTheDocument();
  });

  it('renders membership, transactions, and safe status history', () => {
    renderPage();
    expect(screen.getAllByText('Candidate Membership').length).toBeGreaterThan(0);
    expect(screen.getAllByText(payment.id).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Razorpay').length).toBeGreaterThan(0);
    expect(screen.queryByText('provider-event-is-not-rendered')).not.toBeInTheDocument();
    expect(screen.queryByText('provider-reason-is-not-rendered')).not.toBeInTheDocument();
  });

  it('shows a retryable API failure', () => {
    mockStatus.mockReturnValue(
      queryResult(undefined, { isError: true }) as ReturnType<typeof useGetPaymentStatusQuery>,
    );
    renderPage();
    expect(screen.getByText('Payments unavailable')).toBeInTheDocument();
  });
});
