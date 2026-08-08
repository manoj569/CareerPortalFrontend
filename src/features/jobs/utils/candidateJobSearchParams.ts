import {
  candidateJobSortOptions,
  companyTypeOptions,
  employmentTypeOptions,
  postedByTypeOptions,
  workplaceTypeOptions,
} from '../constants/jobOptions';
import type {
  CompanyType,
  EmploymentType,
  PostedByType,
  PublicJobQuery,
  WorkplaceType,
} from '../types/jobModels';

const PAGE_SIZE = 10;
const SUPPORTED_FRESHNESS_DAYS = [1, 3, 7, 15, 30] as const;
const SUPPORTED_INTERNSHIP_DURATIONS = [1, 2, 3, 6] as const;

export interface CandidateJobSearchState {
  keyword: string;
  workModes: WorkplaceType[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  departments: string[];
  roleCategories: string[];
  minAmount?: number;
  maxAmount?: number;
  companyTypes: CompanyType[];
  employmentTypes: EmploymentType[];
  internshipDurationMonths: number[];
  flexibleDuration?: boolean;
  educationRequirements: string[];
  postedByTypes: PostedByType[];
  industries: string[];
  companyName: string;
  categoryName: string;
  freshnessDays?: number;
  locations: string[];
  featuredOnly?: boolean;
  sort: string;
  page: number;
}

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

const readText = (value: string | null, maximumLength = 250): string =>
  value?.trim().slice(0, maximumLength) ?? '';

const readStringArray = (params: URLSearchParams, name: string, maximumLength: number): string[] =>
  unique(
    params
      .getAll(name)
      .map((value) => readText(value, maximumLength))
      .filter(Boolean),
  ).slice(0, 25);

const readNonNegativeNumber = (value: string | null, maximum: number): number | undefined => {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= maximum ? parsed : undefined;
};

const readPositiveInteger = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const readEnumArray = <TValue extends number>(
  params: URLSearchParams,
  name: string,
  options: readonly { slug: string; value: TValue }[],
): TValue[] =>
  unique(
    params
      .getAll(name)
      .map((slug) => options.find((option) => option.slug === slug)?.value)
      .filter((value): value is TValue => value !== undefined),
  );

export const emptyCandidateJobSearchState = (): CandidateJobSearchState => ({
  categoryName: '',
  companyName: '',
  companyTypes: [],
  departments: [],
  educationRequirements: [],
  employmentTypes: [],
  industries: [],
  internshipDurationMonths: [],
  keyword: '',
  locations: [],
  page: 1,
  postedByTypes: [],
  roleCategories: [],
  sort: candidateJobSortOptions[0].value,
  workModes: [],
});

export const parseCandidateJobSearchParams = (params: URLSearchParams): CandidateJobSearchState => {
  const state = emptyCandidateJobSearchState();
  const minExperienceYears = readNonNegativeNumber(params.get('minExperience'), 60);
  const requestedMaxExperience = readNonNegativeNumber(params.get('maxExperience'), 60);
  const maxExperienceYears =
    minExperienceYears !== undefined &&
    requestedMaxExperience !== undefined &&
    requestedMaxExperience < minExperienceYears
      ? undefined
      : requestedMaxExperience;
  const minAmount = readNonNegativeNumber(params.get('minAmount'), 1_000_000_000);
  const requestedMaxAmount = readNonNegativeNumber(params.get('maxAmount'), 1_000_000_000);
  const maxAmount =
    minAmount !== undefined && requestedMaxAmount !== undefined && requestedMaxAmount < minAmount
      ? undefined
      : requestedMaxAmount;
  const freshness = Number(params.get('freshness'));
  const sort = candidateJobSortOptions.some((option) => option.value === params.get('sort'))
    ? (params.get('sort') ?? state.sort)
    : state.sort;

  return {
    ...state,
    categoryName: readText(params.get('categoryName')),
    companyName: readText(params.get('companyName')),
    companyTypes: readEnumArray(params, 'companyType', companyTypeOptions),
    departments: readStringArray(params, 'department', 150),
    educationRequirements: readStringArray(params, 'education', 200),
    employmentTypes: readEnumArray(params, 'employmentType', employmentTypeOptions),
    featuredOnly: params.get('featured') === 'true' ? true : undefined,
    flexibleDuration: params.get('flexibleDuration') === 'true' ? true : undefined,
    freshnessDays: SUPPORTED_FRESHNESS_DAYS.includes(
      freshness as (typeof SUPPORTED_FRESHNESS_DAYS)[number],
    )
      ? freshness
      : undefined,
    industries: readStringArray(params, 'industry', 150),
    internshipDurationMonths: unique(
      params
        .getAll('duration')
        .map(Number)
        .filter((value) =>
          SUPPORTED_INTERNSHIP_DURATIONS.includes(
            value as (typeof SUPPORTED_INTERNSHIP_DURATIONS)[number],
          ),
        ),
    ),
    keyword: readText(params.get('q')),
    locations: readStringArray(params, 'location', 250),
    maxAmount,
    maxExperienceYears,
    minAmount,
    minExperienceYears,
    page: readPositiveInteger(params.get('page')),
    postedByTypes: readEnumArray(params, 'postedBy', postedByTypeOptions),
    roleCategories: readStringArray(params, 'roleCategory', 150),
    sort,
    workModes: readEnumArray(params, 'workMode', workplaceTypeOptions),
  };
};

export const serializeCandidateJobSearchState = (
  state: CandidateJobSearchState,
): URLSearchParams => {
  const params = new URLSearchParams();
  const appendEnumSlugs = <TValue extends number>(
    name: string,
    values: TValue[],
    options: readonly { slug: string; value: TValue }[],
  ) => {
    values.forEach((value) => {
      const option = options.find((candidate) => candidate.value === value);
      if (option) params.append(name, option.slug);
    });
  };
  const appendStrings = (name: string, values: string[]) =>
    values.forEach((value) => params.append(name, value));

  if (state.keyword) params.set('q', state.keyword);
  appendEnumSlugs('workMode', state.workModes, workplaceTypeOptions);
  if (state.minExperienceYears !== undefined)
    params.set('minExperience', String(state.minExperienceYears));
  if (state.maxExperienceYears !== undefined)
    params.set('maxExperience', String(state.maxExperienceYears));
  appendStrings('department', state.departments);
  appendStrings('roleCategory', state.roleCategories);
  if (state.minAmount !== undefined) params.set('minAmount', String(state.minAmount));
  if (state.maxAmount !== undefined) params.set('maxAmount', String(state.maxAmount));
  appendEnumSlugs('companyType', state.companyTypes, companyTypeOptions);
  appendEnumSlugs('employmentType', state.employmentTypes, employmentTypeOptions);
  state.internshipDurationMonths.forEach((value) => params.append('duration', String(value)));
  if (state.flexibleDuration) params.set('flexibleDuration', 'true');
  appendStrings('education', state.educationRequirements);
  appendEnumSlugs('postedBy', state.postedByTypes, postedByTypeOptions);
  appendStrings('industry', state.industries);
  if ((state.companyName ?? '').trim()) params.set('companyName', (state.companyName ?? '').trim());
  if ((state.categoryName ?? '').trim())
    params.set('categoryName', (state.categoryName ?? '').trim());
  if (state.freshnessDays !== undefined) params.set('freshness', String(state.freshnessDays));
  appendStrings('location', state.locations);
  if (state.featuredOnly) params.set('featured', 'true');
  if (state.sort !== candidateJobSortOptions[0].value) params.set('sort', state.sort);
  if (state.page !== 1) params.set('page', String(state.page));

  return params;
};

export const toCandidatePublicJobQuery = (state: CandidateJobSearchState): PublicJobQuery => ({
  categoryName: (state.categoryName ?? '').trim() || undefined,
  companyName: (state.companyName ?? '').trim() || undefined,
  companyTypes: state.companyTypes.length ? state.companyTypes : undefined,
  departments: state.departments.length ? state.departments : undefined,
  educationRequirements: state.educationRequirements.length
    ? state.educationRequirements
    : undefined,
  employmentTypes: state.employmentTypes.length ? state.employmentTypes : undefined,
  featuredOnly: state.featuredOnly,
  flexibleDuration: state.flexibleDuration,
  freshnessDays: state.freshnessDays,
  industries: state.industries.length ? state.industries : undefined,
  internshipDurationMonths: state.internshipDurationMonths.length
    ? state.internshipDurationMonths
    : undefined,
  keyword: state.keyword || undefined,
  locations: state.locations.length ? state.locations : undefined,
  maxAmount: state.maxAmount,
  maxExperienceYears: state.maxExperienceYears,
  minAmount: state.minAmount,
  minExperienceYears: state.minExperienceYears,
  pageNumber: state.page,
  pageSize: PAGE_SIZE,
  postedByTypes: state.postedByTypes.length ? state.postedByTypes : undefined,
  roleCategories: state.roleCategories.length ? state.roleCategories : undefined,
  sortBy:
    candidateJobSortOptions.find((option) => option.value === state.sort)?.sortBy ??
    candidateJobSortOptions[0].sortBy,
  sortDirection: 'desc',
  workModes: state.workModes.length ? state.workModes : undefined,
});

export const countCandidateJobFilters = (state: CandidateJobSearchState): number =>
  state.workModes.length +
  state.departments.length +
  state.roleCategories.length +
  state.companyTypes.length +
  state.employmentTypes.length +
  state.internshipDurationMonths.length +
  state.educationRequirements.length +
  state.postedByTypes.length +
  state.industries.length +
  Number(Boolean((state.companyName ?? '').trim())) +
  Number(Boolean((state.categoryName ?? '').trim())) +
  state.locations.length +
  Number(state.minExperienceYears !== undefined || state.maxExperienceYears !== undefined) +
  Number(state.minAmount !== undefined || state.maxAmount !== undefined) +
  Number(Boolean(state.flexibleDuration)) +
  Number(state.freshnessDays !== undefined) +
  Number(Boolean(state.featuredOnly));
