import { useEffect, useMemo, useState } from 'react';
import {
  AccessTimeRounded,
  AddRounded,
  CalendarMonthRounded,
  DeleteOutlineRounded,
  EventBusyRounded,
  PublicRounded,
  SaveRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import {
  useAddAvailabilityExceptionMutation,
  useDeleteAvailabilityExceptionMutation,
  useGetAvailabilityExceptionsQuery,
  useGetAvailabilityQuery,
  useSaveAvailabilityMutation,
} from '../api/schedulingApi';

import {
  DayOfWeek,
  type WeeklyWindow,
} from '../types';

import { useGuidanceAction } from '../hooks/useGuidanceAction';

const DAYS: Array<{
  value: DayOfWeek;
  label: string;
}> = [
  {
    value: DayOfWeek.Monday,
    label: 'Monday',
  },
  {
    value: DayOfWeek.Tuesday,
    label: 'Tuesday',
  },
  {
    value: DayOfWeek.Wednesday,
    label: 'Wednesday',
  },
  {
    value: DayOfWeek.Thursday,
    label: 'Thursday',
  },
  {
    value: DayOfWeek.Friday,
    label: 'Friday',
  },
  {
    value: DayOfWeek.Saturday,
    label: 'Saturday',
  },
  {
    value: DayOfWeek.Sunday,
    label: 'Sunday',
  },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function exceptionRangeEnd(): string {
  return new Date(
    Date.now() + 30 * 86400000,
  )
    .toISOString()
    .slice(0, 10);
}

function defaultWindows(): WeeklyWindow[] {
  return DAYS.map((day) => ({
    dayOfWeek: day.value,
    startTime: '09:00',
    endTime: '17:00',
    isActive: false,
  }));
}

function mergeWindows(
  existing: WeeklyWindow[],
): WeeklyWindow[] {
  return DAYS.map((day) => {
    const current = existing.find(
      (window) =>
        window.dayOfWeek === day.value,
    );

    return (
      current ?? {
        dayOfWeek: day.value,
        startTime: '09:00',
        endTime: '17:00',
        isActive: false,
      }
    );
  });
}

function dayLabel(
  dayOfWeek: DayOfWeek,
): string {
  return (
    DAYS.find(
      (day) => day.value === dayOfWeek,
    )?.label ?? 'Day'
  );
}

function formatBlockedDate(
  value: string,
): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  }).format(date);
}

export default function ConsultantAvailability() {
  const action = useGuidanceAction();

  const availability =
    useGetAvailabilityQuery();

  const exceptions =
    useGetAvailabilityExceptionsQuery({
      from: todayIso(),
      to: exceptionRangeEnd(),
    });

  const [saveAvailability] =
    useSaveAvailabilityMutation();

  const [addException] =
    useAddAvailabilityExceptionMutation();

  const [deleteException] =
    useDeleteAvailabilityExceptionMutation();

  const [timeZoneId, setTimeZoneId] =
    useState(
      Intl.DateTimeFormat().resolvedOptions()
        .timeZone,
    );

  const [
    isAcceptingBookings,
    setIsAcceptingBookings,
  ] = useState(false);

  const [windows, setWindows] = useState<
    WeeklyWindow[]
  >(defaultWindows());

  const [blockedDate, setBlockedDate] =
    useState('');

  const [blockWholeDay, setBlockWholeDay] =
    useState(true);

  const [blockStartTime, setBlockStartTime] =
    useState('09:00');

  const [blockEndTime, setBlockEndTime] =
    useState('17:00');

  useEffect(() => {
    if (!availability.data) {
      return;
    }

    setTimeZoneId(
      availability.data.timeZoneId ??
        Intl.DateTimeFormat().resolvedOptions()
          .timeZone,
    );

    setIsAcceptingBookings(
      availability.data.isAcceptingBookings,
    );

    setWindows(
      mergeWindows(
        availability.data.windows ?? [],
      ),
    );
  }, [availability.data]);

  const activeDays = useMemo(
    () =>
      windows.filter(
        (window) => window.isActive,
      ).length,
    [windows],
  );

  const updateWindow = (
    dayOfWeek: DayOfWeek,
    patch: Partial<WeeklyWindow>,
  ) => {
    setWindows((current) =>
      current.map((window) =>
        window.dayOfWeek === dayOfWeek
          ? {
              ...window,
              ...patch,
            }
          : window,
      ),
    );
  };

  const validateWindows = (): string | null => {
    for (const window of windows) {
      if (!window.isActive) {
        continue;
      }

      if (
        !window.startTime ||
        !window.endTime
      ) {
        return `${dayLabel(
          window.dayOfWeek,
        )}: select both start and end time.`;
      }

      if (
        window.startTime >= window.endTime
      ) {
        return `${dayLabel(
          window.dayOfWeek,
        )}: end time must be after start time.`;
      }
    }

    return null;
  };

  const saveSchedule = async () => {
    if (!availability.data) {
      return;
    }

    const validationError =
      validateWindows();

    if (validationError) {
      return;
    }

    await action.execute(
      () =>
        saveAvailability({
          timeZoneId: timeZoneId.trim(),
          isAcceptingBookings,
          windows,
          revision:
            availability.data!.revision,
        }).unwrap(),
      'Availability saved.',
    );
  };

  const addBlockedDate = async () => {
    if (
      !availability.data ||
      !blockedDate
    ) {
      return;
    }

    if (
      !blockWholeDay &&
      blockStartTime >= blockEndTime
    ) {
      return;
    }

    await action.execute(
      () =>
        addException({
          localDate: blockedDate,
          startTime: blockWholeDay
            ? null
            : blockStartTime,
          endTime: blockWholeDay
            ? null
            : blockEndTime,
          revision:
            availability.data!.revision,
        }).unwrap(),
      blockWholeDay
        ? 'Blocked date added.'
        : 'Unavailable time added.',
    );

    setBlockedDate('');
    setBlockWholeDay(true);
    setBlockStartTime('09:00');
    setBlockEndTime('17:00');
  };

  const removeException = async (
    id: string,
  ) => {
    if (!availability.data) {
      return;
    }

    await action.execute(
      () =>
        deleteException({
          id,
          revision:
            availability.data!.revision,
        }).unwrap(),
      'Exception removed.',
    );
  };

  if (availability.isLoading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 5,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <CircularProgress size={28} />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Loading your availability…
        </Typography>
      </Paper>
    );
  }

  if (
    availability.isError ||
    !availability.data
  ) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() =>
              void availability.refetch()
            }
          >
            Retry
          </Button>
        }
      >
        We couldn't load your availability.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      {action.error && (
        <Alert severity="error">
          {action.error}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: 'stretch',
            md: 'center',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.50',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <CalendarMonthRounded />
            </Box>

            <Box>
              <Typography
                variant="h5"
                component="h2"
                fontWeight={700}
              >
                Availability
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Set when candidates can book
                guidance sessions with you.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={
                isAcceptingBookings
                  ? 'Accepting bookings'
                  : 'Bookings paused'
              }
              color={
                isAcceptingBookings
                  ? 'success'
                  : 'default'
              }
              variant="outlined"
            />

            <Chip
              label={`${activeDays} active ${
                activeDays === 1
                  ? 'day'
                  : 'days'
              }`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: 'stretch',
            md: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Booking status
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Pause new bookings without deleting
              your weekly schedule.
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={isAcceptingBookings}
                onChange={(event) =>
                  setIsAcceptingBookings(
                    event.target.checked,
                  )
                }
              />
            }
            label={
              isAcceptingBookings
                ? 'Accepting bookings'
                : 'Not accepting bookings'
            }
          />
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
        >
          <PublicRounded
            color="action"
            sx={{ flexShrink: 0 }}
          />

          <TextField
            fullWidth
            label="Timezone"
            value={timeZoneId}
            onChange={(event) =>
              setTimeZoneId(
                event.target.value,
              )
            }
            helperText="Booking times will be calculated using this timezone."
          />
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Weekly availability
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Choose the days and hours you are
              normally available each week.
            </Typography>
          </Box>

          <Chip
            icon={<AccessTimeRounded />}
            label={`${activeDays}/7 days active`}
            variant="outlined"
          />
        </Stack>

        <Stack spacing={1.25}>
          {DAYS.map((day) => {
            const window =
              windows.find(
                (item) =>
                  item.dayOfWeek ===
                  day.value,
              ) ?? {
                dayOfWeek: day.value,
                startTime: '09:00',
                endTime: '17:00',
                isActive: false,
              };

            return (
              <Box
                key={day.value}
                sx={{
                  p: 1.75,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2.5,
                  bgcolor: window.isActive
                    ? 'background.paper'
                    : 'action.hover',
                }}
              >
                <Stack
                  direction={{
                    xs: 'column',
                    md: 'row',
                  }}
                  spacing={2}
                  alignItems={{
                    xs: 'stretch',
                    md: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: {
                        md: 170,
                      },
                      flexShrink: 0,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            window.isActive
                          }
                          onChange={(event) =>
                            updateWindow(
                              day.value,
                              {
                                isActive:
                                  event.target
                                    .checked,
                              },
                            )
                          }
                        />
                      }
                      label={
                        <Typography
                          fontWeight={600}
                        >
                          {day.label}
                        </Typography>
                      }
                    />
                  </Box>

                  {window.isActive ? (
                    <>
                      <TextField
                        type="time"
                        label="Start time"
                        value={
                          window.startTime
                        }
                        onChange={(event) =>
                          updateWindow(
                            day.value,
                            {
                              startTime:
                                event.target
                                  .value,
                            },
                          )
                        }
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                        }}
                        sx={{
                          width: {
                            xs: '100%',
                            md: 180,
                          },
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: {
                            xs: 'none',
                            md: 'block',
                          },
                        }}
                      >
                        to
                      </Typography>

                      <TextField
                        type="time"
                        label="End time"
                        value={window.endTime}
                        onChange={(event) =>
                          updateWindow(
                            day.value,
                            {
                              endTime:
                                event.target
                                  .value,
                            },
                          )
                        }
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                        }}
                        sx={{
                          width: {
                            xs: '100%',
                            md: 180,
                          },
                        }}
                      />
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Unavailable
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ mt: 2.5 }}
        >
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            disabled={
              action.busy ||
              !timeZoneId.trim()
            }
            onClick={() =>
              void saveSchedule()
            }
          >
            {action.busy
              ? 'Saving…'
              : 'Save availability'}
          </Button>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mb: 0.75 }}
        >
          <EventBusyRounded
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Schedule exceptions
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Block a holiday, appointment, or other
          time when your normal weekly schedule
          should not apply.
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          spacing={2}
          alignItems={{
            xs: 'stretch',
            lg: 'flex-start',
          }}
        >
          <TextField
            type="date"
            label="Date"
            value={blockedDate}
            onChange={(event) =>
              setBlockedDate(
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                min: todayIso(),
              },
            }}
            sx={{
              minWidth: {
                lg: 190,
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={blockWholeDay}
                onChange={(event) =>
                  setBlockWholeDay(
                    event.target.checked,
                  )
                }
              />
            }
            label="Block whole day"
            sx={{
              minHeight: 56,
              mx: 0,
            }}
          />

          {!blockWholeDay && (
            <>
              <TextField
                type="time"
                label="From"
                value={blockStartTime}
                onChange={(event) =>
                  setBlockStartTime(
                    event.target.value,
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                type="time"
                label="To"
                value={blockEndTime}
                onChange={(event) =>
                  setBlockEndTime(
                    event.target.value,
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </>
          )}

          <Button
            variant="outlined"
            startIcon={<AddRounded />}
            disabled={
              action.busy ||
              !blockedDate ||
              (!blockWholeDay &&
                blockStartTime >=
                  blockEndTime)
            }
            onClick={() =>
              void addBlockedDate()
            }
            sx={{
              minHeight: 56,
              whiteSpace: 'nowrap',
            }}
          >
            Add exception
          </Button>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ mb: 1.5 }}
        >
          Upcoming exceptions
        </Typography>

        {exceptions.isLoading ? (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <CircularProgress size={20} />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading exceptions…
            </Typography>
          </Stack>
        ) : exceptions.isError ? (
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  void exceptions.refetch()
                }
              >
                Retry
              </Button>
            }
          >
            We couldn't load your schedule
            exceptions.
          </Alert>
        ) : !exceptions.data?.length ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              border: 1,
              borderColor: 'divider',
              borderStyle: 'dashed',
              borderRadius: 2.5,
            }}
          >
            <EventBusyRounded
              sx={{
                color: 'text.secondary',
                mb: 1,
              }}
            />

            <Typography
              fontWeight={600}
            >
              No upcoming exceptions
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Your normal weekly availability
              currently applies to all upcoming
              dates.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {exceptions.data.map(
              (exception) => {
                const wholeDay =
                  !exception.startTime &&
                  !exception.endTime;

                return (
                  <Stack
                    key={exception.id}
                    direction={{
                      xs: 'column',
                      sm: 'row',
                    }}
                    spacing={1.5}
                    alignItems={{
                      xs: 'flex-start',
                      sm: 'center',
                    }}
                    sx={{
                      p: 1.75,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2.5,
                    }}
                  >
                    <CalendarMonthRounded
                      color="action"
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        fontWeight={600}
                      >
                        {formatBlockedDate(
                          exception.localDate,
                        )}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {wholeDay
                          ? 'Unavailable all day'
                          : `${exception.startTime ?? ''} – ${exception.endTime ?? ''}`}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={
                        wholeDay
                          ? 'Whole day'
                          : 'Custom hours'
                      }
                      variant="outlined"
                    />

                    <Button
                      color="error"
                      size="small"
                      startIcon={
                        <DeleteOutlineRounded />
                      }
                      disabled={action.busy}
                      onClick={() =>
                        void removeException(
                          exception.id,
                        )
                      }
                    >
                      Remove
                    </Button>
                  </Stack>
                );
              },
            )}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}