import { ROUTES, buildJobDetailsPath } from '@/constants/routes';

const LOCAL_ORIGIN = 'https://career-portal.invalid';
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isGuid = (value: string | null): value is string =>
  typeof value === 'string' && GUID_PATTERN.test(value);

export const getSafeJobReturnPath = (
  value: string | null | undefined,
  fallback = ROUTES.JOBS,
): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;

  try {
    const parsed = new URL(value, LOCAL_ORIGIN);
    const isJobPath =
      parsed.origin === LOCAL_ORIGIN &&
      (parsed.pathname === ROUTES.JOBS || parsed.pathname.startsWith(`${ROUTES.JOBS}/`));
    return isJobPath ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
};

export const getJobSlugFromReturnPath = (returnPath: string): string | null => {
  try {
    const pathname = new URL(returnPath, LOCAL_ORIGIN).pathname;
    const match = pathname.match(/^\/jobs\/([^/]+)$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

export const buildPaymentPath = (jobId: string, jobSlug: string): string => {
  const returnTo = buildJobDetailsPath(jobSlug);
  const params = new URLSearchParams({ jobId, returnTo });
  return `${ROUTES.PAYMENT}?${params.toString()}`;
};

interface PaymentStatusPathOptions {
  paymentId?: string;
  reason?: string;
  returnTo: string;
  retryPath?: string;
}

export const buildPaymentStatusPath = (
  route: string,
  { paymentId, reason, returnTo, retryPath }: PaymentStatusPathOptions,
): string => {
  const params = new URLSearchParams({ returnTo: getSafeJobReturnPath(returnTo) });
  if (paymentId && isGuid(paymentId)) params.set('paymentId', paymentId);
  if (reason) params.set('reason', reason);
  if (retryPath) params.set('retryPath', retryPath);
  return `${route}?${params.toString()}`;
};

export const getSafePaymentRetryPath = (
  value: string | null | undefined,
  fallback = ROUTES.JOBS,
): string => {
  if (!value || !value.startsWith(`${ROUTES.PAYMENT}?`)) return fallback;
  try {
    const parsed = new URL(value, LOCAL_ORIGIN);
    if (parsed.origin !== LOCAL_ORIGIN || parsed.pathname !== ROUTES.PAYMENT) return fallback;
    const jobId = parsed.searchParams.get('jobId');
    const returnTo = getSafeJobReturnPath(parsed.searchParams.get('returnTo'));
    return isGuid(jobId)
      ? `${ROUTES.PAYMENT}?${new URLSearchParams({ jobId, returnTo }).toString()}`
      : fallback;
  } catch {
    return fallback;
  }
};
