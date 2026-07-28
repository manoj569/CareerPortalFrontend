import {
  employmentTypeOptions,
  experienceLevelOptions,
  jobSortOptions,
  workplaceTypeOptions,
} from '../constants/jobOptions';
import type {
  EmploymentType,
  ExperienceLevel,
  PublicJobQuery,
  WorkplaceType,
} from '../types/jobModels';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const ALLOWED_PAGE_SIZES = [12, 20, 40] as const;

export interface JobSearchState {
  search: string;
  location: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  experienceLevel?: ExperienceLevel;
  minimumSalary?: number;
  maximumSalary?: number;
  sort: string;
  page: number;
  pageSize: number;
}

const readText = (value: string | null): string => value?.trim().slice(0, 250) ?? '';

const readPositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const readNonNegativeNumber = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const findEnumValue = <TValue extends number>(
  slug: string | null,
  options: readonly { slug: string; value: TValue }[],
): TValue | undefined => options.find((option) => option.slug === slug)?.value;

export const parseJobSearchParams = (params: URLSearchParams): JobSearchState => {
  const requestedPageSize = readPositiveInteger(params.get('pageSize'), DEFAULT_PAGE_SIZE);
  const pageSize = ALLOWED_PAGE_SIZES.includes(
    requestedPageSize as (typeof ALLOWED_PAGE_SIZES)[number],
  )
    ? requestedPageSize
    : DEFAULT_PAGE_SIZE;
  const requestedSort = params.get('sort');
  const sort = jobSortOptions.some((option) => option.value === requestedSort)
    ? (requestedSort ?? jobSortOptions[0]?.value ?? 'published-desc')
    : (jobSortOptions[0]?.value ?? 'published-desc');
  const minimumSalary = readNonNegativeNumber(params.get('minimumSalary'));
  const requestedMaximumSalary = readNonNegativeNumber(params.get('maximumSalary'));
  const maximumSalary =
    minimumSalary !== undefined &&
    requestedMaximumSalary !== undefined &&
    requestedMaximumSalary < minimumSalary
      ? undefined
      : requestedMaximumSalary;

  return {
    employmentType: findEnumValue(params.get('employmentType'), employmentTypeOptions),
    experienceLevel: findEnumValue(params.get('experienceLevel'), experienceLevelOptions),
    location: readText(params.get('location')),
    maximumSalary,
    minimumSalary,
    page: readPositiveInteger(params.get('page'), DEFAULT_PAGE),
    pageSize,
    search: readText(params.get('q')),
    sort,
    workplaceType: findEnumValue(params.get('workplaceType'), workplaceTypeOptions),
  };
};

export const serializeJobSearchState = (state: JobSearchState): URLSearchParams => {
  const params = new URLSearchParams();
  const employmentType = employmentTypeOptions.find(
    (option) => option.value === state.employmentType,
  );
  const workplaceType = workplaceTypeOptions.find((option) => option.value === state.workplaceType);
  const experienceLevel = experienceLevelOptions.find(
    (option) => option.value === state.experienceLevel,
  );

  if (state.search) params.set('q', state.search);
  if (state.location) params.set('location', state.location);
  if (employmentType) params.set('employmentType', employmentType.slug);
  if (workplaceType) params.set('workplaceType', workplaceType.slug);
  if (experienceLevel) params.set('experienceLevel', experienceLevel.slug);
  if (state.minimumSalary !== undefined) {
    params.set('minimumSalary', String(state.minimumSalary));
  }
  if (state.maximumSalary !== undefined) {
    params.set('maximumSalary', String(state.maximumSalary));
  }
  if (state.sort !== jobSortOptions[0]?.value) params.set('sort', state.sort);
  if (state.page !== DEFAULT_PAGE) params.set('page', String(state.page));
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(state.pageSize));

  return params;
};

export const toPublicJobQuery = (state: JobSearchState): PublicJobQuery => {
  const sortOption = jobSortOptions.find((option) => option.value === state.sort);
  const defaultSort = jobSortOptions[0];

  return {
    employmentType: state.employmentType,
    experienceLevel: state.experienceLevel,
    location: state.location || undefined,
    maximumSalary: state.maximumSalary,
    minimumSalary: state.minimumSalary,
    pageNumber: state.page,
    pageSize: state.pageSize,
    search: state.search || undefined,
    sortBy: sortOption?.sortBy ?? defaultSort?.sortBy ?? 'publishedAt',
    sortDirection: sortOption?.sortDirection ?? defaultSort?.sortDirection ?? 'desc',
    workplaceType: state.workplaceType,
  };
};

export const emptyJobSearchState = (): JobSearchState => ({
  location: '',
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  search: '',
  sort: jobSortOptions[0]?.value ?? 'published-desc',
});
