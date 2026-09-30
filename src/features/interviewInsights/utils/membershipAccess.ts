import { ROUTES } from '@/constants/routes';

const safeCandidatePaths = [
  ROUTES.DASHBOARD,
  ROUTES.DASHBOARD_JOBS,
  ROUTES.PORTFOLIO,
  ROUTES.PROFILE,
  ROUTES.SAVED_JOBS,
  ROUTES.APPLICATIONS,
  ROUTES.NOTIFICATIONS,
  ROUTES.SETTINGS,
  ROUTES.MEMBERSHIP,
  ROUTES.PAYMENTS,
] as const;

export const getSafeCandidateDashboardReturnPath = (
  value: unknown,
  fallback = ROUTES.DASHBOARD,
): string => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//'))
    return fallback;

  try {
    const url = new URL(value, 'https://career-harbor.local');
    if (url.origin !== 'https://career-harbor.local') return fallback;
    const allowed = safeCandidatePaths.some(
      (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
    );
    return allowed ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
};

export const getSafeMembershipReturnTo = (value: string | null): string | undefined =>
  value === ROUTES.INTERVIEW_INSIGHTS ||
  value === ROUTES.AI_APPLY ||
  (typeof value === 'string' &&
    /^\/dashboard\/jobs\/referral\/[a-zA-Z0-9_-]+\/contact$/.test(value))
    ? value
    : undefined;

export const interviewInsightsMembershipPath = `${ROUTES.MEMBERSHIP}?${new URLSearchParams({
  returnTo: ROUTES.INTERVIEW_INSIGHTS,
}).toString()}`;
