import { useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useGetBookingReviewQuery, useSaveBookingReviewMutation, useWithdrawBookingReviewMutation } from '../api/trustApi';
import { useGetCareerPaymentQuery } from '../api/financeApi';
import { useGetCareerSessionQuery } from '../api/sessionsApi';
import { CareerBookingStatus, CareerPaymentStatus, CareerReviewStatus, CareerSessionStatus, type CareerBookingResponse } from '../types';
import { guidanceError } from '../utils/errors';
import { useGuidanceAction } from '../hooks/useGuidanceAction';
import { GuidanceError, GuidanceLoading, StatusChip } from './GuidanceUI';
import { GuidanceForm, numberValue, optionalText } from './GuidanceForm';

export function BookingReview({ booking }: { booking: CareerBookingResponse }) {
const shouldCheckReview =
  booking.status === CareerBookingStatus.Completed;

const query = useGetBookingReviewQuery(booking.id, {
  skip: !shouldCheckReview,
});

const payment = useGetCareerPaymentQuery(booking.id, {
  skip: !shouldCheckReview,
});

const session = useGetCareerSessionQuery(
  { audience: 'candidate', id: booking.id },
  { skip: !shouldCheckReview },
);
  const [save] = useSaveBookingReviewMutation(); const [withdraw] = useWithdrawBookingReviewMutation();
  const action = useGuidanceAction(); const [editing, setEditing] = useState(false);
  const review = query.data;
  const eligible = booking.status === CareerBookingStatus.Completed && session.data?.status === CareerSessionStatus.Completed && payment.data?.status === CareerPaymentStatus.Captured && Boolean(payment.data.paidAtUtc) && !payment.data.requiresRefundReview;
  const editable = review && !review.isDeleted && ![CareerReviewStatus.Hidden, CareerReviewStatus.Rejected].includes(review.moderationStatus);
  const missing = guidanceError(query.error).status === 404;
  if (!shouldCheckReview) return null;
  return <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography component="h2" variant="h3">Your review</Typography>
    <Typography variant="body2">Reviews may require moderation before publication. Editing returns a review to moderation. The server checks the configured editing deadline.</Typography>
    {action.error && <Alert severity="error">{action.error}</Alert>}
    {query.isLoading ? <GuidanceLoading /> : query.isError && !missing ? <GuidanceError error={query.error} retry={query.refetch} /> : <>
      {review && <><StatusChip values={CareerReviewStatus} value={review.moderationStatus} /><Typography>{review.isDeleted ? 'Withdrawn — this booking cannot receive another review.' : review.isPublished ? 'Published' : 'Not public'}</Typography><Typography>{review.rating} / 5 — {review.title}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{review.comment}</Typography></>}
      {eligible && ((!review && missing) || (editable && editing)) && <GuidanceForm key={review?.revision ?? 'new-review'} busy={action.busy || query.isFetching} submitLabel={review ? 'Update review' : 'Submit review'} initial={{ rating: review?.rating ?? 0, title: review?.title ?? '', comment: review?.comment ?? '' }} fields={[{ name: 'rating', label: 'Rating', kind: 'rating', required: true }, { name: 'title', label: 'Review title (optional)', maxLength: 120 }, { name: 'comment', label: 'Your experience (optional)', kind: 'textarea', maxLength: 2000 }]} validate={(values) => numberValue(values, 'rating') < 1 || numberValue(values, 'rating') > 5 ? 'Choose a rating from 1 to 5.' : null} onSubmit={async (values) => { const saved = await action.execute(() => save({ bookingId: booking.id, edit: Boolean(review), request: { rating: numberValue(values, 'rating'), title: optionalText(values, 'title'), comment: optionalText(values, 'comment'), revision: review?.revision ?? null } }).unwrap(), 'Review submitted for moderation.'); if (saved) setEditing(false); }} />}
      {eligible && editable && !editing && <Button onClick={() => setEditing(true)}>Edit review</Button>}
      {review && !review.isDeleted && <Button color="warning" disabled={action.busy || query.isFetching} onClick={() => { void action.execute(() => withdraw({ bookingId: booking.id, revision: review.revision }).unwrap(), 'Review withdrawn.'); }}>Withdraw review permanently</Button>}
      {!eligible && !review && <Typography>A review becomes available after a paid session is completed. No-show and refunded bookings are not eligible.</Typography>}
    </>}
  </Stack></Paper>;
}
