import { ApiRequestError, toApiRequestError } from '@/api/apiError';

const messagesByCode: Record<string, string> = {
  invalid_google_authorization_code: 'Google sign-in could not be verified. Please try again.',
  google_authentication_unavailable: 'Google sign-in is temporarily unavailable. Please try again.',
  google_origin_not_allowed: 'Google sign-in is temporarily unavailable. Please try again.',
  invalid_google_code_request: 'Google sign-in could not be verified. Please try again.',
  terms_acceptance_required: 'Please review the Terms of Use and Privacy Policy before continuing.',
  invalid_otp: 'The code is invalid, expired, or has already been used. Request a new code.',
  invalid_password_reset: 'This password reset link is invalid, expired, or has already been used.',
  email_not_verified: 'Please verify your email before signing in.',
  email_unverified: 'Please verify your email before signing in.',
  unverified_email: 'Please verify your email before signing in.',
  email_verification_required: 'Please verify your email before signing in.',
  validation_error: 'Please review the highlighted information and try again.',
  conflict: 'We could not complete your request. Check your details and try again.',
  data_conflict: 'We could not complete your request. Check your details and try again.',
};

export const getGoogleAuthenticationErrorMessage = (
  error: unknown,
  intent: 'Login' | 'Register',
) => {
  const apiError = error instanceof ApiRequestError ? error : toApiRequestError(error);
  switch (apiError.code) {
    case 'google_account_not_registered':
      return 'No Career Harbor account is connected to this Google account. Create an account first.';
    case 'existing_account_requires_login':
      return intent === 'Register'
        ? 'An account with this email already exists. Log in using your existing method.'
        : 'Please log in using your existing method.';
    case 'invalid_google_credential':
      return 'Google sign-in could not be verified. Please try again.';
    case 'google_authentication_disabled':
      return `Google ${intent === 'Login' ? 'sign-in' : 'registration'} is temporarily unavailable.`;
    default:
      return getAuthenticationErrorMessage(apiError);
  }
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
