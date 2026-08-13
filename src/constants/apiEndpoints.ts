export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_REGISTRATION_OTP: '/auth/verify-registration-otp',
    RESEND_REGISTRATION_OTP: '/auth/resend-registration-otp',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    GOOGLE_CODE: '/auth/google/code',
    REQUEST_LOGIN_OTP: '/auth/request-login-otp',
    LOGIN_WITH_OTP: '/auth/login-with-otp',
    REFRESH_TOKEN: '/auth/refresh',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    COMPLETE_PASSWORD_RESET: '/auth/complete-password-reset',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    ADMIN_HEALTH: '/auth/admin/health',
  },
  LEGAL: {
    TERMS_OF_USE: '/legal/terms-of-use',
    PRIVACY_POLICY: '/legal/privacy-policy',
  },
  JOBS: {
    SEARCH: '/jobs',
    FILTER_OPTIONS: '/jobs/filter-options',
    LATEST: '/jobs/latest',
    NEWEST: '/jobs/newest',
    FEATURED: '/jobs/featured',
    POPULAR_COMPANIES: '/jobs/companies/popular',
    DETAILS: (slug: string) => `/jobs/${encodeURIComponent(slug)}`,
    RELATED: (slug: string) => `/jobs/${encodeURIComponent(slug)}/related`,
  },
  MEMBERSHIPS: {
    APPLY_TO_JOB: (slug: string) =>
      `/memberships/jobs/${encodeURIComponent(slug)}/apply`,
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
    JOBS_COMPOSE: '/admin/jobs/compose',
    JOB_DISCOVERY_RUN: '/admin/job-discovery/run',
    JOB_DISCOVERY_RUNS: '/admin/job-discovery/runs',
    JOB_DISCOVERY_RUN_DETAILS: (runId: string) =>
      `/admin/job-discovery/runs/${encodeURIComponent(runId)}`,
    JOB_DISCOVERY_PREVIEW: (runId: string) =>
      `/admin/job-discovery/runs/${encodeURIComponent(runId)}/preview`,
    JOB_DISCOVERY_COMMIT: (runId: string) =>
      `/admin/job-discovery/runs/${encodeURIComponent(runId)}/commit`,
    JOB: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}`,
    JOB_PUBLISH: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/publish`,
    JOB_UNPUBLISH: (jobId: string) =>
      `/admin/jobs/${encodeURIComponent(jobId)}/unpublish`,
    JOB_CLOSE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/close`,
    JOB_ARCHIVE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/archive`,
    JOB_FEATURE: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/feature`,
    JOB_UNFEATURE: (jobId: string) =>
      `/admin/jobs/${encodeURIComponent(jobId)}/unfeature`,
    JOB_FEATURED: (jobId: string) =>
      `/admin/jobs/${encodeURIComponent(jobId)}/featured`,
    JOB_HIDDEN: (jobId: string) => `/admin/jobs/${encodeURIComponent(jobId)}/hidden`,
    COMPANIES: '/admin/companies',
    JOB_RECRUITER_CONTACT: (jobId: string) =>
      `/admin/jobs/${encodeURIComponent(jobId)}/recruiter-contact`,
    COMPANY: (companyId: string) =>
      `/admin/companies/${encodeURIComponent(companyId)}`,
    COMPANY_OPTIONS: '/admin/companies/options',
    CATEGORIES: '/admin/categories',
    CATEGORY: (categoryId: string) =>
      `/admin/categories/${encodeURIComponent(categoryId)}`,
    CATEGORY_OPTIONS: '/admin/categories/options',
    APPLICATIONS: '/admin/applications',
    APPLICATION: (applicationId: string) =>
      `/admin/applications/${encodeURIComponent(applicationId)}`,
    APPLICATION_STATUS: (applicationId: string) =>
      `/admin/applications/${encodeURIComponent(applicationId)}/status`,
    APPLICATION_RESUME: (applicationId: string) =>
      `/admin/applications/${encodeURIComponent(applicationId)}/resume`,
    AUDIT_LOGS: '/admin/audit-logs',
    IMPORTS: {
      COMPANIES_PREVIEW: '/admin/imports/companies/preview',
      COMPANIES_COMMIT: '/admin/imports/companies/commit',
      JOBS_PREVIEW: '/admin/imports/jobs/preview',
      JOBS_COMMIT: '/admin/imports/jobs/commit',
      COMPANIES_TEMPLATE: '/admin/imports/templates/companies',
      JOBS_TEMPLATE: '/admin/imports/templates/jobs',
    },
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
    PROFILE_ABOUT: '/candidate/profile/about',
    PROFILE_SKILLS: '/candidate/profile/skills',
    PROFILE_SKILL: (skillId: string) =>
      `/candidate/profile/skills/${encodeURIComponent(skillId)}`,
    PROFILE_COMPLETION: '/candidate/profile/completion',
    PORTFOLIO: '/candidate/portfolio',
    PORTFOLIO_SETTINGS: '/candidate/portfolio/settings',
    PORTFOLIO_PREVIEW: '/candidate/portfolio/preview',
    PORTFOLIO_PUBLISH: '/candidate/portfolio/publish',
    PORTFOLIO_UNPUBLISH: '/candidate/portfolio/unpublish',
    PORTFOLIO_COLLECTION: (collection: string) => `/candidate/portfolio/${collection}`,
    PORTFOLIO_RECORD: (collection: string, recordId: string) =>
      `/candidate/portfolio/${collection}/${encodeURIComponent(recordId)}`,
    PORTFOLIO_CUSTOM_ITEMS: (sectionId: string) =>
      `/candidate/portfolio/custom-sections/${encodeURIComponent(sectionId)}/items`,
    PORTFOLIO_CUSTOM_ITEM: (sectionId: string, itemId: string) =>
      `/candidate/portfolio/custom-sections/${encodeURIComponent(sectionId)}/items/${encodeURIComponent(itemId)}`,
    ONBOARDING: '/candidate/onboarding',
    RESUME: '/candidate/resume',
    RESUME_STATUS: '/candidate/resume/status',
    RECOMMENDED_JOBS: '/candidate/jobs/recommended',
    SAVED_JOBS: '/candidate/saved-jobs',
    APPLICATION_QUOTA: '/candidate/application-quota',
    SAVED_JOB: (jobId: string) => `/candidate/saved-jobs/${encodeURIComponent(jobId)}`,
    APPLICATIONS: '/candidate/applications',
    APPLICATION: (applicationId: string) =>
      `/candidate/applications/${encodeURIComponent(applicationId)}`,
    APPLY: (jobId: string) =>
      `/candidate/jobs/${encodeURIComponent(jobId)}/apply`,
    WITHDRAW_APPLICATION: (applicationId: string) =>
      `/candidate/applications/${encodeURIComponent(applicationId)}/withdraw`,
    RECRUITER_CONTACT: (jobId: string) =>
      `/candidate/jobs/${encodeURIComponent(jobId)}/recruiter-contact`,
  },
  PUBLIC: {
    PORTFOLIO: (slug: string) => `/portfolios/${encodeURIComponent(slug)}`,
  },
} as const;
