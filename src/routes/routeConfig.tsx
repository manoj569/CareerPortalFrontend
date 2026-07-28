import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import type { RouteObject } from 'react-router-dom';

import { RouteAccessibility } from '@/components/accessibility/RouteAccessibility';
import { RouteLoadingFallback } from '@/components/feedback/RouteLoadingFallback';
import { ROUTES } from '@/constants/routes';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { UserDashboardLayout } from '@/layouts/UserDashboardLayout';
import { AdminRoute } from './AdminRoute';
import { CandidateRoute } from './CandidateRoute';
import { GuestRoute } from './GuestRoute';

type PageImport = Promise<Record<string, ComponentType>>;

const lazyPage = (loadPage: () => PageImport, exportName: string) => {
  const LazyPage: LazyExoticComponent<ComponentType> = lazy(async () => {
    const module = await loadPage();
    const Page = module[exportName];
    if (!Page) throw new Error(`Lazy page export "${exportName}" was not found.`);
    return { default: Page };
  });

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LazyPage />
    </Suspense>
  );
};

const routeErrorElement = lazyPage(() => import('@/pages/RouteErrorPage'), 'RouteErrorPage');

export const appRoutes: RouteObject[] = [
  {
    element: <RouteAccessibility />,
    errorElement: routeErrorElement,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: ROUTES.HOME,
            element: lazyPage(() => import('@/pages/HomePage'), 'HomePage'),
          },
          {
            path: ROUTES.JOBS,
            element: lazyPage(() => import('@/pages/JobsPage'), 'JobsPage'),
          },
          {
            path: ROUTES.JOB_DETAILS,
            element: lazyPage(() => import('@/pages/JobDetailsPage'), 'JobDetailsPage'),
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: ROUTES.LOGIN,
                element: lazyPage(() => import('@/pages/LoginPage'), 'LoginPage'),
              },
              {
                path: ROUTES.REGISTER,
                element: lazyPage(() => import('@/pages/RegisterPage'), 'RegisterPage'),
              },
              {
                path: ROUTES.FORGOT_PASSWORD,
                element: lazyPage(() => import('@/pages/ForgotPasswordPage'), 'ForgotPasswordPage'),
              },
              {
                path: ROUTES.RESET_PASSWORD,
                element: lazyPage(() => import('@/pages/ResetPasswordPage'), 'ResetPasswordPage'),
              },
              {
                path: ROUTES.VERIFY_EMAIL,
                element: lazyPage(
                  () => import('@/pages/EmailVerificationPage'),
                  'EmailVerificationPage',
                ),
              },
            ],
          },
        ],
      },
      {
        element: <CandidateRoute />,
        children: [
          {
            element: <UserDashboardLayout />,
            children: [
              {
                path: ROUTES.DASHBOARD,
                element: lazyPage(() => import('@/pages/DashboardPage'), 'DashboardPage'),
              },
              {
                path: ROUTES.PROFILE,
                element: lazyPage(() => import('@/pages/ProfilePage'), 'ProfilePage'),
              },
              {
                path: ROUTES.SAVED_JOBS,
                element: lazyPage(() => import('@/pages/SavedJobsPage'), 'SavedJobsPage'),
              },
              {
                path: ROUTES.APPLICATIONS,
                element: lazyPage(() => import('@/pages/ApplicationsPage'), 'ApplicationsPage'),
              },
              {
                path: ROUTES.NOTIFICATIONS,
                element: lazyPage(() => import('@/pages/NotificationsPage'), 'NotificationsPage'),
              },
              {
                path: ROUTES.SETTINGS,
                element: lazyPage(() => import('@/pages/SettingsPage'), 'SettingsPage'),
              },
              {
                path: ROUTES.PAYMENTS,
                element: lazyPage(() => import('@/pages/PaymentsPage'), 'PaymentsPage'),
              },
            ],
          },
          {
            element: <PublicLayout />,
            children: [
              {
                path: ROUTES.PAYMENT,
                element: lazyPage(() => import('@/pages/PaymentPage'), 'PaymentPage'),
              },
              {
                path: ROUTES.PAYMENT_SUCCESS,
                element: lazyPage(() => import('@/pages/PaymentSuccessPage'), 'PaymentSuccessPage'),
              },
              {
                path: ROUTES.PAYMENT_PENDING,
                element: lazyPage(() => import('@/pages/PaymentPendingPage'), 'PaymentPendingPage'),
              },
              {
                path: ROUTES.PAYMENT_FAILED,
                element: lazyPage(() => import('@/pages/PaymentFailedPage'), 'PaymentFailedPage'),
              },
            ],
          },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminDashboardLayout />,
            children: [
              {
                path: ROUTES.ADMIN,
                element: lazyPage(
                  () => import('@/pages/admin/AdminDashboardPage'),
                  'AdminDashboardPage',
                ),
              },
              {
                path: ROUTES.ADMIN_JOBS,
                element: lazyPage(() => import('@/pages/admin/AdminJobsPage'), 'AdminJobsPage'),
              },
              {
                path: ROUTES.ADMIN_JOB_CREATE,
                element: lazyPage(
                  () => import('@/pages/admin/AdminCreateJobPage'),
                  'AdminCreateJobPage',
                ),
              },
              {
                path: ROUTES.ADMIN_JOB_EDIT,
                element: lazyPage(
                  () => import('@/pages/admin/AdminEditJobPage'),
                  'AdminEditJobPage',
                ),
              },
              {
                path: ROUTES.ADMIN_USERS,
                element: lazyPage(() => import('@/pages/admin/AdminUsersPage'), 'AdminUsersPage'),
              },
              {
                path: ROUTES.ADMIN_USER_DETAILS,
                element: lazyPage(
                  () => import('@/pages/admin/AdminUserDetailsPage'),
                  'AdminUserDetailsPage',
                ),
              },
              {
                path: ROUTES.ADMIN_APPLICATIONS,
                element: lazyPage(
                  () => import('@/pages/admin/AdminApplicationsPage'),
                  'AdminApplicationsPage',
                ),
              },
              {
                path: ROUTES.ADMIN_APPLICATION_DETAILS,
                element: lazyPage(
                  () => import('@/pages/admin/AdminApplicationDetailsPage'),
                  'AdminApplicationDetailsPage',
                ),
              },
              {
                path: ROUTES.ADMIN_PAYMENTS,
                element: lazyPage(
                  () => import('@/pages/admin/AdminPaymentsPage'),
                  'AdminPaymentsPage',
                ),
              },
              {
                path: ROUTES.ADMIN_PAYMENT_DETAILS,
                element: lazyPage(
                  () => import('@/pages/admin/AdminPaymentDetailsPage'),
                  'AdminPaymentDetailsPage',
                ),
              },
            ],
          },
        ],
      },
      {
        path: ROUTES.UNAUTHORIZED,
        element: lazyPage(() => import('@/pages/UnauthorizedPage'), 'UnauthorizedPage'),
      },
      {
        path: '*',
        element: lazyPage(() => import('@/pages/NotFoundPage'), 'NotFoundPage'),
      },
    ],
  },
];
