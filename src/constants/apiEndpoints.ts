export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    ADMIN_HEALTH: '/auth/admin/health',
  },
  JOBS: {
    SEARCH: '/jobs',
    LATEST: '/jobs/latest',
    NEWEST: '/jobs/newest',
    FEATURED: '/jobs/featured',
    POPULAR_COMPANIES: '/jobs/companies/popular',
    DETAILS: (slug: string) => `/jobs/${encodeURIComponent(slug)}`,
    RELATED: (slug: string) => `/jobs/${encodeURIComponent(slug)}/related`,
  },
  MEMBERSHIPS: {
    APPLY_TO_JOB: (slug: string) => `/memberships/jobs/${encodeURIComponent(slug)}/apply`,
  },
  PAYMENTS: {
    CREATE_RAZORPAY_ORDER: '/payments/razorpay/orders',
    CONFIRM_RAZORPAY: (paymentId: string) =>
      `/payments/${encodeURIComponent(paymentId)}/razorpay/confirm`,
    RECONCILE_RAZORPAY: (paymentId: string) =>
      `/payments/${encodeURIComponent(paymentId)}/razorpay/reconcile`,
    STATUS: '/payments/status',
    LIST: '/payments',
    HISTORY: '/payments/history',
  },
  ADMIN: {
    DASHBOARD_STATISTICS: '/admin/dashboard/statistics',
    DASHBOARD_RECENT_PAYMENTS: '/admin/dashboard/recent-payments',
    DASHBOARD_RECENT_USERS: '/admin/dashboard/recent-users',
    DASHBOARD_CHARTS: '/admin/dashboard/charts',
    JOBS: '/admin/jobs',
    JOB: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}`,
    JOB_PUBLISH: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/publish`,
    JOB_UNPUBLISH: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/unpublish`,
    JOB_CLOSE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/close`,
    JOB_ARCHIVE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/archive`,
    JOB_FEATURE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/feature`,
    JOB_UNFEATURE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/unfeature`,
    JOB_FEATURED: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/featured`,
    JOB_HIDDEN: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/hidden`,
    COMPANIES: '/admin/companies',
    COMPANY: (companyId: string) => `/admin/companies/${encodeURIComponent(companyId)}`,
    COMPANY_OPTIONS: '/admin/companies/options',
    CATEGORIES: '/admin/categories',
    CATEGORY: (categoryId: string) => `/admin/categories/${encodeURIComponent(categoryId)}`,
    CATEGORY_OPTIONS: '/admin/categories/options',
    APPLICATIONS: '/admin/applications',
    APPLICATION: (applicationId: string) =>
      `/admin/applications/${encodeURIComponent(applicationId)}`,
    APPLICATION_STATUS: (applicationId: string) =>
      `/admin/applications/${encodeURIComponent(applicationId)}/status`,
    APPLICATION_RESUME: (applicationId: string) =>
      `/admin/applications/${encodeURIComponent(applicationId)}/resume`,
    AUDIT_LOGS: '/admin/audit-logs',
  },
  DASHBOARD: {
    MEMBERSHIPS: '/dashboard/memberships',
    NOTIFICATIONS: '/dashboard/notifications',
    NOTIFICATION_READ: (notificationId: string) =>
      `/dashboard/notifications/${encodeURIComponent(notificationId)}/read`,
    NOTIFICATIONS_READ_ALL: '/dashboard/notifications/read-all',
    CHANGE_PASSWORD: '/dashboard/change-password',
  },
  CANDIDATE: {
    PROFILE: '/candidate/profile',
    ONBOARDING: '/candidate/onboarding',
    RESUME: '/candidate/resume',
    SAVED_JOBS: '/candidate/saved-jobs',
    SAVED_JOB: (jobId: string) => `/candidate/saved-jobs/${encodeURIComponent(jobId)}`,
    APPLICATIONS: '/candidate/applications',
    APPLICATION: (applicationId: string) =>
      `/candidate/applications/${encodeURIComponent(applicationId)}`,
    APPLY: (jobId: string) => `/candidate/jobs/${encodeURIComponent(jobId)}/applications`,
    WITHDRAW_APPLICATION: (applicationId: string) =>
      `/candidate/applications/${encodeURIComponent(applicationId)}/withdraw`,
  },
} as const;
