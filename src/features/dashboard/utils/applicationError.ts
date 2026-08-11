import type { AxiosBaseQueryError } from '@/api/axiosBaseQuery';

export const PREMIUM_DAILY_LIMIT_MESSAGE =
  'You have reached today’s premium application limit of 35 jobs. Your quota resets tomorrow. You can still save jobs and apply again after the reset.';

export const DUPLICATE_APPLICATION_MESSAGE = 'You have already applied for this job.';

export const DEFAULT_APPLICATION_ERROR_MESSAGE =
  'We could not process your application. Please try again.';

export type ApplicationFailure =
  | { kind: 'duplicate'; message: string }
  | { kind: 'membership' }
  | { kind: 'message'; message: string };

const includesAny = (value: string, fragments: readonly string[]): boolean =>
  fragments.some((fragment) => value.includes(fragment));

export const getApplicationFailure = (error: unknown): ApplicationFailure => {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return { kind: 'message', message: DEFAULT_APPLICATION_ERROR_MESSAGE };
  }

  const apiError = error as AxiosBaseQueryError;
  const code = apiError.code?.trim().toLowerCase() ?? '';
  const message = typeof apiError.message === 'string' ? apiError.message.trim() : '';
  const normalizedMessage = message.toLowerCase();

  const isDailyLimit =
    apiError.status === 429 ||
    includesAny(code, ['daily_application_limit', 'premium_daily_limit']) ||
    includesAny(normalizedMessage, [
      "today's limit of 35",
      'today’s limit of 35',
      '35 job applications',
      'daily application limit',
      'resets tomorrow',
    ]);

  if (isDailyLimit) {
    return { kind: 'message', message: PREMIUM_DAILY_LIMIT_MESSAGE };
  }

  const isDuplicate =
    includesAny(code, ['duplicate_application', 'already_applied']) ||
    includesAny(normalizedMessage, ['already applied', 'application already exists']);

  if (isDuplicate) {
    return { kind: 'duplicate', message: DUPLICATE_APPLICATION_MESSAGE };
  }

  const requiresMembership =
    apiError.redirectToMembership === true ||
    ((apiError.status === 403 || apiError.status === 409) &&
      (includesAny(code, [
        'membership_required',
        'application_quota_exceeded',
        'monthly_job_limit_reached',
      ]) ||
      includesAny(normalizedMessage, [
        'membership is required',
        'active membership required',
        'upgrade to premium',
        'free job applications',
        'used all 10',
      ])));

  if (requiresMembership) {
    return { kind: 'membership' };
  }

  return { kind: 'message', message: message || DEFAULT_APPLICATION_ERROR_MESSAGE };
};
