import type { ApiResponse, PaginatedResponse } from '@/types';

export enum EmploymentType {
  Unknown = 0,
  FullTime = 1,
  PartTime,
  Contract,
  Internship,
  Freelance,
  Temporary,
}

export enum WorkplaceType {
  Unknown = 0,
  OnSite = 1,
  Remote,
  Hybrid,
}

/**
 * Legacy experience classification retained for backend compatibility.
 *
 * New filtering and accurate experience requirements should use
 * minimumExperienceYears / maximumExperienceYears instead.
 */
export enum ExperienceLevel {
  Unknown = 0,
  Entry = 1,
  Junior,
  Mid,
  Senior,
  Lead,
  Executive,
}

export enum SalaryPeriod {
  Yearly = 1,
  Monthly,
  Hourly,
}

export enum CompanyType {
  Startup = 1,
  Corporate,
  IndianMnc,
  ForeignMnc,
  Consultant,
}

export enum PostedByType {
  Company = 1,
  Consultant,
}

export enum PublicJobSort {
  Recommended = 1,
  LatestPublished,
  NewestAdded,
  ClosingSoon,
  SalaryHighToLow,
}

export interface ExperienceBucket {
  label: string;
  minimum: number;
  maximum?: number;
}

/**
 * Canonical experience ranges used by CareerHarbor.
 *
 * Keep Admin job classification and Candidate Browse Jobs aligned
 * with these values.
 */
export const EXPERIENCE_BUCKETS: readonly ExperienceBucket[] = [
  { label: '0 – 1 years', minimum: 0, maximum: 1 },
  { label: '1 – 2 years', minimum: 1, maximum: 2 },
  { label: '2 – 4 years', minimum: 2, maximum: 4 },
  { label: '4 – 6 years', minimum: 4, maximum: 6 },
  { label: '6 – 8 years', minimum: 6, maximum: 8 },
  { label: '8 – 10 years', minimum: 8, maximum: 10 },
  { label: '10+ years', minimum: 10 },
] as const;

export interface PublicJobQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  companyName?: string;
  categoryName?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  experienceLevel?: ExperienceLevel;
  location?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  isFeatured?: boolean;
  keyword?: string;
  locations?: string[];
  workModes?: WorkplaceType[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  departments?: string[];
  roleCategories?: string[];
  employmentTypes?: EmploymentType[];
  minAmount?: number;
  maxAmount?: number;
  currencyCode?: string;
  salaryPeriod?: SalaryPeriod;
  internshipDurationMonths?: number[];
  flexibleDuration?: boolean;
  educationRequirements?: string[];
  companyTypes?: CompanyType[];
  industries?: string[];
  postedByTypes?: PostedByType[];
  freshnessDays?: number;
  featuredOnly?: boolean;
  sortBy: JobSortField | PublicJobSort;
  sortDirection: SortDirection;
marketRoleId?: string;
marketSkillId?: string;
}

export type JobSortField =
  | 'publishedAt'
  | 'createdAt'
  | 'title'
  | 'minimumSalary'
  | 'maximumSalary'
  | 'expiresAt';

export type SortDirection = 'asc' | 'desc';

export interface PublicJobSummary {
  id: string;
  referenceNumber: string;
  title: string;
  slug: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl?: string | null;
  categoryId: string;
  categoryName: string;
  location: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currencyCode: string | null;
  salaryPeriod?: SalaryPeriod | null;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  isFeatured: boolean;
  publishedAtUtc: string;
  expiresAtUtc: string | null;
  minimumExperienceYears: number | null;
  maximumExperienceYears: number | null;
  internshipDurationMonths: number | null;
  isFlexibleDuration: boolean;
  department: string | null;
  roleCategory: string | null;
  educationRequirement: string | null;
  postedByType: PostedByType | null;
  companyType: CompanyType | null;
  industry: string | null;
}

export interface PublicJobDetails extends PublicJobSummary {
  applicationUrl: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  companyDescription: string | null;
  companyWebsiteUrl: string | null;
}

// Candidate-safe collection of all companies with visible jobs and stored logos.
export interface CandidateCompanyLogo {
  companyId: string;
  name: string;
  logoUrl: string;
}

export interface PopularCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  isVerified: boolean;
  activeJobCount: number;
}

export interface StringFacetOption {
  value: string;
  count: number;
}

export interface LabeledStringFacetOption extends StringFacetOption {
  label: string;
}

export interface EnumFacetOption<TValue extends number> {
  value: TValue;
  count: number;
}

export interface CompanyFacetOption {
  id: string;
  name: string;
  count: number;
}

export interface InternshipDurationFacetOption {
  months: number | null;
  isFlexible: boolean;
  label: string;
  count: number;
}

export interface DecimalRangeFacet {
  minimum: number | null;
  maximum: number | null;
  count: number;
}

export interface IntegerRangeFacet {
  minimum: number | null;
  maximum: number | null;
  count: number;
}

export interface PublicJobFilterOptions {
  locations: LabeledStringFacetOption[];
  workModes: EnumFacetOption<WorkplaceType>[];
  departments: LabeledStringFacetOption[];
  roleCategories: LabeledStringFacetOption[];
  employmentTypes: EnumFacetOption<EmploymentType>[];
  companyTypes: EnumFacetOption<CompanyType>[];
  companies: CompanyFacetOption[];
  industries: StringFacetOption[];
  educationRequirements: LabeledStringFacetOption[];
  postedByTypes: EnumFacetOption<PostedByType>[];
  internshipDurations: InternshipDurationFacetOption[];
  salaryRange: DecimalRangeFacet;
  experienceRange: IntegerRangeFacet;
}

export interface SupplementalJobFilterCounts {
  featured: number;
  freshness: Record<1 | 3 | 7 | 15 | 30, number>;
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
}

export interface CandidateRecruiterContact {
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phoneNumber: string | null;
}