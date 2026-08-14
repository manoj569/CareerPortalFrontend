import { Chip, Stack } from '@mui/material';

import {
  getCompanyTypeLabel,
  getEmploymentTypeLabel,
  getPostedByTypeLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import type { CandidateJobSearchState } from '@/features/jobs/utils/candidateJobSearchParams';

interface ActiveFilterChipsProps {
  onChange: (changes: Partial<CandidateJobSearchState>) => void;
  onKeywordClear: () => void;
  state: CandidateJobSearchState;
}

interface ActiveFilter {
  key: string;
  label: string;
  remove: () => void;
}

export const ActiveFilterChips = ({ onChange, onKeywordClear, state }: ActiveFilterChipsProps) => {
  const filters: ActiveFilter[] = [];
  const add = (key: string, label: string, remove: () => void) =>
    filters.push({ key, label, remove });

  if (state.keyword) add('keyword', `Search: ${state.keyword}`, onKeywordClear);
  if (state.companyName) add('company', `Company: ${state.companyName}`, () => onChange({ companyName: '' }));
  if (state.categoryName) add('category', `Category: ${state.categoryName}`, () => onChange({ categoryName: '' }));
  state.locations.forEach((value) => add(`location-${value}`, `Location: ${value}`, () => onChange({ locations: state.locations.filter((item) => item !== value) })));
  state.workModes.forEach((value) => add(`work-${value}`, getWorkplaceTypeLabel(value), () => onChange({ workModes: state.workModes.filter((item) => item !== value) })));
  state.employmentTypes.forEach((value) => add(`employment-${value}`, getEmploymentTypeLabel(value), () => onChange({ employmentTypes: state.employmentTypes.filter((item) => item !== value) })));
  if (state.minExperienceYears !== undefined || state.maxExperienceYears !== undefined) add('experience', `Experience: ${state.minExperienceYears ?? 0}–${state.maxExperienceYears ?? 'any'} years`, () => onChange({ minExperienceYears: undefined, maxExperienceYears: undefined }));
  if (state.minAmount !== undefined || state.maxAmount !== undefined) add('salary', `Salary: ${state.minAmount ?? 0}–${state.maxAmount ?? 'any'}`, () => onChange({ minAmount: undefined, maxAmount: undefined }));
  state.departments.forEach((value) => add(`department-${value}`, `Department: ${value}`, () => onChange({ departments: state.departments.filter((item) => item !== value) })));
  state.roleCategories.forEach((value) => add(`role-${value}`, `Role: ${value}`, () => onChange({ roleCategories: state.roleCategories.filter((item) => item !== value) })));
  state.companyTypes.forEach((value) => add(`company-type-${value}`, getCompanyTypeLabel(value), () => onChange({ companyTypes: state.companyTypes.filter((item) => item !== value) })));
  state.internshipDurationMonths.forEach((value) => add(`duration-${value}`, `${value} month internship`, () => onChange({ internshipDurationMonths: state.internshipDurationMonths.filter((item) => item !== value) })));
  if (state.flexibleDuration) add('flexible-duration', 'Flexible internship duration', () => onChange({ flexibleDuration: undefined }));
  state.educationRequirements.forEach((value) => add(`education-${value}`, `Education: ${value}`, () => onChange({ educationRequirements: state.educationRequirements.filter((item) => item !== value) })));
  state.postedByTypes.forEach((value) => add(`posted-by-${value}`, `Posted by: ${getPostedByTypeLabel(value)}`, () => onChange({ postedByTypes: state.postedByTypes.filter((item) => item !== value) })));
  state.industries.forEach((value) => add(`industry-${value}`, `Industry: ${value}`, () => onChange({ industries: state.industries.filter((item) => item !== value) })));
  if (state.freshnessDays) add('freshness', `Posted within ${state.freshnessDays} ${state.freshnessDays === 1 ? 'day' : 'days'}`, () => onChange({ freshnessDays: undefined }));
  if (state.featuredOnly) add('featured', 'Featured jobs only', () => onChange({ featuredOnly: undefined }));

  if (filters.length === 0) return null;

  return (
    <Stack aria-label="Active filters" direction="row" flexWrap="wrap" gap={0.75}>
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
