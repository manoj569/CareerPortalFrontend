import axios from 'axios';

import type { ApiError } from '@/types';

interface ErrorPayload {
  message?: string;
  title?: string;
  code?: string;
  errors?: Record<string, string[]>;
  redirectToMembership?: boolean;
}

export class ApiRequestError extends Error implements ApiError {
  public readonly status?: number;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;
  public readonly retryAfterSeconds?: number;
  public readonly redirectToMembership?: boolean;

  public constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiRequestError';
    this.status = apiError.status;
    this.code = apiError.code;
    this.errors = apiError.errors;
    this.retryAfterSeconds = apiError.retryAfterSeconds;
    this.redirectToMembership = apiError.redirectToMembership;
  }
}

const parseRetryAfterSeconds = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;

  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) return undefined;
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
};

export const transformApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }

  if (axios.isCancel(error)) {
    return { code: 'request_cancelled', message: 'The request was cancelled.' };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      code: 'request_timeout',
      message: 'The request timed out. Please try again.',
    };
  }

  if (!error.response) {
    return {
      code: 'network_error',
      message: 'The service could not be reached. Check your connection and try again.',
    };
  }

  const status = error.response.status;
  const retryAfterSeconds = parseRetryAfterSeconds(error.response.headers['retry-after']);
  const safeStatusMessage =
    status === 401
      ? 'Your session is no longer valid. Please sign in again.'
      : status === 403
        ? 'You do not have permission to perform this action.'
        : status === 429
          ? 'Too many requests. Please wait and try again.'
          : status >= 500
            ? 'The service is temporarily unavailable. Please try again later.'
            : undefined;

  return {
    message:
      safeStatusMessage ??
      error.response.data?.message ??
      error.response.data?.title ??
      'The request could not be completed.',
    status,
    code: error.response.data?.code,
    errors: error.response.data?.errors,
    redirectToMembership: error.response.data?.redirectToMembership,
    retryAfterSeconds,
  };
};

export const toApiRequestError = (error: unknown): ApiRequestError =>
  error instanceof ApiRequestError ? error : new ApiRequestError(transformApiError(error));
