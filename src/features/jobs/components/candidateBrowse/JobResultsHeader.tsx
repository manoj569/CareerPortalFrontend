import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';

import { candidateJobSortOptions } from '@/features/jobs/constants/jobOptions';

interface JobResultsHeaderProps {
  count?: number;
  isLoading: boolean;
  isRecommended: boolean;
  onSortChange: (sort: string) => void;
  sort: string;
}

export const JobResultsHeader = ({ count, isLoading, isRecommended, onSortChange, sort }: JobResultsHeaderProps) => (
  <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
    <div>
      <Typography component="h2" variant="h3">
        {isLoading ? 'Finding jobs…' : count === undefined ? (isRecommended ? 'Resume matches' : 'Available jobs') : `${count.toLocaleString()} ${isRecommended ? 'resume matches' : 'jobs found'}`}
      </Typography>
      {isRecommended ? <Typography color="text.secondary" variant="body2">Results are based on your latest uploaded resume.</Typography> : null}
    </div>
    {!isRecommended ? (
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="candidate-jobs-sort-label">Sort jobs</InputLabel>
        <Select label="Sort jobs" labelId="candidate-jobs-sort-label" onChange={(event) => onSortChange(event.target.value)} value={sort}>
          {candidateJobSortOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
        </Select>
      </FormControl>
    ) : null}
  </Stack>
);
