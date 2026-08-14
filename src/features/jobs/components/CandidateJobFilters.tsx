import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';

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
import { JobNameFilters } from './JobNameFilters';

interface FilterOption {
  count?: number;
  key: string;
  label: string;
}

interface FilterSectionProps {
  children: ReactNode;
  defaultExpanded?: boolean;
  title: string;
}

const FilterSection = ({ children, defaultExpanded = false, title }: FilterSectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return <Accordion
    disableGutters
    elevation={0}
    expanded={expanded}
    onChange={(_, nextExpanded) => setExpanded(nextExpanded)}
    slotProps={{ transition: { unmountOnExit: false } }}
    sx={{
      borderBottom: 1,
      borderColor: 'divider',
      '&::before': { display: 'none' },
      '&:last-of-type': { borderBottom: 0 },
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 46, px: 0 }}>
      <Typography fontWeight={800} variant="body2">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0, pb: 2, pt: 0 }}>{children}</AccordionDetails>
  </Accordion>;
};

interface FacetCheckboxGroupProps {
  onToggle: (key: string) => void;
  options: FilterOption[];
  selected: string[];
}

const FacetCheckboxGroup = ({ onToggle, options, selected }: FacetCheckboxGroupProps) => {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = options.filter(
    (option) => (option.count ?? 1) > 0 || selected.includes(option.key),
  );
  const displayedOptions = showAll ? visibleOptions : visibleOptions.slice(0, 5);

  if (visibleOptions.length === 0) {
    return <Typography color="text.secondary" variant="body2">No options available.</Typography>;
  }

  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
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
            sx={{
              alignItems: 'flex-start',
              m: 0,
              '& .MuiFormControlLabel-label': { pt: 0.55 },
            }}
          />
        ))}
      </FormGroup>
      {visibleOptions.length > 5 ? (
        <Button onClick={() => setShowAll((value) => !value)} size="small" sx={{ mt: 0.5 }}>
          {showAll ? 'Show less' : `Show ${visibleOptions.length - 5} more`}
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
  onCollapse?: () => void;
  options: PublicJobFilterOptions;
  state: CandidateJobSearchState;
  supplementalCounts: SupplementalJobFilterCounts;
}

export const CandidateJobFilters = ({
  appliedCount,
  onChange,
  onClear,
  onCollapse,
  options,
  state,
  supplementalCounts,
}: CandidateJobFiltersProps) => {
  const [locationInput, setLocationInput] = useState(state.locations.join(', '));

  useEffect(() => {
    setLocationInput(state.locations.join(', '));
  }, [state.locations]);

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

  const applyLocationInput = () => {
    const locations = locationInput
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 25);
    onChange({ locations });
  };

  const handleLocationKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    applyLocationInput();
  };

  return (
    <Stack spacing={0}>
      <Stack alignItems="center" direction="row" gap={1} sx={{ pb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="h3">Filters</Typography>
          <Typography color="text.secondary" variant="caption">
            Applied ({appliedCount})
          </Typography>
        </Box>
        <Button disabled={appliedCount === 0} onClick={onClear} size="small">
          Clear all
        </Button>
        {onCollapse ? (
          <Tooltip title="Collapse filters">
            <IconButton aria-label="Collapse job filters" onClick={onCollapse} size="small">
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <FilterSection defaultExpanded title="Date posted">
        <RadioGroup
          aria-label="Date posted"
          onChange={(event) =>
            onChange({ freshnessDays: event.target.value ? Number(event.target.value) : undefined })
          }
          value={state.freshnessDays ? String(state.freshnessDays) : ''}
        >
          <FormControlLabel control={<Radio size="small" />} label="All dates" value="" />
          {[
            [1, 'Last 24 hours'],
            [3, '3 days'],
            [7, '7 days'],
            [15, '15 days'],
            [30, '30 days'],
          ].map(([days, label]) => (
            <FormControlLabel
              control={<Radio size="small" />}
              key={days}
              label={`${label} (${supplementalCounts.freshness[days as 1 | 3 | 7 | 15 | 30]})`}
              value={String(days)}
            />
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection defaultExpanded title={`Experience (${options.experienceRange.count})`}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            inputProps={{ max: 60, min: 0 }}
            label="Minimum years"
            onChange={(event) => updateExperience('minExperienceYears', event.target.value)}
            size="small"
            type="number"
            value={state.minExperienceYears ?? ''}
          />
          <TextField
            fullWidth
            inputProps={{ max: 60, min: 0 }}
            label="Maximum years"
            onChange={(event) => updateExperience('maxExperienceYears', event.target.value)}
            size="small"
            type="number"
            value={state.maxExperienceYears ?? ''}
          />
        </Stack>
      </FilterSection>

      <FilterSection defaultExpanded title="Work mode">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ workModes: toggleValue(state.workModes, Number(key)) })}
          options={enumOptions(options.workModes, (value) =>
            value === WorkplaceType.OnSite ? 'Work from office' : getWorkplaceTypeLabel(value),
          )}
          selected={state.workModes.map(String)}
        />
      </FilterSection>

      <FilterSection defaultExpanded title="Job type">
        <FacetCheckboxGroup
          onToggle={(key) =>
            onChange({ employmentTypes: toggleValue(state.employmentTypes, Number(key)) })
          }
          options={enumOptions(options.employmentTypes, getEmploymentTypeLabel)}
          selected={state.employmentTypes.map(String)}
        />
      </FilterSection>

      <FilterSection defaultExpanded title={`Salary / Stipend (${options.salaryRange.count})`}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            inputProps={{ min: 0 }}
            label="Minimum amount"
            onChange={(event) => updateAmount('minAmount', event.target.value)}
            size="small"
            type="number"
            value={state.minAmount ?? ''}
          />
          <TextField
            fullWidth
            inputProps={{ min: 0 }}
            label="Maximum amount"
            onChange={(event) => updateAmount('maxAmount', event.target.value)}
            size="small"
            type="number"
            value={state.maxAmount ?? ''}
          />
        </Stack>
      </FilterSection>

      <FilterSection defaultExpanded={Boolean(state.companyName)} title="Company">
        <JobNameFilters
          categoryName={state.categoryName}
          companyName={state.companyName}
          fields="company"
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection defaultExpanded={Boolean(state.categoryName)} title="Category">
        <JobNameFilters
          categoryName={state.categoryName}
          companyName={state.companyName}
          fields="category"
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.locations.length > 0} title="Location">
        <Stack spacing={1.5}>
          <TextField
            helperText="Separate multiple locations with commas."
            label="Location filter"
            onBlur={applyLocationInput}
            onChange={(event) => setLocationInput(event.target.value)}
            onKeyDown={handleLocationKeyDown}
            placeholder="e.g. Pune, Bengaluru"
            size="small"
            value={locationInput}
          />
          <FacetCheckboxGroup
            onToggle={(key) => onChange({ locations: toggleValue(state.locations, key) })}
            options={options.locations.map((option) => ({
              count: option.count,
              key: option.value,
              label: option.value,
            }))}
            selected={state.locations}
          />
        </Stack>
      </FilterSection>

      <FilterSection defaultExpanded={state.departments.length > 0} title="Department">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ departments: toggleValue(state.departments, key) })}
          options={options.departments.map((option) => ({ count: option.count, key: option.value, label: option.value }))}
          selected={state.departments}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.roleCategories.length > 0} title="Role category">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ roleCategories: toggleValue(state.roleCategories, key) })}
          options={options.roleCategories.map((option) => ({ count: option.count, key: option.value, label: option.value }))}
          selected={state.roleCategories}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.companyTypes.length > 0} title="Company type">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ companyTypes: toggleValue(state.companyTypes, Number(key)) })}
          options={enumOptions(options.companyTypes, getCompanyTypeLabel)}
          selected={state.companyTypes.map(String)}
        />
      </FilterSection>

      <FilterSection
        defaultExpanded={state.internshipDurationMonths.length > 0 || Boolean(state.flexibleDuration)}
        title="Internship duration"
      >
        <FacetCheckboxGroup
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
      </FilterSection>

      <FilterSection defaultExpanded={state.educationRequirements.length > 0} title="Education">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ educationRequirements: toggleValue(state.educationRequirements, key) })}
          options={options.educationRequirements.map((option) => ({ count: option.count, key: option.value, label: option.value }))}
          selected={state.educationRequirements}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.postedByTypes.length > 0} title="Posted by">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ postedByTypes: toggleValue(state.postedByTypes, Number(key)) })}
          options={enumOptions(options.postedByTypes, getPostedByTypeLabel)}
          selected={state.postedByTypes.map(String)}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.industries.length > 0} title="Industry">
        <FacetCheckboxGroup
          onToggle={(key) => onChange({ industries: toggleValue(state.industries, key) })}
          options={options.industries.map((option) => ({ count: option.count, key: option.value, label: option.value }))}
          selected={state.industries}
        />
      </FilterSection>

      <FilterSection defaultExpanded={Boolean(state.featuredOnly)} title="Featured">
        <FacetCheckboxGroup
          onToggle={() => onChange({ featuredOnly: state.featuredOnly ? undefined : true })}
          options={[{ count: supplementalCounts.featured, key: 'featured', label: 'Featured jobs only' }]}
          selected={state.featuredOnly ? ['featured'] : []}
        />
      </FilterSection>
    </Stack>
  );
};
