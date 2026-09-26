import { StrictMode } from 'react';
import { act, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AxiosError, CanceledError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { renderWithProviders } from '@/test/renderWithProviders';
import { careerGuidanceApi } from '../api/careerGuidanceApi';
import { financeApi } from '../api/financeApi';
import type { RazorpayConstructor } from '../services/razorpayCheckout';
import { CareerBookingStatus, CareerPaymentStatus, CareerSessionStatus, type CareerBookingResponse, type CareerCheckout, type CareerPaymentResponse } from '../types';
import BookingDetailPage from './BookingDetailPage';

const booking: CareerBookingResponse = {
  id: 'booking-1', consultantId: 'consultant-1', serviceId: 'service-1',
  startUtc: '2026-09-26T05:00:00Z', endUtc: '2026-09-26T05:30:00Z',
  consultantTimeZone: 'Asia/Dubai', serviceTitle: 'Career session', serviceType: 'Video',
  durationMinutes: 30, price: 500, currency: 'INR', status: CareerBookingStatus.Pending,
  questionnaire: { targetCompany: null, targetRole: null, yearsOfExperience: null,
    currentRoleOrStatus: null, sessionGoal: 'Plan my career', questions: null, notes: null },
  cancellationReason: null, cancelledByUserId: null, cancelledAtUtc: null,
  completedAtUtc: null, revision: 'revision-1', requiresPayment: true,
};
const captured: CareerPaymentResponse = {
  id: 'payment-1', bookingId: booking.id, gross: 500, currency: 'INR',
  commissionPercent: 10, commission: 50, net: 450, status: CareerPaymentStatus.Captured,
  providerOrderId: 'order_server', providerPaymentId: 'pay_server',
  paidAtUtc: '2026-09-25T12:00:00Z', requiresRefundReview: false, failureCode: null,
};
const checkout: CareerCheckout = {
  paymentId: 'payment-1', keyId: 'test_key', orderId: 'order_server', amount: 50000, currency: 'INR',
};
const originalAdapter = apiClient.defaults.adapter;
const adapter = vi.fn<AxiosAdapter>();
let currentBooking = booking;
let payment: CareerPaymentResponse | null = null;
let paymentFailure: 'network' | 'cancelled' | 500 | null = null;
let expired = false;
let options: ConstructorParameters<RazorpayConstructor>[0] | undefined;
const opened = vi.fn();
const closed = vi.fn();
let verification: Promise<void> = Promise.resolve();
let verifiedPayment = captured;
let verifiedBookingStatus = CareerBookingStatus.Confirmed;
const stores: ReturnType<typeof renderWithProviders>['store'][] = [];

// Exercise actual Axios interceptors + base query + RTK subscriptions. Like an
// Axios transport adapter, settle HTTP responses using the merged validateStatus.
function response(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  const result: AxiosResponse<unknown> = { config, data, status, statusText: String(status), headers: {} };
  if (config.validateStatus && !config.validateStatus(status)) {
    return Promise.reject(new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, result));
  }
  return Promise.resolve(result);
}
const ok = (config: InternalAxiosRequestConfig, data: unknown) => response(config, { data, message: null });
const calls = (suffix: string) => adapter.mock.calls.filter(([config]) => config.url?.endsWith(suffix));
function mount() {
  const router = createMemoryRouter([
    { path: '/career-guidance/bookings/:id', element: <BookingDetailPage /> },
    { path: '/away', element: <p>Away</p> },
    { path: '/career-guidance/bookings/:id/confirmed', element: <p>Verified booking confirmation destination</p> },
  ], { initialEntries: [`/career-guidance/bookings/${booking.id}`] });
  const result = renderWithProviders(<StrictMode><RouterProvider router={router} /></StrictMode>);
  stores.push(result.store);
  return { ...result, router };
}
async function checkoutButton() {
  const button = await screen.findByRole('button', { name: 'Continue to secure checkout' });
  await waitFor(() => expect(button).toBeEnabled());
  return button;
}
beforeEach(() => {
  currentBooking = { ...booking }; payment = null; paymentFailure = null; expired = false;
  options = undefined; verification = Promise.resolve();
  verifiedPayment = captured; verifiedBookingStatus = CareerBookingStatus.Confirmed;
  window.Razorpay = class {
    constructor(value: ConstructorParameters<RazorpayConstructor>[0]) { options = value; }
    open = opened;
    close = closed;
    on = vi.fn();
  };
  adapter.mockReset().mockImplementation(async config => {
    if (config.url?.endsWith('/payment/order')) {
      if (expired) return response(config, { code: 'reservation_expired', message: 'The unpaid booking reservation has expired.' }, 409);
      payment = { ...captured, status: CareerPaymentStatus.OrderCreated, paidAtUtc: null };
      return ok(config, checkout);
    }
    if (config.url?.endsWith('/payment/verify')) {
      await verification;
      payment = verifiedPayment; currentBooking = { ...booking, status: verifiedBookingStatus };
      return ok(config, verifiedPayment);
    }
    if (config.url?.endsWith('/payment/reconcile')) {
      payment = captured; currentBooking = { ...booking, status: CareerBookingStatus.Confirmed };
      return ok(config, captured);
    }
    if (config.url?.endsWith('/payment')) {
      if (paymentFailure === 'network') throw new AxiosError('Network Error', 'ERR_NETWORK', config);
      if (paymentFailure === 'cancelled') throw new CanceledError('Interrupted', config);
      if (paymentFailure === 500) return response(config, { message: 'Server failed' }, 500);
      return payment ? ok(config, payment) : response(config, { message: 'Payment not found.' }, 404);
    }
    if (config.url?.endsWith('/review') || config.url?.endsWith('/dispute')) return response(config, { message: 'Not found.' }, 404);
    if (config.url?.endsWith('/session') || config.url?.endsWith('/session/provision')) return ok(config, { status: CareerSessionStatus.Completed });
    if (config.url === `/career-guidance/bookings/${booking.id}`) return ok(config, currentBooking);
    throw new Error(`Unexpected request: ${config.method} ${config.url}`);
  });
  apiClient.defaults.adapter = adapter;
});
afterEach(() => {
  cleanup();
  stores.splice(0).forEach(store => store.dispatch(careerGuidanceApi.util.resetApiState()));
  apiClient.defaults.adapter = originalAdapter;
  delete window.Razorpay;
});

describe('Booking details payment lifecycle', () => {
  it('renders a pending 404 as a cached empty payment with enabled checkout and no irrelevant queries/actions', async () => {
    const { store } = mount();
    await checkoutButton();
    expect(screen.getByText('Payment has not been started.')).toBeInTheDocument();
    expect(financeApi.endpoints.getCareerPayment.select(booking.id)(store.getState())).toMatchObject({ status: 'fulfilled', data: null });
    expect(calls('/payment')).toHaveLength(1);
    for (const suffix of ['/review', '/session', '/dispute', '/payment/order']) expect(calls(suffix)).toHaveLength(0);
    expect(screen.queryByText('Open session')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Your review' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dispute or complaint' })).not.toBeInTheDocument();
  });

  it('creates one order on rapid clicks, uses server checkout values, and waits for backend verification before success', async () => {
    let finishVerification: () => void = () => { throw new Error('Verification not initialized'); };
    verification = new Promise<void>(resolve => { finishVerification = resolve; });
    mount();
    const button = await checkoutButton();
    fireEvent.click(button); fireEvent.click(button);
    await waitFor(() => expect(opened).toHaveBeenCalledTimes(1));
    expect(calls('/payment/order')).toHaveLength(1);
    expect(options).toMatchObject({ key: checkout.keyId, order_id: checkout.orderId, amount: checkout.amount, currency: checkout.currency, retry: { enabled: false } });
    if (!options) throw new Error('Expected Razorpay options');
    act(() => options?.handler({ razorpay_order_id: 'order_server', razorpay_payment_id: 'pay_server', razorpay_signature: 'signature_test' }));
    await waitFor(() => expect(calls('/payment/verify')).toHaveLength(1));
    const verifyCall = calls('/payment/verify').at(0);
    if (!verifyCall) throw new Error('Expected verification request');
    expect(JSON.parse(String(verifyCall[0].data))).toEqual({ orderId: 'order_server', paymentId: 'pay_server', signature: 'signature_test' });
    expect(screen.queryByText('Payment capture confirmed by the server.')).not.toBeInTheDocument();
    expect(screen.queryByText('Verified booking confirmation destination')).not.toBeInTheDocument();
    await act(async () => { finishVerification(); await verification; });
    expect(await screen.findByText('Verified booking confirmation destination')).toBeInTheDocument();
    await waitFor(() => expect(calls('/session/provision')).toHaveLength(1));
    expect(calls('/payment/order')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Continue to secure checkout' })).not.toBeInTheDocument();
  });

  it.each([
    { status: CareerPaymentStatus.Authorized, refund: false, bookingStatus: CareerBookingStatus.Confirmed },
    { status: CareerPaymentStatus.Captured, refund: true, bookingStatus: CareerBookingStatus.Confirmed },
    { status: CareerPaymentStatus.Captured, refund: false, bookingStatus: CareerBookingStatus.Pending },
  ])('does not navigate to confirmation for ineligible verified state $status/$refund/$bookingStatus', async state => {
    verifiedPayment = { ...captured, status: state.status, requiresRefundReview: state.refund };
    verifiedBookingStatus = state.bookingStatus;
    const { router } = mount();
    fireEvent.click(await checkoutButton());
    await waitFor(() => expect(opened).toHaveBeenCalledTimes(1));
    if (!options) throw new Error('Expected Razorpay options');
    act(() => options?.handler({ razorpay_order_id: 'order_server', razorpay_payment_id: 'pay_server', razorpay_signature: 'signature_test' }));
    await waitFor(() => expect(calls('/payment/verify')).toHaveLength(1));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh payment status' })).toBeEnabled());
    expect(router.state.location.pathname).toBe('/career-guidance/bookings/booking-1');
    expect(screen.queryByText('Verified booking confirmation destination')).not.toBeInTheDocument();
    expect(calls('/session/provision')).toHaveLength(0);
  });
  it.each([500, 'network'] as const)('keeps a real %s failure visible and blocks checkout', async failure => {
    paymentFailure = failure;
    mount();
    expect(await screen.findByText(failure === 500 ? /We could not complete this request/ : /service could not be reached/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to secure checkout' })).toBeDisabled();
    expect(screen.queryByText('Payment has not been started.')).not.toBeInTheDocument();
    expect(calls('/payment/order')).toHaveLength(0);
  });

  it('keeps cancellation distinct from 404 and recovers through an explicit GET retry', async () => {
    paymentFailure = 'cancelled';
    const { store } = mount();
    expect(await screen.findByText(/request was interrupted/)).toBeInTheDocument();
    expect(financeApi.endpoints.getCareerPayment.select(booking.id)(store.getState()).error).toMatchObject({ code: 'request_cancelled' });
    expect(screen.queryByText('Payment has not been started.')).not.toBeInTheDocument();
    paymentFailure = null;
    fireEvent.click(screen.getByRole('button', { name: /try again|retry/i }));
    await checkoutButton();
    expect(screen.getByText('Payment has not been started.')).toBeInTheDocument();
    expect(calls('/payment/order')).toHaveLength(0);
  });

  it('loads a fresh payment state after route unmount/remount under StrictMode', async () => {
    const { router } = mount();
    await checkoutButton();
    await act(() => router.navigate('/away'));
    await waitFor(() => expect(screen.getByText('Away')).toBeInTheDocument());
    await act(() => router.navigate(`/career-guidance/bookings/${booking.id}`));
    await checkoutButton();
    expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
    expect(calls('/payment/order')).toHaveLength(0);
  });

  it('shows Authorized without claiming capture and reconciles through the backend', async () => {
    payment = { ...captured, status: CareerPaymentStatus.Authorized, paidAtUtc: null };
    mount();
    expect(await screen.findByText('Payment authorized; capture and verification are still pending. Refresh payment status.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to secure checkout' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh payment status' }));
    expect(await screen.findByText('Verified booking confirmation destination')).toBeInTheDocument();
    expect(calls('/payment/reconcile')).toHaveLength(1);
    expect(calls('/payment/order')).toHaveLength(0);
  });

  it('still loads completed review/session data and the paid dispute form', async () => {
    currentBooking = { ...booking, status: CareerBookingStatus.Completed };
    payment = captured;
    mount();
    expect(await screen.findByRole('button', { name: 'Submit review' })).toBeEnabled();
    expect(await screen.findByRole('button', { name: 'Open dispute' })).toBeEnabled();
    for (const suffix of ['/payment', '/review', '/session', '/dispute']) expect(calls(suffix)).toHaveLength(1);
  });

  it('keeps disputes accessible for refunded payments', async () => {
    currentBooking = { ...booking, status: CareerBookingStatus.CancelledByConsultant };
    payment = { ...captured, status: CareerPaymentStatus.Refunded };
    mount();
    expect(await screen.findByText('Payment refunded.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Open dispute' })).toBeInTheDocument();
    expect(calls('/dispute')).toHaveLength(1);
    expect(screen.queryByText('Open session')).not.toBeInTheDocument();
  });

  it('does not reopen checkout or retry the order after reservation expiry', async () => {
    expired = true;
    mount();
    fireEvent.click(await checkoutButton());
    expect(await screen.findByText('This unpaid booking reservation has expired. Choose a new available time and create a new booking.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to secure checkout' })).not.toBeInTheDocument();
    expect(calls('/payment/order')).toHaveLength(1);
    expect(opened).not.toHaveBeenCalled();
    expect(calls('/payment/verify')).toHaveLength(0);
  });
});
