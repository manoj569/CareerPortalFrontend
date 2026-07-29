import { ApiRequestError, toApiRequestError } from '@/api/apiError';

export const EMAIL_NOT_VERIFIED_MESSAGE =
  'Verify your email address before signing in. You can request a new verification email below.';

export const INVALID_VERIFICATION_LINK_MESSAGE =
  'This email verification link is invalid or has expired.';

const messagesByCode: Record<string, string> = {
  invalid_reset_token: 'This password reset link is invalid or has expired.',
  invalid_verification_token: INVALID_VERIFICATION_LINK_MESSAGE,
  email_not_verified: EMAIL_NOT_VERIFIED_MESSAGE,
  validation_error: 'Please review the highlighted information and try again.',
  conflict: 'We could not complete your request. Check your details and try again.',
};

export const getAuthenticationErrorMessage = (error: unknown): string => {
  const apiError = error instanceof ApiRequestError ? error : toApiRequestError(error);

  if (apiError.status === 401) return 'The email address or password is incorrect.';
  const codeMessage = apiError.code ? messagesByCode[apiError.code] : undefined;
  if (codeMessage) return codeMessage;
  if (apiError.status === 409) {
    return 'We could not complete your request. Check your details and try again.';
  }
  if (apiError.status === 429) return 'Too many attempts. Please wait and try again.';
  if (apiError.status && apiError.status >= 500) {
    return 'The service is temporarily unavailable. Please try again later.';
  }

  return 'We could not complete your request. Please check your details and try again.';
};
