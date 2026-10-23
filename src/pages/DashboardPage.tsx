import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ROUTES, buildApplicationDetailsPath } from '@/constants/routes';
import {
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetNotificationsQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardFeatureCarousel } from '@/features/dashboard/components/DashboardFeatureCarousel';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { HiringOpportunitiesSection } from '@/features/jobPromotions/HiringOpportunitiesSection';
import type { ProfileCompletionStep } from '@/features/dashboard/types/dashboardModels';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import {
  isSectionCompleted,
  isSectionMissing,
  matchesSection,
  profileSteps,
  recommendedStep,
} from '@/features/dashboard/utils/profileCompletion';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const profileStepActions: Record<
  ProfileCompletionStep,
  { label: string; path: string }
> = {
  BasicDetails: {
    label: 'Add basic details',
    path: `${ROUTES.PORTFOLIO}?tab=profile&action=basic-details`,
  },
  Skills: {
    label: 'Add skills',
    path: `${ROUTES.PORTFOLIO}?tab=profile&action=basic-details`,
  },
  CareerPreferences: {
    label: 'Add career preferences',
    path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-career-preferences`,
  },
  Education: {
    label: 'Add education',
    path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-education`,
  },
  Employment: {
    label: 'Add employment',
    path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-employment`,
  },
  Resume: {
    label: 'Upload resume',
    path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-resume`,
  },
  ProfileSummary: {
    label: 'Add profile summary',
    path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-about`,
  },
};

const featureCards = [
  {
    title: 'Find your next opportunity',
    description:
      'Explore jobs that match your skills, experience and career goals.',
    buttonLabel: 'Browse Jobs',
    path: ROUTES.DASHBOARD_JOBS,
    icon: SearchRoundedIcon,
    background:
      'linear-gradient(135deg, #fff7ed 0%, #fff3e6 55%, #ffedd5 100%)',
    borderColor: '#fed7aa',
    iconBackground: '#ffedd5',
    accent: '#c2410c',
  },
  {
    title: 'Refer a job',
    description:
      'Share an open role and help other candidates discover new opportunities.',
    buttonLabel: 'Refer a Job',
    path: ROUTES.REFER_A_JOB,
    icon: BusinessCenterOutlinedIcon,
    background:
      'linear-gradient(135deg, #f0fdf4 0%, #ecfdf3 55%, #dcfce7 100%)',
    borderColor: '#bbf7d0',
    iconBackground: '#dcfce7',
    accent: '#15803d',
  },
  {
    title: 'Learn from industry experts',
    description:
      'Connect with professionals for career planning and interview guidance.',
    buttonLabel: 'Career Guidance',
    path: ROUTES.CAREER_GUIDANCE,
    icon: GroupsOutlinedIcon,
    background:
      'linear-gradient(135deg, #eff6ff 0%, #eef4ff 55%, #e0e7ff 100%)',
    borderColor: '#c7d2fe',
    iconBackground: '#dbeafe',
    accent: '#1d4ed8',
  },
] as const;

export const DashboardPage = () => {
  useDocumentMetadata(
    'Candidate dashboard | Career Harbor',
    'Explore opportunities, improve your profile, and grow your career with Career Harbor.',
  );

  const profile = useGetProfileQuery();
  const completion = useGetProfileCompletionQuery();
  const savedJobs = useGetSavedJobsQuery({ pageNumber: 1, pageSize: 3 });
  const applications = useGetApplicationsQuery({
    pageNumber: 1,
    pageSize: 5,
  });
  const memberships = useGetMembershipsQuery();
  const notifications = useGetNotificationsQuery({
    pageNumber: 1,
    pageSize: 5,
  });

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
    memberships.data?.filter((membership) => isMembershipActive(membership))
      .length ?? 0;

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

  if (hasCompleteFailure) {
    return <ErrorState headingLevel="h1" onRetry={retryDashboard} />;
  }

  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <DashboardPageHeader
        actions={
          <Button
            component={Link}
            sx={{
              borderRadius: 2.5,
              minHeight: 44,
              px: 2.25,
              textTransform: 'none',
            }}
            to={ROUTES.PORTFOLIO}
            variant="outlined"
          >
            Edit profile
          </Button>
        }
        description="Keep going! Explore opportunities, improve your profile and grow your career with Career Harbor."
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

      <DashboardFeatureCarousel />

      <HiringOpportunitiesSection />

      <Box component="section">
  <Stack spacing={2}>
    <Box>
      <Typography component="h2" fontWeight={800} variant="h5">
        Explore Career Harbor
      </Typography>

      <Typography color="text.secondary" variant="body2">
        Useful tools to help you move forward in your career.
      </Typography>
    </Box>

    <Grid container spacing={2}>
      {featureCards.map((feature) => {
        const FeatureIcon = feature.icon;

        return (
          <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                background: feature.background,
                border: '1px solid',
                borderColor: feature.borderColor,
                borderRadius: 3,
                height: '100%',
                minHeight: 190,
                overflow: 'hidden',
                p: { xs: 2.5, md: 3 },
                position: 'relative',
                transition:
                  'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  boxShadow: '0 14px 32px rgba(15,23,42,.08)',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Stack
                alignItems="flex-start"
                direction="row"
                height="100%"
                spacing={2}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: feature.iconBackground,
                    borderRadius: 3,
                    color: feature.accent,
                    display: 'flex',
                    flexShrink: 0,
                    height: 58,
                    justifyContent: 'center',
                    width: 58,
                  }}
                >
                  <FeatureIcon sx={{ fontSize: 29 }} />
                </Box>

                <Stack
                  alignItems="flex-start"
                  height="100%"
                  spacing={1}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Typography
                    component="h3"
                    sx={{
                      color: feature.accent,
                      fontSize: {
                        xs: '1.05rem',
                        lg: '1.1rem',
                      },
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      fontSize: '.875rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>

                  <Button
                    component={Link}
                    endIcon={
                      <Box
                        component="span"
                        sx={{
                          fontSize: '1.1rem',
                          lineHeight: 1,
                        }}
                      >
                        →
                      </Box>
                    }
                    sx={{
                      color: feature.accent,
                      fontWeight: 700,
                      minHeight: 40,
                      px: 0,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                    to={feature.path}
                  >
                    {feature.buttonLabel}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  </Stack>
</Box>

      {completion.data && !completion.isError ? (
        <Paper
          component="section"
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Stack spacing={2.5}>
            <Stack
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography component="h2" fontWeight={800} variant="h5">
                  Profile progress
                </Typography>

                <Typography color="text.secondary" variant="body2">
                  Complete your profile to present a stronger professional
                  profile.
                </Typography>
              </Box>

              <Typography
                color="primary.main"
                fontSize="1.1rem"
                fontWeight={800}
              >
                {completion.data.completionPercentage}%
              </Typography>
            </Stack>

            <Box
              aria-label={`Profile ${completion.data.completionPercentage}% complete`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={completion.data.completionPercentage}
              role="progressbar"
              sx={{
                bgcolor: 'action.hover',
                borderRadius: 999,
                height: 8,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: 999,
                  height: '100%',
                  transition: 'width 300ms ease',
                  width: `${completion.data.completionPercentage}%`,
                }}
              />
            </Box>

            <Stack
              component="ol"
              direction={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1, sm: 1.5 }}
              sx={{
                listStyle: 'none',
                m: 0,
                overflowX: { sm: 'auto' },
                p: 0,
              }}
            >
              {profileSteps.map((step) => {
                const completed = isSectionCompleted(
                  completion.data,
                  step.value,
                );

                const current = Boolean(
                  completion.data.nextRecommendedIncompleteStep &&
                    matchesSection(
                      completion.data.nextRecommendedIncompleteStep,
                      step.value,
                    ),
                );

                return (
                  <Stack
                    alignItems="center"
                    aria-label={`${step.label}: ${
                      completed
                        ? 'completed'
                        : current
                          ? 'recommended next step'
                          : 'incomplete'
                    }`}
                    component="li"
                    direction="row"
                    key={step.value}
                    spacing={0.75}
                    sx={{
                      color: completed
                        ? 'success.main'
                        : current
                          ? 'primary.main'
                          : 'text.disabled',
                      flex: { sm: 1 },
                      minWidth: { sm: 120 },
                    }}
                  >
                    {completed ? (
                      <CheckCircleIcon fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon fontSize="small" />
                    )}

                    <Typography
                      color={
                        completed
                          ? 'success.dark'
                          : current
                            ? 'primary.main'
                            : 'text.secondary'
                      }
                      fontWeight={current ? 800 : 600}
                      variant="caption"
                    >
                      {step.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>

            {recommendedStep(completion.data) ? (
              <Stack
                alignItems={{ xs: 'stretch', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Typography color="text.secondary" variant="body2">
                  Next recommended step:{' '}
                  {recommendedStep(completion.data)?.label}
                </Typography>

                <Button
                  component={Link}
                  sx={{
                    borderRadius: 2.5,
                    minHeight: 44,
                    textTransform: 'none',
                  }}
                  to={
                    profileStepActions[
                      recommendedStep(completion.data)!.value
                    ].path
                  }
                  variant="contained"
                >
                  Continue profile
                </Button>
              </Stack>
            ) : (
              <Typography
                color="success.main"
                fontWeight={700}
                variant="body2"
              >
                Your profile is complete.
              </Typography>
            )}

            {completion.data.missingSections.length ? (
              <Stack spacing={1.25}>
                <Typography component="h3" fontWeight={700} variant="h6">
                  What is left to complete?
                </Typography>

                {profileSteps
                  .filter((step) =>
                    isSectionMissing(completion.data, step.value),
                  )
                  .map((step) => (
                    <Box
                      key={step.value}
                      sx={{
                        alignItems: 'center',
                        display: 'grid',
                        gap: 1,
                        gridTemplateColumns:
                          'minmax(0, 1fr) minmax(0, 1fr)',
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        color="text.secondary"
                        sx={{ minWidth: 0 }}
                        variant="body2"
                      >
                        {step.label}
                      </Typography>

                      <Button
                        component={Link}
                        sx={{
                          justifySelf: 'end',
                          minHeight: 44,
                          minWidth: 0,
                          textAlign: 'right',
                          textTransform: 'none',
                          whiteSpace: 'normal',
                        }}
                        to={profileStepActions[step.value].path}
                      >
                        {profileStepActions[step.value].label}
                      </Button>
                    </Box>
                  ))}
              </Stack>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            component="section"
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              height: '100%',
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack spacing={2.5}>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography component="h2" fontWeight={800} variant="h5">
                  Recent applications
                </Typography>

                <MuiLink
                  component={Link}
                  fontWeight={700}
                  to={ROUTES.APPLICATIONS}
                  underline="hover"
                >
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
                      '&:last-child': {
                        borderBottom: 0,
                        pb: 0,
                      },
                    }}
                  >
                    <MuiLink
                      component={Link}
                      fontWeight={700}
                      to={buildApplicationDetailsPath(application.id)}
                      underline="hover"
                    >
                      {application.jobTitle}
                    </MuiLink>

                    <Typography color="text.secondary" variant="body2">
                      {application.companyName} ·{' '}
                      {formatDashboardDate(application.submittedAtUtc) ??
                        'Date unavailable'}
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
          <Paper
            component="section"
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              height: '100%',
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack spacing={2.5}>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography component="h2" fontWeight={800} variant="h5">
                  Membership access
                </Typography>

                {activeMemberships > 0 ? (
                  <Chip
                    color="success"
                    label={`${activeMemberships} active`}
                    size="small"
                  />
                ) : null}
              </Stack>

              {memberships.data?.length ? (
                memberships.data.map((membership) => (
                  <Box
                    key={membership.id}
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      pb: 1.75,
                      '&:last-child': {
                        borderBottom: 0,
                        pb: 0,
                      },
                    }}
                  >
                    <Typography fontWeight={700}>
                      {membership.planName}
                    </Typography>

                    <Typography color="text.secondary" variant="body2">
                      {membership.endsAtUtc
                        ? `Expires ${
                            formatDashboardDate(membership.endsAtUtc) ??
                            'date unavailable'
                          }`
                        : 'Expiry date unavailable'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Stack spacing={1.5}>
                  <Typography color="text.secondary">
                    You do not currently have an active Candidate membership.
                  </Typography>

                  <Button
                    component={Link}
                    sx={{
                      alignSelf: 'flex-start',
                      textTransform: 'none',
                    }}
                    to={ROUTES.MEMBERSHIP}
                    variant="outlined"
                  >
                    View membership
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
