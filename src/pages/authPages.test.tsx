import { ApiRequestError } from '@/api/apiError';
import { authService } from '@/features/auth/services/authService';
import type { AuthState } from '@/features/auth/store/authSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticationResponse } from '@/types';
import { UserRole } from '@/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { LoginPage } from './LoginPage';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

const unauthenticatedState: AuthState = {
  accessTokenExpiresAtUtc: null,
  error: null,
  isSubmitting: false,
  status: 'unauthenticated',
  user: null,
};

const authenticationResponse = (role: UserRole): AuthenticationResponse => ({
  accessToken: 'test-access-token',
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  refreshToken: 'test-refresh-token',
  refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
  user: {
    email: 'candidate@example.com',
    firstName: 'Avery',
    id: 'user-id',
    lastName: 'Patel',
    role,
  },
});

const fillLogin = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email address/i), 'candidate@example.com');
  await user.type(screen.getByLabelText(/^password/i), 'Str0ng!Password2026');
  await user.click(screen.getByRole('button', { name: /^log in$/i }));
};

const renderLogin = (initialEntry: string | { pathname: string; state: unknown } = '/login') => {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/dashboard', element: <p>Candidate dashboard</p> },
      { path: '/dashboard/profile', element: <p>Requested profile</p> },
      { path: '/admin', element: <p>Admin dashboard</p> },
    ],
    { initialEntries: [initialEntry] },
  );
  renderWithProviders(<RouterProvider router={router} />, { auth: unauthenticatedState });
};

describe('authentication pages', () => {
  beforeEach(() => {
    mockedAuthService.login.mockReset();
    mockedAuthService.forgotPassword.mockReset();
  });

  it('redirects a candidate to the dashboard after login', async () => {
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Candidate));
    renderLogin();
    await fillLogin();
    expect(await screen.findByText('Candidate dashboard')).toBeInTheDocument();
  });

  it('redirects an administrator to the admin area after login', async () => {
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Administrator));
    renderLogin();
    await fillLogin();
    expect(await screen.findByText('Admin dashboard')).toBeInTheDocument();
  });

  it('returns to the originally requested safe protected URL', async () => {
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Candidate));
    renderLogin({
      pathname: '/login',
      state: { from: { pathname: '/dashboard/profile', search: '', hash: '' } },
    });
    await fillLogin();
    expect(await screen.findByText('Requested profile')).toBeInTheDocument();
  });

  it('shows a safe message when authentication fails', async () => {
    mockedAuthService.login.mockRejectedValue(
      new ApiRequestError({ message: 'Backend detail', status: 401 }),
    );
    renderLogin();
    await fillLogin();
    expect(
      await screen.findByText('The email address or password is incorrect.'),
    ).toBeInTheDocument();
  });

  it('shows inline login validation feedback', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveFocus();
  });

  it('submits forgot-password at the mocked network boundary', async () => {
    mockedAuthService.forgotPassword.mockResolvedValue();
    const router = createMemoryRouter(
      [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      { initialEntries: ['/forgot-password'] },
    );
    renderWithProviders(<RouterProvider router={router} />, { auth: unauthenticatedState });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), 'candidate@example.com');
    await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

    expect(mockedAuthService.forgotPassword.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
    });
    expect(await screen.findByText(/if an active account matches/i)).toBeInTheDocument();
  });

  it('rejects reset links without the required token and email', async () => {
    const router = createMemoryRouter(
      [{ path: '/reset-password', element: <ResetPasswordPage /> }],
      { initialEntries: ['/reset-password'] },
    );
    renderWithProviders(<RouterProvider router={router} />, { auth: unauthenticatedState });
    expect(await screen.findByText(/reset link is incomplete or invalid/i)).toBeInTheDocument();
  });
});
