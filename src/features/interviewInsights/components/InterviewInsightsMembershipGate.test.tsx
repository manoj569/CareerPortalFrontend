import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import type { Location } from 'react-router-dom';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NavigationList } from '@/components/navigation/NavigationList';
import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { MembershipStatus, type Membership } from '@/features/dashboard/types/dashboardModels';
import { candidateNavigationItems } from '@/layouts/candidateNavigation';
import { renderWithProviders } from '@/test/renderWithProviders';
import { InterviewInsightsMembershipGate } from './InterviewInsightsMembershipGate';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';

const insightPageRender = vi.fn();

vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => ({
  ...(await importOriginal<typeof DashboardApiModule>()),
  useGetMembershipsQuery: vi.fn(),
}));

vi.mock('@/pages/InterviewInsightsPage', () => ({
  InterviewInsightsPage: ({ onMembershipRequired }: { onMembershipRequired?: () => void }) => {
    insightPageRender();
    return (
      <main>
        Interview insight content
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

  it('blocks a direct route before rendering or querying insight content', () => {
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);

    expect(screen.getByRole('dialog', { name: 'Unlock Interview Insights' })).toBeVisible();
    expect(screen.queryByText('Interview insight content')).not.toBeInTheDocument();
    expect(insightPageRender).not.toHaveBeenCalled();
  });

  it('opens the lock from candidate navigation and cancels to the previous safe route', async () => {
    const router = createMemoryRouter(
      [
        {
          path: ROUTES.DASHBOARD_JOBS,
          element: <NavigationList items={candidateNavigationItems} />,
        },
        { path: ROUTES.INTERVIEW_INSIGHTS, element: <InterviewInsightsMembershipGate /> },
      ],
      { initialEntries: [ROUTES.DASHBOARD_JOBS] },
    );
    renderWithProviders(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole('link', { name: 'Interview insights' }));
    expect(await screen.findByRole('dialog', { name: 'Unlock Interview Insights' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(router.state.location.pathname).toBe(ROUTES.DASHBOARD_JOBS);
  });

  it('renders Insights normally for an active member', () => {
    vi.mocked(useGetMembershipsQuery).mockReturnValue(
      queryResult([membership(MembershipStatus.Active)]),
    );
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);

    expect(screen.getByText('Interview insight content')).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sends the CTA to pricing with an internal Insights returnTo', async () => {
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);
    await userEvent.click(screen.getByRole('button', { name: 'Get membership — ₹99' }));

    expect(screen.getByText('Membership pricing')).toBeVisible();
    expect(screen.getByLabelText('location')).toHaveTextContent(
      '/dashboard/membership?returnTo=%2Fdashboard%2Finterview-insights',
    );
  });

  it('falls back safely when cancel state contains an external URL', async () => {
    renderGate([
      {
        pathname: ROUTES.INTERVIEW_INSIGHTS,
        state: { from: 'https://malicious.example/steal' },
      },
    ]);
    await userEvent.keyboard('{Escape}');

    expect(screen.getByText('Candidate dashboard')).toBeVisible();
  });

  it('opens the same dialog after a stale membership receives membership_required', async () => {
    vi.mocked(useGetMembershipsQuery).mockReturnValue(
      queryResult([membership(MembershipStatus.Active)]),
    );
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);

    await userEvent.click(screen.getByRole('button', { name: /simulate membership-required/i }));
    expect(screen.getByRole('dialog', { name: 'Unlock Interview Insights' })).toBeVisible();
    expect(screen.queryByText('Interview insight content')).not.toBeInTheDocument();
  });

  it('uses an accessible responsive dialog surface', () => {
    renderGate([ROUTES.INTERVIEW_INSIGHTS]);

    const dialog = screen.getByRole('dialog', { name: 'Unlock Interview Insights' });
    expect(dialog).toHaveAttribute('aria-describedby', 'interview-insights-membership-description');
    expect(screen.getByRole('button', { name: 'Close membership offer' })).toBeVisible();
    expect(dialog.closest('.MuiDialog-container')).toBeInTheDocument();
  });
});
