import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import {
  isInterviewInsightsApiError,
  useAddInsightFeedbackMutation,
  useCreateCandidateCompanyMutation,
  useCreateInterviewInsightMutation,
  useCreateInterviewScheduleMutation,
  useGetInterviewInsightCompaniesQuery,
  useReportInterviewInsightMutation,
  useUpdateInterviewScheduleMutation,
} from '../api/interviewInsightsApi';
import {
  InsightHelpfulness,
  InsightReportReason,
  InterviewDifficulty,
  InterviewFormat,
  InterviewMatch,
  InterviewOutcome,
  InterviewPreparationStatus,
  InterviewRoundType,
  InterviewTimeOfDay,
  type InterviewInsightCompanyResponse,
  type InterviewRoundRequest,
  type InterviewScheduleResponse,
} from '../types/interviewInsightModels';
import { formatLabels, roundLabels } from '../interviewInsightOptions';
const roundValues = Object.values(InterviewRoundType);

const safeError = (error: unknown): string =>
  isInterviewInsightsApiError(error)
    ? error.message
    : 'We could not complete that request. Please try again.';
const fieldError = (error: unknown, name: string): string | undefined => {
  if (!isInterviewInsightsApiError(error) || !error.errors) return undefined;
  const entry = Object.entries(error.errors).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1]?.[0];
};

interface CompanyAutocompleteProps {
  allowCreate?: boolean;
  disabled?: boolean;
  label?: string;
  onChange: (value: InterviewInsightCompanyResponse | null) => void;
  onInputValueChange?: (value: string) => void;
  required?: boolean;
  value: InterviewInsightCompanyResponse | null;
}

interface AddCompanyOption {
  companyName: string;
  inputValue: string;
  isAddOption: true;
}

type CompanyOption = InterviewInsightCompanyResponse | AddCompanyOption;
const isAddCompanyOption = (option: CompanyOption): option is AddCompanyOption =>
  'isAddOption' in option;
const normalizeCompanyName = (name: string): string =>
  name.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const isValidCompanyName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 160 && /[\p{L}\p{N}]/u.test(trimmed) && !/[<>\r\n]/.test(trimmed);
};

export const InterviewCompanyAutocomplete = ({
  allowCreate = false,
  disabled = false,
  label = 'Company',
  onChange,
  onInputValueChange,
  required = false,
  value,
}: CompanyAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value?.companyName ?? '');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<{ severity: 'error' | 'success'; text: string } | null>(
    null,
  );
  const [createCompany, createState] = useCreateCandidateCompanyMutation();
  useEffect(() => setInputValue(value?.companyName ?? ''), [value]);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(inputValue.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [inputValue]);
  const search = useGetInterviewInsightCompaniesQuery(
    { limit: 10, query },
    { skip: query.length < 2 },
  );
  const options = useMemo<CompanyOption[]>(() => {
    const values = search.data ?? [];
    const existing = value && !values.some((item) => item.id === value.id) ? [value, ...values] : values;
    const typed = inputValue.trim();
    const hasExactMatch = values.some(
      (item) => item.companyName.trim().toLocaleLowerCase() === typed.toLocaleLowerCase(),
    );
    return allowCreate && query === typed && isValidCompanyName(typed) && !hasExactMatch
      ? [...existing, { companyName: typed, inputValue: typed, isAddOption: true }]
      : existing;
  }, [allowCreate, inputValue, query, search.data, value]);
  const selectOption = async (selected: CompanyOption | null) => {
    setMessage(null);
    if (!selected) return onChange(null);
    if (!isAddCompanyOption(selected)) return onChange(selected);
    try {
      const created = await createCompany({ companyName: selected.inputValue }).unwrap();
      const wasAlreadyKnown = (search.data ?? []).some(
        (item) =>
          item.id === created.id ||
          normalizeCompanyName(item.companyName) === normalizeCompanyName(created.companyName),
      );
      onChange(created);
      if (!wasAlreadyKnown) setMessage({ severity: 'success', text: 'Company added and selected.' });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: fieldError(error, 'CompanyName') ?? safeError(error),
      });
    }
  };
  return (
    <Stack spacing={0.75}>
    <Autocomplete<CompanyOption>
      disabled={disabled || createState.isLoading}
      filterOptions={(items) => items}
      getOptionLabel={(option) =>
        isAddCompanyOption(option) ? `+ Add ‘${option.inputValue}’` : option.companyName
      }
      inputValue={inputValue}
      isOptionEqualToValue={(option, selected) =>
        !isAddCompanyOption(option) && !isAddCompanyOption(selected) && option.id === selected.id
      }
      loading={search.isFetching || createState.isLoading}
      noOptionsText={query.length < 2 ? 'Type at least 2 characters' : 'No companies found'}
      onChange={(_, selected) => void selectOption(selected)}
      onInputChange={(_, next, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(next);
          onInputValueChange?.(next);
        }
        if (reason === 'input') setMessage(null);
        if (reason === 'input' && value && next !== value.companyName) onChange(null);
      }}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {search.isFetching || createState.isLoading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      value={value}
    />
    {message ? <Alert severity={message.severity}>{message.text}</Alert> : null}
    </Stack>
  );
};

const toLocalInputValue = (value: string): string => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

interface ScheduleDialogProps {
  initialCompany?: InterviewInsightCompanyResponse;
  initialJobId?: string;
  initialRoleTitle?: string;
  onClose: () => void;
  open: boolean;
  schedule?: InterviewScheduleResponse;
}

export const InterviewScheduleDialog = ({
  initialCompany,
  initialJobId,
  initialRoleTitle = '',
  onClose,
  open,
  schedule,
}: ScheduleDialogProps) => {
  const [company, setCompany] = useState<InterviewInsightCompanyResponse | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [interviewAt, setInterviewAt] = useState('');
  const [format, setFormat] = useState<InterviewFormat | ''>('');
  const [timeOfDay, setTimeOfDay] = useState<InterviewTimeOfDay | ''>('');
  const [rounds, setRounds] = useState<InterviewRoundType[]>([]);
  const [preparation, setPreparation] = useState<InterviewPreparationStatus | ''>('');
  const [reminder, setReminder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createSchedule, createState] = useCreateInterviewScheduleMutation();
  const [updateSchedule, updateState] = useUpdateInterviewScheduleMutation();
  const pending = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!open) return;
    setCompany(
      schedule
        ? { id: schedule.companyId, companyName: schedule.companyName }
        : (initialCompany ?? null),
    );
    setRoleTitle(schedule?.roleTitle ?? initialRoleTitle);
    setInterviewAt(schedule ? toLocalInputValue(schedule.interviewAtUtc) : '');
    setFormat(schedule?.interviewFormat ?? '');
    setTimeOfDay(schedule?.approximateTimeOfDay ?? '');
    setRounds(schedule?.expectedRoundTypes ?? []);
    setPreparation(schedule?.preparationStatus ?? '');
    setReminder(schedule?.reminderRequested ?? false);
    setError(null);
  }, [initialCompany, initialRoleTitle, open, schedule]);

  const submit = async () => {
    if (!company || !interviewAt) return setError('Select a company and private interview date.');
    const parsed = new Date(interviewAt);
    if (Number.isNaN(parsed.getTime())) return setError('Enter a valid interview date.');
    const common = {
      approximateTimeOfDay: timeOfDay || null,
      expectedRoundTypes: rounds,
      interviewAtUtc: parsed.toISOString(),
      interviewFormat: format || null,
      preparationStatus: preparation || null,
      reminderRequested: reminder,
      roleTitle: roleTitle.trim() || null,
    };
    setError(null);
    try {
      if (schedule)
        await updateSchedule({
          id: schedule.id,
          data: { ...common, status: schedule.status },
        }).unwrap();
      else
        await createSchedule({
          ...common,
          companyId: company.id,
          jobId: initialJobId ?? null,
        }).unwrap();
      onClose();
    } catch (requestError) {
      setError(safeError(requestError));
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={pending ? undefined : onClose} open={open}>
      <DialogTitle>{schedule ? 'Edit interview schedule' : 'Add interview schedule'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <Alert severity="info">
            This schedule and its exact date are private to your account.
          </Alert>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <InterviewCompanyAutocomplete
            allowCreate
            disabled={Boolean(schedule) || pending}
            onChange={setCompany}
            required
            value={company}
          />
          <TextField
            disabled={pending}
            label="Role"
            onChange={(event) => setRoleTitle(event.target.value)}
            value={roleTitle}
          />
          <TextField
            disabled={pending}
            InputLabelProps={{ shrink: true }}
            label="Private interview date"
            onChange={(event) => setInterviewAt(event.target.value)}
            required
            type="datetime-local"
            value={interviewAt}
          />
          <FormControl>
            <InputLabel id="schedule-format-label">Interview format</InputLabel>
            <Select
              label="Interview format"
              labelId="schedule-format-label"
              onChange={(event) => setFormat(event.target.value)}
              value={format}
            >
              <MenuItem value="">Not specified</MenuItem>
              {Object.values(InterviewFormat).map((item) => (
                <MenuItem key={item} value={item}>
                  {formatLabels[item]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="schedule-time-label">Approximate time</InputLabel>
            <Select
              label="Approximate time"
              labelId="schedule-time-label"
              onChange={(event) => setTimeOfDay(event.target.value)}
              value={timeOfDay}
            >
              <MenuItem value="">Not specified</MenuItem>
              {Object.values(InterviewTimeOfDay).map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="expected-rounds-label">Expected round types</InputLabel>
            <Select
              label="Expected round types"
              labelId="expected-rounds-label"
              multiple
              onChange={(event) => setRounds(event.target.value as InterviewRoundType[])}
              renderValue={(selected) => selected.map((item) => roundLabels[item]).join(', ')}
              value={rounds}
            >
              {roundValues.map((item) => (
                <MenuItem key={item} value={item}>
                  <Checkbox checked={rounds.includes(item)} />
                  {roundLabels[item]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="preparation-label">Preparation status</InputLabel>
            <Select
              label="Preparation status"
              labelId="preparation-label"
              onChange={(event) => setPreparation(event.target.value)}
              value={preparation}
            >
              <MenuItem value="">Not specified</MenuItem>
              <MenuItem value={InterviewPreparationStatus.NotStarted}>Not started</MenuItem>
              <MenuItem value={InterviewPreparationStatus.Preparing}>Preparing</MenuItem>
              <MenuItem value={InterviewPreparationStatus.Ready}>Ready</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={reminder}
                onChange={(event) => setReminder(event.target.checked)}
              />
            }
            label="Send me an interview reminder"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={pending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={pending || !company || !interviewAt}
          onClick={() => void submit()}
          variant="contained"
        >
          {pending ? 'Saving…' : 'Save schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const newRound = (): InterviewRoundRequest => ({
  candidateAdvice: null,
  durationMinutes: null,
  questionsOrTopics: '',
  roundTitle: null,
  roundType: InterviewRoundType.Technical,
});
const containsPrivateContact = (value: string): boolean =>
  /(?:https?:\/\/|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|(?:\+?\d[\d\s-]{8,}\d))/i.test(value);

interface ShareDialogProps {
  onClose: () => void;
  onSubmitted: () => void;
  open: boolean;
}
export const ShareInterviewInsightDialog = ({ onClose, onSubmitted, open }: ShareDialogProps) => {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<InterviewInsightCompanyResponse | null>(null);
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [month, setMonth] = useState('');
  const [difficulty, setDifficulty] = useState(InterviewDifficulty.Moderate);
  const [format, setFormat] = useState<InterviewFormat | ''>('');
  const [outcome, setOutcome] = useState<InterviewOutcome | ''>('');
  const [anonymous, setAnonymous] = useState(false);
  const [rounds, setRounds] = useState<InterviewRoundRequest[]>([newRound()]);
  const [summary, setSummary] = useState('');
  const [tips, setTips] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [create, state] = useCreateInterviewInsightMutation();
  useEffect(() => {
    if (open) {
      setStep(0);
      setCompany(null);
      setRole('');
      setLevel('');
      setMonth('');
      setDifficulty(InterviewDifficulty.Moderate);
      setFormat('');
      setOutcome('');
      setAnonymous(false);
      setRounds([newRound()]);
      setSummary('');
      setTips('');
      setAccepted(false);
      setSubmitted(false);
      setError(null);
    }
  }, [open]);

  const validate = () => {
    let message = '';
    if (step === 0 && (!company || !role.trim() || !month))
      message = 'Company, role title, and interview month are required.';
    if (step === 1 && rounds.some((item) => !item.questionsOrTopics.trim()))
      message = 'Add questions or topics for every interview round.';
    if (step === 2 && (!summary.trim() || !tips.trim() || !accepted))
      message = 'Summary, preparation tips, and the safety acknowledgement are required.';
    if (
      [
        summary,
        tips,
        ...rounds.flatMap((item) => [item.questionsOrTopics, item.candidateAdvice ?? '']),
      ].some(containsPrivateContact)
    )
      message = 'Remove email addresses, phone numbers, and links before continuing.';
    setError(message || null);
    return !message;
  };
  const updateRound = (index: number, patch: Partial<InterviewRoundRequest>) =>
    setRounds((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const moveRound = (index: number, offset: number) =>
    setRounds((items) => {
      const next = [...items];
      const item = next[index];
      if (!item) return items;
      next.splice(index, 1);
      next.splice(index + offset, 0, item);
      return next;
    });
  const submit = async () => {
    if (!company || !validate()) return;
    try {
      await create({
        companyId: company.id,
        contentGuidelinesAccepted: true,
        experienceLevel: level.trim() || null,
        interviewDateMonth: `${month}-01`,
        interviewFormat: format || null,
        isAnonymous: anonymous,
        jobId: null,
        outcome: outcome || null,
        overallDifficulty: difficulty,
        preparationTips: tips.trim(),
        processSummary: summary.trim(),
        roleTitle: role.trim(),
        rounds: rounds.map((item) => ({
          ...item,
          candidateAdvice: item.candidateAdvice?.trim() || null,
          questionsOrTopics: item.questionsOrTopics.trim(),
          roundTitle: item.roundTitle?.trim() || null,
        })),
      }).unwrap();
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError);
    }
  };

  return (
    <Dialog fullScreen onClose={state.isLoading ? undefined : onClose} open={open}>
      <DialogTitle sx={{ bgcolor: '#0B1F43', color: '#FFFFFF', px: { xs: 2, md: 5 } }}>Share an interview insight</DialogTitle>
      <DialogContent>
        {submitted ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: '75vh', textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ color: '#12B76A', fontSize: 72 }} />
            <Typography component="h2" variant="h2">Thanks for helping future candidates</Typography>
            <Typography color="text.secondary">Your insight is pending review. We’ll notify you once it is published.</Typography>
            <Button onClick={onSubmitted} variant="contained">View my contributions</Button>
          </Stack>
        ) : (
        <Stack spacing={3} sx={{ maxWidth: 1120, mx: 'auto', pt: 2, width: '100%' }}>
          <Alert severity="info">Submitted insights are reviewed before publication.</Alert>
          <Stepper activeStep={step} alternativeLabel>
            {[
              'Basics',
              'Rounds',
              'Summary & tips',
              'Review',
            ].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {error ? (
            <Alert aria-live="assertive" severity="error">
              {typeof error === 'string' ? error : safeError(error)}
            </Alert>
          ) : null}
          {step === 0 ? (
            <Stack spacing={2}>
              <InterviewCompanyAutocomplete allowCreate onChange={setCompany} required value={company} />
              <TextField
                error={Boolean(fieldError(error, 'RoleTitle'))}
                helperText={fieldError(error, 'RoleTitle')}
                label="Role title"
                onChange={(event) => setRole(event.target.value)}
                required
                value={role}
              />
              <TextField
                label="Experience level"
                onChange={(event) => setLevel(event.target.value)}
                value={level}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                label="Interview month"
                onChange={(event) => setMonth(event.target.value)}
                required
                type="month"
                value={month}
              />
              <FormControl>
                <InputLabel id="share-difficulty">Difficulty</InputLabel>
                <Select
                  label="Difficulty"
                  labelId="share-difficulty"
                  onChange={(event) => setDifficulty(event.target.value)}
                  value={difficulty}
                >
                  {Object.values(InterviewDifficulty).map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel id="share-format">Interview format</InputLabel>
                <Select
                  label="Interview format"
                  labelId="share-format"
                  onChange={(event) => setFormat(event.target.value)}
                  value={format}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  {Object.values(InterviewFormat).map((item) => (
                    <MenuItem key={item} value={item}>
                      {formatLabels[item]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel id="share-outcome">Outcome</InputLabel>
                <Select
                  label="Outcome"
                  labelId="share-outcome"
                  onChange={(event) => setOutcome(event.target.value)}
                  value={outcome}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  {Object.values(InterviewOutcome).map((item) => (
                    <MenuItem key={item} value={item}>
                      {item === InterviewOutcome.PreferNotToSay ? 'Prefer not to say' : item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                  />
                }
                label="Share as Anonymous candidate"
              />
            </Stack>
          ) : null}
          {step === 1 ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
              {rounds.map((round, index) => (
                <Paper
                  elevation={0}
                  key={index}
                  sx={{ border: '1px solid #E5EAF2', borderRadius: '12px', boxShadow: '0 8px 24px rgba(16, 42, 86, 0.07)', mb: 2, p: 2.5 }}
                >
                  <Stack spacing={2}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between">
                    <Typography component="h3" fontWeight={700}>
                      Round {index + 1}
                    </Typography>
                    <Stack direction="row">
                      <Tooltip title="Move round up">
                        <span>
                          <IconButton
                            aria-label={`Move round ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => moveRound(index, -1)}
                          >
                            <ArrowUpwardIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move round down">
                        <span>
                          <IconButton
                            aria-label={`Move round ${index + 1} down`}
                            disabled={index === rounds.length - 1}
                            onClick={() => moveRound(index, 1)}
                          >
                            <ArrowDownwardIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {rounds.length > 1 ? (
                        <Tooltip title="Remove round">
                          <IconButton
                            aria-label={`Remove round ${index + 1}`}
                            color="error"
                            onClick={() =>
                              setRounds((items) => items.filter((_, i) => i !== index))
                            }
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Stack>
                  </Stack>
                  <FormControl>
                    <InputLabel id={`round-type-${index}`}>Round type</InputLabel>
                    <Select
                      label="Round type"
                      labelId={`round-type-${index}`}
                      onChange={(event) => updateRound(index, { roundType: event.target.value })}
                      value={round.roundType}
                    >
                      {roundValues.map((item) => (
                        <MenuItem key={item} value={item}>
                          {roundLabels[item]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Round title"
                    onChange={(event) => updateRound(index, { roundTitle: event.target.value })}
                    value={round.roundTitle ?? ''}
                  />
                  <TextField
                    inputProps={{ max: 1440, min: 1 }}
                    label="Approximate duration (minutes)"
                    onChange={(event) =>
                      updateRound(index, {
                        durationMinutes: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    type="number"
                    value={round.durationMinutes ?? ''}
                  />
                  <TextField
                    label="Questions or topics"
                    multiline
                    minRows={3}
                    onChange={(event) =>
                      updateRound(index, { questionsOrTopics: event.target.value })
                    }
                    required
                    value={round.questionsOrTopics}
                  />
                  <TextField
                    label="Preparation advice"
                    multiline
                    minRows={2}
                    onChange={(event) =>
                      updateRound(index, { candidateAdvice: event.target.value })
                    }
                    value={round.candidateAdvice ?? ''}
                  />
                  </Stack>
                </Paper>
              ))}
              <Button
                disabled={rounds.length >= 12}
                onClick={() => setRounds((items) => [...items, newRound()])}
                startIcon={<AddIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add round
              </Button>
              </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{ border: '1px solid #E5EAF2', borderRadius: '12px', p: 2.5, position: { md: 'sticky' }, top: 24 }}>
                  <Typography component="h3" variant="h3">Timeline preview</Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {rounds.map((round, index) => (
                      <Stack alignItems="center" direction="row" gap={1.5} key={`preview-${index}`}>
                        <Box sx={{ bgcolor: '#155EEF', borderRadius: '50%', color: '#fff', display: 'grid', height: 28, placeItems: 'center', width: 28 }}>{index + 1}</Box>
                        <Typography fontWeight={700}>{round.roundTitle || roundLabels[round.roundType]}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          ) : null}
          {step === 2 ? (
            <Stack spacing={2}>
              <TextField
                error={Boolean(fieldError(error, 'ProcessSummary'))}
                helperText={fieldError(error, 'ProcessSummary')}
                label="Process summary"
                multiline
                minRows={4}
                onChange={(event) => setSummary(event.target.value)}
                required
                value={summary}
              />
              <TextField
                error={Boolean(fieldError(error, 'PreparationTips'))}
                helperText={fieldError(error, 'PreparationTips')}
                label="Preparation tips"
                multiline
                minRows={4}
                onChange={(event) => setTips(event.target.value)}
                required
                value={tips}
              />
              <FormControl error={Boolean(fieldError(error, 'ContentGuidelinesAccepted'))}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      required
                    />
                  }
                  label="I confirm this is my own experience and contains no confidential company content, personal information, credentials, or protected assessment answers."
                />
                {fieldError(error, 'ContentGuidelinesAccepted') ? (
                  <FormHelperText>{fieldError(error, 'ContentGuidelinesAccepted')}</FormHelperText>
                ) : null}
              </FormControl>
            </Stack>
          ) : null}
          {step === 3 ? (
            <Stack spacing={1.5}>
              <Typography variant="h3">Review your insight</Typography>
              <Typography>
                <strong>Company:</strong> {company?.companyName}
              </Typography>
              <Typography>
                <strong>Role:</strong> {role}
              </Typography>
              <Typography>
                <strong>Interview month:</strong> {month}
              </Typography>
              <Typography>
                <strong>Rounds:</strong> {rounds.length}
              </Typography>
              <Typography>
                <strong>Sharing as:</strong>{' '}
                {anonymous ? 'Anonymous candidate' : 'Your candidate name'}
              </Typography>
              <Alert severity="info">
                Your insight will be submitted for review and will not be public until approved.
              </Alert>
            </Stack>
          ) : null}
        </Stack>
        )}
      </DialogContent>
      {!submitted ? <DialogActions sx={{ borderTop: '1px solid #E5EAF2', px: { xs: 2, md: 5 }, py: 2 }}>
        <Button disabled={state.isLoading} onClick={onClose}>
          Cancel
        </Button>
        {step > 0 ? (
          <Button
            disabled={state.isLoading}
            onClick={() => {
              setError(null);
              setStep((value) => value - 1);
            }}
          >
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button
            onClick={() => {
              if (validate()) setStep((value) => value + 1);
            }}
            variant="contained"
          >
            Continue
          </Button>
        ) : (
          <Button disabled={state.isLoading} onClick={() => void submit()} variant="contained">
            {state.isLoading ? 'Submitting…' : 'Submit for review'}
          </Button>
        )}
      </DialogActions> : null}
    </Dialog>
  );
};

interface FeedbackDialogProps {
  insightId: string;
  onClose: () => void;
  open: boolean;
  schedules: InterviewScheduleResponse[];
}
export const InsightFeedbackDialog = ({
  insightId,
  onClose,
  open,
  schedules,
}: FeedbackDialogProps) => {
  const [scheduleId, setScheduleId] = useState('');
  const [helpfulness, setHelpfulness] = useState<InsightHelpfulness | ''>('');
  const [match, setMatch] = useState<InterviewMatch | ''>('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitFeedback, state] = useAddInsightFeedbackMutation();
  useEffect(() => {
    if (open) {
      setScheduleId(schedules[0]?.id ?? '');
      setHelpfulness('');
      setMatch('');
      setFeedback('');
      setError(null);
      setSuccess(false);
    }
  }, [open, schedules]);
  const submit = async () => {
    if (!scheduleId || !helpfulness || !match)
      return setError('Select your interview, helpfulness, and interview match.');
    try {
      await submitFeedback({
        id: insightId,
        data: {
          candidateInterviewScheduleId: scheduleId,
          feedback: feedback.trim() || null,
          helpfulness,
          interviewMatch: match,
        },
      }).unwrap();
      setSuccess(true);
    } catch (requestError) {
      setError(safeError(requestError));
    }
  };
  return (
    <Dialog fullWidth maxWidth="sm" onClose={state.isLoading ? undefined : onClose} open={open}>
      <DialogTitle>Did this insight help you?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? (
            <Alert severity="success">Thanks. Your feedback helps keep insights useful.</Alert>
          ) : (
            <>
              <FormControl required>
                <InputLabel id="feedback-schedule">Your completed interview</InputLabel>
                <Select
                  label="Your completed interview"
                  labelId="feedback-schedule"
                  onChange={(event) => setScheduleId(event.target.value)}
                  value={scheduleId}
                >
                  {schedules.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.companyName} — {new Date(item.interviewAtUtc).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl required>
                <InputLabel id="helpfulness">Helpfulness</InputLabel>
                <Select
                  label="Helpfulness"
                  labelId="helpfulness"
                  onChange={(event) => setHelpfulness(event.target.value)}
                  value={helpfulness}
                >
                  {Object.values(InsightHelpfulness).map((item) => (
                    <MenuItem key={item} value={item}>
                      {item === InsightHelpfulness.PartlyHelped
                        ? 'Partly helped'
                        : item === InsightHelpfulness.DidNotHelp
                          ? 'Did not help'
                          : item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl required>
                <InputLabel id="match">Interview match</InputLabel>
                <Select
                  label="Interview match"
                  labelId="match"
                  onChange={(event) => setMatch(event.target.value)}
                  value={match}
                >
                  {Object.values(InterviewMatch).map((item) => (
                    <MenuItem key={item} value={item}>
                      {item === InterviewMatch.PartlyMatched
                        ? 'Partly matched'
                        : item === InterviewMatch.DidNotMatch
                          ? 'Did not match'
                          : item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Additional feedback (optional)"
                multiline
                minRows={2}
                onChange={(event) => setFeedback(event.target.value)}
                value={feedback}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={state.isLoading} onClick={onClose}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success ? (
          <Button
            disabled={state.isLoading || !schedules.length}
            onClick={() => void submit()}
            variant="contained"
          >
            Submit feedback
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

interface ReportDialogProps {
  insightId: string;
  onClose: () => void;
  onReported?: () => void;
  open: boolean;
}
export const ReportInsightDialog = ({
  insightId,
  onClose,
  onReported,
  open,
}: ReportDialogProps) => {
  const [reason, setReason] = useState(InsightReportReason.Inaccurate);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [report, state] = useReportInterviewInsightMutation();
  useEffect(() => {
    if (open) {
      setReason(InsightReportReason.Inaccurate);
      setDetails('');
      setError(null);
    }
  }, [open]);
  const submit = async () => {
    try {
      await report({ id: insightId, data: { details: details.trim() || null, reason } }).unwrap();
      onReported?.();
      onClose();
    } catch (requestError) {
      setError(safeError(requestError));
    }
  };
  return (
    <Dialog fullWidth maxWidth="sm" onClose={state.isLoading ? undefined : onClose} open={open}>
      <DialogTitle>Report this insight?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography>
            Career Harbor will review this report. The author will not see your identity.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <FormControl required>
            <InputLabel id="report-reason">Reason</InputLabel>
            <Select
              label="Reason"
              labelId="report-reason"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            >
              {Object.values(InsightReportReason).map((item) => (
                <MenuItem key={item} value={item}>
                  {item.replace(/([A-Z])/g, ' $1').trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Details (optional)"
            multiline
            minRows={3}
            onChange={(event) => setDetails(event.target.value)}
            value={details}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={state.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="error"
          disabled={state.isLoading}
          onClick={() => void submit()}
          variant="contained"
        >
          {state.isLoading ? 'Reporting…' : 'Confirm report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
