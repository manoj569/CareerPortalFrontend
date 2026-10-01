import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, toApiRequestError } from '@/api/apiError';
import { authService } from '@/features/auth/services/authService';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { RegisterPage } from './RegisterPage';
import { LoginPage } from './LoginPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    register: vi.fn(),
    googleAuthenticateWithCode: vi.fn(),
    login: vi.fn(),
    requestPasswordReset: vi.fn(),
    completePasswordReset: vi.fn(),
  },
}));
// Test the page integration at the shared Google component boundary; its popup is tested separately.
vi.mock('@/features/auth/components/GoogleAuthorizationCodeButton', () => ({
  GoogleAuthorizationCodeButton: ({
    onCode,
    disabled,
  }: {
    onCode: (code: string) => void;
    disabled?: boolean;
  }) => (
    <button type="button" disabled={disabled} onClick={() => onCode('test-google-code')}>
      Continue with Google
    </button>
  ),
}));
const api = vi.mocked(authService);
const googleGuidance =
  'This email is already registered with Google. Continue with Google to sign in.';
const renderPage = (path: string) => {
  const router = createMemoryRouter(
    [
      { path: '/register', element: <RegisterPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/dashboard', element: <p>Signed in destination</p> },
    ],
    { initialEntries: [path] },
  );
  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />, {
      auth: {
        status: 'unauthenticated',
        user: null,
        error: null,
        isSubmitting: false,
        accessTokenExpiresAtUtc: null,
      },
    }),
  };
};
const change = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { selector: 'input' }), { target: { value } });
const register = () => {
  change(/full name/i, 'Test Candidate');
  change(/email address/i, 'candidate@example.com');
  change(/^password/i, 'secure pass');
  change(/mobile number/i, '9876543210');
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
};

describe('Google and password account compatibility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('uses the registration conflict code and waits for explicit Google login without registering again', async () => {
    api.register.mockRejectedValue(
      toApiRequestError({
        isAxiosError: true,
        response: {
          status: 409,
          headers: {},
          data: {
            code: 'ACCOUNT_EXISTS_GOOGLE',
            message: 'Different backend wording',
            loginMethod: 'google',
          },
        },
      }),
    );
    api.googleAuthenticateWithCode.mockResolvedValue({
      accessToken: 'test-access',
      accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      refreshToken: 'test-refresh',
      refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
      user: {
        id: 'existing-user',
        firstName: 'Test',
        lastName: 'Candidate',
        email: 'candidate@example.com',
        role: UserRole.Candidate,
      },
    });
    const { store } = renderPage('/register');
    register();
    expect(await screen.findByText(googleGuidance)).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'Continue with Google' })).toHaveLength(1);
    expect(api.googleAuthenticateWithCode.mock.calls).toHaveLength(0);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await screen.findByText('Signed in destination');
    expect(api.googleAuthenticateWithCode.mock.calls).toEqual([
      [
        {
          code: 'test-google-code',
          intent: 'Login',
          acceptTerms: false,
        },
      ],
    ]);
    expect(api.register.mock.calls).toHaveLength(1);
    expect(store.getState().auth.user?.id).toBe('existing-user');
  });
  it('preserves ordinary duplicate registration guidance and never infers provider from text', async () => {
    api.register.mockRejectedValue(
      new ApiRequestError({
        status: 409,
        code: 'registration_email_exists',
        message: 'This account uses Google',
      }),
    );
    renderPage('/register');
    register();
    expect(
      await screen.findByText('An account already exists with this email. Please log in.'),
    ).toBeVisible();
    expect(screen.queryByText(googleGuidance)).not.toBeInTheDocument();
    expect(api.googleAuthenticateWithCode.mock.calls).toHaveLength(0);
  });
  it('retains Register intent for normal Google registration', async () => {
    api.googleAuthenticateWithCode.mockRejectedValue(
      new ApiRequestError({ status: 503, message: 'Unavailable' }),
    );
    renderPage('/register');
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await waitFor(() =>
      expect(api.googleAuthenticateWithCode.mock.calls).toEqual([
        [
          {
            code: 'test-google-code',
            intent: 'Register',
            acceptTerms: true,
          },
        ],
      ]),
    );
    expect(api.register.mock.calls).toHaveLength(0);
  });
  it('keeps password login errors generic with Google and recovery options visible', async () => {
    api.login.mockRejectedValue(
      new ApiRequestError({ status: 401, message: 'Private provider information' }),
    );
    renderPage('/login');
    change(/email|identifier/i, 'candidate@example.com');
    change(/^password/i, 'wrong-password');
    fireEvent.click(screen.getByRole('button', { name: /^log in$|^sign in$/i }));
    expect(await screen.findByText('The identifier or password is incorrect.')).toBeVisible();
    expect(screen.queryByText('Private provider information')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });
  it('accepts an email for password setup and hides provider-specific backend success wording', async () => {
    api.requestPasswordReset.mockResolvedValue({
      message: 'Google-only account: password setup email sent.',
    });
    renderPage('/forgot-password');
    change(/email address/i, 'google-user@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(
      await screen.findByText(
        'If an account exists for this email, we have sent password instructions.',
      ),
    ).toBeVisible();
    expect(api.requestPasswordReset.mock.calls).toEqual([[{ email: 'google-user@example.com' }]]);
    expect(screen.queryByText(/Google-only/)).not.toBeInTheDocument();
  });
  it('uses the existing token endpoint for password setup and returns to login', async () => {
    vi.useFakeTimers();
    api.completePasswordReset.mockResolvedValue({ message: 'Done' });
    const { router } = renderPage(
      '/reset-password?email=google-user%40example.com&token=test%2Btoken',
    );
    expect(screen.getByRole('heading', { name: 'Set your password' })).toBeVisible();
    change(/^new password/i, 'secure pass');
    change(/^confirm password/i, 'secure pass');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Set password' }));
      await Promise.resolve();
    });
    expect(api.completePasswordReset.mock.calls).toEqual([
      [
        {
          token: 'test+token',
          newPassword: 'secure pass',
        },
      ],
    ]);
    expect(api.register.mock.calls).toHaveLength(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(router.state.location.pathname).toBe('/login');
  });
});
