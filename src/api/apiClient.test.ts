import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import type * as AxiosModule from 'axios';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';
import { authService } from '@/features/auth/services/authService';
import { authTokenStore } from '@/services/authTokenStore';
import { UserRole, type AuthenticationResponse } from '@/types';

const { transport } = vi.hoisted(() => ({ transport: vi.fn<AxiosAdapter>() }));
vi.mock('axios', async (importOriginal) => {
  const original = await importOriginal<typeof AxiosModule>();
  return {
    ...original,
    default: {
      ...original.default,
      create: (config: Parameters<typeof original.default.create>[0]) => {
        const instance = original.default.create(config);
        instance.defaults.adapter = transport;
        return instance;
      },
    },
  };
});
const session: AuthenticationResponse = {
  accessToken: 'old-access',
  refreshToken: 'old-refresh',
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  refreshTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  user: {
    id: 'user',
    role: UserRole.Candidate,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  },
};
const restored = { ...session, accessToken: 'new-access', refreshToken: 'new-refresh' };
const reply = (config: InternalAxiosRequestConfig, data: unknown, status = 200) => ({
  config,
  data,
  status,
  headers: {},
  statusText: String(status),
});
const reject = (config: InternalAxiosRequestConfig, status = 401) =>
  Promise.reject(
    new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      config,
      undefined,
      reply(config, { message: 'Unauthorized' }, status),
    ),
  );
const expired = vi.fn();
beforeEach(() => {
  transport.mockReset();
  authTokenStore.set(session);
  expired.mockClear();
  window.addEventListener('auth:session-expired', expired);
});
afterEach(() => {
  authTokenStore.clear();
  window.removeEventListener('auth:session-expired', expired);
});

it('refreshes an expired access token once for concurrent requests and retries only with restored authentication', async () => {
  transport.mockImplementation((config) =>
    config.url === '/auth/refresh'
      ? Promise.resolve(reply(config, restored))
      : config.headers.Authorization === 'Bearer old-access'
        ? reject(config)
        : Promise.resolve(reply(config, { ok: true })),
  );
  const results = await Promise.all([
    apiClient.get<{ ok: boolean }>('/dashboard/notifications'),
    apiClient.get<{ ok: boolean }>('/dashboard/profile'),
  ]);
  expect(results.every((result) => result.data.ok === true)).toBe(true);
  expect(transport.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
  expect(authTokenStore.getAccessToken()).toBe('new-access');
  expect(expired).not.toHaveBeenCalled();
});

it.each([400, 401, 403, 503])(
  'expires the session if refresh fails with %s and does not retry the protected request',
  async (status) => {
    transport.mockImplementation((config) =>
      reject(config, config.url === '/auth/refresh' ? status : 401),
    );
    await expect(apiClient.get('/dashboard/notifications')).rejects.toBeDefined();
    expect(transport).toHaveBeenCalledTimes(2);
    expect(authTokenStore.getAccessToken()).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
  },
);

it('expires when the retried request is still unauthorized without refreshing again', async () => {
  transport.mockImplementation((config) =>
    config.url === '/auth/refresh' ? Promise.resolve(reply(config, restored)) : reject(config),
  );
  await expect(apiClient.get('/dashboard/notifications')).rejects.toMatchObject({ status: 401 });
  expect(transport.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
  expect(authTokenStore.getAccessToken()).toBeNull();
  expect(expired).toHaveBeenCalledTimes(1);
});

it('uses an already refreshed token for a late original 401 without another refresh', async () => {
  let rejectLate!: () => void;
  transport.mockImplementation((config) => {
    if (config.url === '/auth/refresh') return Promise.resolve(reply(config, restored));
    if (config.headers.Authorization !== 'Bearer old-access')
      return Promise.resolve(reply(config, {}));
    if (config.url === '/late')
      return new Promise((_resolve, fail) => {
        rejectLate = () => {
          void reject(config).catch(fail);
        };
      });
    return reject(config);
  });
  const late = apiClient.get('/late');
  await apiClient.get('/dashboard/notifications');
  rejectLate();
  await late;
  expect(transport.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
});

it('does not restore tokens when logout happens during refresh', async () => {
  transport.mockImplementation((config) => {
    if (config.url !== '/auth/refresh') return reject(config);
    authTokenStore.clear();
    return Promise.resolve(reply(config, restored));
  });
  await expect(apiClient.get('/dashboard/notifications')).rejects.toBeDefined();
  expect(authTokenStore.getAccessToken()).toBeNull();
});

it('does not replay a late unauthorized request under a later login', async () => {
  let rejectLate!: () => void;
  transport.mockImplementation(
    (config) =>
      new Promise((_resolve, fail) => {
        rejectLate = () => {
          void reject(config).catch(fail);
        };
      }),
  );
  const late = apiClient.get('/dashboard/notifications');
  const assertion = expect(late).rejects.toMatchObject({ code: 'session_changed' });
  await vi.waitFor(() => expect(rejectLate).toBeDefined());
  authTokenStore.clear();
  authTokenStore.set(restored);
  rejectLate();
  await assertion;
  expect(authTokenStore.getAccessToken()).toBe('new-access');
  expect(transport).toHaveBeenCalledTimes(1);
  expect(expired).not.toHaveBeenCalled();
});

it('expires the session when a refresh network failure prevents authentication recovery', async () => {
  transport.mockImplementation((config) =>
    config.url === '/auth/refresh'
      ? Promise.reject(new axios.AxiosError('Network Error'))
      : reject(config),
  );
  await expect(apiClient.get('/dashboard/notifications')).rejects.toMatchObject({
    code: 'network_error',
  });
  expect(authTokenStore.getAccessToken()).toBeNull();
  expect(expired).toHaveBeenCalledTimes(1);
  expect(transport).toHaveBeenCalledTimes(2);
});

it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
  'blocks %s if the session changes after refresh completes but before replay',
  async (method) => {
    let replayedUnderLaterLogin = false;
    const laterLogin = {
      ...restored,
      accessToken: 'later-account-access',
      refreshToken: 'later-account-refresh',
      user: { ...session.user, id: 'later-account' },
    };
    const switchSession = () => {
      authTokenStore.clear();
      authTokenStore.set(laterLogin);
    };
    window.addEventListener('auth:session-refreshed', switchSession);
    transport.mockImplementation((config) => {
      if (config.url === '/auth/refresh') return Promise.resolve(reply(config, restored));
      if (config.headers.Authorization === 'Bearer old-access') return reject(config);
      replayedUnderLaterLogin = config.headers.Authorization === 'Bearer later-account-access';
      return Promise.resolve(reply(config, { saved: true }));
    });
    try {
      await expect(
        apiClient.request({
          method,
          url: '/admin/job-sources',
          data: { companyId: 'original-account-company' },
        }),
      ).rejects.toMatchObject({ code: 'session_changed' });
      expect(replayedUnderLaterLogin).toBe(false);
      expect(transport).toHaveBeenCalledTimes(2);
    } finally {
      window.removeEventListener('auth:session-refreshed', switchSession);
    }
  },
);

it.each(['logout', 'login', 'account switch'])(
  'rejects an old mutation when %s occurs before its refresh response',
  async (transition) => {
    let finishRefresh!: () => void;
    const later = { ...session, user: { ...session.user, id: 'later-account' } };
    transport.mockImplementation((config) => {
      if (config.url !== '/auth/refresh') return reject(config);
      return new Promise((resolve) => {
        finishRefresh = () => resolve(reply(config, restored));
      });
    });
    const pending = apiClient.post('/admin/job-sources', { companyId: 'original-account-company' });
    const rejected = expect(pending).rejects.toMatchObject({ code: 'session_changed' });
    await vi.waitFor(() => expect(finishRefresh).toBeDefined());
    const version = authTokenStore.getSessionVersion();
    if (transition !== 'account switch') authTokenStore.clear();
    if (transition !== 'logout') authTokenStore.set(later);
    expect(authTokenStore.getSessionVersion()).not.toBe(version);
    finishRefresh();
    await rejected;
    // Login deliberately reuses the token text: epoch identity must still isolate it.
    expect(authTokenStore.getAccessToken()).toBe(transition === 'logout' ? null : 'old-access');
    expect(transport.mock.calls[0]?.[0].headers.Authorization).toBeUndefined();
    expect(transport).toHaveBeenCalledTimes(2);
    expect(expired).not.toHaveBeenCalled();
  },
);

it.each([401, 503])(
  'does not invalidate a later login when the old refresh fails with %s',
  async (status) => {
    let failRefresh!: () => void;
    transport.mockImplementation((config) => {
      if (config.url !== '/auth/refresh') return reject(config);
      return new Promise((_resolve, fail) => {
        failRefresh = () => {
          void reject(config, status).catch(fail);
        };
      });
    });
    const pending = apiClient.patch('/admin/job-sources/source', { isActive: false });
    const rejected = expect(pending).rejects.toMatchObject({ code: 'session_changed' });
    await vi.waitFor(() => expect(failRefresh).toBeDefined());
    authTokenStore.clear();
    authTokenStore.set(restored);
    failRefresh();
    await rejected;
    expect(authTokenStore.getAccessToken()).toBe('new-access');
    expect(authTokenStore.getRefreshToken()).toBe('new-refresh');
    expect(expired).not.toHaveBeenCalled();
  },
);

it('keeps old and new sessions on separate refresh flights without clearing the new flight', async () => {
  let finishOld!: () => void;
  let finishNew!: () => void;
  const later = {
    ...session,
    accessToken: 'later-access',
    refreshToken: 'later-refresh',
    user: { ...session.user, id: 'later' },
  };
  const rotatedLater = {
    ...later,
    accessToken: 'later-rotated-access',
    refreshToken: 'later-rotated-refresh',
  };
  transport.mockImplementation((config) => {
    if (config.url === '/auth/refresh') {
      return new Promise((resolve) => {
        if (String(config.data).includes('old-refresh'))
          finishOld = () => resolve(reply(config, restored));
        else finishNew = () => resolve(reply(config, rotatedLater));
      });
    }
    return config.headers.Authorization === 'Bearer later-rotated-access'
      ? Promise.resolve(reply(config, { ok: true }))
      : reject(config);
  });
  const old = apiClient.delete('/admin/job-sources/old');
  const oldRejected = expect(old).rejects.toMatchObject({ code: 'session_changed' });
  await vi.waitFor(() => expect(finishOld).toBeDefined());
  authTokenStore.clear();
  authTokenStore.set(later);
  const current = apiClient.get('/dashboard/notifications');
  await vi.waitFor(() => expect(finishNew).toBeDefined());
  finishOld();
  await oldRejected;
  const concurrent = apiClient.get('/dashboard/profile');
  await vi.waitFor(() =>
    expect(
      transport.mock.calls.filter(([config]) => config.url === '/dashboard/profile'),
    ).toHaveLength(1),
  );
  finishNew();
  await Promise.all([current, concurrent]);
  expect(transport.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(2);
  expect(authTokenStore.getAccessToken()).toBe(rotatedLater.accessToken);
  expect(expired).not.toHaveBeenCalled();
});

it('shares one refresh between startup restoration and a protected request', async () => {
  let finishRefresh!: () => void;
  transport.mockImplementation((config) => {
    if (config.url === '/auth/refresh')
      return new Promise((resolve) => {
        finishRefresh = () => resolve(reply(config, restored));
      });
    return config.headers.Authorization === 'Bearer new-access'
      ? Promise.resolve(reply(config, {}))
      : reject(config);
  });
  const restoration = authService.refresh();
  const request = apiClient.get('/dashboard/notifications');
  await vi.waitFor(() => expect(transport.mock.calls).toHaveLength(2));
  const version = authTokenStore.getSessionVersion();
  finishRefresh();
  await Promise.all([restoration, request]);
  expect(transport.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
  expect(authTokenStore.getSessionVersion()).toBe(version);
});

it('strips an explicit stale Authorization header when there is no current access token', async () => {
  authTokenStore.clear();
  transport.mockImplementation((config) => Promise.resolve(reply(config, {})));
  await apiClient.get('/public', { headers: { Authorization: 'Bearer stale-token' } });
  expect(transport.mock.calls[0]?.[0].headers.Authorization).toBeUndefined();
});

it('rejects at dispatch if the session changes between replay admission and the credential interceptor', async () => {
  const switchBeforeCredentials = apiClient.interceptors.request.use(
    (config) => {
      if ((config as InternalAxiosRequestConfig & { hasRetried?: boolean }).hasRetried)
        authTokenStore.set({ ...session, accessToken: 'later-login' });
      return config;
    },
    undefined,
    { synchronous: true },
  );
  transport.mockImplementation((config) =>
    config.url === '/auth/refresh' ? Promise.resolve(reply(config, restored)) : reject(config),
  );
  try {
    await expect(apiClient.post('/admin/job-sources', {})).rejects.toMatchObject({
      code: 'session_changed',
    });
    expect(transport).toHaveBeenCalledTimes(2);
    expect(authTokenStore.getAccessToken()).toBe('later-login');
    expect(expired).not.toHaveBeenCalled();
  } finally {
    apiClient.interceptors.request.eject(switchBeforeCredentials);
  }
});
