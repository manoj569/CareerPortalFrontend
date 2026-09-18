import { Chip, Stack } from '@mui/material';

import { getWorkplaceTypeLabel } from '@/features/jobs/constants/jobOptions';
import type { CandidateJobSearchState } from '@/features/jobs/utils/candidateJobSearchParams';
import type { PublicJobFilterOptions } from '@/features/jobs/types/jobModels';

const RUPEES_PER_LAKH = 100_000;

interface ActiveFilterChipsProps {
  onChange: (changes: Partial<CandidateJobSearchState>) => void;
  onKeywordClear: () => void;
  state: CandidateJobSearchState;
  options?: PublicJobFilterOptions;
}

interface ActiveFilter {
  key: string;
  label: string;
  remove: () => void;
}

const formatExperienceRange = (state: CandidateJobSearchState): string =>
  `Experience: ${state.minExperienceYears ?? 0}–${state.maxExperienceYears ?? '45+'} years`;

const formatLpa = (amount: number | undefined, fallback: string): string =>
  amount === undefined
    ? fallback
    : String(Math.round(amount / RUPEES_PER_LAKH));

const formatSalaryRange = (state: CandidateJobSearchState): string =>
  `Salary: ₹${formatLpa(state.minAmount, '0')}–₹${formatLpa(state.maxAmount, '50+')} LPA`;

export const ActiveFilterChips = ({
  onChange,
  onKeywordClear,
  state,
  options,
}: ActiveFilterChipsProps) => {
  const labelFor = (
    facet:
      | 'roleCategories'
      | 'locations'
      | 'departments'
      | 'educationRequirements',
    value: string,
  ) =>
    options?.[facet]?.find((option) => option.value === value)?.label ??
    value;

  const filters: ActiveFilter[] = [];

  const add = (key: string, label: string, remove: () => void) =>
    filters.push({ key, label, remove });

  if (state.keyword) {
    add('keyword', `Search: ${state.keyword}`, onKeywordClear);
  }

  state.roleCategories.forEach((value) =>
    add(`role-${value}`, labelFor('roleCategories', value), () =>
      onChange({
        roleCategories: state.roleCategories.filter(
          (item) => item !== value,
        ),
      }),
    ),
  );

  if (state.categoryName) {
    add('category', `Category: ${state.categoryName}`, () =>
      onChange({ categoryName: '' }),
    );
  }

  state.locations.forEach((value) =>
    add(`location-${value}`, labelFor('locations', value), () =>
      onChange({
        locations: state.locations.filter((item) => item !== value),
      }),
    ),
  );

  state.workModes.forEach((value) =>
    add(`work-${value}`, getWorkplaceTypeLabel(value), () =>
      onChange({
        workModes: state.workModes.filter((item) => item !== value),
      }),
    ),
  );

  if (
    state.minExperienceYears !== undefined ||
    state.maxExperienceYears !== undefined
  ) {
    add('experience', formatExperienceRange(state), () =>
      onChange({
        minExperienceYears: undefined,
        maxExperienceYears: undefined,
      }),
    );
  }

  if (state.minAmount !== undefined || state.maxAmount !== undefined) {
    add('salary', formatSalaryRange(state), () =>
      onChange({
        minAmount: undefined,
        maxAmount: undefined,
      }),
    );
  }

  state.departments.forEach((value) =>
    add(`department-${value}`, labelFor('departments', value), () =>
      onChange({
        departments: state.departments.filter(
          (item) => item !== value,
        ),
      }),
    ),
  );

  state.educationRequirements.forEach((value) =>
    add(`education-${value}`, labelFor('educationRequirements', value), () =>
      onChange({
        educationRequirements: state.educationRequirements.filter(
          (item) => item !== value,
        ),
      }),
    ),
  );

  if (state.freshnessDays) {
    add(
      'freshness',
      `Posted within ${state.freshnessDays} ${
        state.freshnessDays === 1 ? 'day' : 'days'
      }`,
      () => onChange({ freshnessDays: undefined }),
    );
  }

  if (filters.length === 0) return null;

  return (
    <Stack
      aria-label="Active filters"
      direction="row"
      flexWrap="wrap"
      gap={0.75}
    >
      {filters.map((filter) => (
        <Chip
          aria-label={`${filter.label}. Remove filter`}
          key={filter.key}
          label={filter.label}
          onClick={filter.remove}
          onDelete={filter.remove}
          size="small"
        />
      ))}
    </Stack>
  );
};