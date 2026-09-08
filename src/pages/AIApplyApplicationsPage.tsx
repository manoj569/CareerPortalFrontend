/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { ROUTES } from '@/constants/routes';
import { AIApplyApplicationCard } from '@/features/aiApply/components/AIApplyApplicationCard';
import { AIApplySectionNavigation } from '@/features/aiApply/components/AIApplySectionNavigation';
import { AIApplyStatusChip } from '@/features/aiApply/components/AIApplyStatusChip';
import { useGetAIApplyApplicationsQuery } from '@/features/aiApply/api/aiApplyApi';
import { AIApplyRunStatus } from '@/features/aiApply/types/aiApplyModels';

type Filter = 'all' | 'submitted' | 'progress' | 'attention' | 'failed' | 'cancelled';
const matches = (status: AIApplyRunStatus, filter: Filter) => filter === 'all' || (filter === 'submitted' && status === AIApplyRunStatus.Submitted) || (filter === 'progress' && [AIApplyRunStatus.Queued, AIApplyRunStatus.Processing].includes(status)) || (filter === 'attention' && [AIApplyRunStatus.WaitingForUser, AIApplyRunStatus.NeedsReview].includes(status)) || (filter === 'failed' && [AIApplyRunStatus.Failed, AIApplyRunStatus.DeadLettered, AIApplyRunStatus.Expired].includes(status)) || (filter === 'cancelled' && status === AIApplyRunStatus.Cancelled);
const queryFor = (days: number) => ({ fromUtc: new Date(Date.now() - days * 86400000).toISOString(), toUtc: new Date().toISOString() });

export const AIApplyApplicationsPage = () => {
  const [days, setDays] = useState(30); const [filter, setFilter] = useState<Filter>('all'); const query = useGetAIApplyApplicationsQuery(queryFor(days));
  if (query.isLoading) return <LoadingIndicator label="Loading AI Apply applications…" />; if (query.isError) return <ErrorState title="Applications could not be loaded" onRetry={query.refetch} />;
  const items = (query.data ?? []).filter((x) => matches(x.status, filter));
  return <Stack spacing={3} sx={{ maxWidth: 1150, mx: 'auto', pb: 6 }}><Box><Typography component="h1" variant="h3">Application History</Typography><Typography color="text.secondary">Actual AI Apply activity for your selected period.</Typography></Box><AIApplySectionNavigation /><Stack direction={{ xs: 'column', sm: 'row' }} gap={2}><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={filter} onChange={(e) => setFilter(e.target.value)}><MenuItem value="all">All</MenuItem><MenuItem value="submitted">Submitted</MenuItem><MenuItem value="progress">In progress</MenuItem><MenuItem value="attention">Needs attention</MenuItem><MenuItem value="failed">Could not complete</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem></Select></FormControl><FormControl fullWidth><InputLabel>Date range</InputLabel><Select label="Date range" value={days} onChange={(e) => setDays(Number(e.target.value))}><MenuItem value={1}>Today</MenuItem><MenuItem value={7}>Last 7 days</MenuItem><MenuItem value={30}>Last 30 days</MenuItem></Select></FormControl></Stack>{items.length ? <><Box sx={{ display: { xs: 'none', md: 'block' } }}>{items.map((item) => <Card key={item.id} variant="outlined" sx={{ mb: 1 }}><CardContent><Grid container alignItems="center" spacing={2}><Grid size={4}><Typography fontWeight={700}>Application {item.jobId.slice(0, 8)}</Typography><Typography variant="body2">Job reference {item.jobId}</Typography></Grid><Grid size={2}><AIApplyStatusChip status={item.status} /></Grid><Grid size={4}><Typography>{new Date(item.scheduledAtUtc).toLocaleString()}</Typography></Grid><Grid size={2}><Button component={Link} to={`${ROUTES.AI_APPLY_APPLICATIONS}/${item.id}`}>View details</Button></Grid></Grid></CardContent></Card>)}</Box><Stack sx={{ display: { xs: 'flex', md: 'none' } }} spacing={2}>{items.map((item) => <AIApplyApplicationCard key={item.id} application={item} />)}</Stack></> : <Alert severity="info">No applications yet. Once AI Apply starts processing suitable jobs, your application activity will appear here.</Alert>}</Stack>;
};
