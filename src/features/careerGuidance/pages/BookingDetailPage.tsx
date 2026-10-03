import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import {
  AccessTimeRounded,
  ArrowBackRounded,
  BusinessOutlined,
  CalendarMonthRounded,
  CancelOutlined,
  CheckCircleOutlineRounded,
  HelpOutlineRounded,
  NotesOutlined,
  PaymentsOutlined,
  PersonOutlineRounded,
  PlayCircleOutlineRounded,
  WorkOutlineRounded,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  useCancelCareerBookingMutation,
  useGetCareerBookingQuery,
  useSetLegacyBookingStatusMutation,
} from '../api/schedulingApi';

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
import { useGuidanceAction } from '../hooks/useGuidanceAction';

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
    >
      {icon && (
        <Box
          sx={{
            mt: 0.15,
            color: 'text.secondary',
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.25,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function ConsultantBookingStatus({
  booking,
}: {
  booking: CareerBookingResponse;
}) {
  if (
    booking.status ===
    CareerBookingStatus.Pending
  ) {
    return (
      <Chip
        label="Request pending"
        color="warning"
        variant="outlined"
        size="small"
      />
    );
  }

  if (
    booking.status ===
    CareerBookingStatus.Confirmed
  ) {
    return (
      <Chip
        label="Confirmed"
        color="primary"
        variant="outlined"
        size="small"
      />
    );
  }

  if (
    booking.status ===
    CareerBookingStatus.Completed
  ) {
    return (
      <Chip
        label="Completed"
        color="success"
        variant="outlined"
        size="small"
      />
    );
  }

  if (
    booking.status ===
    CareerBookingStatus.CancelledByCandidate
  ) {
    return (
      <Chip
        label="Cancelled by candidate"
        color="error"
        variant="outlined"
        size="small"
      />
    );
  }

  if (
    booking.status ===
    CareerBookingStatus.CancelledByConsultant
  ) {
    return (
      <Chip
        label="Cancelled by you"
        color="error"
        variant="outlined"
        size="small"
      />
    );
  }

  if (
    booking.status ===
    CareerBookingStatus.NoShowCandidate
  ) {
    return (
      <Chip
        label="Candidate no-show"
        color="error"
        variant="outlined"
        size="small"
      />
    );
  }

  if (
    booking.status ===
    CareerBookingStatus.NoShowConsultant
  ) {
    return (
      <Chip
        label="Consultant no-show"
        color="error"
        variant="outlined"
        size="small"
      />
    );
  }

  return (
    <StatusChip
      values={CareerBookingStatus}
      value={booking.status}
    />
  );
}

function ConsultantBookingDetail({
  booking,
  refetch,
}: {
  booking: CareerBookingResponse;
  refetch: () => Promise<unknown>;
}) {
  const action = useGuidanceAction();

  const [setStatus] =
    useSetLegacyBookingStatusMutation();

  const [cancelBooking] =
    useCancelCareerBookingMutation();

  const [cancelMode, setCancelMode] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState('');

  const now = Date.now();

  const startTime = Date.parse(
    booking.startUtc,
  );

  const isFuture =
    Number.isFinite(startTime) &&
    startTime > now;

  const isPending =
    booking.status ===
    CareerBookingStatus.Pending;

  const isConfirmed =
    booking.status ===
    CareerBookingStatus.Confirmed;

  const isCompleted =
    booking.status ===
    CareerBookingStatus.Completed;

  const isNoShow =
    booking.status ===
      CareerBookingStatus.NoShowCandidate ||
    booking.status ===
      CareerBookingStatus.NoShowConsultant;

  const isCancelled =
    booking.status ===
      CareerBookingStatus.CancelledByCandidate ||
    booking.status ===
      CareerBookingStatus.CancelledByConsultant;

  const canConfirm =
    isPending && isFuture;

  const canCancel =
    (isPending || isConfirmed) && isFuture;

  const canOpenSession =
    isConfirmed || isCompleted || isNoShow;

  const questionnaire =
    booking.questionnaire;

  const experienceText =
    questionnaire.yearsOfExperience == null
      ? null
      : `${questionnaire.yearsOfExperience} ${
          questionnaire.yearsOfExperience === 1
            ? 'year'
            : 'years'
        }`;

  const handleConfirm = async () => {
    if (
      !window.confirm(
        'Confirm this booking request?',
      )
    ) {
      return;
    }

    const result = await action.execute(
      () =>
        setStatus({
          id: booking.id,
          request: {
            revision: booking.revision,
            status:
              CareerBookingStatus.Confirmed,
          },
        }).unwrap(),
      'Booking confirmed.',
    );

    if (result) {
      await refetch();
    }
  };

  const handleCancel = async () => {
    const reason = cancelReason.trim();

    if (!reason) {
      return;
    }

    const result = await action.execute(
      () =>
        cancelBooking({
          audience: 'consultant',
          id: booking.id,
          request: {
            revision: booking.revision,
            reason,
          },
        }).unwrap(),
      isPending
        ? 'Booking request declined.'
        : 'Booking cancelled.',
    );

    if (result) {
      setCancelReason('');
      setCancelMode(false);
      await refetch();
    }
  };

  return (
    <Stack spacing={2.5}>
      <Button
        component={Link}
        to={guidanceRoutes.owner(
          'bookings',
        )}
        startIcon={<ArrowBackRounded />}
        sx={{
          alignSelf: 'flex-start',
          textTransform: 'none',
        }}
      >
        Back to bookings
      </Button>

      {action.error && (
        <Alert
          severity={
            action.conflict
              ? 'warning'
              : 'error'
          }
        >
          {action.error}

          {action.conflict && (
            <>
              {' '}
              This booking may have changed.
              Refresh the page before trying
              again.
            </>
          )}
        </Alert>
      )}

      {!isFuture &&
        isPending && (
          <Alert severity="warning">
            This booking request is no longer
            in the future and cannot be
            confirmed.
          </Alert>
        )}

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          borderRadius: 3,
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{
              xs: 'flex-start',
              md: 'center',
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="h2"
                fontWeight={800}
              >
                {booking.serviceTitle}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {booking.serviceType}
              </Typography>
            </Box>

            <ConsultantBookingStatus
              booking={booking}
            />
          </Stack>

          <Divider />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            <DetailItem
              label="Date & time"
              value={dateTime(
                booking.startUtc,
              )}
              icon={
                <CalendarMonthRounded fontSize="small" />
              }
            />

            <DetailItem
              label="Duration"
              value={`${booking.durationMinutes} minutes`}
              icon={
                <AccessTimeRounded fontSize="small" />
              }
            />

            <DetailItem
              label="Session price"
              value={money(
                booking.price,
                booking.currency,
              )}
              icon={
                <PaymentsOutlined fontSize="small" />
              }
            />

            <DetailItem
              label="Consultant timezone"
              value={
                booking.consultantTimeZone
              }
              icon={
                <AccessTimeRounded fontSize="small" />
              }
            />
          </Box>

          {booking.requiresPayment && (
            <Alert severity="info">
              This booking uses the payment-aware
              session lifecycle. Session
              completion and no-show actions are
              handled from the session page.
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          fontWeight={800}
        >
          Candidate request
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            mb: 2.5,
          }}
        >
          Information provided by the candidate
          when requesting this session.
        </Typography>

        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {hasText(
              questionnaire.targetCompany,
            ) && (
              <DetailItem
                label="Target company"
                value={
                  questionnaire.targetCompany
                }
                icon={
                  <BusinessOutlined fontSize="small" />
                }
              />
            )}

            {hasText(
              questionnaire.targetRole,
            ) && (
              <DetailItem
                label="Target role"
                value={
                  questionnaire.targetRole
                }
                icon={
                  <WorkOutlineRounded fontSize="small" />
                }
              />
            )}

            {experienceText && (
              <DetailItem
                label="Experience"
                value={experienceText}
                icon={
                  <PersonOutlineRounded fontSize="small" />
                }
              />
            )}

            {hasText(
              questionnaire.currentRoleOrStatus,
            ) && (
              <DetailItem
                label="Current role or status"
                value={
                  questionnaire.currentRoleOrStatus
                }
                icon={
                  <PersonOutlineRounded fontSize="small" />
                }
              />
            )}
          </Box>

          <Divider />

          <DetailItem
            label="Session goal"
            value={
              questionnaire.sessionGoal ||
              'Not provided'
            }
            icon={
              <CheckCircleOutlineRounded fontSize="small" />
            }
          />

          {hasText(
            questionnaire.questions,
          ) && (
            <DetailItem
              label="Questions"
              value={
                questionnaire.questions
              }
              icon={
                <HelpOutlineRounded fontSize="small" />
              }
            />
          )}

          {hasText(questionnaire.notes) && (
            <DetailItem
              label="Additional notes"
              value={questionnaire.notes}
              icon={
                <NotesOutlined fontSize="small" />
              }
            />
          )}
        </Stack>
      </Paper>

      {booking.cancellationReason && (
        <Alert severity="info">
          <strong>Cancellation reason:</strong>{' '}
          {booking.cancellationReason}
        </Alert>
      )}

      {!isCancelled && (
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            fontWeight={800}
          >
            Actions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 2.5,
            }}
          >
            Manage this booking using the actions
            allowed for its current status.
          </Typography>

          <Stack spacing={2}>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              {canConfirm && (
                <Button
                  variant="contained"
                  startIcon={
                    <CheckCircleOutlineRounded />
                  }
                  disabled={action.busy}
                  onClick={() => {
                    void handleConfirm();
                  }}
                >
                  Confirm booking
                </Button>
              )}

              {canOpenSession && (
                <Button
                  component={Link}
                  to={guidanceRoutes.owner(
                    `sessions/${booking.id}`,
                  )}
                  variant="contained"
                  startIcon={
                    <PlayCircleOutlineRounded />
                  }
                >
                  Open session
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={
                    <CancelOutlined />
                  }
                  disabled={action.busy}
                  onClick={() => {
                    action.clearError();
                    setCancelMode(
                      (value) => !value,
                    );
                  }}
                >
                  {isPending
                    ? 'Decline request'
                    : 'Cancel booking'}
                </Button>
              )}
            </Stack>

            {cancelMode && canCancel && (
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography
                    fontWeight={700}
                  >
                    {isPending
                      ? 'Decline this booking request'
                      : 'Cancel this booking'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Enter a clear reason. This
                    reason becomes part of the
                    booking history.
                  </Typography>

                  <TextField
                    label={
                      isPending
                        ? 'Reason for declining'
                        : 'Cancellation reason'
                    }
                    value={cancelReason}
                    onChange={(event) =>
                      setCancelReason(
                        event.target.value,
                      )
                    }
                    multiline
                    minRows={3}
                    fullWidth
                    required
                    inputProps={{
                      maxLength: 1000,
                    }}
                  />

                  <Stack
                    direction={{
                      xs: 'column',
                      sm: 'row',
                    }}
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <Button
                      disabled={action.busy}
                      onClick={() => {
                        setCancelMode(false);
                        setCancelReason('');
                        action.clearError();
                      }}
                    >
                      Keep booking
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      disabled={
                        action.busy ||
                        !cancelReason.trim()
                      }
                      onClick={() => {
                        void handleCancel();
                      }}
                    >
                      {isPending
                        ? 'Decline request'
                        : 'Confirm cancellation'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}

            {!canConfirm &&
              !canCancel &&
              !canOpenSession && (
                <Alert severity="info">
                  No consultant action is
                  available for this booking in
                  its current state.
                </Alert>
              )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

export default function BookingDetailPage() {
  const { id = '' } = useParams();

  const consultant =
    useLocation().pathname.includes(
      '/consultant/',
    );

  const audience = consultant
    ? 'consultant'
    : 'candidate';

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

  const canOpenCandidateSession =
    useMemo(
      () =>
        b &&
        [
          CareerBookingStatus.Confirmed,
          CareerBookingStatus.Completed,
          CareerBookingStatus.NoShowCandidate,
          CareerBookingStatus.NoShowConsultant,
        ].includes(b.status),
      [b],
    );

  return (
    <GuidancePage
      title={
        consultant
          ? 'Consultant workspace'
          : 'Booking details'
      }
      description={
        consultant
          ? 'Review and manage this guidance booking.'
          : `Times shown in ${localTimeZone()}.`
      }
    >
      <GuidanceNavigation
        owner={consultant}
      />

      {q.isLoading ? (
        <GuidanceLoading />
      ) : q.isError ? (
        <GuidanceError
          error={q.error}
          retry={q.refetch}
        />
      ) : (
        b &&
        (consultant ? (
          <ConsultantBookingDetail
            booking={b}
            refetch={async () => {
              await q.refetch();
            }}
          />
        ) : (
          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h3">
                  {b.serviceTitle}
                </Typography>

                <StatusChip
                  values={
                    CareerBookingStatus
                  }
                  value={b.status}
                />

                <Typography>
                  {dateTime(b.startUtc)} ·{' '}
                  {b.durationMinutes} minutes ·{' '}
                  {b.consultantTimeZone}
                </Typography>

                <Typography>
                  {b.serviceType} ·{' '}
                  {money(
                    b.price,
                    b.currency,
                  )}
                </Typography>

                <Typography
                  sx={{
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {
                    b.questionnaire
                      .sessionGoal
                  }
                </Typography>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1.5}
                >
                  {canOpenCandidateSession && (
                    <Button
                      component={Link}
                      to={guidanceRoutes.session(
                        b.id,
                      )}
                      variant="outlined"
                    >
                      Open session
                    </Button>
                  )}

                  {b.status ===
                    CareerBookingStatus.Completed && (
                    <Button
                      component={Link}
                      to={guidanceRoutes.feedback(
                        b.id,
                      )}
                      variant="contained"
                    >
                      Give Feedback
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>

            <BookingPayment booking={b} />
            <BookingReview booking={b} />
            <BookingDispute
              bookingId={b.id}
            />
          </Stack>
        ))
      )}
    </GuidancePage>
  );
}