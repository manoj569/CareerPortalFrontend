import { Grid, Stack } from '@mui/material';

import {
  useGetApplicationsQuery,
  useGetMembershipsQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
  useGetSavedJobsQuery,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
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
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Grid container spacing={{ xs: 2, lg: 3 }} alignItems="center">
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardPageHeader
            description="Here's what's happening with your career today."
            title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
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
