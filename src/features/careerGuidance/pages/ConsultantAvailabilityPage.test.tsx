import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import type {
  ConsultantAvailabilityResponse,
  SaveConsultantAvailabilityRequest,
} from '../api/onboardingApi';
import { ConsultantVerificationStatus } from '../types';
import ConsultantAvailabilityPage from './ConsultantAvailabilityPage';

const mocks = vi.hoisted(() => {
  const availability: ConsultantAvailabilityResponse = {
    timeZoneId: 'Europe/London',
    isAcceptingBookings: false,
    revision: 'revision-1',
    windows: [
      { dayOfWeek: 1, startTime: '09:00:00', endTime: '12:00:00', isActive: true },
      { dayOfWeek: 1, startTime: '14:00:00', endTime: '17:00:00', isActive: true },
    ],
  };
  return {
    status: 0,
    availability,
    save: vi.fn<
      (request: SaveConsultantAvailabilityRequest) => {
        unwrap: () => Promise<ConsultantAvailabilityResponse>;
      }
    >(),
    refetch: vi.fn(),
  };
});
vi.mock('../api/onboardingApi', () => ({
  useGetConsultantOnboardingQuery: () => ({ data: { status: mocks.status }, isLoading: false }),
  useGetConsultantAvailabilityQuery: () => ({
    data: { ...mocks.availability },
    isLoading: false,
    isFetching: false,
    refetch: mocks.refetch,
  }),
  useSaveConsultantAvailabilityMutation: () => [mocks.save, { isLoading: false }],
}));
const page = () => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<ConsultantAvailabilityPage />} />
      <Route path="/career-guidance" element={<p>Marketplace destination</p>} />
      <Route path="/career-guidance/become-consultant/review" element={<p>Review destination</p>} />
    </Routes>
  </MemoryRouter>
);
beforeEach(() => {
  mocks.status = ConsultantVerificationStatus.Verified;
  mocks.availability.isAcceptingBookings = false;
  mocks.save.mockReset().mockImplementation((request) => ({
    unwrap: () => Promise.resolve({ ...request, revision: 'revision-2' }),
  }));
});

describe('Consultant availability booking acceptance', () => {
  it('keeps a local ON choice across same-revision rerenders and saves true with both windows, timezone and revision', async () => {
    renderWithProviders(page());
    const toggle = screen.getByRole('switch', { name: 'Accept new bookings' });
    expect(toggle).not.toBeChecked();
    expect(toggle).toBeEnabled();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Tuesday available' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Tuesday available' }));
    expect(screen.getByRole('switch', { name: 'Accept new bookings' })).toBeChecked();
    expect(
      screen.getByText(
        'New bookings will be enabled for your available time slots after you save.',
      ),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Save and exit' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        timeZoneId: 'Europe/London',
        isAcceptingBookings: true,
        windows: mocks.availability.windows,
        revision: 'revision-1',
      }),
    );
    expect(await screen.findByText('Marketplace destination')).toBeVisible();
  });
  it('hydrates a saved ON value and lets a Verified consultant save OFF through Next', async () => {
    mocks.availability.isAcceptingBookings = true;
    renderWithProviders(page());
    const toggle = screen.getByRole('switch', { name: 'Accept new bookings' });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(
      screen.getByText(
        'Your profile is approved, but you are currently not accepting new bookings.',
      ),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next: Review & submit' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({ isAcceptingBookings: false, revision: 'revision-1' }),
      ),
    );
    expect(await screen.findByText('Review destination')).toBeVisible();
  });
  it.each([
    5,
    ConsultantVerificationStatus.Pending,
    ConsultantVerificationStatus.Rejected,
    ConsultantVerificationStatus.Suspended,
  ])(
    'forces bookings OFF for non-Verified status %s even if availability says ON',
    async (status) => {
      mocks.status = status;
      mocks.availability.isAcceptingBookings = true;
      renderWithProviders(page());
      const toggle = screen.getByRole('switch', { name: 'Accept new bookings' });
      expect(toggle).toBeDisabled();
      expect(toggle).not.toBeChecked();
      expect(
        screen.getByText(
          'You can enable bookings after your consultant profile is approved by CareerHarbor.',
        ),
      ).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Save and exit' }));
      await waitFor(() =>
        expect(mocks.save).toHaveBeenCalledWith(
          expect.objectContaining({ isAcceptingBookings: false }),
        ),
      );
    },
  );
});
