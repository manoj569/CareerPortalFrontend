import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBackRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  LockOutlined,
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { useGetCareerBookingQuery } from '../api/schedulingApi';
import { useGetConsultantQuery } from '../api/profilesApi';
import { useGetCareerPaymentQuery } from '../api/financeApi';
import { useGetCareerSessionQuery } from '../api/sessionsApi';
import {
  useGetBookingReviewQuery,
  useSaveBookingReviewMutation,
  useWithdrawBookingReviewMutation,
} from '../api/trustApi';

import {
  CareerBookingStatus,
  CareerPaymentStatus,
  CareerReviewStatus,
  CareerSessionStatus,
} from '../types';

import {
  GuidanceError,
  GuidanceLoading,
  GuidanceNavigation,
  GuidancePage,
} from '../components/GuidanceUI';

import { guidanceError } from '../utils/errors';
import { dateTime, localTimeZone } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';

function initials(name?: string | null) {
  if (!name?.trim()) return 'CG';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function ratingMessage(value: number) {
  switch (value) {
    case 1:
      return 'Very poor';
    case 2:
      return 'Could be better';
    case 3:
      return 'Good';
    case 4:
      return 'Very good';
    case 5:
      return 'Excellent';
    default:
      return 'Select your rating';
  }
}

export default function BookingFeedbackPage() {
  const { id = '' } = useParams();

  const booking = useGetCareerBookingQuery(
    {
      audience: 'candidate',
      id,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const consultant = useGetConsultantQuery(
    booking.data?.consultantId ?? '',
    {
      skip: !booking.data?.consultantId,
    },
  );

  const shouldCheckEligibility =
    booking.data?.status === CareerBookingStatus.Completed;

  const payment = useGetCareerPaymentQuery(id, {
    skip: !shouldCheckEligibility,
  });

  const session = useGetCareerSessionQuery(
    {
      audience: 'candidate',
      id,
    },
    {
      skip: !shouldCheckEligibility,
    },
  );

  const review = useGetBookingReviewQuery(id, {
    skip: !shouldCheckEligibility,
  });

  const [saveReview, saveState] =
    useSaveBookingReviewMutation();

  const [withdrawReview, withdrawState] =
    useWithdrawBookingReviewMutation();

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const [message, setMessage] = useState<string | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  const currentReview = review.data;

  const reviewMissing =
    review.isError &&
    guidanceError(review.error).status === 404;

  const eligible =
    booking.data?.status === CareerBookingStatus.Completed &&
    session.data?.status === CareerSessionStatus.Completed &&
    payment.data?.status === CareerPaymentStatus.Captured &&
    Boolean(payment.data?.paidAtUtc) &&
    !payment.data?.requiresRefundReview;

  const editable =
    Boolean(currentReview) &&
    !currentReview?.isDeleted &&
    ![
      CareerReviewStatus.Hidden,
      CareerReviewStatus.Rejected,
    ].includes(
      currentReview?.moderationStatus ??
        CareerReviewStatus.Pending,
    );

  const busy =
    saveState.isLoading || withdrawState.isLoading;

  const showForm =
    eligible &&
    ((reviewMissing && !currentReview) ||
      (Boolean(currentReview) && editing));

  const beginEditing = () => {
    if (!currentReview) return;

    setRating(currentReview.rating);
    setTitle(currentReview.title ?? '');
    setComment(currentReview.comment ?? '');
    setMessage(null);
    setError(null);
    setEditing(true);
  };

  const submit = async () => {
    if (rating < 1 || rating > 5) {
      setError(
        'Please choose a rating from 1 to 5 stars.',
      );
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await saveReview({
        bookingId: id,
        edit: Boolean(currentReview),
        request: {
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
          revision: currentReview?.revision ?? null,
        },
      }).unwrap();

      setEditing(false);
      setMessage(
        'Thank you. Your feedback has been submitted for moderation.',
      );

      await review.refetch();
    } catch (requestError) {
setError(
  guidanceError(requestError).message ??
    'Something went wrong. Please try again.',
);    }
  };

  const withdraw = async () => {
    if (!currentReview) return;

    setError(null);
    setMessage(null);

    try {
      await withdrawReview({
        bookingId: id,
        revision: currentReview.revision,
      }).unwrap();

      setEditing(false);
      setMessage('Your review has been withdrawn.');

      await review.refetch();
    } catch (requestError) {
setError(
  guidanceError(requestError).message ??
    'Something went wrong. Please try again.',
);    }
  };

  if (booking.isLoading) {
    return (
      <GuidancePage
        title="Give feedback"
        description="Share your experience after your CareerHarbor guidance session."
      >
        <GuidanceNavigation />

        <GuidanceLoading />
      </GuidancePage>
    );
  }

  if (booking.isError) {
    return (
      <GuidancePage
        title="Give feedback"
        description="Share your experience after your CareerHarbor guidance session."
      >
        <GuidanceNavigation />

        <GuidanceError
          error={booking.error}
          retry={booking.refetch}
        />
      </GuidancePage>
    );
  }

  const bookingData = booking.data;

  if (!bookingData) return null;

  const consultantName =
    consultant.data?.displayName ?? 'Career consultant';

  const consultantHeadline =
  consultant.data?.professionalHeadline ||
  'CareerHarbor consultant';

  return (
    <GuidancePage
      title="Give feedback"
      description="Your feedback helps improve the CareerHarbor guidance experience."
    >
      <GuidanceNavigation />

      <Box
        sx={{
          maxWidth: 880,
          width: '100%',
          mx: 'auto',
          pb: 4,
        }}
      >
        <Button
          component={Link}
          to={guidanceRoutes.booking(id)}
          startIcon={<ArrowBackRounded />}
          sx={{
            mb: 2,
            textTransform: 'none',
          }}
        >
          Back to booking
        </Button>

        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: {
                xs: 2.5,
                sm: 4,
              },
              py: {
                xs: 3,
                sm: 4,
              },
              background:
                'linear-gradient(135deg, #f7f9ff 0%, #ffffff 60%, #f4f7ff 100%)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack
              spacing={1}
              alignItems="center"
              textAlign="center"
            >
              <CheckCircleRounded
                sx={{
                  fontSize: 42,
                  color: 'success.main',
                }}
              />

              <Typography
                variant="h3"
                component="h1"
                fontWeight={750}
              >
                How was your session?
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 570,
                }}
              >
                Share your experience with your consultant.
                Your review may be moderated before it is
                published.
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: {
                xs: 2.5,
                sm: 4,
              },
            }}
          >
            <Stack spacing={4}>
              {/* Consultant/session */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  backgroundColor: '#fafbff',
                }}
              >
                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                  }}
                >
                  <Avatar
                    src={
                      consultant.data?.profileImageUrl ??
undefined
                    }
                    alt={consultantName}
                    sx={{
                      width: 64,
                      height: 64,
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {initials(consultantName)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                    >
                      {consultantName}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 0.3 }}
                    >
                      {consultantHeadline}
                    </Typography>

                    <Stack
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      spacing={{
                        xs: 0.5,
                        sm: 2,
                      }}
                      sx={{ mt: 1.25 }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                      >
                        <CalendarMonthRounded
                          sx={{
                            fontSize: 18,
                            color: 'text.secondary',
                          }}
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {dateTime(
                            bookingData.startUtc,
                          )}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {bookingData.durationMinutes}{' '}
                        minutes
                      </Typography>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      textAlign: {
                        xs: 'left',
                        sm: 'right',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Session
                    </Typography>

                    <Typography fontWeight={650}>
                      {bookingData.serviceTitle}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {consultant.isError && (
                <Alert severity="info">
                  Consultant profile details could not
                  be loaded. You can still submit your
                  feedback for this completed session.
                </Alert>
              )}

              {message && (
                <Alert severity="success">
                  {message}
                </Alert>
              )}

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              {shouldCheckEligibility &&
                (payment.isLoading ||
                  session.isLoading ||
                  review.isLoading) && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <CircularProgress size={20} />

                    <Typography color="text.secondary">
                      Checking feedback eligibility...
                    </Typography>
                  </Stack>
                )}

              {review.isError && !reviewMissing && (
                <GuidanceError
                  error={review.error}
                  retry={review.refetch}
                />
              )}

              {/* Existing review */}
              {currentReview && !editing && (
                <Stack spacing={3}>
                  <Box textAlign="center">
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      Your rating
                    </Typography>

                    <Box sx={{ mt: 0.5 }}>
                      <Rating
                        value={currentReview.rating}
                        readOnly
                        size="large"
                        sx={{
                          fontSize: {
                            xs: 38,
                            sm: 46,
                          },
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{ mt: 0.5 }}
                    >
                      {ratingMessage(
                        currentReview.rating,
                      )}
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Review status
                    </Typography>

                    <Typography fontWeight={650}>
                      {currentReview.isDeleted
                        ? 'Withdrawn'
                        : currentReview.isPublished
                          ? 'Published'
                          : CareerReviewStatus[
                              currentReview
                                .moderationStatus
                            ]}
                    </Typography>
                  </Stack>

                  {currentReview.title && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Review title
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={650}
                      >
                        {currentReview.title}
                      </Typography>
                    </Box>
                  )}

                  {currentReview.comment && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Your experience
                      </Typography>

                      <Typography
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.7,
                        }}
                      >
                        {currentReview.comment}
                      </Typography>
                    </Box>
                  )}

                  {!currentReview.isDeleted && (
                    <Stack
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      spacing={1.5}
                    >
                      {editable && (
                        <Button
                          variant="outlined"
                          disabled={busy}
                          onClick={beginEditing}
                        >
                          Edit feedback
                        </Button>
                      )}

                      <Button
                        color="warning"
                        disabled={busy}
                        onClick={() => {
                          void withdraw();
                        }}
                      >
                        Withdraw review permanently
                      </Button>
                    </Stack>
                  )}

                  {currentReview.isDeleted && (
                    <Alert severity="info">
                      This review was permanently
                      withdrawn. This booking cannot
                      receive another review.
                    </Alert>
                  )}
                </Stack>
              )}

              {/* New/edit form */}
              {showForm && (
                <Stack spacing={4}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      fontWeight={700}
                    >
                      Rate your overall experience
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75 }}
                    >
                      Choose between 1 and 5 stars.
                    </Typography>

                    <Rating
                      value={rating}
                      onChange={(_, value) =>
                        setRating(value ?? 0)
                      }
                      size="large"
                      sx={{
                        mt: 1.5,
                        fontSize: {
                          xs: 42,
                          sm: 52,
                        },
                      }}
                    />

                    <Typography
                      fontWeight={650}
                      color={
                        rating > 0
                          ? 'primary.main'
                          : 'text.secondary'
                      }
                      sx={{ mt: 0.5 }}
                    >
                      {ratingMessage(rating)}
                    </Typography>
                  </Box>

                  <Divider />

                  <TextField
                    label="Review title (optional)"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    inputProps={{
                      maxLength: 120,
                    }}
                    helperText={`${title.length}/120`}
                    fullWidth
                  />

                  <TextField
                    label="Tell us about your experience (optional)"
                    placeholder="What was helpful about your session?"
                    value={comment}
                    onChange={(event) =>
                      setComment(event.target.value)
                    }
                    inputProps={{
                      maxLength: 2000,
                    }}
                    helperText={`${comment.length}/2000`}
                    multiline
                    minRows={6}
                    fullWidth
                  />

                  <Alert
                    severity="info"
                    icon={<LockOutlined />}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    Your review may require moderation
                    before it appears publicly.
                    Editing an existing review sends it
                    back through moderation.
                  </Alert>

                  <Stack
                    direction={{
                      xs: 'column-reverse',
                      sm: 'row',
                    }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    {currentReview && (
                      <Button
                        disabled={busy}
                        onClick={() => {
                          setEditing(false);
                          setError(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      disabled={busy || rating < 1}
                      onClick={() => {
                        void submit();
                      }}
                      sx={{
                        minWidth: 180,
                      }}
                    >
                      {busy
                        ? 'Submitting...'
                        : currentReview
                          ? 'Update feedback'
                          : 'Submit feedback'}
                    </Button>
                  </Stack>
                </Stack>
              )}

              {/* Not eligible */}
              {!eligible &&
                !currentReview &&
                !payment.isLoading &&
                !session.isLoading &&
                !review.isLoading && (
                  <Alert severity="info">
                    Feedback becomes available after a
                    paid session has been completed.
                    No-show bookings, refunded payments,
                    and payments requiring refund review
                    are not eligible for a review.
                  </Alert>
                )}

              <Divider />

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <LockOutlined
                  sx={{
                    fontSize: 16,
                    color: 'text.secondary',
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                >
                  Times shown in {localTimeZone()}.
                  Please do not include confidential,
                  financial, or sensitive personal
                  information in your review.
                </Typography>
              </Stack>

              <Box textAlign="center">
                <Button
                  component={Link}
                  to={guidanceRoutes.bookings}
                >
                  Back to my bookings
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </GuidancePage>
  );
}