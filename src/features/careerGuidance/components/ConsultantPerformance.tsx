import {

  AccountBalanceWalletOutlined,

  CalendarMonthRounded,

  CheckCircleOutlineRounded,

  EventBusyRounded,

  PaymentsOutlined,

  QueryStatsRounded,

  ReportProblemOutlined,

  StarRounded,

  TrendingUpRounded,

} from '@mui/icons-material';

import {

Alert,

Box,

Button,

Chip,

CircularProgress,

Divider,

Paper,

Stack,

Typography,

} from '@mui/material';

import { Link } from 'react-router-dom';

import { useGetCareerConsultantAnalyticsQuery } from '../api/analyticsApi';

import type { CareerGuidanceConsultantAnalytics } from '../types';

import {

  dateTime,

  money,

} from '../utils/presentation';

function MetricCard({

  label,

  value,

  description,

  icon,

}: {

  label: string;

  value: React.ReactNode;

  description?: string;

  icon: React.ReactNode;

}) {

  return (

    <Paper

      variant="outlined"

      sx={{

        p: 2.25,

        borderRadius: 3,

        height: '100%',

      }}

    >

      <Stack

        direction="row"

        spacing={1.5}

        alignItems="flex-start"

      >

        <Box

          sx={{

            width: 42,

            height: 42,

            borderRadius: 2.25,

            bgcolor: 'action.hover',

            color: 'primary.main',

            display: 'grid',

            placeItems: 'center',

            flexShrink: 0,

          }}

        >

          {icon}

        </Box>

        <Box sx={{ minWidth: 0 }}>

          <Typography

            variant="body2"

            color="text.secondary"

            fontWeight={600}

          >

            {label}

          </Typography>

          <Typography

            variant="h5"

            fontWeight={800}

            sx={{ mt: 0.35 }}

          >

            {value}

          </Typography>

          {description && (

            <Typography

              variant="caption"

              color="text.secondary"

              sx={{

                display: 'block',

                mt: 0.5,

              }}

            >

              {description}

            </Typography>

          )}

        </Box>

      </Stack>

    </Paper>

  );

}

function StatRow({

  label,

  value,

}: {

  label: string;

  value: React.ReactNode;

}) {

  return (

    <Stack

      direction="row"

      spacing={2}

      justifyContent="space-between"

      alignItems="center"

      sx={{

        py: 1.35,

      }}

    >

      <Typography

        variant="body2"

        color="text.secondary"

      >

        {label}

      </Typography>

      <Typography

        variant="body2"

        fontWeight={700}

        textAlign="right"

      >

        {value}

      </Typography>

    </Stack>

  );

}

function PerformanceContent({

  data,

}: {

  data: CareerGuidanceConsultantAnalytics;

}) {

  const totalNoShows =

    data.candidateNoShows +

    data.consultantNoShows;

  const rating =

    data.averageRating == null

      ? '—'

      : data.averageRating.toFixed(1);

  return (

    <Stack spacing={2.5}>

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

                bgcolor: 'action.hover',

                color: 'primary.main',

              }}

            >

              <QueryStatsRounded />

            </Box>

            <Box>

              <Typography

                variant="h5"

                component="h2"

                fontWeight={800}

              >

                Performance

              </Typography>

              <Typography

                variant="body2"

                color="text.secondary"

                sx={{ mt: 0.35 }}

              >

                Track your guidance activity,

                earnings and candidate feedback.

              </Typography>

            </Box>

          </Stack>

          <Chip

            icon={<CalendarMonthRounded />}

            label={`${dateTime(

              data.fromUtc,

            )} – ${dateTime(data.toUtc)}`}

            variant="outlined"

          />

        </Stack>

      </Paper>

      <Box

        sx={{

          display: 'grid',

          gridTemplateColumns: {

            xs: '1fr',

            sm: 'repeat(2, minmax(0, 1fr))',

            xl: 'repeat(4, minmax(0, 1fr))',

          },

          gap: 2,

        }}

      >

        <MetricCard

          label="Total bookings"

          value={data.totalBookings}

          description={`${data.confirmedBookings} confirmed`}

          icon={<CalendarMonthRounded />}

        />

        <MetricCard

          label="Completed sessions"

          value={data.completedSessions}

          description="Successfully completed"

          icon={

            <CheckCircleOutlineRounded />

          }

        />

        <MetricCard

          label="Your earnings"

          value={money(

            data.consultantEarnings,

            'INR',

          )}

          description="Consultant earnings"

          icon={

            <AccountBalanceWalletOutlined />

          }

        />

        <MetricCard

          label="Average rating"

          value={rating}

          description={`${data.publishedReviewCount} published ${

            data.publishedReviewCount === 1

              ? 'review'

              : 'reviews'

          }`}

          icon={<StarRounded />}

        />

      </Box>

      <Box

        sx={{

          display: 'grid',

          gridTemplateColumns: {

            xs: '1fr',

            lg: 'repeat(2, minmax(0, 1fr))',

          },

          gap: 2.5,

        }}

      >

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

            spacing={1.25}

            alignItems="center"

          >

            <TrendingUpRounded

              color="primary"

            />

            <Typography

              variant="h6"

              fontWeight={800}

            >

              Booking performance

            </Typography>

          </Stack>

          <Typography

            variant="body2"

            color="text.secondary"

            sx={{ mt: 0.5, mb: 2 }}

          >

            Outcomes for bookings in the selected

            analytics period.

          </Typography>

          <Divider />

          <StatRow

            label="Total bookings"

            value={data.totalBookings}

          />

          <Divider />

          <StatRow

            label="Confirmed bookings"

            value={data.confirmedBookings}

          />

          <Divider />

          <StatRow

            label="Completed sessions"

            value={data.completedSessions}

          />

          <Divider />

          <StatRow

            label="Cancellations"

            value={data.cancellations}

          />

          <Divider />

          <StatRow

            label="Candidate no-shows"

            value={data.candidateNoShows}

          />

          <Divider />

          <StatRow

            label="Consultant no-shows"

            value={data.consultantNoShows}

          />

          {totalNoShows > 0 && (

            <Alert

              severity="info"

              sx={{ mt: 2 }}

            >

              {totalNoShows} no-show{' '}

              {totalNoShows === 1

                ? 'outcome'

                : 'outcomes'}{' '}

              recorded during this period.

            </Alert>

          )}

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

            spacing={1.25}

            alignItems="center"

          >

            <PaymentsOutlined

              color="primary"

            />

            <Typography

              variant="h6"

              fontWeight={800}

            >

              Earnings

            </Typography>

          </Stack>

          <Typography

            variant="body2"

            color="text.secondary"

            sx={{ mt: 0.5, mb: 2 }}

          >

            Booking value and consultant earnings

            reported by the platform.

          </Typography>

          <Divider />

          <StatRow

            label="Gross booked value"

            value={money(

              data.grossBookedValue,

              'INR',

            )}

          />

          <Divider />

          <StatRow

            label="Consultant earnings"

            value={money(

              data.consultantEarnings,

              'INR',

            )}

          />

          <Divider />

          <StatRow

            label="Pending earnings"

            value={money(

              data.pendingEarnings,

              'INR',

            )}

          />

          <Divider />

          <StatRow

            label="Held earnings"

            value={money(

              data.heldEarnings,

              'INR',

            )}

          />

          <Divider />

          <StatRow

            label="Refunded bookings"

            value={data.refundedBookings}

          />

          {data.heldEarnings > 0 && (

            <Alert

              severity="warning"

              sx={{ mt: 2 }}

            >

              Some earnings are currently held.

              Check active disputes and booking

              outcomes for details.

            </Alert>

          )}

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

            spacing={1.25}

            alignItems="center"

          >

            <StarRounded color="primary" />

            <Typography

              variant="h6"

              fontWeight={800}

            >

              Ratings & reviews

            </Typography>

          </Stack>

          <Typography

            variant="body2"

            color="text.secondary"

            sx={{ mt: 0.5, mb: 2 }}

          >

            Published candidate feedback reflected

            in your consultant rating.

          </Typography>

          <Divider />

          <Stack

            direction="row"

            spacing={2}

            alignItems="center"

            sx={{ py: 2.5 }}

          >

            <Box

              sx={{

                width: 58,

                height: 58,

                borderRadius: '50%',

                bgcolor: 'action.hover',

                display: 'grid',

                placeItems: 'center',

              }}

            >

              <StarRounded

                sx={{

                  fontSize: 30,

                  color: 'primary.main',

                }}

              />

            </Box>

            <Box>

              <Typography

                variant="h4"

                fontWeight={800}

              >

                {rating}

              </Typography>

              <Typography

                variant="body2"

                color="text.secondary"

              >

                {data.averageRating == null

                  ? 'No published rating yet'

                  : 'Average rating'}

              </Typography>

            </Box>

          </Stack>

          <Divider />

          <StatRow

            label="Published reviews"

            value={data.publishedReviewCount}

          />

          {data.publishedReviewCount ===

            0 && (

            <Alert

              severity="info"

              sx={{ mt: 2 }}

            >

              Published candidate reviews will

              appear in your performance summary

              once available.

            </Alert>

          )}

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

            spacing={1.25}

            alignItems="center"

          >

            <ReportProblemOutlined

              color="primary"

            />

            <Typography

              variant="h6"

              fontWeight={800}

            >

              Disputes & refunds

            </Typography>

          </Stack>

          <Typography

            variant="body2"

            color="text.secondary"

            sx={{ mt: 0.5, mb: 2 }}

          >

            Current dispute exposure and refunded

            booking count.

          </Typography>

          <Divider />

          <StatRow

            label="Open disputes"

            value={data.openDisputes}

          />

          <Divider />

          <StatRow

            label="Refunded bookings"

            value={data.refundedBookings}

          />

          {data.openDisputes > 0 ? (

            <Alert

              severity="warning"

              sx={{ mt: 2 }}

            >

              You currently have{' '}

              {data.openDisputes} open{' '}

              {data.openDisputes === 1

                ? 'dispute'

                : 'disputes'}.

            </Alert>

          ) : (

            <Alert

              severity="success"

              sx={{ mt: 2 }}

            >

              No open disputes are currently

              reported.

            </Alert>

          )}

                  <Button
            component={Link}
            to="/career-guidance/consultant/disputes"
            variant="outlined"
            sx={{ mt: 2 }}
          >
            View disputes
          </Button>

</Paper>

      </Box>

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

            xs: 'flex-start',

            sm: 'center',

          }}

        >

          <Box>

            <Typography

              variant="h6"

              fontWeight={800}

            >

              Next upcoming session

            </Typography>

            <Typography

              variant="body2"

              color="text.secondary"

              sx={{ mt: 0.5 }}

            >

              Your next scheduled guidance session

              reported by analytics.

            </Typography>

          </Box>

          {data.nextUpcomingSession ? (

            <Chip

              icon={<CalendarMonthRounded />}

              label={dateTime(

                data.nextUpcomingSession,

              )}

              color="primary"

              variant="outlined"

            />

          ) : (

            <Chip

              icon={<EventBusyRounded />}

              label="No upcoming session"

              variant="outlined"

            />

          )}

        </Stack>

      </Paper>

    </Stack>

  );

}

export default function ConsultantPerformance() {

  const analytics =

    useGetCareerConsultantAnalyticsQuery({});

  if (analytics.isLoading) {

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

          Loading performance…

        </Typography>

      </Paper>

    );

  }

  if (

    analytics.isError ||

    !analytics.data

  ) {

    return (

      <Alert

        severity="error"

        action={

          <Chip

            label="Retry"

            clickable

            onClick={() => {

              void analytics.refetch();

            }}

          />

        }

      >

        We couldn't load your performance data.

      </Alert>

    );

  }

  return (

    <PerformanceContent

      data={analytics.data}

    />

  );

}
