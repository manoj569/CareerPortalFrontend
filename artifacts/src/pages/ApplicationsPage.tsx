import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
  Alert,
  Box,
  Chip,
  Link as MuiLink,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildJobDetailsPath } from '@/constants/routes';
import { useGetApplicationsQuery } from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  formatDashboardDate,
  getJobHistoryActionLabel,
} from '@/features/dashboard/utils/dashboardFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

export const ApplicationsPage = () => {
  useDocumentMetadata(
    'Applications | Career Portal',
    'Review application-access events recorded for your candidate account.',
  );
  const [page, setPage] = useState(1);
  const { data, isError, isFetching, isLoading, refetch } = useGetApplicationsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="These records are created by the backend when application access is granted."
        eyebrow="Career activity"
        title="Applications"
      />

      <Alert severity="info">
        The backend currently provides application history only. It has no application-detail,
        document, status-update, or withdrawal endpoint.
      </Alert>

      {isFetching && data ? (
        <Typography aria-live="polite" color="text.secondary">
          Updating application history…
        </Typography>
      ) : null}

      {isLoading && !data ? (
        <Stack aria-label="Loading applications" role="status" spacing={2}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={112} variant="rounded" />
          ))}
        </Stack>
      ) : null}

      {isError && !data ? <ErrorState onRetry={() => void refetch()} /> : null}

      {data?.items.length === 0 ? (
        <EmptyState
          description="Application history will appear after the backend grants access to an employer application."
          title="No applications recorded"
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {data.totalCount.toLocaleString()} application{' '}
            {data.totalCount === 1 ? 'record' : 'records'}
          </Typography>
          {data.items.map((application) => (
            <Paper component="article" key={application.id} sx={{ p: 3 }}>
              <Stack
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <MuiLink
                    component={Link}
                    fontWeight={800}
                    to={buildJobDetailsPath(application.jobSlug)}
                    variant="h3"
                  >
                    {application.jobTitle}
                  </MuiLink>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.companyName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {formatDashboardDate(application.occurredAtUtc) ?? 'Date unavailable'}
                  </Typography>
                  {application.notes ? (
                    <Typography sx={{ mt: 1 }} variant="body2">
                      {application.notes}
                    </Typography>
                  ) : null}
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                  <Chip
                    color="primary"
                    label={getJobHistoryActionLabel(application.action)}
                    size="small"
                  />
                  <MuiLink
                    component={Link}
                    display="inline-flex"
                    gap={0.5}
                    to={buildJobDetailsPath(application.jobSlug)}
                  >
                    View public job <OpenInNewOutlinedIcon fontSize="inherit" />
                  </MuiLink>
                </Stack>
              </Stack>
            </Paper>
          ))}
          {data.totalPages > 1 ? (
            <Pagination
              aria-label="Applications pagination"
              boundaryCount={1}
              color="primary"
              count={data.totalPages}
              onChange={(_, nextPage) => setPage(nextPage)}
              page={Math.min(page, data.totalPages)}
              showFirstButton
              showLastButton
              siblingCount={0}
              sx={{ alignSelf: 'center', pt: 1 }}
            />
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};
