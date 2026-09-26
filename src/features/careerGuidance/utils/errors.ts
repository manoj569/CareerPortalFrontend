import type { AxiosBaseQueryError } from '@/api/axiosBaseQuery';
export const guidanceError = (error: unknown): Partial<AxiosBaseQueryError> => error && typeof error === 'object' ? error : {};
export const guidanceErrorMessage = (error: unknown): string => {
  const value = guidanceError(error);
  if (value.status === 409 && value.code === 'reservation_expired') return 'This unpaid booking reservation has expired. Choose a new available time and create a new booking.';
  if (value.code === 'request_cancelled') return 'The request was interrupted. Retry to check the current status before continuing.';
  if (value.code === 'network_error') return 'The service could not be reached. Check your connection and retry to check the current status.';
  if (value.status === 401) return 'Your session has expired. Please sign in again.';
  if (value.status === 403) return 'This action is not available to your account.';
  if (value.status === 404) return 'This record is unavailable or does not belong to your account.';
  if (value.status === 429) return 'Too many requests. Please wait before trying again.';
  if (value.status === 409) return value.code === 'analytics_currency'
    ? 'This period includes currencies that this analytics report cannot combine. Choose another period.'
    : 'The record, availability, or eligibility has changed. Current data has been reloaded. Review it before trying again.';
  if (value.status === 400) return 'Please check the form values. The server could not accept this request.';
  return 'We could not complete this request. Please try again. If a payment was attempted, refresh its status before retrying.';
};
