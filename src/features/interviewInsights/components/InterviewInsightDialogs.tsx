import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import type { CompanyFacetOption } from '@/features/jobs/types/jobModels';
import {
  isInterviewInsightsApiError,
  useAddInsightFeedbackMutation,
  useCreateInterviewInsightMutation,
  useCreateInterviewScheduleMutation,
  useReportInterviewInsightMutation,
  useUpdateInterviewScheduleMutation,
} from '../api/interviewInsightsApi';
import {
  InsightHelpfulness,
  InsightReportReason,
  InterviewDifficulty,
  InterviewMatch,
  InterviewOutcome,
  InterviewRoundType,
  type InterviewRoundRequest,
  type InterviewScheduleResponse,
} from '../types/interviewInsightModels';

const safeError = (error: unknown): string =>
  isInterviewInsightsApiError(error)
    ? error.message
    : 'We could not complete that request. Please try again.';

const toLocalInputValue = (value: string): string => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

interface ScheduleDialogProps {
  companies: CompanyFacetOption[];
  initialCompanyId?: string;
  initialJobId?: string;
  initialRoleTitle?: string;
  onClose: () => void;
  open: boolean;
  schedule?: InterviewScheduleResponse;
}

export const InterviewScheduleDialog = ({
  companies,
  initialCompanyId = '',
  initialJobId,
  initialRoleTitle = '',
  onClose,
  open,
  schedule,
}: ScheduleDialogProps) => {
  const [companyId, setCompanyId] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [interviewAt, setInterviewAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createSchedule, createState] = useCreateInterviewScheduleMutation();
  const [updateSchedule, updateState] = useUpdateInterviewScheduleMutation();
  const pending = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!open) return;
    setCompanyId(schedule?.companyId ?? initialCompanyId);
    setRoleTitle(schedule?.roleTitle ?? initialRoleTitle);
    setInterviewAt(schedule ? toLocalInputValue(schedule.interviewAtUtc) : '');
    setError(null);
  }, [initialCompanyId, initialRoleTitle, open, schedule]);

  const submit = async () => {
    if (!companyId || !interviewAt) {
      setError('Select a company and interview date and time.');
      return;
    }
    const parsedDate = new Date(interviewAt);
    if (Number.isNaN(parsedDate.getTime())) {
      setError('Enter a valid interview date and time.');
      return;
    }
    setError(null);
    try {
      if (schedule) {
        await updateSchedule({
          id: schedule.id,
          data: {
            interviewAtUtc: parsedDate.toISOString(),
            roleTitle: roleTitle.trim() || null,
            status: schedule.status,
          },
        }).unwrap();
      } else {
        await createSchedule({
          companyId,
          interviewAtUtc: parsedDate.toISOString(),
          jobId: initialJobId ?? null,
          roleTitle: roleTitle.trim() || null,
        }).unwrap();
      }
      onClose();
    } catch (requestError: unknown) {
      setError(safeError(requestError));
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={pending ? undefined : onClose} open={open}>
      <DialogTitle>{schedule ? 'Edit interview schedule' : 'Add interview schedule'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Alert severity="info">
            Schedules are private. Career Harbor uses them only to unlock relevant preparation
            content and post-interview feedback.
          </Alert>
          {error ? (
            <Alert aria-live="assertive" severity="error">
              {error}
            </Alert>
          ) : null}
          <FormControl disabled={Boolean(schedule) || pending} required>
            <InputLabel id="schedule-company-label">Company</InputLabel>
            <Select
              label="Company"
              labelId="schedule-company-label"
              onChange={(event) => setCompanyId(event.target.value)}
              value={companyId}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {companies.length === 0 ? (
            <Alert severity="warning">
              No companies with active jobs are available. Open a job first and add its schedule
              from the job details page.
            </Alert>
          ) : null}
          <TextField
            disabled={pending}
            inputProps={{ maxLength: 160 }}
            label="Role title"
            onChange={(event) => setRoleTitle(event.target.value)}
            value={roleTitle}
          />
          <TextField
            disabled={pending}
            InputLabelProps={{ shrink: true }}
            label="Interview date and time"
            onChange={(event) => setInterviewAt(event.target.value)}
            required
            type="datetime-local"
            value={interviewAt}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={pending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={pending || !companyId || !interviewAt}
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
  companies: CompanyFacetOption[];
  onClose: () => void;
  onSubmitted: () => void;
  open: boolean;
}

export const ShareInterviewInsightDialog = ({
  companies,
  onClose,
  onSubmitted,
  open,
}: ShareDialogProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [companyId, setCompanyId] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interviewMonth, setInterviewMonth] = useState('');
  const [difficulty, setDifficulty] = useState(InterviewDifficulty.Moderate);
  const [outcome, setOutcome] = useState<InterviewOutcome | ''>('');
  const [rounds, setRounds] = useState<InterviewRoundRequest[]>([newRound()]);
  const [processSummary, setProcessSummary] = useState('');
  const [preparationTips, setPreparationTips] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createInsight, createState] = useCreateInterviewInsightMutation();

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setCompanyId('');
    setRoleTitle('');
    setExperienceLevel('');
    setInterviewMonth('');
    setDifficulty(InterviewDifficulty.Moderate);
    setOutcome('');
    setRounds([newRound()]);
    setProcessSummary('');
    setPreparationTips('');
    setIsAnonymous(false);
    setAccepted(false);
    setError(null);
  }, [open]);

  const selectedCompany = companies.find((company) => company.id === companyId)?.name;
  const validateStep = (): boolean => {
    if (activeStep === 0 && (!companyId || !roleTitle.trim() || !interviewMonth)) {
      setError('Company, role, and interview month are required.');
      return false;
    }
    if (activeStep === 1 && rounds.some((round) => !round.questionsOrTopics.trim())) {
      setError('Add the questions or topics for every interview round.');
      return false;
    }
    if (activeStep === 2 && (!processSummary.trim() || !preparationTips.trim() || !accepted)) {
      setError('Process summary, preparation tips, and the safety acknowledgement are required.');
      return false;
    }
    const content = [
      processSummary,
      preparationTips,
      ...rounds.flatMap((round) => [round.questionsOrTopics, round.candidateAdvice ?? '']),
    ];
    if (content.some(containsPrivateContact)) {
      setError('Remove email addresses, phone numbers, and links before continuing.');
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async () => {
    if (!validateStep()) return;
    try {
      await createInsight({
        companyId,
        contentGuidelinesAccepted: accepted,
        experienceLevel: experienceLevel.trim() || null,
        interviewDateMonth: `${interviewMonth}-01`,
        isAnonymous,
        jobId: null,
        outcome: outcome || null,
        overallDifficulty: difficulty,
        preparationTips: preparationTips.trim(),
        processSummary: processSummary.trim(),
        roleTitle: roleTitle.trim(),
        rounds: rounds.map((round) => ({
          ...round,
          candidateAdvice: round.candidateAdvice?.trim() || null,
          questionsOrTopics: round.questionsOrTopics.trim(),
          roundTitle: round.roundTitle?.trim() || null,
        })),
      }).unwrap();
      onSubmitted();
    } catch (requestError: unknown) {
      setError(safeError(requestError));
    }
  };

  const updateRound = (index: number, patch: Partial<InterviewRoundRequest>) => {
    setRounds((current) =>
      current.map((round, roundIndex) => (roundIndex === index ? { ...round, ...patch } : round)),
    );
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={createState.isLoading ? undefined : onClose}
      open={open}
    >
      <DialogTitle>Share an interview insight</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Alert severity="info">Submitted insights are reviewed before publication.</Alert>
          <Stepper activeStep={activeStep} alternativeLabel>
            {['Company and role', 'Interview rounds', 'Experience and safety', 'Review'].map(
              (label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ),
            )}
          </Stepper>
          {error ? (
            <Alert aria-live="assertive" severity="error">
              {error}
            </Alert>
          ) : null}

          {activeStep === 0 ? (
            <Stack spacing={2}>
              <FormControl required>
                <InputLabel id="insight-company-label">Company</InputLabel>
                <Select
                  label="Company"
                  labelId="insight-company-label"
                  onChange={(event) => setCompanyId(event.target.value)}
                  value={companyId}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                inputProps={{ maxLength: 160 }}
                label="Role title"
                onChange={(event) => setRoleTitle(event.target.value)}
                required
                value={roleTitle}
              />
              <TextField
                inputProps={{ maxLength: 80 }}
                label="Experience level"
                onChange={(event) => setExperienceLevel(event.target.value)}
                value={experienceLevel}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                label="Interview month"
                onChange={(event) => setInterviewMonth(event.target.value)}
                required
                type="month"
                value={interviewMonth}
              />
              <FormControl required>
                <InputLabel id="difficulty-label">Overall difficulty</InputLabel>
                <Select
                  label="Overall difficulty"
                  labelId="difficulty-label"
                  onChange={(event) => setDifficulty(Number(event.target.value))}
                  value={difficulty}
                >
                  <MenuItem value={InterviewDifficulty.Easy}>Easy</MenuItem>
                  <MenuItem value={InterviewDifficulty.Moderate}>Moderate</MenuItem>
                  <MenuItem value={InterviewDifficulty.Hard}>Hard</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel id="outcome-label">Outcome</InputLabel>
                <Select
                  label="Outcome"
                  labelId="outcome-label"
                  onChange={(event) => setOutcome(event.target.value)}
                  value={outcome}
                >
                  <MenuItem value="">Prefer not to specify</MenuItem>
                  <MenuItem value={InterviewOutcome.Awaiting}>Awaiting</MenuItem>
                  <MenuItem value={InterviewOutcome.Rejected}>Rejected</MenuItem>
                  <MenuItem value={InterviewOutcome.Selected}>Selected</MenuItem>
                  <MenuItem value={InterviewOutcome.Withdrawn}>Withdrawn</MenuItem>
                  <MenuItem value={InterviewOutcome.PreferNotToSay}>Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          ) : null}

          {activeStep === 1 ? (
            <Stack spacing={2.5}>
              {rounds.map((round, index) => (
                <Stack
                  key={index}
                  spacing={2}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}
                >
                  <Stack alignItems="center" direction="row" justifyContent="space-between">
                    <Typography component="h3" fontWeight={700}>
                      Round {index + 1}
                    </Typography>
                    {rounds.length > 1 ? (
                      <Button
                        color="error"
                        onClick={() =>
                          setRounds((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        startIcon={<DeleteOutlineIcon />}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </Stack>
                  <FormControl required>
                    <InputLabel id={`round-type-${index}`}>Round type</InputLabel>
                    <Select
                      label="Round type"
                      labelId={`round-type-${index}`}
                      onChange={(event) =>
                        updateRound(index, {
                          roundType: Number(event.target.value),
                        })
                      }
                      value={round.roundType}
                    >
                      {Object.entries({
                        HR: 1,
                        Technical: 2,
                        Managerial: 3,
                        Coding: 4,
                        Aptitude: 5,
                        'Group discussion': 6,
                        Other: 7,
                      }).map(([label, value]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    inputProps={{ maxLength: 160 }}
                    label="Round title"
                    onChange={(event) => updateRound(index, { roundTitle: event.target.value })}
                    value={round.roundTitle ?? ''}
                  />
                  <TextField
                    inputProps={{ min: 1, max: 1440 }}
                    label="Duration in minutes"
                    onChange={(event) =>
                      updateRound(index, {
                        durationMinutes: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    type="number"
                    value={round.durationMinutes ?? ''}
                  />
                  <TextField
                    inputProps={{ maxLength: 3000 }}
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
                    inputProps={{ maxLength: 2000 }}
                    label="Advice for candidates"
                    multiline
                    minRows={2}
                    onChange={(event) =>
                      updateRound(index, { candidateAdvice: event.target.value })
                    }
                    value={round.candidateAdvice ?? ''}
                  />
                </Stack>
              ))}
              <Button
                disabled={rounds.length >= 12}
                onClick={() => setRounds((current) => [...current, newRound()])}
                startIcon={<AddIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add another round
              </Button>
            </Stack>
          ) : null}

          {activeStep === 2 ? (
            <Stack spacing={2}>
              <TextField
                inputProps={{ maxLength: 3000 }}
                label="Process summary"
                multiline
                minRows={4}
                onChange={(event) => setProcessSummary(event.target.value)}
                required
                value={processSummary}
              />
              <TextField
                inputProps={{ maxLength: 3000 }}
                label="Preparation tips"
                multiline
                minRows={4}
                onChange={(event) => setPreparationTips(event.target.value)}
                required
                value={preparationTips}
              />
              <Alert severity="warning">
                Use plain text. Do not include phone numbers, email addresses, links, private
                employer documents, answer keys, or confidential material.
              </Alert>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                  />
                }
                label="Publish as Anonymous candidate"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    required
                  />
                }
                label="I confirm this contains no confidential material, personal data, assessment leaks, or NDA-protected content."
              />
            </Stack>
          ) : null}

          {activeStep === 3 ? (
            <Stack spacing={1.5}>
              <Typography variant="h3">Review before submitting</Typography>
              <Typography>
                <strong>Company:</strong> {selectedCompany}
              </Typography>
              <Typography>
                <strong>Role:</strong> {roleTitle}
              </Typography>
              <Typography>
                <strong>Interview month:</strong> {interviewMonth}
              </Typography>
              <Typography>
                <strong>Rounds:</strong> {rounds.length}
              </Typography>
              <Typography>
                <strong>Author:</strong>{' '}
                {isAnonymous ? 'Anonymous candidate' : 'Your candidate name'}
              </Typography>
              <Alert severity="info">
                Your insight will start as Pending review. It will not be public until an
                administrator approves it.
              </Alert>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={createState.isLoading} onClick={onClose}>
          Cancel
        </Button>
        {activeStep > 0 ? (
          <Button
            disabled={createState.isLoading}
            onClick={() => {
              setError(null);
              setActiveStep((step) => step - 1);
            }}
          >
            Back
          </Button>
        ) : null}
        {activeStep < 3 ? (
          <Button
            onClick={() => {
              if (validateStep()) setActiveStep((step) => step + 1);
            }}
            variant="contained"
          >
            Continue
          </Button>
        ) : (
          <Button
            disabled={createState.isLoading}
            onClick={() => void submit()}
            variant="contained"
          >
            {createState.isLoading ? 'Submitting…' : 'Submit for review'}
          </Button>
        )}
      </DialogActions>
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
  const [submitFeedback, submitState] = useAddInsightFeedbackMutation();
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setScheduleId(schedules[0]?.id ?? '');
    setHelpfulness('');
    setMatch('');
    setFeedback('');
    setError(null);
    setSuccess(null);
  }, [open, schedules]);

  const submit = async () => {
    if (!scheduleId || !helpfulness || !match) {
      setError('Select your interview, helpfulness, and interview match.');
      return;
    }
    try {
      const response = await submitFeedback({
        id: insightId,
        data: {
          candidateInterviewScheduleId: scheduleId,
          feedback: feedback.trim() || null,
          helpfulness,
          interviewMatch: match,
        },
      }).unwrap();
      setSuccess(
        `Feedback recorded. ${response.helpfulConfirmedCount} candidates have confirmed this insight was helpful.`,
      );
    } catch (requestError: unknown) {
      setError(safeError(requestError));
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={submitState.isLoading ? undefined : onClose}
      open={open}
    >
      <DialogTitle>Did this insight help you?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          {!success ? (
            <>
              <FormControl required>
                <InputLabel id="feedback-schedule-label">Your completed interview</InputLabel>
                <Select
                  label="Your completed interview"
                  labelId="feedback-schedule-label"
                  onChange={(event) => setScheduleId(event.target.value)}
                  value={scheduleId}
                >
                  {schedules.map((schedule) => (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {schedule.companyName} —{' '}
                      {new Date(schedule.interviewAtUtc).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl required>
                <InputLabel id="helpfulness-label">Helpfulness</InputLabel>
                <Select
                  label="Helpfulness"
                  labelId="helpfulness-label"
                  onChange={(event) => setHelpfulness(Number(event.target.value))}
                  value={helpfulness}
                >
                  <MenuItem value={InsightHelpfulness.Helped}>Helped</MenuItem>
                  <MenuItem value={InsightHelpfulness.PartlyHelped}>Partly helped</MenuItem>
                  <MenuItem value={InsightHelpfulness.DidNotHelp}>Did not help</MenuItem>
                </Select>
              </FormControl>
              <FormControl required>
                <InputLabel id="match-label">Did the interview match?</InputLabel>
                <Select
                  label="Did the interview match?"
                  labelId="match-label"
                  onChange={(event) => setMatch(Number(event.target.value))}
                  value={match}
                >
                  <MenuItem value={InterviewMatch.Matched}>Matched</MenuItem>
                  <MenuItem value={InterviewMatch.PartlyMatched}>Partly matched</MenuItem>
                  <MenuItem value={InterviewMatch.DidNotMatch}>Did not match</MenuItem>
                </Select>
              </FormControl>
              <TextField
                inputProps={{ maxLength: 500 }}
                label="Additional feedback (optional)"
                multiline
                minRows={2}
                onChange={(event) => setFeedback(event.target.value)}
                value={feedback}
              />
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={submitState.isLoading} onClick={onClose}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success ? (
          <Button
            disabled={submitState.isLoading || schedules.length === 0}
            onClick={() => void submit()}
            variant="contained"
          >
            {submitState.isLoading ? 'Submitting…' : 'Submit feedback'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

interface ReportDialogProps {
  insightId: string;
  onClose: () => void;
  open: boolean;
}

export const ReportInsightDialog = ({ insightId, onClose, open }: ReportDialogProps) => {
  const [reason, setReason] = useState(InsightReportReason.Inaccurate);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [report, reportState] = useReportInterviewInsightMutation();
  const labels = useMemo(
    () =>
      new Map<number, string>([
        [1, 'Confidential content'],
        [2, 'Inaccurate'],
        [3, 'Abuse'],
        [4, 'Spam'],
        [5, 'Personal data'],
        [6, 'Other'],
      ]),
    [],
  );
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
      onClose();
    } catch (requestError: unknown) {
      setError(safeError(requestError));
    }
  };
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={reportState.isLoading ? undefined : onClose}
      open={open}
    >
      <DialogTitle>Report interview insight?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography>
            Report content that is unsafe, inaccurate, abusive, or exposes private information.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <FormControl required>
            <InputLabel id="report-reason-label">Reason</InputLabel>
            <Select
              label="Reason"
              labelId="report-reason-label"
              onChange={(event) => setReason(Number(event.target.value))}
              value={reason}
            >
              {Array.from(labels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            inputProps={{ maxLength: 500 }}
            label="Details (optional)"
            multiline
            minRows={3}
            onChange={(event) => setDetails(event.target.value)}
            value={details}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={reportState.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="error"
          disabled={reportState.isLoading}
          onClick={() => void submit()}
          variant="contained"
        >
          {reportState.isLoading ? 'Reporting…' : 'Confirm report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
