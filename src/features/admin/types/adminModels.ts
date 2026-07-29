import type {
  EmploymentType,
  ExperienceLevel,
  SortDirection,
  WorkplaceType,
} from '@/features/jobs/types/jobModels';
import type { PaymentProvider, PaymentStatus } from '@/features/payments/types/paymentModels';
import type { PaginatedResponse } from '@/types';

export enum UserStatus {
  Pending = 1,
  Active,
  Suspended,
  Inactive,
}

export enum JobStatus {
  Draft = 1,
  Published,
  Paused,
  Closed,
  Expired,
  Archived,
}

export enum ChartInterval {
  Day = 1,
  Month,
}

export interface RevenueTotal {
  currencyCode: string;
  total: number;
  thisMonth: number;
}

export interface AdminDashboardStatistics {
  revenue: RevenueTotal[];
  totalUsers: number;
  paidUsers: number;
  totalJobs: number;
  publishedJobs: number;
  featuredJobs: number;
  expiredJobs: number;
  totalCategories: number;
  totalCompanies: number;
  generatedAtUtc: string;
}

export interface RecentAdminPayment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currencyCode: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  paidAtUtc: string | null;
  createdAtUtc: string;
}

export interface RecentAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailConfirmed: boolean;
  createdAtUtc: string;
  lastLoginAtUtc: string | null;
}

export interface RevenueChartPoint {
  periodStartUtc: string;
  currencyCode: string;
  revenue: number;
  payments: number;
  paidUsers: number;
}

export interface CountChartPoint {
  periodStartUtc: string;
  count: number;
}

export interface DistributionChartPoint {
  id: string;
  label: string;
  value: number;
}

export interface AdminDashboardCharts {
  revenue: RevenueChartPoint[];
  users: CountChartPoint[];
  jobs: CountChartPoint[];
  categories: DistributionChartPoint[];
  companies: DistributionChartPoint[];
}

export interface AdminChartsQuery {
  fromUtc?: string;
  toUtc?: string;
  interval?: ChartInterval;
  distributionLimit?: number;
}

export interface AdminJob {
  id: string;
  referenceNumber: string;
  title: string;
  slug: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  applicationUrl: string;
  companyName: string;
  companyId: string;
  categoryName: string;
  categoryId: string;
  location: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currencyCode: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  isFeatured: boolean;
  isHidden: boolean;
  publishedAtUtc: string | null;
  expiresAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isDeleted: boolean;
  deletedAtUtc: string | null;
}

export type AdminJobSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'publishedAt'
  | 'title'
  | 'minimumSalary'
  | 'maximumSalary'
  | 'expiresAt'
  | 'status';

export interface AdminJobsQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  companyId?: string;
  categoryId?: string;
  status?: JobStatus;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  experienceLevel?: ExperienceLevel;
  isFeatured?: boolean;
  isHidden?: boolean;
  isDeleted?: boolean;
  publishedFromUtc?: string;
  publishedToUtc?: string;
  expiresFromUtc?: string;
  expiresToUtc?: string;
  sortBy: AdminJobSortField;
  sortDirection: SortDirection;
}

export interface AdminJobRequest {
  title: string;
  description: string;
  companyId: string;
  categoryId: string;
  applicationUrl: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  location: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currencyCode: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  expiresAtUtc: string | null;
}

export interface UpdateAdminJobArgs {
  jobId: string;
  request: AdminJobRequest;
}

export interface SetAdminJobFlagArgs {
  jobId: string;
  value: boolean;
}

export type AdminJobsPage = PaginatedResponse<AdminJob>;

export interface AdminOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  employeeCount: number | null;
  isVerified: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isDeleted: boolean;
}

export interface AdminCompanyRequest {
  name: string;
  slug: string | null;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  employeeCount: number | null;
  isVerified: boolean;
}

export interface AdminCompaniesQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'name' | 'industry' | 'location' | 'employeeCount';
  sortDirection: SortDirection;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isDeleted: boolean;
}

export interface AdminCategoryRequest {
  name: string;
  slug: string | null;
  description: string | null;
  displayOrder: number;
  parentCategoryId: string | null;
}

export interface AdminCategoriesQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  parentCategoryId?: string;
  rootOnly?: boolean;
  isDeleted?: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'name' | 'displayOrder';
  sortDirection: SortDirection;
}

export interface UpdateAdminCompanyArgs {
  companyId: string;
  request: AdminCompanyRequest;
}

export interface UpdateAdminCategoryArgs {
  categoryId: string;
  request: AdminCategoryRequest;
}

export type AdminCompaniesPage = PaginatedResponse<AdminCompany>;
export type AdminCategoriesPage = PaginatedResponse<AdminCategory>;

export enum AdminApplicationStatus {
  Submitted = 1,
  Reviewed,
  Shortlisted,
  Rejected,
  Withdrawn,
}

export interface AdminApplicationListItem {
  id: string;
  status: AdminApplicationStatus;
  submittedAtUtc: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  hasResume: boolean;
}

export interface AdminApplicationQuery {
  pageNumber: number;
  pageSize: number;
  jobId?: string;
  companyId?: string;
  categoryId?: string;
  status?: AdminApplicationStatus;
  submittedFromUtc?: string;
  submittedToUtc?: string;
  keyword?: string;
}

export interface AdminCandidateProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  preferredJobTypes: EmploymentType[];
}

export interface AdminApplicationJobSummary {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  companyId: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
}

export interface AdminApplicationStatusHistory {
  id: string;
  previousStatus: AdminApplicationStatus | null;
  newStatus: AdminApplicationStatus;
  changedAtUtc: string;
  actorUserId: string;
  actorName: string;
  internalNote: string | null;
}

export interface AdminApplicationDetail {
  id: string;
  status: AdminApplicationStatus;
  submittedAtUtc: string;
  withdrawnAtUtc: string | null;
  coverLetter: string | null;
  hasResume: boolean;
  resumeFileName: string | null;
  candidate: AdminCandidateProfile;
  job: AdminApplicationJobSummary;
  statusHistory: AdminApplicationStatusHistory[];
}

export interface UpdateAdminApplicationStatusArgs {
  applicationId: string;
  request: {
    status: AdminApplicationStatus;
    internalNote: string | null;
  };
}

export type AdminApplicationsPage = PaginatedResponse<AdminApplicationListItem>;

export enum AuditAction {
  Create = 1,
  Update,
  Delete,
  Restore,
  Login,
  Logout,
  Publish,
  Unpublish,
  Close,
  Archive,
  Feature,
  Unfeature,
  Upload,
  Submit,
  Withdraw,
  Confirm,
  WebhookSuccess,
  WebhookFailure,
  Activate,
}

export interface AdminAuditLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  occurredAtUtc: string;
  correlationId: string | null;
  metadata: Record<string, string | null>;
}

export interface AdminAuditLogsQuery {
  pageNumber: number;
  pageSize: number;
  actorId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  fromUtc?: string;
  toUtc?: string;
  correlationId?: string;
}

export type AdminAuditLogsPage = PaginatedResponse<AdminAuditLog>;
