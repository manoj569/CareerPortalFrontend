import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authService } from '@/features/auth/services/authService';
import { createAppStore } from '@/store/store';
import type { AuthenticationResponse } from '@/types';
import { UserRole } from '@/types';
import { initializeAuth, logout, sessionRefreshed } from './authSlice';
import { authTokenStore } from '@/services/authTokenStore';

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
const restoredSession: AuthenticationResponse = {
  accessToken: 'test-access-token',
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  refreshToken: 'test-refresh-token',
  refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
  user: {
    email: 'candidate@example.com',
    firstName: 'Avery',
    id: 'user-id',
    lastName: 'Patel',
    role: UserRole.Candidate,
  },
};

describe('authentication state', () => {
  beforeEach(() => {
    mockedAuthService.refresh.mockReset();
    mockedAuthService.logout.mockReset();
  });

  afterEach(() => {
    sessionStorage.clear();
    authTokenStore.clear();
  });

  it.each([true, false])(
    'ignores old logout completion after another login (success=%s)',
    async (success) => {
      let finish!: () => void;
      mockedAuthService.logout.mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            finish = () => (success ? resolve() : reject(new Error('Old logout failed')));
          }),
      );
      const store = createAppStore();
      store.dispatch(sessionRefreshed(restoredSession));
      const pending = store.dispatch(logout());
      const later = { ...restoredSession, user: { ...restoredSession.user, id: 'later' } };
      authTokenStore.set(later);
      store.dispatch(sessionRefreshed(later));
      finish();
      await pending;
      expect(store.getState().auth.user?.id).toBe('later');
      expect(store.getState().auth.status).toBe('authenticated');
    },
  );

  it('does not discard a normal logout when same-session refresh completes during it', async () => {
    let finish!: () => void;
    mockedAuthService.logout.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const store = createAppStore();
    authTokenStore.set(restoredSession);
    store.dispatch(sessionRefreshed(restoredSession));
    const pending = store.dispatch(logout());
    store.dispatch(sessionRefreshed(restoredSession));
    finish();
    await pending;
    expect(store.getState().auth.status).toBe('unauthenticated');
  });

  it('does not clear a new login when an old startup refresh fails', async () => {
    let fail!: () => void;
    mockedAuthService.refresh.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          fail = () => reject(new Error('Old refresh failed'));
        }),
    );
    const store = createAppStore();
    const pending = store.dispatch(initializeAuth());
    authTokenStore.set(restoredSession);
    store.dispatch(sessionRefreshed(restoredSession));
    fail();
    await pending;
    expect(store.getState().auth.status).toBe('authenticated');
    expect(authTokenStore.getAccessToken()).toBe(restoredSession.accessToken);
  });

  it('restores a session once when initialization is dispatched concurrently', async () => {
    mockedAuthService.refresh.mockResolvedValue(restoredSession);
    const store = createAppStore();

    await Promise.all([store.dispatch(initializeAuth()), store.dispatch(initializeAuth())]);

    expect(mockedAuthService.refresh.mock.calls).toHaveLength(1);
    expect(store.getState().auth.status).toBe('authenticated');
    expect(store.getState().auth.user).toEqual(restoredSession.user);
  });

  it('clears Redux authentication state after logout', async () => {
    mockedAuthService.logout.mockResolvedValue();
    const store = createAppStore({
      auth: {
        accessTokenExpiresAtUtc: restoredSession.accessTokenExpiresAtUtc,
        error: null,
        isSubmitting: false,
        status: 'authenticated',
        user: restoredSession.user,
      },
    });

    await store.dispatch(logout());

    expect(mockedAuthService.logout.mock.calls).toHaveLength(1);
    expect(store.getState().auth.status).toBe('unauthenticated');
    expect(store.getState().auth.user).toBeNull();
  });
});
