import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildJobDetailsPath } from '@/constants/routes';
import {
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const DashboardPage = () => {
  useDocumentMetadata(
    'Candidate dashboard | Career Portal',
    'Review your profile, saved jobs, applications, memberships, and notifications.',
  );

  const profile = useGetProfileQuery();
  const savedJobs = useGetSavedJobsQuery({ pageNumber: 1, pageSize: 3 });
  const applications = useGetApplicationsQuery({ pageNumber: 1, pageSize: 5 });
  const memberships = useGetMembershipsQuery();
  const notifications = useGetNotificationsQuery({ pageNumber: 1, pageSize: 5 });
  const isInitialLoading =
    profile.isLoading ||
    savedJobs.isLoading ||
    applications.isLoading ||
    memberships.isLoading ||
    notifications.isLoading;
  const hasCompleteFailure =
    profile.isError &&
    savedJobs.isError &&
    applications.isError &&
    memberships.isError &&
    notifications.isError;
  const activeMemberships =
    memberships.data?.filter((membership) => isMembershipActive(membership)).length ?? 0;
  const completedProfileFields = profile.data
    ? [
        profile.data.firstName,
        profile.data.lastName,
        profile.data.phoneNumber,
        profile.data.headline,
        profile.data.bio,
        profile.data.profileImageUrl,
      ].filter(Boolean).length
    : 0;
  const profileCompletion = Math.round((completedProfileFields / 6) * 100);

  const retryDashboard = () => {
    void profile.refetch();
    void savedJobs.refetch();
    void applications.refetch();
    void memberships.refetch();
    void notifications.refetch();
  };

  if (isInitialLoading) {
    return (
      <Stack aria-label="Loading candidate dashboard" role="status" spacing={3}>
        <Skeleton height={76} variant="rounded" />
        <Grid container spacing={2}>
          {Array.from({ length: 4 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton height={104} variant="rounded" />
            </Grid>
          ))}
        </Grid>
        <Skeleton height={280} variant="rounded" />
      </Stack>
    );
  }

  if (hasCompleteFailure) return <ErrorState headingLevel="h1" onRetry={retryDashboard} />;

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        actions={
          <Button component={Link} to={ROUTES.PROFILE} variant="outlined">
            Edit profile
          </Button>
        }
        description="A live view of your career activity and account access."
        eyebrow="Candidate workspace"
        title={`Welcome${profile.data?.firstName ? `, ${profile.data.firstName}` : ''}`}
      />

      {profile.isError ||
      savedJobs.isError ||
      applications.isError ||
      memberships.isError ||
      notifications.isError ? (
        <Alert
          action={
            <Button color="inherit" onClick={retryDashboard} size="small">
              Retry
            </Button>
          }
          severity="warning"
        >
          Some dashboard information could not be loaded.
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            icon={<BookmarkBorderOutlinedIcon />}
            label="Saved jobs"
            value={savedJobs.data?.totalCount ?? '—'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            icon={<DescriptionOutlinedIcon />}
            label="Applications"
            value={applications.data?.totalCount ?? '—'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            icon={<WorkspacePremiumOutlinedIcon />}
            label="Active memberships"
            value={memberships.data ? activeMemberships : '—'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            icon={<NotificationsNoneOutlinedIcon />}
            label="Unread notifications"
            value={notifications.data?.unreadCount ?? '—'}
          />
        </Grid>
      </Grid>

      {profile.data ? (
        <Paper component="section" sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Typography component="h2" variant="h3">
                Profile readiness
              </Typography>
              <Typography fontWeight={700}>{profileCompletion}%</Typography>
            </Stack>
            <LinearProgress
              aria-label={`Profile ${profileCompletion}% complete`}
              value={profileCompletion}
              variant="determinate"
            />
            <Typography color="text.secondary" variant="body2">
              Add your contact details, headline, bio, and profile image URL to complete your
              candidate profile.
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper component="section" sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2.5}>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Typography component="h2" variant="h3">
                  Recent applications
                </Typography>
                <MuiLink component={Link} to={ROUTES.APPLICATIONS}>
                  View all
                </MuiLink>
              </Stack>
              {applications.data?.items.length ? (
                applications.data.items.map((application) => (
                  <Box
                    key={application.id}
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      pb: 2,
                      '&:last-child': { borderBottom: 0, pb: 0 },
                    }}
                  >
                    <MuiLink
                      component={Link}
                      fontWeight={700}
                      to={buildJobDetailsPath(application.jobSlug)}
                    >
                      {application.jobTitle}
                    </MuiLink>
                    <Typography color="text.secondary" variant="body2">
                      {application.companyName} ·{' '}
                      {formatDashboardDate(application.occurredAtUtc) ?? 'Date unavailable'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  No applications have been recorded yet.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper component="section" sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2.5}>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Typography component="h2" variant="h3">
                  Membership access
                </Typography>
                {activeMemberships > 0 ? (
                  <Chip color="success" label={`${activeMemberships} active`} size="small" />
                ) : null}
              </Stack>
              {memberships.data?.length ? (
                memberships.data.map((membership) => (
                  <Box key={membership.id}>
                    <Typography fontWeight={700}>{membership.companyName}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {membership.planName}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  You do not currently have an active company membership.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
