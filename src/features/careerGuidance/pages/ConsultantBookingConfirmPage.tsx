import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonthOutlined,
  Check,
  ScheduleOutlined,
} from '@mui/icons-material';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { useGetConsultantQuery } from '../api/profilesApi';
import {
  useCreateCareerBookingMutation,
  useLazyGetSlotsQuery,
} from '../api/schedulingApi';
import { guidanceRoutes } from '../utils/routes';
import {
  dateInZone,
  dateTime,
  localTimeZone,
  money,
  utcInstant,
} from '../utils/presentation';

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isGuid = (value: string) => GUID_PATTERN.test(value);

const optionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
};

const getApiErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return 'Unable to create the booking. Please try again.';
  }

  const candidate = error as {
    status?: number;
    data?: {
      message?: string;
      title?: string;
    };
  };

  if (candidate.status === 409) {
    return 'This time is no longer available. Please choose another time.';
  }

  return (
    candidate.data?.message ??
    candidate.data?.title ??
    'Unable to create the booking. Please try again.'
  );
};

interface BookingNavigationState {
  selectedStartUtc?: string;
  selectedEndUtc?: string;
}

interface BookingStepProps {
  number: number;
  label: string;
  active?: boolean;
  complete?: boolean;
}

const BookingStep = ({
  number,
  label,
  active = false,
  complete = false,
}: BookingStepProps) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: 14,
        bgcolor: active || complete ? 'primary.main' : 'grey.100',
        color: active || complete ? 'primary.contrastText' : 'text.secondary',
        border: '1px solid',
        borderColor: active || complete ? 'primary.main' : 'divider',
      }}
    >
      {complete ? <Check fontSize="small" /> : number}
    </Box>

    <Typography
      variant="body2"
      fontWeight={active ? 700 : 600}
      color={active ? 'text.primary' : 'text.secondary'}
    >
      {label}
    </Typography>
  </Stack>
);

export const ConsultantBookingConfirmPage = () => {
  const { consultantId = '', serviceId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const candidateTimeZone = useMemo(() => localTimeZone(), []);

  const navigationState =
    (location.state as BookingNavigationState | null) ?? null;

  const queryStartUtc = searchParams.get('startUtc');

  const selectedStartUtc = useMemo(() => {
    const candidate =
      queryStartUtc ?? navigationState?.selectedStartUtc ?? '';

    if (!candidate) return '';

    try {
      return utcInstant(candidate);
    } catch {
      return '';
    }
  }, [navigationState?.selectedStartUtc, queryStartUtc]);

  const validIds = isGuid(consultantId) && isGuid(serviceId);

  const profile = useGetConsultantQuery(consultantId, {
    skip: !isGuid(consultantId),
  });

  const [getSlots] = useLazyGetSlotsQuery();
  const [createBooking, createState] = useCreateCareerBookingMutation();

  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [currentRoleOrStatus, setCurrentRoleOrStatus] = useState('');
  const [sessionGoal, setSessionGoal] = useState('');
  const [questions, setQuestions] = useState('');
  const [notes, setNotes] = useState('');

  const [sessionGoalError, setSessionGoalError] = useState('');
  const [yearsError, setYearsError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [slotUnavailable, setSlotUnavailable] = useState(false);

  const consultant = profile.data;

  const service = consultant?.services.find(
    (item) => item.id === serviceId && item.isActive,
  );

  const selectedEndUtc = useMemo(() => {
    if (!selectedStartUtc || !service) return '';

    const start = new Date(selectedStartUtc);

    if (!Number.isFinite(start.getTime())) return '';

    return new Date(
      start.getTime() + service.durationMinutes * 60_000,
    ).toISOString();
  }, [selectedStartUtc, service]);

  const goBackToTime = () => {
    void navigate(guidanceRoutes.book(consultantId, serviceId));
  };

  const validate = () => {
    let valid = true;

    const trimmedGoal = sessionGoal.trim();

    if (!trimmedGoal) {
      setSessionGoalError('Session goal is required.');
      valid = false;
    } else {
      setSessionGoalError('');
    }

    if (yearsOfExperience.trim()) {
      const years = Number(yearsOfExperience);

      if (!Number.isFinite(years) || years < 0) {
        setYearsError('Enter a valid number of years.');
        valid = false;
      } else {
        setYearsError('');
      }
    } else {
      setYearsError('');
    }

    return valid;
  };

  const handleProceed = async () => {
    if (
      createState.isLoading ||
      !validIds ||
      !consultant ||
      !service ||
      !selectedStartUtc
    ) {
      return;
    }

    if (!validate()) return;

    setSubmitError('');
    setSlotUnavailable(false);

    try {
      /*
       * Re-check the exact selected slot immediately before creating the
       * booking. A booking is intentionally NOT created when this page loads.
       */
      const selectedDate = dateInZone(
  selectedStartUtc,
  candidateTimeZone,
);

const freshSlots = await getSlots({
  consultantId,
  serviceId,
  from: selectedDate,
  to: selectedDate,
}).unwrap();

      const matchingSlot = freshSlots.slots.find(
        (slot) =>
          utcInstant(slot.startUtc) === selectedStartUtc &&
          utcInstant(slot.endUtc) === selectedEndUtc,
      );

      if (!matchingSlot) {
        setSlotUnavailable(true);
        setSubmitError(
          'This time is no longer available. Please choose another time.',
        );
        return;
      }

      const parsedYears = yearsOfExperience.trim()
        ? Number(yearsOfExperience)
        : null;

      const booking = await createBooking({
        consultantId,
        serviceId,
        startUtc: selectedStartUtc,
        questionnaire: {
          targetCompany: optionalText(targetCompany),
          targetRole: optionalText(targetRole),
          yearsOfExperience: parsedYears,
          currentRoleOrStatus: optionalText(currentRoleOrStatus),
          sessionGoal: sessionGoal.trim(),
          questions: optionalText(questions),
          notes: optionalText(notes),
        },
      }).unwrap();

      void navigate(guidanceRoutes.booking(booking.id));
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  if (profile.isLoading) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    !validIds ||
    profile.isError ||
    !consultant ||
    !service
  ) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">
          We could not load this consultant or session.
        </Alert>

        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            void navigate(guidanceRoutes.marketplace);
          }}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Back to Career Guidance
        </Button>
      </Box>
    );
  }

  if (!selectedStartUtc) {
    return (
      <Box sx={{ py: 4, maxWidth: 760 }}>
        <Alert severity="warning">
          No valid session time was selected. Please choose a date and time
          before confirming your booking.
        </Alert>

        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={goBackToTime}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Choose date & time
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={goBackToTime}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back to date & time
      </Button>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 2 }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <BookingStep number={1} label="Select time" complete />

          <Divider
            sx={{
              width: { xs: 1, md: 40 },
              borderColor: 'divider',
              display: { xs: 'none', md: 'block' },
            }}
          />

          <BookingStep number={2} label="Confirm details" active />

          <Divider
            sx={{
              width: { xs: 1, md: 40 },
              borderColor: 'divider',
              display: { xs: 'none', md: 'block' },
            }}
          />

          <BookingStep number={3} label="Make payment" />

          <Divider
            sx={{
              width: { xs: 1, md: 40 },
              borderColor: 'divider',
              display: { xs: 'none', md: 'block' },
            }}
          />

          <BookingStep number={4} label="Confirmed" />
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 360px',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" fontWeight={800}>
              Confirm your session details
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.75, mb: 3 }}
            >
              Review your session and tell the consultant what you would like
              to discuss.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Avatar
                src={consultant.profileImageUrl ?? undefined}
                alt={consultant.displayName}
                sx={{
                  width: 72,
                  height: 72,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {getInitials(consultant.displayName)}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography variant="h6" fontWeight={800}>
                    {consultant.displayName}
                  </Typography>

                  {consultant.approvalLabel && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.4,
                        borderRadius: 10,
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        fontWeight: 700,
                      }}
                    >
                      {consultant.approvalLabel}
                    </Typography>
                  )}
                </Stack>

                <Typography color="text.secondary">
                  {consultant.professionalHeadline}
                </Typography>

                {(consultant.currentRole || consultant.companyName) && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {[consultant.currentRole, consultant.companyName]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.25}>
                <CalendarMonthOutlined color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date & time
                  </Typography>

                  <Typography fontWeight={700}>
                    {dateTime(selectedStartUtc, candidateTimeZone)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {candidateTimeZone}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.25}>
                <ScheduleOutlined color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>

                  <Typography fontWeight={700}>
                    {service.durationMinutes} minutes
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                onClick={goBackToTime}
                sx={{
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  textTransform: 'none',
                }}
              >
                Change time
              </Button>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              What would you like to discuss?
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, mb: 3 }}
            >
              This information helps the consultant prepare for your session.
            </Typography>

            <Stack spacing={2.25}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1fr 1fr',
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Target company"
                  value={targetCompany}
                  onChange={(event) => setTargetCompany(event.target.value)}
                  placeholder="Optional"
                  fullWidth
                />

                <TextField
                  label="Target role"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Optional"
                  fullWidth
                />

                <TextField
                  label="Years of experience"
                  value={yearsOfExperience}
                  onChange={(event) => {
                    setYearsOfExperience(event.target.value);

                    if (yearsError) {
                      setYearsError('');
                    }
                  }}
                  type="number"
                  error={Boolean(yearsError)}
                  helperText={yearsError || 'Optional'}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 0.5,
                    },
                  }}
                  fullWidth
                />

                <TextField
                  label="Current role or status"
                  value={currentRoleOrStatus}
                  onChange={(event) =>
                    setCurrentRoleOrStatus(event.target.value)
                  }
                  placeholder="e.g. Software Engineer, Student"
                  fullWidth
                />
              </Box>

              <TextField
                label="Session goal"
                value={sessionGoal}
                onChange={(event) => {
                  setSessionGoal(event.target.value);

                  if (sessionGoalError) {
                    setSessionGoalError('');
                  }
                }}
                required
                multiline
                minRows={3}
                error={Boolean(sessionGoalError)}
                helperText={
                  sessionGoalError ||
                  'Briefly describe what you want to achieve in this session.'
                }
                fullWidth
              />

              <TextField
                label="Questions"
                value={questions}
                onChange={(event) => setQuestions(event.target.value)}
                placeholder="Add specific questions you want to ask the consultant."
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                label="Additional notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional information that may help the consultant prepare."
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          </Paper>

          <Alert severity="info">
            Career guidance is provided independently by the consultant.
            CareerHarbor does not guarantee jobs, interviews, referrals, or
            hiring outcomes. Do not share employer-confidential or other
            sensitive information.
          </Alert>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            position: { lg: 'sticky' },
            top: { lg: 24 },
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Booking summary
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Consultant
              </Typography>

              <Typography fontWeight={700}>
                {consultant.displayName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Session
              </Typography>

              <Typography fontWeight={700}>{service.title}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Date & time
              </Typography>

              <Typography fontWeight={700}>
                {dateTime(selectedStartUtc, candidateTimeZone)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>

              <Typography fontWeight={700}>
                {service.durationMinutes} minutes
              </Typography>
            </Box>

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontWeight={700}>Total</Typography>

              <Typography variant="h6" fontWeight={800}>
                {money(service.price, service.currency)}
              </Typography>
            </Stack>

            {submitError && (
              <Alert severity={slotUnavailable ? 'warning' : 'error'}>
                {submitError}
              </Alert>
            )}

            {slotUnavailable && (
              <Button
                variant="outlined"
                onClick={goBackToTime}
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                Choose another time
              </Button>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={createState.isLoading || slotUnavailable}
              onClick={() => {
                void handleProceed();
              }}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              {createState.isLoading ? (
                <>
                  <CircularProgress
                    size={20}
                    color="inherit"
                    sx={{ mr: 1 }}
                  />
                  Creating booking...
                </>
              ) : (
                'Proceed to payment'
              )}
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Your booking is created only when you proceed. Payment is
              completed in the next step.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default ConsultantBookingConfirmPage;