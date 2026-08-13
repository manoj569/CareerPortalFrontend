import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Navigate, type RouteObject } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AdminRoute } from './AdminRoute';
import { CandidateRoute } from './CandidateRoute';
import { GuestRoute } from './GuestRoute';
import { appRoutes } from './routeConfig';

const rootRoute = appRoutes[0]!;

const findGuardedGroup = (component: () => React.JSX.Element): RouteObject => {
  const route = rootRoute.children?.find(
    (candidate) => isValidElement(candidate.element) && candidate.element.type === component,
  );
  if (!route) throw new Error(`Guarded route group ${component.name} was not found.`);
  return route;
};

const collectPaths = (route: RouteObject): string[] => [
  ...(route.path ? [route.path] : []),
  ...(route.children?.flatMap(collectPaths) ?? []),
];

describe('release route structure', () => {
  it('keeps authentication routes inside the guest-only group', () => {
    expect(collectPaths(findGuardedGroup(GuestRoute))).toEqual(
      expect.arrayContaining([
        ROUTES.LOGIN,
        ROUTES.REGISTER,
        ROUTES.VERIFY_REGISTRATION_MOBILE,
        ROUTES.FORGOT_PASSWORD,
        ROUTES.RESET_PASSWORD,
      ]),
    );
  });

  it('keeps legal documents public', () => {
    const publicPaths = rootRoute.children?.flatMap((route) => collectPaths(route)) ?? [];
    expect(publicPaths).toEqual(
      expect.arrayContaining([ROUTES.TERMS_OF_USE, ROUTES.PRIVACY_POLICY, ROUTES.COOKIE_POLICY]),
    );
  });

  it('keeps Candidate routes separate from Administrator routes', () => {
    const candidatePaths = collectPaths(findGuardedGroup(CandidateRoute));
    const adminPaths = collectPaths(findGuardedGroup(AdminRoute));

    expect(candidatePaths).toEqual(
      expect.arrayContaining([
        ROUTES.ONBOARDING,
        ROUTES.DASHBOARD,
        ROUTES.DASHBOARD_JOBS,
        ROUTES.PORTFOLIO,
        ROUTES.PROFILE,
        ROUTES.RESUME,
        ROUTES.SAVED_JOBS,
        ROUTES.APPLICATIONS,
        ROUTES.APPLICATION_DETAILS,
        ROUTES.MEMBERSHIP,
        ROUTES.PAYMENT,
      ]),
    );
    expect(adminPaths).toEqual(
      expect.arrayContaining([
        ROUTES.ADMIN,
        ROUTES.ADMIN_JOBS,
        ROUTES.ADMIN_JOB_DISCOVERY,
        ROUTES.ADMIN_JOB_DISCOVERY_RUN,
        ROUTES.ADMIN_APPLICATIONS,
        ROUTES.ADMIN_AUDIT_LOGS,
      ]),
    );
    expect(candidatePaths).not.toEqual(expect.arrayContaining(adminPaths));
    expect(adminPaths).not.toContain(ROUTES.DASHBOARD);
    expect(adminPaths).not.toEqual(
      expect.arrayContaining([
        ROUTES.ADMIN_COMPANIES,
        ROUTES.ADMIN_COMPANY_CREATE,
        ROUTES.ADMIN_CATEGORIES,
        ROUTES.ADMIN_CATEGORY_CREATE,
      ]),
    );
  });

  it('retains route-level error recovery and the unknown-route fallback', () => {
    expect(rootRoute.errorElement).toBeTruthy();
    expect(rootRoute.children?.some((route) => route.path === '*')).toBe(true);
    expect(rootRoute.children?.some((route) => route.path === ROUTES.UNAUTHORIZED)).toBe(true);
  });

  it('redirects the legacy resume route to Browse jobs', () => {
    const candidateGroup = findGuardedGroup(CandidateRoute);
    const resumeRoute = candidateGroup.children?.flatMap((route) => route.children ?? []).find((route) => route.path === ROUTES.RESUME);
    expect(isValidElement(resumeRoute?.element)).toBe(true);
    if (!isValidElement(resumeRoute?.element)) throw new Error('Resume redirect was not found.');
    expect(resumeRoute.element.type).toBe(Navigate);
    expect(resumeRoute.element.props).toMatchObject({ replace: true, to: ROUTES.DASHBOARD_JOBS });
  });

  it('redirects the legacy profile route to the guarded Portfolio workspace', () => {
    const candidateGroup = findGuardedGroup(CandidateRoute);
    const profileRoute = candidateGroup.children?.flatMap((route) => route.children ?? []).find((route) => route.path === ROUTES.PROFILE);
    expect(isValidElement(profileRoute?.element)).toBe(true);
    if (!isValidElement(profileRoute?.element)) throw new Error('Profile redirect was not found.');
    expect(profileRoute.element.type).toBe(Navigate);
    expect(profileRoute.element.props).toMatchObject({ replace: true, to: ROUTES.PORTFOLIO });
  });

  it('keeps public portfolios anonymous and outside dashboard layouts', () => {
    const candidatePaths = collectPaths(findGuardedGroup(CandidateRoute));
    const allPublicPaths = rootRoute.children?.filter((route) => !isValidElement(route.element) || route.element.type !== CandidateRoute).flatMap(collectPaths) ?? [];
    expect(allPublicPaths).toContain(ROUTES.PUBLIC_PORTFOLIO);
    expect(candidatePaths).not.toContain(ROUTES.PUBLIC_PORTFOLIO);
  });
});
