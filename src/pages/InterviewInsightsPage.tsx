import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildInterviewInsightsPath, ROUTES } from '@/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  isInterviewInsightsApiError,
  useGetInterviewInsightQuery,
  useGetInterviewInsightsQuery,
  useGetInterviewSchedulesQuery,
  useGetMyInterviewContributionsQuery,
  useUpdateInterviewScheduleMutation,
} from '@/features/interviewInsights/api/interviewInsightsApi';
import {
  InsightFeedbackDialog,
  InterviewScheduleDialog,
  ReportInsightDialog,
  ShareInterviewInsightDialog,
} from '@/features/interviewInsights/components/InterviewInsightDialogs';
import {
  InterviewScheduleStatus,
  type InterviewDifficulty,
  type InterviewInsightStatus,
  type InterviewInsightResponse,
  type InterviewOutcome,
  type InterviewRoundType,
  type InterviewScheduleResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';
import { useGetJobFilterOptionsQuery } from '@/features/jobs/api/jobsApi';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 12;
type PageView = 'insights' | 'schedules' | 'contributions';

const difficultyLabel = (value: InterviewDifficulty): string =>
  ({ 1: 'Easy', 2: 'Moderate', 3: 'Hard' })[value] ?? 'Not specified';
const outcomeLabel = (value: InterviewOutcome | null): string | null =>
  value
    ? ({ 1: 'Awaiting', 2: 'Rejected', 3: 'Selected', 4: 'Withdrawn', 5: 'Prefer not to say' }[
        value
      ] ?? null)
    : null;
const statusLabel = (value: InterviewInsightStatus): string =>
  ({ 1: 'Pending review', 2: 'Published', 3: 'Rejected', 4: 'Hidden' })[value] ?? 'Unknown';
const scheduleStatusLabel = (value: InterviewScheduleStatus): string =>
  ({ 1: 'Scheduled', 2: 'Interview completed', 3: 'Cancelled' })[value] ?? 'Unknown';
const roundTypeLabel = (value: InterviewRoundType): string =>
  ({
    1: 'HR',
    2: 'Technical',
    3: 'Managerial',
    4: 'Coding',
    5: 'Aptitude',
    6: 'Group discussion',
    7: 'Other',
  })[value] ?? 'Other';

const formatMonthYear = (month: number, year: number): string =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );

const readError = (error: unknown): string =>
  isInterviewInsightsApiError(error)
    ? error.message
    : 'Interview Insights are temporarily unavailable.';

interface InsightCardProps {
  insight: InterviewInsightResponse;
  onOpen: (id: string) => void;
  onReport: (id: string) => void;
}

const InsightCard = ({ insight, onOpen, onReport }: InsightCardProps) => (
  <Paper component="article" sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}>
    <Stack height="100%" spacing={2}>
      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1}>
        <Box minWidth={0}>
          <Typography component="h2" sx={{ overflowWrap: 'anywhere' }} variant="h3">
            {insight.roleTitle}
          </Typography>
          <Typography color="text.secondary">{insight.companyName}</Typography>
        </Box>
        <Chip
          color={insight.canReadFull ? 'success' : 'default'}
          icon={insight.canReadFull ? undefined : <LockOutlinedIcon />}
          label={insight.canReadFull ? 'Full access' : 'Locked'}
          size="small"
        />
        <Chip label={statusLabel(insight.status)} size="small" variant="outlined" />
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Chip
          label={formatMonthYear(insight.interviewMonth, insight.interviewYear)}
          size="small"
          variant="outlined"
        />
        <Chip label={difficultyLabel(insight.overallDifficulty)} size="small" variant="outlined" />
        {outcomeLabel(insight.outcome) ? (
          <Chip label={outcomeLabel(insight.outcome)} size="small" variant="outlined" />
        ) : null}
        <Chip
          label={`${insight.roundCount} round${insight.roundCount === 1 ? '' : 's'}`}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Typography
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
        }}
      >
        {insight.processSummary}
      </Typography>
      <Typography variant="body2">
        Shared by{' '}
        {insight.isAnonymous ? 'Anonymous candidate' : insight.authorDisplayName || 'Candidate'} ·{' '}
        {insight.helpfulConfirmedCount} helpful confirmation
        {insight.helpfulConfirmedCount === 1 ? '' : 's'}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ mt: 'auto' }}>
        <Button onClick={() => onOpen(insight.id)} variant="contained">
          View insight
        </Button>
        <Button
          onClick={() => onReport(insight.id)}
          startIcon={<FlagOutlinedIcon />}
          variant="text"
        >
          Report
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

interface DetailDialogProps {
  id: string | null;
  onClose: () => void;
  onFeedback: (insight: InterviewInsightResponse) => void;
}

const InsightDetailDialog = ({ id, onClose, onFeedback }: DetailDialogProps) => {
  const { data, error, isFetching, refetch } = useGetInterviewInsightQuery(id ?? '', { skip: !id });
  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={Boolean(id)}>
      <DialogTitle>Interview insight</DialogTitle>
      <DialogContent>
        {isFetching && !data ? (
          <Stack alignItems="center" role="status" spacing={1} sx={{ py: 5 }}>
            <Skeleton height={36} width="70%" />
            <Skeleton height={160} variant="rounded" width="100%" />
            <Typography>Loading interview insight…</Typography>
          </Stack>
        ) : null}
        {error && !data ? (
          <ErrorState
            description={readError(error)}
            onRetry={() => void refetch()}
            title="Could not load this insight"
          />
        ) : null}
        {data ? (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography component="h2" variant="h2">
                {data.roleTitle}
              </Typography>
              <Typography color="text.secondary">
                {data.companyName} · {formatMonthYear(data.interviewMonth, data.interviewYear)}
              </Typography>
            </Box>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip label={difficultyLabel(data.overallDifficulty)} />
              <Chip label={`${data.roundCount} rounds`} />
              <Chip label={statusLabel(data.status)} />
            </Stack>
            <Box>
              <Typography component="h3" variant="h3">
                Process summary
              </Typography>
              <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{data.processSummary}</Typography>
            </Box>
            {!data.canReadFull ? (
              <Alert icon={<LockOutlinedIcon />} severity="info">
                <Typography fontWeight={700}>Full interview details are locked</Typography>
                <Typography variant="body2">
                  Apply to a job at this company or add a non-cancelled interview schedule to unlock
                  round details and preparation content.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ mt: 2 }}>
              <Button
                component={Link}
                onClick={onClose}
                to={buildInterviewInsightsPath({
                  action: 'schedule',
                  companyId: data.companyId,
                  companyName: data.companyName,
                })}
                variant="contained"
                  >
                    Add interview schedule
                  </Button>
                  <Button
                    component={Link}
                    to={`${ROUTES.DASHBOARD_JOBS}?companyName=${encodeURIComponent(data.companyName)}`}
                    variant="outlined"
                  >
                    Apply to a job at this company
                  </Button>
                </Stack>
              </Alert>
            ) : (
              <>
                <Box>
                  <Typography component="h3" variant="h3">
                    Interview rounds
                  </Typography>
                  <Stack divider={<Divider flexItem />} spacing={2} sx={{ mt: 1.5 }}>
                    {data.rounds.map((round) => (
                      <Box key={round.id}>
                        <Typography fontWeight={700}>
                          {round.sequence}. {round.roundTitle || roundTypeLabel(round.roundType)}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {roundTypeLabel(round.roundType)}
                          {round.durationMinutes ? ` · ${round.durationMinutes} minutes` : ''}
                        </Typography>
                        <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                          {round.questionsOrTopics}
                        </Typography>
                        {round.candidateAdvice ? (
                          <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                            <strong>Candidate advice:</strong> {round.candidateAdvice}
                          </Typography>
                        ) : null}
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography component="h3" variant="h3">
                    Preparation tips
                  </Typography>
                  <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                    {data.preparationTips}
                  </Typography>
                </Box>
                {data.canGiveFeedback ? (
                  <Button
                    onClick={() => onFeedback(data)}
                    sx={{ alignSelf: 'flex-start' }}
                    variant="outlined"
                  >
                    Did this insight help you?
                  </Button>
                ) : null}
              </>
            )}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export const InterviewInsightsPage = () => {
  useDocumentMetadata(
    'Interview insights | Career Harbor',
    'Review candidate interview experiences, manage private schedules, and share safe interview insights.',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (
    ['insights', 'schedules', 'contributions'].includes(searchParams.get('view') ?? '')
      ? searchParams.get('view')
      : 'insights'
  ) as PageView;
  const page = Math.max(1, Number(searchParams.get('pageNumber')) || 1);
  const companyId = searchParams.get('companyId') ?? '';
  const role = searchParams.get('role') ?? '';
  const sort = searchParams.get('sort') === 'newest' ? 'newest' : 'mostHelpful';
  const [roleDraft, setRoleDraft] = useState(role);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [feedbackInsight, setFeedbackInsight] = useState<InterviewInsightResponse | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(searchParams.get('action') === 'schedule');
  const [editingSchedule, setEditingSchedule] = useState<InterviewScheduleResponse | undefined>();
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setRoleDraft(role), [role]);
  useEffect(() => {
    if (searchParams.get('action') === 'schedule') setScheduleOpen(true);
  }, [searchParams]);

  const filterOptions = useGetJobFilterOptionsQuery({
    pageNumber: 1,
    pageSize: 1,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
  });
  const companies = useMemo(() => filterOptions.data?.companies ?? [], [filterOptions.data]);
  const availableCompanies = useMemo(() => {
    const linkedCompanyId = searchParams.get('companyId');
    const linkedCompanyName = searchParams.get('companyName');
    if (
      !linkedCompanyId ||
      !linkedCompanyName ||
      companies.some((item) => item.id === linkedCompanyId)
    ) {
      return companies;
    }
    return [{ count: 0, id: linkedCompanyId, name: linkedCompanyName }, ...companies];
  }, [companies, searchParams]);
  const insights = useGetInterviewInsightsQuery(
    {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      sort,
      ...(companyId ? { companyId } : {}),
      ...(role ? { role } : {}),
    },
    { skip: view !== 'insights' },
  );
  const schedules = useGetInterviewSchedulesQuery();
  const contributions = useGetMyInterviewContributionsQuery(undefined, {
    skip: view !== 'contributions',
  });
  const [updateSchedule, updateScheduleState] = useUpdateInterviewScheduleMutation();

  const matchingFeedbackSchedules = useMemo(
    () =>
      schedules.data?.filter(
        (schedule) =>
          schedule.companyId === feedbackInsight?.companyId &&
          schedule.feedbackAvailable &&
          schedule.status !== InterviewScheduleStatus.Cancelled,
      ) ?? [],
    [feedbackInsight?.companyId, schedules.data],
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    setSearchParams(next, { replace: true });
  };

  const openSchedule = (schedule?: InterviewScheduleResponse) => {
    setEditingSchedule(schedule);
    setScheduleOpen(true);
  };
  const closeSchedule = () => {
    setScheduleOpen(false);
    setEditingSchedule(undefined);
    updateParams({ action: null, companyId: searchParams.get('companyId') });
  };
  const cancelSchedule = async (schedule: InterviewScheduleResponse) => {
    try {
      await updateSchedule({
        id: schedule.id,
        data: {
          interviewAtUtc: schedule.interviewAtUtc,
          roleTitle: schedule.roleTitle,
          status: InterviewScheduleStatus.Cancelled,
        },
      }).unwrap();
    } catch (error: unknown) {
      setNotice(readError(error));
    }
  };

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="Learn from safe candidate experiences, keep private interview schedules, and help others prepare."
        eyebrow="Career preparation"
        title="Interview insights"
      />
      {notice ? (
        <Alert
          onClose={() => setNotice(null)}
          severity={notice.includes('pending') ? 'success' : 'info'}
        >
          {notice}
        </Alert>
      ) : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
        <Button
          onClick={() => setShareOpen(true)}
          startIcon={<QuestionAnswerOutlinedIcon />}
          variant="contained"
        >
          Share an interview insight
        </Button>
        <Button
          onClick={() => openSchedule()}
          startIcon={<CalendarMonthOutlinedIcon />}
          variant="outlined"
        >
          Add interview schedule
        </Button>
      </Stack>
      <Tabs
        aria-label="Interview insights sections"
        onChange={(_, value: PageView) =>
          updateParams({ pageNumber: null, view: value === 'insights' ? null : value })
        }
        scrollButtons="auto"
        value={view}
        variant="scrollable"
      >
        <Tab label="Explore insights" value="insights" />
        <Tab label="Interview schedules" value="schedules" />
        <Tab label="My contributions" value="contributions" />
      </Tabs>

      {view === 'insights' ? (
        <Stack spacing={3}>
          <Paper
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              updateParams({ pageNumber: null, role: roleDraft.trim() || null });
            }}
            sx={{ p: 2.5 }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="insight-filter-company-label">Company</InputLabel>
                  <Select
                    label="Company"
                    labelId="insight-filter-company-label"
                    onChange={(event) =>
                      updateParams({ companyId: event.target.value || null, pageNumber: null })
                    }
                    value={companyId}
                  >
                    <MenuItem value="">All companies</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Role"
                  onChange={(event) => setRoleDraft(event.target.value)}
                  placeholder="e.g. Software Engineer"
                  value={roleDraft}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="insight-sort-label">Sort</InputLabel>
                  <Select
                    label="Sort"
                    labelId="insight-sort-label"
                    onChange={(event) =>
                      updateParams({
                        pageNumber: null,
                        sort: event.target.value === 'newest' ? 'newest' : null,
                      })
                    }
                    value={sort}
                  >
                    <MenuItem value="mostHelpful">Most helpful</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid alignItems="stretch" display="flex" size={{ xs: 12, sm: 6, md: 2 }}>
                <Button fullWidth type="submit" variant="outlined">
                  Apply filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
          {insights.isLoading ? (
            <Grid aria-label="Loading interview insights" container role="status" spacing={2}>
              {Array.from({ length: 6 }, (_, index) => (
                <Grid key={index} size={{ xs: 12, md: 6 }}>
                  <Skeleton height={260} variant="rounded" />
                </Grid>
              ))}
            </Grid>
          ) : null}
          {insights.isError && !insights.data ? (
            <ErrorState
              description={readError(insights.error)}
              onRetry={() => void insights.refetch()}
              title="Could not load interview insights"
            />
          ) : null}
          {insights.data?.items.length === 0 ? (
            <EmptyState
              description="Try another company or role, or be the first eligible candidate to share a reviewed experience."
              title="No interview insights found"
            />
          ) : null}
          {insights.data && insights.data.items.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {insights.data.items.map((insight) => (
                  <Grid key={insight.id} size={{ xs: 12, lg: 6 }}>
                    <InsightCard insight={insight} onOpen={setDetailId} onReport={setReportId} />
                  </Grid>
                ))}
              </Grid>
              {insights.data.totalPages > 1 ? (
                <Pagination
                  aria-label="Interview insights pagination"
                  color="primary"
                  count={insights.data.totalPages}
                  onChange={(_, value) =>
                    updateParams({ pageNumber: value === 1 ? null : String(value) })
                  }
                  page={Math.min(page, insights.data.totalPages)}
                  sx={{ alignSelf: 'center' }}
                />
              ) : null}
            </>
          ) : null}
        </Stack>
      ) : null}

      {view === 'schedules' ? (
        <Stack spacing={2}>
          {schedules.isLoading ? (
            <Stack aria-label="Loading interview schedules" role="status" spacing={2}>
              {[1, 2, 3].map((item) => (
                <Skeleton height={140} key={item} variant="rounded" />
              ))}
            </Stack>
          ) : null}
          {schedules.isError && !schedules.data ? (
            <ErrorState
              description={readError(schedules.error)}
              onRetry={() => void schedules.refetch()}
              title="Could not load schedules"
            />
          ) : null}
          {schedules.data?.length === 0 ? (
            <EmptyState
              actionLabel="Add interview schedule"
              description="Private schedules unlock relevant preparation content and post-interview feedback."
              onAction={() => openSchedule()}
              title="No interview schedules"
            />
          ) : null}
          {schedules.data?.map((schedule) => (
            <Paper component="article" key={schedule.id} sx={{ p: 2.5 }}>
              <Stack
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography component="h2" variant="h3">
                    {schedule.roleTitle || 'Interview'}
                  </Typography>
                  <Typography color="text.secondary">
                    {schedule.companyName} · {new Date(schedule.interviewAtUtc).toLocaleString()}
                  </Typography>
                  <Chip
                    color={
                      schedule.status === InterviewScheduleStatus.Cancelled ? 'default' : 'primary'
                    }
                    label={scheduleStatusLabel(schedule.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Stack direction="row" gap={1}>
                  {schedule.status !== InterviewScheduleStatus.Cancelled ? (
                    <>
                      <Tooltip title="Edit schedule">
                        <IconButton
                          aria-label={`Edit interview schedule for ${schedule.companyName}`}
                          onClick={() => openSchedule(schedule)}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        color="error"
                        disabled={updateScheduleState.isLoading}
                        onClick={() => void cancelSchedule(schedule)}
                      >
                        Cancel schedule
                      </Button>
                    </>
                  ) : null}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}

      {view === 'contributions' ? (
        <Stack spacing={3}>
          <Alert severity="info">
            Contribution score is based on eligible candidate feedback—not the number of posts
            submitted.
          </Alert>
          {contributions.isLoading ? <Skeleton height={220} variant="rounded" /> : null}
          {contributions.isError ? (
            <ErrorState
              description={readError(contributions.error)}
              onRetry={() => void contributions.refetch()}
              title="Could not load contributions"
            />
          ) : null}
          {contributions.data ? (
            <Grid container spacing={2}>
              {[
                { label: 'Contribution score', value: contributions.data.contributionScore },
                { label: 'Helpful-confirmed', value: contributions.data.candidatesHelped },
                { label: 'Insights published', value: contributions.data.insightsPublished },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography color="text.secondary">{item.label}</Typography>
                    <Typography component="p" variant="h2">
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              {contributions.data.badges.length ? (
                <Grid size={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography component="h2" variant="h3">
                      Badges
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                      {contributions.data.badges.map((badge) => (
                        <Chip color="secondary" key={badge} label={badge} />
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              ) : null}
            </Grid>
          ) : null}
        </Stack>
      ) : null}

      <InterviewScheduleDialog
        companies={availableCompanies}
        initialCompanyId={searchParams.get('companyId') ?? undefined}
        initialJobId={searchParams.get('jobId') ?? undefined}
        initialRoleTitle={searchParams.get('roleTitle') ?? undefined}
        onClose={closeSchedule}
        open={scheduleOpen}
        schedule={editingSchedule}
      />
      <ShareInterviewInsightDialog
        companies={availableCompanies}
        onClose={() => setShareOpen(false)}
        onSubmitted={() => {
          setShareOpen(false);
          setNotice('Submitted insight is pending administrator review.');
        }}
        open={shareOpen}
      />
      <InsightDetailDialog
        id={detailId}
        onClose={() => setDetailId(null)}
        onFeedback={(insight) => {
          setDetailId(null);
          setFeedbackInsight(insight);
        }}
      />
      {feedbackInsight ? (
        <InsightFeedbackDialog
          insightId={feedbackInsight.id}
          onClose={() => setFeedbackInsight(null)}
          open
          schedules={matchingFeedbackSchedules}
        />
      ) : null}
      {reportId ? (
        <ReportInsightDialog insightId={reportId} onClose={() => setReportId(null)} open />
      ) : null}
    </Stack>
  );
};
