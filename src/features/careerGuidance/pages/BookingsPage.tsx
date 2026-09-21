import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { useGetCareerBookingsQuery } from '../api/schedulingApi';
import { useGetCareerCandidateSummaryQuery } from '../api/analyticsApi';
import { GuidanceError, GuidanceLoading, GuidanceNavigation, GuidancePage, GuidancePagination, MetricCards, StatusChip } from '../components/GuidanceUI';
import { CareerBookingStatus } from '../types';
import { dateTime, localTimeZone, money } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';
import type { Audience } from '../api/careerGuidanceApi';

export const BookingsPage = ({ audience = 'candidate' }: { audience?: Audience }) => {
  const [page, setPage] = useState(1);
  const bookings = useGetCareerBookingsQuery({ audience, pageNumber: page, pageSize: 10 }, { refetchOnMountOrArgChange: true });
  const summary = useGetCareerCandidateSummaryQuery(undefined, { skip: audience !== 'candidate' });
  return <GuidancePage title={audience === 'candidate' ? 'My guidance bookings' : 'Guidance bookings'} description={`Session times are shown in ${localTimeZone()}.`}>
    <GuidanceNavigation owner={audience === 'consultant'} admin={audience === 'admin'} />
    {audience === 'candidate' && (summary.isLoading ? <GuidanceLoading /> : summary.isError ? <GuidanceError error={summary.error} retry={summary.refetch} /> : summary.data && <>
      <MetricCards metrics={[{ label: 'Upcoming bookings', value: summary.data.upcomingBookings }, { label: 'Completed bookings', value: summary.data.completedBookings }, { label: 'Cancelled bookings', value: summary.data.cancelledBookings }, { label: 'Reviews awaiting moderation', value: summary.data.pendingReviewCount }, { label: 'Active disputes', value: summary.data.activeDisputeCount }]} />
      <Paper sx={{ p: 2.5 }}><Typography>Next provisioned session: {dateTime(summary.data.nextUpcomingSession)}</Typography></Paper>
    </>)}
    {bookings.isLoading ? <GuidanceLoading /> : bookings.isError ? <GuidanceError error={bookings.error} retry={bookings.refetch} /> : <Stack spacing={2}>
      {!bookings.data?.items.length && <Typography>No bookings yet.</Typography>}
      {bookings.data?.items.map((booking) => <Paper key={booking.id} sx={{ p: 3 }}><Stack spacing={1.5}><Typography component="h2" variant="h3">{booking.serviceTitle}</Typography><StatusChip values={CareerBookingStatus} value={booking.status} /><Typography>{dateTime(booking.startUtc)} · {booking.durationMinutes} minutes · {money(booking.price, booking.currency)}</Typography><Button component={Link} to={audience === 'candidate' ? guidanceRoutes.booking(booking.id) : audience === 'consultant' ? guidanceRoutes.owner(`bookings/${booking.id}`) : guidanceRoutes.admin(`bookings/${booking.id}`)}>View booking</Button></Stack></Paper>)}
      <GuidancePagination page={page} count={bookings.data?.totalPages ?? 0} onChange={setPage} />
    </Stack>}
  </GuidancePage>;
};
