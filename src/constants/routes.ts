export const ROUTES = {
  ADMIN_JOB_SOURCES: '/admin/job-sources',
  HOME: '/',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:slug',
  CANDIDATE_MESSAGES: '/dashboard/messages',
  EMPLOYERS: '/employers',
  EMPLOYER_REGISTER: '/employers/register',
EMPLOYER_LOGIN: '/employers/login',
EMPLOYER_COMPANY_SETUP: '/employers/company-setup',
EMPLOYER_DASHBOARD: '/employer/dashboard',
EMPLOYER_JOBS: '/employer/jobs',
EMPLOYER_JOB_CREATE: '/employer/jobs/create',
EMPLOYER_JOB_CREATE_REQUIREMENTS: '/employer/jobs/create/requirements',
EMPLOYER_JOB_CREATE_SCREENING: '/employer/jobs/create/screening',
EMPLOYER_JOB_CREATE_REVIEW: '/employer/jobs/create/review',
EMPLOYER_JOB_DETAILS: '/employer/jobs/:id',
EMPLOYER_CANDIDATE_DETAILS: '/employer/candidates/:id',
EMPLOYER_INTERVIEW_DETAILS: '/employer/interviews/:id',
EMPLOYER_CANDIDATES: '/employer/candidates',
EMPLOYER_CANDIDATE_FIND: '/employer/candidates/find',
EMPLOYER_PIPELINE: '/employer/pipeline',
EMPLOYER_INTERVIEWS: '/employer/interviews',
EMPLOYER_SCREENING: '/employer/screening',
EMPLOYER_TALENT_POOL: '/employer/talent-pool',
EMPLOYER_MESSAGES: '/employer/messages',
EMPLOYER_ANALYTICS: '/employer/analytics',
EMPLOYER_COMPANY: '/employer/company',
EMPLOYER_SETTINGS: '/employer/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_REGISTRATION_MOBILE: '/register/verify-mobile',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TERMS_OF_USE: '/terms-of-use',
  PRIVACY_POLICY: '/privacy-policy',
  COOKIE_POLICY: '/cookie-policy',
  REFUND_POLICY: '/refund-and-cancellation-policy',
  GRIEVANCE_POLICY: '/grievance-redressal-policy',
  CONTACT_US: '/contact-us',
  ABOUT_US: '/about-us',
  PRICING: '/membership',
  UNAUTHORIZED: '/unauthorized',
  ONBOARDING: '/onboarding',
  CAREER_SNAPSHOT: '/career-snapshot',

  DASHBOARD: '/dashboard',
  DASHBOARD_JOBS: '/dashboard/jobs',
  DASHBOARD_JOB_DETAILS: '/dashboard/jobs/:slug',
  DASHBOARD_HIRING_DRIVE_DETAILS: '/dashboard/hiring-drives/:id',

  AI_ACCELERATOR: '/dashboard/ai-accelerator',

  HIRING_DRIVE_DETAILS: '/hiring-drives/:id',
  REFER_A_JOB: '/dashboard/refer-a-job',
  REFERRALS: '/dashboard/referrals',
  REFERRAL_CONTACT_DETAILS: '/dashboard/jobs/referral/:jobId/contact',
  PORTFOLIO: '/dashboard/portfolio',
  PROFILE: '/dashboard/profile',
  PUBLIC_PORTFOLIO: '/p/:slug',
  RESUME: '/dashboard/resume',
  RESUME_MAKER: '/dashboard/resume-maker',
  SAVED_JOBS: '/dashboard/saved-jobs',
  APPLICATIONS: '/dashboard/applications',
  APPLICATION_DETAILS: '/dashboard/applications/:applicationId',
  INTERVIEW_INSIGHTS: '/dashboard/interview-insights',
  CAREER_GUIDANCE: '/career-guidance',

  AI_APPLY: '/ai-apply',
  AI_APPLY_SETUP: '/ai-apply/setup',
  AI_APPLY_APPLICATIONS: '/ai-apply/applications',
  AI_APPLY_APPLICATION_DETAILS: '/ai-apply/applications/:id',
  AI_APPLY_QUESTIONS: '/ai-apply/questions',
  AI_APPLY_QUESTION_DETAILS: '/ai-apply/questions/:id',
  AI_APPLY_ANSWERS: '/ai-apply/answers',
  AI_APPLY_SUBSCRIPTION: '/ai-apply/subscription',
  AI_APPLY_CONNECTIONS: '/ai-apply/connections',

  INTERVIEW_INSIGHT_CONTRIBUTIONS: '/dashboard/interview-insights/my-contributions',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
  MEMBERSHIP: '/dashboard/membership',
  PAYMENTS: '/dashboard/payments',

  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_PENDING: '/payment/pending',
  PAYMENT_FAILED: '/payment/failed',
  PHONEPE_RETURN: '/payment/phonepe/return',
  PHONEPE_RETURN_LEGACY: '/payments/phonepe/return',

  ADMIN: '/admin',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_JOB_CREATE: '/admin/jobs/create',
  ADMIN_JOB_DISCOVERY: '/admin/jobs/discovery',
  ADMIN_JOB_DISCOVERY_RUN: '/admin/job-discovery/:runId',
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
  ADMIN_INTERVIEW_INSIGHTS: '/admin/interview-insights',
  ADMIN_AI_APPLY: '/admin/ai-apply',
  ADMIN_CAREER_GUIDANCE: '/admin/career-guidance/consultants',
} as const;

export const buildJobDetailsPath = (slug: string): string =>
  ROUTES.JOB_DETAILS.replace(':slug', encodeURIComponent(slug));

export const buildDashboardJobDetailsPath = (slug: string): string =>
  ROUTES.DASHBOARD_JOB_DETAILS.replace(':slug', encodeURIComponent(slug));

export const buildHiringDriveDetailsPath = (id: string): string =>
  ROUTES.HIRING_DRIVE_DETAILS.replace(':id', encodeURIComponent(id));

export const buildDashboardHiringDriveDetailsPath = (id: string): string =>
  ROUTES.DASHBOARD_HIRING_DRIVE_DETAILS.replace(':id', encodeURIComponent(id));

export const buildReferralContactDetailsPath = (jobId: string): string =>
  ROUTES.REFERRAL_CONTACT_DETAILS.replace(':jobId', encodeURIComponent(jobId));

export const buildApplicationDetailsPath = (applicationId: string): string =>
  ROUTES.APPLICATION_DETAILS.replace(':applicationId', encodeURIComponent(applicationId));

export const buildAIApplyApplicationDetailsPath = (id: string): string =>
  ROUTES.AI_APPLY_APPLICATION_DETAILS.replace(':id', encodeURIComponent(id));

export const buildAIApplyQuestionDetailsPath = (id: string): string =>
  ROUTES.AI_APPLY_QUESTION_DETAILS.replace(':id', encodeURIComponent(id));

export const buildInterviewInsightsPath = (params?: Record<string, string>): string => {
  const search = new URLSearchParams(params);

  return `${ROUTES.INTERVIEW_INSIGHTS}${search.size ? `?${search.toString()}` : ''}`;
};

export const buildPublicPortfolioPath = (slug: string): string =>
  ROUTES.PUBLIC_PORTFOLIO.replace(':slug', encodeURIComponent(slug));

export const buildAdminJobEditPath = (jobId: string): string =>
  ROUTES.ADMIN_JOB_EDIT.replace(':jobId', encodeURIComponent(jobId));

export const buildAdminJobDetailsPath = (jobId: string): string =>
  ROUTES.ADMIN_JOB_DETAILS.replace(':jobId', encodeURIComponent(jobId));

export const buildAdminJobDiscoveryRunPath = (runId: string): string =>
  ROUTES.ADMIN_JOB_DISCOVERY_RUN.replace(':runId', encodeURIComponent(runId));

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
