export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    VERIFY_REGISTRATION_OTP: '/api/auth/verify-registration-otp',
    RESEND_REGISTRATION_OTP: '/api/auth/resend-registration-otp',
    LOGIN: '/api/auth/login',
    REQUEST_LOGIN_OTP: '/api/auth/request-login-otp',
    LOGIN_WITH_OTP: '/api/auth/login-with-otp',
    REFRESH_TOKEN: '/api/auth/refresh',
    REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
    COMPLETE_PASSWORD_RESET: '/api/auth/complete-password-reset',
    CHANGE_PASSWORD: '/api/auth/change-password',
    LOGOUT: '/api/auth/logout',
    ADMIN_HEALTH: '/api/auth/admin/health',
  },
  LEGAL: {
    TERMS_OF_USE: '/legal/terms-of-use',
    PRIVACY_POLICY: '/legal/privacy-policy',
  },
  JOBS: {
    SEARCH: '/api/jobs',
    FILTER_OPTIONS: '/api/jobs/filter-options',
    LATEST: '/api/jobs/latest',
    NEWEST: '/api/jobs/newest',
    FEATURED: '/api/jobs/featured',
    POPULAR_COMPANIES: '/api/jobs/companies/popular',
    DETAILS: (slug: string) => `/api/jobs/${encodeURIComponent(slug)}`,
    RELATED: (slug: string) => `/api/jobs/${encodeURIComponent(slug)}/related`,
  },
  MEMBERSHIPS: {
    APPLY_TO_JOB: (slug: string) => `/api/memberships/jobs/${encodeURIComponent(slug)}/apply`,
  },
  PAYMENTS: {
    CREATE_RAZORPAY_ORDER: '/api/payments/razorpay/orders',
    CONFIRM_RAZORPAY: (paymentId: string) =>
      `/api/payments/${encodeURIComponent(paymentId)}/razorpay/confirm`,
    RECONCILE_RAZORPAY: (paymentId: string) =>
      `/api/payments/${encodeURIComponent(paymentId)}/razorpay/reconcile`,
    STATUS: '/api/payments/status',
    LIST: '/api/payments',
    HISTORY: '/api/payments/history',
  },
  ADMIN: {
    DASHBOARD_STATISTICS: '/api/admin/dashboard/statistics',
    DASHBOARD_RECENT_PAYMENTS: '/api/admin/dashboard/recent-payments',
    DASHBOARD_RECENT_USERS: '/api/admin/dashboard/recent-users',
    DASHBOARD_CHARTS: '/api/admin/dashboard/charts',
    JOBS: '/api/admin/jobs',
    JOB: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}`,
    JOB_PUBLISH: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/publish`,
    JOB_UNPUBLISH: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/unpublish`,
    JOB_CLOSE: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/close`,
    JOB_ARCHIVE: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/archive`,
    JOB_FEATURE: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/feature`,
    JOB_UNFEATURE: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/unfeature`,
    JOB_FEATURED: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/featured`,
    JOB_HIDDEN: (jobId: string) => `/api/admin/jobs/${encodeURIComponent(jobId)}/hidden`,
    COMPANIES: '/api/admin/companies',
    JOB_RECRUITER_CONTACT: (jobId: string) =>
      `/api/admin/jobs/${encodeURIComponent(jobId)}/recruiter-contact`,
    COMPANY: (companyId: string) => `/api/admin/companies/${encodeURIComponent(companyId)}`,
    COMPANY_OPTIONS: '/api/admin/companies/options',
    CATEGORIES: '/api/admin/categories',
    CATEGORY: (categoryId: string) => `/api/admin/categories/${encodeURIComponent(categoryId)}`,
    CATEGORY_OPTIONS: '/api/admin/categories/options',
    APPLICATIONS: '/api/admin/applications',
    APPLICATION: (applicationId: string) =>
      `/api/admin/applications/${encodeURIComponent(applicationId)}`,
    APPLICATION_STATUS: (applicationId: string) =>
      `/api/admin/applications/${encodeURIComponent(applicationId)}/status`,
    APPLICATION_RESUME: (applicationId: string) =>
      `/api/admin/applications/${encodeURIComponent(applicationId)}/resume`,
    AUDIT_LOGS: '/api/admin/audit-logs',
    IMPORTS: {
      COMPANIES_PREVIEW: '/api/admin/imports/companies/preview',
      COMPANIES_COMMIT: '/api/admin/imports/companies/commit',
      JOBS_PREVIEW: '/api/admin/imports/jobs/preview',
      JOBS_COMMIT: '/api/admin/imports/jobs/commit',
      COMPANIES_TEMPLATE: '/api/admin/imports/templates/companies',
      JOBS_TEMPLATE: '/api/admin/imports/templates/jobs',
    },
  },
  DASHBOARD: {
    MEMBERSHIPS: '/api/dashboard/memberships',
    NOTIFICATIONS: '/api/dashboard/notifications',
    NOTIFICATION_READ: (notificationId: string) =>
      `/api/dashboard/notifications/${encodeURIComponent(notificationId)}/read`,
    NOTIFICATIONS_READ_ALL: '/api/dashboard/notifications/read-all',
    CHANGE_PASSWORD: '/api/dashboard/change-password',
  },
  CANDIDATE: {
    PROFILE: '/api/candidate/profile',
    ONBOARDING: '/api/candidate/onboarding',
    RESUME: '/api/candidate/resume',
    SAVED_JOBS: '/api/candidate/saved-jobs',
    APPLICATION_QUOTA: '/api/candidate/application-quota',
    SAVED_JOB: (jobId: string) => `/api/candidate/saved-jobs/${encodeURIComponent(jobId)}`,
    APPLICATIONS: '/api/candidate/applications',
    APPLICATION: (applicationId: string) =>
      `/api/candidate/applications/${encodeURIComponent(applicationId)}`,
    APPLY: (jobId: string) => `/api/candidate/jobs/${encodeURIComponent(jobId)}/applications`,
    WITHDRAW_APPLICATION: (applicationId: string) =>
      `/api/candidate/applications/${encodeURIComponent(applicationId)}/withdraw`,
    RECRUITER_CONTACT: (jobId: string) =>
      `/api/candidate/jobs/${encodeURIComponent(jobId)}/recruiter-contact`,
  },
} as const;
