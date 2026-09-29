import userEvent from '@testing-library/user-event';
import { act, screen, waitFor, within } from '@testing-library/react';
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
  useGetPaymentsQuery,
} from '@/features/payments/api/paymentsApi';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import {
  beginPhonePeRedirect,
  PHONEPE_ORDER_STORAGE_KEY,
  PHONEPE_RETURN_TO_STORAGE_KEY,
  resumePhonePeRedirect,
} from '@/features/payments/services/phonePeCheckout';
import type * as PhonePeCheckoutModule from '@/features/payments/services/phonePeCheckout';
import {
  PhonePePaymentStatus,
  PaymentStatus,
  PaymentProvider,
  type Payment,
  MembershipCheckoutStatus,
  type PendingMembershipCheckoutResponse,
  type PhonePeCheckoutResponse,
} from '@/features/payments/types/paymentModels';
import { useAppDispatch } from '@/hooks/reduxHooks';
import type * as ReduxHooksModule from '@/hooks/reduxHooks';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PaymentPage } from './PaymentPage';
import { PhonePeReturnPage } from './PhonePeReturnPage';
import { useGetAIApplyPlansQuery } from '@/features/aiApply/api/aiApplyApi';
import type * as AIApplyApiModule from '@/features/aiApply/api/aiApplyApi';
import type { MembershipPlan } from '@/features/aiApply/types/aiApplyModels';

vi.mock('@/features/aiApply/api/aiApplyApi', async (importOriginal) => ({
  ...(await importOriginal<typeof AIApplyApiModule>()),
  useGetAIApplyPlansQuery: vi.fn(),
}));

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
  useGetPaymentsQuery: vi.fn(),
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
  planCode: 'CareerHarborMembership',
  returnTo: null,
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
      { path: ROUTES.REFERRAL_CONTACT_DETAILS, element: <div>Referral contact destination</div> },
      { path: ROUTES.PHONEPE_RETURN, element },
      { path: ROUTES.PHONEPE_RETURN_LEGACY, element },
    ],
    { initialEntries: [path] },
  );
  return { router, ...renderWithProviders(<RouterProvider router={router} />) };
};

describe('PhonePe membership checkout', () => {
  const renderMembership = (query = '') =>
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [`${ROUTES.MEMBERSHIP}${query}`],
        })}
      />,
    );
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(useGetPaymentsQuery).mockReturnValue({
      data: { items: [] },
      refetch: vi.fn(),
    });
    vi.mocked(useLazyGetPhonePeReturnQuery).mockReturnValue([
      statusTrigger,
      { isFetching: false },
    ] as unknown as ReturnType<typeof useLazyGetPhonePeReturnQuery>);
    vi.mocked(useGetMembershipsQuery).mockReturnValue({
      data: [],
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMembershipsQuery>);
    vi.mocked(useGetAIApplyPlansQuery).mockReturnValue({
      data: [
        {
          planCode: 'CareerHarborMembership',
          displayName: 'Job Application Access',
          price: 99,
          currency: 'INR',
          durationDays: 30,
          canUseStandardMembership: true,
          canUseAIApply: false,
          canUseAIApplyPro: false,
        },
        {
          planCode: 'ReferralContactAccess',
          displayName: 'Referral Contact Access',
          price: 299,
          currency: 'INR',
          durationDays: 30,
          canUseStandardMembership: true,
          canUseAIApply: true,
          canUseAIApplyPro: false,
        },
        {
          planCode: 'AIApplyPro',
          displayName: 'AI Apply Pro',
          price: 1499,
          currency: 'INR',
          durationDays: 30,
          canUseStandardMembership: true,
          canUseAIApply: true,
          canUseAIApplyPro: true,
        },
      ],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    pendingState = { data: null, isError: false, isLoading: false, refetch: vi.fn() };
    vi.mocked(useGetPendingMembershipCheckoutQuery).mockImplementation(
      (plan) =>
        (plan === 'CareerHarborMembership'
          ? pendingState
          : { ...pendingState, data: null }) as unknown as ReturnType<
          typeof useGetPendingMembershipCheckoutQuery
        >,
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

  it.each(['CareerHarborMembership', 'ReferralContactAccess'])(
    'isolates a pending %s checkout from the other plan',
    (pendingPlan) => {
      vi.mocked(useGetPendingMembershipCheckoutQuery).mockImplementation(
        (plan) =>
          ({
            ...pendingState,
            data:
              plan === pendingPlan
                ? { ...pendingCheckout, amount: 299, planCode: pendingPlan }
                : null,
          }) as unknown as ReturnType<typeof useGetPendingMembershipCheckoutQuery>,
      );
      renderMembership();
      expect(screen.getByRole('heading', { name: 'Payment in progress' })).toBeVisible();
      expect(
        screen.getByRole('button', {
          name:
            pendingPlan === 'ReferralContactAccess' ? 'Get Access' : 'Get Referral Contact Access',
        }),
      ).toBeEnabled();
      expect(screen.getAllByText('₹299.00')).toHaveLength(2);
      expect(screen.queryByText(/GST/)).not.toBeInTheDocument();
    },
  );

  const failedPayment = (planCode: string | null): Payment => ({
    id: 'failed-payment',
    planCode,
    planName: null,
    amount: 299,
    pricing: null,
    currencyCode: 'INR',
    status: PaymentStatus.Failed,
    provider: PaymentProvider.PhonePe,
    providerOrderId: 'ch_old_order',
    providerPaymentId: null,
    paidAtUtc: null,
    membershipId: null,
    createdAtUtc: '2026-09-15T10:00:00Z',
    providerOrderCreatedAtUtc: null,
    lastReconciledAtUtc: null,
  });

  it.each(['CareerHarborMembership', 'ReferralContactAccess'])(
    'retries failed %s with that same plan and current backend pricing',
    async (planCode) => {
      const payment = failedPayment(planCode);
      vi.mocked(useGetPaymentsQuery).mockReturnValue({
        data: { items: [payment] },
        refetch: vi.fn(),
      });
      const plan: MembershipPlan = {
        planCode,
        displayName: planCode,
        price: 123,
        currency: 'INR',
        durationDays: 30,
        canUseStandardMembership: true,
        canUseAIApply: false,
        canUseAIApplyPro: false,
        pricing: { baseAmount: 123, taxRate: 7, taxAmount: 8.61, totalAmount: 131.61 },
      };
      vi.mocked(useGetAIApplyPlansQuery).mockReturnValue({
        data: [plan],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
      createTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ ...checkout, planCode }) });
      renderMembership();
      expect(screen.getAllByText(/299\.00/).length).toBeGreaterThan(0);
      await userEvent.click(
        within(screen.getByRole('table', { name: 'Payment history' })).getByRole('button', {
          name: 'Retry payment',
        }),
      );
      expect(createTrigger).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Pay ₹131.61' })).toBeEnabled();
      await userEvent.click(screen.getByRole('button', { name: 'Pay ₹131.61' }));
      expect(createTrigger).toHaveBeenCalledTimes(1);
      expect(createTrigger).toHaveBeenCalledWith({ planCode, returnTo: undefined });
      expect(payment.status).toBe(PaymentStatus.Failed);
      expect(payment.amount).toBe(299);
    },
  );

  it.each(['unknown', 'active', 'pending'])(
    'does not offer an unsafe retry when the plan is %s',
    (reason) => {
      vi.mocked(useGetPaymentsQuery).mockReturnValue({
        data: { items: [failedPayment(reason === 'unknown' ? null : 'CareerHarborMembership')] },
        refetch: vi.fn(),
      });
      if (reason === 'active')
        vi.mocked(useGetMembershipsQuery).mockReturnValue({
          data: [
            {
              id: 'active',
              planCode: 'CareerHarborMembership',
              planName: 'Job Application Access',
              status: 2,
              startsAtUtc: '2026-01-01T00:00:00Z',
              endsAtUtc: '2099-01-01T00:00:00Z',
              autoRenew: false,
            },
          ],
          refetch: vi.fn(),
        } as ReturnType<typeof useGetMembershipsQuery>);
      if (reason === 'pending') pendingState = { ...pendingState, data: pendingCheckout };
      renderMembership();
      const table = within(screen.getByRole('table', { name: 'Payment history' }));
      if (reason === 'unknown')
        expect(table.queryByRole('button', { name: 'Retry payment' })).not.toBeInTheDocument();
      else expect(table.getByRole('button', { name: 'Retry payment' })).toBeDisabled();
      expect(createTrigger).not.toHaveBeenCalled();
    },
  );

  it('uses backend pricing in the card and confirmation without recalculating tax', async () => {
    const plan: MembershipPlan = {
      planCode: 'CareerHarborMembership',
      displayName: 'Job Application Access',
      price: 123,
      currency: 'INR',
      durationDays: 30,
      canUseStandardMembership: true,
      canUseAIApply: false,
      canUseAIApplyPro: false,
      pricing: { baseAmount: 123, taxRate: 7, taxAmount: 8.61, totalAmount: 131.61 },
    };
    vi.mocked(useGetAIApplyPlansQuery).mockReturnValue({
      data: [plan],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderMembership();
    const card = within(screen.getByRole('article', { name: 'Job Application Access' }));
    expect(card.getByText('₹123.00')).toBeVisible();
    expect(card.getByText('+ ₹8.61 GST (7%)')).toBeVisible();
    await userEvent.click(card.getByRole('button', { name: 'Get Access' }));
    expect(screen.getByRole('button', { name: 'Pay ₹131.61' })).toBeEnabled();
    expect(createTrigger).not.toHaveBeenCalled();
  });

  it('preserves the safe referral return before redirect and prevents duplicate checkout', async () => {
    const returnTo = '/dashboard/jobs/referral/job-123/contact';
    let resolveCheckout: (value: PhonePeCheckoutResponse) => void = () => {
      throw new Error('Checkout not started');
    };
    createTrigger.mockReturnValue({
      unwrap: () =>
        new Promise<PhonePeCheckoutResponse>((resolve) => {
          resolveCheckout = resolve;
        }),
    });
    renderMembership(`?plan=ReferralContactAccess&returnTo=${encodeURIComponent(returnTo)}`);
    await userEvent.click(screen.getByRole('button', { name: 'Get Referral Contact Access' }));
    await userEvent.dblClick(screen.getByRole('button', { name: 'Continue to PhonePe' }));
    expect(createTrigger).toHaveBeenCalledTimes(1);
    expect(createTrigger).toHaveBeenCalledWith({ planCode: 'ReferralContactAccess', returnTo });
    vi.mocked(beginPhonePeRedirect).mockImplementation(() => {
      expect(sessionStorage.getItem(PHONEPE_RETURN_TO_STORAGE_KEY)).toBe(returnTo);
      return true;
    });
    await act(async () => {
      resolveCheckout({ ...checkout, planCode: 'ReferralContactAccess', returnTo });
      await Promise.resolve();
    });
  });

  it('ignores an external return URL and hides unsupported pending actions', async () => {
    vi.mocked(useGetPendingMembershipCheckoutQuery).mockImplementation(
      (plan) =>
        ({
          ...pendingState,
          data:
            plan === 'ReferralContactAccess'
              ? { ...pendingCheckout, canResume: false, canCancel: false }
              : null,
        }) as unknown as ReturnType<typeof useGetPendingMembershipCheckoutQuery>,
    );
    renderMembership('?returnTo=https%3A%2F%2Fevil.example');
    expect(screen.queryByRole('button', { name: 'Resume payment' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel pending payment' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check status' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Get Access' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));
    expect(createTrigger).toHaveBeenCalledWith({
      planCode: 'CareerHarborMembership',
      returnTo: undefined,
    });
  });

  it('uses PhonePe without invoking or rendering Razorpay checkout', () => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Get Access' })).toBeEnabled();
    expect(screen.getAllByText('Secure payment powered by PhonePe')).toHaveLength(2);
    expect(screen.queryByText(/razorpay/i)).not.toBeInTheDocument();
    expect(document.querySelector('script[src*="razorpay"]')).toBeNull();
  });

  it.each(['CareerHarborMembership', 'ReferralContactAccess'])(
    'keeps the other plan purchasable with active %s',
    (planCode) => {
      vi.mocked(useGetMembershipsQuery).mockReturnValue({
        data: [
          {
            id: 'active',
            planName: planCode,
            planCode,
            status: 2,
            startsAtUtc: '2026-01-01T00:00:00Z',
            endsAtUtc: '2099-01-01T00:00:00Z',
            autoRenew: false,
          },
        ],
        refetch: vi.fn(),
      } as ReturnType<typeof useGetMembershipsQuery>);
      renderWithProviders(
        <RouterProvider
          router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
            initialEntries: [ROUTES.MEMBERSHIP],
          })}
        />,
      );
      expect(screen.getByText('Your Active Access')).toBeVisible();
      expect(screen.getByText('Already active')).toBeVisible();
      expect(
        screen.getByRole('button', {
          name:
            planCode === 'CareerHarborMembership' ? 'Get Referral Contact Access' : 'Get Access',
        }),
      ).toBeEnabled();
      expect(
        screen.queryByRole('button', {
          name:
            planCode === 'CareerHarborMembership' ? 'Get Access' : 'Get Referral Contact Access',
        }),
      ).not.toBeInTheDocument();
    },
  );

  it('creates checkout with only the selected plan code and sends the response to redirect handling', async () => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Get Access' }));
    expect(createTrigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));

    expect(createTrigger).toHaveBeenCalledWith({
      planCode: 'CareerHarborMembership',
      returnTo: undefined,
    });
    expect(beginPhonePeRedirect).toHaveBeenCalledWith(checkout);
  });

  it.each([['Referral Contact Access', 'Get Referral Contact Access', 'ReferralContactAccess']])(
    'checks out the %s card with its exact plan code',
    async (_, buttonName, planCode) => {
      createTrigger.mockReturnValue({
        unwrap: () => Promise.resolve({ ...checkout, planCode }),
      });
      renderWithProviders(
        <RouterProvider
          router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
            initialEntries: [ROUTES.MEMBERSHIP],
          })}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: buttonName }));
      await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));
      expect(createTrigger).toHaveBeenCalledWith({ planCode, returnTo: undefined });
      expect(createTrigger.mock.calls[0]?.[0]).not.toHaveProperty('amount');
      expect(createTrigger.mock.calls[0]?.[0]).not.toHaveProperty('durationDays');
    },
  );

  it('disables checkout and shows its loading label', () => {
    createState = { isLoading: true };
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: ROUTES.MEMBERSHIP, element: <PaymentPage /> }], {
          initialEntries: [ROUTES.MEMBERSHIP],
        })}
      />,
    );

    expect(screen.getAllByRole('button', { name: /^Get / })).toHaveLength(2);
    screen
      .getAllByRole('button', { name: /^Get / })
      .forEach((button) => expect(button).toBeDisabled());
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
    await userEvent.click(screen.getByRole('button', { name: 'Get Access' }));
    expect(createTrigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));

    expect(await screen.findByText(/destination could not be verified/i)).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Get Access' })).toBeEnabled();
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
    await userEvent.click(screen.getByRole('button', { name: 'Get Access' }));
    expect(createTrigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));

    expect(refetch).toHaveBeenCalled();
    expect(screen.queryByText(/Internal conflict details/i)).not.toBeInTheDocument();
    pendingState = { ...pendingState, data: pendingCheckout };
    view.rerender(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: 'Payment in progress' })).toBeVisible();
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

    expect(screen.getByRole('heading', { name: 'Payment in progress' })).toBeVisible();
    expect(screen.getAllByText(/PhonePe/)[0]).toBeVisible();
    expect(screen.getAllByText(/₹99\.00/)[0]).toBeVisible();
    expect(screen.getByText(/^Pending$/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Get Access' })).not.toBeInTheDocument();
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
    sessionStorage.clear();
    vi.mocked(useGetPaymentsQuery).mockReturnValue({
      data: { items: [] },
      refetch: vi.fn(),
    });
    vi.mocked(useLazyGetPhonePeReturnQuery).mockReturnValue([
      statusTrigger,
      { isFetching: false },
    ] as unknown as ReturnType<typeof useLazyGetPhonePeReturnQuery>);
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

  it('requires the purchased plan, not an unrelated active membership', async () => {
    statusState = {
      data: {
        merchantOrderId: 'ch_order123',
        status: PhonePePaymentStatus.Completed,
        payment: { planCode: 'ReferralContactAccess' },
      },
      isFetching: false,
    };
    dispatch.mockImplementation(() => ({
      unsubscribe: vi.fn(),
      unwrap: () =>
        Promise.resolve([
          {
            id: 'job',
            planCode: 'CareerHarborMembership',
            status: 2,
            endsAtUtc: '2099-01-01T00:00:00Z',
          },
        ]),
    }));
    renderRoute(
      '/payment/phonepe/return?merchantOrderId=ch_order123&success=true',
      <PhonePeReturnPage />,
    );
    expect(await screen.findByText(/active membership could not yet be confirmed/)).toBeVisible();
    expect(screen.queryByText('Referral Contact Access activated')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBe('ch_order123');
  });

  it('keeps referral-specific success visible after clearing the completed order', async () => {
    statusState = {
      data: {
        merchantOrderId: 'ch_order123',
        status: PhonePePaymentStatus.Completed,
        payment: { planCode: 'ReferralContactAccess' },
      },
      isFetching: false,
    };
    dispatch.mockImplementation(() => ({
      unsubscribe: vi.fn(),
      unwrap: () =>
        Promise.resolve([
          {
            id: 'referral',
            planCode: 'ReferralContactAccess',
            status: 2,
            endsAtUtc: '2099-01-01T00:00:00Z',
          },
        ]),
    }));
    renderRoute('/payment/phonepe/return?merchantOrderId=ch_order123', <PhonePeReturnPage />);
    expect(
      await screen.findByRole('heading', { name: 'Referral Contact Access activated' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse Referral Jobs' })).toHaveAttribute(
      'href',
      '/dashboard/jobs?mode=referral',
    );
    expect(screen.queryByText('Payment session not found')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBeNull();
  });

  it('returns to the exact referral contact path only after matching activation', async () => {
    const returnTo = '/dashboard/jobs/referral/job-123/contact';
    sessionStorage.setItem(PHONEPE_RETURN_TO_STORAGE_KEY, returnTo);
    statusState = {
      data: {
        merchantOrderId: 'ch_order123',
        status: PhonePePaymentStatus.Completed,
        payment: { planCode: 'ReferralContactAccess' },
      },
      isFetching: false,
    };
    dispatch.mockImplementation(() => ({
      unsubscribe: vi.fn(),
      unwrap: () =>
        Promise.resolve([
          {
            id: 'referral',
            planCode: 'ReferralContactAccess',
            status: 2,
            endsAtUtc: '2099-01-01T00:00:00Z',
          },
        ]),
    }));
    const { router } = renderRoute(
      '/payment/phonepe/return?merchantOrderId=ch_order123',
      <PhonePeReturnPage />,
    );
    await waitFor(() => expect(router.state.location.pathname).toBe(returnTo));
    expect(sessionStorage.getItem(PHONEPE_RETURN_TO_STORAGE_KEY)).toBeNull();
  });

  it('does not infer successful payment from the return URL', () => {
    statusState = {
      data: { merchantOrderId: 'ch_order123', status: PhonePePaymentStatus.Pending },
      isFetching: false,
    };
    renderRoute(
      '/payment/phonepe/return?merchantOrderId=ch_order123&success=true&status=Completed',
      <PhonePeReturnPage />,
    );
    expect(screen.getByText('We are confirming your payment')).toBeVisible();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('renders the canonical return route and checks its merchantOrderId', async () => {
    statusState = {
      data: { merchantOrderId: 'ch_order123', status: PhonePePaymentStatus.Pending },
      isFetching: false,
    };
    renderRoute('/payment/phonepe/return?merchantOrderId=ch_order123', <PhonePeReturnPage />);

    expect(screen.getByRole('heading', { name: 'We are confirming your payment' })).toBeVisible();
    await waitFor(() =>
      expect(statusTrigger).toHaveBeenCalledWith(
        { merchantOrderId: 'ch_order123', returnTo: undefined },
        false,
      ),
    );
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
    await waitFor(() =>
      expect(statusTrigger).toHaveBeenCalledWith(
        { merchantOrderId: 'ch_order123', returnTo: undefined },
        false,
      ),
    );
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

  it('redirects a backend-confirmed active membership to the safe Interview Insights return path', async () => {
    statusState = {
      data: {
        merchantOrderId: 'ch_order123',
        status: PhonePePaymentStatus.Completed,
        payment: { planCode: 'CareerHarborMembership' },
      },
      isFetching: false,
    };
    sessionStorage.setItem(PHONEPE_RETURN_TO_STORAGE_KEY, ROUTES.INTERVIEW_INSIGHTS);
    dispatch.mockImplementation(
      () =>
        ({
          unsubscribe: vi.fn(),
          unwrap: () =>
            Promise.resolve([
              {
                id: 'membership',
                planName: 'Career Harbor Membership',
                status: 2,
                startsAtUtc: '2026-08-25T00:00:00Z',
                endsAtUtc: '2099-09-24T00:00:00Z',
                autoRenew: false,
              },
            ]),
        }) as never,
    );
    const { router } = renderRoute(
      '/payment/phonepe/return?merchantOrderId=ch_order123',
      <PhonePeReturnPage />,
    );

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.INTERVIEW_INSIGHTS));
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(PHONEPE_RETURN_TO_STORAGE_KEY)).toBeNull();
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
