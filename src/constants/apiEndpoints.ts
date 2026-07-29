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
    JOB_ARCHIVE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/archive`,
    JOB_FEATURED: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/featured`,
    JOB_HIDDEN: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/hidden`,
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
