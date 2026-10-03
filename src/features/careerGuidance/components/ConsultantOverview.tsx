import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWalletRounded,
  ArrowForwardRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  EventAvailableRounded,
  PaymentsRounded,
  PersonRounded,
  ScheduleRounded,
  StarRounded,
  StorefrontRounded,
  TuneRounded,
  WorkOutlineRounded,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { useGetCareerConsultantAnalyticsQuery } from '../api/analyticsApi';
import { useGetCareerBookingsQuery } from '../api/schedulingApi';
import {
  CareerBookingStatus,
  ConsultantVerificationStatus,
  type ConsultantPrivateResponse,
} from '../types';
import { guidanceRoutes } from '../utils/routes';

interface ConsultantOverviewProps {
  profile: ConsultantPrivateResponse;
}

function formatMoney(value: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString('en-IN')}`;
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getBookingStatusLabel(status: CareerBookingStatus) {
  switch (status) {
    case CareerBookingStatus.Pending:
      return 'Pending';

    case CareerBookingStatus.Confirmed:
      return 'Confirmed';

    case CareerBookingStatus.CancelledByCandidate:
      return 'Cancelled by candidate';

    case CareerBookingStatus.CancelledByConsultant:
      return 'Cancelled by consultant';

    case CareerBookingStatus.Completed:
      return 'Completed';

    case CareerBookingStatus.NoShowCandidate:
      return 'Candidate no-show';

    case CareerBookingStatus.NoShowConsultant:
      return 'Consultant no-show';

    default:
      return 'Unknown';
  }
}

function getBookingStatusColor(
  status: CareerBookingStatus,
): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case CareerBookingStatus.Confirmed:
      return 'success';

    case CareerBookingStatus.Pending:
      return 'warning';

    case CareerBookingStatus.CancelledByCandidate:
    case CareerBookingStatus.CancelledByConsultant:
      return 'error';

    default:
      return 'default';
  }
}

function getCurrentMonthRange() {
  const now = new Date();

  const fromUtc = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1,
      0,
      0,
      0,
    ),
  ).toISOString();

  const toUtc = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      1,
      0,
      0,
      0,
    ) - 1,
  ).toISOString();

  return {
    fromUtc,
    toUtc,
  };
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {label}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.75,
              fontWeight: 800,
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.5,
            }}
          >
            {helper}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2,
          sm: 2.5,
        },
        borderRadius: 3,
        height: '100%',
      }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
          spacing={1}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
            >
              {title}
            </Typography>

            {description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>

          {action}
        </Stack>

        {children}
      </Stack>
    </Paper>
  );
}

export default function ConsultantOverview({
  profile,
}: ConsultantOverviewProps) {
  const monthRange = getCurrentMonthRange();

  const analytics =
    useGetCareerConsultantAnalyticsQuery(monthRange);

  const bookings = useGetCareerBookingsQuery({
    audience: 'consultant',
    pageNumber: 1,
    pageSize: 50,
  });

  const now = Date.now();

  const upcomingBookings = (bookings.data?.items ?? [])
    .filter((booking) => {
      const futureBooking =
        new Date(booking.startUtc).getTime() >= now;

      const activeBooking =
        booking.status === CareerBookingStatus.Pending ||
        booking.status === CareerBookingStatus.Confirmed;

      return futureBooking && activeBooking;
    })
    .sort(
      (first, second) =>
        new Date(first.startUtc).getTime() -
        new Date(second.startUtc).getTime(),
    );

  const data = analytics.data;

  const displayName =
    profile.profile.displayName?.trim() || 'Consultant';

  const rating =
    data?.averageRating == null
      ? '—'
      : Number(data.averageRating).toFixed(1);

  const ratingHelper =
    data && data.publishedReviewCount > 0
      ? `${data.publishedReviewCount} ${
          data.publishedReviewCount === 1
            ? 'published review'
            : 'published reviews'
        }`
      : 'No published reviews yet';

  const currency =
    profile.services.find(
      (service) => Boolean(service.currency),
    )?.currency ?? 'INR';

  const activeServices = profile.services.filter(
    (service) => service.isActive,
  ).length;

  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2.5,
            md: 3.5,
          },
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.08), rgba(124,77,255,0.06))',
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            md: 'center',
          }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800 }}
            >
              Welcome back, {displayName}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.75,
                maxWidth: 680,
              }}
            >
              Manage your upcoming sessions, offering,
              availability and performance from your consultant
              workspace.
            </Typography>
          </Box>

          <Button
            component={Link}
            to={guidanceRoutes.profile(profile.profile.id)}
            variant="outlined"
            endIcon={<ArrowForwardRounded />}
          >
            View public profile
          </Button>
        </Stack>
      </Paper>

      {analytics.isError ? (
        <Alert severity="warning">
          Performance information could not be loaded right now.
          Your consultant profile and booking tools are still
          available.
        </Alert>
      ) : null}

      {bookings.isError ? (
        <Alert severity="warning">
          Upcoming bookings could not be loaded right now. You can
          still open the Bookings section and try again.
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Upcoming sessions"
            value={
              bookings.isLoading
                ? '…'
                : upcomingBookings.length
            }
            helper="Pending and confirmed"
            icon={<EventAvailableRounded />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="This month's earnings"
            value={
              analytics.isLoading
                ? '…'
                : formatMoney(
                    data?.consultantEarnings ?? 0,
                    currency,
                  )
            }
            helper="Consultant earnings"
            icon={<AccountBalanceWalletRounded />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Completed sessions"
            value={
              analytics.isLoading
                ? '…'
                : data?.completedSessions ?? 0
            }
            helper="This month"
            icon={<CheckCircleRounded />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Average rating"
            value={
              analytics.isLoading ? '…' : rating
            }
            helper={
              analytics.isLoading
                ? 'Loading reviews…'
                : ratingHelper
            }
            icon={<StarRounded />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Upcoming sessions"
            description="Your next pending and confirmed career guidance bookings."
            action={
              <Button
                component={Link}
                to={guidanceRoutes.owner('bookings')}
                endIcon={<ArrowForwardRounded />}
              >
                View all
              </Button>
            }
          >
            {bookings.isLoading ? (
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ py: 3 }}
              >
                <CircularProgress size={22} />

                <Typography color="text.secondary">
                  Loading upcoming sessions…
                </Typography>
              </Stack>
            ) : upcomingBookings.length === 0 ? (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                }}
              >
                <CalendarMonthRounded
                  sx={{
                    fontSize: 42,
                    color: 'text.disabled',
                    mb: 1,
                  }}
                />

                <Typography fontWeight={700}>
                  No upcoming sessions
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  New pending or confirmed bookings will appear
                  here.
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {upcomingBookings
                  .slice(0, 4)
                  .map((booking) => (
                    <Stack
                      key={booking.id}
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      justifyContent="space-between"
                      alignItems={{
                        xs: 'flex-start',
                        sm: 'center',
                      }}
                      spacing={2}
                      sx={{ py: 1.75 }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ScheduleRounded />
                        </Box>

                        <Box>
                          <Typography fontWeight={700}>
                            {booking.serviceTitle}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25 }}
                          >
                            {formatDateTime(
                              booking.startUtc,
                            )}
                            {' · '}
                            {booking.durationMinutes} min
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatMoney(
                              booking.price,
                              booking.currency,
                            )}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Chip
                          size="small"
                          variant="outlined"
                          color={getBookingStatusColor(
                            booking.status,
                          )}
                          label={getBookingStatusLabel(
                            booking.status,
                          )}
                        />

                        <Button
                          component={Link}
                          to={guidanceRoutes.owner(
                            `bookings/${booking.id}`,
                          )}
                          size="small"
                          endIcon={
                            <ArrowForwardRounded />
                          }
                        >
                          View
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title="Quick actions"
            description="Common consultant workspace actions."
          >
            <Stack spacing={1}>
              <Button
                component={Link}
                to={guidanceRoutes.owner('profile')}
                variant="outlined"
                startIcon={<PersonRounded />}
                sx={{
                  justifyContent: 'flex-start',
                }}
              >
                Edit public profile
              </Button>

              <Button
                component={Link}
                to={guidanceRoutes.owner('services')}
                variant="outlined"
                startIcon={<WorkOutlineRounded />}
                sx={{
                  justifyContent: 'flex-start',
                }}
              >
                Manage services
              </Button>

              <Button
                component={Link}
                to={guidanceRoutes.owner(
                  'availability',
                )}
                variant="outlined"
                startIcon={<TuneRounded />}
                sx={{
                  justifyContent: 'flex-start',
                }}
              >
                Update availability
              </Button>

              <Button
                component={Link}
                to={guidanceRoutes.profile(
                  profile.profile.id,
                )}
                variant="outlined"
                startIcon={<StorefrontRounded />}
                sx={{
                  justifyContent: 'flex-start',
                }}
              >
                View public profile
              </Button>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Business summary"
            description="Your consultant activity for the current month."
            action={
              <Button
                component={Link}
                to={guidanceRoutes.owner('analytics')}
                endIcon={<ArrowForwardRounded />}
              >
                Performance
              </Button>
            }
          >
            {analytics.isLoading ? (
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ py: 2 }}
              >
                <CircularProgress size={22} />

                <Typography color="text.secondary">
                  Loading performance…
                </Typography>
              </Stack>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Confirmed bookings
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    {data?.confirmedBookings ?? 0}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Pending earnings
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    {formatMoney(
                      data?.pendingEarnings ?? 0,
                      currency,
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Held earnings
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    {formatMoney(
                      data?.heldEarnings ?? 0,
                      currency,
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Open disputes
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    {data?.openDisputes ?? 0}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title="Profile status"
            description="Your current consultant marketplace status."
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'success.light',
                    color: 'success.dark',
                  }}
                >
                  <CheckCircleRounded />
                </Box>

                <Box>
                  <Typography fontWeight={800}>
                    {profile.verificationStatus ===
                    ConsultantVerificationStatus.Verified
                      ? 'Approved'
                      : 'Consultant'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {profile.profile
                      .isAcceptingBookings
                      ? 'Accepting bookings'
                      : 'Bookings currently paused'}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Active services
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {activeServices}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Published reviews
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {data?.publishedReviewCount ?? 0}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Booking status
                </Typography>

                <Chip
                  size="small"
                  color={
                    profile.profile
                      .isAcceptingBookings
                      ? 'success'
                      : 'default'
                  }
                  label={
                    profile.profile
                      .isAcceptingBookings
                      ? 'Open'
                      : 'Paused'
                  }
                />
              </Stack>

              <Button
                component={Link}
                to={guidanceRoutes.profile(
                  profile.profile.id,
                )}
                variant="contained"
                endIcon={<ArrowForwardRounded />}
              >
                View public profile
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Alert
        severity="info"
        icon={<PaymentsRounded />}
      >
        Earnings shown here come from Career Guidance analytics.
        Payment settlement timing may differ from completed-session
        timing.
      </Alert>
    </Stack>
  );
}