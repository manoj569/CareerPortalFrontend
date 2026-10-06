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
  value === ROUTES.DASHBOARD_JOBS ||
  value === `${ROUTES.DASHBOARD_JOBS}?mode=referral` ||
  value === ROUTES.MEMBERSHIP ||
  value === ROUTES.RESUME_MAKER ||
  (typeof value === 'string' &&
    /^\/dashboard\/jobs\/referral\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/contact$/.test(value) &&
    !value.includes('/00000000-0000-0000-0000-000000000000/'))
    ? value
    : undefined;

export const interviewInsightsMembershipPath = `${ROUTES.MEMBERSHIP}?${new URLSearchParams({
  returnTo: ROUTES.INTERVIEW_INSIGHTS,
}).toString()}`;
