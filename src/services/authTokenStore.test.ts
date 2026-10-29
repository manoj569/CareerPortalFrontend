import { afterEach, expect, it } from 'vitest';
import { authTokenStore } from './authTokenStore';

const tokens = {
  accessToken: 'fixture-access',
  refreshToken: 'fixture-refresh',
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  refreshTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
};
afterEach(() => authTokenStore.clear());

it('starts a new epoch for every credential installation, including identical token strings', () => {
  authTokenStore.set(tokens);
  const version = authTokenStore.getSessionVersion();
  authTokenStore.set(tokens);
  expect(authTokenStore.getSessionVersion()).toBeGreaterThan(version);
  const next = authTokenStore.getSessionVersion();
  authTokenStore.clear();
  expect(authTokenStore.getSessionVersion()).toBeGreaterThan(next);
});

it('permits rotation only in its original epoch and never overwrites a later login', () => {
  authTokenStore.set(tokens);
  const original = authTokenStore.getSessionVersion();
  expect(authTokenStore.rotate({ ...tokens, accessToken: 'rotated-access' }, original)).toBe(true);
  expect(authTokenStore.getSessionVersion()).toBe(original);
  authTokenStore.set({ ...tokens, accessToken: 'later-login' });
  expect(authTokenStore.rotate(tokens, original)).toBe(false);
  expect(authTokenStore.getAccessToken()).toBe('later-login');
});

it('keeps an expired-refresh lookup read-only so callers can expire the appropriate epoch explicitly', () => {
  authTokenStore.set({ ...tokens, refreshTokenExpiresAtUtc: '2000-01-01T00:00:00Z' });
  const version = authTokenStore.getSessionVersion();
  expect(authTokenStore.getRefreshToken()).toBeNull();
  expect(authTokenStore.getSessionVersion()).toBe(version);
});
