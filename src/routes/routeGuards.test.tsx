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
        children: [{ path: '/admin-only', element: <p>Admin content</p> }],
      },
      {
        element: <CandidateRoute />,
        children: [{ path: '/payment', element: <p>Payment content</p> }],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return renderWithProviders(<RouterProvider router={router} />, { auth });
};

describe('route guards', () => {
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
    renderGuardRouter('/admin-only', createAuthState('authenticated', UserRole.Candidate));
    expect(await screen.findByText('Unauthorized destination')).toBeInTheDocument();
  });

  it('allows administrators into administrator routes', async () => {
    renderGuardRouter('/admin-only', createAuthState('authenticated', UserRole.Administrator));
    expect(await screen.findByText('Admin content')).toBeInTheDocument();
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
    renderGuardRouter('/payment', createAuthState('authenticated', UserRole.Administrator));
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
