import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/constants/routes';
import type { AuthState } from '@/features/auth/store/authSlice';
import { candidateNavigationItems } from '@/layouts/candidateNavigation';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { DashboardLayoutShell } from './DashboardLayoutShell';

const candidateAuth: AuthState = {
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

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const renderShell = (notificationCount: number) => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <DashboardLayoutShell
            areaLabel="Candidate workspace"
            collapsibleDesktop
            navigationItems={candidateNavigationItems}
            notificationCount={notificationCount}
            showNotifications
          />
        ),
        path: '/dashboard',
        children: [
          { path: 'jobs', element: <p>Browse jobs page</p> },
          {
            path: 'notifications',
            element: (
              <>
                <p>Notifications page</p>
                <LocationProbe />
              </>
            ),
          },
        ],
      },
    ],
    { initialEntries: [ROUTES.DASHBOARD_JOBS] },
  );

  return renderWithProviders(<RouterProvider router={router} />, { auth: candidateAuth });
};

describe('Candidate workspace shell', () => {
  it('collapses to accessible icon-only navigation and expands again', async () => {
    renderShell(0);
    const user = userEvent.setup();
    const collapse = screen.getByRole('button', { name: 'Collapse candidate navigation' });
    const desktopDrawer = collapse.closest('.MuiDrawer-paper');

    expect(desktopDrawer).not.toBeNull();
    expect(within(desktopDrawer as HTMLElement).getByRole('link', { name: 'Browse jobs' })).toHaveClass('active');
    expect(within(desktopDrawer as HTMLElement).queryByRole('link', { name: 'Notifications' })).toBeNull();

    await user.click(collapse);
    const collapsedDrawer = screen
      .getByRole('button', { name: 'Expand candidate navigation' })
      .closest('.MuiDrawer-paper');
    const browseJobs = within(collapsedDrawer as HTMLElement).getByRole('link', {
      name: 'Browse jobs',
    });
    expect(browseJobs).toHaveClass('active');
    expect(within(collapsedDrawer as HTMLElement).queryByText('Browse jobs')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Expand candidate navigation' }));
    expect(screen.getByRole('button', { name: 'Collapse candidate navigation' })).toBeVisible();
  });

  it('shows the real unread badge only above zero and opens Notifications from the header', async () => {
    const positive = renderShell(4);
    const bell = screen.getByRole('button', { name: 'Notifications' });
    expect(within(bell).getByText('4')).toBeVisible();

    await userEvent.click(bell);
    expect(await screen.findByTestId('location')).toHaveTextContent(ROUTES.NOTIFICATIONS);
    positive.unmount();

    renderShell(0);
    expect(within(screen.getByRole('button', { name: 'Notifications' })).queryByText('0')).toBeNull();
  });

  it('defaults the desktop navigation to collapsed at the tablet breakpoint', () => {
    const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query.includes('min-width:900px') && query.includes('max-width:1199.95px'),
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });

    try {
      renderShell(0);
      expect(screen.getByRole('button', { name: 'Expand candidate navigation' })).toBeVisible();
    } finally {
      if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia);
      else Reflect.deleteProperty(window, 'matchMedia');
    }
  });
});
