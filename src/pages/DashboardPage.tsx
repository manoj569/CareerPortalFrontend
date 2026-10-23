import { Grid, Stack, Typography } from '@mui/material';

import {
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardProfileProgress } from '@/features/dashboard/components/DashboardProfileProgress';
import { DashboardQuickActions } from '@/features/dashboard/components/DashboardQuickActions';
import { DashboardRecentAndMembership } from '@/features/dashboard/components/DashboardRecentAndMembership';
import { DashboardSummaryStats } from '@/features/dashboard/components/DashboardSummaryStats';
import { HiringOpportunitiesSection } from '@/features/jobPromotions/HiringOpportunitiesSection';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const DashboardPage = () => {
  useDocumentMetadata(
    'Candidate dashboard | Career Harbor',
    'Explore opportunities, improve your profile, and grow your career with Career Harbor.',
  );

  const currentUser = useAppSelector(selectCurrentUser);
  const profile = useGetProfileQuery();
  const completion = useGetProfileCompletionQuery();
  const savedJobs = useGetSavedJobsQuery({ pageNumber: 1, pageSize: 3 });
  const applications = useGetApplicationsQuery({ pageNumber: 1, pageSize: 5 });
  const memberships = useGetMembershipsQuery();
  const firstName = profile.data?.firstName?.trim() || currentUser?.firstName?.trim();

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
      <Grid container spacing={{ xs: 2, lg: 2.5 }} alignItems="center">
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={0.15} sx={{ px: { xs: 0, sm: 1 } }}>
            <Typography color="text.secondary" variant="body2">Welcome back,</Typography>
            <Typography component="h1" variant="h3" fontWeight={850} sx={{ letterSpacing: '-.035em', lineHeight: 1.12, fontSize: { xs: 'clamp(2.15rem, 9vw, 3rem)', md: '3rem' }, overflowWrap: 'anywhere' }}>{firstName ? `${firstName} 👋` : 'Welcome back'}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 600, overflowWrap: 'anywhere' }}>Explore top opportunities, track your progress and grow your career with CareerHarbor.</Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DashboardSummaryStats
            savedJobsCount={savedJobs.data?.totalCount}
            savedJobsLoading={savedJobs.isLoading}
            savedJobsError={savedJobs.isError}
            applicationsCount={applications.data?.totalCount}
            applicationsLoading={applications.isLoading}
            applicationsError={applications.isError}
          />
        </Grid>
      </Grid>

      <HiringOpportunitiesSection />
      <DashboardQuickActions />
      <DashboardProfileProgress
        completion={completion.data}
        isLoading={completion.isLoading}
        isError={completion.isError}
        onRetry={() => void completion.refetch()}
      />
      <DashboardRecentAndMembership
        applications={applications.data}
        applicationsLoading={applications.isLoading}
        applicationsError={applications.isError}
        onRetryApplications={() => void applications.refetch()}
        memberships={memberships.data}
        membershipsLoading={memberships.isLoading}
        membershipsError={memberships.isError}
        onRetryMemberships={() => void memberships.refetch()}
      />
    </Stack>
  );
};
