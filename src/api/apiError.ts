import axios from 'axios';

import type { ApiError } from '@/types';

interface ErrorPayload {
  message?: string;
  title?: string;
  code?: string;
  errors?: Record<string, string[]>;
  redirectToMembership?: boolean;
}

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const safeErrorText = (value: string): string =>
  value
    .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
    .replace(
      /((?:accessToken|refreshToken|password|secret|authorization)["']?\s*[:=]\s*["']?)[^\s"',;]+/gi,
      '$1[redacted]',
    )
    .replace(
      /([?&](?:token|access_token|refresh_token|password|secret|shareToken)=)[^\s&#]*/gi,
      '$1[redacted]',
    );

const errorText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? safeErrorText(value.trim()) : undefined;

const messageMap = (value: unknown): Record<string, string[]> | undefined => {
  const entries = Object.entries(record(value)).flatMap(([field, messages]) => {
    const normalized = (Array.isArray(messages) ? messages : [messages])
      .map((message: unknown) => errorText(message))
      .filter((message): message is string => Boolean(message));
    return normalized.length ? [[field, normalized] as const] : [];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
};

// Accepts normalized RTK errors as well as backend/ProblemDetails payloads.
export const extractApiError = (error: unknown): ApiError => {
  const outer = record(error);
  const payload = outer.data !== undefined ? record(outer.data) : outer;
  const trace = errorText(payload.traceId);
  return {
    message:
      errorText(payload.message) ??
      errorText(payload.title) ??
      'The request could not be completed.',
    status: typeof outer.status === 'number' ? outer.status : undefined,
    code: errorText(payload.code) ?? errorText(payload.reasonCode),
    errors: messageMap(payload.errors),
    reasonCodes: messageMap(payload.reasonCodes),
    traceId: trace && /^[A-Za-z0-9:_.-]{1,256}$/.test(trace) ? trace : undefined,
    retryAfterSeconds:
      typeof outer.retryAfterSeconds === 'number' ? outer.retryAfterSeconds : undefined,
    redirectToMembership: typeof payload.redirectToMembership === 'boolean' ? payload.redirectToMembership : undefined,
  };
};

export class ApiRequestError extends Error implements ApiError {
  public readonly status?: number;
  public readonly code?: string;
  public readonly traceId?: string;
  public readonly reasonCodes?: Record<string, string[]>;
  public readonly errors?: Record<string, string[]>;
  public readonly retryAfterSeconds?: number;
  public readonly redirectToMembership?: boolean;

  public constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiRequestError';
    this.status = apiError.status;
    this.code = apiError.code;
    this.traceId = apiError.traceId;
    this.reasonCodes = apiError.reasonCodes;
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
  if (error instanceof ApiRequestError) return error;
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    if (
      error &&
      typeof error === 'object' &&
      ('status' in error || 'errors' in error || 'message' in error)
    )
      return extractApiError(error);
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
  const details = extractApiError({ status, data: error.response.data });
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
    ...details,
    message: safeStatusMessage ?? details.message,
    status,
    retryAfterSeconds,
  };
};

export const toApiRequestError = (error: unknown): ApiRequestError =>
  error instanceof ApiRequestError ? error : new ApiRequestError(transformApiError(error));
