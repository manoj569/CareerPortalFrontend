import { ApiRequestError, toApiRequestError } from '@/api/apiError';

const messagesByCode: Record<string, string> = {
  invalid_otp: 'The code is invalid, expired, or has already been used. Request a new code.',
  invalid_password_reset: 'This password reset link is invalid, expired, or has already been used.',
  validation_error: 'Please review the highlighted information and try again.',
  conflict: 'We could not complete your request. Check your details and try again.',
  data_conflict: 'We could not complete your request. Check your details and try again.',
};

export const getAuthenticationErrorMessage = (error: unknown): string => {
  const apiError = error instanceof ApiRequestError ? error : toApiRequestError(error);

  if (apiError.status === 401) return 'The identifier or password is incorrect.';
  const codeMessage = apiError.code ? messagesByCode[apiError.code] : undefined;
  if (codeMessage) return codeMessage;
  if (apiError.status === 400) return 'Please check the information and try again.';
  if (apiError.status === 403) return 'This sign-in method is not available for this account.';
  if (apiError.status === 409) {
    return 'We could not complete your request. Check your details and try again.';
  }
  if (apiError.status === 429) {
    const wait = apiError.retryAfterSeconds;
    return wait && wait > 0
      ? `Too many attempts. Try again in ${wait} seconds.`
      : 'Too many attempts. Please wait and try again.';
  }
  if (apiError.code === 'request_timeout') return 'The request timed out. Please try again.';
  if (apiError.code === 'network_error') {
    return 'The service could not be reached. Check your connection and try again.';
  }
  if (apiError.status && apiError.status >= 500) {
    return 'The service is temporarily unavailable. Please try again later.';
  }

  return 'We could not complete your request. Please check your details and try again.';
};

export const getRetryAfterSeconds = (error: unknown): number | undefined =>
  error instanceof ApiRequestError ? error.retryAfterSeconds : undefined;
