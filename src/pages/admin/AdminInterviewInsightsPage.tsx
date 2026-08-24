import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  isAdminApiError,
  useGetAdminInsightReportsQuery,
  useGetAdminInterviewInsightsQuery,
  useModerateAdminInsightReportMutation,
  useModerateAdminInterviewInsightMutation,
} from '@/features/admin/api/adminApi';
import type { AdminInsightReportResponse } from '@/features/admin/types/adminInterviewInsightModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { formatLabels, roundLabels } from '@/features/interviewInsights/interviewInsightOptions';
import {
  InsightReportStatus,
  InterviewInsightStatus,
  type InterviewInsightResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 20;
type WorkspaceTab = InterviewInsightStatus | 'Reported';
const insightTabs: Array<{ label: string; value: WorkspaceTab }> = [
  { label: 'Pending review', value: InterviewInsightStatus.PendingReview },
  { label: 'Published', value: InterviewInsightStatus.Published },
  { label: 'Rejected', value: InterviewInsightStatus.Rejected },
  { label: 'Hidden', value: InterviewInsightStatus.Hidden },
  { label: 'Reported', value: 'Reported' },
];
const monthYear = (month: number, year: number) =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
const errorMessage = (error: unknown) =>
  isAdminApiError(error) ? error.message : 'The moderation workspace is temporarily unavailable.';

export const AdminInterviewInsightsPage = () => {
  useDocumentMetadata('Interview insight moderation | Career Portal', 'Review candidate interview insights and reports.');
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab');
  const tab = (insightTabs.some((item) => item.value === rawTab)
    ? rawTab
    : InterviewInsightStatus.PendingReview) as WorkspaceTab;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const reportStatus = (Object.values(InsightReportStatus) as string[]).includes(params.get('reportStatus') ?? '')
    ? (params.get('reportStatus') as InsightReportStatus)
    : InsightReportStatus.Open;
  const insights = useGetAdminInterviewInsightsQuery(
    { pageNumber: page, pageSize: PAGE_SIZE, status: tab === 'Reported' ? undefined : tab },
    { skip: tab === 'Reported' },
  );
  const reports = useGetAdminInsightReportsQuery(
    { pageNumber: page, pageSize: PAGE_SIZE, status: reportStatus },
    { skip: tab !== 'Reported' },
  );
  const [selected, setSelected] = useState<InterviewInsightResponse | null>(null);
  const [moderation, setModeration] = useState<InterviewInsightStatus.Published | InterviewInsightStatus.Rejected | InterviewInsightStatus.Hidden>();
  const [reason, setReason] = useState('');
  const [reportTarget, setReportTarget] = useState<AdminInsightReportResponse | null>(null);
  const [reportAction, setReportAction] = useState<InsightReportStatus.Reviewed | InsightReportStatus.Actioned | InsightReportStatus.Dismissed>();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [moderateInsight, insightMutation] = useModerateAdminInterviewInsightMutation();
  const [moderateReport, reportMutation] = useModerateAdminInsightReportMutation();
  const setQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };
  const confirmModeration = async () => {
    if (!selected || !moderation) return;
    if (moderation !== InterviewInsightStatus.Published && !reason.trim()) {
      setActionError('A reviewer reason is required.');
      return;
    }
    try {
      const updated = await moderateInsight({
        id: selected.id,
        request: { reason: reason.trim() || null, status: moderation },
      }).unwrap();
      setSelected(updated);
      setNotice(`Insight moderation status: ${updated.status}.`);
      setModeration(undefined);
      setReason('');
    } catch (error) {
      setActionError(errorMessage(error));
    }
  };
  const confirmReport = async () => {
    if (!reportTarget || !reportAction) return;
    try {
      const updated = await moderateReport({ id: reportTarget.id, request: { status: reportAction } }).unwrap();
      setNotice(`Report status: ${updated.status}.`);
      setReportTarget(null);
      setReportAction(undefined);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  };
  const openAction = (item: InterviewInsightResponse, status: typeof moderation) => {
    setSelected(item);
    setModeration(status);
    setReason('');
    setActionError(null);
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader eyebrow="Administration" title="Interview insights" description="Review candidate submissions and handle candidate reports without exposing private account or schedule data." />
      {notice ? <Alert onClose={() => setNotice(null)} severity="success">{notice}</Alert> : null}
      <Tabs aria-label="Interview insight moderation queues" onChange={(_, value: WorkspaceTab) => setQuery({ page: null, reportStatus: value === 'Reported' ? InsightReportStatus.Open : null, tab: value === InterviewInsightStatus.PendingReview ? null : value })} value={tab} variant="scrollable">
        {insightTabs.map((item) => <Tab key={item.value} label={item.label} value={item.value} />)}
      </Tabs>

      {tab === 'Reported' ? (
        <Stack spacing={2}>
          <FormControl sx={{ maxWidth: 260 }}>
            <InputLabel id="report-status-filter">Report status</InputLabel>
            <Select label="Report status" labelId="report-status-filter" onChange={(event) => setQuery({ page: null, reportStatus: event.target.value })} value={reportStatus}>
              {Object.values(InsightReportStatus).map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </Select>
          </FormControl>
          {reports.isLoading ? <Skeleton aria-label="Loading insight reports" height={280} role="status" variant="rounded" /> : reports.isError ? <ErrorState description={errorMessage(reports.error)} onRetry={() => void reports.refetch()} title="Reports unavailable" /> : reports.data?.items.length ? (
            <>
              <TableContainer component={Paper}><Table aria-label="Interview insight reports"><TableHead><TableRow><TableCell>Reported</TableCell><TableCell>Reason</TableCell><TableCell>Insight</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>
                {reports.data.items.map((report) => <TableRow key={report.id}><TableCell>{new Date(report.createdAtUtc).toLocaleDateString()}</TableCell><TableCell>{report.reason}{report.details ? <Typography color="text.secondary" variant="body2">{report.details}</Typography> : null}</TableCell><TableCell>{report.insightId}</TableCell><TableCell><Chip label={report.status} size="small" /></TableCell><TableCell align="right"><Stack direction="row" justifyContent="flex-end" gap={1}>{([InsightReportStatus.Reviewed, InsightReportStatus.Dismissed, InsightReportStatus.Actioned] as const).map((status) => <Button color={status === InsightReportStatus.Actioned ? 'error' : 'primary'} key={status} onClick={() => { setReportTarget(report); setReportAction(status); setActionError(null); }} size="small">{status}</Button>)}</Stack></TableCell></TableRow>)}
              </TableBody></Table></TableContainer>
              {reports.data.totalPages > 1 ? <Pagination count={reports.data.totalPages} onChange={(_, value) => setQuery({ page: String(value) })} page={page} /> : null}
            </>
          ) : <EmptyState title="No reports found" description="No reports match this backend status." />}
        </Stack>
      ) : insights.isLoading ? (
        <Stack aria-label="Loading interview insight moderation queue" role="status" spacing={1}>{[1,2,3,4].map((item) => <Skeleton height={78} key={item} variant="rounded" />)}</Stack>
      ) : insights.isError ? (
        <ErrorState description={errorMessage(insights.error)} onRetry={() => void insights.refetch()} title="Moderation queue unavailable" />
      ) : insights.data?.items.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}><Table aria-label="Interview insight moderation queue"><TableHead><TableRow><TableCell>Company and role</TableCell><TableCell>Interview</TableCell><TableCell>Difficulty</TableCell><TableCell>Format</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>
            {insights.data.items.map((item) => <TableRow key={item.id}><TableCell><Typography fontWeight={700}>{item.companyName}</Typography><Typography color="text.secondary">{item.roleTitle}</Typography></TableCell><TableCell>{monthYear(item.interviewMonth, item.interviewYear)}</TableCell><TableCell>{item.overallDifficulty}</TableCell><TableCell>{item.interviewFormat ? formatLabels[item.interviewFormat] : 'Not specified'}</TableCell><TableCell><Chip label={item.status} size="small" /></TableCell><TableCell align="right"><Button onClick={() => setSelected(item)}>Review</Button></TableCell></TableRow>)}
          </TableBody></Table></TableContainer>
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>{insights.data.items.map((item) => <Card key={item.id}><CardContent><Typography component="h2" variant="h3">{item.companyName}</Typography><Typography>{item.roleTitle}</Typography><Typography color="text.secondary">{monthYear(item.interviewMonth, item.interviewYear)} · {item.status}</Typography><Button onClick={() => setSelected(item)} sx={{ mt: 1 }}>Review</Button></CardContent></Card>)}</Stack>
          {insights.data.totalPages > 1 ? <Pagination count={insights.data.totalPages} onChange={(_, value) => setQuery({ page: String(value) })} page={page} sx={{ alignSelf: 'center' }} /> : null}
        </>
      ) : <EmptyState title={`No ${insightTabs.find((item) => item.value === tab)?.label.toLowerCase()} insights`} description="There are no candidate insights in this moderation status." />}

      <Drawer anchor="right" onClose={() => setSelected(null)} open={Boolean(selected)} PaperProps={{ sx: { maxWidth: 720, p: { xs: 2, sm: 3 }, width: '100%' } }}>
        {selected ? <Stack spacing={2.5}>
          <Stack alignItems="center" direction="row" justifyContent="space-between"><Typography component="h2" variant="h2">Review insight</Typography><Tooltip title="Close review"><IconButton aria-label="Close insight review" onClick={() => setSelected(null)}><CloseIcon /></IconButton></Tooltip></Stack>
          <Box><Typography color="primary" fontWeight={700}>{selected.companyName}</Typography><Typography variant="h3">{selected.roleTitle}</Typography><Typography color="text.secondary">{monthYear(selected.interviewMonth, selected.interviewYear)}</Typography></Box>
          <Stack direction="row" flexWrap="wrap" gap={1}><Chip label={selected.overallDifficulty} /><Chip label={`${selected.roundCount} rounds`} />{selected.outcome ? <Chip label={selected.outcome} /> : null}{selected.interviewFormat ? <Chip label={formatLabels[selected.interviewFormat]} /> : null}<Chip label={selected.isAnonymous ? 'Posted anonymously' : 'Named submission'} /><Chip label={`${selected.helpfulConfirmedCount} helpful`} /></Stack>
          <Paper sx={{ p: 2 }}><Typography component="h3" variant="h3">Process summary</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{selected.processSummary}</Typography></Paper>
          <Stack spacing={1.5}>{selected.rounds.map((round) => <Paper key={round.id} sx={{ p: 2 }}><Typography fontWeight={700}>{round.sequence}. {round.roundTitle || roundLabels[round.roundType]}</Typography><Typography color="text.secondary" variant="body2">{roundLabels[round.roundType]}{round.durationMinutes ? ` · ${round.durationMinutes} minutes` : ''}</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{round.questionsOrTopics}</Typography>{round.candidateAdvice ? <Typography color="text.secondary" sx={{ mt: 1 }}><strong>Candidate tip:</strong> {round.candidateAdvice}</Typography> : null}</Paper>)}</Stack>
          {selected.preparationTips ? <Paper sx={{ p: 2 }}><Typography component="h3" variant="h3">Preparation tips</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{selected.preparationTips}</Typography></Paper> : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}><Button disabled={insightMutation.isLoading} onClick={() => openAction(selected, InterviewInsightStatus.Published)} variant="contained">Publish</Button><Button disabled={insightMutation.isLoading} onClick={() => openAction(selected, InterviewInsightStatus.Rejected)} variant="outlined">Reject / request changes</Button>{selected.status === InterviewInsightStatus.Published ? <Button color="error" disabled={insightMutation.isLoading} onClick={() => openAction(selected, InterviewInsightStatus.Hidden)}>Hide</Button> : null}</Stack>
        </Stack> : null}
      </Drawer>

      <Dialog onClose={insightMutation.isLoading ? undefined : () => setModeration(undefined)} open={Boolean(moderation)}><DialogTitle>Confirm moderation action</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>{actionError ? <Alert severity="error">{actionError}</Alert> : null}<Typography>Set this insight to {moderation}?</Typography>{moderation !== InterviewInsightStatus.Published ? <TextField autoFocus label="Reviewer reason" multiline minRows={3} onChange={(event) => setReason(event.target.value)} required value={reason} /> : null}</Stack></DialogContent><DialogActions><Button disabled={insightMutation.isLoading} onClick={() => setModeration(undefined)}>Cancel</Button><Button color={moderation === InterviewInsightStatus.Published ? 'primary' : 'error'} disabled={insightMutation.isLoading} onClick={() => void confirmModeration()} variant="contained">{insightMutation.isLoading ? 'Saving…' : 'Confirm'}</Button></DialogActions></Dialog>
      <Dialog onClose={reportMutation.isLoading ? undefined : () => setReportTarget(null)} open={Boolean(reportTarget)}><DialogTitle>Confirm report action</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>{actionError ? <Alert severity="error">{actionError}</Alert> : null}<Typography>{reportAction === InsightReportStatus.Actioned ? 'Actioning this report will automatically hide the related insight.' : `Set this report to ${reportAction}?`}</Typography></Stack></DialogContent><DialogActions><Button disabled={reportMutation.isLoading} onClick={() => setReportTarget(null)}>Cancel</Button><Button color={reportAction === InsightReportStatus.Actioned ? 'error' : 'primary'} disabled={reportMutation.isLoading} onClick={() => void confirmReport()} variant="contained">{reportMutation.isLoading ? 'Saving…' : 'Confirm'}</Button></DialogActions></Dialog>
    </Stack>
  );
};
