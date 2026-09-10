import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildAIApplyQuestionDetailsPath, ROUTES } from '@/constants/routes';
import { useGetAIApplyApplicationsQuery, useGetAIApplyQuestionsQuery } from '@/features/aiApply/api/aiApplyApi';
import { AIApplyHandoffCard } from '@/features/aiApply/components/AIApplyHandoffCard';
import { AIApplySectionNavigation } from '@/features/aiApply/components/AIApplySectionNavigation';
import { AIApplyQuestionStatus } from '@/features/aiApply/types/aiApplyModels';
import { getAIApplyAttentionPriority, isHandoffAttention } from '@/features/aiApply/utils/aiApplyActions';

export const AIApplyQuestionsPage = () => {
  const query = useGetAIApplyQuestionsQuery(AIApplyQuestionStatus.Pending, { pollingInterval: 30000, skipPollingIfUnfocused: true });
  const applications = useGetAIApplyApplicationsQuery({ fromUtc: new Date(Date.now() - 30 * 86400000).toISOString(), toUtc: new Date().toISOString() }, { pollingInterval: 30000, skipPollingIfUnfocused: true });
  const handoffs = [...(applications.data ?? [])].filter(isHandoffAttention).sort((a, b) => getAIApplyAttentionPriority(a) - getAIApplyAttentionPriority(b));
  return <Stack spacing={3} sx={{ maxWidth: 1000, mx: 'auto', pb: 6 }}>
    <Box><Typography component="h1" variant="h3">Needs your attention</Typography><Typography color="text.secondary">Some applications need information or confirmation before Career Harbor can continue.</Typography></Box>
    <AIApplySectionNavigation />
    {query.isLoading || applications.isLoading ? <PageLoadingIndicator label="Loading…" /> : query.isError || applications.isError ? <ErrorState title="We couldn't load your attention items" onRetry={() => { void query.refetch(); void applications.refetch(); }} /> : handoffs.length || query.data?.length ? <Stack spacing={2}>{handoffs.map((item) => <AIApplyHandoffCard key={item.id} application={item} />)}<Grid container spacing={2}>{(query.data ?? []).map((item) => <Grid key={item.id} size={{ xs: 12, md: 6 }}><Card variant="outlined" sx={{ height: '100%' }}><CardContent><Stack spacing={2}><Stack direction="row" justifyContent="space-between" gap={1}><Chip color="warning" label="Question needs answer" size="small" /><Typography variant="caption" color="text.secondary">Application {item.applicationId.slice(0, 8)}</Typography></Stack><Typography variant="h6">{item.question}</Typography><Typography variant="body2" color="text.secondary">Question type: {item.questionType}</Typography>{item.suggestedAnswer && <Alert severity="info">Suggested answer available</Alert>}<Button component={Link} to={buildAIApplyQuestionDetailsPath(item.id)} variant="contained">Answer</Button></Stack></CardContent></Card></Grid>)}</Grid></Stack> : <Alert severity="success" action={<Button component={Link} to={ROUTES.AI_APPLY_APPLICATIONS}>View applications</Button>}><Typography fontWeight={700}>You're all caught up</Typography>No applications need your input right now.</Alert>}
    <Typography aria-live="polite" variant="caption" color="text.secondary">Pending questions refresh automatically while this page is open.</Typography>
  </Stack>;
};
