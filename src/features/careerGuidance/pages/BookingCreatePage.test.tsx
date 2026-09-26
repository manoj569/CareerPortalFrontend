import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { ConsultantPublicResponse, SlotResponse } from '../types';
import { guidanceRoutes } from '../utils/routes';
import type * as Presentation from '../utils/presentation';
import { BookingCreatePage } from './BookingCreatePage';

const mocks = vi.hoisted(() => ({
  timeZone: 'Asia/Kolkata',
  request:
    vi.fn<(config: { url: string; method?: string; params?: unknown }) => Promise<unknown>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request: mocks.request } }));
vi.mock('../utils/presentation', async (importOriginal) => ({
  ...(await importOriginal<typeof Presentation>()),
  localTimeZone: () => mocks.timeZone,
}));
const consultantId = '11111111-1111-4111-8111-111111111111';
const serviceId = '22222222-2222-4222-8222-222222222222';
const profile: ConsultantPublicResponse = {
  id: consultantId,
  displayName: 'Test consultant',
  professionalHeadline: 'Career coach',
  bio: '',
  companyId: null,
  companyName: '',
  currentRole: '',
  yearsOfExperience: null,
  professionalType: null,
  languages: [],
  expertise: [],
  isAcceptingBookings: true,
  guidanceDisclaimer: '',
  averageRating: null,
  reviewCount: 0,
  profileImageUrl: null,
  location: null,
  industry: null,
  functionalArea: null,
  education: [],
  workExperience: [],
  approvalLabel: null,
  services: [
    {
      id: serviceId,
      title: 'Career session',
      serviceType: 'Video',
      description: '',
      durationMinutes: 30,
      price: 500,
      currency: 'INR',
      isActive: true,
    },
  ],
};
// Exact 124-slot pattern from the supplied Sep 26–29 Asia/Dubai API response.
const suppliedSlots: SlotResponse = {
  timeZoneId: 'Asia/Dubai',
  slots: [26, 27, 28, 29].flatMap((day) =>
    Array.from({ length: 31 }, (_, index) => {
      const start = Date.UTC(2026, 8, day, 5, index * 15);
      return {
        startUtc: new Date(start).toISOString().replace('.000Z', 'Z'),
        endUtc: new Date(start + 30 * 60000).toISOString().replace('.000Z', 'Z'),
      };
    }),
  ),
};
let slotResponse = suppliedSlots;
const dateLabel = (day: number) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 8, day, 12)));
const timeLabel = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: mocks.timeZone,
  }).format(new Date(value));
const slotRequests = () =>
  mocks.request.mock.calls.filter(([config]) => config.url.endsWith('/slots'));
function renderPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/career-guidance/consultants/:consultantId/book/:serviceId',
        element: <BookingCreatePage />,
      },
      {
        path: '/career-guidance/consultants/:consultantId/book/:serviceId/confirm',
        element: <p>Confirm details destination</p>,
      },
    ],
    { initialEntries: [guidanceRoutes.book(consultantId, serviceId)] },
  );
  renderWithProviders(<RouterProvider router={router} />);
  return router;
}
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-25T12:00:00Z'));
  mocks.timeZone = 'Asia/Kolkata';
  slotResponse = suppliedSlots;
  mocks.request.mockReset().mockImplementation((config) =>
    Promise.resolve({
      data: { data: config.url.endsWith('/slots') ? slotResponse : profile, message: null },
    }),
  );
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Screen 9 server slots', () => {
  it('unwraps all 124 server slots, renders 31 real times for each Sep 26–29 date, selects and revalidates before Continue without creating a booking', async () => {
    const router = renderPage();
    expect(suppliedSlots.slots).toHaveLength(124);
    let group = await screen.findByRole('group', { name: 'Available session times' });
    expect(within(group).getAllByRole('button')).toHaveLength(31);
    expect(screen.getByRole('button', { name: dateLabel(26) })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    for (const day of [26, 27, 28, 29]) {
      const date = screen.getByRole('button', { name: dateLabel(day) });
      expect(date).toBeEnabled();
      fireEvent.click(date);
      group = screen.getByRole('group', { name: 'Available session times' });
      expect(within(group).getAllByRole('button')).toHaveLength(31);
      expect(
        within(group).getByRole('button', {
          name: timeLabel(`2026-09-${day}T05:00:00Z`),
        }),
      ).toBeVisible();
    }
    fireEvent.click(screen.getByRole('button', { name: dateLabel(26) }));
    const label = timeLabel('2026-09-26T05:00:00Z');
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Available session times' })).getByRole('button', {
        name: label,
      }),
    );
    expect(screen.getAllByText(label)).toHaveLength(2); // time button and Session details
    expect(screen.queryByText('Select a time')).not.toBeInTheDocument();
    const next = screen.getByRole('button', { name: 'Continue' });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(await screen.findByText('Confirm details destination')).toBeVisible();
    expect(slotRequests()).toHaveLength(2);
    expect(router.state.location.state).toEqual({
      selectedStartUtc: '2026-09-26T05:00:00Z',
      selectedEndUtc: '2026-09-26T05:30:00Z',
    });
    expect(mocks.request.mock.calls.every(([config]) => config.method === 'GET')).toBe(true);
  });
  it('groups UTC slots by the candidate day across midnight, matching displayed times and Session details', async () => {
    mocks.timeZone = 'America/Los_Angeles';
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'));
    renderPage();
    const group = await screen.findByRole('group', { name: 'Available session times' });
    expect(screen.getByRole('button', { name: dateLabel(25) })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getAllByRole('button')).toHaveLength(8);
    fireEvent.click(
      within(group).getByRole('button', { name: timeLabel('2026-09-26T05:00:00Z') }),
    );
    expect(screen.getAllByText(timeLabel('2026-09-26T05:00:00Z'))).toHaveLength(2);
    expect(
      within(screen.getByRole('region', { name: 'Session details' })).getByText(dateLabel(25)),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: dateLabel(26) }));
    expect(
      within(screen.getByRole('group', { name: 'Available session times' })).getAllByRole('button'),
    ).toHaveLength(31);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });
  it('initializes the calendar from the browser date rather than the UTC date', async () => {
    mocks.timeZone = 'America/Los_Angeles';
    vi.setSystemTime(new Date('2026-09-25T00:30:00Z')); // still Sep 24 for this candidate
    renderPage();
    await screen.findByRole('group', { name: 'Available session times' });
    expect(mocks.request).toHaveBeenCalledWith(
      expect.objectContaining({ params: { from: '2026-09-25', to: '2026-10-01' } }),
    );
    expect(screen.getByRole('button', { name: dateLabel(25) })).toBeEnabled();
  });
  it.each(['removed', 'changed end'] as const)(
    'does not continue when revalidation returns a %s slot',
    async (scenario) => {
      const router = renderPage();
      const group = await screen.findByRole('group', { name: 'Available session times' });
      fireEvent.click(
        within(group).getByRole('button', { name: timeLabel('2026-09-26T05:00:00Z') }),
      );
      slotResponse = {
        ...suppliedSlots,
        slots:
          scenario === 'removed'
            ? []
            : [{ startUtc: '2026-09-26T05:00:00Z', endUtc: '2026-09-26T06:00:00Z' }],
      };
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(screen.getByText('Select a time')).toBeVisible());
      expect(router.state.location.pathname).toBe(guidanceRoutes.book(consultantId, serviceId));
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
      expect(slotRequests()).toHaveLength(2);
      expect(mocks.request.mock.calls.every(([config]) => config.method === 'GET')).toBe(true);
    },
  );
});
