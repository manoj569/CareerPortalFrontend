import { act, cleanup, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ApiRequestError } from '@/api/apiError';
import { logout, sessionRefreshed } from '@/features/auth/store/authSlice';
import { authTokenStore } from '@/services/authTokenStore';
import { UserRole } from '@/types';
import { dashboardApi } from '../api/dashboardApi';
import { NotificationBell } from './NotificationBell';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/api/apiClient', () => ({
  apiClient: { request, post: vi.fn().mockResolvedValue({}) },
  refreshAuthentication: vi.fn(),
}));
const user = {
  id: 'candidate',
  email: 'candidate@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.Candidate,
};
const auth = {
  user,
  status: 'authenticated' as const,
  isSubmitting: false,
  error: null,
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
};
const notifications = {
  data: {
    data: {
      unreadCount: 0,
      page: { items: [], pageNumber: 1, pageSize: 5, totalPages: 0, totalCount: 0 },
    },
  },
};
afterEach(() => {
  cleanup();
  authTokenStore.clear();
  vi.useRealTimers();
});

it('stops polling after explicit logout and starts a fresh subscription for a different login', async () => {
  vi.useFakeTimers();
  request.mockReset();
  request.mockResolvedValue(notifications);
  const credentials = {
    ...auth,
    accessToken: 'account-a-access',
    refreshToken: 'account-a-refresh',
    refreshTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  };
  authTokenStore.set(credentials);
  const { store } = renderWithProviders(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
    { auth },
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
  await act(async () => {
    await store.dispatch(logout());
    await vi.advanceTimersByTimeAsync(100);
  });
  expect(store.getState().auth.status).toBe('unauthenticated');
  const calls = request.mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(180000);
  });
  expect(request).toHaveBeenCalledTimes(calls);
  const later = { ...credentials, user: { ...user, id: 'different-candidate' } };
  await act(async () => {
    authTokenStore.set(later);
    store.dispatch(sessionRefreshed(later));
    await vi.advanceTimersByTimeAsync(100);
  });
  expect(store.getState().auth.user?.id).toBe('different-candidate');
  expect(request.mock.calls.length).toBeGreaterThan(calls);
  expect(screen.getByRole('button', { name: 'Notifications' })).toBeVisible();
});

it('stops notifications after a final 401, ignores polling/focus/reconnect and resumes after login', async () => {
  vi.useFakeTimers();
  request.mockRejectedValueOnce(new ApiRequestError({ status: 401, message: 'Sign in again.' }));
  const { store } = renderWithProviders(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
    { auth },
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
  expect(store.getState().auth.status).toBe('unauthenticated');
  expect(screen.queryByRole('button', { name: 'Notifications' })).not.toBeInTheDocument();
  const calls = request.mock.calls.length;
  await act(async () => {
    store.dispatch(dashboardApi.internalActions.onFocus());
    store.dispatch(dashboardApi.internalActions.onOnline());
    await vi.advanceTimersByTimeAsync(180000);
  });
  expect(request).toHaveBeenCalledTimes(calls);
  request.mockResolvedValue(notifications);
  await act(async () => {
    store.dispatch(
      sessionRefreshed({ user, accessTokenExpiresAtUtc: auth.accessTokenExpiresAtUtc }),
    );
    await vi.advanceTimersByTimeAsync(100);
  });
  expect(screen.getByRole('button', { name: 'Notifications' })).toBeVisible();
  expect(request.mock.calls.length).toBeGreaterThan(calls);
  const resumed = request.mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(request.mock.calls.length).toBeGreaterThan(resumed);
});

it('does not request notifications while unauthenticated or initializing', async () => {
  vi.useFakeTimers();
  request.mockClear();
  renderWithProviders(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(180000);
  });
  expect(request).not.toHaveBeenCalled();
});
