import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Alert, Box, Button, Chip, Grid, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildApplicationDetailsPath } from '@/constants/routes';
import {
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import type { ProfileCompletionStep } from '@/features/dashboard/types/dashboardModels';
import { isSectionCompleted, isSectionMissing, matchesSection, profileSteps, recommendedStep } from '@/features/dashboard/utils/profileCompletion';

const profileStepActions: Record<ProfileCompletionStep, { label: string; path: string }> = {
  BasicDetails: { label: 'Add basic details', path: `${ROUTES.PORTFOLIO}?tab=profile&action=basic-details` },
  Skills: { label: 'Add skills', path: `${ROUTES.PORTFOLIO}?tab=profile&action=basic-details` },
  CareerPreferences: { label: 'Add career preferences', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-career-preferences` },
  Education: { label: 'Add education', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-education` },
  Employment: { label: 'Add employment', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-employment` },
  Resume: { label: 'Upload resume', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-resume` },
  ProfileSummary: { label: 'Add profile summary', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-about` },
};

export const DashboardPage = () => {
  useDocumentMetadata(
    'Candidate dashboard | Career Portal',
    'Review your profile, saved jobs, applications, memberships, and notifications.',
  );

  const profile = useGetProfileQuery();
  const completion = useGetProfileCompletionQuery();
  const savedJobs = useGetSavedJobsQuery({ pageNumber: 1, pageSize: 3 });
  const applications = useGetApplicationsQuery({ pageNumber: 1, pageSize: 5 });
  const memberships = useGetMembershipsQuery();
  const notifications = useGetNotificationsQuery({ pageNumber: 1, pageSize: 5 });
  const isInitialLoading =
    profile.isLoading ||
    completion.isLoading ||
    savedJobs.isLoading ||
    applications.isLoading ||
    memberships.isLoading ||
    notifications.isLoading;
  const hasCompleteFailure =
    profile.isError &&
    completion.isError &&
    savedJobs.isError &&
    applications.isError &&
    memberships.isError &&
    notifications.isError;
  const activeMemberships =
    memberships.data?.filter((membership) => isMembershipActive(membership)).length ?? 0;
  const retryDashboard = () => {
    void profile.refetch();
    void completion.refetch();
    void savedJobs.refetch();
    void applications.refetch();
    void memberships.refetch();
    void notifications.refetch();
  };

  if (isInitialLoading) {
    return <PageLoadingIndicator label="Loading candidate dashboard" />;
  }

  if (hasCompleteFailure) return <ErrorState headingLevel="h1" onRetry={retryDashboard} />;

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        actions={
          <Button component={Link} to={ROUTES.PORTFOLIO} variant="outlined">
            Edit profile
          </Button>
        }
        description="A live view of your career activity and account access."
        eyebrow="Candidate workspace"
        title={`Welcome${profile.data?.firstName ? `, ${profile.data.firstName}` : ''}`}
      />

      {profile.isError ||
      completion.isError ||
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

      {completion.data && !completion.isError ? (
        <Paper component="section" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Typography component="h2" variant="h3">
                Profile completion
              </Typography>
              <Typography fontWeight={700}>{completion.data.completionPercentage}%</Typography>
            </Stack>
            <Stack component="ol" direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 1, sm: 1.5 }} sx={{ listStyle: 'none', m: 0, overflowX: { sm: 'auto' }, p: 0 }}>
              {profileSteps.map((step) => {
                const completed = isSectionCompleted(completion.data, step.value);
                const current = Boolean(completion.data.nextRecommendedIncompleteStep && matchesSection(completion.data.nextRecommendedIncompleteStep, step.value));
                return <Stack alignItems="center" aria-label={`${step.label}: ${completed ? 'completed' : current ? 'recommended next step' : 'incomplete'}`} component="li" direction="row" key={step.value} spacing={0.75} sx={{ color: completed ? 'success.main' : current ? 'primary.main' : 'text.disabled', flex: { sm: 1 }, minWidth: { sm: 120 } }}>{completed ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}<Typography color={completed ? 'success.dark' : current ? 'primary.main' : 'text.secondary'} fontWeight={current ? 800 : 600} variant="caption">{step.label}</Typography></Stack>;
              })}
            </Stack>
            {recommendedStep(completion.data) ? <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}><Typography color="text.secondary" variant="body2">Next recommended step: {recommendedStep(completion.data)?.label}</Typography><Button component={Link} sx={{ minHeight: 44 }} to={profileStepActions[recommendedStep(completion.data)!.value].path} variant="contained">Continue profile</Button></Stack> : <Typography color="success.main" fontWeight={700} variant="body2">Your profile is complete.</Typography>}
            {completion.data.missingSections.length ? <Stack spacing={1.25}><Typography component="h3" variant="h4">What is left to complete?</Typography>{profileSteps.filter((step) => isSectionMissing(completion.data, step.value)).map((step) => <Box key={step.value} sx={{ alignItems: 'center', display: 'grid', gap: 1, gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', minWidth: 0 }}><Typography color="text.secondary" sx={{ minWidth: 0 }} variant="body2">{step.label}</Typography><Button component={Link} sx={{ justifySelf: 'end', minHeight: 44, minWidth: 0, textAlign: 'right', whiteSpace: 'normal' }} to={profileStepActions[step.value].path}>{profileStepActions[step.value].label}</Button></Box>)}</Stack> : null}
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
                      to={buildApplicationDetailsPath(application.id)}
                    >
                      {application.jobTitle}
                    </MuiLink>
                    <Typography color="text.secondary" variant="body2">
                      {application.companyName} ·{' '}
                      {formatDashboardDate(application.submittedAtUtc) ?? 'Date unavailable'}
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
                    <Typography fontWeight={700}>{membership.planName}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {membership.endsAtUtc
                        ? `Expires ${formatDashboardDate(membership.endsAtUtc) ?? 'date unavailable'}`
                        : 'Expiry date unavailable'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  You do not currently have an active Candidate membership.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
