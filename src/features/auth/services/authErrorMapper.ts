import { ApiRequestError, toApiRequestError } from '@/api/apiError';

const messagesByCode: Record<string, string> = {
  invalid_reset_token: 'This password reset link is invalid or has expired.',
  validation_error: 'Please review the highlighted information and try again.',
  conflict: 'An account with this email address already exists.',
};

export const getAuthenticationErrorMessage = (error: unknown): string => {
  const apiError = error instanceof ApiRequestError ? error : toApiRequestError(error);

  if (apiError.status === 401) return 'The email address or password is incorrect.';
  const codeMessage = apiError.code ? messagesByCode[apiError.code] : undefined;
  if (codeMessage) return codeMessage;
  if (apiError.status === 409) return 'An account with this email address already exists.';
  if (apiError.status === 429) return 'Too many attempts. Please wait and try again.';
  if (apiError.status && apiError.status >= 500) {
    return 'The service is temporarily unavailable. Please try again later.';
  }

  return 'We could not complete your request. Please check your details and try again.';
};
