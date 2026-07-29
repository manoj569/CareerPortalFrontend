export const ROUTES = {
  HOME: '/',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:slug',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  RESUME: '/dashboard/resume',
  SAVED_JOBS: '/dashboard/saved-jobs',
  APPLICATIONS: '/dashboard/applications',
  APPLICATION_DETAILS: '/dashboard/applications/:applicationId',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
  PAYMENTS: '/dashboard/payments',
  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_PENDING: '/payment/pending',
  PAYMENT_FAILED: '/payment/failed',
  ADMIN: '/admin',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_JOB_CREATE: '/admin/jobs/create',
  ADMIN_JOB_EDIT: '/admin/jobs/:jobId/edit',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: '/admin/users/:userId',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_APPLICATION_DETAILS: '/admin/applications/:applicationId',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_PAYMENT_DETAILS: '/admin/payments/:paymentId',
} as const;

export const buildJobDetailsPath = (slug: string): string =>
  ROUTES.JOB_DETAILS.replace(':slug', encodeURIComponent(slug));

export const buildApplicationDetailsPath = (applicationId: string): string =>
  ROUTES.APPLICATION_DETAILS.replace(':applicationId', encodeURIComponent(applicationId));

export const buildAdminJobEditPath = (jobId: string): string =>
  ROUTES.ADMIN_JOB_EDIT.replace(':jobId', encodeURIComponent(jobId));

export const buildAdminUserDetailsPath = (userId: string): string =>
  ROUTES.ADMIN_USER_DETAILS.replace(':userId', encodeURIComponent(userId));

export const buildAdminPaymentDetailsPath = (paymentId: string): string =>
  ROUTES.ADMIN_PAYMENT_DETAILS.replace(':paymentId', encodeURIComponent(paymentId));
