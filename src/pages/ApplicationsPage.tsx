import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
  Box,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildApplicationDetailsPath, buildJobDetailsPath } from '@/constants/routes';
import { useGetApplicationsQuery } from '@/features/dashboard/api/dashboardApi';
import { ApplicationStatusChip } from '@/features/dashboard/components/ApplicationStatusChip';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { JobApplicationStatus } from '@/features/dashboard/types/dashboardModels';
import {
  formatDashboardDate,
  getApplicationStatusLabel,
} from '@/features/dashboard/utils/dashboardFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;
const statuses = Object.values(JobApplicationStatus).filter(
  (value): value is JobApplicationStatus => typeof value === 'number',
);

export const ApplicationsPage = () => {
  useDocumentMetadata(
    'Applications | Career Portal',
    'Review job applications submitted from your candidate account.',
  );
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<JobApplicationStatus | ''>('');
  const { data, isError, isFetching, isLoading, refetch } = useGetApplicationsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
  });

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="Follow every application from submission through the employer’s decision."
        eyebrow="Career activity"
        title="Applications"
      />

      <FormControl size="small" sx={{ maxWidth: 280 }}>
        <InputLabel id="application-status-filter-label">Application status</InputLabel>
        <Select
          label="Application status"
          labelId="application-status-filter-label"
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          value={status}
        >
          <MenuItem value="">All statuses</MenuItem>
          {statuses.map((value) => (
            <MenuItem key={value} value={value}>
              {getApplicationStatusLabel(value)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isFetching && data ? (
        <Typography aria-live="polite" color="text.secondary">
          Updating applications…
        </Typography>
      ) : null}

      {isLoading && !data ? (
        <Stack aria-label="Loading applications" role="status" spacing={2}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={132} variant="rounded" />
          ))}
        </Stack>
      ) : null}

      {isError && !data ? <ErrorState onRetry={() => void refetch()} /> : null}

      {data?.items.length === 0 ? (
        <EmptyState
          description={
            status
              ? 'No applications match this status. Choose another status to see more.'
              : 'Applications submitted from active job pages will appear here.'
          }
          title={status ? 'No matching applications' : 'No applications yet'}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {data.totalCount.toLocaleString()} application
            {data.totalCount === 1 ? '' : 's'}
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
                    to={buildApplicationDetailsPath(application.id)}
                    variant="h3"
                  >
                    {application.jobTitle}
                  </MuiLink>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.companyName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Submitted{' '}
                    {formatDashboardDate(application.submittedAtUtc) ?? 'date unavailable'}
                  </Typography>
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                  <ApplicationStatusChip status={application.status} />
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
