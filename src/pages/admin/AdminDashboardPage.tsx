import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { Alert, Box, Button, Chip, Grid, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAdminJobEditPath } from '@/constants/routes';
import {
  useGetAdminChartsQuery,
  useGetAdminJobsQuery,
  useGetAdminRecentPaymentsQuery,
  useGetAdminRecentUsersQuery,
  useGetAdminStatisticsQuery,
} from '@/features/admin/api/adminApi';
import { AdminJobStatusBadge } from '@/features/admin/components/AdminStatusBadge';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { formatPaymentAmount } from '@/features/payments/utils/paymentFormatting';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminDashboardPage = () => {
  useDocumentMetadata(
    'Administration overview | Career Portal',
    'Review backend-reported Career Portal administration metrics.',
  );
  const statistics = useGetAdminStatisticsQuery();
  const recentUsers = useGetAdminRecentUsersQuery(5);
  const recentPayments = useGetAdminRecentPaymentsQuery(5);
  const charts = useGetAdminChartsQuery({ distributionLimit: 6 });
  const recentJobs = useGetAdminJobsQuery({
    isDeleted: false,
    pageNumber: 1,
    pageSize: 5,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  const queries = [statistics, recentUsers, recentPayments, charts, recentJobs];
  const isInitialLoading = queries.some((query) => query.isLoading);
  const hasCompleteFailure = queries.every((query) => query.isError);
  const hasPartialFailure = queries.some((query) => query.isError);
  const retryAll = () => {
    void statistics.refetch();
    void recentUsers.refetch();
    void recentPayments.refetch();
    void charts.refetch();
    void recentJobs.refetch();
  };

  if (isInitialLoading) {
    return <PageLoadingIndicator label="Loading admin overview" />;
  }

  if (hasCompleteFailure) {
    return <ErrorState headingLevel="h1" onRetry={retryAll} title="Admin overview unavailable" />;
  }

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        actions={
          <Button
            component={Link}
            startIcon={<AddOutlinedIcon />}
            to={ROUTES.ADMIN_JOB_CREATE}
            variant="contained"
          >
            Create job
          </Button>
        }
        description="Live operational information returned by the administrator reporting APIs."
        eyebrow="Administration"
        title="Overview"
      />

      {hasPartialFailure ? (
        <Alert
          action={
            <Button color="inherit" onClick={retryAll} size="small">
              Retry
            </Button>
          }
          severity="warning"
        >
          Some administrator reporting data could not be loaded.
        </Alert>
      ) : null}

      {statistics.data ? (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<GroupsOutlinedIcon />}
                label="Total users"
                value={statistics.data.totalUsers}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<PaidOutlinedIcon />}
                label="Paid users"
                value={statistics.data.paidUsers}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<WorkOutlineIcon />}
                label="Total jobs"
                value={statistics.data.totalJobs}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<WorkOutlineIcon />}
                label="Published jobs"
                value={statistics.data.publishedJobs}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<StarOutlineIcon />}
                label="Featured jobs"
                value={statistics.data.featuredJobs}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<WorkOutlineIcon />}
                label="Expired jobs"
                value={statistics.data.expiredJobs}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<CategoryOutlinedIcon />}
                label="Categories"
                value={statistics.data.totalCategories}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <DashboardStatCard
                icon={<BusinessOutlinedIcon />}
                label="Companies"
                value={statistics.data.totalCompanies}
              />
            </Grid>
          </Grid>

          {statistics.data.revenue.length ? (
            <Paper component="section" sx={{ p: 3 }}>
              <Typography component="h2" sx={{ mb: 2 }} variant="h3">
                Verified revenue
              </Typography>
              <Grid container spacing={2}>
                {statistics.data.revenue.map((revenue) => (
                  <Grid key={revenue.currencyCode} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {revenue.currencyCode}
                      </Typography>
                      <Typography fontWeight={800} variant="h2">
                        {formatPaymentAmount(revenue.total, revenue.currencyCode)}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {formatPaymentAmount(revenue.thisMonth, revenue.currencyCode)} this month
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ) : null}
        </>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper component="section" sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Typography component="h2" variant="h3">
                  Recent jobs
                </Typography>
                <MuiLink component={Link} to={ROUTES.ADMIN_JOBS}>
                  Manage jobs
                </MuiLink>
              </Stack>
              {recentJobs.data?.items.length ? (
                recentJobs.data.items.map((job) => (
                  <Stack
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    key={job.id}
                    spacing={1}
                    sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}
                  >
                    <Box minWidth={0}>
                      <MuiLink component={Link} fontWeight={700} to={buildAdminJobEditPath(job.id)}>
                        {job.title}
                      </MuiLink>
                      <Typography color="text.secondary" variant="body2">
                        {job.companyName} · {formatAdminDate(job.createdAtUtc)}
                      </Typography>
                    </Box>
                    <AdminJobStatusBadge status={job.status} />
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary">No jobs were returned.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper component="section" sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h3">
                Active job distribution
              </Typography>
              {charts.data?.categories.length ? (
                charts.data.categories.map((category) => (
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    key={category.id}
                    spacing={1}
                  >
                    <Typography>{category.label}</Typography>
                    <Chip label={category.value} size="small" />
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary">
                  No category distribution was returned.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper component="section" sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h3">
                Recent users
              </Typography>
              {recentUsers.data?.length ? (
                recentUsers.data.map((user) => (
                  <Box key={user.id}>
                    <Typography fontWeight={700}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ overflowWrap: 'anywhere' }}
                      variant="body2"
                    >
                      {user.email} · Joined {formatAdminDate(user.createdAtUtc)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No recent users were returned.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper component="section" sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h3">
                Recent payments
              </Typography>
              {recentPayments.data?.length ? (
                recentPayments.data.map((payment) => (
                  <Box key={payment.id}>
                    <Typography fontWeight={700}>
                      {formatPaymentAmount(payment.amount, payment.currencyCode)}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ overflowWrap: 'anywhere' }}
                      variant="body2"
                    >
                      {payment.userName} · {payment.id}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No recent payments were returned.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="info">
        Application totals and status breakdowns are not displayed because the backend exposes no
        administrator applications endpoint.
      </Alert>
    </Stack>
  );
};
