export enum EmploymentType {
  FullTime = 1,
  PartTime,
  Contract,
  Internship,
  Freelance,
  Temporary,
}

export enum WorkplaceType {
  OnSite = 1,
  Remote,
  Hybrid,
}

export enum ExperienceLevel {
  Entry = 1,
  Junior,
  Mid,
  Senior,
  Lead,
  Executive,
}

export interface PublicJobQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  companyId?: string;
  categoryId?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  experienceLevel?: ExperienceLevel;
  location?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  isFeatured?: boolean;
  sortBy: JobSortField;
  sortDirection: SortDirection;
}

export type JobSortField =
  'publishedAt' | 'createdAt' | 'title' | 'minimumSalary' | 'maximumSalary' | 'expiresAt';

export type SortDirection = 'asc' | 'desc';

export interface PublicJobSummary {
  id: string;
  referenceNumber: string;
  title: string;
  slug: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  categoryId: string;
  categoryName: string;
  location: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currencyCode: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  isFeatured: boolean;
  publishedAtUtc: string;
  expiresAtUtc: string | null;
}

export interface PublicJobDetails extends PublicJobSummary {
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  companyDescription: string | null;
  companyWebsiteUrl: string | null;
}

export type PagedResponse<T> = PaginatedResponse<T>;
export type BackendApiResponse<T> = ApiResponse<T>;

export enum ApplicationAccessStatus {
  Granted = 1,
  LoginRequired,
  PaymentRequired,
}

export interface ApplicationAccessResponse {
  status: ApplicationAccessStatus;
  message: string;
  applicationUrl: string | null;
  companyId: string | null;
}
import type { ApiResponse, PaginatedResponse } from '@/types';
