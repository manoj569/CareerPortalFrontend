import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccessTimeOutlined,
  ArrowBack,
  ArrowForward,
  CalendarMonthOutlined,
  CheckCircle,
  LanguageOutlined,
} from '@mui/icons-material';

import { useGetConsultantQuery } from '../api/profilesApi';
import { useGetSlotsQuery } from '../api/schedulingApi';
import { GuidanceError, GuidanceLoading } from '../components/GuidanceUI';
import {
  addDays,
  dateInZone,
  localTimeZone,
  money,
  utcInstant,
} from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';

// These are calendar-date keys, not instants. UTC keeps their labels stable in every browser zone.
const formatDay = (date: string, part: 'weekday' | 'day') =>
  new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC',
    ...(part === 'weekday' ? { weekday: 'short' } : { day: 'numeric' }),
  }).format(new Date(`${date}T12:00:00Z`));

const formatFullDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));

const formatSlotTime = (value: string, timeZone: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric', minute: '2-digit', timeZone,
  }).format(new Date(utcInstant(value)));

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const BookingStep = ({
  number,
  label,
  active,
}: {
  number: number;
  label: string;
  active?: boolean;
}) => (
  <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 110 }}>
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: 14,
        bgcolor: active ? 'primary.main' : 'grey.200',
        color: active ? 'primary.contrastText' : 'text.secondary',
      }}
    >
      {number}
    </Box>

    <Typography
      variant="caption"
      fontWeight={active ? 700 : 500}
      color={active ? 'primary.main' : 'text.secondary'}
    >
      {label}
    </Typography>
  </Stack>
);

export const BookingCreatePage = () => {
  const { consultantId = '', serviceId = '' } = useParams();
  const navigate = useNavigate();

  const valid = isGuid(consultantId) && isGuid(serviceId);

  const [candidateTimeZone] = useState(localTimeZone);
  const [weekStart, setWeekStart] = useState(() =>
    addDays(dateInZone(new Date().toISOString(), candidateTimeZone), 1),
  );
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const profile = useGetConsultantQuery(consultantId, {
    skip: !valid,
  });

  const slots = useGetSlotsQuery(
    {
      consultantId,
      serviceId,
      from: weekStart,
      to: addDays(weekStart, 6),
    },
    {
      skip: !valid,
      refetchOnMountOrArgChange: true,
    },
  );

  const consultant = profile.data;

  const service = consultant?.services.find(
    (item) => item.id === serviceId && item.isActive,
  );

  const availableSlots = useMemo(
    () => slots.currentData?.slots ?? [],
    [slots.currentData?.slots],
  );

  const slotDates = useMemo(
    () => new Set(availableSlots.map(slot => dateInZone(slot.startUtc, candidateTimeZone))),
    [availableSlots, candidateTimeZone],
  );

  const dates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addDays(weekStart, index),
      ),
    [weekStart],
  );

  const activeDate = selectedDate || dates.find(date => slotDates.has(date)) || '';

  const slotsForSelectedDate = useMemo(() => {
    if (!activeDate) return [];

    return availableSlots.filter(
      (slot) =>
        dateInZone(slot.startUtc, candidateTimeZone) === activeDate,
    );
  }, [availableSlots, candidateTimeZone, activeDate]);

  const selectedSlotData = slotsForSelectedDate.find(
    (slot) => slot.startUtc === selectedSlot,
  );

  if (profile.isLoading) {
    return <GuidanceLoading />;
  }

  if (!valid || profile.isError || !consultant || !service) {
    return (
      <GuidanceError
        error={profile.error}
        retry={() => {
          if (valid) void profile.refetch();
        }}
      />
    );
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  const handlePreviousWeek = () => {
    const today = dateInZone(new Date().toISOString(), candidateTimeZone);
    const previous = addDays(weekStart, -7);

    if (previous < today) {
      setWeekStart(today);
    } else {
      setWeekStart(previous);
    }

    setSelectedDate('');
    setSelectedSlot('');
  };

  const handleNextWeek = () => {
    setWeekStart((current) => addDays(current, 7));
    setSelectedDate('');
    setSelectedSlot('');
  };

  const handleContinue = () => {
    if (!selectedSlotData) return;

    void slots
      .refetch()
      .unwrap()
      .then((fresh) => {
        const stillAvailable = fresh.slots.some(
          (slot) => slot.startUtc === selectedSlotData.startUtc && slot.endUtc === selectedSlotData.endUtc,
        );

        if (!stillAvailable) {
          setSelectedSlot('');
          return;
        }

        void navigate(
          `${guidanceRoutes.book(consultantId, serviceId)}/confirm`,
          {
            state: {
              selectedStartUtc: selectedSlotData.startUtc,
              selectedEndUtc: selectedSlotData.endUtc,
            },
          },
        );

        void navigate(
  `${guidanceRoutes.book(
    consultantId,
    serviceId,
  )}/confirm?startUtc=${encodeURIComponent(selectedSlotData.startUtc)}`,
  {
    state: {
      selectedStartUtc: selectedSlotData.startUtc,
      selectedEndUtc: selectedSlotData.endUtc,
    },
  },
);
      })
      .catch(() => {
        // The query error state provides retry controls.
      });
  };

  return (
    <Box sx={{ pb: 5 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => {
          void navigate(guidanceRoutes.profile(consultantId));
        }}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back to consultant profile
      </Button>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          gap={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Book a career guidance session
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Choose a convenient date and available time for your session.
            </Typography>
          </Box>

          <Stack
            direction="row"
            alignItems="flex-start"
            sx={{
              width: { xs: '100%', md: 'auto' },
              overflowX: 'auto',
              pb: 0.5,
            }}
          >
            <BookingStep number={1} label="Select time" active />

            <Divider
              sx={{
                width: 38,
                mt: 2.1,
                borderColor: 'divider',
              }}
            />

            <BookingStep number={2} label="Confirm details" />

            <Divider
              sx={{
                width: 38,
                mt: 2.1,
                borderColor: 'divider',
              }}
            />

            <BookingStep number={3} label="Make payment" />

            <Divider
              sx={{
                width: 38,
                mt: 2.1,
                borderColor: 'divider',
              }}
            />

            <BookingStep number={4} label="Confirmed" />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
        }}
      >
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
              fontSize: 24,
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
              <Typography variant="h5" fontWeight={800}>
                {consultant.displayName}
              </Typography>

              {consultant.approvalLabel && (
                <Chip
                  size="small"
                  icon={<CheckCircle />}
                  label={consultant.approvalLabel}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {consultant.professionalHeadline}
            </Typography>

            {(consultant.currentRole || consultant.companyName) && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {[consultant.currentRole, consultant.companyName]
                  .filter(Boolean)
                  .join(' at ')}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              minWidth: { sm: 210 },
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography fontWeight={700}>
              {service.title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 0.75 }}
            >
              <AccessTimeOutlined fontSize="small" />

              <Typography variant="body2">
                {service.durationMinutes} minutes
              </Typography>
            </Stack>

            <Typography
              variant="h6"
              fontWeight={800}
              color="primary.main"
              sx={{ mt: 0.75 }}
            >
              {money(service.price, service.currency)}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {!consultant.isAcceptingBookings && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This consultant is not currently accepting new bookings.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.65fr) minmax(300px, 0.75fr)',
          },
          gap: 3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Select date and time
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.75 }}
              >
                <LanguageOutlined
                  fontSize="small"
                  color="action"
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Times are shown in your timezone: {candidateTimeZone}
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                startIcon={<ArrowBack />}
                onClick={handlePreviousWeek}
                sx={{ textTransform: 'none' }}
              >
                Previous
              </Button>

              <Typography fontWeight={700}>
                {formatFullDate(weekStart)}
              </Typography>

              <Button
                endIcon={<ArrowForward />}
                onClick={handleNextWeek}
                sx={{ textTransform: 'none' }}
              >
                Next
              </Button>
            </Stack>

            {slots.isFetching ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: 220 }}
              >
                <CircularProgress />
              </Stack>
            ) : slots.isError ? (
              <GuidanceError
                error={slots.error}
                retry={() => {
                  void slots.refetch();
                }}
              />
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(4, 1fr)',
                      md: 'repeat(7, 1fr)',
                    },
                    gap: 1,
                  }}
                  aria-label="Available dates"
                >
                  {dates.map((date) => {
                    const hasSlots = slotDates.has(date);
                    const active = activeDate === date;

                    return (
                      <Button
                        key={date}
                        aria-label={formatFullDate(date)}
                        aria-pressed={active}
                        variant={active ? 'contained' : 'outlined'}
                        disabled={
                          !hasSlots ||
                          !consultant.isAcceptingBookings
                        }
                        onClick={() => handleSelectDate(date)}
                        sx={{
                          minHeight: 72,
                          borderRadius: 2,
                          textTransform: 'none',
                          flexDirection: 'column',
                        }}
                      >
                        <Typography
                          component="span"
                          variant="caption"
                        >
                          {formatDay(date, 'weekday')}
                        </Typography>

                        <Typography
                          component="span"
                          fontWeight={800}
                        >
                          {formatDay(date, 'day')}
                        </Typography>
                      </Button>
                    );
                  })}
                </Box>

                {!availableSlots.length && (
                  <Alert severity="info">
                    No available sessions were found for this week. Try the
                    next week.
                  </Alert>
                )}

                {activeDate && (
                  <Box>
                    <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                      Available times for {formatFullDate(activeDate)}
                    </Typography>

                    {slotsForSelectedDate.length ? (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(4, 1fr)',
                          },
                          gap: 1.25,
                        }}
                        role="group"
                        aria-label="Available session times"
                      >
                        {slotsForSelectedDate.map((slot) => (
                          <Button
                            key={slot.startUtc}
                            variant={
                              selectedSlot === slot.startUtc
                                ? 'contained'
                                : 'outlined'
                            }
                            aria-pressed={
                              selectedSlot === slot.startUtc
                            }
                            onClick={() =>
                              setSelectedSlot(slot.startUtc)
                            }
                            sx={{
                              minHeight: 48,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 700,
                            }}
                          >
                            {formatSlotTime(slot.startUtc, candidateTimeZone)}
                          </Button>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info">
                        No available times for this date.
                      </Alert>
                    )}
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Paper>

        <Paper
          component="section"
          aria-label="Session details"
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            height: 'fit-content',
            position: { lg: 'sticky' },
            top: { lg: 24 },
          }}
        >
          <Typography variant="h5" fontWeight={800}>
            Session details
          </Typography>

          <Stack spacing={2.25} sx={{ mt: 3 }}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Consultant
              </Typography>

              <Typography fontWeight={700}>
                {consultant.displayName}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" spacing={1.25}>
              <CalendarMonthOutlined color="action" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Date
                </Typography>

                <Typography fontWeight={600}>
                  {activeDate
                    ? formatFullDate(activeDate)
                    : 'Select a date'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <AccessTimeOutlined color="action" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Time
                </Typography>

                <Typography fontWeight={600}>
                  {selectedSlotData
                    ? formatSlotTime(selectedSlotData.startUtc, candidateTimeZone)
                    : 'Select a time'}
                </Typography>

                {selectedSlotData && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {candidateTimeZone}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography color="text.secondary">
                Duration
              </Typography>

              <Typography fontWeight={700}>
                {service.durationMinutes} minutes
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography color="text.secondary">
                Session fee
              </Typography>

              <Typography variant="h6" fontWeight={800}>
                {money(service.price, service.currency)}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForward />}
              disabled={
                !selectedSlotData ||
                slots.isFetching ||
                !consultant.isAcceptingBookings
              }
              onClick={handleContinue}
              sx={{
                mt: 1,
                minHeight: 50,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Continue
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Your booking is not created until you confirm your details on
              the next step.
            </Typography>
          </Stack>
        </Paper>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          What happens next?
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {[
            {
              number: '1',
              title: 'Confirm details',
              description:
                'Tell the consultant what you want to discuss.',
            },
            {
              number: '2',
              title: 'Complete payment',
              description:
                'Pay the session fee through the available payment flow.',
            },
            {
              number: '3',
              title: 'Session access',
              description:
                'Session joining details are provided when they are available for your booking.',
            },
            {
              number: '4',
              title: 'Share feedback',
              description:
                'Eligible completed sessions can be reviewed after the session.',
            },
          ].map((item) => (
            <Stack
              key={item.number}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {item.number}
              </Box>

              <Box>
                <Typography fontWeight={700}>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.35 }}
                >
                  {item.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};