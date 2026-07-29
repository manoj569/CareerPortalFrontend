import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthState } from '@/features/auth/store/authSlice';
import { MembershipStatus, type Membership } from '@/features/dashboard/types/dashboardModels';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import {
  useConfirmRazorpayPaymentMutation,
  useCreateRazorpayOrderMutation,
  useGetPaymentStatusQuery,
  useReconcileRazorpayPaymentMutation,
} from '@/features/payments/api/paymentsApi';
import type * as CheckoutModule from '@/features/payments/services/razorpayCheckout';
import { openRazorpayCheckout } from '@/features/payments/services/razorpayCheckout';
import {
  PaymentProvider,
  PaymentStatus,
  type Payment,
  type PaymentOrder,
  type PaymentStatusResponse,
} from '@/features/payments/types/paymentModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { PaymentPage } from './PaymentPage';

vi.mock('@/features/payments/api/paymentsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PaymentsApiModule>();
  return {
    ...actual,
    useConfirmRazorpayPaymentMutation: vi.fn(),
    useCreateRazorpayOrderMutation: vi.fn(),
    useGetPaymentStatusQuery: vi.fn(),
    useReconcileRazorpayPaymentMutation: vi.fn(),
  };
});

vi.mock('@/features/payments/services/razorpayCheckout', async (importOriginal) => {
  const actual = await importOriginal<typeof CheckoutModule>();
  return { ...actual, openRazorpayCheckout: vi.fn() };
});

const mockStatus = vi.mocked(useGetPaymentStatusQuery);
const mockCreateOrder = vi.mocked(useCreateRazorpayOrderMutation);
const mockConfirmPayment = vi.mocked(useConfirmRazorpayPaymentMutation);
const mockReconcilePayment = vi.mocked(useReconcileRazorpayPaymentMutation);
const mockCheckout = vi.mocked(openRazorpayCheckout);
const paymentId = '721e999a-3b15-46aa-aa66-bfdfd174ba14';
const membershipId = '427ac857-ded2-4b2e-94eb-807601308707';
let createTrigger = vi.fn();
let confirmTrigger = vi.fn();
let reconcileTrigger = vi.fn();
let statusRefetch = vi.fn();

const order: PaymentOrder = {
  amountInMinorUnits: 9_900,
  currencyCode: 'INR',
  durationDays: 30,
  keyId: 'rzp_test_public',
  membershipId,
  paymentId,
  planName: 'Candidate Membership',
  providerOrderId: 'order_public_reference',
  receipt: 'receipt_public_reference',
};

const paidPayment: Payment = {
  amount: 99,
  createdAtUtc: '2026-07-28T08:00:00Z',
  currencyCode: 'INR',
  id: paymentId,
  lastReconciledAtUtc: null,
  membershipId,
  paidAtUtc: '2026-07-28T08:01:00Z',
  provider: PaymentProvider.Razorpay,
  providerOrderCreatedAtUtc: '2026-07-28T08:00:00Z',
  providerOrderId: order.providerOrderId,
  providerPaymentId: 'pay_public_reference',
  status: PaymentStatus.Paid,
};

const pendingPayment: Payment = {
  ...paidPayment,
  paidAtUtc: null,
  providerPaymentId: null,
  status: PaymentStatus.Pending,
};

const activeMembership: Membership = {
  autoRenew: false,
  endsAtUtc: '2099-07-28T00:00:00Z',
  id: membershipId,
  planName: 'Candidate Membership',
  startsAtUtc: '2026-07-28T00:00:00Z',
  status: MembershipStatus.Active,
};

const emptyStatus: PaymentStatusResponse = {
  latestPayment: null,
  membership: null,
};

const activeStatus: PaymentStatusResponse = {
  latestPayment: paidPayment,
  membership: activeMembership,
};

const auth: AuthState = {
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
  isSubmitting: false,
  status: 'authenticated',
  user: {
    email: 'candidate@example.com',
    firstName: 'Avery',
    id: 'candidate-id',
    lastName: 'Patel',
    role: UserRole.Candidate,
  },
};

const statusResult = (data?: PaymentStatusResponse, overrides: Record<string, unknown> = {}) =>
  ({
    data,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: statusRefetch,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetPaymentStatusQuery>;

const mutationResult = <T,>(result: Promise<T>) => {
  const unwrap = vi.fn(() => result);
  const trigger = vi.fn(() => ({ unwrap }));
  return {
    tuple: [trigger, { isLoading: false }] as const,
    trigger,
  };
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderPaymentPage = (trackedPaymentId?: string) => {
  const search = new URLSearchParams({
    returnTo: '/jobs/frontend-engineer?apply=1',
  });
  if (trackedPaymentId) search.set('paymentId', trackedPaymentId);

  const router = createMemoryRouter(
    [
      { path: '/dashboard/membership', element: <PaymentPage /> },
      {
        path: '/payment/success',
        element: (
          <>
            <p>Success destination</p>
            <LocationProbe />
          </>
        ),
      },
      {
        path: '/payment/pending',
        element: (
          <>
            <p>Pending destination</p>
            <LocationProbe />
          </>
        ),
      },
      {
        path: '/payment/failed',
        element: (
          <>
            <p>Failed destination</p>
            <LocationProbe />
          </>
        ),
      },
    ],
    {
      initialEntries: [`/dashboard/membership?${search.toString()}`],
    },
  );
  return renderWithProviders(<RouterProvider router={router} />, { auth });
};

beforeEach(() => {
  vi.clearAllMocks();
  statusRefetch = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue(activeStatus),
  }));
  mockStatus.mockReturnValue(statusResult(emptyStatus));

  const create = mutationResult(Promise.resolve(order));
  createTrigger = create.trigger;
  mockCreateOrder.mockReturnValue(
    create.tuple as unknown as ReturnType<typeof useCreateRazorpayOrderMutation>,
  );

  const confirm = mutationResult(Promise.resolve(paidPayment));
  confirmTrigger = confirm.trigger;
  mockConfirmPayment.mockReturnValue(
    confirm.tuple as unknown as ReturnType<typeof useConfirmRazorpayPaymentMutation>,
  );

  const reconcile = mutationResult(Promise.resolve(pendingPayment));
  reconcileTrigger = reconcile.trigger;
  mockReconcilePayment.mockReturnValue(
    reconcile.tuple as unknown as ReturnType<typeof useReconcileRazorpayPaymentMutation>,
  );

  mockCheckout.mockResolvedValue({
    response: {
      razorpay_order_id: order.providerOrderId,
      razorpay_payment_id: 'pay_public_reference',
      razorpay_signature: 'a'.repeat(64),
    },
    type: 'success',
  });
});

describe('Candidate membership checkout', () => {
  it('shows a loading membership state', () => {
    mockStatus.mockReturnValue(statusResult(undefined, { isLoading: true }));
    renderPaymentPage();
    expect(screen.getByLabelText('Loading membership plan')).toBeInTheDocument();
  });

  it('blocks checkout until current backend status can be loaded', () => {
    mockStatus.mockReturnValue(statusResult(undefined, { isError: true }));
    renderPaymentPage();
    expect(screen.getByText('Membership status unavailable')).toBeInTheDocument();
  });

  it('blocks purchase when backend membership is already active', () => {
    mockStatus.mockReturnValue(statusResult(activeStatus));
    renderPaymentPage();
    expect(screen.getByText(/^Membership is active/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /pay securely with razorpay/i }),
    ).not.toBeInTheDocument();
  });

  it('creates one trusted backend order and opens checkout with that response', async () => {
    renderPaymentPage();
    await userEvent.click(
      screen.getByRole('button', { name: /pay securely with razorpay test mode/i }),
    );
    await waitFor(() => expect(mockCheckout).toHaveBeenCalledOnce());
    expect(createTrigger).toHaveBeenCalledWith();
    expect(mockCheckout.mock.calls[0]?.[0].order).toEqual(order);
  });

  it('handles checkout dismissal without submitting confirmation', async () => {
    mockCheckout.mockResolvedValue({ type: 'dismissed' });
    renderPaymentPage();
    await userEvent.click(
      screen.getByRole('button', { name: /pay securely with razorpay test mode/i }),
    );
    expect(await screen.findByText('Failed destination')).toBeInTheDocument();
    expect(confirmTrigger).not.toHaveBeenCalled();
  });

  it('handles a gateway failure without exposing provider details', async () => {
    mockCheckout.mockResolvedValue({ type: 'failed' });
    renderPaymentPage();
    await userEvent.click(
      screen.getByRole('button', { name: /pay securely with razorpay test mode/i }),
    );
    expect(await screen.findByText('Failed destination')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('reason=failed');
  });

  it('shows success only after backend confirmation and refreshed active membership', async () => {
    renderPaymentPage();
    await userEvent.click(
      screen.getByRole('button', { name: /pay securely with razorpay test mode/i }),
    );
    expect(await screen.findByText('Success destination')).toBeInTheDocument();
    expect(confirmTrigger).toHaveBeenCalledWith({
      paymentId,
      request: {
        razorpayOrderId: order.providerOrderId,
        razorpayPaymentId: 'pay_public_reference',
        razorpaySignature: 'a'.repeat(64),
      },
    });
    expect(statusRefetch).toHaveBeenCalledOnce();
  });

  it('routes a definite backend confirmation rejection to failure', async () => {
    const unwrap = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('Invalid signature'), { status: 400 }));
    const trigger = vi.fn(() => ({ unwrap }));
    mockConfirmPayment.mockReturnValue([trigger, { isLoading: false }] as unknown as ReturnType<
      typeof useConfirmRazorpayPaymentMutation
    >);
    renderPaymentPage();
    await userEvent.click(
      screen.getByRole('button', { name: /pay securely with razorpay test mode/i }),
    );
    expect(await screen.findByText('Failed destination')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('reason=verification');
  });

  it('routes an unconfirmed backend response to pending', async () => {
    const confirm = mutationResult(Promise.resolve(pendingPayment));
    mockConfirmPayment.mockReturnValue(
      confirm.tuple as unknown as ReturnType<typeof useConfirmRazorpayPaymentMutation>,
    );
    renderPaymentPage();
    await userEvent.click(
      screen.getByRole('button', { name: /pay securely with razorpay test mode/i }),
    );
    expect(await screen.findByText('Pending destination')).toBeInTheDocument();
  });

  it('resumes a refreshed pending payment without creating another order', async () => {
    mockStatus.mockReturnValue(statusResult({ latestPayment: pendingPayment, membership: null }));
    renderPaymentPage(paymentId);
    expect(await screen.findByText('Pending destination')).toBeInTheDocument();
    expect(createTrigger).not.toHaveBeenCalled();
  });

  it('reconciles a pending payment through the backend', async () => {
    mockStatus.mockReturnValue(statusResult({ latestPayment: pendingPayment, membership: null }));
    const reconcile = mutationResult(Promise.resolve(paidPayment));
    reconcileTrigger = reconcile.trigger;
    mockReconcilePayment.mockReturnValue(
      reconcile.tuple as unknown as ReturnType<typeof useReconcileRazorpayPaymentMutation>,
    );
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: 'Reconcile' }));
    expect(reconcileTrigger).toHaveBeenCalledWith(paymentId);
    expect(await screen.findByText('Success destination')).toBeInTheDocument();
  });

  it('prevents duplicate order creation from repeated clicks', async () => {
    let resolveOrder: ((value: PaymentOrder) => void) | undefined;
    const deferredOrder = new Promise<PaymentOrder>((resolve) => {
      resolveOrder = resolve;
    });
    const create = mutationResult(deferredOrder);
    mockCreateOrder.mockReturnValue(
      create.tuple as unknown as ReturnType<typeof useCreateRazorpayOrderMutation>,
    );
    renderPaymentPage();
    const button = screen.getByRole('button', {
      name: /pay securely with razorpay test mode/i,
    });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(create.trigger).toHaveBeenCalledOnce();
    resolveOrder?.(order);
  });
});
