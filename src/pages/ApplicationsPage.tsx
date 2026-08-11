import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
  Box,
  FormControl,
  Grid,
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
import { buildJobDetailsPath } from '@/constants/routes';
import { useGetApplicationsQuery } from '@/features/dashboard/api/dashboardApi';
import { ApplicationStatusChip } from '@/features/dashboard/components/ApplicationStatusChip';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { JobApplicationStatus } from '@/features/dashboard/types/dashboardModels';
import {
  formatDashboardDate,
  getApplicationStatusLabel,
} from '@/features/dashboard/utils/dashboardFormatting';
import {
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;
const statuses = Object.values(JobApplicationStatus).filter(
  (value): value is JobApplicationStatus => typeof value === 'number',
);

export const ApplicationsPage = () => {
  useDocumentMetadata(
    'Applied jobs | Career Harbor',
    'Review jobs you have applied to from your candidate account.',
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
        title="Applied jobs"
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
        <Stack aria-label="Loading applied jobs" role="status" spacing={2}>
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
              : 'Jobs will appear here after you apply through Career Harbor.'
          }
          title={status ? 'No matching applied jobs' : 'No applied jobs yet'}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {data.totalCount.toLocaleString()} applied job
            {data.totalCount === 1 ? '' : 's'}
          </Typography>
          {data.items.map((application) => (
            <Paper component="article" key={application.id} sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box minWidth={0} sx={{ flex: 1 }}>
                  <Typography component="h2" sx={{ overflowWrap: 'anywhere' }} variant="h3">
                    {application.jobTitle}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.companyName}
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
                    View job <OpenInNewOutlinedIcon fontSize="inherit" />
                  </MuiLink>
                </Stack>
              </Stack>
              <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2.5, pt: 2.5 }}>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Category" value={application.categoryName} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Location" value={application.location} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Employment type" value={application.employmentType ? getEmploymentTypeLabel(application.employmentType) : null} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Work mode" value={application.workMode ? getWorkplaceTypeLabel(application.workMode) : null} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Experience level" value={application.experienceLevel ? getExperienceLevelLabel(application.experienceLevel) : null} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Application method" value={application.applicationMethod} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Applied" value={formatDashboardDate(application.submittedAtUtc)} /></Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}><ApplicationField label="Closing date" value={formatDashboardDate(application.closingDate)} /></Grid>
              </Grid>
            </Paper>
          ))}
          {data.totalPages > 1 ? (
            <Pagination
              aria-label="Applied jobs pagination"
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

const ApplicationField = ({ label, value }: { label: string; value: string | null }) => (
  <Box>
    <Typography color="text.secondary" variant="caption">{label}</Typography>
    <Typography fontWeight={650} sx={{ mt: 0.25 }} variant="body2">{value ?? 'Not specified'}</Typography>
  </Box>
);
