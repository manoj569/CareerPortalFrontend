import { useEffect, useState } from 'react';

import {

  Alert,

  Avatar,

  Box,

  Breadcrumbs,

  Button,

  Chip,

  Divider,

  Paper,

  Stack,

  Step,

  StepLabel,

  Stepper,

  Typography,

} from '@mui/material';

import {

  CheckCircleRounded,

  EventAvailableOutlined,

  PaymentsOutlined,

  VideoCallOutlined,

} from '@mui/icons-material';

import { Link, Navigate, useParams } from 'react-router-dom';

import { apiClient } from '@/api/apiClient';

import type { ApiResponse } from '@/types';

import { sessionPath } from '../api/careerGuidanceApi';

import { useGetCareerBookingQuery } from '../api/schedulingApi';

import { useGetCareerPaymentQuery } from '../api/financeApi';

import { useGetConsultantQuery } from '../api/profilesApi';

import { useGetCareerSessionQuery } from '../api/sessionsApi';

import { GuidanceError, GuidanceLoading, GuidancePage, StatusChip } from '../components/GuidanceUI';

import { useGuidanceAction } from '../hooks/useGuidanceAction';

import {

  CareerBookingStatus,

  CareerPaymentStatus,

  CareerSessionStatus,

  type CareerBookingResponse,

  type CareerPaymentResponse,

  type CareerSessionJoinResponse,

} from '../types';

import { guidanceError } from '../utils/errors';

import { dateTime, localTimeZone, money, safeMeetingUrl } from '../utils/presentation';

import { publicConsultantPhotoUrl } from '../utils/publicConsultantPhoto';
import { guidanceRoutes } from '../utils/routes';

const cardStyle = {

  p: { xs: 2.5, md: 3.5 },

  borderRadius: 3,

  border: '1px solid',

  borderColor: 'divider',

  boxShadow: '0 4px 24px rgba(20,48,100,0.04)',

};

const meetingPending =

  'Meeting details are not available yet. Return to this booking closer to the session time.';

const activeSession = (status: CareerSessionStatus) =>

  [

    CareerSessionStatus.Scheduled,

    CareerSessionStatus.Ready,

    CareerSessionStatus.InProgress,

  ].includes(status);

const withheldMessage = (reason: string | null) => {

  switch (reason) {

    case 'meeting_not_configured':

      return meetingPending;

    case 'outside_join_window_or_terminal':

      return 'Meeting access is outside the permitted joining time or this session has ended. Check the session details before trying again.';

    case 'booking_not_eligible':

      return 'This booking is not currently eligible for meeting access. Check your booking and payment status.';

    default:

      return 'Meeting access is not available. Refresh the session details and try again closer to the session time.';

  }

};

function MeetingDetails({ bookingId }: { bookingId: string }) {

  const query = useGetCareerSessionQuery(

    { audience: 'candidate', id: bookingId },

    { refetchOnMountOrArgChange: true },

  );

  const action = useGuidanceAction();

  const [notice, setNotice] = useState<string | null>(null);

  // Sensitive join URLs are kept briefly in component state, never in RTK cache.

  const [access, setAccess] = useState<{ url: string; sessionId: string } | null>(null);

  useEffect(() => {

    if (!access) return;

    const clear = () => setAccess(null);

    const timer = window.setTimeout(clear, 15000);

    window.addEventListener('blur', clear);

    return () => {

      window.clearTimeout(timer);

      window.removeEventListener('blur', clear);

    };

  }, [access]);

  const session = query.currentData;

  const missing = guidanceError(query.error).status === 404;

  const configured = session?.meetingConfigured && activeSession(session.status);

  const checkAccess = () => {

    setAccess(null);

    setNotice(null);

    void action.execute(async () => {

      const response = await apiClient.get<ApiResponse<CareerSessionJoinResponse>>(

        `${sessionPath('candidate', bookingId)}/join`,

      );

      const result = response.data.data;

      const url = safeMeetingUrl(result.joinUrl);

      if (

        url &&

        result.session.bookingId === bookingId &&

        result.session.meetingConfigured &&

        activeSession(result.session.status)

      ) {

        setAccess({ url, sessionId: result.session.id });

      } else setNotice(withheldMessage(result.withheldReason));

      void query.refetch();

    });

  };

  return (

    <Paper sx={cardStyle} component="section" aria-labelledby="meeting-heading">

      <Stack spacing={2.5}>

        <Stack direction="row" spacing={1.5} alignItems="center">

          <VideoCallOutlined color="primary" />

          <Typography id="meeting-heading" variant="h3" component="h2">

            Meeting &amp; session

          </Typography>

        </Stack>

        {query.isLoading ? (

          <GuidanceLoading />

        ) : query.isError && !missing ? (

          <GuidanceError error={query.error} retry={query.refetch} />

        ) : (

          <>

            {session && (

              <>

                <StatusChip values={CareerSessionStatus} value={session.status} />

                {session.meetingConfigured && session.meetingProvider && (

                  <Typography>Meeting provider: {session.meetingProvider}</Typography>

                )}

              </>

            )}

            {missing || !session || !session.meetingConfigured ? (

              <Alert severity="info">{meetingPending}</Alert>

            ) : !activeSession(session.status) ? (

              <Alert severity="info">

                Meeting access is closed for this session. Open Booking details for its current

                status.

              </Alert>

            ) : (

              <Typography color="text.secondary">

                Meeting details are configured. Check access when you are ready; the server controls

                when you can join.

              </Typography>

            )}

            {configured && (

              <Button

                variant="outlined"

                disabled={action.busy || query.isFetching}

                onClick={checkAccess}

              >

                Check meeting access

              </Button>

            )}

            {access && configured && access.sessionId === session?.id && !query.isFetching && (

              <Button

                component="a"

                href={access.url}

                target="_blank"

                rel="noopener noreferrer"

                referrerPolicy="no-referrer"

                variant="contained"

                onClick={() => window.setTimeout(() => setAccess(null), 0)}

              >

                Join meeting

              </Button>

            )}

          </>

        )}

        {notice && <Alert severity="info">{notice}</Alert>}

        {action.error && <Alert severity="error">{action.error}</Alert>}

        <Button

          disabled={query.isFetching || action.busy}

          onClick={() => {

            setAccess(null);

            setNotice(null);

            void query.refetch();

          }}

        >

          Refresh session details

        </Button>

      </Stack>

    </Paper>

  );

}

function Confirmation({

  booking,

  payment,

}: {

  booking: CareerBookingResponse;

  payment: CareerPaymentResponse;

}) {

  const profileQuery = useGetConsultantQuery(booking.consultantId);

  const profile = profileQuery.currentData;

  const zone = localTimeZone();

  const initials = profile?.displayName

    .trim()

    .split(/\s+/)

    .slice(0, 2)

    .map((part) => part.charAt(0))

    .join('')

    .toUpperCase();

  return (

    <Stack spacing={{ xs: 3, md: 4 }}>

      <Stepper

        activeStep={3}

        alternativeLabel

        sx={{ '& .MuiStepLabel-label': { fontSize: { xs: 11, sm: 14 } } }}

      >

        {['Select time', 'Confirm details', 'Make payment', 'Booking confirmed'].map((label) => (

          <Step key={label}>

            <StepLabel>{label}</StepLabel>

          </Step>

        ))}

      </Stepper>

      <Paper

        sx={{

          ...cardStyle,

          textAlign: 'center',

          py: { xs: 4, md: 5 },

          bgcolor: '#f0fbf5',

          borderColor: '#c9ebd8',

        }}

      >

        <CheckCircleRounded sx={{ fontSize: 68, color: 'success.main', mb: 1.5 }} />

        <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 38 }, fontWeight: 800, mb: 1.5 }}>

          Your session is confirmed!

        </Typography>

        <Typography sx={{ fontSize: 18 }} color="text.secondary">

          Your booking and payment have been confirmed.

        </Typography>

        <Typography variant="body2" sx={{ mt: 2, overflowWrap: 'anywhere' }}>

          Booking reference: {booking.id}

        </Typography>

      </Paper>

      <Box

        sx={{

          display: 'grid',

          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.35fr) minmax(0, 1fr)' },

          gap: 3,

          alignItems: 'start',

        }}

      >

        <Stack spacing={3}>

          <Paper sx={cardStyle} component="section" aria-labelledby="session-heading">

            <Stack spacing={3}>

              <Stack direction="row" spacing={1.5} alignItems="center">

                <EventAvailableOutlined color="primary" />

                <Typography id="session-heading" variant="h3" component="h2">

                  Session details

                </Typography>

              </Stack>

              {profileQuery.isLoading ? (

                <GuidanceLoading />

              ) : profileQuery.isError ? (

                guidanceError(profileQuery.error).status === 404 ? (

                  <Typography color="text.secondary">

                    The consultant's public profile is currently unavailable.

                  </Typography>

                ) : (

                  <GuidanceError error={profileQuery.error} retry={profileQuery.refetch} />

                )

              ) : (

                profile && (

                  <Stack direction="row" spacing={2} alignItems="center">

                    <Avatar

                      src={publicConsultantPhotoUrl(profile.id)}

                      alt={profile.displayName}

                      sx={{ width: 76, height: 76, bgcolor: 'primary.light' }}

                    >

                      {initials || '?'}

                    </Avatar>

                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>

                      <Typography variant="h3" component="h3">

                        {profile.displayName}

                      </Typography>

                      {profile.professionalHeadline && (

                        <Typography color="text.secondary">

                          {profile.professionalHeadline}

                        </Typography>

                      )}

                      {(profile.currentRole || profile.companyName) && (

                        <Typography variant="body2">

                          {[profile.currentRole, profile.companyName].filter(Boolean).join(' · ')}

                        </Typography>

                      )}

                      {profile.approvalLabel && (

                        <Chip

                          size="small"

                          label={profile.approvalLabel}

                          sx={{ alignSelf: 'flex-start' }}

                        />

                      )}

                      {profile.averageRating != null && profile.reviewCount > 0 && (

                        <Typography variant="body2">

                          {profile.averageRating.toFixed(1)} / 5 · {profile.reviewCount} reviews

                        </Typography>

                      )}

                    </Stack>

                  </Stack>

                )

              )}

              <Divider />

              <Box sx={{ bgcolor: '#f5f8ff', borderRadius: 2, p: 2.5 }}>

                <Stack spacing={1}>

                  <Typography fontWeight={700}>{booking.serviceTitle}</Typography>

                  <Typography>

                    {booking.serviceType} · {booking.durationMinutes} minutes

                  </Typography>

                  <Typography>

                    {dateTime(booking.startUtc, zone)} – {dateTime(booking.endUtc, zone)}

                  </Typography>

                  <Typography variant="body2" color="text.secondary">

                    Your timezone: {zone}

                  </Typography>

                  {booking.consultantTimeZone && booking.consultantTimeZone !== zone && (

                    <Typography variant="body2" color="text.secondary">

                      Consultant timezone: {booking.consultantTimeZone}

                    </Typography>

                  )}

                </Stack>

              </Box>

            </Stack>

          </Paper>

          <MeetingDetails bookingId={booking.id} />

        </Stack>

        <Stack spacing={3}>

          <Paper sx={cardStyle} component="section" aria-labelledby="payment-heading">

            <Stack spacing={2}>

              <Stack direction="row" spacing={1.5} alignItems="center">

                <PaymentsOutlined color="success" />

                <Typography id="payment-heading" variant="h3" component="h2">

                  Payment details

                </Typography>

              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">

                <Typography>Amount paid</Typography>

                <Typography variant="h3" color="success.main">

                  {money(payment.gross, payment.currency)}

                </Typography>

              </Stack>

              <StatusChip values={CareerPaymentStatus} value={payment.status} />

              <Divider />

              <Typography>Currency: {payment.currency}</Typography>

              {payment.providerPaymentId && (

                <Typography sx={{ overflowWrap: 'anywhere' }}>

                  Payment reference: {payment.providerPaymentId}

                </Typography>

              )}

              {payment.paidAtUtc && (

                <Typography>Paid: {dateTime(payment.paidAtUtc, zone)}</Typography>

              )}

            </Stack>

          </Paper>

          <Paper

            sx={{ ...cardStyle, bgcolor: '#f7f9ff' }}

            component="section"

            aria-labelledby="next-heading"

          >

            <Stack spacing={3}>

              <Typography id="next-heading" variant="h3" component="h2">

                What happens next

              </Typography>

              {[

                ['Booking confirmed', 'Your payment and session reservation are confirmed.'],

                [

                  'Check session details',

                  'Return to this booking for the latest session information.',

                ],

                [

                  'Join when available',

                  'The join option appears only when the meeting is configured and the backend allows access.',

                ],

                [

                  'Share feedback',

                  'After an eligible completed paid session, you can submit a review.',

                ],

              ].map(([title, description], index) => (

                <Stack direction="row" spacing={2} key={title}>

                  <Avatar

                    sx={{

                      width: 32,

                      height: 32,

                      bgcolor: '#e4ecff',

                      color: 'primary.main',

                      fontSize: 14,

                    }}

                  >

                    {index + 1}

                  </Avatar>

                  <Box>

                    <Typography fontWeight={700}>{title}</Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>

                      {description}

                    </Typography>

                  </Box>

                </Stack>

              ))}

            </Stack>

          </Paper>

        </Stack>

      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">

        <Button component={Link} to={guidanceRoutes.bookings} variant="contained" size="large">

          My bookings

        </Button>

        <Button component={Link} to={guidanceRoutes.marketplace} variant="outlined" size="large">

          Find a consultant

        </Button>

        <Button component={Link} to={guidanceRoutes.booking(booking.id)} size="large">

          Booking details

        </Button>

      </Stack>

    </Stack>

  );

}

export default function BookingConfirmedPage() {

  const { id = '' } = useParams();

  const booking = useGetCareerBookingQuery(

    { audience: 'candidate', id },

    { refetchOnMountOrArgChange: true },

  );

  const confirmed = booking.currentData?.status === CareerBookingStatus.Confirmed;

  const payment = useGetCareerPaymentQuery(id, {

    skip: !confirmed || booking.isFetching || booking.isError,

    refetchOnMountOrArgChange: true,

  });

  let content;

  if (booking.isError) content = <GuidanceError error={booking.error} retry={booking.refetch} />;

  else if (booking.isFetching || !booking.currentData) content = <GuidanceLoading />;

  else if (!confirmed) content = <Navigate to={guidanceRoutes.booking(id)} replace />;

  else if (payment.isError)

    content = <GuidanceError error={payment.error} retry={payment.refetch} />;

  else if (payment.isFetching || payment.isUninitialized) content = <GuidanceLoading />;

  else if (

    !payment.currentData ||

    payment.currentData.bookingId !== id ||

    payment.currentData.status !== CareerPaymentStatus.Captured ||

    payment.currentData.requiresRefundReview

  )

    content = <Navigate to={guidanceRoutes.booking(id)} replace />;

  else

    content = <Confirmation key={id} booking={booking.currentData} payment={payment.currentData} />;

  return (

    <GuidancePage title="Booking confirmation">

      <Breadcrumbs>

        <Link to={guidanceRoutes.marketplace}>Career Guidance</Link>

        <Link to={guidanceRoutes.bookings}>My bookings</Link>

        <Typography>Booking confirmation</Typography>

      </Breadcrumbs>

      {content}

    </GuidancePage>

  );

}
