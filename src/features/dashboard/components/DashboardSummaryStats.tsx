import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { Grid, Skeleton } from '@mui/material';
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
    <Grid container spacing={1.25} role="group" aria-label="Career activity statistics">
      <Grid size={{ xs: 6, md: 3 }}>
        <DashboardStatCard icon={<BookmarkBorderRoundedIcon />} label="Saved jobs" value={statValue(savedJobsCount, savedJobsLoading, savedJobsError)} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DashboardStatCard icon={<DescriptionOutlinedIcon />} label="Applied jobs" value={statValue(applicationsCount, applicationsLoading, applicationsError)} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DashboardStatCard icon={<GroupsOutlinedIcon />} label="Pending referrals" value={statValue(pendingReferrals, inbox.isLoading, inbox.isError)} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <DashboardStatCard icon={<InsightsOutlinedIcon />} label="Insights published" value={statValue(contributions.data?.insightsPublished, contributions.isLoading, contributions.isError)} />
      </Grid>
    </Grid>
  );
};
