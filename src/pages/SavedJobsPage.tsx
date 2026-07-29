import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import {
  Button,
  Grid,
  Link as MuiLink,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import { useGetSavedJobsQuery } from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
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
              <Skeleton height={230} variant="rounded" />
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
                <Paper component="article" sx={{ height: '100%', p: 3 }}>
                  <Stack alignItems="flex-start" height="100%" spacing={2}>
                    <BookmarkOutlinedIcon color="primary" />
                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                      <MuiLink
                        component={Link}
                        fontWeight={800}
                        to={buildJobDetailsPath(savedJob.slug)}
                        variant="h3"
                      >
                        {savedJob.title}
                      </MuiLink>
                      <Typography color="text.secondary">{savedJob.companyName}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Saved {formatDashboardDate(savedJob.savedAtUtc) ?? 'date unavailable'}
                      </Typography>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button component={Link} to={buildJobDetailsPath(savedJob.slug)}>
                        View job
                      </Button>
                      <SaveJobButton jobId={savedJob.jobId} jobTitle={savedJob.title} knownSaved />
                    </Stack>
                  </Stack>
                </Paper>
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
