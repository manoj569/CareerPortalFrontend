import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import {
  useCreatePhonePeCheckoutMutation,
  useLazyGetPhonePeReturnQuery,
} from '@/features/payments/api/paymentsApi';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import {
  beginPhonePeRedirect,
  PHONEPE_ORDER_STORAGE_KEY,
} from '@/features/payments/services/phonePeCheckout';
import type * as PhonePeCheckoutModule from '@/features/payments/services/phonePeCheckout';
import {
  PhonePePaymentStatus,
  type PhonePeCheckoutResponse,
} from '@/features/payments/types/paymentModels';
import { useAppDispatch } from '@/hooks/reduxHooks';
import type * as ReduxHooksModule from '@/hooks/reduxHooks';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PaymentPage } from './PaymentPage';
import { PhonePeReturnPage } from './PhonePeReturnPage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => ({
  ...(await importOriginal<typeof DashboardApiModule>()),
  useGetMembershipsQuery: vi.fn(),
}));

vi.mock('@/features/payments/api/paymentsApi', async (importOriginal) => ({
  ...(await importOriginal<typeof PaymentsApiModule>()),
  useCreatePhonePeCheckoutMutation: vi.fn(),
  useLazyGetPhonePeReturnQuery: vi.fn(),
}));

vi.mock('@/features/payments/services/phonePeCheckout', async (importOriginal) => ({
  ...(await importOriginal<typeof PhonePeCheckoutModule>()),
  beginPhonePeRedirect: vi.fn(),
}));

vi.mock('@/hooks/reduxHooks', async (importOriginal) => ({
  ...(await importOriginal<typeof ReduxHooksModule>()),
  useAppDispatch: vi.fn(),
}));

const checkout: PhonePeCheckoutResponse = {
  amountInMinorUnits: 9_900,
  currencyCode: 'INR',
  durationDays: 30,
  expiresAtUtc: null,
  merchantOrderId: 'ch_order123',
  planName: 'Career Harbor Membership',
  redirectUrl: 'https://mercury.phonepe.com/checkout/test',
};

const createTrigger = vi.fn();
const statusTrigger = vi.fn();
const dispatch = vi.fn(() => ({ unsubscribe: vi.fn() }));
let createState = { isLoading: false };
let statusState: Record<string, unknown> = { isFetching: false };

const renderRoute = (path: string, element: React.ReactNode) => {
  const router = createMemoryRouter(
    [
      { path: ROUTES.MEMBERSHIP, element: <div>Membership destination</div> },
      { path: ROUTES.INTERVIEW_INSIGHTS, element: <div>Interview Insights destination</div> },
      { path: ROUTES.DASHBOARD, element: <div>Dashboard destination</div> },
      { path: ROUTES.PHONEPE_RETURN, element },
    ],
    { initialEntries: [path] },
  );
  return { router, ...renderWithProviders(<RouterProvider router={router} />) };
};

describe('PhonePe membership checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetMembershipsQuery).mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useGetMembershipsQuery
    >);
    createState = { isLoading: false };
    vi.mocked(useCreatePhonePeCheckoutMutation).mockImplementation(
      () =>
        [createTrigger, createState] as unknown as ReturnType<
          typeof useCreatePhonePeCheckoutMutation
        >,
    );
    createTrigger.mockReturnValue({ unwrap: () => Promise.resolve(checkout) });
    vi.mocked(beginPhonePeRedirect).mockReturnValue(true);
  });

  it('uses PhonePe without invoking or rendering Razorpay checkout', () => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Continue to PhonePe' })).toBeEnabled();
    expect(screen.queryByText(/razorpay/i)).not.toBeInTheDocument();
    expect(document.querySelector('script[src*="razorpay"]')).toBeNull();
  });

  it('creates checkout without arguments and sends the validated response to redirect handling', async () => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));

    expect(createTrigger).toHaveBeenCalledWith();
    expect(beginPhonePeRedirect).toHaveBeenCalledWith(checkout);
  });

  it('disables checkout and shows its loading label', () => {
    createState = { isLoading: true };
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Creating secure checkout…' })).toBeDisabled();
  });

  it('blocks an invalid provider redirect and offers a safe retry', async () => {
    vi.mocked(beginPhonePeRedirect).mockReturnValue(false);
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));

    expect(await screen.findByText(/destination could not be verified/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  });
});

describe('PhonePe return status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem(PHONEPE_ORDER_STORAGE_KEY, 'ch_order123');
    statusState = { isFetching: false };
    statusTrigger.mockReturnValue(Promise.resolve({ data: undefined }));
    vi.mocked(useLazyGetPhonePeReturnQuery).mockImplementation(
      () =>
        [statusTrigger, statusState] as unknown as ReturnType<typeof useLazyGetPhonePeReturnQuery>,
    );
    vi.mocked(useAppDispatch).mockReturnValue(
      dispatch as unknown as ReturnType<typeof useAppDispatch>,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['/payment/phonepe/return', 'Payment session not found'],
    ['/payment/phonepe/return?merchantOrderId=ch_other', 'Payment session not found'],
    ['/payment/phonepe/return?merchantOrderId=https://evil.example', 'Payment session not found'],
  ])('rejects missing, malformed, or mismatched browser sessions', (path, heading) => {
    renderRoute(path, <PhonePeReturnPage />);
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(statusTrigger).not.toHaveBeenCalled();
  });

  it('polls pending status every three seconds and cleans up on unmount', async () => {
    vi.useFakeTimers();
    statusState = {
      data: { merchantOrderId: 'ch_order123', status: PhonePePaymentStatus.Pending },
      fulfilledTimeStamp: 1,
      isFetching: false,
    };
    const { unmount } = renderRoute(
      '/payment/phonepe/return?merchantOrderId=ch_order123',
      <PhonePeReturnPage />,
    );
    expect(screen.getByRole('heading', { name: 'We are confirming your payment' })).toBeVisible();

    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(statusTrigger).toHaveBeenCalledTimes(2);
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(6_000));
    expect(statusTrigger).toHaveBeenCalledTimes(2);
  });

  it('shows backend-confirmed completion, clears the session, and refreshes memberships', () => {
    statusState = {
      data: { merchantOrderId: 'ch_order123', status: PhonePePaymentStatus.Completed },
      isFetching: false,
    };
    renderRoute('/payment/phonepe/return?merchantOrderId=ch_order123', <PhonePeReturnPage />);

    expect(screen.getByRole('heading', { name: 'Membership activated' })).toBeVisible();
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBeNull();
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('link', { name: 'Explore Interview Insights' })).toHaveAttribute(
      'href',
      ROUTES.INTERVIEW_INSIGHTS,
    );
  });

  it.each([
    [PhonePePaymentStatus.Failed, 'Payment not completed'],
    [PhonePePaymentStatus.Cancelled, 'Payment cancelled'],
  ])('renders safe %s status', (status, heading) => {
    statusState = { data: { merchantOrderId: 'ch_order123', status }, isFetching: false };
    renderRoute('/payment/phonepe/return?merchantOrderId=ch_order123', <PhonePeReturnPage />);
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Try again' })).toHaveAttribute(
      'href',
      ROUTES.MEMBERSHIP,
    );
  });

  it('shows a retryable safe API error without provider internals', () => {
    statusState = {
      error: {
        message: 'Safe failure',
        providerTransactionId: 'secret-provider-reference',
        rawProviderError: 'secret-webhook-value',
        status: 503,
      },
      isFetching: false,
    };
    renderRoute('/payment/phonepe/return?merchantOrderId=ch_order123', <PhonePeReturnPage />);

    expect(screen.getByRole('heading', { name: 'Payment status unavailable' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
    expect(
      screen.queryByText(/secret-provider-reference|secret-webhook-value/i),
    ).not.toBeInTheDocument();
  });
});
