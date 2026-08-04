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
  SAVED_JOBS: '/dashboard/saved-jobs',
  APPLICATIONS: '/dashboard/applications',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
  PAYMENTS: '/dashboard/payments',
  
  // --- ADD THIS LINE BELOW ---
  MEMBERSHIP: '/plans', // or '/membership' or '/pricing' depending on your app
  // --------------------------

  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_PENDING: '/payment/pending',
  PAYMENT_FAILED: '/payment/failed',
  ADMIN: '/admin',
  ADMIN_JOBS: '/admin/jobs',
  // ... rest of your routes ...
} as const;

export const buildJobDetailsPath = (slug: string): string =>
  ROUTES.JOB_DETAILS.replace(':slug', encodeURIComponent(slug));