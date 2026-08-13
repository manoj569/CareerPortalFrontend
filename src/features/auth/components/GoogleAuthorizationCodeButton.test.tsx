import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getGoogleClientId: vi.fn(() => 'client.apps.googleusercontent.com'), loadGoogleIdentityServices: vi.fn(() => Promise.resolve()) }));
vi.mock('../google/googleIdentityServices', () => mocks);
import { GoogleAuthorizationCodeButton } from './GoogleAuthorizationCodeButton';

describe('GoogleAuthorizationCodeButton', () => {
  it('uses the custom button and starts popup code flow only after an explicit click', async () => {
    const requestCode = vi.fn();
    const initCodeClient = vi.fn(() => ({ requestCode }));
    window.google = { accounts: { oauth2: { initCodeClient } } };
    render(<GoogleAuthorizationCodeButton onCode={vi.fn()} onPopupError={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    expect(screen.queryByText(/Continue as|@|Manoj/i)).toBeNull();
    await waitFor(() => expect(initCodeClient).toHaveBeenCalledWith(expect.objectContaining({ ux_mode: 'popup', scope: 'openid email profile', select_account: true, include_granted_scopes: false })));
    expect(requestCode).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(requestCode).toHaveBeenCalledTimes(1);
  });

  it('maps popup failures safely', async () => {
    const onPopupError = vi.fn();
    let errorCallback!: (error: { type?: string }) => void;
    window.google = { accounts: { oauth2: { initCodeClient: vi.fn((config: GoogleCodeClientConfig) => { errorCallback = config.error_callback; return { requestCode: vi.fn() }; }) } } };
    render(<GoogleAuthorizationCodeButton onCode={vi.fn()} onPopupError={onPopupError} />);
    await waitFor(() => expect(errorCallback).toBeTypeOf('function'));
    errorCallback({ type: 'popup_failed_to_open' });
    expect(onPopupError).toHaveBeenCalledWith('Google sign-in was blocked. Allow pop-ups and try again.');
    errorCallback({ type: 'popup_closed' });
    expect(onPopupError).toHaveBeenCalledWith('Google sign-in was cancelled.');
  });
});
