import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import type { Location } from 'react-router-dom';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { MembershipStatus, type Membership } from '@/features/dashboard/types/dashboardModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { InterviewInsightsMembershipGate } from './InterviewInsightsMembershipGate';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';

const insightPageRender = vi.fn();

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => ({
  ...(await importOriginal<typeof DashboardApiModule>()),
  useGetMembershipsQuery: vi.fn(),
}));

vi.mock('@/pages/InterviewInsightsPage', () => ({
  InterviewInsightsPage: ({ canReadDetails, onMembershipRequired }: { canReadDetails?: boolean; onMembershipRequired?: () => void }) => {
    insightPageRender();
    return (
      <main>
        Interview insight content
        <button onClick={() => { if (!canReadDetails) onMembershipRequired?.(); }}>Read details</button>
        <button onClick={onMembershipRequired}>Simulate membership-required response</button>
      </main>
    );
  },
}));

const membership = (status: MembershipStatus): Membership => ({
  autoRenew: false,
  endsAtUtc: '2099-01-01T00:00:00Z',
  id: 'membership-1',
  planName: 'Career Harbor Membership',
  startsAtUtc: '2026-01-01T00:00:00Z',
  status,
});

const queryResult = (data: Membership[]) =>
  ({
    data,
    isError: false,
    isLoading: false,
    isUninitialized: false,
    refetch: vi.fn(),
  }) as ReturnType<typeof useGetMembershipsQuery>;

const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="location">{`${location.pathname}${location.search}`}</output>;
};

const renderGate = (entries: Array<string | Partial<Location>>) => {
  const router = createMemoryRouter(
    [
      {
        path: ROUTES.DASHBOARD,
        element: (
          <>
            <div>Candidate dashboard</div>
            <LocationProbe />
          </>
        ),
      },
      {
        path: ROUTES.DASHBOARD_JOBS,
        element: (
          <>
            <div>Browse jobs page</div>
            <LocationProbe />
          </>
        ),
      },
      {
        path: ROUTES.INTERVIEW_INSIGHTS,
        element: (
          <>
            <InterviewInsightsMembershipGate />
            <LocationProbe />
          </>
        ),
      },
      {
        path: ROUTES.MEMBERSHIP,
        element: (
          <>
            <div>Membership pricing</div>
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries: entries },
  );
  renderWithProviders(<RouterProvider router={router} />);
  return router;
};

describe('InterviewInsightsMembershipGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetMembershipsQuery).mockReturnValue(queryResult([]));
  });
  it.each(['free', 'loading', 'error', 'premium'])('allows browsing on entry for %s without a popup', (state) => {
    vi.mocked(useGetMembershipsQuery).mockReturnValue({ ...queryResult(state === 'premium' ? [membership(MembershipStatus.Active)] : []), isLoading: state === 'loading', isError: state === 'error' });
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);
    expect(screen.getByText('Interview insight content')).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it.each(['loading', 'error'])('defers detail access to the backend when membership is %s', async (state) => {
    vi.mocked(useGetMembershipsQuery).mockReturnValue({ ...queryResult([]), isLoading: state === 'loading', isError: state === 'error' });
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);
    await userEvent.click(screen.getByRole('button', { name: 'Read details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('opens the existing dialog for details and dismisses back to listings', async () => {
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);
    await userEvent.click(screen.getByRole('button', { name: 'Read details' }));
    expect(screen.getByRole('dialog', { name: 'Unlock Interview Insights' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Interview insight content')).toBeVisible();
  });
  it('allows premium details but handles a backend membership-required response', async () => {
    vi.mocked(useGetMembershipsQuery).mockReturnValue(queryResult([membership(MembershipStatus.Active)]));
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);
    await userEvent.click(screen.getByRole('button', { name: 'Read details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /simulate membership-required/i }));
    expect(screen.getByRole('dialog', { name: 'Unlock Interview Insights' })).toBeVisible();
  });
  it('preserves the pricing return path', async () => {
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);
    await userEvent.click(screen.getByRole('button', { name: 'Read details' }));
    await userEvent.click(screen.getByRole('button', { name: 'Get membership — ₹99' }));
    expect(screen.getByLabelText('location')).toHaveTextContent('/dashboard/membership?returnTo=%2Fdashboard%2Finterview-insights');
  });
});
