export const ROUTES = {
  HOME: '/',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:slug',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_REGISTRATION_MOBILE: '/register/verify-mobile',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TERMS_OF_USE: '/terms-of-use',
  PRIVACY_POLICY: '/privacy-policy',
  UNAUTHORIZED: '/unauthorized',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  DASHBOARD_JOBS: '/dashboard/jobs',
  PROFILE: '/dashboard/profile',
  RESUME: '/dashboard/resume',
  SAVED_JOBS: '/dashboard/saved-jobs',
  APPLICATIONS: '/dashboard/applications',
  APPLICATION_DETAILS: '/dashboard/applications/:applicationId',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
  MEMBERSHIP: '/dashboard/membership',
  PAYMENTS: '/dashboard/payments',
  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_PENDING: '/payment/pending',
  PAYMENT_FAILED: '/payment/failed',
  ADMIN: '/admin',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_JOB_CREATE: '/admin/jobs/create',
  ADMIN_JOB_DETAILS: '/admin/jobs/:jobId',
  ADMIN_JOB_EDIT: '/admin/jobs/:jobId/edit',
  ADMIN_COMPANIES: '/admin/companies',
  ADMIN_COMPANY_CREATE: '/admin/companies/create',
  ADMIN_COMPANY_DETAILS: '/admin/companies/:companyId',
  ADMIN_COMPANY_EDIT: '/admin/companies/:companyId/edit',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_CATEGORY_CREATE: '/admin/categories/create',
  ADMIN_CATEGORY_DETAILS: '/admin/categories/:categoryId',
  ADMIN_CATEGORY_EDIT: '/admin/categories/:categoryId/edit',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: '/admin/users/:userId',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_APPLICATION_DETAILS: '/admin/applications/:applicationId',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_PAYMENT_DETAILS: '/admin/payments/:paymentId',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
} as const;

export const buildJobDetailsPath = (slug: string): string =>
  ROUTES.JOB_DETAILS.replace(':slug', encodeURIComponent(slug));

export const buildApplicationDetailsPath = (applicationId: string): string =>
  ROUTES.APPLICATION_DETAILS.replace(':applicationId', encodeURIComponent(applicationId));

export const buildAdminJobEditPath = (jobId: string): string =>
  ROUTES.ADMIN_JOB_EDIT.replace(':jobId', encodeURIComponent(jobId));

export const buildAdminJobDetailsPath = (jobId: string): string =>
  ROUTES.ADMIN_JOB_DETAILS.replace(':jobId', encodeURIComponent(jobId));

export const buildAdminCompanyDetailsPath = (companyId: string): string =>
  ROUTES.ADMIN_COMPANY_DETAILS.replace(':companyId', encodeURIComponent(companyId));

export const buildAdminCompanyEditPath = (companyId: string): string =>
  ROUTES.ADMIN_COMPANY_EDIT.replace(':companyId', encodeURIComponent(companyId));

export const buildAdminCategoryDetailsPath = (categoryId: string): string =>
  ROUTES.ADMIN_CATEGORY_DETAILS.replace(':categoryId', encodeURIComponent(categoryId));

export const buildAdminCategoryEditPath = (categoryId: string): string =>
  ROUTES.ADMIN_CATEGORY_EDIT.replace(':categoryId', encodeURIComponent(categoryId));

export const buildAdminApplicationDetailsPath = (applicationId: string): string =>
  ROUTES.ADMIN_APPLICATION_DETAILS.replace(':applicationId', encodeURIComponent(applicationId));

export const buildAdminUserDetailsPath = (userId: string): string =>
  ROUTES.ADMIN_USER_DETAILS.replace(':userId', encodeURIComponent(userId));

export const buildAdminPaymentDetailsPath = (paymentId: string): string =>
  ROUTES.ADMIN_PAYMENT_DETAILS.replace(':paymentId', encodeURIComponent(paymentId));
