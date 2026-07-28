import { Grid, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { useGetSavedJobsQuery } from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import { JobCard } from '@/features/jobs/components/JobCard';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 12;

export const SavedJobsPage = () => {
  useDocumentMetadata(
    'Saved jobs | Career Portal',
    'Review and manage the job opportunities saved to your candidate account.',
  );
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isError, isFetching, isLoading, refetch } = useGetSavedJobsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="Keep promising opportunities together while you decide where to apply."
        eyebrow="Career activity"
        title="Saved jobs"
      />

      {isFetching && data ? (
        <Typography aria-live="polite" color="text.secondary">
          Updating saved jobs…
        </Typography>
      ) : null}

      {isLoading && !data ? (
        <Grid aria-label="Loading saved jobs" container role="status" spacing={2.5}>
          {Array.from({ length: 4 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Skeleton height={330} variant="rounded" />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {isError && !data ? <ErrorState onRetry={() => void refetch()} /> : null}

      {data?.items.length === 0 ? (
        <EmptyState
          actionLabel="Browse jobs"
          description="Save jobs from the public jobs page and they will appear here."
          onAction={() => void navigate(ROUTES.JOBS)}
          title="No saved jobs yet"
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <Stack spacing={3}>
          <Typography color="text.secondary">
            {data.totalCount.toLocaleString()} saved {data.totalCount === 1 ? 'job' : 'jobs'}
          </Typography>
          <Grid container spacing={2.5}>
            {data.items.map((savedJob) => (
              <Grid key={savedJob.savedJobId} size={{ xs: 12, md: 6 }}>
                <JobCard
                  job={savedJob.job}
                  secondaryAction={
                    <SaveJobButton
                      jobId={savedJob.job.id}
                      jobTitle={savedJob.job.title}
                      knownSaved
                    />
                  }
                />
              </Grid>
            ))}
          </Grid>
          {data.totalPages > 1 ? (
            <Pagination
              aria-label="Saved jobs pagination"
              boundaryCount={1}
              color="primary"
              count={data.totalPages}
              onChange={(_, nextPage) => setPage(nextPage)}
              page={Math.min(page, data.totalPages)}
              showFirstButton
              showLastButton
              siblingCount={0}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};
