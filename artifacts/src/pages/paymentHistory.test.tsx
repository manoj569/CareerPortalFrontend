import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import { useGetPaymentsQuery } from '@/features/payments/api/paymentsApi';
import {
  PaymentProvider,
  PaymentStatus,
  type Payment,
} from '@/features/payments/types/paymentModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PaymentsPage } from './PaymentsPage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return { ...actual, useGetMembershipsQuery: vi.fn() };
});

vi.mock('@/features/payments/api/paymentsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PaymentsApiModule>();
  return { ...actual, useGetPaymentsQuery: vi.fn() };
});

const mockPayments = vi.mocked(useGetPaymentsQuery);
const mockMemberships = vi.mocked(useGetMembershipsQuery);
const refetch = vi.fn();
const payment: Payment = {
  amount: 499,
  createdAtUtc: '2026-07-28T08:00:00Z',
  currencyCode: 'INR',
  id: '721e999a-3b15-46aa-aa66-bfdfd174ba14',
  membershipId: null,
  paidAtUtc: '2026-07-28T08:01:00Z',
  provider: PaymentProvider.Razorpay,
  providerOrderId: 'order_public',
  providerPaymentId: 'payment_public',
  status: PaymentStatus.Paid,
};

const paymentsResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetPaymentsQuery>;

const membershipsResult = (overrides: Record<string, unknown> = {}) =>
  ({
    data: [],
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  }) as unknown as ReturnType<typeof useGetMembershipsQuery>;

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <PaymentsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockMemberships.mockReturnValue(membershipsResult());
});

describe('payment history page', () => {
  it('renders its loading skeleton', () => {
    mockPayments.mockReturnValue(paymentsResult({ isLoading: true }));
    renderPage();
    expect(screen.getByLabelText('Loading payment history')).toBeInTheDocument();
  });

  it('renders an honest empty state', () => {
    mockPayments.mockReturnValue(
      paymentsResult({
        data: { items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      }),
    );
    renderPage();
    expect(screen.getByText('No payments yet')).toBeInTheDocument();
  });

  it('renders backend payment fields and status text', () => {
    mockPayments.mockReturnValue(
      paymentsResult({
        data: { items: [payment], pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
      }),
    );
    renderPage();
    expect(screen.getAllByText(payment.id).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Razorpay').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('table', { name: 'Payment history' }).querySelector('caption'),
    ).toHaveTextContent(/reference, plan, amount, status, provider, and dates/i);
    expect(document.querySelectorAll('article').length).toBeGreaterThan(0);
  });

  it('shows a retryable API failure', () => {
    mockPayments.mockReturnValue(paymentsResult({ isError: true }));
    renderPage();
    expect(screen.getByText('Payments unavailable')).toBeInTheDocument();
  });
});
