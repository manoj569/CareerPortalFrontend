import { ApiRequestError } from '@/api/apiError';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/features/auth/services/authService';
import type { AuthState } from '@/features/auth/store/authSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticationResponse } from '@/types';
import { UserRole } from '@/types';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { RegistrationOtpPage } from './RegistrationOtpPage';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    completePasswordReset: vi.fn(),
    login: vi.fn(),
    loginWithOtp: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    register: vi.fn(),
    requestLoginOtp: vi.fn(),
    requestPasswordReset: vi.fn(),
    resendRegistrationOtp: vi.fn(),
    verifyRegistrationOtp: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);
const challengeId = '5b53d833-c7dd-4c39-a80f-c50fd9ab9ff7';
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

const renderAuthRoute = (
  path: string,
  element: React.ReactNode,
  initialEntry: string | { pathname: string; state?: unknown } = path,
) => {
  const router = createMemoryRouter(
    [
      { path, element },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.VERIFY_REGISTRATION_MOBILE, element: <RegistrationOtpPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
      { path: ROUTES.DASHBOARD, element: <p>Candidate dashboard</p> },
      { path: ROUTES.PORTFOLIO, element: <p>Candidate portfolio</p> },
      { path: ROUTES.ADMIN, element: <p>Admin dashboard</p> },
    ],
    { initialEntries: [initialEntry] },
  );
  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />, { auth: unauthenticatedState }),
  };
};

const fillRegistration = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/full name/i), 'Manoj Shekapure');
  await user.type(screen.getByLabelText(/email address/i), 'candidate@example.com');
  await user.type(screen.getByLabelText(/^password/i), 'abc 12!');
  await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
  await user.click(screen.getByRole('checkbox', { name: /terms of use/i }));
  return user;
};

const enterOtp = async (user: ReturnType<typeof userEvent.setup>, otp = '123456') => {
  const firstDigit = screen.getByLabelText('OTP digit 1 of 6');
  await user.click(firstDigit);
  await user.paste(otp);
};

const enterOtpSynchronously = (otp = '123456') => {
  otp.split('').forEach((digit, index) => {
    fireEvent.change(screen.getByLabelText(`OTP digit ${index + 1} of 6`), {
      target: { value: digit },
    });
  });
};

describe('mobile authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filters registration input and shows validation only after touch', async () => {
    renderAuthRoute(ROUTES.REGISTER, <RegisterPage />);
    const user = userEvent.setup();
    const name = screen.getByLabelText(/full name/i);
    const mobile = screen.getByLabelText(/mobile number/i);
    const email = screen.getByLabelText(/email address/i);

    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
    await user.type(name, '  आशिष123   कुमार!🙂');
    expect(name).toHaveValue('आशिष कुमार');
    await user.click(mobile);
    await user.paste('call +91 (98765) 43210 now');
    expect(mobile).toHaveValue('9876543210');
    await user.type(email, 'invalid');
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
    await user.tab();
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('links separately to both legal pages without toggling consent', () => {
    renderAuthRoute(ROUTES.REGISTER, <RegisterPage />);
    const checkbox = screen.getByRole('checkbox', { name: /terms of use/i });
    const termsLink = screen.getByRole('link', { name: 'Terms of Use' });
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });

    expect(termsLink).toHaveAttribute('href', ROUTES.TERMS_OF_USE);
    expect(privacyLink).toHaveAttribute('href', ROUTES.PRIVACY_POLICY);
    expect(termsLink).not.toHaveAttribute('target');
    expect(privacyLink).not.toHaveAttribute('target');
    termsLink.addEventListener('click', (event) => event.preventDefault());
    privacyLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(termsLink);
    fireEvent.click(privacyLink);
    expect(checkbox).not.toBeChecked();
  });

  it('submits the exact registration contract and goes to mobile verification without a session', async () => {
    mockedAuthService.register.mockResolvedValue({
      challengeId,
      expiresAtUtc: '2099-01-01T00:05:00Z',
      message: 'If registration can proceed, a mobile OTP has been sent.',
    });
    const { store } = renderAuthRoute(ROUTES.REGISTER, <RegisterPage />);
    const user = await fillRegistration();
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mockedAuthService.register.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
      fullName: 'Manoj Shekapure',
      hasAcceptedTermsAndPrivacy: true,
      password: 'abc 12!',
      phoneNumber: '9876543210',
    });
    expect(await screen.findByRole('heading', { name: 'Verify your mobile number' })).toBeVisible();
    expect(screen.getByText(/\+91 ••••••3210/)).toBeVisible();
    expect(store.getState().auth.status).toBe('unauthenticated');
    expect(store.getState().auth.user).toBeNull();
  });

  it('forwards a validated return destination from registration to Login without creating a session', async () => {
    mockedAuthService.register.mockResolvedValue({
      challengeId,
      expiresAtUtc: '2099-01-01T00:05:00Z',
      message: 'If registration can proceed, a mobile OTP has been sent.',
    });
    const { router, store } = renderAuthRoute(ROUTES.REGISTER, <RegisterPage />, {
      pathname: ROUTES.REGISTER,
      state: { from: { pathname: ROUTES.PORTFOLIO } },
    });
    await fillRegistration();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await Promise.resolve();
    });
    expect(store.getState().auth.status).toBe('unauthenticated');
    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.LOGIN), {
      timeout: 4_000,
    });
    expect(router.state.location.state).toEqual({ from: { pathname: ROUTES.PORTFOLIO } });
  });

  it('keeps duplicate registration responses privacy-safe and prevents double submit', async () => {
    let rejectRegistration!: (reason: unknown) => void;
    mockedAuthService.register.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectRegistration = reject;
      }),
    );
    renderAuthRoute(ROUTES.REGISTER, <RegisterPage />);
    const user = await fillRegistration();
    const submit = screen.getByRole('button', { name: /create account/i });
    await user.dblClick(submit);
    expect(mockedAuthService.register.mock.calls).toHaveLength(1);
    expect(submit).toBeDisabled();

    rejectRegistration(
      new ApiRequestError({ code: 'data_conflict', message: 'Email already exists.', status: 409 }),
    );
    expect(await screen.findByText(/could not complete your request/i)).toBeVisible();
    expect(screen.queryByText(/already exists/i)).not.toBeInTheDocument();
  });

  it('recovers safely when registration challenge state is missing', () => {
    renderAuthRoute(ROUTES.VERIFY_REGISTRATION_MOBILE, <RegistrationOtpPage />);
    expect(screen.getByText(/verification session is unavailable/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /back to register/i })).toBeVisible();
  });

  it('verifies registration OTP, shows success for five seconds, then redirects to Login', async () => {
    vi.useFakeTimers();
    mockedAuthService.verifyRegistrationOtp.mockResolvedValue({
      message: 'Registration successful. Please log in.',
    });
    renderAuthRoute(ROUTES.VERIFY_REGISTRATION_MOBILE, <RegistrationOtpPage />, {
      pathname: ROUTES.VERIFY_REGISTRATION_MOBILE,
      state: {
        challengeId,
        expiresAtUtc: '2099-01-01T00:05:00Z',
        maskedPhoneNumber: '+91 ••••••3210',
      },
    });
    enterOtpSynchronously();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /verify mobile number/i }));
      await Promise.resolve();
    });

    expect(mockedAuthService.verifyRegistrationOtp.mock.calls[0]?.[0]).toEqual({
      challengeId,
      otp: '123456',
    });
    expect(screen.getByRole('heading', { name: 'Registration successful' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Welcome back' })).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTimeAsync(4_999));
    expect(screen.queryByRole('heading', { name: 'Welcome back' })).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  it('handles invalid OTP and rate-limited registration resend safely', async () => {
    vi.useFakeTimers();
    mockedAuthService.verifyRegistrationOtp.mockRejectedValue(
      new ApiRequestError({ code: 'invalid_otp', message: 'Raw detail', status: 400 }),
    );
    mockedAuthService.resendRegistrationOtp.mockRejectedValue(
      new ApiRequestError({ message: 'Raw provider detail', retryAfterSeconds: 30, status: 429 }),
    );
    renderAuthRoute(ROUTES.VERIFY_REGISTRATION_MOBILE, <RegistrationOtpPage />, {
      pathname: ROUTES.VERIFY_REGISTRATION_MOBILE,
      state: {
        challengeId,
        expiresAtUtc: '2099-01-01T00:05:00Z',
        maskedPhoneNumber: '+91 ••••••3210',
      },
    });
    enterOtpSynchronously('654321');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /verify mobile number/i }));
      await Promise.resolve();
    });
    expect(screen.getByText(/invalid, expired, or has already been used/i)).toBeVisible();

    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Resend code' }));
      await Promise.resolve();
    });
    expect(screen.getByText(/try again in 30 seconds/i)).toBeVisible();
    expect(screen.queryByText(/raw provider/i)).not.toBeInTheDocument();
  });

  it.each(['candidate@example.com', '9876543210'])(
    'logs in with password using identifier %s',
    async (identifier) => {
      mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Candidate));
      renderAuthRoute(ROUTES.LOGIN, <LoginPage />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email address or mobile number/i), identifier);
      await user.type(screen.getByLabelText(/^password/i), 'abc123');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));
      expect(mockedAuthService.login.mock.calls[0]?.[0]).toEqual({
        identifier,
        password: 'abc123',
      });
      expect(await screen.findByText('Candidate dashboard')).toBeVisible();
    },
  );

  it('retains Administrator password login routing', async () => {
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Administrator));
    renderAuthRoute(ROUTES.LOGIN, <LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address or mobile number/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('Admin dashboard')).toBeVisible();
  });

  it('takes a Candidate to a safe internal return destination after Login', async () => {
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Candidate));
    renderAuthRoute(ROUTES.LOGIN, <LoginPage />, {
      pathname: ROUTES.LOGIN,
      state: { from: { pathname: ROUTES.PORTFOLIO } },
    });
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(/email address or mobile number/i),
      'candidate@example.com',
    );
    await user.type(screen.getByLabelText(/^password/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    expect(await screen.findByText('Candidate portfolio')).toBeVisible();
  });

  it('rejects untrusted Login return destinations and keeps Administrators on their default route', async () => {
    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Candidate));
    const { router } = renderAuthRoute(ROUTES.LOGIN, <LoginPage />, {
      pathname: ROUTES.LOGIN,
      state: { from: { pathname: '//evil.example' } },
    });
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(/email address or mobile number/i),
      'candidate@example.com',
    );
    await user.type(screen.getByLabelText(/^password/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('Candidate dashboard')).toBeVisible();
    expect(router.state.location.pathname).toBe(ROUTES.DASHBOARD);

    mockedAuthService.login.mockResolvedValue(authenticationResponse(UserRole.Administrator));
    renderAuthRoute(ROUTES.LOGIN, <LoginPage />, {
      pathname: ROUTES.LOGIN,
      state: { from: { pathname: ROUTES.PORTFOLIO } },
    });
    const admin = userEvent.setup();
    await admin.type(screen.getByLabelText(/email address or mobile number/i), 'admin@example.com');
    await admin.type(screen.getByLabelText(/^password/i), 'abc123');
    await admin.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('Admin dashboard')).toBeVisible();
  });

  it('creates a Candidate session after mobile OTP login', async () => {
    mockedAuthService.requestLoginOtp.mockResolvedValue({ message: 'Accepted.' });
    mockedAuthService.loginWithOtp.mockResolvedValue(authenticationResponse(UserRole.Candidate));
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(await screen.findByText(/verification code has been sent/i)).toBeVisible();
    await enterOtp(user);
    await user.click(screen.getByRole('button', { name: /verify and log in/i }));

    expect(mockedAuthService.requestLoginOtp.mock.calls[0]?.[0]).toEqual({
      phoneNumber: '9876543210',
    });
    expect(mockedAuthService.loginWithOtp.mock.calls[0]?.[0]).toEqual({
      otp: '123456',
      phoneNumber: '9876543210',
    });
    expect(await screen.findByText('Candidate dashboard')).toBeVisible();
  });

  it('requests an email reset link and always displays the privacy-safe success message', async () => {
    mockedAuthService.requestPasswordReset.mockResolvedValue({
      message: 'If an account exists, a reset link may have been sent.',
    });
    renderAuthRoute(ROUTES.FORGOT_PASSWORD, <ForgotPasswordPage />);
    const user = userEvent.setup();
    expect(screen.queryByLabelText(/mobile number/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/otp/i)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/email address/i), '  candidate@example.com  ');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(mockedAuthService.requestPasswordReset.mock.calls[0]?.[0]).toEqual({
      email: 'candidate@example.com',
    });
    expect(
      await screen.findByText(
        'If an account exists for this email, we have sent password instructions.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to login' })).toBeVisible();
  });

  it('validates the reset-request email before calling the backend', async () => {
    renderAuthRoute(ROUTES.FORGOT_PASSWORD, <ForgotPasswordPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeVisible();
    expect(mockedAuthService.requestPasswordReset.mock.calls).toHaveLength(0);
  });

  it('shows a safe error state when reset-link parameters are missing', () => {
    renderAuthRoute(ROUTES.RESET_PASSWORD, <ResetPasswordPage />);

    expect(screen.getByRole('heading', { name: 'Reset link unavailable' })).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This password reset link is invalid or incomplete. Request a new link.',
    );
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute(
      'href',
      ROUTES.FORGOT_PASSWORD,
    );
    expect(screen.queryByLabelText(/^new password/i)).not.toBeInTheDocument();
  });

  it('completes a token-only password reset and redirects after five seconds', async () => {
    vi.useFakeTimers();
    mockedAuthService.completePasswordReset.mockResolvedValue({
      message: 'Password changed successfully. Please log in.',
    });
    renderAuthRoute(
      ROUTES.RESET_PASSWORD,
      <ResetPasswordPage />,
      `${ROUTES.RESET_PASSWORD}?token=raw-reset-token`,
    );
    act(() => {
      fireEvent.change(screen.getByLabelText(/^new password/i), {
        target: { value: 'simple pass' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm password/i, { selector: 'input' }), {
        target: { value: 'simple pass' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /set password/i }));
      await Promise.resolve();
    });

    expect(mockedAuthService.completePasswordReset.mock.calls[0]?.[0]).toEqual({
      newPassword: 'simple pass',
      token: 'raw-reset-token',
    });
    expect(
      screen.getByRole('heading', {
        name: 'Password changed successfully. Redirecting you to login…',
      }),
    ).toBeVisible();
    expect(screen.queryByText('raw-reset-token')).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTimeAsync(5_000));
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  it('blocks password reset when confirmation does not match', async () => {
    renderAuthRoute(
      ROUTES.RESET_PASSWORD,
      <ResetPasswordPage />,
      `${ROUTES.RESET_PASSWORD}?token=raw-reset-token`,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^new password/i), 'simple pass');
    await user.type(
      screen.getByLabelText(/^confirm password/i, { selector: 'input' }),
      'different',
    );
    await user.click(screen.getByRole('button', { name: /set password/i }));
    expect(await screen.findByText('Passwords must match.')).toBeVisible();
    expect(mockedAuthService.completePasswordReset.mock.calls).toHaveLength(0);
  });
});
