import axios, { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';

import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { authTokenStore } from '@/services/authTokenStore';
import { UserRole } from '@/types';

it('refreshes an expired access token and retries protected payment verification without URL tokens', async () => {
  const session = {
    accessToken: 'new-access', accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
    refreshToken: 'rotated-refresh', refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
    user: { id: 'candidate', email: 'candidate@example.com', firstName: 'Avery', lastName: 'Patel', role: UserRole.Candidate },
  };
  authTokenStore.set({ ...session, accessToken: 'expired-access', accessTokenExpiresAtUtc: '2000-01-01T00:00:00Z', refreshToken: 'persisted-refresh' });
  const refreshed = vi.fn();
  window.addEventListener('auth:session-refreshed', refreshed);
  const adapter = vi.fn<AxiosAdapter>(async (config) => {
    await Promise.resolve();
    const response = { config, headers: new AxiosHeaders(), status: 200, statusText: 'OK', data: {} };
    expect(config.url).not.toMatch(/expired-access|new-access|persisted-refresh|rotated-refresh/);
    if (config.url === API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
      expect(JSON.parse(String(config.data))).toEqual({ refreshToken: 'persisted-refresh' });
      return { ...response, data: session };
    }
    if (config.headers.Authorization === 'Bearer expired-access') {
      throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, { ...response, status: 401 });
    }
    expect(config.headers.Authorization).toBe('Bearer new-access');
    return { ...response, data: { data: { status: 'Pending' } } };
  });
  const previousAdapter = axios.defaults.adapter;
  axios.defaults.adapter = adapter;
  try {
    const { authTokenStore: clientTokens } = await import('@/services/authTokenStore');
    clientTokens.set({ ...session, accessToken: 'expired-access', accessTokenExpiresAtUtc: '2000-01-01T00:00:00Z', refreshToken: 'persisted-refresh' });
    const { apiClient } = await import('./apiClient');
    await apiClient.get(API_ENDPOINTS.PAYMENTS.PHONEPE_RETURN('ch_order123'));
    expect(adapter).toHaveBeenCalledTimes(3);
    expect(refreshed).toHaveBeenCalledTimes(1);
    expect(clientTokens.getAccessToken()).toBe('new-access');
    clientTokens.clear();
  } finally {
    axios.defaults.adapter = previousAdapter;
    window.removeEventListener('auth:session-refreshed', refreshed);
  }
});

afterEach(() => { authTokenStore.clear(); });
