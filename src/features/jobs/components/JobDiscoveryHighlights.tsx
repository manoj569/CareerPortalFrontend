import { Box, Button, Grid, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';

import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import {
  useGetFeaturedJobsQuery,
  useGetLatestJobsQuery,
  useGetNewestJobsQuery,
} from '../api/jobsApi';
import type { PublicJobSummary } from '../types/jobModels';
import { JobCard } from './JobCard';

interface JobDiscoveryHighlightsProps {
  enabled: boolean;
}

interface DiscoveryPanelProps {
  hidden: boolean;
  isError: boolean;
  isLoading: boolean;
  jobs: PublicJobSummary[];
  onRetry: () => void;
  panelId: string;
  tabId: string;
}

const DiscoveryPanel = ({
  hidden,
  isError,
  isLoading,
  jobs,
  onRetry,
  panelId,
  tabId,
}: DiscoveryPanelProps) => (
  <Box aria-labelledby={tabId} hidden={hidden} id={panelId} role="tabpanel" sx={{ pt: 3 }}>
    {isLoading ? (
      <Grid aria-label="Loading job highlights" container role="status" spacing={2.5}>
        {Array.from({ length: 3 }, (_, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <Skeleton height={260} variant="rounded" />
          </Grid>
        ))}
      </Grid>
    ) : null}

    {isError ? (
      <Stack alignItems="flex-start" spacing={1.5}>
        <Typography color="text.secondary">
          These job highlights are temporarily unavailable.
        </Typography>
        <Button onClick={onRetry} variant="outlined">
          Retry highlights
        </Button>
      </Stack>
    ) : null}

    {!isLoading && !isError && jobs.length === 0 ? (
      <Typography color="text.secondary">No jobs are available in this collection yet.</Typography>
    ) : null}

    {!isLoading && !isError && jobs.length > 0 ? (
      <Grid container spacing={2.5}>
        {jobs.map((job) => (
          <Grid key={job.id} size={{ xs: 12, md: 4 }}>
            <JobCard
              job={job}
              secondaryAction={<SaveJobButton jobId={job.id} jobTitle={job.title} />}
            />
          </Grid>
        ))}
      </Grid>
    ) : null}
  </Box>
);

export const JobDiscoveryHighlights = ({ enabled }: JobDiscoveryHighlightsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const featured = useGetFeaturedJobsQuery({ pageSize: 3 }, { skip: !enabled });
  const latest = useGetLatestJobsQuery({ pageSize: 3 }, { skip: !enabled });
  const newest = useGetNewestJobsQuery({ pageSize: 3 }, { skip: !enabled });
  const collections = [
    { label: 'Featured', result: featured },
    { label: 'Latest published', result: latest },
    { label: 'Newest added', result: newest },
  ];

  if (!enabled) return null;

  return (
    <Box aria-labelledby="job-discovery-heading" component="section">
      <Typography component="h2" id="job-discovery-heading" variant="h2">
        Discover jobs
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75 }}>
        Explore highlighted, recently published, and newly added opportunities.
      </Typography>
      <Tabs
        aria-label="Job discovery collections"
        onChange={(_, value: number) => setActiveTab(value)}
        sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}
        value={activeTab}
        variant="scrollable"
      >
        {collections.map((collection, index) => (
          <Tab
            aria-controls={`job-discovery-panel-${index}`}
            id={`job-discovery-tab-${index}`}
            key={collection.label}
            label={collection.label}
          />
        ))}
      </Tabs>
      {collections.map((collection, index) => (
        <DiscoveryPanel
          hidden={activeTab !== index}
          isError={collection.result.isError}
          isLoading={collection.result.isLoading}
          jobs={collection.result.data?.items ?? []}
          key={collection.label}
          onRetry={() => void collection.result.refetch()}
          panelId={`job-discovery-panel-${index}`}
          tabId={`job-discovery-tab-${index}`}
        />
      ))}
    </Box>
  );
};
