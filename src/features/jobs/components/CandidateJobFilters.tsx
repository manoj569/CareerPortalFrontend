import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  getCompanyTypeLabel,
  getEmploymentTypeLabel,
  getPostedByTypeLabel,
  getWorkplaceTypeLabel,
} from '../constants/jobOptions';
import {
  WorkplaceType,
  type PublicJobFilterOptions,
  type SupplementalJobFilterCounts,
} from '../types/jobModels';
import type { CandidateJobSearchState } from '../utils/candidateJobSearchParams';

interface FilterOption {
  count?: number;
  key: string;
  label: string;
}

interface FacetCheckboxGroupProps {
  label: string;
  onToggle: (key: string) => void;
  options: FilterOption[];
  selected: string[];
}

const FacetCheckboxGroup = ({ label, onToggle, options, selected }: FacetCheckboxGroupProps) => {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = options.filter(
    (option) => (option.count ?? 1) > 0 || selected.includes(option.key),
  );
  const displayedOptions = expanded ? visibleOptions : visibleOptions.slice(0, 5);

  if (visibleOptions.length === 0) return null;

  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
      <Typography component="legend" fontWeight={800} sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <FormGroup>
        {displayedOptions.map((option) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={selected.includes(option.key)}
                onChange={() => onToggle(option.key)}
                size="small"
              />
            }
            key={option.key}
            label={`${option.label}${option.count === undefined ? '' : ` (${option.count})`}`}
            sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { pt: 0.5 } }}
          />
        ))}
      </FormGroup>
      {visibleOptions.length > 5 ? (
        <Button onClick={() => setExpanded((value) => !value)} size="small" sx={{ mt: 0.5 }}>
          {expanded ? 'View less' : `View more (${visibleOptions.length - 5})`}
        </Button>
      ) : null}
    </Box>
  );
};

const toggleValue = <T,>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

const enumOptions = <TValue extends number>(
  options: { value: TValue; count: number }[],
  getLabel: (value: TValue) => string,
): FilterOption[] =>
  options.map((option) => ({
    count: option.count,
    key: String(option.value),
    label: getLabel(option.value),
  }));

interface CandidateJobFiltersProps {
  appliedCount: number;
  onChange: (changes: Partial<CandidateJobSearchState>) => void;
  onClear: () => void;
  options: PublicJobFilterOptions;
  state: CandidateJobSearchState;
  supplementalCounts: SupplementalJobFilterCounts;
}

export const CandidateJobFilters = ({
  appliedCount,
  onChange,
  onClear,
  options,
  state,
  supplementalCounts,
}: CandidateJobFiltersProps) => {
  const updateExperience = (key: 'maxExperienceYears' | 'minExperienceYears', rawValue: string) => {
    const value = rawValue === '' ? undefined : Math.min(60, Math.max(0, Number(rawValue)));
    if (value !== undefined && !Number.isFinite(value)) return;
    if (
      key === 'minExperienceYears' &&
      value !== undefined &&
      state.maxExperienceYears !== undefined &&
      state.maxExperienceYears < value
    ) {
      onChange({ maxExperienceYears: value, minExperienceYears: value });
      return;
    }
    if (
      key === 'maxExperienceYears' &&
      value !== undefined &&
      state.minExperienceYears !== undefined &&
      state.minExperienceYears > value
    ) {
      onChange({ maxExperienceYears: value, minExperienceYears: value });
      return;
    }
    onChange({ [key]: value });
  };

  const updateAmount = (key: 'maxAmount' | 'minAmount', rawValue: string) => {
    const value = rawValue === '' ? undefined : Math.max(0, Number(rawValue));
    if (value !== undefined && !Number.isFinite(value)) return;
    if (
      key === 'minAmount' &&
      value !== undefined &&
      state.maxAmount !== undefined &&
      state.maxAmount < value
    ) {
      onChange({ maxAmount: value, minAmount: value });
      return;
    }
    if (
      key === 'maxAmount' &&
      value !== undefined &&
      state.minAmount !== undefined &&
      state.minAmount > value
    ) {
      onChange({ maxAmount: value, minAmount: value });
      return;
    }
    onChange({ [key]: value });
  };

  return (
    <Stack spacing={2.25}>
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <Typography component="h2" variant="h3">
          All filters
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Applied ({appliedCount})
        </Typography>
      </Stack>
      <Button disabled={appliedCount === 0} onClick={onClear} sx={{ alignSelf: 'flex-start' }}>
        Clear all
      </Button>
      <Divider />

      <FacetCheckboxGroup
        label="Work mode"
        onToggle={(key) => onChange({ workModes: toggleValue(state.workModes, Number(key)) })}
        options={enumOptions(options.workModes, (value) =>
          value === WorkplaceType.OnSite ? 'Work from office' : getWorkplaceTypeLabel(value),
        )}
        selected={state.workModes.map(String)}
      />

      {options.experienceRange.count > 0 ? (
        <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
          <Typography component="legend" fontWeight={800} sx={{ mb: 1 }}>
            Experience ({options.experienceRange.count})
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              inputProps={{ max: 60, min: 0 }}
              label="Minimum years"
              onChange={(event) => updateExperience('minExperienceYears', event.target.value)}
              size="small"
              type="number"
              value={state.minExperienceYears ?? ''}
            />
            <TextField
              inputProps={{ max: 60, min: 0 }}
              label="Maximum years"
              onChange={(event) => updateExperience('maxExperienceYears', event.target.value)}
              size="small"
              type="number"
              value={state.maxExperienceYears ?? ''}
            />
          </Stack>
        </Box>
      ) : null}

      <FacetCheckboxGroup
        label="Department"
        onToggle={(key) => onChange({ departments: toggleValue(state.departments, key) })}
        options={options.departments.map((option) => ({
          count: option.count,
          key: option.value,
          label: option.value,
        }))}
        selected={state.departments}
      />

      <FacetCheckboxGroup
        label="Role category"
        onToggle={(key) => onChange({ roleCategories: toggleValue(state.roleCategories, key) })}
        options={options.roleCategories.map((option) => ({
          count: option.count,
          key: option.value,
          label: option.value,
        }))}
        selected={state.roleCategories}
      />

      {options.salaryRange.count > 0 ? (
        <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
          <Typography component="legend" fontWeight={800} sx={{ mb: 1 }}>
            Salary / Stipend ({options.salaryRange.count})
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              inputProps={{ min: 0 }}
              label="Minimum amount"
              onChange={(event) => updateAmount('minAmount', event.target.value)}
              size="small"
              type="number"
              value={state.minAmount ?? ''}
            />
            <TextField
              inputProps={{ min: 0 }}
              label="Maximum amount"
              onChange={(event) => updateAmount('maxAmount', event.target.value)}
              size="small"
              type="number"
              value={state.maxAmount ?? ''}
            />
          </Stack>
        </Box>
      ) : null}

      <FacetCheckboxGroup
        label="Company type"
        onToggle={(key) => onChange({ companyTypes: toggleValue(state.companyTypes, Number(key)) })}
        options={enumOptions(options.companyTypes, getCompanyTypeLabel)}
        selected={state.companyTypes.map(String)}
      />

      <FacetCheckboxGroup
        label="Employment type"
        onToggle={(key) =>
          onChange({
            employmentTypes: toggleValue(state.employmentTypes, Number(key)),
          })
        }
        options={enumOptions(options.employmentTypes, getEmploymentTypeLabel)}
        selected={state.employmentTypes.map(String)}
      />

      <FacetCheckboxGroup
        label="Internship duration"
        onToggle={(key) => {
          if (key === 'flexible') {
            onChange({ flexibleDuration: state.flexibleDuration ? undefined : true });
            return;
          }
          onChange({
            internshipDurationMonths: toggleValue(state.internshipDurationMonths, Number(key)),
          });
        }}
        options={options.internshipDurations.map((option) => ({
          count: option.count,
          key: option.isFlexible ? 'flexible' : String(option.months),
          label: option.label,
        }))}
        selected={[
          ...state.internshipDurationMonths.map(String),
          ...(state.flexibleDuration ? ['flexible'] : []),
        ]}
      />

      <FacetCheckboxGroup
        label="Education"
        onToggle={(key) =>
          onChange({ educationRequirements: toggleValue(state.educationRequirements, key) })
        }
        options={options.educationRequirements.map((option) => ({
          count: option.count,
          key: option.value,
          label: option.value,
        }))}
        selected={state.educationRequirements}
      />

      <FacetCheckboxGroup
        label="Posted by"
        onToggle={(key) =>
          onChange({ postedByTypes: toggleValue(state.postedByTypes, Number(key)) })
        }
        options={enumOptions(options.postedByTypes, getPostedByTypeLabel)}
        selected={state.postedByTypes.map(String)}
      />

      <FacetCheckboxGroup
        label="Industry"
        onToggle={(key) => onChange({ industries: toggleValue(state.industries, key) })}
        options={options.industries.map((option) => ({
          count: option.count,
          key: option.value,
          label: option.value,
        }))}
        selected={state.industries}
      />

      <FacetCheckboxGroup
        label="Top companies"
        onToggle={(key) => onChange({ companyIds: toggleValue(state.companyIds, key) })}
        options={options.companies.map((option) => ({
          count: option.count,
          key: option.id,
          label: option.name,
        }))}
        selected={state.companyIds}
      />

      <FacetCheckboxGroup
        label="Freshness"
        onToggle={(key) =>
          onChange({ freshnessDays: state.freshnessDays === Number(key) ? undefined : Number(key) })
        }
        options={[
          { count: supplementalCounts.freshness[1], key: '1', label: 'Last 24 hours' },
          { count: supplementalCounts.freshness[3], key: '3', label: '3 days' },
          { count: supplementalCounts.freshness[7], key: '7', label: '7 days' },
          { count: supplementalCounts.freshness[15], key: '15', label: '15 days' },
          { count: supplementalCounts.freshness[30], key: '30', label: '30 days' },
        ]}
        selected={state.freshnessDays ? [String(state.freshnessDays)] : []}
      />

      <FacetCheckboxGroup
        label="Location"
        onToggle={(key) => onChange({ locations: toggleValue(state.locations, key) })}
        options={options.locations.map((option) => ({
          count: option.count,
          key: option.value,
          label: option.value,
        }))}
        selected={state.locations}
      />

      <FacetCheckboxGroup
        label="Featured"
        onToggle={() => onChange({ featuredOnly: state.featuredOnly ? undefined : true })}
        options={[
          {
            count: supplementalCounts.featured,
            key: 'featured',
            label: 'Featured jobs only',
          },
        ]}
        selected={state.featuredOnly ? ['featured'] : []}
      />
    </Stack>
  );
};
