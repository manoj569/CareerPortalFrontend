import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import {
  useCancelPendingMembershipCheckoutMutation,
  useCreatePhonePeCheckoutMutation,
  useGetPendingMembershipCheckoutQuery,
  useLazyGetPhonePeReturnQuery,
} from '@/features/payments/api/paymentsApi';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import {
  beginPhonePeRedirect,
  PHONEPE_ORDER_STORAGE_KEY,
  resumePhonePeRedirect,
} from '@/features/payments/services/phonePeCheckout';
import type * as PhonePeCheckoutModule from '@/features/payments/services/phonePeCheckout';
import {
  PhonePePaymentStatus,
  MembershipCheckoutStatus,
  type PendingMembershipCheckoutResponse,
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
  useCancelPendingMembershipCheckoutMutation: vi.fn(),
  useGetPendingMembershipCheckoutQuery: vi.fn(),
  useLazyGetPhonePeReturnQuery: vi.fn(),
}));

vi.mock('@/features/payments/services/phonePeCheckout', async (importOriginal) => ({
  ...(await importOriginal<typeof PhonePeCheckoutModule>()),
  beginPhonePeRedirect: vi.fn(),
  resumePhonePeRedirect: vi.fn(),
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
const cancelTrigger = vi.fn();
const statusTrigger = vi.fn();
const dispatch = vi.fn(() => ({ unsubscribe: vi.fn() }));
let createState = { isLoading: false };
let pendingState: Record<string, unknown> = {};
let statusState: Record<string, unknown> = { isFetching: false };

const pendingCheckout: PendingMembershipCheckoutResponse = {
  amount: 99,
  canCancel: true,
  canResume: true,
  createdAtUtc: '2026-08-24T10:30:00Z',
  currency: 'INR',
  provider: 'PhonePe',
  publicReference: 'ch_order123',
  redirectUrl: 'https://mercury.phonepe.com/checkout/resume',
  status: MembershipCheckoutStatus.Pending,
};

const renderRoute = (path: string, element: React.ReactNode) => {
  const router = createMemoryRouter(
    [
      { path: ROUTES.MEMBERSHIP, element: <div>Membership destination</div> },
      { path: ROUTES.INTERVIEW_INSIGHTS, element: <div>Interview Insights destination</div> },
      { path: ROUTES.DASHBOARD, element: <div>Dashboard destination</div> },
      { path: ROUTES.PHONEPE_RETURN, element },
      { path: ROUTES.PHONEPE_RETURN_LEGACY, element },
    ],
    { initialEntries: [path] },
  );
  return { router, ...renderWithProviders(<RouterProvider router={router} />) };
};

describe('PhonePe membership checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetMembershipsQuery).mockReturnValue({
      data: [],
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMembershipsQuery>);
    pendingState = { data: null, isError: false, isLoading: false, refetch: vi.fn() };
    vi.mocked(useGetPendingMembershipCheckoutQuery).mockImplementation(
      () => pendingState as unknown as ReturnType<typeof useGetPendingMembershipCheckoutQuery>,
    );
    createState = { isLoading: false };
    vi.mocked(useCreatePhonePeCheckoutMutation).mockImplementation(
      () =>
        [createTrigger, createState] as unknown as ReturnType<
          typeof useCreatePhonePeCheckoutMutation
        >,
    );
    createTrigger.mockReturnValue({ unwrap: () => Promise.resolve(checkout) });
    cancelTrigger.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          ...pendingCheckout,
          canCancel: false,
          status: MembershipCheckoutStatus.Cancelled,
        }),
    });
    vi.mocked(useCancelPendingMembershipCheckoutMutation).mockReturnValue([
      cancelTrigger,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useCancelPendingMembershipCheckoutMutation>);
    vi.mocked(beginPhonePeRedirect).mockReturnValue(true);
    vi.mocked(resumePhonePeRedirect).mockReturnValue(true);
  });

  it('uses PhonePe without invoking or rendering Razorpay checkout', () => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Continue to Pay ₹99' })).toBeEnabled();
    expect(screen.getByText('Secure payment powered by PhonePe')).toBeVisible();
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
    await userEvent.click(screen.getByRole('button', { name: 'Continue to Pay ₹99' }));

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
    await userEvent.click(screen.getByRole('button', { name: 'Continue to Pay ₹99' }));

    expect(await screen.findByText(/destination could not be verified/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  });

  it('refreshes the pending card for a pending_membership_checkout conflict', async () => {
    const refetch = vi.fn().mockResolvedValue({ data: pendingCheckout });
    pendingState = { ...pendingState, refetch };
    createTrigger.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Internal conflict details'), {
            code: 'pending_membership_checkout',
            status: 409,
          }),
        ),
    });
    const router = createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
      initialEntries: [ROUTES.MEMBERSHIP],
    });
    const view = renderWithProviders(<RouterProvider router={router} />);
    await userEvent.click(screen.getByRole('button', { name: 'Continue to Pay ₹99' }));

    expect(refetch).toHaveBeenCalled();
    expect(screen.queryByText(/Internal conflict details/i)).not.toBeInTheDocument();
    pendingState = { ...pendingState, data: pendingCheckout };
    view.rerender(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: 'You have a pending payment' })).toBeVisible();
  });

  it('shows the authoritative pending checkout card and hides new checkout', () => {
    pendingState = { ...pendingState, data: pendingCheckout };
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    expect(screen.getByRole('heading', { name: 'You have a pending payment' })).toBeVisible();
    expect(screen.getAllByText(/PhonePe/)[0]).toBeVisible();
    expect(screen.getByText(/₹99\.00/)).toBeVisible();
    expect(screen.getByText(/Pending/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Continue to Pay ₹99' })).not.toBeInTheDocument();
  });

  it('resumes only through the validated PhonePe redirect helper', async () => {
    pendingState = { ...pendingState, data: pendingCheckout };
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Resume payment' }));

    expect(resumePhonePeRedirect).toHaveBeenCalledWith(
      pendingCheckout.publicReference,
      pendingCheckout.redirectUrl,
    );
  });

  it('confirms cancellation, sends only the public reference, and refreshes data', async () => {
    const pendingRefetch = vi.fn().mockResolvedValue({ data: null });
    const membershipRefetch = vi.fn().mockResolvedValue({ data: [] });
    pendingState = { ...pendingState, data: pendingCheckout, refetch: pendingRefetch };
    vi.mocked(useGetMembershipsQuery).mockReturnValue({
      data: [],
      refetch: membershipRefetch,
    } as ReturnType<typeof useGetMembershipsQuery>);
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel pending payment' }));
    expect(screen.getByRole('dialog', { name: 'Cancel this pending payment?' })).toBeVisible();
    expect(cancelTrigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel payment' }));

    expect(cancelTrigger).toHaveBeenCalledWith('ch_order123');
    expect(pendingRefetch).toHaveBeenCalled();
    expect(membershipRefetch).toHaveBeenCalled();
  });

  it('keeps the confirmation open and shows a safe cancellation error', async () => {
    pendingState = { ...pendingState, data: pendingCheckout };
    cancelTrigger.mockReturnValue({ unwrap: () => Promise.reject(new Error('provider secret')) });
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel pending payment' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel payment' }));

    expect(await screen.findByText(/could not cancel this pending payment safely/i)).toBeVisible();
    expect(screen.queryByText(/provider secret/i)).not.toBeInTheDocument();
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

  it('renders the canonical return route and checks its merchantOrderId', async () => {
    statusState = {
      data: { merchantOrderId: 'ch_order123', status: PhonePePaymentStatus.Pending },
      isFetching: false,
    };
    renderRoute('/payment/phonepe/return?merchantOrderId=ch_order123', <PhonePeReturnPage />);

    expect(screen.getByRole('heading', { name: 'We are confirming your payment' })).toBeVisible();
    await waitFor(() => expect(statusTrigger).toHaveBeenCalledWith('ch_order123', false));
  });

  it('normalizes a matching legacy order to the canonical route with replace', async () => {
    statusState = {
      data: { merchantOrderId: 'ch_order123', status: PhonePePaymentStatus.Pending },
      isFetching: false,
    };
    const { router } = renderRoute(
      '/payments/phonepe/return?order=ch_order123',
      <PhonePeReturnPage />,
    );

    await waitFor(() =>
      expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(
        '/payment/phonepe/return?merchantOrderId=ch_order123',
      ),
    );
    expect(router.state.historyAction).toBe('REPLACE');
    await waitFor(() => expect(statusTrigger).toHaveBeenCalledWith('ch_order123', false));
  });

  it.each(['/payments/phonepe/return', '/payments/phonepe/return?order=ch_other'])(
    'shows a safe state for an invalid legacy alias: %s',
    (path) => {
      renderRoute(path, <PhonePeReturnPage />);

      expect(screen.getByRole('heading', { name: 'Payment session not found' })).toBeVisible();
      expect(statusTrigger).not.toHaveBeenCalled();
    },
  );

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
