import {
  CompanyType,
  EmploymentType,
  ExperienceLevel,
  PostedByType,
  PublicJobSort,
  WorkplaceType,
  type JobSortField,
  type SortDirection,
} from '../types/jobModels';

export const companyTypeOptions = [
  { label: 'Startup', value: CompanyType.Startup, slug: 'startup' },
  { label: 'Corporate', value: CompanyType.Corporate, slug: 'corporate' },
  { label: 'Indian MNC', value: CompanyType.IndianMnc, slug: 'indian-mnc' },
  { label: 'Foreign MNC', value: CompanyType.ForeignMnc, slug: 'foreign-mnc' },
  { label: 'Consultant/Staffing', value: CompanyType.Consultant, slug: 'consultant' },
] as const;

export const postedByTypeOptions = [
  { label: 'Company Jobs', value: PostedByType.Company, slug: 'company' },
  { label: 'Consultant Jobs', value: PostedByType.Consultant, slug: 'consultant' },
] as const;

export const candidateJobSortOptions = [
  { label: 'Recommended', value: 'recommended', sortBy: PublicJobSort.Recommended },
  { label: 'Latest published', value: 'latest', sortBy: PublicJobSort.LatestPublished },
  { label: 'Newest added', value: 'newest', sortBy: PublicJobSort.NewestAdded },
  { label: 'Closing soon', value: 'closing', sortBy: PublicJobSort.ClosingSoon },
  {
    label: 'Salary: high to low',
    value: 'salary-high-to-low',
    sortBy: PublicJobSort.SalaryHighToLow,
  },
] as const;

export const employmentTypeOptions = [
  { label: 'Full time', value: EmploymentType.FullTime, slug: 'full-time' },
  { label: 'Part time', value: EmploymentType.PartTime, slug: 'part-time' },
  { label: 'Contract', value: EmploymentType.Contract, slug: 'contract' },
  { label: 'Internship', value: EmploymentType.Internship, slug: 'internship' },
  { label: 'Freelance', value: EmploymentType.Freelance, slug: 'freelance' },
  { label: 'Temporary', value: EmploymentType.Temporary, slug: 'temporary' },
] as const;

export const workplaceTypeOptions = [
  { label: 'On site', value: WorkplaceType.OnSite, slug: 'on-site' },
  { label: 'Remote', value: WorkplaceType.Remote, slug: 'remote' },
  { label: 'Hybrid', value: WorkplaceType.Hybrid, slug: 'hybrid' },
] as const;

export const experienceLevelOptions = [
  { label: 'Entry', value: ExperienceLevel.Entry, slug: 'entry' },
  { label: 'Junior', value: ExperienceLevel.Junior, slug: 'junior' },
  { label: 'Mid level', value: ExperienceLevel.Mid, slug: 'mid' },
  { label: 'Senior', value: ExperienceLevel.Senior, slug: 'senior' },
  { label: 'Lead', value: ExperienceLevel.Lead, slug: 'lead' },
  { label: 'Executive', value: ExperienceLevel.Executive, slug: 'executive' },
] as const;

export interface JobSortOption {
  label: string;
  value: string;
  sortBy: JobSortField;
  sortDirection: SortDirection;
}

export const jobSortOptions: JobSortOption[] = [
  {
    label: 'Newest published',
    value: 'published-desc',
    sortBy: 'publishedAt',
    sortDirection: 'desc',
  },
  {
    label: 'Oldest published',
    value: 'published-asc',
    sortBy: 'publishedAt',
    sortDirection: 'asc',
  },
  { label: 'Title A–Z', value: 'title-asc', sortBy: 'title', sortDirection: 'asc' },
  {
    label: 'Salary: high to low',
    value: 'salary-desc',
    sortBy: 'maximumSalary',
    sortDirection: 'desc',
  },
  { label: 'Closing soon', value: 'expires-asc', sortBy: 'expiresAt', sortDirection: 'asc' },
];

export const getEmploymentTypeLabel = (value: EmploymentType): string =>
  employmentTypeOptions.find((option) => option.value === value)?.label ?? 'Other';

export const getWorkplaceTypeLabel = (value: WorkplaceType): string =>
  workplaceTypeOptions.find((option) => option.value === value)?.label ?? 'Other';

export const getExperienceLevelLabel = (value: ExperienceLevel): string =>
  experienceLevelOptions.find((option) => option.value === value)?.label ?? 'Other';

export const getCompanyTypeLabel = (value: CompanyType): string =>
  companyTypeOptions.find((option) => option.value === value)?.label ?? 'Other';

export const getPostedByTypeLabel = (value: PostedByType): string =>
  postedByTypeOptions.find((option) => option.value === value)?.label ?? 'Other';
