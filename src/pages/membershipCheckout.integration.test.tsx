import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import type * as CheckoutModule from '@/features/payments/services/phonePeCheckout';
import { PaymentPage } from './PaymentPage';

const { request, assign } = vi.hoisted(() => ({
  request: vi.fn<(config: { url: string; method?: string; data?: { planCode?: string }; params?: { planCode?: string } }) => Promise<unknown>>(),
  assign: vi.fn(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
vi.mock('@/features/payments/services/phonePeCheckout', async (importOriginal) => {
  const actual = await importOriginal<typeof CheckoutModule>();
  return {
    ...actual,
    beginPhonePeRedirect: (checkout: Parameters<typeof actual.beginPhonePeRedirect>[0]) =>
      actual.beginPhonePeRedirect(checkout, assign),
  };
});

const url = 'https://mercury-t2.phonepe.com/transact/pgv3?token=test&routingKey=W';
const plans = [
  { planCode: 'CareerHarborMembership', displayName: 'Job Application Access', price: 99 },
  { planCode: 'ReferralContactAccess', displayName: 'Referral Contact Access', price: 299 },
].map((plan) => ({
  ...plan,
  currency: 'INR',
  durationDays: 30,
  canUseStandardMembership: true,
  canUseAIApply: false,
  canUseAIApplyPro: false,
}));
let redirect: unknown;
let existingPending = false;
const pendingCalls: string[] = [];

beforeEach(() => {
  request.mockReset();
  assign.mockReset();
  redirect = url;
  existingPending = false;
  pendingCalls.length = 0;
  request.mockImplementation(
    (config: {
      url: string;
      method?: string;
      data?: { planCode?: string };
      params?: { planCode?: string };
    }) => {
      if (config.url.endsWith('/checkout'))
        return Promise.resolve({
          status: 201,
          data: {
            data: {
              merchantOrderId: 'ch_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              redirectUrl: redirect,
              expiresAtUtc: null,
              planName: 'Job Application Access',
              amountInMinorUnits: 11682,
              currencyCode: 'INR',
              durationDays: 30,
              returnTo: null,
              planCode: config.data?.planCode,
              pricing: { baseAmount: 99, taxRate: 18, taxAmount: 17.82, totalAmount: 116.82 },
            },
            message: 'PhonePe checkout created.',
          },
        });
      if (config.url.includes('pending-membership-checkout')) {
        pendingCalls.push(config.params?.planCode ?? 'ALL');
        return Promise.resolve({
          data: {
            data:
              existingPending && config.params?.planCode === 'CareerHarborMembership'
                ? {
                    publicReference: 'ch_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    planCode: 'CareerHarborMembership',
                    planName: 'Job Application Access',
                    status: 'Pending',
                    provider: 'PhonePe',
                    amount: 116.82,
                    currency: 'INR',
                    createdAtUtc: '2026-10-06T10:00:00Z',
                    expiresAtUtc: null,
                    canCancel: true,
                    canResume: false,
                    redirectUrl: null,
                  }
                : null,
          },
        });
      }
      if (config.url.includes('/plans')) return Promise.resolve({ data: { data: plans } });
      if (config.url.includes('/memberships')) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({
        data: { data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 5, totalPages: 0 } },
      });
    },
  );
});
afterEach(() => vi.restoreAllMocks());

const open = async (button = 'Get Access') => {
  const view = renderWithProviders(
    <RouterProvider
      router={createMemoryRouter([{ path: '/dashboard/membership', element: <PaymentPage /> }], {
        initialEntries: ['/dashboard/membership'],
      })}
    />,
  );
  await waitFor(() => expect(screen.getByRole('button', { name: button })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: button }));
  return view;
};

describe('membership checkout through the real RTK Query pipeline', () => {
  it.each(['Get Access', 'Get Referral Contact Access'])(
    'redirects %s exactly once from the raw 201 envelope before pending refresh',
    async (button) => {
      await open(button);
      assign.mockImplementation(() => expect(pendingCalls).toHaveLength(2));
      await userEvent.dblClick(screen.getByRole('button', { name: 'Continue to PhonePe' }));
      await waitFor(() => expect(assign).toHaveBeenCalledExactlyOnceWith(url));
      expect(
        request.mock.calls.filter(([config]) => config.url.endsWith('/checkout')),
      ).toHaveLength(1);
      expect(pendingCalls).toHaveLength(2);
      expect(
        screen.queryByRole('heading', { name: 'Payment in progress' }),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    undefined,
    'bad-url',
    'http://mercury-t2.phonepe.com/transact/pgv3',
    'https://mercury-t2.phonepe.com.evil.example/transact/pgv3',
  ])('rejects invalid raw response URL %s', async (value) => {
    redirect = value;
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));
    expect(await screen.findByText(/destination could not be verified/i)).toBeVisible();
    expect(assign).not.toHaveBeenCalled();
    expect(pendingCalls).toHaveLength(2);
  });

  it('still redirects when browser storage writes throw', async () => {
    await open();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable', 'SecurityError');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Continue to PhonePe' }));
    await waitFor(() => expect(assign).toHaveBeenCalledExactlyOnceWith(url));
    expect(pendingCalls).toHaveLength(2);
  });

  it('retains pending recovery on a fresh page load', async () => {
    existingPending = true;
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter([{ path: '/dashboard/membership', element: <PaymentPage /> }], {
          initialEntries: ['/dashboard/membership'],
        })}
      />,
    );
    expect(await screen.findByRole('heading', { name: 'Payment in progress' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel pending payment' })).toBeVisible();
    expect(assign).not.toHaveBeenCalled();
  });
});
