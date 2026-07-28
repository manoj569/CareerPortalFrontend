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
