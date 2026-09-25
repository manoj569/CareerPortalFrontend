import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ArrowForward,
  CalendarMonthOutlined,
  Check,
  Close,
  LightbulbOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import {
  type WeeklyAvailabilityWindow,
  useGetConsultantAvailabilityQuery,
  useGetConsultantOnboardingQuery,
  useSaveConsultantAvailabilityMutation,
} from '../api/onboardingApi';
import { guidanceError, guidanceErrorMessage } from '../utils/errors';
import { guidanceRoutes } from '../utils/routes';

interface DayDefinition {
  dayOfWeek: number;
  label: string;
  shortLabel: string;
}

interface LocalWindow {
  key: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  enabled: boolean;
  windows: LocalWindow[];
}

const DAYS: DayDefinition[] = [
  { dayOfWeek: 1, label: 'Monday', shortLabel: 'Mon' },
  { dayOfWeek: 2, label: 'Tuesday', shortLabel: 'Tue' },
  { dayOfWeek: 3, label: 'Wednesday', shortLabel: 'Wed' },
  { dayOfWeek: 4, label: 'Thursday', shortLabel: 'Thu' },
  { dayOfWeek: 5, label: 'Friday', shortLabel: 'Fri' },
  { dayOfWeek: 6, label: 'Saturday', shortLabel: 'Sat' },
  { dayOfWeek: 0, label: 'Sunday', shortLabel: 'Sun' },
];

const TIME_ZONES = [
  {
    value: 'Asia/Kolkata',
    label: 'India Standard Time (IST) — Asia/Kolkata',
  },
  {
    value: 'Asia/Dubai',
    label: 'Gulf Standard Time — Asia/Dubai',
  },
  {
    value: 'Europe/London',
    label: 'United Kingdom — Europe/London',
  },
  {
    value: 'America/New_York',
    label: 'Eastern Time — America/New_York',
  },
  {
    value: 'America/Los_Angeles',
    label: 'Pacific Time — America/Los_Angeles',
  },
  {
    value: 'Asia/Singapore',
    label: 'Singapore Time — Asia/Singapore',
  },
];

const createKey = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createDefaultWindow = (): LocalWindow => ({
  key: createKey(),
  startTime: '09:00',
  endTime: '17:00',
});

const createEmptySchedule = (): Record<number, DayAvailability> => {
  const schedule: Record<number, DayAvailability> = {};

  for (const day of DAYS) {
    schedule[day.dayOfWeek] = {
      enabled: false,
      windows: [],
    };
  }

  return schedule;
};

const getDayAvailability = (
  schedule: Record<number, DayAvailability>,
  dayOfWeek: number,
): DayAvailability =>
  schedule[dayOfWeek] ?? {
    enabled: false,
    windows: [],
  };

const toInputTime = (value: string) => value.slice(0, 5);

const toApiTime = (value: string) =>
  value.length === 5 ? `${value}:00` : value;

const timeToMinutes = (value: string) => {
  const [hoursText = '0', minutesText = '0'] = value.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return hours * 60 + minutes;
};

const formatTime = (value: string) => {
  if (!value) return '';

  const [hoursText = '0', minutesText = '0'] = value.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const normalizeWindows = (
  windows: WeeklyAvailabilityWindow[],
): Record<number, DayAvailability> => {
  const schedule = createEmptySchedule();

  for (const day of DAYS) {
    const matching = windows
      .filter(
        (window) =>
          window.dayOfWeek === day.dayOfWeek && window.isActive,
      )
      .sort(
        (a, b) =>
          timeToMinutes(toInputTime(a.startTime)) -
          timeToMinutes(toInputTime(b.startTime)),
      );

    schedule[day.dayOfWeek] = {
      enabled: matching.length > 0,
      windows: matching.map((window) => ({
        key: createKey(),
        startTime: toInputTime(window.startTime),
        endTime: toInputTime(window.endTime),
      })),
    };
  }

  return schedule;
};

export default function ConsultantAvailabilityPage() {
  useDocumentMetadata(
    'Availability | Become a consultant | Career Harbor',
    'Set your weekly Career Harbor consultation availability.',
  );

  const navigate = useNavigate();

  const {
    data: onboarding,
    isLoading: onboardingLoading,
    error: onboardingError,
  } = useGetConsultantOnboardingQuery();

  const {
    data: availability,
    isLoading: availabilityLoading,
    isFetching,
    error: availabilityError,
    refetch,
  } = useGetConsultantAvailabilityQuery();

  const [saveAvailability, { isLoading: isSaving }] =
    useSaveConsultantAvailabilityMutation();

  const [timeZoneId, setTimeZoneId] = useState('Asia/Kolkata');

  const [schedule, setSchedule] = useState<
    Record<number, DayAvailability>
  >(createEmptySchedule);

  const [hydratedRevision, setHydratedRevision] = useState<string | null>(
    null,
  );

  const [validationError, setValidationError] = useState<string | null>(
    null,
  );

  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !availability ||
      hydratedRevision === availability.revision
    ) {
      return;
    }

    setTimeZoneId(availability.timeZoneId || 'Asia/Kolkata');
    setSchedule(normalizeWindows(availability.windows ?? []));
    setHydratedRevision(availability.revision);
  }, [availability, hydratedRevision]);

  const activeWindowCount = useMemo(
    () =>
      DAYS.reduce((total, day) => {
        const dayState = getDayAvailability(
          schedule,
          day.dayOfWeek,
        );

        return (
          total +
          (dayState.enabled ? dayState.windows.length : 0)
        );
      }, 0),
    [schedule],
  );

  const availableDayCount = useMemo(
    () =>
      DAYS.filter((day) => {
        const dayState = getDayAvailability(
          schedule,
          day.dayOfWeek,
        );

        return dayState.enabled && dayState.windows.length > 0;
      }).length,
    [schedule],
  );

  const toggleDay = (dayOfWeek: number, checked: boolean) => {
    setSchedule((current) => {
      const currentDay = getDayAvailability(current, dayOfWeek);

      return {
        ...current,
        [dayOfWeek]: {
          enabled: checked,
          windows: checked
            ? currentDay.windows.length > 0
              ? currentDay.windows
              : [createDefaultWindow()]
            : currentDay.windows,
        },
      };
    });

    setValidationError(null);
    setSaveError(null);
  };

  const addWindow = (dayOfWeek: number) => {
    setSchedule((current) => {
      const currentDay = getDayAvailability(current, dayOfWeek);

      return {
        ...current,
        [dayOfWeek]: {
          enabled: true,
          windows: [
            ...currentDay.windows,
            createDefaultWindow(),
          ],
        },
      };
    });

    setValidationError(null);
    setSaveError(null);
  };

  const removeWindow = (dayOfWeek: number, key: string) => {
    setSchedule((current) => {
      const currentDay = getDayAvailability(current, dayOfWeek);

      const remaining = currentDay.windows.filter(
        (window) => window.key !== key,
      );

      return {
        ...current,
        [dayOfWeek]: {
          enabled: remaining.length > 0,
          windows: remaining,
        },
      };
    });

    setValidationError(null);
    setSaveError(null);
  };

  const updateWindow = (
    dayOfWeek: number,
    key: string,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    setSchedule((current) => {
      const currentDay = getDayAvailability(current, dayOfWeek);

      return {
        ...current,
        [dayOfWeek]: {
          ...currentDay,
          windows: currentDay.windows.map((window) =>
            window.key === key
              ? {
                  ...window,
                  [field]: value,
                }
              : window,
          ),
        },
      };
    });

    setValidationError(null);
    setSaveError(null);
  };

  const buildWindows = (): WeeklyAvailabilityWindow[] =>
    DAYS.flatMap((day) => {
      const dayState = getDayAvailability(
        schedule,
        day.dayOfWeek,
      );

      if (!dayState.enabled) {
        return [];
      }

      return dayState.windows.map((window) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: toApiTime(window.startTime),
        endTime: toApiTime(window.endTime),
        isActive: true,
      }));
    });

  const validate = () => {
    if (!timeZoneId.trim()) {
      return 'Select a timezone.';
    }

    const windows = buildWindows();

    if (windows.length === 0) {
      return 'Add at least one weekly availability window.';
    }

    if (windows.length > 28) {
      return 'You can add up to 28 weekly availability windows.';
    }

    for (const day of DAYS) {
      const dayState = getDayAvailability(
        schedule,
        day.dayOfWeek,
      );

      if (!dayState.enabled) continue;

      if (dayState.windows.length === 0) {
        return `Add at least one time slot for ${day.label}.`;
      }

      const sorted = [...dayState.windows].sort(
        (a, b) =>
          timeToMinutes(a.startTime) -
          timeToMinutes(b.startTime),
      );

      for (const [index, window] of sorted.entries()) {
        if (!window.startTime || !window.endTime) {
          return `Complete all time slots for ${day.label}.`;
        }

        const start = timeToMinutes(window.startTime);
        const end = timeToMinutes(window.endTime);
        const duration = end - start;

        if (end <= start) {
          return `${day.label}: end time must be after start time.`;
        }

        if (duration < 15) {
          return `${day.label}: each availability window must be at least 15 minutes.`;
        }

        if (duration > 12 * 60) {
          return `${day.label}: each availability window can be at most 12 hours.`;
        }

        const previous =
          index > 0 ? sorted[index - 1] : undefined;

        if (
          previous &&
          timeToMinutes(window.startTime) <
            timeToMinutes(previous.endTime)
        ) {
          return `${day.label}: availability windows cannot overlap.`;
        }
      }
    }

    return null;
  };

  const save = async (goNext: boolean) => {
    if (!availability || isSaving) return;

    const problem = validate();

    if (problem) {
      setValidationError(problem);
      return;
    }

    setValidationError(null);
    setSaveError(null);

    try {
      const result = await saveAvailability({
        timeZoneId,
        isAcceptingBookings: false,
        windows: buildWindows(),
        revision: availability.revision,
      }).unwrap();

      setHydratedRevision(result.revision);

      if (goNext) {
        await navigate(
          guidanceRoutes.consultantOnboardingReview,
        );
      } else {
        await navigate(guidanceRoutes.marketplace);
      }
    } catch (cause: unknown) {
      if (guidanceError(cause).status === 409) {
        await refetch();
      }

      setSaveError(guidanceErrorMessage(cause));
    }
  };

  const isLoading =
    onboardingLoading || availabilityLoading;

  const loadError =
    onboardingError || availabilityError;

  if (isLoading) {
    return (
      <Box
        minHeight={450}
        display="grid"
        sx={{ placeItems: 'center' }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary">
            Loading availability…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (loadError || !onboarding || !availability) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        {guidanceErrorMessage(loadError)}
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ pb: 5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Career Guidance &nbsp;›&nbsp; Become a consultant
        &nbsp;›&nbsp;
        <Box component="span" color="text.primary">
          Create profile
        </Box>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {[
          'Basic information',
          'Professional details',
          'Expertise & services',
          'Availability',
          'Review & submit',
        ].map((step, index) => {
          const complete = index < 3;
          const active = index === 3;

          return (
            <Box key={step}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    bgcolor:
                      complete || active
                        ? 'primary.main'
                        : 'grey.100',
                    color:
                      complete || active
                        ? 'primary.contrastText'
                        : 'text.secondary',
                  }}
                >
                  {complete ? (
                    <Check fontSize="small" />
                  ) : (
                    index + 1
                  )}
                </Box>

                <Typography
                  variant="body2"
                  fontWeight={active ? 800 : 600}
                  color={
                    complete || active
                      ? 'primary.main'
                      : 'text.secondary'
                  }
                >
                  {step}
                </Typography>
              </Stack>

              <Box
                sx={{
                  mt: 1,
                  height: 3,
                  borderRadius: 20,
                  bgcolor:
                    complete || active
                      ? 'primary.main'
                      : 'grey.200',
                }}
              />
            </Box>
          );
        })}
      </Box>

      <Box>
        <Typography variant="h4" fontWeight={850}>
          Set your availability
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.75 }}
        >
          Choose when you are generally available for career
          guidance sessions.
        </Typography>
      </Box>

      {validationError && (
        <Alert severity="warning">
          {validationError}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error">{saveError}</Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2.6fr) minmax(280px, 1fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <CalendarMonthOutlined color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={850}
                  >
                    Weekly availability
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Set your regular weekly schedule. You can
                    add multiple time slots for the same day.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Stack
              spacing={0}
              divider={<Divider />}
            >
              {DAYS.map((day) => {
                const dayState = getDayAvailability(
                  schedule,
                  day.dayOfWeek,
                );

                return (
                  <Box
                    key={day.dayOfWeek}
                    sx={{
                      p: 2.5,
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: '155px minmax(0, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                      >
                        <Checkbox
                          checked={dayState.enabled}
                          onChange={(event) =>
                            toggleDay(
                              day.dayOfWeek,
                              event.target.checked,
                            )
                          }
                          inputProps={{
                            'aria-label': `${day.label} available`,
                          }}
                        />

                        <Typography fontWeight={750}>
                          {day.label}
                        </Typography>
                      </Stack>
                    </Box>

                    {!dayState.enabled ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          alignSelf: 'center',
                          py: 1,
                        }}
                      >
                        Unavailable
                      </Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        {dayState.windows.map(
                          (window) => (
                            <Stack
                              key={window.key}
                              direction={{
                                xs: 'column',
                                sm: 'row',
                              }}
                              spacing={1.25}
                              alignItems={{
                                xs: 'stretch',
                                sm: 'center',
                              }}
                            >
                              <TextField
                                type="time"
                                size="small"
                                label="Start"
                                value={window.startTime}
                                onChange={(event) =>
                                  updateWindow(
                                    day.dayOfWeek,
                                    window.key,
                                    'startTime',
                                    event.target.value,
                                  )
                                }
                                slotProps={{
                                  inputLabel: {
                                    shrink: true,
                                  },
                                  htmlInput: {
                                    step: 900,
                                  },
                                }}
                                sx={{
                                  width: {
                                    sm: 165,
                                  },
                                }}
                              />

                              <Typography
                                color="text.secondary"
                                sx={{
                                  display: {
                                    xs: 'none',
                                    sm: 'block',
                                  },
                                }}
                              >
                                –
                              </Typography>

                              <TextField
                                type="time"
                                size="small"
                                label="End"
                                value={window.endTime}
                                onChange={(event) =>
                                  updateWindow(
                                    day.dayOfWeek,
                                    window.key,
                                    'endTime',
                                    event.target.value,
                                  )
                                }
                                slotProps={{
                                  inputLabel: {
                                    shrink: true,
                                  },
                                  htmlInput: {
                                    step: 900,
                                  },
                                }}
                                sx={{
                                  width: {
                                    sm: 165,
                                  },
                                }}
                              />

                              <IconButton
                                aria-label={`Remove ${day.label} time slot`}
                                onClick={() =>
                                  removeWindow(
                                    day.dayOfWeek,
                                    window.key,
                                  )
                                }
                              >
                                <Close />
                              </IconButton>
                            </Stack>
                          ),
                        )}

                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() =>
                            addWindow(
                              day.dayOfWeek,
                            )
                          }
                          sx={{
                            alignSelf: 'flex-start',
                            textTransform: 'none',
                            fontWeight: 700,
                          }}
                        >
                          Add time slot
                        </Button>
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              p: 3,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <ScheduleOutlined color="primary" />

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={850}
                >
                  Timezone
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Your availability is stored using this
                  timezone.
                </Typography>
              </Box>
            </Stack>

            <TextField
              select
              fullWidth
              label="Timezone"
              value={timeZoneId}
              onChange={(event) => {
                setTimeZoneId(event.target.value);
                setValidationError(null);
                setSaveError(null);
              }}
              sx={{ mt: 2.5 }}
            >
              {TIME_ZONES.map((zone) => (
                <MenuItem
                  key={zone.value}
                  value={zone.value}
                >
                  {zone.label}
                </MenuItem>
              ))}
            </TextField>

            <Alert
              severity="info"
              sx={{ mt: 2 }}
            >
              Session times can later be displayed to job
              seekers in their relevant timezone. Your weekly
              schedule remains based on the timezone selected
              here.
            </Alert>
          </Paper>
        </Stack>

        <Stack spacing={2.5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#effbf4',
            }}
          >
            <Typography fontWeight={850}>
              Step 4 of 5
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              You currently have {activeWindowCount}{' '}
              {activeWindowCount === 1
                ? 'time slot'
                : 'time slots'}{' '}
              across {availableDayCount}{' '}
              {availableDayCount === 1
                ? 'day'
                : 'days'}
              .
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#f6f2ff',
            }}
          >
            <Stack
              direction="row"
              spacing={1.2}
            >
              <LightbulbOutlined color="primary" />

              <Box>
                <Typography fontWeight={850}>
                  Availability tips
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75 }}
                >
                  Add only times you can usually honor. You
                  can use multiple slots on the same day when
                  your schedule has a break.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
            }}
          >
            <Typography fontWeight={850}>
              Your weekly schedule
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              {DAYS.map((day) => {
                const dayState = getDayAvailability(
                  schedule,
                  day.dayOfWeek,
                );

                return (
                  <Stack
                    key={day.dayOfWeek}
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {day.shortLabel}
                    </Typography>

                    <Box textAlign="right">
                      {!dayState.enabled ||
                      dayState.windows.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Unavailable
                        </Typography>
                      ) : (
                        dayState.windows.map(
                          (window) => (
                            <Typography
                              key={window.key}
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatTime(
                                window.startTime,
                              )}{' '}
                              –{' '}
                              {formatTime(
                                window.endTime,
                              )}
                            </Typography>
                          ),
                        )
                      )}
                    </Box>
                  </Stack>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {timeZoneId}
            </Typography>
          </Paper>

          <Alert severity="info">
            Saving your schedule during onboarding does not
            make your profile bookable yet. Booking
            availability is enabled only when the profile
            reaches the appropriate approved state.
          </Alert>
        </Stack>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: '#f4f8ff',
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          spacing={2}
        >
          <Button
            startIcon={<ArrowBack />}
            disabled={isSaving}
            onClick={() => {
              void navigate(
                guidanceRoutes.consultantOnboardingExpertise,
              );
            }}
          >
            Back
          </Button>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
          >
            <Button
              variant="outlined"
              disabled={isSaving || isFetching}
              onClick={() => {
                void save(false);
              }}
            >
              Save and exit
            </Button>

            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              disabled={isSaving || isFetching}
              onClick={() => {
                void save(true);
              }}
            >
              {isSaving
                ? 'Saving…'
                : 'Next: Review & submit'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}