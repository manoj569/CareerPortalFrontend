import {
  candidateJobSortOptions,
  workplaceTypeOptions,
} from '../constants/jobOptions';
import type {
  CompanyType,
  EmploymentType,
  PublicJobQuery,
  WorkplaceType,
} from '../types/jobModels';

const PAGE_SIZE = 10;
const SUPPORTED_FRESHNESS_DAYS = [1, 3, 7, 15, 30] as const;
const EXPERIENCE_UI_MAXIMUM = 45;
const SALARY_UI_MAXIMUM = 5_000_000;

export interface CandidateJobSearchState {
  keyword: string;
  workModes: WorkplaceType[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  departments: string[];
  minAmount?: number;
  maxAmount?: number;

  /**
   * @deprecated Company Type filtering has been removed.
   * Retained temporarily for compatibility with existing consumers.
   * URL parsing always leaves this empty.
   */
  companyTypes: CompanyType[];

  employmentTypes: EmploymentType[];
  educationRequirements: string[];
  categoryName: string;
  roleCategories: string[];
  freshnessDays?: number;
  locations: string[];
  sort: string;
  page: number;
}

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

const readText = (value: string | null, maximumLength = 250): string =>
  value?.trim().slice(0, maximumLength) ?? '';

const readStringArray = (
  params: URLSearchParams,
  name: string,
  maximumLength: number,
): string[] =>
  Array.from(
    params
      .getAll(name)
      .map((value) => readText(value, maximumLength))
      .filter(Boolean)
      .reduce((values, value) => {
        const identity = value.toLocaleLowerCase();

        if (!values.has(identity)) {
          values.set(identity, value);
        }

        return values;
      }, new Map<string, string>())
      .values(),
  ).slice(0, 25);

const readNonNegativeNumber = (
  value: string | null,
  maximum: number,
): number | undefined => {
  if (value === null || value === '') return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= maximum
    ? parsed
    : undefined;
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
  roleCategories: [],
  companyTypes: [],
  departments: [],
  educationRequirements: [],
  employmentTypes: [],
  keyword: '',
  locations: [],
  page: 1,
  sort: candidateJobSortOptions[0].value,
  workModes: [],
});

export const parseCandidateJobSearchParams = (
  params: URLSearchParams,
): CandidateJobSearchState => {
  const state = emptyCandidateJobSearchState();

  const minExperienceYears = readNonNegativeNumber(
    params.get('minExperience'),
    EXPERIENCE_UI_MAXIMUM,
  );

  const requestedMaxExperience = readNonNegativeNumber(
    params.get('maxExperience'),
    EXPERIENCE_UI_MAXIMUM,
  );

  const maxExperienceYears =
    requestedMaxExperience === EXPERIENCE_UI_MAXIMUM
      ? undefined
      : minExperienceYears !== undefined &&
          requestedMaxExperience !== undefined &&
          requestedMaxExperience < minExperienceYears
        ? undefined
        : requestedMaxExperience;

  const minAmount = readNonNegativeNumber(
    params.get('minAmount'),
    SALARY_UI_MAXIMUM,
  );

  const requestedMaxAmount = readNonNegativeNumber(
    params.get('maxAmount'),
    SALARY_UI_MAXIMUM,
  );

  const maxAmount =
    requestedMaxAmount === SALARY_UI_MAXIMUM
      ? undefined
      : minAmount !== undefined &&
          requestedMaxAmount !== undefined &&
          requestedMaxAmount < minAmount
        ? undefined
        : requestedMaxAmount;

  const freshness = Number(params.get('freshness'));

  const sort = candidateJobSortOptions.some(
    (option) => option.value === params.get('sort'),
  )
    ? (params.get('sort') ?? state.sort)
    : state.sort;

  return {
    ...state,
    categoryName: readText(params.get('categoryName')),
    roleCategories: readStringArray(params, 'roleCategories', 250),

    // Ignore legacy companyType/companyTypes URL parameters.
    companyTypes: [],

    departments: readStringArray(
      params,
      params.has('departments') ? 'departments' : 'department',
      150,
    ),
    educationRequirements: readStringArray(
      params,
      params.has('educationRequirements')
        ? 'educationRequirements'
        : 'education',
      200,
    ),
    freshnessDays: SUPPORTED_FRESHNESS_DAYS.includes(
      freshness as (typeof SUPPORTED_FRESHNESS_DAYS)[number],
    )
      ? freshness
      : undefined,
    keyword: readText(params.get('q')),
    locations: readStringArray(
      params,
      params.has('locations') ? 'locations' : 'location',
      250,
    ),
    maxAmount,
    maxExperienceYears,
    minAmount,
    minExperienceYears,
    page: readPositiveInteger(params.get('page')),
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

      if (option) {
        params.append(name, option.slug);
      }
    });
  };

  const appendStrings = (name: string, values: string[]) =>
    values.forEach((value) => params.append(name, value));

  if (state.keyword) {
    params.set('q', state.keyword);
  }

  appendEnumSlugs('workMode', state.workModes, workplaceTypeOptions);

  if (state.minExperienceYears !== undefined) {
    params.set('minExperience', String(state.minExperienceYears));
  }

  if (state.maxExperienceYears !== undefined) {
    params.set('maxExperience', String(state.maxExperienceYears));
  }

  appendStrings('departments', state.departments);
  appendStrings('roleCategories', state.roleCategories);

  if (state.minAmount !== undefined) {
    params.set('minAmount', String(state.minAmount));
  }

  if (state.maxAmount !== undefined) {
    params.set('maxAmount', String(state.maxAmount));
  }

  appendStrings('educationRequirements', state.educationRequirements);

  if ((state.categoryName ?? '').trim()) {
    params.set('categoryName', (state.categoryName ?? '').trim());
  }

  if (state.freshnessDays !== undefined) {
    params.set('freshness', String(state.freshnessDays));
  }

  appendStrings('locations', state.locations);

  if (state.sort !== candidateJobSortOptions[0].value) {
    params.set('sort', state.sort);
  }

  if (state.page !== 1) {
    params.set('page', String(state.page));
  }

  return params;
};

export const toCandidatePublicJobQuery = (
  state: CandidateJobSearchState,
): PublicJobQuery => ({
  categoryName: (state.categoryName ?? '').trim() || undefined,
  roleCategories: state.roleCategories.length
    ? state.roleCategories
    : undefined,
  departments: state.departments.length
    ? state.departments
    : undefined,
  educationRequirements: state.educationRequirements.length
    ? state.educationRequirements
    : undefined,
  employmentTypes: state.employmentTypes.length
    ? state.employmentTypes
    : undefined,
  freshnessDays: state.freshnessDays,
  keyword: state.keyword || undefined,
  locations: state.locations.length ? state.locations : undefined,
  maxAmount: state.maxAmount,
  maxExperienceYears: state.maxExperienceYears,
  minAmount: state.minAmount,
  minExperienceYears: state.minExperienceYears,
  pageNumber: state.page,
  pageSize: PAGE_SIZE,
  sortBy:
    candidateJobSortOptions.find((option) => option.value === state.sort)
      ?.sortBy ?? candidateJobSortOptions[0].sortBy,
  sortDirection: 'desc',
  workModes: state.workModes.length ? state.workModes : undefined,
});

export const countCandidateJobFilters = (
  state: CandidateJobSearchState,
): number =>
  state.workModes.length +
  state.roleCategories.length +
  state.departments.length +
  state.educationRequirements.length +
  Number(Boolean((state.categoryName ?? '').trim())) +
  state.locations.length +
  Number(
    state.minExperienceYears !== undefined ||
      state.maxExperienceYears !== undefined,
  ) +
  Number(state.minAmount !== undefined || state.maxAmount !== undefined) +
  Number(state.freshnessDays !== undefined);