import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import {
  CareerBookingStatus,
  CareerPaymentStatus,
  CareerSessionStatus,
  type CareerBookingResponse,
  type CareerPaymentResponse,
  type CareerSessionResponse,
  type ConsultantPublicResponse,
} from '../types';
import { guidanceRoutes } from '../utils/routes';
import { dateTime, money } from '../utils/presentation';
import BookingConfirmedPage from './BookingConfirmedPage';

const mocks = vi.hoisted(() => ({
  request: vi.fn<(config: { url: string; method?: string }) => Promise<unknown>>(),
  get: vi.fn<(url: string) => Promise<unknown>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request: mocks.request, get: mocks.get } }));
const booking: CareerBookingResponse = {
  id: 'b1',
  consultantId: 'c1',
  serviceId: 's1',
  startUtc: '2026-09-26T05:00:00Z',
  endUtc: '2026-09-26T05:30:00Z',
  consultantTimeZone: 'Asia/Dubai',
  serviceTitle: 'Career planning',
  serviceType: 'Video consultation',
  durationMinutes: 30,
  price: 500,
  currency: 'INR',
  status: CareerBookingStatus.Confirmed,
  questionnaire: {
    targetCompany: null,
    targetRole: null,
    yearsOfExperience: null,
    currentRoleOrStatus: null,
    sessionGoal: 'Plan next steps',
    questions: null,
    notes: null,
  },
  cancellationReason: null,
  cancelledByUserId: null,
  cancelledAtUtc: null,
  completedAtUtc: null,
  revision: 'b-r1',
  requiresPayment: true,
};
const payment: CareerPaymentResponse = {
  id: 'p1',
  bookingId: 'b1',
  gross: 500,
  currency: 'INR',
  commissionPercent: 10,
  commission: 50,
  net: 450,
  status: CareerPaymentStatus.Captured,
  providerOrderId: 'order_test',
  providerPaymentId: 'pay_test',
  paidAtUtc: '2026-09-25T12:00:00Z',
  requiresRefundReview: false,
  failureCode: null,
};
const profile: ConsultantPublicResponse = {
  id: 'c1',
  displayName: 'Test Consultant',
  professionalHeadline: 'Career coach',
  bio: '',
  companyId: null,
  companyName: 'Test company',
  currentRole: 'Coach',
  yearsOfExperience: null,
  professionalType: null,
  languages: [],
  expertise: [],
  isAcceptingBookings: true,
  guidanceDisclaimer: '',
  services: [],
  averageRating: 4.5,
  reviewCount: 2,
  profileImageUrl: 'https://example.test/profile.jpg',
  location: null,
  industry: null,
  functionalArea: null,
  education: [],
  workExperience: [],
  approvalLabel: 'Approved by CareerHarbor',
};
const session: CareerSessionResponse = {
  id: 'session1',
  bookingId: 'b1',
  candidateUserId: 'candidate1',
  consultantId: 'c1',
  meetingProvider: 'Manual',
  providerMeetingId: null,
  scheduledStartUtc: booking.startUtc,
  scheduledEndUtc: booking.endUtc,
  status: CareerSessionStatus.Ready,
  startedAtUtc: null,
  completedAtUtc: null,
  consultantNoShowReportedAtUtc: null,
  meetingCreatedAtUtc: null,
  meetingConfigured: false,
  revision: 's-r1',
  candidateJoinedAtUtc: null,
  consultantJoinedAtUtc: null,
  candidateNoShowMarkedAtUtc: null,
  consultantNoShowMarkedAtUtc: null,
  meetingProvisioningAttemptedAtUtc: '2026-09-25T12:00:00Z',
  earningReleaseDelayHours: 24,
};
let currentBooking = booking;
let currentPayment: CareerPaymentResponse | null = payment;
let currentProfile = profile;
let currentSession: CareerSessionResponse | null = session;
let failure: { suffix: string; status?: number } | null = null;
const envelope = (data: unknown) => ({ data: { data } });
function mount() {
  const router = createMemoryRouter(
    [
      { path: '/career-guidance/bookings/:id/confirmed', element: <BookingConfirmedPage /> },
      { path: '/career-guidance/bookings/:id', element: <p>Booking/payment state</p> },
    ],
    { initialEntries: [guidanceRoutes.bookingConfirmed('b1')] },
  );
  renderWithProviders(<RouterProvider router={router} />);
  return router;
}
const urls = () => mocks.request.mock.calls.map(([config]) => config.url);
beforeEach(() => {
  currentBooking = { ...booking };
  currentPayment = { ...payment };
  currentProfile = { ...profile };
  currentSession = { ...session };
  failure = null;
  mocks.request.mockReset().mockImplementation((config) => {
    if (failure && config.url.endsWith(failure.suffix))
      return Promise.reject(
        new ApiRequestError({
          message: 'Request failed',
          status: failure.status,
          code: failure.status ? undefined : 'network_error',
        }),
      );
    if (config.url.endsWith('/payment'))
      return currentPayment
        ? Promise.resolve(envelope(currentPayment))
        : Promise.reject(new ApiRequestError({ message: 'Payment not found', status: 404 }));
    if (config.url.endsWith('/session'))
      return currentSession
        ? Promise.resolve(envelope(currentSession))
        : Promise.reject(new ApiRequestError({ message: 'Session not found', status: 404 }));
    if (config.url === '/career-guidance/consultants/c1')
      return Promise.resolve(envelope(currentProfile));
    if (config.url === '/career-guidance/bookings/b1')
      return Promise.resolve(envelope(currentBooking));
    throw new Error(`Unexpected request: ${config.url}`);
  });
  mocks.get
    .mockReset()
    .mockImplementation(() =>
      Promise.resolve(
        envelope({
          session: currentSession,
          joinUrl: 'https://meeting.example.test/participant',
          withheldReason: null,
        }),
      ),
    );
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Screen 12 server-backed booking confirmation', () => {
  it('loads a direct/refresh route from its ID and renders real profile, session and payment fields', async () => {
    mount();
    expect(
      await screen.findByRole('heading', { name: 'Your session is confirmed!' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Test Consultant')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Consultant' })).toHaveAttribute(
      'src',
      profile.profileImageUrl,
    );
    expect(screen.getByText('Coach · Test company')).toBeInTheDocument();
    expect(screen.getByText('Approved by CareerHarbor')).toBeInTheDocument();
    expect(screen.getByText('4.5 / 5 · 2 reviews')).toBeInTheDocument();
    expect(
      screen.getByText(`${dateTime(booking.startUtc)} – ${dateTime(booking.endUtc)}`),
    ).toBeInTheDocument();
    expect(screen.getByText(money(payment.gross, payment.currency), { normalizer: value => value })).toBeInTheDocument();
    expect(screen.getByText('Payment reference: pay_test')).toBeInTheDocument();
    expect(screen.getByText(`Paid: ${dateTime(payment.paidAtUtc)}`)).toBeInTheDocument();
    expect(screen.getByText('Captured')).toBeInTheDocument();
    screen.getAllByRole('link', { name: 'My bookings' }).forEach(link => {
      expect(link).toHaveAttribute('href', guidanceRoutes.bookings);
    });
    expect(screen.getByRole('link', { name: 'Find a consultant' })).toHaveAttribute(
      'href',
      guidanceRoutes.marketplace,
    );
    expect(urls()).toEqual(
      expect.arrayContaining([
        '/career-guidance/bookings/b1',
        '/career-guidance/bookings/b1/payment',
        '/career-guidance/bookings/b1/session',
        '/career-guidance/consultants/c1',
      ]),
    );
    expect(mocks.get).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toMatch(
      /email|calendar|reschedul|google meet|top rated|verified professional/i,
    );
  });

  it.each([
    CareerBookingStatus.Pending,
    CareerBookingStatus.CancelledByCandidate,
    CareerBookingStatus.CancelledByConsultant,
    CareerBookingStatus.Completed,
  ])(
    'does not fake confirmation for booking status %s or request irrelevant session/payment data',
    async (status) => {
      currentBooking = { ...booking, status };
      const router = mount();
      expect(await screen.findByText('Booking/payment state')).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(guidanceRoutes.booking('b1'));
      expect(screen.queryByText('Your session is confirmed!')).not.toBeInTheDocument();
      expect(urls()).toEqual(['/career-guidance/bookings/b1']);
    },
  );

  it.each([
    null,
    CareerPaymentStatus.OrderCreated,
    CareerPaymentStatus.Authorized,
    CareerPaymentStatus.RefundPending,
    CareerPaymentStatus.Refunded,
  ])('rejects missing or non-captured payment %s', async (status) => {
    currentPayment = status === null ? null : { ...payment, status };
    mount();
    expect(await screen.findByText('Booking/payment state')).toBeInTheDocument();
    expect(urls()).not.toContain('/career-guidance/bookings/b1/session');
    expect(screen.queryByText('Your session is confirmed!')).not.toBeInTheDocument();
  });

  it('does not confirm a captured payment requiring refund review', async () => {
    currentPayment = { ...payment, requiresRefundReview: true };
    mount();
    expect(await screen.findByText('Booking/payment state')).toBeInTheDocument();
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it.each([null, session])(
    'handles a missing/unconfigured session without a fake join action',
    async (value) => {
      currentSession = value;
      mount();
      expect(
        await screen.findByText(
          'Meeting details are not available yet. Return to this booking closer to the session time.',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Join meeting' })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Check meeting access' }),
      ).not.toBeInTheDocument();
      expect(mocks.get).not.toHaveBeenCalled();
    },
  );

  it('requests the candidate join endpoint only on click and exposes only its safe participant URL', async () => {
    currentSession = { ...session, meetingConfigured: true, meetingProvider: 'Manual' };
    mount();
    expect(await screen.findByText('Meeting provider: Manual')).toBeInTheDocument();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Join meeting' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Check meeting access' }));
    const link = await screen.findByRole('link', { name: 'Join meeting' });
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith('/career-guidance/bookings/b1/session/join');
    expect(link).toHaveAttribute('href', 'https://meeting.example.test/participant');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.blur(window);
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Join meeting' })).not.toBeInTheDocument(),
    );
  });

  it('translates a withheld join reason without revealing a URL', async () => {
    currentSession = { ...session, meetingConfigured: true };
    mocks.get.mockImplementation(() =>
      Promise.resolve(
        envelope({
          session: currentSession,
          joinUrl: null,
          withheldReason: 'outside_join_window_or_terminal',
        }),
      ),
    );
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Check meeting access' }));
    expect(await screen.findByText(/outside the permitted joining time/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Join meeting' })).not.toBeInTheDocument();
  });

  it('rejects unsafe join URLs and shows nullable profile/payment fields without invented values', async () => {
    currentProfile = {
      ...profile,
      profileImageUrl: null,
      approvalLabel: null,
      averageRating: null,
      reviewCount: 0,
      companyName: '',
      currentRole: '',
      professionalHeadline: '',
    };
    currentPayment = { ...payment, providerPaymentId: null, paidAtUtc: null };
    currentSession = { ...session, meetingConfigured: true };
    mocks.get.mockImplementation(() =>
      Promise.resolve(
        envelope({ session: currentSession, joinUrl: 'javascript:alert(1)', withheldReason: null }),
      ),
    );
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Check meeting access' }));
    expect(await screen.findByText(/Meeting access is not available/)).toBeInTheDocument();
    expect(screen.getByText('TC')).toBeInTheDocument();
    expect(
      screen.queryByText(/Payment reference:|Paid:|reviews|Approved by/),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Join meeting' })).not.toBeInTheDocument();
  });

  it.each([
    { suffix: '/b1', status: 404 },
    { suffix: '/payment', status: 500 },
    { suffix: '/payment', status: undefined },
    { suffix: '/session', status: 500 },
  ])('preserves a real request error at $suffix ($status)', async (value) => {
    failure = value;
    mount();
    expect(await screen.findByRole('button', { name: /try again|retry/i })).toBeInTheDocument();
    if (value.suffix !== '/session')
      expect(screen.queryByText('Your session is confirmed!')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Join meeting' })).not.toBeInTheDocument();
  });
});
