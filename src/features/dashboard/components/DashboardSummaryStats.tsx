import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { Grid, Paper, Skeleton } from '@mui/material';
import { useMemo } from 'react';

import { useGetMyInterviewContributionsQuery } from '@/features/interviewInsights/api/interviewInsightsApi';
import { useGetReferrerInboxQuery } from '@/features/referrals/api/marketplaceApi';
import { requestStatus } from '@/features/referrals/types/marketplaceModels';

import { DashboardStatCard } from './DashboardStatCard';

interface DashboardSummaryStatsProps {
  savedJobsCount: number | undefined;
  savedJobsLoading: boolean;
  savedJobsError: boolean;
  applicationsCount: number | undefined;
  applicationsLoading: boolean;
  applicationsError: boolean;
}

const statValue = (value: number | undefined, isLoading: boolean, isError: boolean) => {
  if (isLoading) return <Skeleton aria-label="Loading count" width={36} />;
  return isError || value === undefined ? '—' : value;
};

export const DashboardSummaryStats = ({
  savedJobsCount,
  savedJobsLoading,
  savedJobsError,
  applicationsCount,
  applicationsLoading,
  applicationsError,
}: DashboardSummaryStatsProps) => {
  const inbox = useGetReferrerInboxQuery();
  const contributions = useGetMyInterviewContributionsQuery();
  const pendingReferrals = useMemo(
    () => inbox.data?.filter((record) => requestStatus(record.request.status) === 'Requested').length,
    [inbox.data],
  );

  return (
    <Paper variant="outlined" role="group" aria-label="Career activity statistics" sx={{ borderRadius: 3, borderColor: '#dce5f5', boxShadow: '0 3px 12px rgba(37, 76, 145, 0.07)', px: { xs: 0.5, sm: 1 }, py: { xs: 0.5, sm: 1 } }}>
    <Grid container>
      <Grid size={{ xs: 6, md: 3 }} sx={{ borderRight: { xs: 'none', md: '1px solid #e4eaf5' }, borderBottom: { xs: '1px solid #e4eaf5', md: 'none' } }}>
        <DashboardStatCard icon={<BookmarkBorderRoundedIcon />} label="Saved jobs" value={statValue(savedJobsCount, savedJobsLoading, savedJobsError)} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }} sx={{ borderBottom: { xs: '1px solid #e4eaf5', md: 'none' } }}>
        <DashboardStatCard icon={<DescriptionOutlinedIcon />} label="Applied jobs" value={statValue(applicationsCount, applicationsLoading, applicationsError)} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }} sx={{ borderRight: { xs: 'none', md: '1px solid #e4eaf5' } }}>
        <DashboardStatCard icon={<GroupsOutlinedIcon />} label="Pending referrals" value={statValue(pendingReferrals, inbox.isLoading, inbox.isError)} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DashboardStatCard icon={<InsightsOutlinedIcon />} label="Insights published" value={statValue(contributions.data?.insightsPublished, contributions.isLoading, contributions.isError)} />
      </Grid>
    </Grid>
    </Paper>
  );
};
