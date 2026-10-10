import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { sessionExpired, type AuthState } from '@/features/auth/store/authSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { AdminRoute } from './AdminRoute';
import { CandidateRoute } from './CandidateRoute';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

const candidate = {
  email: 'candidate@example.com',
  firstName: 'Avery',
  id: 'candidate-id',
  lastName: 'Patel',
  role: UserRole.Candidate,
};

const createAuthState = (status: AuthState['status'], role: UserRole | null = null): AuthState => ({
  accessTokenExpiresAtUtc: role ? '2099-01-01T00:00:00Z' : null,
  error: null,
  isSubmitting: false,
  status,
  user: role ? { ...candidate, role } : null,
});

const renderGuardRouter = (initialPath: string, auth: AuthState) => {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>Login destination</p> },
      { path: '/dashboard', element: <p>Dashboard destination</p> },
      { path: '/unauthorized', element: <p>Unauthorized destination</p> },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/private', element: <p>Protected content</p> }],
      },
      {
        element: <GuestRoute />,
        children: [{ path: '/guest', element: <p>Guest content</p> }],
      },
      {
        element: <AdminRoute />,
        children: [
          { path: '/admin-only', element: <p>Admin content</p> },
          { path: '/admin/jobs', element: <p>Referral approval</p> },
          { path: '/admin/notifications', element: <p>Admin notifications</p> },
          { path: '/admin/companies', element: <p>Company administration</p> },
          { path: '/admin/interview-insights', element: <p>Insight moderation</p> },
        ],
      },
      {
        element: <CandidateRoute />,
        children: [
          { path: '/payment', element: <p>Payment content</p> },
          { path: '/dashboard/membership', element: <p>Membership content</p> },
          { path: '/candidate-only', element: <p>Candidate dashboard content</p> },
          { path: '/dashboard/jobs', element: <p>Candidate job browser</p> },
          {
            path: '/dashboard/interview-insights',
            element: <p>Candidate interview insights</p>,
          },
          { path: '/onboarding', element: <p>Candidate onboarding content</p> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return renderWithProviders(<RouterProvider router={router} />, { auth });
};

describe('route guards', () => {
  it.each(['/admin/jobs', '/admin/notifications'])(
    'restricts %s to authenticated administrators',
    async (path) => {
      const candidateView = renderGuardRouter(
        path,
        createAuthState('authenticated', UserRole.Candidate),
      );
      expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
      candidateView.unmount();
      const loggedOutView = renderGuardRouter(path, createAuthState('unauthenticated'));
      expect(await screen.findByText('Login destination')).toBeInTheDocument();
      loggedOutView.unmount();
      renderGuardRouter(path, createAuthState('authenticated', UserRole.Administrator));
      expect(
        await screen.findByText(
          path === '/admin/jobs' ? 'Referral approval' : 'Admin notifications',
        ),
      ).toBeInTheDocument();
    },
  );
  it('redirects unauthenticated users from protected routes to login', async () => {
    renderGuardRouter('/private', createAuthState('unauthenticated'));
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  it('allows authenticated users into protected routes', async () => {
    renderGuardRouter('/private', createAuthState('authenticated', UserRole.Candidate));
    expect(await screen.findByText('Protected content')).toBeInTheDocument();
  });

  it('allows unauthenticated users into guest routes', async () => {
    renderGuardRouter('/guest', createAuthState('unauthenticated'));
    expect(await screen.findByText('Guest content')).toBeInTheDocument();
  });

  it('redirects authenticated users away from guest routes', async () => {
    renderGuardRouter('/guest', createAuthState('authenticated', UserRole.Candidate));
    expect(await screen.findByText('Dashboard destination')).toBeInTheDocument();
  });

  it('redirects candidates away from administrator routes', async () => {
    renderGuardRouter('/admin/companies', createAuthState('authenticated', UserRole.Candidate));
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('allows administrators into administrator routes', async () => {
    renderGuardRouter('/admin-only', createAuthState('authenticated', UserRole.Administrator));
    expect(await screen.findByText('Admin content')).toBeInTheDocument();
  });

  it('protects interview insight moderation from candidate accounts', async () => {
    const candidateView = renderGuardRouter(
      '/admin/interview-insights',
      createAuthState('authenticated', UserRole.Candidate),
    );
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
    candidateView.unmount();
    renderGuardRouter(
      '/admin/interview-insights',
      createAuthState('authenticated', UserRole.Administrator),
    );
    expect(await screen.findByText('Insight moderation')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from payment to login', async () => {
    renderGuardRouter('/payment', createAuthState('unauthenticated'));
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  it('allows candidates and rejects administrators on payment routes', async () => {
    renderGuardRouter('/payment', createAuthState('authenticated', UserRole.Candidate));
    expect(await screen.findByText('Payment content')).toBeInTheDocument();
  });

  it('does not allow administrators to purchase candidate access', async () => {
    renderGuardRouter(
      '/dashboard/membership',
      createAuthState('authenticated', UserRole.Administrator),
    );
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('allows candidates and rejects administrators on Candidate dashboard routes', async () => {
    const candidateView = renderGuardRouter(
      '/candidate-only',
      createAuthState('authenticated', UserRole.Candidate),
    );
    expect(await screen.findByText('Candidate dashboard content')).toBeInTheDocument();
    candidateView.unmount();

    renderGuardRouter('/candidate-only', createAuthState('authenticated', UserRole.Administrator));
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('keeps Candidate onboarding unavailable to administrators', async () => {
    const candidateView = renderGuardRouter(
      '/onboarding',
      createAuthState('authenticated', UserRole.Candidate),
    );
    expect(await screen.findByText('Candidate onboarding content')).toBeInTheDocument();
    candidateView.unmount();

    renderGuardRouter('/onboarding', createAuthState('authenticated', UserRole.Administrator));
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('keeps the Candidate job browser unavailable to administrators', async () => {
    const candidateView = renderGuardRouter(
      '/dashboard/jobs',
      createAuthState('authenticated', UserRole.Candidate),
    );
    expect(await screen.findByText('Candidate job browser')).toBeInTheDocument();
    candidateView.unmount();

    renderGuardRouter('/dashboard/jobs', createAuthState('authenticated', UserRole.Administrator));
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('protects Interview insights for Candidate accounts only', async () => {
    const signedOut = renderGuardRouter(
      '/dashboard/interview-insights',
      createAuthState('unauthenticated'),
    );
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
    signedOut.unmount();

    const candidateView = renderGuardRouter(
      '/dashboard/interview-insights',
      createAuthState('authenticated', UserRole.Candidate),
    );
    expect(await screen.findByText('Candidate interview insights')).toBeInTheDocument();
    candidateView.unmount();

    renderGuardRouter(
      '/dashboard/interview-insights',
      createAuthState('authenticated', UserRole.Administrator),
    );
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('redirects an administrator after the session expires', async () => {
    const { store } = renderGuardRouter(
      '/admin-only',
      createAuthState('authenticated', UserRole.Administrator),
    );
    expect(await screen.findByText('Admin content')).toBeInTheDocument();
    store.dispatch(sessionExpired());
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });
});
