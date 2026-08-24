import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
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
  InterviewCompanyAutocomplete,
  InterviewScheduleDialog,
  ReportInsightDialog,
  ShareInterviewInsightDialog,
} from '@/features/interviewInsights/components/InterviewInsightDialogs';
import { formatLabels, roundLabels } from '@/features/interviewInsights/interviewInsightOptions';
import {
  InterviewDifficulty,
  InterviewFormat,
  InterviewInsightSort,
  InterviewInsightStatus,
  InterviewOutcome,
  InterviewRoundType,
  InterviewScheduleStatus,
  type InterviewInsightCardResponse,
  type InterviewInsightCompanyResponse,
  type InterviewInsightResponse,
  type InterviewScheduleResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 12;
const featureCard = {
  bgcolor: '#FFFFFF',
  border: '1px solid #E5EAF2',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(16, 42, 86, 0.07)',
};
type PageView = 'insights' | 'schedules' | 'contributions';
type ScheduleView = 'upcoming' | 'completed' | 'cancelled';

const pretty = (value: string): string => value.replace(/([a-z])([A-Z])/g, '$1 $2');
const formatMonthYear = (month: number, year: number): string =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
const readError = (error: unknown): string =>
  isInterviewInsightsApiError(error)
    ? error.message
    : 'Interview Insights are temporarily unavailable.';
const moderationLabel = (status: InterviewInsightStatus): string =>
  ({
    PendingReview: 'Awaiting review',
    Published: 'Published',
    Rejected: 'Needs changes',
    Hidden: 'Hidden',
  })[status];

interface InsightCardProps {
  insight: InterviewInsightCardResponse;
  onOpen: (id: string) => void;
  onReport: (id: string) => void;
}
const InsightCard = ({ insight, onOpen, onReport }: InsightCardProps) => (
  <Paper
    component="article"
    elevation={0}
    sx={{
      ...featureCard,
      height: '100%',
      p: 2.5,
    }}
  >
    <Stack height="100%" spacing={1.5}>
      <Box>
        <Typography color="#155EEF" fontSize={13} fontWeight={800} variant="body2">
          {insight.companyName}
        </Typography>
        <Typography component="h2" sx={{ mt: 0.5, overflowWrap: 'anywhere' }} variant="h3">
          {insight.roleTitle}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {formatMonthYear(insight.interviewMonth, insight.interviewYear)}
        </Typography>
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Chip
          color={insight.difficulty === InterviewDifficulty.Hard ? 'warning' : 'default'}
          label={insight.difficulty}
          size="small"
        />
        <Chip
          label={`${insight.roundCount} round${insight.roundCount === 1 ? '' : 's'}`}
          size="small"
          variant="outlined"
        />
        {insight.interviewFormat ? (
          <Chip label={formatLabels[insight.interviewFormat]} size="small" variant="outlined" />
        ) : null}
        {insight.outcome ? (
          <Chip label={pretty(insight.outcome)} size="small" variant="outlined" />
        ) : null}
      </Stack>
      {insight.roundTypes.length ? (
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {insight.roundTypes.map((item) => (
            <Chip key={item} label={roundLabels[item]} size="small" variant="outlined" />
          ))}
        </Stack>
      ) : null}
      <Typography
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
        }}
      >
        {insight.shortSummary}
      </Typography>
      {insight.topicTags.length ? (
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {insight.topicTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ bgcolor: '#EEF4FF', color: '#102A56', fontWeight: 600 }}
            />
          ))}
        </Stack>
      ) : null}
      <Stack alignItems="center" direction="row" gap={0.75}>
        <ThumbUpAltOutlinedIcon sx={{ color: '#12B76A', fontSize: 18 }} />
        <Typography color="#027A48" fontWeight={700} variant="body2">
          Helped {insight.helpfulConfirmedCount} candidate
          {insight.helpfulConfirmedCount === 1 ? '' : 's'}
        </Typography>
        {insight.isAnonymous ? <Chip label="Anonymous contributor" size="small" /> : null}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ mt: 'auto' }}>
        <Button onClick={() => onOpen(insight.id)} variant="contained">
          Read insight
        </Button>
        <Button onClick={() => onReport(insight.id)} startIcon={<FlagOutlinedIcon />}>
          Report
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

interface DetailProps {
  id: string | null;
  onClose: () => void;
  onFeedback: (value: InterviewInsightResponse) => void;
}
const InsightDetailDialog = ({ id, onClose, onFeedback }: DetailProps) => {
  const query = useGetInterviewInsightQuery(id ?? '', { skip: !id });
  const data = query.data;
  return (
    <Dialog fullWidth maxWidth="lg" onClose={onClose} open={Boolean(id)}>
      <DialogTitle>Interview insight</DialogTitle>
      <DialogContent>
        {query.isFetching && !data ? (
          <Stack aria-label="Loading interview insight" role="status" spacing={1} sx={{ py: 5 }}>
            <Skeleton height={40} />
            <Skeleton height={180} variant="rounded" />
          </Stack>
        ) : null}
        {query.error && !data ? (
          <ErrorState
            description={readError(query.error)}
            onRetry={() => void query.refetch()}
            title="Could not load this insight"
          />
        ) : null}
        {data ? (
          <Stack spacing={2.5} sx={{ bgcolor: '#F4F7FB', mx: -1, p: { xs: 1, md: 2.5 } }}>
            <Box>
              <Typography component="h2" variant="h2">
                {data.roleTitle}
              </Typography>
              <Typography color="text.secondary">
                {data.companyName} · {formatMonthYear(data.interviewMonth, data.interviewYear)}
              </Typography>
            </Box>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip label={data.overallDifficulty} />
              {data.interviewFormat ? <Chip label={formatLabels[data.interviewFormat]} /> : null}
              {data.outcome ? <Chip label={pretty(data.outcome)} /> : null}
            </Stack>
            {!data.canReadFull ? (
              <Alert icon={<LockOutlinedIcon />} severity="info" sx={featureCard}>
                <Typography fontWeight={700}>Full insight is locked</Typography>
                <Typography variant="body2">
                  Add an interview schedule or apply for a role at this company to unlock detailed
                  rounds and preparation topics.
                </Typography>
                <Button
                  component={Link}
                  onClick={onClose}
                  sx={{ mt: 2 }}
                  to={buildInterviewInsightsPath({
                    action: 'schedule',
                    companyId: data.companyId,
                    companyName: data.companyName,
                  })}
                  variant="contained"
                >
                  Add interview schedule
                </Button>
              </Alert>
            ) : (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={2.5}>
                  <Paper elevation={0} sx={{ ...featureCard, p: 2.5 }}>
                  <Typography component="h3" variant="h3">Interview process</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{data.processSummary}</Typography>
                  <Stack spacing={0} sx={{ mt: 2 }}>
                    {data.rounds.map((round, index) => (
                      <Stack direction="row" key={round.id} spacing={2}>
                        <Stack alignItems="center">
                          <Box
                            sx={{
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              color: 'primary.contrastText',
                              display: 'grid',
                              fontWeight: 700,
                              height: 30,
                              placeItems: 'center',
                              width: 30,
                            }}
                          >
                            {round.sequence}
                          </Box>
                          {index < data.rounds.length - 1 ? (
                            <Divider flexItem orientation="vertical" sx={{ minHeight: 60 }} />
                          ) : null}
                        </Stack>
                        <Box sx={{ pb: 3 }}>
                          <Typography fontWeight={700}>
                            {round.roundTitle || roundLabels[round.roundType]}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {roundLabels[round.roundType]}
                            {round.durationMinutes ? ` · ${round.durationMinutes} minutes` : ''}
                          </Typography>
                          <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                            {round.questionsOrTopics}
                          </Typography>
                          {round.candidateAdvice ? (
                            <Typography color="text.secondary" sx={{ mt: 1 }}>
                              <strong>Preparation advice:</strong> {round.candidateAdvice}
                            </Typography>
                          ) : null}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                  </Paper>
                  <Paper elevation={0} sx={{ ...featureCard, p: 2.5 }}>
                    <Typography component="h3" variant="h3">Questions &amp; topics discussed</Typography>
                    <Stack spacing={1.25} sx={{ mt: 2 }}>
                      {data.rounds.map((round) => (
                        <Box key={`topic-${round.id}`} sx={{ bgcolor: '#F4F7FB', borderRadius: 2, p: 1.5 }}>
                          <Typography fontWeight={700}>{roundLabels[round.roundType]}</Typography>
                          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{round.questionsOrTopics}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                {data.preparationTips ? (
                  <Paper elevation={0} sx={{ ...featureCard, p: 2.5 }}>
                    <Typography component="h3" variant="h3">
                      Preparation tips
                    </Typography>
                    <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                      {data.preparationTips}
                    </Typography>
                  </Paper>
                ) : null}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper elevation={0} sx={{ ...featureCard, p: 2.5, position: { md: 'sticky' }, top: 16 }}>
                    <Typography component="h3" variant="h3">Did this insight help your preparation?</Typography>
                {data.canGiveFeedback ? (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {['Helped me', 'Partly helped', 'Not accurate'].map((label) => (
                      <Button key={label} onClick={() => onFeedback(data)} variant={label === 'Helped me' ? 'contained' : 'outlined'}>{label}</Button>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">Feedback is available after an eligible completed interview.</Typography>
                )}
                  </Paper>
                </Grid>
              </Grid>
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

interface MoreFiltersProps {
  onApply: (values: Record<string, string | null>) => void;
  onClose: () => void;
  open: boolean;
  params: URLSearchParams;
}
const MoreFiltersDialog = ({ onApply, onClose, open, params }: MoreFiltersProps) => {
  const [roundType, setRoundType] = useState(params.get('roundType') ?? '');
  const [difficulty, setDifficulty] = useState(params.get('difficulty') ?? '');
  const [level, setLevel] = useState(params.get('experienceLevel') ?? '');
  const [outcome, setOutcome] = useState(params.get('outcome') ?? '');
  const [format, setFormat] = useState(params.get('interviewFormat') ?? '');
  const [recency, setRecency] = useState(params.get('recencyMonths') ?? '');
  const [from, setFrom] = useState(
    params.get('fromYear') && params.get('fromMonth')
      ? `${params.get('fromYear')}-${params.get('fromMonth')?.padStart(2, '0')}`
      : '',
  );
  useEffect(() => {
    if (open) {
      setRoundType(params.get('roundType') ?? '');
      setDifficulty(params.get('difficulty') ?? '');
      setLevel(params.get('experienceLevel') ?? '');
      setOutcome(params.get('outcome') ?? '');
      setFormat(params.get('interviewFormat') ?? '');
      setRecency(params.get('recencyMonths') ?? '');
      setFrom(
        params.get('fromYear') && params.get('fromMonth')
          ? `${params.get('fromYear')}-${params.get('fromMonth')?.padStart(2, '0')}`
          : '',
      );
    }
  }, [open, params]);
  const apply = () => {
    const [year, month] = from.split('-');
    onApply({
      difficulty: difficulty || null,
      experienceLevel: level.trim() || null,
      fromMonth: recency ? null : month || null,
      fromYear: recency ? null : year || null,
      interviewFormat: format || null,
      outcome: outcome || null,
      recencyMonths: from ? null : recency || null,
      roundType: roundType || null,
    });
  };
  return (
    <Dialog
      fullScreen={false}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          alignSelf: { xs: 'flex-end', sm: 'center' },
          borderRadius: { xs: '20px 20px 0 0', sm: 2 },
          m: { xs: 0, sm: 4 },
          width: { xs: '100%', sm: 'calc(100% - 64px)' },
        },
      }}
    >
      <DialogTitle>More filters</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <FormControl>
            <InputLabel id="round-filter">Round type</InputLabel>
            <Select
              label="Round type"
              labelId="round-filter"
              onChange={(e) => setRoundType(e.target.value)}
              value={roundType}
            >
              <MenuItem value="">Any</MenuItem>
              {Object.values(InterviewRoundType).map((item) => (
                <MenuItem key={item} value={item}>
                  {roundLabels[item]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="difficulty-filter">Difficulty</InputLabel>
            <Select
              label="Difficulty"
              labelId="difficulty-filter"
              onChange={(e) => setDifficulty(e.target.value)}
              value={difficulty}
            >
              <MenuItem value="">Any</MenuItem>
              {Object.values(InterviewDifficulty).map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Experience level"
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g. Entry level"
            value={level}
          />
          <FormControl>
            <InputLabel id="outcome-filter">Outcome</InputLabel>
            <Select
              label="Outcome"
              labelId="outcome-filter"
              onChange={(e) => setOutcome(e.target.value)}
              value={outcome}
            >
              <MenuItem value="">Any</MenuItem>
              {Object.values(InterviewOutcome).map((item) => (
                <MenuItem key={item} value={item}>
                  {pretty(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="format-filter">Interview format</InputLabel>
            <Select
              label="Interview format"
              labelId="format-filter"
              onChange={(e) => setFormat(e.target.value)}
              value={format}
            >
              <MenuItem value="">Any</MenuItem>
              {Object.values(InterviewFormat).map((item) => (
                <MenuItem key={item} value={item}>
                  {formatLabels[item]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="recency-filter">Recency</InputLabel>
            <Select
              label="Recency"
              labelId="recency-filter"
              onChange={(e) => {
                setRecency(e.target.value);
                if (e.target.value) setFrom('');
              }}
              value={recency}
            >
              <MenuItem value="">Any time</MenuItem>
              <MenuItem value="3">Last 3 months</MenuItem>
              <MenuItem value="6">Last 6 months</MenuItem>
              <MenuItem value="12">Last 12 months</MenuItem>
              <MenuItem value="24">Last 24 months</MenuItem>
            </Select>
          </FormControl>
          <TextField
            InputLabelProps={{ shrink: true }}
            label="Or from month"
            onChange={(e) => {
              setFrom(e.target.value);
              if (e.target.value) setRecency('');
            }}
            type="month"
            value={from}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={apply} variant="contained">
          Apply filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const InterviewInsightsPage = () => {
  useDocumentMetadata(
    'Interview insights | Career Harbor',
    'Learn from candidate interview experiences, manage private schedules, and share helpful preparation insights.',
  );
  const [params, setParams] = useSearchParams();
  const view = (
    ['insights', 'schedules', 'contributions'].includes(params.get('view') ?? '')
      ? params.get('view')
      : 'insights'
  ) as PageView;
  const page = Math.max(1, Number(params.get('pageNumber')) || 1);
  const [company, setCompany] = useState<InterviewInsightCompanyResponse | null>(
    params.get('companyId')
      ? { id: params.get('companyId')!, companyName: params.get('company') ?? '' }
      : null,
  );
  const [companyText, setCompanyText] = useState(params.get('company') ?? '');
  const [role, setRole] = useState(params.get('role') ?? '');
  const [sort, setSort] = useState<InterviewInsightSort>(
    (Object.values(InterviewInsightSort) as string[]).includes(params.get('sort') ?? '')
      ? (params.get('sort') as InterviewInsightSort)
      : InterviewInsightSort.MostHelpful,
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<InterviewInsightResponse | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(params.get('action') === 'schedule');
  const [editingSchedule, setEditingSchedule] = useState<InterviewScheduleResponse>();
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [scheduleView, setScheduleView] = useState<ScheduleView>('upcoming');
  const [cancelTarget, setCancelTarget] = useState<InterviewScheduleResponse>();
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    setParams(next, { replace: true });
  };
  useEffect(() => {
    if (params.get('action') === 'schedule') setScheduleOpen(true);
  }, [params]);
  const insightQuery = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    sort: (Object.values(InterviewInsightSort) as string[]).includes(params.get('sort') ?? '')
      ? (params.get('sort') as InterviewInsightSort)
      : InterviewInsightSort.MostHelpful,
    ...(params.get('companyId')
      ? { companyId: params.get('companyId')! }
      : params.get('company')
        ? { company: params.get('company')!.trim() }
        : {}),
    ...(params.get('role') ? { role: params.get('role')!.trim() } : {}),
    ...(params.get('roundType')
      ? { roundType: params.get('roundType') as InterviewRoundType }
      : {}),
    ...(params.get('difficulty')
      ? { difficulty: params.get('difficulty') as InterviewDifficulty }
      : {}),
    ...(params.get('experienceLevel')
      ? { experienceLevel: params.get('experienceLevel')!.trim() }
      : {}),
    ...(params.get('outcome') ? { outcome: params.get('outcome') as InterviewOutcome } : {}),
    ...(params.get('interviewFormat')
      ? { interviewFormat: params.get('interviewFormat') as InterviewFormat }
      : {}),
    ...(params.get('recencyMonths') ? { recencyMonths: Number(params.get('recencyMonths')) } : {}),
    ...(params.get('fromMonth') && params.get('fromYear')
      ? { fromMonth: Number(params.get('fromMonth')), fromYear: Number(params.get('fromYear')) }
      : {}),
  };
  const insights = useGetInterviewInsightsQuery(insightQuery, { skip: view !== 'insights' });
  const schedules = useGetInterviewSchedulesQuery();
  const contributions = useGetMyInterviewContributionsQuery(undefined, {
    skip: view !== 'contributions',
  });
  const [updateSchedule, updateState] = useUpdateInterviewScheduleMutation();
  const feedbackSchedules = useMemo(
    () =>
      schedules.data?.filter(
        (item) =>
          item.companyId === feedback?.companyId &&
          item.feedbackAvailable &&
          item.status !== InterviewScheduleStatus.Cancelled,
      ) ?? [],
    [feedback?.companyId, schedules.data],
  );
  const filteredSchedules =
    schedules.data?.filter((item) =>
      scheduleView === 'upcoming'
        ? item.status === InterviewScheduleStatus.Scheduled
        : scheduleView === 'completed'
          ? item.status === InterviewScheduleStatus.InterviewCompleted
          : item.status === InterviewScheduleStatus.Cancelled,
    ) ?? [];
  const applyVisibleFilters = () =>
    updateParams({
      company: companyText.trim() || null,
      companyId: company?.id ?? null,
      pageNumber: null,
      role: role.trim() || null,
      sort: sort === InterviewInsightSort.MostHelpful ? null : sort,
    });
  const clearAll = () => {
    setCompany(null);
    setCompanyText('');
    setRole('');
    setSort(InterviewInsightSort.MostHelpful);
    const next = new URLSearchParams();
    if (view !== 'insights') next.set('view', view);
    setParams(next, { replace: true });
  };
  const linkedCompanyId = params.get('companyId');
  const linkedCompanyName = params.get('companyName') ?? params.get('company');
  const initialCompany = useMemo(
    () =>
      linkedCompanyId
        ? { id: linkedCompanyId, companyName: linkedCompanyName ?? 'Selected company' }
        : undefined,
    [linkedCompanyId, linkedCompanyName],
  );
  const closeSchedule = () => {
    setScheduleOpen(false);
    setEditingSchedule(undefined);
    updateParams({ action: null, companyName: null, jobId: null, roleTitle: null });
  };
  const confirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await updateSchedule({
        id: cancelTarget.id,
        data: {
          approximateTimeOfDay: cancelTarget.approximateTimeOfDay,
          expectedRoundTypes: cancelTarget.expectedRoundTypes,
          interviewAtUtc: cancelTarget.interviewAtUtc,
          interviewFormat: cancelTarget.interviewFormat,
          preparationStatus: cancelTarget.preparationStatus,
          reminderRequested: cancelTarget.reminderRequested,
          roleTitle: cancelTarget.roleTitle,
          status: InterviewScheduleStatus.Cancelled,
        },
      }).unwrap();
      setNotice('Interview schedule cancelled.');
      setCancelTarget(undefined);
    } catch (error) {
      setNotice(readError(error));
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{
        bgcolor: '#F4F7FB',
        color: '#172B4D',
        maxWidth: 1440,
        minHeight: '100%',
        mx: 'auto',
        p: { xs: 2, md: 3 },
        width: '100%',
        '& .MuiButton-containedPrimary': { bgcolor: '#155EEF', '&:hover': { bgcolor: '#0047C1' } },
        '& .MuiPaper-root': { borderRadius: '12px' },
      }}
    >
      <DashboardPageHeader
        description="Learn from candidate experiences, prepare with confidence, and help future candidates."
        eyebrow="CAREER PREPARATION"
        title="Interview insights"
      />
      {notice ? (
        <Alert
          onClose={() => setNotice(null)}
          severity={
            notice.includes('pending review') ||
            notice.includes('reported') ||
            notice.includes('cancelled')
              ? 'success'
              : 'info'
          }
        >
          {notice}
        </Alert>
      ) : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} justifyContent="flex-end">
        <Button
          onClick={() => setShareOpen(true)}
          startIcon={<QuestionAnswerOutlinedIcon />}
          variant="contained"
        >
          Share an interview insight
        </Button>
        <Button
          onClick={() => setScheduleOpen(true)}
          startIcon={<CalendarMonthOutlinedIcon />}
          variant="outlined"
        >
          Add interview schedule
        </Button>
      </Stack>
      <Tabs
        aria-label="Interview insights sections"
        onChange={(_, next: PageView) =>
          updateParams({ pageNumber: null, view: next === 'insights' ? null : next })
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
            elevation={0}
            onSubmit={(event) => {
              event.preventDefault();
              applyVisibleFilters();
            }}
            sx={{ ...featureCard, p: 2 }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <InterviewCompanyAutocomplete
                  label="Search companies, roles, insights…"
                  onChange={(selected) => {
                    setCompany(selected);
                    if (selected) setCompanyText(selected.companyName);
                  }}
                  onInputValueChange={setCompanyText}
                  value={company}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Role"
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="e.g. Software Engineer"
                  value={role}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="sort-label">Sort</InputLabel>
                  <Select
                    label="Sort"
                    labelId="sort-label"
                    onChange={(event) => setSort(event.target.value)}
                    value={sort}
                  >
                    <MenuItem value={InterviewInsightSort.MostHelpful}>Most helpful</MenuItem>
                    <MenuItem value={InterviewInsightSort.Newest}>Newest</MenuItem>
                    <MenuItem value={InterviewInsightSort.MostRounds}>Most rounds</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button fullWidth sx={{ height: '100%' }} type="submit" variant="contained">
                  Apply filters
                </Button>
              </Grid>
              <Grid size={12}>
                <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
                  {[
                    `Round: ${params.get('roundType') ? roundLabels[params.get('roundType') as InterviewRoundType] : 'All rounds'}`,
                    `Difficulty: ${params.get('difficulty') ?? 'Any'}`,
                    `Experience: ${params.get('experienceLevel') ?? 'Any'}`,
                    `Outcome: ${params.get('outcome') ? pretty(params.get('outcome')!) : 'Any'}`,
                    `Format: ${params.get('interviewFormat') ? formatLabels[params.get('interviewFormat') as InterviewFormat] : 'Any'}`,
                    `Recency: ${params.get('recencyMonths') ? `Last ${params.get('recencyMonths')} months` : 'All time'}`,
                  ].map((label) => (
                    <Chip key={label} label={label} onClick={() => setMoreOpen(true)} size="small" variant="outlined" />
                  ))}
                  <Button onClick={() => setMoreOpen(true)} size="small" startIcon={<TuneOutlinedIcon />}>More filters</Button>
                  <Button onClick={clearAll} size="small">Clear all</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          {insights.isLoading ? (
            <Grid aria-label="Loading interview insights" container role="status" spacing={2}>
              {Array.from({ length: 6 }, (_, index) => (
                <Grid key={index} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Skeleton height={300} variant="rounded" />
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
              actionLabel="Share the first insight"
              description="Try another company or role, or be the first eligible candidate to share a reviewed experience."
              onAction={() => setShareOpen(true)}
              title="No interview insights found"
            />
          ) : null}
          {insights.data?.items.length ? (
            <>
              <Grid container spacing={2}>
                {insights.data.items.map((item) => (
                  <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
                    <InsightCard insight={item} onOpen={setDetailId} onReport={setReportId} />
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
        <Stack spacing={2.5}>
          <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
            <Typography component="h2" variant="h2">Interview schedules</Typography>
            <Button onClick={() => setScheduleOpen(true)} startIcon={<CalendarMonthOutlinedIcon />} variant="contained">Add schedule</Button>
          </Stack>
          <Tabs
            aria-label="Schedule filters"
            onChange={(_, next: ScheduleView) => setScheduleView(next)}
            value={scheduleView}
            variant="scrollable"
          >
            <Tab label="Upcoming" value="upcoming" />
            <Tab label="Completed" value="completed" />
            <Tab label="Cancelled" value="cancelled" />
          </Tabs>
          {schedules.isLoading ? (
            <Stack role="status" spacing={2}>
              <Skeleton height={150} variant="rounded" />
              <Skeleton height={150} variant="rounded" />
            </Stack>
          ) : null}
          {schedules.isError ? (
            <ErrorState
              description={readError(schedules.error)}
              onRetry={() => void schedules.refetch()}
              title="Could not load schedules"
            />
          ) : null}
          {!schedules.isLoading && !schedules.isError && !filteredSchedules.length ? (
            <EmptyState
              actionLabel="Add interview schedule"
              description="Keep your private interview plans and preparation status in one place."
              onAction={() => setScheduleOpen(true)}
              title={`No ${scheduleView} schedules`}
            />
          ) : null}
          {filteredSchedules.map((item) => (
            <Paper
              component="article"
              elevation={0}
              key={item.id}
              sx={{ ...featureCard, p: 2.5 }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" spacing={2}>
                  <Box sx={{ alignSelf: 'flex-start', bgcolor: '#EEF4FF', borderRadius: 2, color: '#102A56', minWidth: 64, p: 1.25, textAlign: 'center' }}>
                    <Typography fontWeight={800} variant="h3">{new Date(item.interviewAtUtc).getDate()}</Typography>
                    <Typography fontWeight={700} variant="caption">{new Date(item.interviewAtUtc).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</Typography>
                  </Box>
                  <Box>
                  <Typography component="h2" variant="h3">
                    {item.roleTitle || 'Interview'}
                  </Typography>
                  <Typography color="text.secondary">
                    {item.companyName} · {new Date(item.interviewAtUtc).toLocaleString()}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                    <Chip label={pretty(item.status)} size="small" />
                    {item.interviewFormat ? (
                      <Chip
                        label={formatLabels[item.interviewFormat]}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                    {item.approximateTimeOfDay ? (
                      <Chip label={item.approximateTimeOfDay} size="small" variant="outlined" />
                    ) : null}
                    {item.preparationStatus ? (
                      <Chip
                        label={`Preparation: ${pretty(item.preparationStatus)}`}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                    {item.reminderRequested ? (
                      <Chip label="Reminder requested" size="small" variant="outlined" />
                    ) : null}
                  </Stack>
                  {item.expectedRoundTypes.length ? (
                    <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                      Expected:{' '}
                      {item.expectedRoundTypes.map((round) => roundLabels[round]).join(', ')}
                    </Typography>
                  ) : null}
                  </Box>
                </Stack>
                <Stack
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={1}
                >
                  {item.status !== InterviewScheduleStatus.Cancelled ? (
                    <>
                      <Tooltip title="Edit schedule">
                        <IconButton
                          aria-label={`Edit interview schedule for ${item.companyName}`}
                          onClick={() => {
                            setEditingSchedule(item);
                            setScheduleOpen(true);
                          }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Button color="error" onClick={() => setCancelTarget(item)}>
                        Cancel
                      </Button>
                    </>
                  ) : null}
                  {item.status === InterviewScheduleStatus.InterviewCompleted ? (
                    <Button onClick={() => setNotice('Feedback is available from eligible insight details.')} variant="contained">How did it go?</Button>
                  ) : null}
                  <Button
                    component={Link}
                    to={`${ROUTES.INTERVIEW_INSIGHTS}?companyId=${encodeURIComponent(item.companyId)}&company=${encodeURIComponent(item.companyName)}`}
                  >
                    View insights for company
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}

      {view === 'contributions' ? (
        <Stack spacing={3}>
          <Typography component="h2" variant="h2">My contributions</Typography>
          {contributions.isLoading ? <Skeleton height={240} variant="rounded" /> : null}
          {contributions.isError ? (
            <ErrorState
              description={readError(contributions.error)}
              onRetry={() => void contributions.refetch()}
              title="Could not load contributions"
            />
          ) : null}
          {contributions.data ? (
            <>
              <Grid container spacing={2}>
                {[
                  { label: 'Contribution score', value: contributions.data.contributionScore },
                  { label: 'Helped candidates', value: contributions.data.candidatesHelped },
                  { label: 'Published insights', value: contributions.data.insightsPublished },
                  { label: 'Pending review', value: contributions.data.pendingReview },
                  { label: 'Needs changes', value: contributions.data.needsChanges },
                ].map((metric) => (
                  <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 2.4 }}>
                    <Paper
                      elevation={0}
                      sx={{ boxShadow: '0 8px 24px rgba(25, 71, 138, 0.07)', p: 2.5 }}
                    >
                      <Typography color="text.secondary" variant="body2">
                        {metric.label}
                      </Typography>
                      <Typography component="p" variant="h2">
                        {metric.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Paper elevation={0} sx={{ ...featureCard, bgcolor: '#EEF4FF', p: 2.5 }}>
                <Typography component="h2" variant="h3">
                  How points work
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Points are earned only after eligible candidates confirm an insight was useful.</Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {[['Someone confirms “Helped me”', '+3 points'], ['Someone confirms “Partly helped”', '+1 point'], ['“Not accurate”', '0 points']].map(([label, points]) => (
                    <Stack direction="row" justifyContent="space-between" key={label}><Typography>{label}</Typography><Typography color="#155EEF" fontWeight={800}>{points}</Typography></Stack>
                  ))}
                </Stack>
                {contributions.data.badges.length ? (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                    {contributions.data.badges.map((badge) => <Chip key={badge} label={badge} />)}
                  </Stack>
                ) : null}
              </Paper>
              {!contributions.data.items?.length ? (
                <EmptyState
                  description="Share an eligible interview experience to start helping other candidates."
                  title="No contributions yet"
                />
              ) : (
                <Stack spacing={2}>
                  {contributions.data.items.map((item) => (
                    <Paper
                      component="article"
                      elevation={0}
                      key={item.id}
                      sx={{ ...featureCard, p: 2.5 }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Box>
                          <Typography color="primary.main" fontWeight={700}>
                            {item.companyName}
                          </Typography>
                          <Typography component="h2" variant="h3">
                            {item.roleTitle}
                          </Typography>
                          <Typography color="text.secondary">
                            {formatMonthYear(item.interviewMonth, item.interviewYear)} · Updated{' '}
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </Typography>
                          {item.reviewerChangeRequest &&
                          item.moderationStatus === InterviewInsightStatus.Rejected ? (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              Reviewer request: {item.reviewerChangeRequest}
                            </Alert>
                          ) : null}
                        </Box>
                        <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                          <Chip label={moderationLabel(item.moderationStatus)} />
                          <Typography>
                            {item.helpfulConfirmedCount} helpful · {item.contributionPoints} points
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </>
          ) : null}
        </Stack>
      ) : null}

      <MoreFiltersDialog
        onApply={(values) => {
          updateParams({ ...values, pageNumber: null });
          setMoreOpen(false);
        }}
        onClose={() => setMoreOpen(false)}
        open={moreOpen}
        params={params}
      />
      <InterviewScheduleDialog
        initialCompany={initialCompany}
        initialJobId={params.get('jobId') ?? undefined}
        initialRoleTitle={params.get('roleTitle') ?? undefined}
        onClose={closeSchedule}
        open={scheduleOpen}
        schedule={editingSchedule}
      />
      <ShareInterviewInsightDialog
        onClose={() => setShareOpen(false)}
        onSubmitted={() => {
          setShareOpen(false);
          setNotice('Your insight is pending review.');
          updateParams({ pageNumber: null, view: 'contributions' });
        }}
        open={shareOpen}
      />
      <InsightDetailDialog
        id={detailId}
        onClose={() => setDetailId(null)}
        onFeedback={(item) => {
          setDetailId(null);
          setFeedback(item);
        }}
      />
      {feedback ? (
        <InsightFeedbackDialog
          insightId={feedback.id}
          onClose={() => setFeedback(null)}
          open
          schedules={feedbackSchedules}
        />
      ) : null}
      {reportId ? (
        <ReportInsightDialog
          insightId={reportId}
          onClose={() => setReportId(null)}
          onReported={() => setNotice('Insight reported for review.')}
          open
        />
      ) : null}
      <Dialog
        onClose={updateState.isLoading ? undefined : () => setCancelTarget(undefined)}
        open={Boolean(cancelTarget)}
      >
        <DialogTitle>Cancel interview schedule?</DialogTitle>
        <DialogContent>
          <Typography>
            This will mark the private schedule for {cancelTarget?.companyName} as cancelled.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={updateState.isLoading} onClick={() => setCancelTarget(undefined)}>
            Keep schedule
          </Button>
          <Button
            color="error"
            disabled={updateState.isLoading}
            onClick={() => void confirmCancel()}
            variant="contained"
          >
            Cancel schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
