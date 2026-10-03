import { useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
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
  useGetAdminConsultantsQuery,
  useVerifyConsultantMutation,
} from '../api/profilesApi';
import {
  useGetAdminCareerReviewsQuery,
  useGetCareerDisputesQuery,
  useModerateCareerReviewMutation,
} from '../api/trustApi';
import { useGetCareerAdminAnalyticsQuery } from '../api/analyticsApi';
import {
  CareerReviewStatus,
  ConsultantReviewAction,
  ConsultantVerificationStatus,
} from '../types';
import { useGuidanceAction } from '../hooks/useGuidanceAction';

export default function AdminGuidancePage() {
  const section =
    window.location.pathname.split('/').pop() ?? 'consultants';

  const [page, setPage] = useState(1);
  const action = useGuidanceAction();

  const consultants = useGetAdminConsultantsQuery({
    pageNumber: page,
    pageSize: 20,
  });

  const reviews = useGetAdminCareerReviewsQuery({
    pageNumber: page,
    pageSize: 20,
  });

  const disputes = useGetCareerDisputesQuery({
    audience: 'admin',
    query: {
      pageNumber: page,
      pageSize: 20,
    },
  });

  const analytics = useGetCareerAdminAnalyticsQuery(
    {},
    {
      skip: section !== 'analytics',
    },
  );

  const [verify] = useVerifyConsultantMutation();
  const [moderate] = useModerateCareerReviewMutation();

  const analyticsMetrics = analytics.data
    ? Object.entries(analytics.data).flatMap(([label, value]) => {
        if (
          label === 'fromUtc' ||
          label === 'toUtc' ||
          typeof value !== 'number'
        ) {
          return [];
        }

        return [
          {
            label,
            value,
          },
        ];
      })
    : [];

  return (
    <GuidancePage
      title="Career Guidance administration"
      description="Revision-protected operations over consultant trust, sessions, disputes, reviews, and backend-defined analytics."
    >
      <GuidanceNavigation admin />

      <Alert severity="info">
        Private notes and evidence are visible only here. Refund-approved means
        recommended or approved for finance processing; it does not mean money
        has been refunded.
      </Alert>

      {section === 'analytics' && analytics.data && (
        <MetricCards metrics={analyticsMetrics} />
      )}

      {section === 'reviews' ? (
        <Paper sx={{ p: 3 }}>
          <Typography component="h2" variant="h3">
            Review moderation
          </Typography>

          {reviews.isLoading ? (
            <GuidanceLoading />
          ) : reviews.isError ? (
            <GuidanceError
              error={reviews.error}
              retry={reviews.refetch}
            />
          ) : (
            <Stack spacing={2}>
              {reviews.data?.items.map((review) => (
                <Stack
                  key={review.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Typography>
                    {review.rating}/5 · {review.title}
                  </Typography>

                  <StatusChip
                    values={CareerReviewStatus}
                    value={review.moderationStatus}
                  />

                  <Button
                    disabled={action.busy}
                    onClick={() =>
                      void action.execute(
                        () =>
                          moderate({
                            id: review.id,
                            request: {
                              revision: review.revision,
                              status: CareerReviewStatus.Approved,
                              reason: 'Approved after moderation',
                            },
                          }).unwrap(),
                        'Review approved.',
                      )
                    }
                  >
                    Approve
                  </Button>

                  <Button
                    disabled={action.busy}
                    onClick={() =>
                      void action.execute(
                        () =>
                          moderate({
                            id: review.id,
                            request: {
                              revision: review.revision,
                              status: CareerReviewStatus.Hidden,
                              reason: 'Hidden after moderation',
                            },
                          }).unwrap(),
                        'Review hidden.',
                      )
                    }
                  >
                    Hide
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      ) : section === 'disputes' ? (
        <Paper sx={{ p: 3 }}>
          <Typography component="h2" variant="h3">
            Disputes
          </Typography>

          {disputes.data?.items.map((dispute) => (
            <Stack key={dispute.id}>
              <StatusChip
                values={{
                  1: 'Open',
                  2: 'Under review',
                  5: 'Resolved',
                }}
                value={dispute.status}
              />

              <Typography>{dispute.description}</Typography>
            </Stack>
          ))}
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography component="h2" variant="h3">
            Consultant verification
          </Typography>

          {consultants.isLoading ? (
            <GuidanceLoading />
          ) : consultants.isError ? (
            <GuidanceError
              error={consultants.error}
              retry={consultants.refetch}
            />
          ) : (
            <Stack spacing={2}>
              {consultants.data?.items.map((consultant) => (
                <Stack
                  key={consultant.profile.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Typography>
                    {consultant.profile.displayName}
                  </Typography>

                  <StatusChip
                    values={ConsultantVerificationStatus}
                    value={consultant.verificationStatus}
                  />

                  {[
                    ConsultantVerificationStatus.Pending,
                    ConsultantVerificationStatus.Suspended,
                  ].includes(consultant.verificationStatus) && (
                    <Button
                      disabled={action.busy}
                      onClick={() =>
                        void action.execute(
                          () =>
                            verify({
                              id: consultant.profile.id,
                              request: {
                                action:
                                  consultant.verificationStatus ===
                                  ConsultantVerificationStatus.Suspended
                                    ? ConsultantReviewAction.Reactivate
                                    : ConsultantReviewAction.Approve,
                                reason: 'Reviewed by administrator',
                                revision: consultant.revision,
                              },
                            }).unwrap(),
                          'Verification updated.',
                        )
                      }
                    >
                      Approve/reactivate
                    </Button>
                  )}

                  {consultant.verificationStatus ===
                    ConsultantVerificationStatus.Verified && (
                    <Button
                      disabled={action.busy}
                      onClick={() => {
                        if (!window.confirm('Suspend this consultant?')) {
                          return;
                        }

                        void action.execute(
                          () =>
                            verify({
                              id: consultant.profile.id,
                              request: {
                                action: ConsultantReviewAction.Suspend,
                                reason: 'Suspended by administrator',
                                revision: consultant.revision,
                              },
                            }).unwrap(),
                          'Consultant suspended.',
                        );
                      }}
                    >
                      Suspend
                    </Button>
                  )}
                </Stack>
              ))}
            </Stack>
          )}

          <GuidancePagination
            page={page}
            count={
              consultants.data?.totalPages ??
              reviews.data?.totalPages ??
              0
            }
            onChange={setPage}
          />
        </Paper>
      )}
    </GuidancePage>
  );
}