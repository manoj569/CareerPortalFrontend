import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAIApplyQuestionDetailsPath } from '@/constants/routes';
import { useGetAIApplyAccessQuery, useGetAIApplyApplicationsQuery, useGetAIApplyDashboardQuery, useGetAIApplyQuestionsQuery, useGetAIApplySettingsQuery } from '@/features/aiApply/api/aiApplyApi';
import { AIApplyApplicationCard } from '@/features/aiApply/components/AIApplyApplicationCard';
import { AIApplyHandoffCard } from '@/features/aiApply/components/AIApplyHandoffCard';
import { AIApplyQuestionStatus } from '@/features/aiApply/types/aiApplyModels';
import { isHandoffAttention } from '@/features/aiApply/utils/aiApplyActions';

const range = (days: number) => ({ fromUtc: new Date(Date.now() - days * 86_400_000).toISOString(), toUtc: new Date().toISOString() });
const Loading = ({ label }: { label: string }) => <Stack aria-label={label} role="status" spacing={2}><Typography sx={{ position: 'absolute', height: 1, overflow: 'hidden', width: 1 }}>Loading…</Typography><Skeleton height={100} /><Skeleton height={160} /><Skeleton height={260} /></Stack>;
const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: number }) => <Grid size={{ xs: 6, md: 3 }}><Card sx={{ height: '100%' }} variant="outlined"><CardContent sx={{ p: { xs: 2, sm: 2.5 } }}><Box color="primary.main">{icon}</Box><Typography component="p" fontWeight={850} sx={{ mt: 1 }} variant="h3">{value}</Typography><Typography color="text.secondary" variant="body2">{label}</Typography></CardContent></Card></Grid>;

export const AIApplyDashboardPage = () => {
  const access = useGetAIApplyAccessQuery();
  const entitled = Boolean(access.data?.canUseAIApply);
  const settings = useGetAIApplySettingsQuery(undefined, { skip: !entitled });
  const dashboard = useGetAIApplyDashboardQuery(undefined, { skip: !entitled });
  const applications = useGetAIApplyApplicationsQuery(range(30), { skip: !entitled });
  const questions = useGetAIApplyQuestionsQuery(AIApplyQuestionStatus.Pending, { pollingInterval: entitled ? 30_000 : 0, skip: !entitled, skipPollingIfUnfocused: true });

  if (access.isLoading) return <Loading label="Loading AI Apply" />;
  if (access.isError) {
    const status = access.error && typeof access.error === 'object' && 'status' in access.error ? Number(access.error.status) : undefined;
    if (status !== 403) return <ErrorState onRetry={() => void access.refetch()} title="AI Apply unavailable" />;
  }
  if (!entitled) return <Stack spacing={3} sx={{ maxWidth: 760 }}><Box><Typography component="h1" variant="h1">AI Apply</Typography><Typography color="text.secondary">Let Career Harbor help with suitable job applications.</Typography></Box><Alert severity="info"><Typography fontWeight={800}>AI Apply requires an active AI Apply plan</Typography><Typography variant="body2">Your manual application tools remain available.</Typography></Alert><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><Button component={Link} to={ROUTES.DASHBOARD_JOBS} variant="outlined">Continue manually</Button><Button component={Link} to={ROUTES.MEMBERSHIP} variant="contained">View membership plans</Button></Stack></Stack>;
  if (dashboard.isLoading || applications.isLoading || questions.isLoading || settings.isLoading) return <Loading label="Loading AI Apply dashboard" />;
  if (dashboard.isError || !dashboard.data) return <ErrorState onRetry={() => void dashboard.refetch()} title="AI Apply dashboard unavailable" />;

  const recent = (applications.data ?? []).slice(0, 4);
  const handoffs = (applications.data ?? []).filter(isHandoffAttention);
  const pendingQuestions = questions.data ?? [];
  const planName = access.data?.canUseAIApplyPro ? 'AI Apply Pro' : 'AI Apply';
  const data = dashboard.data;
  const inProgress = Math.max(0, data.totalApplications - data.submittedApplications - data.failedApplications - data.waitingApplications);

  return <Stack spacing={3.5} sx={{ maxWidth: 1180, mx: 'auto', pb: 5, width: '100%' }}>
    <Stack alignItems={{ sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Typography component="h1" variant="h1">AI Apply</Typography><Typography color="text.secondary">Track automated applications and respond when Career Harbor needs you.</Typography></Box><Stack alignItems={{ sm: 'flex-end' }}><Chip color={settings.data?.paused ? 'warning' : 'success'} label={settings.data?.paused ? 'Paused' : 'Active'} /><Typography color="text.secondary" variant="body2">{planName}</Typography></Stack></Stack>
    {settings.data?.paused ? <Alert severity="warning">AI Apply is paused. Open setup only when you want to resume or change preferences.</Alert> : null}
    <Grid container spacing={2}><Metric icon={<TaskAltOutlinedIcon />} label="Submitted" value={data.submittedApplications} /><Metric icon={<HourglassTopOutlinedIcon />} label="In progress" value={inProgress} /><Metric icon={<ErrorOutlineOutlinedIcon />} label="Needs attention" value={data.applicationsRequiringUserInput} /><Metric icon={<ErrorOutlineOutlinedIcon />} label="Needs review / failed" value={data.failedApplications} /></Grid>
    <Card variant="outlined"><CardContent sx={{ p: { xs: 2.25, sm: 3 } }}><Stack spacing={2}><Typography component="h2" variant="h3">Needs your attention</Typography>{questions.isError || applications.isError ? <Alert severity="error">Attention items could not be loaded.</Alert> : handoffs.length || pendingQuestions.length ? <Stack spacing={1.5}>{handoffs.slice(0, 3).map((application) => <AIApplyHandoffCard application={application} key={application.id} />)}{pendingQuestions.slice(0, 3).map((question) => <Box key={question.id} sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}><Typography fontWeight={800}>Career Harbor needs your help</Typography><Typography sx={{ my: 0.75 }}>{question.question}</Typography><Button component={Link} to={buildAIApplyQuestionDetailsPath(question.id)} variant="contained">Answer &amp; continue</Button></Box>)}</Stack> : <Alert severity="success">Nothing needs your attention right now.</Alert>}</Stack></CardContent></Card>
    <Box><Stack alignItems="center" direction="row" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}><Typography component="h2" variant="h3">Recent applications</Typography><Button component={Link} to={ROUTES.AI_APPLY_APPLICATIONS}>View application history</Button></Stack>{applications.isError ? <Alert severity="error">Recent applications could not be loaded.</Alert> : recent.length ? <Grid container spacing={2}>{recent.map((application) => <Grid key={application.id} size={{ xs: 12, md: 6 }}><AIApplyApplicationCard application={application} /></Grid>)}</Grid> : <Alert severity="info">No AI Apply applications yet. Start from a matching job when you are ready.</Alert>}</Box>
    <Button component={Link} startIcon={<AutoAwesomeOutlinedIcon />} sx={{ alignSelf: { sm: 'flex-start' }, minHeight: 44 }} to={`${ROUTES.DASHBOARD_JOBS}?mode=recommended`} variant="contained">Find matching jobs</Button>
  </Stack>;
};
