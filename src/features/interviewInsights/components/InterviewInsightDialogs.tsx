import AddIcon from '@mui/icons-material/Add';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

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
Divider,
Switch,
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
  type ReminderOffset = 15 | 30 | 60 | 1440;

  const [company, setCompany] = useState<InterviewInsightCompanyResponse | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [interviewAt, setInterviewAt] = useState('');
  const [format, setFormat] = useState<InterviewFormat | ''>('');
  const [timeOfDay, setTimeOfDay] = useState<InterviewTimeOfDay | ''>('');
  const [rounds, setRounds] = useState<InterviewRoundType[]>([]);
  const [preparation, setPreparation] = useState<InterviewPreparationStatus | ''>('');
  const [reminder, setReminder] = useState(false);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] =
    useState<ReminderOffset>(30);
  const [timeZoneId, setTimeZoneId] = useState('UTC');
  const [error, setError] = useState<string | null>(null);

  const [createSchedule, createState] = useCreateInterviewScheduleMutation();
  const [updateSchedule, updateState] = useUpdateInterviewScheduleMutation();

  const pending = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!open) return;

    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

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
    setReminderOffsetMinutes(schedule?.reminderOffsetMinutes ?? 30);
    setTimeZoneId(schedule?.timeZoneId || browserTimeZone);
    setError(null);
  }, [initialCompany, initialRoleTitle, open, schedule]);

  const submit = async () => {
    if (!company || !interviewAt) {
      return setError('Select a company and interview date and time.');
    }

    const parsed = new Date(interviewAt);

    if (Number.isNaN(parsed.getTime())) {
      return setError('Enter a valid interview date and time.');
    }

    const common = {
      approximateTimeOfDay: timeOfDay || null,
      expectedRoundTypes: rounds,
      interviewAtUtc: parsed.toISOString(),
      interviewFormat: format || null,
      preparationStatus: preparation || null,
      reminderOffsetMinutes,
      reminderRequested: reminder,
      roleTitle: roleTitle.trim() || null,
      timeZoneId,
    };

    setError(null);

    try {
      if (schedule) {
        await updateSchedule({
          id: schedule.id,
          data: {
            ...common,
            status: schedule.status,
          },
        }).unwrap();
      } else {
        await createSchedule({
          ...common,
          companyId: company.id,
          jobId: initialJobId ?? null,
        }).unwrap();
      }

      onClose();
    } catch (requestError) {
      setError(safeError(requestError));
    }
  };

  const reminderOptions: Array<{
    label: string;
    value: ReminderOffset;
  }> = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
  ];

  const sectionSx = {
    bgcolor: '#FFFFFF',
    border: '1px solid #E3EAF3',
    borderRadius: 3,
    overflow: 'hidden',
  } as const;

  const sectionHeaderSx = {
    alignItems: 'center',
    display: 'flex',
    minHeight: 46,
    px: 2.25,
  } as const;

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      onClose={pending ? undefined : onClose}
      open={open}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3.5 },
          maxWidth: 1280,
          overflow: 'hidden',
        },
      }}
      fullScreen={false}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid #E8EDF4',
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: '#EAF3FF',
                borderRadius: 2.5,
                color: '#146EF5',
                display: 'flex',
                flex: '0 0 auto',
                height: 46,
                justifyContent: 'center',
                width: 46,
              }}
            >
              <CalendarMonthOutlinedIcon />
            </Box>

            <Box>
              <Typography
                component="h2"
                fontSize={{ xs: 19, md: 22 }}
                fontWeight={800}
              >
                {schedule ? 'Edit interview schedule' : 'Add interview schedule'}
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={12.5}
                sx={{ mt: 0.3 }}
              >
                Schedule and track your interview. Your exact interview date is
                private to your account.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            aria-label="Close"
            disabled={pending}
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: '#F8FAFD',
          p: { xs: 2, md: 3 },
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7.25 }}>
            <Stack spacing={2}>
              {/* Company and role */}
              <Paper elevation={0} sx={sectionSx}>
                <Box
                  sx={{
                    ...sectionHeaderSx,
                    bgcolor: '#EEF6FF',
                  }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <BusinessOutlinedIcon
                      sx={{ color: '#146EF5', fontSize: 21 }}
                    />
                    <Typography fontSize={15} fontWeight={800}>
                      Company &amp; Role
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={2} sx={{ p: 2.25 }}>
                  <InterviewCompanyAutocomplete
                    allowCreate
                    disabled={Boolean(schedule) || pending}
                    label="Company"
                    onChange={setCompany}
                    required
                    value={company}
                  />

                  <TextField
                    disabled={pending}
                    fullWidth
                    label="Role / Job title"
                    onChange={(event) => setRoleTitle(event.target.value)}
                    placeholder="e.g. Software Engineer"
                    value={roleTitle}
                  />
                </Stack>
              </Paper>

              {/* Interview details */}
              <Paper elevation={0} sx={sectionSx}>
                <Box
                  sx={{
                    ...sectionHeaderSx,
                    bgcolor: '#ECFDF3',
                  }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <CalendarMonthOutlinedIcon
                      sx={{ color: '#12B76A', fontSize: 21 }}
                    />
                    <Typography fontSize={15} fontWeight={800}>
                      Interview Details
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ p: 2.25 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        disabled={pending}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        label="Interview date & time"
                        onChange={(event) => setInterviewAt(event.target.value)}
                        required
                        type="datetime-local"
                        value={interviewAt}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id="schedule-format-label">
                          Interview format
                        </InputLabel>

                        <Select
                          disabled={pending}
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
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id="schedule-time-label">
                          Approximate time
                        </InputLabel>

                        <Select
                          disabled={pending}
                          label="Approximate time"
                          labelId="schedule-time-label"
                          onChange={(event) =>
                            setTimeOfDay(event.target.value)
                          }
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
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          alignItems: 'center',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #E4EAF2',
                          borderRadius: 2,
                          display: 'flex',
                          minHeight: 56,
                          px: 1.75,
                        }}
                      >
                        <ScheduleOutlinedIcon
                          sx={{
                            color: '#667085',
                            fontSize: 20,
                            mr: 1.25,
                          }}
                        />

                        <Box>
                          <Typography
                            color="text.secondary"
                            fontSize={11}
                            fontWeight={700}
                          >
                            Stored securely
                          </Typography>

                          <Typography fontSize={12.5} fontWeight={700}>
                            Interview time is saved in UTC
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Additional information */}
              <Paper elevation={0} sx={sectionSx}>
                <Box
                  sx={{
                    ...sectionHeaderSx,
                    bgcolor: '#F5F0FF',
                  }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <DescriptionOutlinedIcon
                      sx={{ color: '#7F56D9', fontSize: 21 }}
                    />
                    <Typography fontSize={15} fontWeight={800}>
                      Additional Information
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ p: 2.25 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id="expected-rounds-label">
                          Expected round types
                        </InputLabel>

                        <Select
                          disabled={pending}
                          label="Expected round types"
                          labelId="expected-rounds-label"
                          multiple
                          onChange={(event) =>
                            setRounds(
                              event.target.value as InterviewRoundType[],
                            )
                          }
                          renderValue={(selected) =>
                            selected
                              .map((item) => roundLabels[item])
                              .join(', ')
                          }
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
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id="preparation-label">
                          Preparation status
                        </InputLabel>

                        <Select
                          disabled={pending}
                          label="Preparation status"
                          labelId="preparation-label"
                          onChange={(event) =>
                            setPreparation(event.target.value)
                          }
                          value={preparation}
                        >
                          <MenuItem value="">Not specified</MenuItem>

                          <MenuItem
                            value={InterviewPreparationStatus.NotStarted}
                          >
                            Not started
                          </MenuItem>

                          <MenuItem
                            value={InterviewPreparationStatus.Preparing}
                          >
                            Preparing
                          </MenuItem>

                          <MenuItem value={InterviewPreparationStatus.Ready}>
                            Ready
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Stack>
          </Grid>

          {/* Reminder panel */}
          <Grid size={{ xs: 12, lg: 4.75 }}>
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  background:
                    'linear-gradient(180deg, #F0F7FF 0%, #F8FBFF 100%)',
                  border: '1px solid #CFE3FF',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ p: { xs: 2.25, md: 2.75 } }}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack alignItems="center" direction="row" spacing={1.2}>
                      <Box
                        sx={{
                          alignItems: 'center',
                          bgcolor: '#DCEBFF',
                          borderRadius: 2,
                          color: '#146EF5',
                          display: 'flex',
                          height: 40,
                          justifyContent: 'center',
                          width: 40,
                        }}
                      >
                        <NotificationsActiveOutlinedIcon fontSize="small" />
                      </Box>

                      <Box>
                        <Typography fontSize={16} fontWeight={800}>
                          Reminder
                        </Typography>

                        <Typography color="text.secondary" fontSize={11.5}>
                          Get notified before your interview
                        </Typography>
                      </Box>
                    </Stack>

                    <Switch
                      checked={reminder}
                      disabled={pending}
                      onChange={(event) => setReminder(event.target.checked)}
                    />
                  </Stack>

                  <Divider sx={{ my: 2.25 }} />

                  <Typography fontSize={12.5} fontWeight={800}>
                    Remind me before
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1,
                      gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(4, minmax(0, 1fr))',
                        lg: 'repeat(2, minmax(0, 1fr))',
                      },
                      mt: 1.25,
                    }}
                  >
                    {reminderOptions.map((option) => {
                      const selected =
                        reminderOffsetMinutes === option.value;

                      return (
                        <Button
                          disabled={!reminder || pending}
                          key={option.value}
                          onClick={() =>
                            setReminderOffsetMinutes(option.value)
                          }
                          size="small"
                          sx={{
                            bgcolor: selected
                              ? '#146EF5'
                              : '#FFFFFF',
                            borderColor: selected
                              ? '#146EF5'
                              : '#C9D7E8',
                            color: selected
                              ? '#FFFFFF'
                              : '#344054',
                            fontSize: 12,
                            fontWeight: 700,
                            minHeight: 38,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: selected
                                ? '#0E5FD8'
                                : '#F8FAFC',
                              borderColor: selected
                                ? '#0E5FD8'
                                : '#98A2B3',
                            },
                            '&.Mui-disabled': {
                              bgcolor: selected
                                ? '#D7E7FC'
                                : '#F2F4F7',
                            },
                          }}
                          variant="outlined"
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </Box>

                  <Box
                    sx={{
                      bgcolor: '#FFFFFF',
                      border: '1px solid #DDE7F3',
                      borderRadius: 2.25,
                      mt: 2.25,
                      p: 1.75,
                    }}
                  >
                    <Stack
                      alignItems="flex-start"
                      direction="row"
                      spacing={1.25}
                    >
                      <PublicOutlinedIcon
                        sx={{
                          color: '#146EF5',
                          fontSize: 20,
                          mt: 0.1,
                        }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontSize={12} fontWeight={800}>
                          Timezone
                        </Typography>

                        <Typography
                          color="text.secondary"
                          fontSize={12}
                          sx={{
                            mt: 0.25,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {timeZoneId}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          fontSize={10.5}
                          sx={{ mt: 0.5 }}
                        >
                          Automatically detected from your browser.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: '#FFF9E8',
                      border: '1px solid #FDE7A8',
                      borderRadius: 2.25,
                      mt: 2,
                      p: 1.75,
                    }}
                  >
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={0.8}
                    >
                      <LightbulbOutlinedIcon
                        sx={{
                          color: '#F79009',
                          fontSize: 19,
                        }}
                      />

                      <Typography fontSize={12.5} fontWeight={800}>
                        How it works
                      </Typography>
                    </Stack>

                    <Stack spacing={1} sx={{ mt: 1.3 }}>
                      {[
                        'Your reminder is scheduled before the interview.',
                        'You can receive it in-app and by registered email.',
                        'Interview time is stored in UTC.',
                        'Editing or disabling the reminder updates the schedule.',
                      ].map((text) => (
                        <Stack
                          alignItems="flex-start"
                          direction="row"
                          key={text}
                          spacing={0.8}
                        >
                          <CheckOutlinedIcon
                            sx={{
                              color: '#146EF5',
                              flex: '0 0 auto',
                              fontSize: 16,
                              mt: 0.1,
                            }}
                          />

                          <Typography
                            color="text.secondary"
                            fontSize={11.5}
                          >
                            {text}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #E3EAF3',
                  borderRadius: 3,
                  p: 2.25,
                }}
              >
                <Stack alignItems="center" direction="row" spacing={1}>
                  <LightbulbOutlinedIcon
                    sx={{ color: '#7F56D9', fontSize: 20 }}
                  />

                  <Typography fontSize={14} fontWeight={800}>
                    Quick tips
                  </Typography>
                </Stack>

                <Stack spacing={1.1} sx={{ mt: 1.5 }}>
                  {[
                    'Double-check the interview date and time.',
                    'Add expected rounds to organize your preparation.',
                    'Keep your preparation status updated.',
                  ].map((text) => (
                    <Stack
                      alignItems="flex-start"
                      direction="row"
                      key={text}
                      spacing={0.9}
                    >
                      <CheckCircleOutlineIcon
                        sx={{
                          color: '#12B76A',
                          flex: '0 0 auto',
                          fontSize: 17,
                          mt: 0.05,
                        }}
                      />

                      <Typography
                        color="text.secondary"
                        fontSize={11.5}
                      >
                        {text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E8EDF4',
          gap: 1,
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        <Button
          disabled={pending}
          onClick={onClose}
          sx={{
            minWidth: 92,
            textTransform: 'none',
          }}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          disabled={pending || !company || !interviewAt}
          onClick={() => void submit()}
          sx={{
            minWidth: 145,
            textTransform: 'none',
          }}
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
  /(?:https?:\/\/|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|(?:\+?\d[\d\s-]{8,}\d))/i.test(
    value,
  );


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



  const steps = ['Basics', 'Rounds', 'Summary & tips', 'Review'];
  const cardSx = {
    bgcolor: '#FFFFFF',
    border: '1px solid #DDE6F2',
    borderRadius: '14px',
    boxShadow: '0 8px 24px rgba(16, 42, 86, 0.05)',
  } as const;
  const guidanceItems = [
    { icon: <GroupsOutlinedIcon />, title: 'Help other candidates', text: 'Share real interview experiences', bg: '#E8F8EF', color: '#12B76A' },
    { icon: <TrendingUpOutlinedIcon />, title: 'Build a better community', text: 'Your insights create real impact.', bg: '#F1EAFE', color: '#7F56D9' },
    { icon: <VerifiedUserOutlinedIcon />, title: 'Stay anonymous', text: 'Your identity stays private', bg: '#FFF4DB', color: '#F79009' },
  ];
  const formatMonth = (value: string): string => {
    if (!value) return 'Not specified';
    const [year, monthValue] = value.split('-').map(Number);
    if (!year || !monthValue) return value;
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(year, monthValue - 1, 1));
  };
  const setReviewStep = (target: number) => {
    setError(null);
    setStep(target);
  };

  return (
    <Dialog fullScreen onClose={state.isLoading ? undefined : onClose} open={open}>
      <DialogTitle sx={{ bgcolor: '#0B2A5B', color: '#FFFFFF', minHeight: 58, px: { xs: 2, md: 4 }, py: 1.4 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <Box sx={{ bgcolor: '#146EF5', borderRadius: '50%', display: 'grid', height: 36, placeItems: 'center', width: 36 }}>
              <QuestionAnswerOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography component="span" fontSize={18} fontWeight={800}>Share an interview insight</Typography>
          </Stack>
          <Button color="inherit" disabled={state.isLoading} onClick={onClose} startIcon={<CloseIcon />} sx={{ fontWeight: 700, textTransform: 'none' }}>Close</Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: '#F7FAFE', p: 0 }}>
        {submitted ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: '78vh', px: 2, textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ color: '#12B76A', fontSize: 72 }} />
            <Typography component="h2" variant="h2">Thanks for helping future candidates</Typography>
            <Typography color="text.secondary">Your insight is pending review. We’ll notify you once it is published.</Typography>
            <Button onClick={onSubmitted} variant="contained">View my contributions</Button>
          </Stack>
        ) : (
          <Box sx={{ minHeight: 'calc(100vh - 132px)', pb: 3 }}>
            <Box sx={{ maxWidth: 1260, mx: 'auto', px: { xs: 2, md: 3 }, pt: 2 }}>
              <Stepper activeStep={step} alternativeLabel sx={{ mb: 2.5, mx: 'auto', maxWidth: 760 }}>
                {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
              </Stepper>
              {error ? <Alert aria-live="assertive" severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : safeError(error)}</Alert> : null}

              {step === 0 ? (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ ...cardSx, bgcolor: '#F4F9FF', height: '100%', p: { xs: 2.5, md: 3.5 } }}>
                      <Stack alignItems="center" spacing={2.25} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Box sx={{ bgcolor: '#E3F0FF', borderRadius: '50%', display: 'grid', height: 120, placeItems: 'center', width: 120 }}><GroupsOutlinedIcon sx={{ color: '#146EF5', fontSize: 64 }} /></Box>
                        <Box><Typography component="h2" fontSize={{ xs: 25, md: 28 }} fontWeight={800} lineHeight={1.15}>Help the community by sharing your interview experience</Typography><Typography color="text.secondary" sx={{ mt: 1.5 }}>Your interview insights help other candidates prepare better and get hired. Share what you learned and make a difference.</Typography></Box>
                        <Stack spacing={1.7} sx={{ width: '100%' }}>
                          {[...guidanceItems, { icon: <LockOutlinedIcon />, title: 'Insights are reviewed', text: 'Ensures quality and helpful content', bg: '#FFE8EE', color: '#F04468' }].map((item) => (
                            <Stack alignItems="center" direction="row" key={item.title} spacing={1.4} textAlign="left"><Box sx={{ bgcolor: item.bg, borderRadius: '50%', color: item.color, display: 'grid', flex: '0 0 auto', height: 38, placeItems: 'center', width: 38, '& svg': { fontSize: 19 } }}>{item.icon}</Box><Box><Typography fontSize={14} fontWeight={800}>{item.title}</Typography><Typography color="text.secondary" fontSize={12}>{item.text}</Typography></Box></Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ ...cardSx, p: { xs: 2.5, md: 3.5 } }}>
                      <Stack spacing={1.8}>
                        <Stack alignItems="center" direction="row" spacing={1.5}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: '50%', color: '#146EF5', display: 'grid', height: 44, placeItems: 'center', width: 44 }}><BusinessOutlinedIcon /></Box><Box><Typography component="h2" fontSize={22} fontWeight={800}>Basic information</Typography><Typography color="text.secondary" fontSize={13}>Tell us about the company, role, and your interview details.</Typography></Box></Stack>
                        <InterviewCompanyAutocomplete allowCreate onChange={setCompany} required value={company} />
                        <TextField error={Boolean(fieldError(error, 'RoleTitle'))} helperText={fieldError(error, 'RoleTitle')} label="Role title" onChange={(event) => setRole(event.target.value)} placeholder="e.g. .Net Developer, Frontend Developer, Data Analyst" required value={role} />
                        <TextField label="Experience level" onChange={(event) => setLevel(event.target.value)} placeholder="e.g. 2 - 4 years" value={level} />
                        <TextField InputLabelProps={{ shrink: true }} label="Interview month" onChange={(event) => setMonth(event.target.value)} required type="month" value={month} />
                        <FormControl><InputLabel id="share-difficulty">Difficulty</InputLabel><Select label="Difficulty" labelId="share-difficulty" onChange={(event) => setDifficulty(event.target.value)} value={difficulty}>{Object.values(InterviewDifficulty).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
                        <FormControl><InputLabel id="share-format">Interview format</InputLabel><Select label="Interview format" labelId="share-format" onChange={(event) => setFormat(event.target.value)} value={format}><MenuItem value="">Not specified</MenuItem>{Object.values(InterviewFormat).map((item) => <MenuItem key={item} value={item}>{formatLabels[item]}</MenuItem>)}</Select></FormControl>
                        <FormControl><InputLabel id="share-outcome">Outcome</InputLabel><Select label="Outcome" labelId="share-outcome" onChange={(event) => setOutcome(event.target.value)} value={outcome}><MenuItem value="">Not specified</MenuItem>{Object.values(InterviewOutcome).map((item) => <MenuItem key={item} value={item}>{item === InterviewOutcome.PreferNotToSay ? 'Prefer not to say' : item}</MenuItem>)}</Select></FormControl>
                        <Box sx={{ bgcolor: '#F7F9FC', border: '1px solid #E5EAF2', borderRadius: 2, px: 1.5, py: 0.6 }}><FormControlLabel control={<Checkbox checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />} label={<Box><Typography fontSize={13} fontWeight={800}>Share as Anonymous candidate</Typography><Typography color="text.secondary" fontSize={11}>Your name and profile will not be shown with this insight.</Typography></Box>} /></Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              ) : null}

              {step === 1 ? (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, lg: 3 }}>
                    <Box sx={{ p: { xs: 1, lg: 1.5 } }}><Stack spacing={2.2}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: 4, display: 'grid', height: 155, placeItems: 'center' }}><WorkOutlineIcon sx={{ color: '#146EF5', fontSize: 82 }} /></Box><Box><Typography component="h2" fontSize={27} fontWeight={800} lineHeight={1.15}>Add interview rounds you went through</Typography><Typography color="text.secondary" sx={{ mt: 1.2 }}>Share the questions, process and your experience for each round. This helps other candidates prepare better.</Typography></Box>{guidanceItems.map((item) => <Stack alignItems="center" direction="row" key={item.title} spacing={1.3}><Box sx={{ bgcolor: item.bg, borderRadius: '50%', color: item.color, display: 'grid', height: 38, placeItems: 'center', width: 38 }}>{item.icon}</Box><Box><Typography fontSize={13} fontWeight={800}>{item.title}</Typography><Typography color="text.secondary" fontSize={11}>{item.text}</Typography></Box></Stack>)}</Stack></Box>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Stack spacing={2}>
                      {rounds.map((round, index) => (
                        <Paper elevation={0} key={index} sx={{ ...cardSx, p: { xs: 2, md: 2.75 } }}>
                          <Stack spacing={1.7}>
                            <Stack alignItems="center" direction="row" justifyContent="space-between"><Typography component="h3" fontSize={19} fontWeight={800}>Round {index + 1}</Typography><Stack direction="row"><Tooltip title="Move round up"><span><IconButton disabled={index === 0} onClick={() => moveRound(index, -1)} size="small"><ArrowUpwardIcon /></IconButton></span></Tooltip><Tooltip title="Move round down"><span><IconButton disabled={index === rounds.length - 1} onClick={() => moveRound(index, 1)} size="small"><ArrowDownwardIcon /></IconButton></span></Tooltip>{rounds.length > 1 ? <Tooltip title="Remove round"><IconButton color="error" onClick={() => setRounds((items) => items.filter((_, i) => i !== index))} size="small"><DeleteOutlineIcon /></IconButton></Tooltip> : null}</Stack></Stack>
                            <FormControl required><InputLabel id={`round-type-${index}`}>Round type</InputLabel><Select label="Round type" labelId={`round-type-${index}`} onChange={(event) => updateRound(index, { roundType: event.target.value })} value={round.roundType}>{roundValues.map((item) => <MenuItem key={item} value={item}>{roundLabels[item]}</MenuItem>)}</Select></FormControl>
                            <TextField label="Round title" onChange={(event) => updateRound(index, { roundTitle: event.target.value })} placeholder="e.g. Coding Round" value={round.roundTitle ?? ''} />
                            <TextField inputProps={{ max: 1440, min: 1 }} label="Approximate duration (minutes)" onChange={(event) => updateRound(index, { durationMinutes: event.target.value ? Number(event.target.value) : null })} type="number" value={round.durationMinutes ?? ''} />
                            <TextField inputProps={{ maxLength: 1000 }} label="Questions or topics asked" multiline minRows={3} onChange={(event) => updateRound(index, { questionsOrTopics: event.target.value })} placeholder="Share the actual questions or topics discussed" required value={round.questionsOrTopics} helperText={`${round.questionsOrTopics.length}/1000`} FormHelperTextProps={{ sx: { textAlign: 'right' } }} />
                            <TextField inputProps={{ maxLength: 1000 }} label="Preparation advice" multiline minRows={2} onChange={(event) => updateRound(index, { candidateAdvice: event.target.value })} placeholder="What would you recommend candidates prepare for this round?" value={round.candidateAdvice ?? ''} helperText={`${(round.candidateAdvice ?? '').length}/1000`} FormHelperTextProps={{ sx: { textAlign: 'right' } }} />
                          </Stack>
                        </Paper>
                      ))}
                      <Button disabled={rounds.length >= 12} onClick={() => setRounds((items) => [...items, newRound()])} startIcon={<AddIcon />} sx={{ border: '1px dashed #77A9FF', borderRadius: 2.5, minHeight: 72, textTransform: 'none' }} variant="outlined"><Box><Typography fontWeight={800}>Add another round</Typography><Typography color="text.secondary" fontSize={11}>Add all the rounds you went through (Technical, HR, Manager, etc.)</Typography></Box></Button>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 3 }}>
                    <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: 16 }}>
                      <Paper elevation={0} sx={{ ...cardSx, p: 2.5 }}><Typography component="h3" fontSize={19} fontWeight={800}>Timeline preview</Typography><Typography color="text.secondary" fontSize={12} sx={{ mb: 2 }}>This is how your interview process will look</Typography><Stack spacing={1.8}>{rounds.map((round, index) => <Stack alignItems="center" direction="row" key={`preview-${index}`} spacing={1.4}><Box sx={{ bgcolor: index === 0 ? '#146EF5' : '#98A2B3', borderRadius: '50%', color: '#fff', display: 'grid', flex: '0 0 auto', fontSize: 12, fontWeight: 800, height: 30, placeItems: 'center', width: 30 }}>{index + 1}</Box><Box><Typography fontSize={13} fontWeight={800}>{round.roundTitle || `Round ${index + 1}`}</Typography><Typography color="text.secondary" fontSize={11}>{roundLabels[round.roundType]}{round.durationMinutes ? ` · ${round.durationMinutes} minutes` : ' · Not specified'}</Typography></Box></Stack>)}</Stack></Paper>
                      <Paper elevation={0} sx={{ ...cardSx, bgcolor: '#EEF7FF', p: 2.5 }}><Stack alignItems="center" direction="row" spacing={1}><LightbulbOutlinedIcon color="primary" /><Typography fontWeight={800}>Tips for good insights</Typography></Stack><Stack spacing={1.1} sx={{ mt: 1.8 }}>{['Mention the actual questions or topics','Share your honest experience','Include preparation tips','Keep it professional and helpful','Avoid sharing confidential information'].map((text) => <Stack direction="row" key={text} spacing={1}><CheckOutlinedIcon sx={{ color: '#146EF5', fontSize: 18 }} /><Typography color="text.secondary" fontSize={12}>{text}</Typography></Stack>)}</Stack></Paper>
                    </Stack>
                  </Grid>
                </Grid>
              ) : null}

              {step === 2 ? (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, lg: 3 }}><Box sx={{ p: { xs: 1, lg: 1.5 } }}><Stack spacing={2.2}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: 4, display: 'grid', height: 155, placeItems: 'center' }}><DescriptionOutlinedIcon sx={{ color: '#146EF5', fontSize: 82 }} /></Box><Box><Typography component="h2" fontSize={27} fontWeight={800} lineHeight={1.15}>Share your experience summary and tips</Typography><Typography color="text.secondary" sx={{ mt: 1.2 }}>Help future candidates by sharing what you experienced and how to prepare.</Typography></Box>{guidanceItems.map((item) => <Stack alignItems="center" direction="row" key={item.title} spacing={1.3}><Box sx={{ bgcolor: item.bg, borderRadius: '50%', color: item.color, display: 'grid', height: 38, placeItems: 'center', width: 38 }}>{item.icon}</Box><Box><Typography fontSize={13} fontWeight={800}>{item.title}</Typography><Typography color="text.secondary" fontSize={11}>{item.text}</Typography></Box></Stack>)}</Stack></Box></Grid>
                  <Grid size={{ xs: 12, lg: 6 }}><Stack spacing={2}>
                    <Paper elevation={0} sx={{ ...cardSx, p: 2.5 }}><Stack alignItems="center" direction="row" spacing={1.4} sx={{ mb: 2 }}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: '50%', color: '#146EF5', display: 'grid', height: 42, placeItems: 'center', width: 42 }}><DescriptionOutlinedIcon /></Box><Box><Typography fontSize={19} fontWeight={800}>Process summary</Typography><Typography color="text.secondary" fontSize={12}>Tell us about the overall interview process.</Typography></Box></Stack><TextField error={Boolean(fieldError(error, 'ProcessSummary'))} helperText={fieldError(error, 'ProcessSummary') ?? `${summary.length}/2000`} inputProps={{ maxLength: 2000 }} label="Process summary" multiline minRows={4} onChange={(event) => setSummary(event.target.value)} placeholder="Share your overall interview experience (e.g. total rounds, type of questions, difficulty, what to expect, etc.)" required value={summary} FormHelperTextProps={{ sx: { textAlign: fieldError(error, 'ProcessSummary') ? 'left' : 'right' } }} /></Paper>
                    <Paper elevation={0} sx={{ ...cardSx, p: 2.5 }}><Stack alignItems="center" direction="row" spacing={1.4} sx={{ mb: 2 }}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: '50%', color: '#146EF5', display: 'grid', height: 42, placeItems: 'center', width: 42 }}><LightbulbOutlinedIcon /></Box><Box><Typography fontSize={19} fontWeight={800}>Preparation tips</Typography><Typography color="text.secondary" fontSize={12}>Share tips that can help other candidates.</Typography></Box></Stack><TextField error={Boolean(fieldError(error, 'PreparationTips'))} helperText={fieldError(error, 'PreparationTips') ?? `${tips.length}/2000`} inputProps={{ maxLength: 2000 }} label="Preparation tips" multiline minRows={4} onChange={(event) => setTips(event.target.value)} placeholder="What should candidates focus on? Topics to prepare, resources, important things to know, etc." required value={tips} FormHelperTextProps={{ sx: { textAlign: fieldError(error, 'PreparationTips') ? 'left' : 'right' } }} /><Box sx={{ bgcolor: '#EEF7FF', borderRadius: 2, mt: 2, p: 2 }}><Typography fontSize={13} fontWeight={800}>Guidelines for sharing</Typography>{['Share only your own genuine experience.','Do not include confidential company information.','Be helpful and respectful.','Focus on preparation tips and learning outcomes.'].map((text) => <Stack alignItems="center" direction="row" key={text} spacing={0.8} sx={{ mt: 0.7 }}><CheckCircleOutlineIcon sx={{ color: '#146EF5', fontSize: 16 }} /><Typography color="text.secondary" fontSize={12}>{text}</Typography></Stack>)}</Box><FormControl error={Boolean(fieldError(error, 'ContentGuidelinesAccepted'))} sx={{ mt: 1 }}><FormControlLabel control={<Checkbox checked={accepted} onChange={(event) => setAccepted(event.target.checked)} required />} label={<Typography fontSize={12}>I confirm this is my own experience and contains no confidential company content, personal information, credentials, or protected assessment answers.</Typography>} />{fieldError(error, 'ContentGuidelinesAccepted') ? <FormHelperText>{fieldError(error, 'ContentGuidelinesAccepted')}</FormHelperText> : null}</FormControl></Paper>
                  </Stack></Grid>
                  <Grid size={{ xs: 12, lg: 3 }}><Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: 16 }}><Paper elevation={0} sx={{ ...cardSx, p: 2.25 }}><Typography fontWeight={800}>Example summary</Typography><Box sx={{ bgcolor: '#ECFDF3', borderRadius: 2, mt: 1.5, p: 2 }}><Typography color="text.secondary" fontSize={12} fontStyle="italic">Describe the number and type of rounds, the main topics discussed, and the overall difficulty.</Typography></Box></Paper><Paper elevation={0} sx={{ ...cardSx, p: 2.25 }}><Typography fontWeight={800}>Example preparation tips</Typography><Box sx={{ bgcolor: '#F4F0FF', borderRadius: 2, mt: 1.5, p: 2 }}><Typography color="text.secondary" fontSize={12} fontStyle="italic">Mention topics to revise, useful practice areas, and what helped you prepare.</Typography></Box></Paper><Paper elevation={0} sx={{ ...cardSx, bgcolor: '#FFF9E8', p: 2.25 }}><Stack alignItems="center" direction="row" spacing={1}><LightbulbOutlinedIcon sx={{ color: '#F79009' }} /><Typography fontWeight={800}>What makes a helpful insight?</Typography></Stack>{['Real experience from your interview','Clear and honest information','Useful preparation tips','Mention actual topics and question types','Keep it professional and respectful'].map((text) => <Stack direction="row" key={text} spacing={1} sx={{ mt: 1 }}><CheckOutlinedIcon sx={{ color: '#146EF5', fontSize: 18 }} /><Typography color="text.secondary" fontSize={12}>{text}</Typography></Stack>)}</Paper></Stack></Grid>
                </Grid>
              ) : null}

              {step === 3 ? (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, lg: 3 }}><Box sx={{ p: { xs: 1, lg: 1.5 } }}><Stack spacing={2.2}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: 4, display: 'grid', height: 155, placeItems: 'center' }}><CheckCircleOutlineIcon sx={{ color: '#12B76A', fontSize: 82 }} /></Box><Box><Typography component="h2" fontSize={27} fontWeight={800} lineHeight={1.15}>Review and publish your insight</Typography><Typography color="text.secondary" sx={{ mt: 1.2 }}>Please review your details before submitting. Once submitted, it will be reviewed and published.</Typography></Box>{guidanceItems.map((item) => <Stack alignItems="center" direction="row" key={item.title} spacing={1.3}><Box sx={{ bgcolor: item.bg, borderRadius: '50%', color: item.color, display: 'grid', height: 38, placeItems: 'center', width: 38 }}>{item.icon}</Box><Box><Typography fontSize={13} fontWeight={800}>{item.title}</Typography><Typography color="text.secondary" fontSize={11}>{item.text}</Typography></Box></Stack>)}</Stack></Box></Grid>
                  <Grid size={{ xs: 12, lg: 6 }}><Paper elevation={0} sx={{ ...cardSx, p: 2.5 }}><Stack alignItems="center" direction="row" spacing={1.4} sx={{ mb: 2 }}><Box sx={{ bgcolor: '#EAF4FF', borderRadius: '50%', color: '#146EF5', display: 'grid', height: 42, placeItems: 'center', width: 42 }}><VisibilityOutlinedIcon /></Box><Box><Typography fontSize={20} fontWeight={800}>Review your insight</Typography><Typography color="text.secondary" fontSize={12}>Check all the details below. You can go back and edit if needed.</Typography></Box></Stack><Stack spacing={1.7}>
                    <Paper elevation={0} sx={{ border: '1px solid #E5EAF2', borderRadius: 2, p: 2 }}><Stack alignItems="center" direction="row" justifyContent="space-between"><Typography fontWeight={800}>Basic information</Typography><Button onClick={() => setReviewStep(0)} size="small" startIcon={<EditOutlinedIcon />}>Edit</Button></Stack><Grid container spacing={0.6} sx={{ mt: 1 }}>{[['Company', company?.companyName ?? ''],['Role', role],['Experience level', level || 'Not specified'],['Interview month', formatMonth(month)],['Difficulty', difficulty],['Interview format', format ? formatLabels[format] : 'Not specified'],['Outcome', outcome ? (outcome === InterviewOutcome.PreferNotToSay ? 'Prefer not to say' : outcome) : 'Not specified']].map(([label, value]) => <Grid key={label} size={12}><Stack direction="row"><Typography color="text.secondary" fontSize={12} sx={{ width: 135 }}>{label}</Typography><Typography fontSize={12} fontWeight={700}>{value}</Typography></Stack></Grid>)}</Grid></Paper>
                    <Paper elevation={0} sx={{ border: '1px solid #E5EAF2', borderRadius: 2, p: 2 }}><Stack alignItems="center" direction="row" justifyContent="space-between"><Typography fontWeight={800}>Interview rounds ({rounds.length})</Typography><Button onClick={() => setReviewStep(1)} size="small" startIcon={<EditOutlinedIcon />}>Edit</Button></Stack><Stack spacing={0.8} sx={{ mt: 1 }}>{rounds.map((round, index) => <Stack alignItems="center" direction="row" key={`review-round-${index}`} spacing={1} sx={{ bgcolor: '#F7F9FC', borderRadius: 1.5, p: 1 }}><Box sx={{ bgcolor: '#146EF5', borderRadius: '50%', color: '#fff', display: 'grid', fontSize: 11, height: 24, placeItems: 'center', width: 24 }}>{index + 1}</Box><Typography fontSize={12} fontWeight={800} sx={{ minWidth: 110 }}>{round.roundTitle || roundLabels[round.roundType]}</Typography><AccessTimeOutlinedIcon sx={{ color: 'text.secondary', fontSize: 16 }} /><Typography color="text.secondary" fontSize={11}>{round.durationMinutes ? `${round.durationMinutes} minutes` : 'Not specified'}</Typography><Typography color="text.secondary" fontSize={11} noWrap sx={{ flex: 1 }}>{round.questionsOrTopics}</Typography></Stack>)}</Stack></Paper>
                    <Paper elevation={0} sx={{ border: '1px solid #E5EAF2', borderRadius: 2, p: 2 }}><Stack alignItems="center" direction="row" justifyContent="space-between"><Typography fontWeight={800}>Summary & preparation tips</Typography><Button onClick={() => setReviewStep(2)} size="small" startIcon={<EditOutlinedIcon />}>Edit</Button></Stack><Stack spacing={1.2} sx={{ mt: 1 }}><Box><Typography color="text.secondary" fontSize={11} fontWeight={700}>Process summary</Typography><Typography fontSize={12}>{summary}</Typography></Box><Box><Typography color="text.secondary" fontSize={11} fontWeight={700}>Preparation tips</Typography><Typography fontSize={12}>{tips}</Typography></Box></Stack></Paper>
                  </Stack></Paper></Grid>
                  <Grid size={{ xs: 12, lg: 3 }}><Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: 16 }}><Paper elevation={0} sx={{ ...cardSx, bgcolor: '#ECFDF3', p: 2.4 }}><Stack alignItems="flex-start" direction="row" spacing={1.2}><VerifiedUserOutlinedIcon sx={{ color: '#12B76A' }} /><Box><Typography fontWeight={800}>Your insight will be reviewed</Typography><Typography color="text.secondary" fontSize={12} sx={{ mt: 1 }}>It will not be public until it is approved. We ensure all content is genuine, helpful, and follows our community guidelines.</Typography></Box></Stack></Paper><Paper elevation={0} sx={{ ...cardSx, bgcolor: '#EEF7FF', p: 2.4 }}><Typography fontWeight={800}>What happens next?</Typography>{[['1','Submit for review','Submit your insight using the button below.'],['2','Our team reviews','We check the content for quality and guidelines.'],['3','Get published','Once approved, it will be visible to other candidates.']].map(([number,title,text]) => <Stack alignItems="flex-start" direction="row" key={number} spacing={1.2} sx={{ mt: 1.8 }}><Box sx={{ bgcolor: number === '1' ? '#146EF5' : '#98A2B3', borderRadius: '50%', color: '#fff', display: 'grid', flex: '0 0 auto', fontSize: 12, height: 30, placeItems: 'center', width: 30 }}>{number}</Box><Box><Typography fontSize={13} fontWeight={800}>{title}</Typography><Typography color="text.secondary" fontSize={11}>{text}</Typography></Box></Stack>)}</Paper></Stack></Grid>
                </Grid>
              ) : null}
            </Box>
          </Box>
        )}
      </DialogContent>

      {!submitted ? (
        <DialogActions sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #E5EAF2', minHeight: 68, px: { xs: 2, md: 4 }, py: 1.2 }}>
          <Button disabled={state.isLoading} onClick={onClose}>Cancel</Button>
          {step > 0 ? <Button disabled={state.isLoading} onClick={() => { setError(null); setStep((value) => value - 1); }} sx={{ minWidth: 82 }} variant="outlined">Back</Button> : null}
          {step < 3 ? <Button onClick={() => { if (validate()) setStep((value) => value + 1); }} sx={{ minWidth: 92 }} variant="contained">Continue</Button> : <Button disabled={state.isLoading} onClick={() => void submit()} startIcon={<SendOutlinedIcon />} sx={{ minWidth: 160 }} variant="contained">{state.isLoading ? 'Submitting…' : 'Submit for review'}</Button>}
        </DialogActions>
      ) : null}
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
