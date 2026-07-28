import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  Link,
  Outlet,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { AuthState } from '@/features/auth/store/authSlice';
import { DashboardLayoutShell } from '@/components/navigation/DashboardLayoutShell';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { PublicLayout } from '@/layouts/PublicLayout';
import { RouteAccessibility } from './RouteAccessibility';
import { renderWithProviders } from '@/test/renderWithProviders';
import { findBasicAccessibilityIssues } from '@/test/accessibilityAudit';
import { UserRole } from '@/types';

const unauthenticated: AuthState = {
  accessTokenExpiresAtUtc: null,
  error: null,
  isSubmitting: false,
  status: 'unauthenticated',
  user: null,
};

const candidate: AuthState = {
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
  isSubmitting: false,
  status: 'authenticated',
  user: {
    email: 'candidate.with.a.very.long.email.address@example.com',
    firstName: 'Avery',
    id: 'candidate-id',
    lastName: 'Patel',
    role: UserRole.Candidate,
  },
};

const administrator: AuthState = {
  ...candidate,
  user: candidate.user ? { ...candidate.user, role: UserRole.Administrator } : null,
};

const Page = ({ title }: { title: string }) => (
  <>
    <h1>{title}</h1>
    <p>
      Long resilient content:
      very-long-identifier-without-natural-breakpoints-012345678901234567890123456789
    </p>
    <Button component={Link} to="/jobs">
      Continue
    </Button>
  </>
);

const renderRoutes = (routes: RouteObject[], auth: AuthState = unauthenticated) => {
  const router = createMemoryRouter([{ element: <RouteAccessibility />, children: routes }], {
    initialEntries: ['/'],
  });
  return {
    router,
    ...renderWithProviders(
      <>
        <SkipLink />
        <RouterProvider router={router} />
      </>,
      { auth },
    ),
  };
};

describe('Step 9 accessibility and navigation smoke checks', () => {
  it.each([
    'Home',
    'Jobs listing',
    'Job details',
    'Login',
    'Register',
    'User dashboard',
    'Profile',
    'Payment',
    'Admin dashboard',
    'Admin job form',
    'Error and Not Found',
  ])('passes shared semantic checks for the %s surface', async (title) => {
    const { container } = renderRoutes([
      {
        element: (
          <main id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
        ),
        children: [
          {
            path: '/',
            element: (
              <>
                <Page title={title} />
                {title === 'Admin dashboard' ? (
                  <Table aria-label="Administrator jobs">
                    <caption className="sr-only">Administrator jobs and available actions</caption>
                    <TableHead>
                      <TableRow>
                        <TableCell>Job</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Principal frontend architect</TableCell>
                        <TableCell>Published</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : null}
              </>
            ),
          },
          { path: '/jobs', element: <Page title="Jobs listing" /> },
        ],
      },
    ]);

    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(findBasicAccessibilityIssues(container)).toEqual([]);
  });

  it('closes public mobile navigation with Escape and restores trigger focus', async () => {
    const user = userEvent.setup();
    renderRoutes([
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Page title="Home" /> },
          { path: '/jobs', element: <Page title="Jobs listing" /> },
        ],
      },
    ]);

    const trigger = screen.getByRole('button', { name: 'Open main navigation' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Main navigation drawer')).toContainElement(
      document.activeElement as HTMLElement | null,
    );

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes navigation after route selection and focuses the destination heading', async () => {
    const user = userEvent.setup();
    renderRoutes([
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Page title="Home" /> },
          { path: '/jobs', element: <Page title="Jobs listing" /> },
        ],
      },
    ]);

    await user.click(screen.getByRole('button', { name: 'Open main navigation' }));
    const mobileNavigation = screen.getByLabelText('Main navigation drawer');
    await user.click(within(mobileNavigation).getByRole('link', { name: 'Jobs' }));

    const heading = await screen.findByRole('heading', { level: 1, name: 'Jobs listing' });
    expect(screen.getByRole('button', { name: 'Open main navigation' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(heading).toHaveFocus();
  });

  it.each([
    ['Candidate workspace', candidate],
    ['Administration', administrator],
  ] as const)(
    'traps focus in the %s drawer and restores it after Escape',
    async (areaLabel, auth) => {
      const user = userEvent.setup();
      renderRoutes(
        [
          {
            element: (
              <DashboardLayoutShell
                areaLabel={areaLabel}
                navigationItems={[
                  { end: true, label: 'Dashboard', path: '/' },
                  { label: 'Profile', path: '/jobs' },
                ]}
              />
            ),
            children: [
              { path: '/', element: <Page title="Dashboard" /> },
              { path: '/jobs', element: <Page title="Profile" /> },
            ],
          },
        ],
        auth,
      );

      const trigger = screen.getByRole('button', {
        name: `Open ${areaLabel.toLowerCase()} navigation`,
      });
      await user.click(trigger);
      const drawer = screen.getByLabelText(`${areaLabel} navigation drawer`);
      expect(drawer).toContainElement(document.activeElement as HTMLElement | null);

      await user.tab();
      expect(drawer).toContainElement(document.activeElement as HTMLElement | null);
      await user.keyboard('{Escape}');
      expect(trigger).toHaveFocus();
    },
  );
});
