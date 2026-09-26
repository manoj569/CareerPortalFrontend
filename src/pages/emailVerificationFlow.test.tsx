import { ApiRequestError } from '@/api/apiError';
import { ROUTES } from '@/constants/routes';
import { renderWithProviders } from '@/test/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { VerifyEmailPage } from './VerifyEmailPage';

const mocks = vi.hoisted(() => ({
  googleAuthenticateWithCode: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock('@/features/auth/services/authService', () => ({ authService: mocks }));
vi.mock('@/features/auth/components/GoogleAuthorizationCodeButton', () => ({
  GoogleAuthorizationCodeButton: () => <button type="button">Continue with Google</button>,
}));

const renderFlow = (initialEntry: string) => {
  const router = createMemoryRouter(
    [
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmailPage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
    ],
    { initialEntries: [initialEntry] },
  );

  return { router, ...renderWithProviders(<RouterProvider router={router} />) };
};

const fillRegistration = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByRole('textbox', { name: /Full name/i }), 'Avery Patel');
  await user.type(
    screen.getByRole('textbox', { name: /Email address/i }),
    'candidate@example.com',
  );
  await user.type(screen.getByLabelText(/^Password/i), 'abc 12!');
  await user.type(
    screen.getByRole('textbox', { name: /Mobile number/i }),
    '9876543210',
  );

  return user;
};

const storageValues = (storage: Storage): string[] =>
  Array.from({ length: storage.length }, (_, index) =>
    storage.getItem(storage.key(index) ?? ''),
  ).filter((value): value is string => value !== null);

describe('email verification flow', () => {
  beforeEach(() => {
    mocks.register.mockReset();
    mocks.verifyEmail.mockReset();
    mocks.login.mockReset();
  });

  it('shows email-verification instructions after successful registration without creating a session', async () => {
    mocks.register.mockResolvedValue({
      message: 'Registration successful. Please log in.',
    });

    const { router, store } = renderFlow(ROUTES.REGISTER);
    const user = await fillRegistration();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByRole('heading', {
        name: /check your email to verify your account/i,
      }),
    ).toBeVisible();

    expect(
      screen.getByText(/Your CareerHarbor account has been created successfully/i),
    ).toBeVisible();

    expect(screen.getByText(/candidate@example\.com/i)).toBeVisible();

    expect(
      screen.getByText(/Open the link to verify your email address, then log in/i),
    ).toBeVisible();

    expect(router.state.location.pathname).toBe(ROUTES.REGISTER);
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.status).not.toBe('authenticated');
  });

  it('shows an email field error when the email is already registered', async () => {
    mocks.register.mockRejectedValue(
      new ApiRequestError({
        code: 'registration_email_exists',
        message: 'An account already exists with this email. Please log in.',
        status: 409,
      }),
    );

    renderFlow(ROUTES.REGISTER);
    const user = await fillRegistration();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText(
        'An account already exists with this email. Please log in.',
      ),
    ).toBeVisible();

    expect(
      screen.getByRole('textbox', { name: /Email address/i }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.queryByText(/account has been created successfully/i),
    ).not.toBeInTheDocument();
  });

  it('shows a mobile field error when the mobile number is already registered', async () => {
    mocks.register.mockRejectedValue(
      new ApiRequestError({
        code: 'registration_phone_exists',
        message: 'An account already exists with this mobile number. Please log in.',
        status: 409,
      }),
    );

    renderFlow(ROUTES.REGISTER);
    const user = await fillRegistration();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText(
        'An account already exists with this mobile number. Please log in.',
      ),
    ).toBeVisible();

    expect(
      screen.getByRole('textbox', { name: /Mobile number/i }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.queryByText(/account has been created successfully/i),
    ).not.toBeInTheDocument();
  });

  it('shows both field errors when both email and mobile number are already registered', async () => {
    mocks.register.mockRejectedValue(
      new ApiRequestError({
        code: 'registration_identity_exists',
        message: 'An account already exists with these details. Please log in.',
        status: 409,
      }),
    );

    renderFlow(ROUTES.REGISTER);
    const user = await fillRegistration();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText(
        'An account already exists with this email. Please log in.',
      ),
    ).toBeVisible();

    expect(
      screen.getByText(
        'An account already exists with this mobile number. Please log in.',
      ),
    ).toBeVisible();

    expect(
      screen.getByRole('textbox', { name: /Email address/i }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.getByRole('textbox', { name: /Mobile number/i }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.queryByText(/account has been created successfully/i),
    ).not.toBeInTheDocument();
  });

  it('verifies a valid token, removes it from URL state, and never persists it', async () => {
    const token = 'private-email-verification-token';

    mocks.verifyEmail.mockResolvedValue({
      message: 'Email verified.',
    });

    const { router, store } = renderFlow(
      `${ROUTES.VERIFY_EMAIL}?token=${token}`,
    );

    expect(await screen.findByText(/verified successfully/i)).toBeVisible();

    expect(mocks.verifyEmail).toHaveBeenCalledTimes(1);
    expect(mocks.verifyEmail).toHaveBeenCalledWith({ token });

    expect(router.state.location.pathname).toBe(ROUTES.VERIFY_EMAIL);
    expect(router.state.location.search).toBe('');

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      ROUTES.LOGIN,
    );

    expect(storageValues(localStorage)).not.toContain(token);
    expect(storageValues(sessionStorage)).not.toContain(token);
    expect(JSON.stringify(store.getState())).not.toContain(token);
    expect(document.body).not.toHaveTextContent(token);
  });

  it('shows a safe invalid state for an expired token', async () => {
    mocks.verifyEmail.mockRejectedValue(
      new ApiRequestError({
        code: 'expired_email_verification_token',
        message: 'Internal token detail',
        status: 400,
      }),
    );

    renderFlow(`${ROUTES.VERIFY_EMAIL}?token=expired-token`);

    expect(
      await screen.findByText(/invalid, expired, or incomplete/i),
    ).toBeVisible();

    expect(
      screen.queryByText(/Internal token detail/),
    ).not.toBeInTheDocument();
  });

  it('shows loading and a retryable network-error state', async () => {
    let rejectVerification: ((reason: unknown) => void) | undefined;

    mocks.verifyEmail.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectVerification = reject;
      }),
    );

    renderFlow(`${ROUTES.VERIFY_EMAIL}?token=network-token`);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Verifying your email address',
    );

    rejectVerification?.(
      new ApiRequestError({
        code: 'network_error',
        message: 'Network unavailable',
      }),
    );

    expect(
      await screen.findByText(/service could not be reached/i),
    ).toBeVisible();

    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeEnabled();
  });

  it('maps an unverified-email login response to the friendly message', async () => {
    mocks.login.mockRejectedValue(
      new ApiRequestError({
        code: 'email_not_verified',
        message: 'Internal detail',
        status: 403,
      }),
    );

    renderFlow(ROUTES.LOGIN);

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /Email address or mobile number/i,
      }),
      {
        target: { value: 'candidate@example.com' },
      },
    );

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'abc 12!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(
      await screen.findByText(
        'Please verify your email before signing in.',
      ),
    ).toBeVisible();

    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
  });
});