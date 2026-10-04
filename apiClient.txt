import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { environment } from '@config/environment';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { authTokenStore } from '@/services/authTokenStore';
import type { AuthenticationResponse } from '@/types';
import { toApiRequestError } from './apiError';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  hasRetried?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: environment.apiTimeoutMs,
  headers: { Accept: 'application/json' },
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: environment.apiTimeoutMs,
  headers: { Accept: 'application/json' },
});

let refreshPromise: Promise<AuthenticationResponse> | null = null;

const endpointsWithoutAutomaticRefresh = new Set<string>([
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.VERIFY_REGISTRATION_OTP,
  API_ENDPOINTS.AUTH.RESEND_REGISTRATION_OTP,
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REQUEST_LOGIN_OTP,
  API_ENDPOINTS.AUTH.LOGIN_WITH_OTP,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET,
  API_ENDPOINTS.AUTH.COMPLETE_PASSWORD_RESET,
]);

const refreshAccessToken = async (): Promise<AuthenticationResponse> => {
  const refreshToken = authTokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token is available.');

  const response = await refreshClient.post<AuthenticationResponse>(
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    { refreshToken },
  );
  authTokenStore.set(response.data);
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

apiClient.interceptors.request.use((config) => {
  const accessToken = authTokenStore.getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const skipsAutomaticRefresh = originalRequest?.url
      ? endpointsWithoutAutomaticRefresh.has(originalRequest.url)
      : false;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.hasRetried ||
      skipsAutomaticRefresh
    ) {
      return Promise.reject(toApiRequestError(error));
    }

    originalRequest.hasRetried = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const response = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError: unknown) {
      authTokenStore.clear();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(toApiRequestError(refreshError));
    }
  },
);

export { apiClient };
