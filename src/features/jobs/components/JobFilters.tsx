import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useId } from 'react';

import {
  employmentTypeOptions,
  experienceLevelOptions,
  jobSortOptions,
  workplaceTypeOptions,
} from '../constants/jobOptions';
import type { JobSearchState } from '../utils/jobSearchParams';

interface JobFiltersProps {
  categories: JobFilterOption[];
  companies: JobFilterOption[];
  onChange: (changes: Partial<JobSearchState>) => void;
  onClear: () => void;
  state: JobSearchState;
}

export interface JobFilterOption {
  id: string;
  name: string;
}

export const JobFilters = ({
  categories,
  companies,
  onChange,
  onClear,
  state,
}: JobFiltersProps) => {
  const fieldId = useId();

  return (
    <Stack spacing={2.5}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography component="h2" variant="h3">
          Filters
        </Typography>
        <Button onClick={onClear} size="small">
          Clear all
        </Button>
      </Stack>
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-company-label`}>Company</InputLabel>
        <Select
          label="Company"
          labelId={`${fieldId}-company-label`}
          onChange={(event) =>
            onChange({ companyId: event.target.value ? String(event.target.value) : undefined })
          }
          value={state.companyId ?? ''}
        >
          <MenuItem value="">All available companies</MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-category-label`}>Category</InputLabel>
        <Select
          label="Category"
          labelId={`${fieldId}-category-label`}
          onChange={(event) =>
            onChange({ categoryId: event.target.value ? String(event.target.value) : undefined })
          }
          value={state.categoryId ?? ''}
        >
          <MenuItem value="">All available categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-employment-type-label`}>Job type</InputLabel>
        <Select
          label="Job type"
          labelId={`${fieldId}-employment-type-label`}
          onChange={(event) =>
            onChange({
              employmentType: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          value={state.employmentType ?? ''}
        >
          <MenuItem value="">All job types</MenuItem>
          {employmentTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-workplace-type-label`}>Work mode</InputLabel>
        <Select
          label="Work mode"
          labelId={`${fieldId}-workplace-type-label`}
          onChange={(event) =>
            onChange({
              workplaceType: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          value={state.workplaceType ?? ''}
        >
          <MenuItem value="">All work modes</MenuItem>
          {workplaceTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-experience-level-label`}>Experience level</InputLabel>
        <Select
          label="Experience level"
          labelId={`${fieldId}-experience-level-label`}
          onChange={(event) =>
            onChange({
              experienceLevel: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          value={state.experienceLevel ?? ''}
        >
          <MenuItem value="">All experience levels</MenuItem>
          {experienceLevelOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={2}>
        <TextField
          inputProps={{ min: 0 }}
          label="Minimum salary"
          onChange={(event) =>
            onChange({
              minimumSalary: event.target.value === '' ? undefined : Number(event.target.value),
            })
          }
          type="number"
          value={state.minimumSalary ?? ''}
        />
        <TextField
          inputProps={{ min: 0 }}
          label="Maximum salary"
          onChange={(event) =>
            onChange({
              maximumSalary: event.target.value === '' ? undefined : Number(event.target.value),
            })
          }
          type="number"
          value={state.maximumSalary ?? ''}
        />
      </Stack>
      <FormControlLabel
        control={
          <Checkbox
            checked={state.isFeatured ?? false}
            onChange={(_, checked) => onChange({ isFeatured: checked || undefined })}
          />
        }
        label="Featured jobs only"
      />
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-sort-jobs-label`}>Sort jobs</InputLabel>
        <Select
          label="Sort jobs"
          labelId={`${fieldId}-sort-jobs-label`}
          onChange={(event) => onChange({ sort: event.target.value })}
          value={state.sort}
        >
          {jobSortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id={`${fieldId}-page-size-label`}>Results per page</InputLabel>
        <Select
          label="Results per page"
          labelId={`${fieldId}-page-size-label`}
          onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
          value={state.pageSize}
        >
          {[12, 20, 40].map((pageSize) => (
            <MenuItem key={pageSize} value={pageSize}>
              {pageSize}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
