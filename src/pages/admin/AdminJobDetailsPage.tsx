import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, Chip, Divider, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { buildAdminJobEditPath } from '@/constants/routes';
import { useGetAdminJobQuery } from '@/features/admin/api/adminApi';
import { AdminJobStatusBadge } from '@/features/admin/components/AdminStatusBadge';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminJobDetailsPage = () => {
  const { jobId = '' } = useParams<{ jobId: string }>();
  useDocumentMetadata('Job details | Career Portal', 'Review a backend Administrator job record.');
  const job = useGetAdminJobQuery(jobId, { skip: !isGuid(jobId) });

  if (job.isLoading) {
    return (
      <Skeleton aria-label="Loading job details" height={600} role="status" variant="rounded" />
    );
  }
  if (!isGuid(jobId) || job.isError || !job.data) {
    return (
      <ErrorState headingLevel="h1" onRetry={() => void job.refetch()} title="Job unavailable" />
    );
  }

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          !job.data.isDeleted ? (
            <Button
              component={Link}
              startIcon={<EditOutlinedIcon />}
              to={buildAdminJobEditPath(jobId)}
              variant="outlined"
            >
              Edit job
            </Button>
          ) : null
        }
        description={`${job.data.referenceNumber} · ${job.data.companyName}`}
        eyebrow="Jobs"
        title={job.data.title}
      />
      <Paper component="section" sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack divider={<Divider flexItem />} spacing={3}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <AdminJobStatusBadge status={job.data.status} />
            {job.data.isFeatured ? <Chip color="primary" label="Featured" /> : null}
            {job.data.isHidden ? <Chip label="Hidden" /> : null}
            {job.data.isDeleted ? <Chip color="error" label="Deleted" /> : null}
          </Stack>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{job.data.description}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography>
                <strong>Category:</strong> {job.data.categoryName}
              </Typography>
              <Typography>
                <strong>Location:</strong> {job.data.location ?? 'Not set'}
              </Typography>
              <Typography>
                <strong>Employment:</strong> {getEmploymentTypeLabel(job.data.employmentType)}
              </Typography>
              <Typography>
                <strong>Workplace:</strong> {getWorkplaceTypeLabel(job.data.workplaceType)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography>
                <strong>Experience:</strong> {getExperienceLevelLabel(job.data.experienceLevel)}
              </Typography>
              <Typography>
                <strong>Published:</strong> {formatAdminDate(job.data.publishedAtUtc)}
              </Typography>
              <Typography>
                <strong>Expires:</strong> {formatAdminDate(job.data.expiresAtUtc)}
              </Typography>
              <Typography>
                <strong>Updated:</strong> {formatAdminDate(job.data.updatedAtUtc)}
              </Typography>
            </Grid>
          </Grid>
          <Typography sx={{ overflowWrap: 'anywhere' }}>
            <strong>Private application URL:</strong> {job.data.applicationUrl}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};
