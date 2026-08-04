import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authService } from '@/features/auth/services/authService';
import { createAppStore } from '@/store/store';
import type { AuthenticationResponse } from '@/types';
import { UserRole } from '@/types';
import { initializeAuth, logout } from './authSlice';

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
