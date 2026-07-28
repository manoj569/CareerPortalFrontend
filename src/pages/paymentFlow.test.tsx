import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import type { AuthState } from '@/features/auth/store/authSlice';
import type * as JobsApiModule from '@/features/jobs/api/jobsApi';
import { useGetJobDetailsQuery } from '@/features/jobs/api/jobsApi';
import type * as PaymentsApiModule from '@/features/payments/api/paymentsApi';
import {
  useConfirmRazorpayPaymentMutation,
  useCreateRazorpayOrderMutation,
} from '@/features/payments/api/paymentsApi';
import type * as CheckoutModule from '@/features/payments/services/razorpayCheckout';
import { openRazorpayCheckout } from '@/features/payments/services/razorpayCheckout';
import { MembershipStatus, type Membership } from '@/features/dashboard/types/dashboardModels';
import {
  EmploymentType,
  ExperienceLevel,
  WorkplaceType,
  type PublicJobDetails,
} from '@/features/jobs/types/jobModels';
import {
  PaymentProvider,
  PaymentStatus,
  type Payment,
  type PaymentOrder,
} from '@/features/payments/types/paymentModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { PaymentPage } from './PaymentPage';

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardApiModule>();
  return { ...actual, useGetMembershipsQuery: vi.fn() };
});

vi.mock('@/features/jobs/api/jobsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof JobsApiModule>();
  return { ...actual, useGetJobDetailsQuery: vi.fn() };
});

vi.mock('@/features/payments/api/paymentsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof PaymentsApiModule>();
  return {
    ...actual,
    useConfirmRazorpayPaymentMutation: vi.fn(),
    useCreateRazorpayOrderMutation: vi.fn(),
  };
});

vi.mock('@/features/payments/services/razorpayCheckout', async (importOriginal) => {
  const actual = await importOriginal<typeof CheckoutModule>();
  return { ...actual, openRazorpayCheckout: vi.fn() };
});

const mockMemberships = vi.mocked(useGetMembershipsQuery);
const mockJobDetails = vi.mocked(useGetJobDetailsQuery);
const mockCreateOrder = vi.mocked(useCreateRazorpayOrderMutation);
const mockConfirmPayment = vi.mocked(useConfirmRazorpayPaymentMutation);
const mockCheckout = vi.mocked(openRazorpayCheckout);
const jobId = '5aeb6d48-035e-4f58-aa6f-c222ffe27e97';
const paymentId = '721e999a-3b15-46aa-aa66-bfdfd174ba14';
const membershipId = '427ac857-ded2-4b2e-94eb-807601308707';
const refetchMemberships = vi.fn();
let confirmTrigger = vi.fn();

const job: PublicJobDetails = {
  benefits: null,
  categoryId: '51741c58-0587-4c68-866e-acfe9b36836c',
  categoryName: 'Engineering',
  companyDescription: null,
  companyId: 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276',
  companyLogoUrl: null,
  companyName: 'Northstar Labs',
  companySlug: 'northstar',
  companyWebsiteUrl: null,
  currencyCode: 'INR',
  description: 'Build reliable products.',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00:00Z',
  id: jobId,
  isFeatured: false,
  location: 'Pune',
  maximumSalary: null,
  minimumSalary: null,
  publishedAtUtc: '2026-07-20T00:00:00Z',
  referenceNumber: 'JOB-100',
  requirements: null,
  responsibilities: null,
  slug: 'frontend-engineer',
  title: 'Frontend Engineer',
  workplaceType: WorkplaceType.Hybrid,
};

const order: PaymentOrder = {
  amountInMinorUnits: 49900,
  currencyCode: 'INR',
  keyId: 'rzp_test_public',
  membershipId,
  paymentId,
  providerOrderId: 'order_public_reference',
  receipt: 'receipt_public_reference',
};

const paidPayment: Payment = {
  amount: 499,
  createdAtUtc: '2026-07-28T08:00:00Z',
  currencyCode: 'INR',
  id: paymentId,
  membershipId,
  paidAtUtc: '2026-07-28T08:01:00Z',
  provider: PaymentProvider.Razorpay,
  providerOrderId: order.providerOrderId,
  providerPaymentId: 'pay_public_reference',
  status: PaymentStatus.Paid,
};

const activeMembership: Membership = {
  autoRenew: false,
  companyId: job.companyId,
  companyName: job.companyName,
  endsAtUtc: '2099-07-28T00:00:00Z',
  id: membershipId,
  planName: 'Company access',
  startsAtUtc: '2026-07-28T00:00:00Z',
  status: MembershipStatus.Active,
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

const mutationResult = <T,>(result: Promise<T>) => {
  const unwrap = vi.fn(() => result);
  const trigger = vi.fn(() => ({ unwrap }));
  return {
    tuple: [trigger, { isLoading: false }] as const,
    trigger,
    unwrap,
  };
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderPaymentPage = (trackedPaymentId?: string) => {
  const router = createMemoryRouter(
    [
      { path: '/payment', element: <PaymentPage /> },
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
      initialEntries: [
        `/payment?jobId=${jobId}&returnTo=${encodeURIComponent(`/jobs/${job.slug}`)}${trackedPaymentId ? `&paymentId=${trackedPaymentId}` : ''}`,
      ],
    },
  );
  return renderWithProviders(<RouterProvider router={router} />, { auth });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockJobDetails.mockReturnValue(queryResult(job) as ReturnType<typeof useGetJobDetailsQuery>);
  mockMemberships.mockReturnValue({
    ...(queryResult([]) as ReturnType<typeof useGetMembershipsQuery>),
    refetch: refetchMemberships,
  });
  const create = mutationResult(Promise.resolve(order));
  mockCreateOrder.mockReturnValue(
    create.tuple as unknown as ReturnType<typeof useCreateRazorpayOrderMutation>,
  );
  const confirm = mutationResult(Promise.resolve(paidPayment));
  confirmTrigger = confirm.trigger;
  mockConfirmPayment.mockReturnValue(
    confirm.tuple as unknown as ReturnType<typeof useConfirmRazorpayPaymentMutation>,
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

describe('payment page', () => {
  it('shows a loading plan state', () => {
    mockJobDetails.mockReturnValue(
      queryResult(undefined, { isLoading: true }) as ReturnType<typeof useGetJobDetailsQuery>,
    );
    renderPaymentPage();
    expect(screen.getByLabelText('Loading payment plan')).toBeInTheDocument();
  });

  it('shows a retryable plan/access API failure', () => {
    mockMemberships.mockReturnValue(
      queryResult(undefined, { isError: true }) as ReturnType<typeof useGetMembershipsQuery>,
    );
    renderPaymentPage();
    expect(screen.getByText('Access details unavailable')).toBeInTheDocument();
  });

  it('blocks duplicate purchase when verified access is already active', () => {
    mockMemberships.mockReturnValue(
      queryResult([activeMembership]) as ReturnType<typeof useGetMembershipsQuery>,
    );
    renderPaymentPage();
    expect(screen.getByText(/access already active/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pay securely/i })).not.toBeInTheDocument();
  });

  it('creates a backend order and opens checkout with that exact order', async () => {
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: /pay securely/i }));
    await waitFor(() => expect(mockCheckout).toHaveBeenCalled());
    expect(mockCheckout.mock.calls[0]?.[0].order).toEqual(order);
  });

  it('handles checkout dismissal without verifying payment', async () => {
    mockCheckout.mockResolvedValue({ type: 'dismissed' });
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: /pay securely/i }));
    expect(await screen.findByText('Failed destination')).toBeInTheDocument();
    expect(confirmTrigger).not.toHaveBeenCalled();
  });

  it('handles a gateway payment failure', async () => {
    mockCheckout.mockResolvedValue({ type: 'failed' });
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: /pay securely/i }));
    expect(await screen.findByText('Failed destination')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('reason=failed');
  });

  it('shows success only after backend verification and refreshes entitlement', async () => {
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: /pay securely/i }));
    expect(await screen.findByText('Success destination')).toBeInTheDocument();
    expect(refetchMemberships).toHaveBeenCalledOnce();
  });

  it('routes a definite backend verification rejection to failure', async () => {
    const unwrap = vi.fn().mockRejectedValue({ message: 'Invalid signature', status: 400 });
    const trigger = vi.fn(() => ({ unwrap }));
    mockConfirmPayment.mockReturnValue([trigger, { isLoading: false }] as unknown as ReturnType<
      typeof useConfirmRazorpayPaymentMutation
    >);
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: /pay securely/i }));
    expect(await screen.findByText('Failed destination')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('reason=verification');
  });

  it('routes a non-paid backend verification response to pending', async () => {
    const confirm = mutationResult(
      Promise.resolve({ ...paidPayment, paidAtUtc: null, status: PaymentStatus.Pending }),
    );
    mockConfirmPayment.mockReturnValue(
      confirm.tuple as unknown as ReturnType<typeof useConfirmRazorpayPaymentMutation>,
    );
    renderPaymentPage();
    await userEvent.click(screen.getByRole('button', { name: /pay securely/i }));
    expect(await screen.findByText('Pending destination')).toBeInTheDocument();
  });

  it('resumes a refreshed in-flight attempt on the pending status route', async () => {
    renderPaymentPage(paymentId);
    expect(await screen.findByText('Pending destination')).toBeInTheDocument();
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
    const button = screen.getByRole('button', { name: /pay securely/i });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(create.trigger).toHaveBeenCalledOnce();
    resolveOrder?.(order);
  });
});
