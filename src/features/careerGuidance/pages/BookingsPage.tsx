import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AccessTimeRounded,
  CalendarMonthRounded,
  CheckCircleOutlineRounded,
  EventBusyRounded,
  HourglassTopRounded,
  PaymentsOutlined,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { useGetCareerBookingsQuery } from '../api/schedulingApi';
import { useGetCareerCandidateSummaryQuery } from '../api/analyticsApi';

import {
  GuidanceError,
  GuidanceLoading,
  GuidanceNavigation,
  GuidancePage,
  GuidancePagination,
  MetricCards,
  StatusChip,
} from '../components/GuidanceUI';

import {
  CareerBookingStatus,
  type CareerBookingResponse,
} from '../types';

import {
  dateTime,
  localTimeZone,
  money,
} from '../utils/presentation';

import { guidanceRoutes } from '../utils/routes';

import type { Audience } from '../api/careerGuidanceApi';

type ConsultantBookingTab =
  | 'upcoming'
  | 'requests'
  | 'completed'
  | 'cancelled';

const CONSULTANT_PAGE_SIZE = 50;

function consultantTabForStatus(
  status: CareerBookingStatus,
): ConsultantBookingTab | null {
  switch (status) {
    case CareerBookingStatus.Pending:
      return 'requests';

    case CareerBookingStatus.Confirmed:
      return 'upcoming';

    case CareerBookingStatus.Completed:
    case CareerBookingStatus.NoShowCandidate:
    case CareerBookingStatus.NoShowConsultant:
      return 'completed';

    case CareerBookingStatus.CancelledByCandidate:
    case CareerBookingStatus.CancelledByConsultant:
      return 'cancelled';

    default:
      return null;
  }
}

function bookingRoute(
  audience: Audience,
  id: string,
): string {
  if (audience === 'candidate') {
    return guidanceRoutes.booking(id);
  }

  if (audience === 'consultant') {
    return guidanceRoutes.owner(
      `bookings/${id}`,
    );
  }

  return guidanceRoutes.admin(
    `bookings/${id}`,
  );
}

function formatStatusLabel(
  status: CareerBookingStatus,
): string {
  switch (status) {
    case CareerBookingStatus.Pending:
      return 'Request pending';

    case CareerBookingStatus.Confirmed:
      return 'Confirmed';

    case CareerBookingStatus.Completed:
      return 'Completed';

    case CareerBookingStatus.CancelledByCandidate:
      return 'Cancelled by candidate';

    case CareerBookingStatus.CancelledByConsultant:
      return 'Cancelled by you';

    case CareerBookingStatus.NoShowCandidate:
      return 'Candidate no-show';

    case CareerBookingStatus.NoShowConsultant:
      return 'Consultant no-show';

    default:
      return 'Booking';
  }
}

function bookingStatusColor(
  status: CareerBookingStatus,
):
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error' {
  switch (status) {
    case CareerBookingStatus.Pending:
      return 'warning';

    case CareerBookingStatus.Confirmed:
      return 'primary';

    case CareerBookingStatus.Completed:
      return 'success';

    case CareerBookingStatus.CancelledByCandidate:
    case CareerBookingStatus.CancelledByConsultant:
    case CareerBookingStatus.NoShowCandidate:
    case CareerBookingStatus.NoShowConsultant:
      return 'error';

    default:
      return 'default';
  }
}

function ConsultantBookingCard({
  booking,
}: {
  booking: CareerBookingResponse;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },
        borderRadius: 3,
        transition:
          'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 2,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              component="h3"
              fontWeight={700}
            >
              {booking.serviceTitle}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35 }}
            >
              {booking.serviceType}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={formatStatusLabel(
              booking.status,
            )}
            color={bookingStatusColor(
              booking.status,
            )}
            variant="outlined"
          />
        </Stack>

        <Divider />

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={{
            xs: 1.25,
            md: 3,
          }}
          flexWrap="wrap"
          useFlexGap
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <CalendarMonthRounded
              sx={{
                fontSize: 19,
                color: 'text.secondary',
              }}
            />

            <Typography variant="body2">
              {dateTime(booking.startUtc)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <AccessTimeRounded
              sx={{
                fontSize: 19,
                color: 'text.secondary',
              }}
            />

            <Typography variant="body2">
              {booking.durationMinutes} minutes
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <PaymentsOutlined
              sx={{
                fontSize: 19,
                color: 'text.secondary',
              }}
            />

            <Typography variant="body2">
              {money(
                booking.price,
                booking.currency,
              )}
            </Typography>
          </Stack>
        </Stack>

        {booking.questionnaire.sessionGoal && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              SESSION GOAL
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {booking.questionnaire.sessionGoal}
            </Typography>
          </Box>
        )}

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          justifyContent="flex-end"
        >
          <Button
            component={Link}
            to={guidanceRoutes.owner(
              `bookings/${booking.id}`,
            )}
            variant={
              booking.status ===
              CareerBookingStatus.Pending
                ? 'contained'
                : 'outlined'
            }
          >
            {booking.status ===
            CareerBookingStatus.Pending
              ? 'Review request'
              : 'View details'}
          </Button>

          {booking.status ===
            CareerBookingStatus.Confirmed && (
            <Button
              component={Link}
              to={guidanceRoutes.owner(
                `sessions/${booking.id}`,
              )}
              variant="contained"
            >
              Open session
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function ConsultantBookings() {
  const [tab, setTab] =
    useState<ConsultantBookingTab>(
      'upcoming',
    );

  const bookings =
    useGetCareerBookingsQuery(
      {
        audience: 'consultant',
        pageNumber: 1,
        pageSize: CONSULTANT_PAGE_SIZE,
      },
      {
        refetchOnMountOrArgChange: true,
      },
    );

  const grouped = useMemo(() => {
    const result: Record<
      ConsultantBookingTab,
      CareerBookingResponse[]
    > = {
      upcoming: [],
      requests: [],
      completed: [],
      cancelled: [],
    };

    for (const booking of
      bookings.data?.items ?? []) {
      const target =
        consultantTabForStatus(
          booking.status,
        );

      if (target) {
        result[target].push(booking);
      }
    }

    result.upcoming.sort(
      (a, b) =>
        new Date(a.startUtc).getTime() -
        new Date(b.startUtc).getTime(),
    );

    result.requests.sort(
      (a, b) =>
        new Date(a.startUtc).getTime() -
        new Date(b.startUtc).getTime(),
    );

    result.completed.sort(
      (a, b) =>
        new Date(b.startUtc).getTime() -
        new Date(a.startUtc).getTime(),
    );

    result.cancelled.sort(
      (a, b) =>
        new Date(b.startUtc).getTime() -
        new Date(a.startUtc).getTime(),
    );

    return result;
  }, [bookings.data?.items]);

  if (bookings.isLoading) {
    return <GuidanceLoading />;
  }

  if (bookings.isError) {
    return (
      <GuidanceError
        error={bookings.error}
        retry={bookings.refetch}
      />
    );
  }

  const currentBookings = grouped[tab];

  return (
    <Stack spacing={2.5}>
      {bookings.data &&
        bookings.data.totalPages > 1 && (
          <Alert severity="info">
            Showing the first{' '}
            {CONSULTANT_PAGE_SIZE} bookings.
            Additional booking-history pagination
            will be handled separately so the
            status tabs remain accurate.
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
          <Box>
            <Typography
              variant="h5"
              component="h2"
              fontWeight={700}
            >
              Bookings
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Manage candidate requests and
              guidance sessions. Times are shown
              in {localTimeZone()}.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              icon={
                <CalendarMonthRounded />
              }
              label={`${grouped.upcoming.length} upcoming`}
              color="primary"
              variant="outlined"
            />

            <Chip
              icon={<HourglassTopRounded />}
              label={`${grouped.requests.length} requests`}
              color={
                grouped.requests.length
                  ? 'warning'
                  : 'default'
              }
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(
            _event,
            value: ConsultantBookingTab,
          ) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: {
              xs: 1,
              md: 2,
            },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            value="upcoming"
            icon={
              <CalendarMonthRounded />
            }
            iconPosition="start"
            label={`Upcoming (${grouped.upcoming.length})`}
          />

          <Tab
            value="requests"
            icon={<HourglassTopRounded />}
            iconPosition="start"
            label={`Requests (${grouped.requests.length})`}
          />

          <Tab
            value="completed"
            icon={
              <CheckCircleOutlineRounded />
            }
            iconPosition="start"
            label={`Completed (${grouped.completed.length})`}
          />

          <Tab
            value="cancelled"
            icon={<EventBusyRounded />}
            iconPosition="start"
            label={`Cancelled (${grouped.cancelled.length})`}
          />
        </Tabs>

        <Box
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          {!currentBookings.length ? (
            <Box
              sx={{
                py: 6,
                px: 2,
                textAlign: 'center',
              }}
            >
              {tab === 'upcoming' && (
                <CalendarMonthRounded
                  sx={{
                    fontSize: 42,
                    color: 'text.secondary',
                  }}
                />
              )}

              {tab === 'requests' && (
                <HourglassTopRounded
                  sx={{
                    fontSize: 42,
                    color: 'text.secondary',
                  }}
                />
              )}

              {tab === 'completed' && (
                <CheckCircleOutlineRounded
                  sx={{
                    fontSize: 42,
                    color: 'text.secondary',
                  }}
                />
              )}

              {tab === 'cancelled' && (
                <EventBusyRounded
                  sx={{
                    fontSize: 42,
                    color: 'text.secondary',
                  }}
                />
              )}

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 1.5 }}
              >
                {tab === 'upcoming' &&
                  'No upcoming sessions'}

                {tab === 'requests' &&
                  'No pending requests'}

                {tab === 'completed' &&
                  'No completed sessions yet'}

                {tab === 'cancelled' &&
                  'No cancelled bookings'}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  maxWidth: 480,
                  mx: 'auto',
                }}
              >
                {tab === 'upcoming' &&
                  'Confirmed guidance sessions will appear here.'}

                {tab === 'requests' &&
                  'New booking requests from candidates will appear here for review.'}

                {tab === 'completed' &&
                  'Finished sessions and no-show outcomes will appear here.'}

                {tab === 'cancelled' &&
                  'Bookings cancelled by you or the candidate will appear here.'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {currentBookings.map(
                (booking) => (
                  <ConsultantBookingCard
                    key={booking.id}
                    booking={booking}
                  />
                ),
              )}
            </Stack>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}

export const BookingsPage = ({
  audience = 'candidate',
}: {
  audience?: Audience;
}) => {
  const [page, setPage] = useState(1);

  const candidateBookings =
    useGetCareerBookingsQuery(
      {
        audience,
        pageNumber: page,
        pageSize: 10,
      },
      {
        skip: audience === 'consultant',
        refetchOnMountOrArgChange: true,
      },
    );

  const summary =
    useGetCareerCandidateSummaryQuery(
      undefined,
      {
        skip: audience !== 'candidate',
      },
    );

  if (audience === 'consultant') {
    return (
      <GuidancePage
        title="Consultant workspace"
        description="Consultant access is an account capability granted by backend verification."
      >
        <GuidanceNavigation owner />

        <ConsultantBookings />
      </GuidancePage>
    );
  }

  return (
    <GuidancePage
      title={
        audience === 'candidate'
          ? 'My guidance bookings'
          : 'Guidance bookings'
      }
      description={`Session times are shown in ${localTimeZone()}.`}
    >
      <GuidanceNavigation
        owner={false}
        admin={audience === 'admin'}
      />

      {audience === 'candidate' &&
        (summary.isLoading ? (
          <GuidanceLoading />
        ) : summary.isError ? (
          <GuidanceError
            error={summary.error}
            retry={summary.refetch}
          />
        ) : (
          summary.data && (
            <>
              <MetricCards
                metrics={[
                  {
                    label:
                      'Upcoming bookings',
                    value:
                      summary.data
                        .upcomingBookings,
                  },
                  {
                    label:
                      'Completed bookings',
                    value:
                      summary.data
                        .completedBookings,
                  },
                  {
                    label:
                      'Cancelled bookings',
                    value:
                      summary.data
                        .cancelledBookings,
                  },
                  {
                    label:
                      'Reviews awaiting moderation',
                    value:
                      summary.data
                        .pendingReviewCount,
                  },
                  {
                    label:
                      'Active disputes',
                    value:
                      summary.data
                        .activeDisputeCount,
                  },
                ]}
              />

              <Paper sx={{ p: 2.5 }}>
                <Typography>
                  Next provisioned session:{' '}
                  {dateTime(
                    summary.data
                      .nextUpcomingSession,
                  )}
                </Typography>
              </Paper>
            </>
          )
        ))}

      {candidateBookings.isLoading ? (
        <GuidanceLoading />
      ) : candidateBookings.isError ? (
        <GuidanceError
          error={candidateBookings.error}
          retry={candidateBookings.refetch}
        />
      ) : (
        <Stack spacing={2}>
          {!candidateBookings.data?.items
            .length && (
            <Typography>
              No bookings yet.
            </Typography>
          )}

          {candidateBookings.data?.items.map(
            (booking) => (
              <Paper
                key={booking.id}
                sx={{ p: 3 }}
              >
                <Stack spacing={1.5}>
                  <Typography
                    component="h2"
                    variant="h3"
                  >
                    {booking.serviceTitle}
                  </Typography>

                  <StatusChip
                    values={
                      CareerBookingStatus
                    }
                    value={booking.status}
                  />

                  <Typography>
                    {dateTime(
                      booking.startUtc,
                    )}{' '}
                    · {booking.durationMinutes}{' '}
                    minutes ·{' '}
                    {money(
                      booking.price,
                      booking.currency,
                    )}
                  </Typography>

                  <Button
                    component={Link}
                    to={bookingRoute(
                      audience,
                      booking.id,
                    )}
                  >
                    View booking
                  </Button>
                </Stack>
              </Paper>
            ),
          )}

          <GuidancePagination
            page={page}
            count={
              candidateBookings.data
                ?.totalPages ?? 0
            }
            onChange={setPage}
          />
        </Stack>
      )}
    </GuidancePage>
  );
};

export const ConsultantBookingsPage = () => (
  <BookingsPage audience="consultant" />
);