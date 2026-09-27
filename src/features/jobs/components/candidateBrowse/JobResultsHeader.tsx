import {
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { candidateJobSortOptions } from '@/features/jobs/constants/jobOptions';

interface JobResultsHeaderProps {
  count?: number;
  isLoading: boolean;
  isRecommended: boolean;
  onSortChange: (sort: string) => void;
  sort: string;
}

export const JobResultsHeader = ({
  count,
  isLoading,
  isRecommended,
  onSortChange,
  sort,
}: JobResultsHeaderProps) => (
  <Stack
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    spacing={1.5}
    sx={{
      minHeight: 44,
    }}
  >
    <Stack spacing={0.25}>
      <Typography
        component="h2"
        sx={{
          color: 'text.primary',
          fontSize: {
            xs: '1rem',
            sm: '1.05rem',
          },
          fontWeight: 800,
          lineHeight: 1.4,
        }}
      >
        {isLoading
          ? 'Finding jobs…'
          : count === undefined
            ? isRecommended
              ? 'Resume matches'
              : 'Available jobs'
            : `${count.toLocaleString()} ${
                isRecommended ? 'resume matches' : 'jobs found'
              }`}
      </Typography>

      {isRecommended ? (
        <Typography
          color="text.secondary"
          sx={{
            fontSize: '0.78rem',
          }}
        >
          Results are based on your latest uploaded resume.
        </Typography>
      ) : null}
    </Stack>

    {!isRecommended ? (
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={{
          width: {
            xs: '100%',
            sm: 'auto',
          },
        }}
      >
        <Typography
          color="text.secondary"
          sx={{
            flexShrink: 0,
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          Sort by:
        </Typography>

        <FormControl
          size="small"
          sx={{
            minWidth: {
              xs: 0,
              sm: 170,
            },
            flex: {
              xs: 1,
              sm: 'initial',
            },
          }}
        >
          <Select
            aria-label="Sort jobs"
            onChange={(event) =>
              onSortChange(event.target.value)
            }
            value={sort}
            sx={{
              height: 40,
              bgcolor: 'background.paper',
              borderRadius: 1.5,
              fontSize: '0.84rem',
              fontWeight: 600,

              '& .MuiSelect-select': {
                py: 1,
              },

              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }}
          >
            {candidateJobSortOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    ) : null}
  </Stack>
);