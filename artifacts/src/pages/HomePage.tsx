import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetFeaturedJobsQuery } from '@/features/jobs/api/jobsApi';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobCardSkeleton } from '@/features/jobs/components/JobCardSkeleton';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const HomePage = () => {
  useDocumentMetadata(
    'Career Portal | Find your next opportunity',
    'Discover featured career opportunities from employers on Career Portal.',
    { canonicalPath: ROUTES.HOME },
  );
  const { data, isError, isLoading } = useGetFeaturedJobsQuery({ pageSize: 3 });

  return (
    <Stack spacing={{ xs: 6, md: 8 }}>
      <Box sx={{ maxWidth: 760, py: { xs: 2, md: 5 } }}>
        <Typography component="h1" variant="h1">
          Build a career with purpose
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.125rem', mt: 2 }}>
          Explore active roles from employers and find the opportunity that moves your career
          forward.
        </Typography>
        <Button
          component={Link}
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 3 }}
          to={ROUTES.JOBS}
          variant="contained"
        >
          Explore all jobs
        </Button>
      </Box>

      <Box component="section" aria-labelledby="featured-jobs-heading">
        <Stack
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography component="h2" id="featured-jobs-heading" variant="h2">
              Featured opportunities
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              A selection of active roles highlighted by employers.
            </Typography>
          </Box>
          <Button component={Link} to={ROUTES.JOBS}>
            View all jobs
          </Button>
        </Stack>

        {isLoading ? (
          <Grid container spacing={2.5}>
            {Array.from({ length: 3 }, (_, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <JobCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : null}

        {!isError && data && data.items.length > 0 ? (
          <Grid container spacing={2.5}>
            {data.items.map((job) => (
              <Grid key={job.id} size={{ xs: 12, md: 4 }}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>
        ) : null}

        {isError || data?.items.length === 0 ? (
          <Typography color="text.secondary">
            Featured jobs are unavailable right now. You can still browse all active jobs.
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
};
