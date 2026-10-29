import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { environment } from '@config/environment';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { authTokenStore } from '@/services/authTokenStore';
import type { AuthenticationResponse } from '@/types';
import { toApiRequestError } from './apiError';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  hasRetried?: boolean;
  sessionVersion?: number;
}

// Normal APIs keep the normal configured timeout.
const apiClient: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: environment.apiTimeoutMs,
  headers: { Accept: 'application/json' },
});

// Refresh may happen immediately after a Render cold start.
// Give authentication refresh more time than normal API requests.
const REFRESH_TIMEOUT_MS = Math.max(environment.apiTimeoutMs, 30_000);

const refreshClient: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: REFRESH_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

let refreshPromise: Promise<AuthenticationResponse> | null = null;
let refreshVersion: number | null = null;

const endpointsWithoutAutomaticRefresh = new Set<string>([
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.VERIFY_REGISTRATION_OTP,
  API_ENDPOINTS.AUTH.RESEND_REGISTRATION_OTP,
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REQUEST_LOGIN_OTP,
  API_ENDPOINTS.AUTH.LOGIN_WITH_OTP,
  API_ENDPOINTS.AUTH.GOOGLE,
  API_ENDPOINTS.AUTH.GOOGLE_CODE,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET,
  API_ENDPOINTS.AUTH.COMPLETE_PASSWORD_RESET,
]);

const sessionChanged = () =>
  toApiRequestError({
    code: 'session_changed',
    message: 'The authentication session changed. Please sign in again.',
  });

const assertSession = (version: number | undefined) => {
  if (version !== authTokenStore.getSessionVersion()) throw sessionChanged();
};

const assertRequestSession = (request: RetriableRequestConfig) => {
  if (request.sessionVersion !== authTokenStore.getSessionVersion())
    request.headers.delete('Authorization');
  assertSession(request.sessionVersion);
};

const refreshAccessToken = async (version: number): Promise<AuthenticationResponse> => {
  assertSession(version);
  const refreshToken = authTokenStore.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token is available.');
  }

  const response = await refreshClient.post<AuthenticationResponse>(
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    { refreshToken },
  );

  if (!response.data?.accessToken || !response.data.refreshToken || !response.data.user?.id)
    throw new Error('Authentication could not be restored. Please sign in again.');

  // A refresh started before logout must not restore the old account.
  assertSession(version);
  if (
    authTokenStore.getRefreshToken() !== refreshToken ||
    !authTokenStore.rotate(response.data, version)
  )
    throw sessionChanged();

  window.dispatchEvent(
    new CustomEvent('auth:session-refreshed', {
      detail: {
        accessTokenExpiresAtUtc: response.data.accessTokenExpiresAtUtc,
        user: response.data.user,
      },
    }),
  );

  return response.data;
};

// Startup restoration and interceptor recovery share a flight only within one epoch.
export const refreshAuthentication = async (): Promise<AuthenticationResponse> => {
  const version = authTokenStore.getSessionVersion();
  if (!refreshPromise || refreshVersion !== version) {
    refreshVersion = version;
    const pendingRefresh = refreshAccessToken(version).finally(() => {
      if (refreshPromise === pendingRefresh) {
        refreshPromise = null;
        refreshVersion = null;
      }
    });
    refreshPromise = pendingRefresh;
  }
  const response = await refreshPromise;
  assertSession(version);
  return response;
};

const expireSession = (version: number | undefined) => {
  if (version !== authTokenStore.getSessionVersion()) return;
  authTokenStore.clear();
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
};

apiClient.interceptors.request.use(
  (config) => {
    const request = config as RetriableRequestConfig;
    request.sessionVersion ??= authTokenStore.getSessionVersion();
    // Always discard caller/replay Authorization before consulting this session.
    config.headers.delete('Authorization');
    assertSession(request.sessionVersion);
    const accessToken = authTokenStore.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: unknown) => {
    throw toApiRequestError(error);
  },
  { synchronous: true },
);

const replayRequest = (request: RetriableRequestConfig) => {
  request.headers.delete('Authorization');
  assertRequestSession(request);
  return apiClient(request);
};

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    const skipsAutomaticRefresh = originalRequest?.url
      ? endpointsWithoutAutomaticRefresh.has(originalRequest.url)
      : false;

    if (error.response?.status !== 401 || !originalRequest || skipsAutomaticRefresh) {
      return Promise.reject(toApiRequestError(error));
    }

    const failedToken = originalRequest.headers.Authorization;
    assertRequestSession(originalRequest);
    const currentToken = authTokenStore.getAccessToken();
    if (originalRequest.hasRetried) {
      if (currentToken && failedToken === `Bearer ${currentToken}`)
        expireSession(originalRequest.sessionVersion);
      return Promise.reject(toApiRequestError(error));
    }

    originalRequest.hasRetried = true;

    // A late 401 from the old token can arrive after a shared refresh completed.
    if (currentToken && failedToken !== `Bearer ${currentToken}`) {
      return replayRequest(originalRequest);
    }

    try {
      await refreshAuthentication();
      assertRequestSession(originalRequest);
      return replayRequest(originalRequest);
    } catch (refreshError: unknown) {
      // Authentication was not restored: stop protected polling through the
      // existing expiry flow. Do not clear a newer login that replaced this one.
      assertRequestSession(originalRequest);
      expireSession(originalRequest.sessionVersion);

      return Promise.reject(toApiRequestError(refreshError));
    }
  },
);

export { apiClient };
