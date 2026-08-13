import { Chip, Stack } from '@mui/material';

import { getEmploymentTypeLabel, getWorkplaceTypeLabel } from '@/features/jobs/constants/jobOptions';
import type { CandidateJobSearchState } from '@/features/jobs/utils/candidateJobSearchParams';

interface ActiveFilterChipsProps {
  onChange: (changes: Partial<CandidateJobSearchState>) => void;
  onKeywordClear: () => void;
  state: CandidateJobSearchState;
}

export const ActiveFilterChips = ({ onChange, onKeywordClear, state }: ActiveFilterChipsProps) => (
  <Stack aria-label="Active filters" direction="row" flexWrap="wrap" gap={0.75}>
    {state.keyword ? <Chip label={`Search: ${state.keyword}`} onDelete={onKeywordClear} size="small" /> : null}
    {state.companyName ? <Chip label={`Company: ${state.companyName}`} onDelete={() => onChange({ companyName: '' })} size="small" /> : null}
    {state.categoryName ? <Chip label={`Category: ${state.categoryName}`} onDelete={() => onChange({ categoryName: '' })} size="small" /> : null}
    {state.locations.map((location) => <Chip key={`location-${location}`} label={`Location: ${location}`} onDelete={() => onChange({ locations: state.locations.filter((value) => value !== location) })} size="small" />)}
    {state.workModes.map((mode) => <Chip key={`mode-${mode}`} label={getWorkplaceTypeLabel(mode)} onDelete={() => onChange({ workModes: state.workModes.filter((value) => value !== mode) })} size="small" />)}
    {state.employmentTypes.map((type) => <Chip key={`type-${type}`} label={getEmploymentTypeLabel(type)} onDelete={() => onChange({ employmentTypes: state.employmentTypes.filter((value) => value !== type) })} size="small" />)}
    {state.minExperienceYears !== undefined || state.maxExperienceYears !== undefined ? <Chip label={`Experience: ${state.minExperienceYears ?? 0}–${state.maxExperienceYears ?? 'any'} years`} onDelete={() => onChange({ minExperienceYears: undefined, maxExperienceYears: undefined })} size="small" /> : null}
    {state.minAmount !== undefined || state.maxAmount !== undefined ? <Chip label={`Salary: ${state.minAmount ?? 0}–${state.maxAmount ?? 'any'}`} onDelete={() => onChange({ minAmount: undefined, maxAmount: undefined })} size="small" /> : null}
  </Stack>
);
