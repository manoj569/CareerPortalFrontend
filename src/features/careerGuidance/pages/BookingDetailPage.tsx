import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';

import { useGetCareerBookingQuery } from '../api/schedulingApi';
import { BookingPayment } from '../components/BookingPayment';
import { BookingReview } from '../components/BookingReview';
import { BookingDispute } from '../components/BookingDispute';
import {
  GuidanceError,
  GuidanceLoading,
  GuidanceNavigation,
  GuidancePage,
  StatusChip,
} from '../components/GuidanceUI';
import { CareerBookingStatus } from '../types';
import { dateTime, localTimeZone } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';

export default function BookingDetailPage() {
  const { id = '' } = useParams();

  const consultant = useLocation().pathname.includes('/consultant/');

  const audience = consultant ? 'consultant' : 'candidate';

  const q = useGetCareerBookingQuery(
    {
      audience,
      id,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const b = q.data;

  const canOpenSession =
    b &&
    [
      CareerBookingStatus.Confirmed,
      CareerBookingStatus.Completed,
      CareerBookingStatus.NoShowCandidate,
      CareerBookingStatus.NoShowConsultant,
    ].includes(b.status);

  return (
    <GuidancePage
      title="Booking details"
      description={`Times shown in ${localTimeZone()}.`}
    >
      <GuidanceNavigation owner={consultant} />

      {q.isLoading ? (
        <GuidanceLoading />
      ) : q.isError ? (
        <GuidanceError error={q.error} retry={q.refetch} />
      ) : (
        b && (
          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h3">
                  {b.serviceTitle}
                </Typography>

                <StatusChip
                  values={CareerBookingStatus}
                  value={b.status}
                />

                <Typography>
                  {dateTime(b.startUtc)} · {b.durationMinutes} minutes ·{' '}
                  {b.consultantTimeZone}
                </Typography>

                <Typography>
                  {b.serviceType} · {b.currency} {b.price}
                </Typography>

                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {b.questionnaire.sessionGoal}
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                >
                  {canOpenSession && (
                    <Button
                      component={Link}
                      to={
                        consultant
                          ? guidanceRoutes.owner(`sessions/${b.id}`)
                          : guidanceRoutes.session(b.id)
                      }
                      variant="outlined"
                    >
                      Open session
                    </Button>
                  )}

                  {!consultant &&
                    b.status === CareerBookingStatus.Completed && (
                      <Button
                        component={Link}
                        to={guidanceRoutes.feedback(b.id)}
                        variant="contained"
                      >
                        Give Feedback
                      </Button>
                    )}
                </Stack>
              </Stack>
            </Paper>

            {!consultant && (
              <>
                <BookingPayment booking={b} />
                <BookingReview booking={b} />
                <BookingDispute bookingId={b.id} />
              </>
            )}
          </Stack>
        )
      )}
    </GuidancePage>
  );
}