import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { authService } from '@/features/auth/services/authService';
import type { AuthState } from '@/features/auth/store/authSlice';
import { candidateNavigationItems } from '@/layouts/candidateNavigation';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { DashboardLayoutShell } from './DashboardLayoutShell';
const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock('@/api/apiClient', () => ({ apiClient: { request: apiRequestMock } }));

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
            accountMenuProfilePath={ROUTES.PORTFOLIO}
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
            path: 'portfolio',
            element: (
              <>
                <p>Profile page</p>
                <LocationProbe />
              </>
            ),
          },
          {
            path: 'settings',
            element: (
              <>
                <p>Settings page</p>
                <LocationProbe />
              </>
            ),
          },
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
      {
        path: '/',
        element: (
          <>
            <p>Home page</p>
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries: [ROUTES.DASHBOARD_JOBS] },
  );

  return renderWithProviders(<RouterProvider router={router} />, { auth: candidateAuth });
};

describe('Candidate workspace shell', () => {
  beforeEach(() => {
    apiRequestMock.mockReset().mockRejectedValue(new Error('No profile photo configured.'));
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn().mockReturnValue('blob:header-photo'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  });

  it('refreshes the private account-menu avatar after a profile photo change', async () => {
    apiRequestMock.mockResolvedValue({ data: new Blob(['photo'], { type: 'image/png' }) });
    renderShell(0);
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event('careerharbor:profile-photo-changed'));
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(2));
  });
  it('collapses to accessible icon-only navigation and expands again', async () => {
    renderShell(0);
    const user = userEvent.setup();
    const collapse = screen.getByRole('button', { name: 'Collapse candidate navigation' });
    const desktopDrawer = collapse.closest('.MuiDrawer-paper');

    expect(desktopDrawer).not.toBeNull();
    expect(
      within(desktopDrawer as HTMLElement).getByRole('link', { name: 'Browse jobs' }),
    ).toHaveClass('active');
    expect(
      within(desktopDrawer as HTMLElement).queryByRole('link', { name: 'Notifications' }),
    ).toBeNull();

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

  it('keeps the mobile drawer open when expanding Referrals and closes after a child navigation', async () => {
    renderShell(0);
    const openButton = screen.getByRole('button', { name: 'Open candidate workspace navigation' });
    await userEvent.click(openButton);
    const drawer = screen.getByLabelText('Candidate workspace navigation drawer');
    const group = within(drawer).getByRole('button', { name: 'Referrals' });
    await userEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'true');
    expect(openButton).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(within(drawer).getByRole('link', { name: 'Find Referral Jobs' }));
    await waitFor(() => expect(openButton).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.getByText('Browse jobs page')).toBeVisible();
  });

  it('includes the candidate Interview insights navigation entry', () => {
    expect(candidateNavigationItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Interview insights',
          path: ROUTES.INTERVIEW_INSIGHTS,
        }),
      ]),
    );
  });

  it('shows the real unread badge only above zero and opens Notifications from the header', async () => {
    const positive = renderShell(4);
    const bell = screen.getByRole('button', { name: 'Notifications, 4 unread' });
    expect(within(bell).getByText('4')).toBeVisible();

    await userEvent.click(bell);
    expect(await screen.findByTestId('location')).toHaveTextContent(ROUTES.NOTIFICATIONS);
    positive.unmount();

    renderShell(0);
    expect(
      within(screen.getByRole('button', { name: 'Notifications' })).queryByText('0'),
    ).toBeNull();
  });

  it('replaces the header Logout control with a real-initials account menu', async () => {
    renderShell(0);
    const header = screen.getByRole('banner');
    const accountButton = within(header).getByRole('button', { name: 'Open account menu' });

    expect(accountButton).toHaveTextContent('AP');
    expect(within(header).queryByRole('button', { name: 'Log out' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Log out' })).toBeNull();

    await userEvent.click(accountButton);
    const menu = screen.getByRole('menu', { name: 'Candidate account menu' });
    expect(within(menu).getByText('Avery Patel')).toBeVisible();
    expect(within(menu).getByText('candidate@example.com')).toBeVisible();
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining('Profile'),
      expect.stringContaining('Settings'),
      expect.stringContaining('Help & Support'),
      expect.stringContaining('My Support Requests'),
      expect.stringContaining('Log out'),
    ]);
  });

  it('uses the existing Portfolio and Settings routes from the account menu', async () => {
    renderShell(0);
    const accountButton = screen.getByRole('button', { name: 'Open account menu' });

    await userEvent.click(accountButton);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Profile' }));
    expect(await screen.findByTestId('location')).toHaveTextContent(ROUTES.PORTFOLIO);
    expect(screen.queryByRole('menu', { name: 'Candidate account menu' })).toBeNull();

    await userEvent.click(accountButton);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(await screen.findByTestId('location')).toHaveTextContent(ROUTES.SETTINGS);
  });

  it('uses the existing secure logout flow from the account menu', async () => {
    const logout = vi.spyOn(authService, 'logout').mockResolvedValue(undefined);
    renderShell(0);

    await userEvent.click(screen.getByRole('button', { name: 'Open account menu' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledOnce();
    expect(await screen.findByText('Home page')).toBeVisible();
    logout.mockRestore();
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
