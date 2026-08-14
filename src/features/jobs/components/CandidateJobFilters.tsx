import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';

import { getCompanyTypeLabel, getWorkplaceTypeLabel } from '../constants/jobOptions';
import {
  WorkplaceType,
  type PublicJobFilterOptions,
  type SupplementalJobFilterCounts,
} from '../types/jobModels';
import type { CandidateJobSearchState } from '../utils/candidateJobSearchParams';
import { JobNameFilters } from './JobNameFilters';
import {
  FacetSelectionFilter,
  type FacetSelectionOption,
} from './candidateBrowse/FacetSelectionFilter';
import {
  getEducationDisplayLabel,
  getLocationDisplayLabel,
} from './candidateBrowse/facetDisplay';

const EXPERIENCE_MAXIMUM = 45;
const SALARY_MAXIMUM_LPA = 50;
const RUPEES_PER_LAKH = 100_000;

interface FilterSectionProps {
  children: ReactNode;
  defaultExpanded?: boolean;
  title: string;
}

const FilterSection = ({ children, defaultExpanded = false, title }: FilterSectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Accordion
      data-filter-group={title}
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
    </Accordion>
  );
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const toExperienceRange = (state: CandidateJobSearchState): [number, number] => [
  clamp(state.minExperienceYears ?? 0, 0, EXPERIENCE_MAXIMUM),
  clamp(state.maxExperienceYears ?? EXPERIENCE_MAXIMUM, 0, EXPERIENCE_MAXIMUM),
];

const amountToLpa = (amount: number | undefined, fallback: number): number =>
  amount === undefined
    ? fallback
    : clamp(Math.round(amount / RUPEES_PER_LAKH), 0, SALARY_MAXIMUM_LPA);

const toSalaryRange = (state: CandidateJobSearchState): [number, number] => [
  amountToLpa(state.minAmount, 0),
  amountToLpa(state.maxAmount, SALARY_MAXIMUM_LPA),
];

const formatExperience = (value: number): string =>
  value === EXPERIENCE_MAXIMUM ? '45+ years' : `${value} ${value === 1 ? 'year' : 'years'}`;

const formatSalary = (value: number): string =>
  value === SALARY_MAXIMUM_LPA ? '₹50+ LPA' : `₹${value} LPA`;

const enumOptions = <TValue extends number>(
  options: { value: TValue; count: number }[],
  getLabel: (value: TValue) => string,
): FacetSelectionOption[] =>
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
  const [experienceRange, setExperienceRange] = useState<[number, number]>(() =>
    toExperienceRange(state),
  );
  const [salaryRange, setSalaryRange] = useState<[number, number]>(() => toSalaryRange(state));

  useEffect(() => {
    setExperienceRange([
      clamp(state.minExperienceYears ?? 0, 0, EXPERIENCE_MAXIMUM),
      clamp(state.maxExperienceYears ?? EXPERIENCE_MAXIMUM, 0, EXPERIENCE_MAXIMUM),
    ]);
  }, [state.maxExperienceYears, state.minExperienceYears]);

  useEffect(() => {
    setSalaryRange([
      amountToLpa(state.minAmount, 0),
      amountToLpa(state.maxAmount, SALARY_MAXIMUM_LPA),
    ]);
  }, [state.maxAmount, state.minAmount]);

  const applyExperienceRange = (value: number[]) => {
    const [minimum = 0, maximum = EXPERIENCE_MAXIMUM] = value;
    onChange({
      maxExperienceYears: maximum === EXPERIENCE_MAXIMUM ? undefined : maximum,
      minExperienceYears: minimum === 0 ? undefined : minimum,
    });
  };

  const applySalaryRange = (value: number[]) => {
    const [minimum = 0, maximum = SALARY_MAXIMUM_LPA] = value;
    onChange({
      maxAmount: maximum === SALARY_MAXIMUM_LPA ? undefined : maximum * RUPEES_PER_LAKH,
      minAmount: minimum === 0 ? undefined : minimum * RUPEES_PER_LAKH,
    });
  };

  return (
    <Stack data-testid="candidate-job-filter-groups" spacing={0}>
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

      <FilterSection defaultExpanded title="Experience">
        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="body2">
            {formatExperience(experienceRange[0])} – {formatExperience(experienceRange[1])}
          </Typography>
          <Slider
            aria-label="Experience range"
            disableSwap
            getAriaLabel={(index) =>
              index === 0 ? 'Minimum experience' : 'Maximum experience'
            }
            getAriaValueText={(value) => formatExperience(value)}
            marks={[
              { label: '0 years', value: 0 },
              { label: '45+ years', value: EXPERIENCE_MAXIMUM },
            ]}
            max={EXPERIENCE_MAXIMUM}
            min={0}
            onChange={(_, value) => setExperienceRange(value as [number, number])}
            onChangeCommitted={(_, value) => applyExperienceRange(value)}
            step={1}
            value={experienceRange}
          />
        </Stack>
      </FilterSection>

      <FilterSection defaultExpanded title="Work mode">
        <FacetSelectionFilter
          dialogTitle="Select work modes"
          facetLabel="Work mode"
          onApply={(values) => onChange({ workModes: values.map(Number) })}
          options={enumOptions(options.workModes, (value) =>
            value === WorkplaceType.OnSite ? 'Work from office' : getWorkplaceTypeLabel(value),
          )}
          searchLabel="Search work modes"
          selected={state.workModes.map(String)}
        />
      </FilterSection>

      <FilterSection defaultExpanded title="Salary">
        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="body2">
            {formatSalary(salaryRange[0])} – {formatSalary(salaryRange[1])}
          </Typography>
          <Slider
            aria-label="Annual salary range"
            disableSwap
            getAriaLabel={(index) =>
              index === 0 ? 'Minimum annual salary' : 'Maximum annual salary'
            }
            getAriaValueText={(value) => formatSalary(value)}
            marks={[
              { label: '₹0 LPA', value: 0 },
              { label: '₹50+ LPA', value: SALARY_MAXIMUM_LPA },
            ]}
            max={SALARY_MAXIMUM_LPA}
            min={0}
            onChange={(_, value) => setSalaryRange(value as [number, number])}
            onChangeCommitted={(_, value) => applySalaryRange(value)}
            step={1}
            value={salaryRange}
          />
        </Stack>
      </FilterSection>

      <FilterSection defaultExpanded={state.companyTypes.length > 0} title="Company type">
        <FacetSelectionFilter
          dialogTitle="Select company types"
          facetLabel="Company type"
          onApply={(values) => onChange({ companyTypes: values.map(Number) })}
          options={enumOptions(options.companyTypes, getCompanyTypeLabel)}
          searchLabel="Search company types"
          selected={state.companyTypes.map(String)}
        />
      </FilterSection>

      <FilterSection defaultExpanded={Boolean(state.categoryName)} title="Category">
        <JobNameFilters
          categoryName={state.categoryName}
          companyName=""
          fields="category"
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.locations.length > 0} title="Location">
        <FacetSelectionFilter
          dialogTitle="Select locations"
          facetLabel="Location"
          onApply={(locations) => onChange({ locations })}
          options={options.locations.map((option) => ({
            count: option.count,
            key: option.value,
            label: getLocationDisplayLabel(option.value),
          }))}
          searchLabel="Search locations"
          selected={state.locations}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.departments.length > 0} title="Department">
        <FacetSelectionFilter
          dialogTitle="Select departments"
          facetLabel="Department"
          onApply={(departments) => onChange({ departments })}
          options={options.departments.map((option) => ({
            count: option.count,
            key: option.value,
            label: option.value.trim(),
          }))}
          searchLabel="Search departments"
          selected={state.departments}
        />
      </FilterSection>

      <FilterSection defaultExpanded={state.educationRequirements.length > 0} title="Education">
        <FacetSelectionFilter
          dialogTitle="Select education"
          facetLabel="Education"
          onApply={(educationRequirements) => onChange({ educationRequirements })}
          options={options.educationRequirements.map((option) => ({
            count: option.count,
            key: option.value,
            label: getEducationDisplayLabel(option.value),
          }))}
          searchLabel="Search education"
          selected={state.educationRequirements}
        />
      </FilterSection>
    </Stack>
  );
};
