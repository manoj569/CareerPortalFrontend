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
import { EmailVerificationPage } from './EmailVerificationPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    register: vi.fn(),
    resendVerification: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
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

const renderRegistration = () => {
  const router = createMemoryRouter(
    [
      { path: '/register', element: <RegisterPage /> },
      { path: '/login', element: <p>Login page</p> },
    ],
    { initialEntries: ['/register'] },
  );
  return renderWithProviders(<RouterProvider router={router} />, {
    auth: unauthenticatedState,
  });
};

const fillRegistrationFields = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/first name/i), 'Avery');
  await user.type(screen.getByLabelText(/last name/i), 'Patel');
  await user.type(screen.getByLabelText(/email address/i), 'candidate@example.com');
  await user.type(screen.getByLabelText(/mobile number/i), '+91 98765 43210');
  await user.type(screen.getByLabelText(/^password/i), 'Str0ng!Password2026');
  await user.type(
    screen.getByLabelText(/confirm password/i, { selector: 'input' }),
    'Str0ng!Password2026',
  );
  await user.click(screen.getByRole('checkbox', { name: /terms of use/i }));
  return user;
};

const fillRegistration = async () => {
  const user = await fillRegistrationFields();
  await user.click(screen.getByRole('button', { name: /create account/i }));
};

const renderVerification = (entry: string) => {
  const router = createMemoryRouter(
    [
      { path: '/verify-email', element: <EmailVerificationPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/onboarding', element: <p>Candidate onboarding</p> },
    ],
    { initialEntries: [entry] },
  );
  renderWithProviders(<RouterProvider router={router} />, { auth: unauthenticatedState });
};

describe('authentication pages', () => {
  beforeEach(() => {
    mockedAuthService.login.mockReset();
    mockedAuthService.forgotPassword.mockReset();
    mockedAuthService.register.mockReset();
    mockedAuthService.resendVerification.mockReset();
    mockedAuthService.verifyEmail.mockReset();
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

  it('offers a privacy-safe resend when login is blocked for an unverified email', async () => {
    mockedAuthService.login.mockRejectedValue(
      new ApiRequestError({
        code: 'email_not_verified',
        message: 'Backend detail',
        status: 403,
      }),
    );
    mockedAuthService.resendVerification.mockResolvedValue({
      message: 'Backend response must not disclose whether the account exists.',
    });
    renderLogin();
    await fillLogin();

    expect(
      await screen.findByText(/verify your email address before signing in/i),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^resend verification email$/i }));

    expect(mockedAuthService.resendVerification.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
    });
    expect(
      await screen.findByText(
        'If an unverified account exists, a verification email will be sent.',
      ),
    ).toBeInTheDocument();
  });

  it('shows inline login validation feedback', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveFocus();
  });

  it('registers without creating a session and shows the verification confirmation', async () => {
    mockedAuthService.register.mockResolvedValue({
      message: 'Registration accepted. Verify your email address before signing in.',
    });
    const { store } = renderRegistration();
    await fillRegistration();

    expect(mockedAuthService.register.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
      firstName: 'Avery',
      hasAcceptedTermsAndPrivacy: true,
      lastName: 'Patel',
      password: 'Str0ng!Password2026',
      phoneNumber: '+919876543210',
    });
    expect(await screen.findByText('Check your email to verify your account.')).toBeInTheDocument();
    expect(store.getState().auth.status).toBe('unauthenticated');
    expect(store.getState().auth.user).toBeNull();
  });

  it('shows an accessible validation summary for incomplete registration', async () => {
    renderRegistration();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/correct the highlighted fields before creating your account/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Indian mobile number is required.')).toBeInTheDocument();
    expect(screen.getByText(/must accept the Terms of Use/i)).toBeInTheDocument();
  });

  it('does not reveal a duplicate email or mobile response', async () => {
    mockedAuthService.register.mockRejectedValue(
      new ApiRequestError({ code: 'conflict', message: 'Email already exists.', status: 409 }),
    );
    renderRegistration();
    await fillRegistration();

    expect(await screen.findByText(/could not complete your request/i)).toBeInTheDocument();
    expect(screen.queryByText(/already exists/i)).not.toBeInTheDocument();
  });

  it('prevents a double registration submission while the request is pending', async () => {
    let resolveRegistration!: (value: { message: string }) => void;
    mockedAuthService.register.mockReturnValue(
      new Promise((resolve) => {
        resolveRegistration = resolve;
      }),
    );
    renderRegistration();
    const user = await fillRegistrationFields();
    const submit = screen.getByRole('button', { name: /create account/i });

    await user.dblClick(submit);
    expect(mockedAuthService.register.mock.calls).toHaveLength(1);
    expect(submit).toBeDisabled();

    resolveRegistration({ message: 'Registration accepted.' });
    expect(await screen.findByText('Check your email to verify your account.')).toBeInTheDocument();
  });

  it('resends verification from the registration success state', async () => {
    mockedAuthService.register.mockResolvedValue({ message: 'Registration accepted.' });
    mockedAuthService.resendVerification.mockResolvedValue({
      message: 'If an unverified account exists, a verification message will be sent.',
    });
    renderRegistration();
    await fillRegistration();
    await userEvent.click(
      await screen.findByRole('button', { name: /^resend verification email$/i }),
    );

    expect(mockedAuthService.resendVerification.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
    });
    expect(
      await screen.findByText(
        'If an unverified account exists, a verification email will be sent.',
      ),
    ).toBeInTheDocument();
  });

  it('verifies an email from the link without rendering the token', async () => {
    mockedAuthService.verifyEmail.mockResolvedValue({ message: 'Email verified.' });
    renderVerification(
      '/verify-email?email=candidate%40example.com&token=sensitive-verification-token',
    );

    expect(await screen.findByText(/your email address has been verified/i)).toBeInTheDocument();
    expect(mockedAuthService.verifyEmail.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
      token: 'sensitive-verification-token',
    });
    expect(screen.queryByText('sensitive-verification-token')).not.toBeInTheDocument();
  });

  it('continues a newly verified Candidate through login to onboarding', async () => {
    mockedAuthService.verifyEmail.mockResolvedValue({ message: 'Email verified.' });
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Candidate));
    renderVerification('/verify-email?email=candidate%40example.com&token=verification-token');

    await userEvent.click(await screen.findByRole('link', { name: /continue to onboarding/i }));
    expect(
      await screen.findByText(/email verified. log in to continue to candidate onboarding/i),
    ).toBeInTheDocument();
    await fillLogin();
    expect(await screen.findByText('Candidate onboarding')).toBeInTheDocument();
  });

  it('shows an invalid-link state and permits a privacy-safe resend', async () => {
    mockedAuthService.verifyEmail.mockRejectedValue(
      new ApiRequestError({
        code: 'invalid_verification_token',
        message: 'Backend detail',
        status: 400,
      }),
    );
    mockedAuthService.resendVerification.mockResolvedValue({ message: 'Accepted.' });
    renderVerification('/verify-email?email=candidate%40example.com&token=expired-token');

    expect(
      await screen.findByText('This email verification link is invalid or has expired.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^resend verification email$/i }));
    expect(mockedAuthService.resendVerification.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
    });
  });

  it('retries email verification after a temporary failure', async () => {
    mockedAuthService.verifyEmail
      .mockRejectedValueOnce(new ApiRequestError({ message: 'Network unavailable.' }))
      .mockResolvedValueOnce({ message: 'Email verified.' });
    renderVerification('/verify-email?email=candidate%40example.com&token=retry-token');

    await userEvent.click(await screen.findByRole('button', { name: /try verification again/i }));
    expect(await screen.findByText(/your email address has been verified/i)).toBeInTheDocument();
    expect(mockedAuthService.verifyEmail.mock.calls).toHaveLength(2);
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
