import {
  ChevronRightRounded,
  GavelRounded,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { Link } from 'react-router-dom';

import { useGetCareerDisputesQuery } from '../api/trustApi';

import {
  CareerDisputeCategory,
  CareerDisputeStatus,
} from '../types';

import {
  dateTime,
} from '../utils/presentation';

function enumLabel(
  values: Record<string, string | number>,
  value: number,
) {
  const raw = values[value];

  if (typeof raw !== 'string') {
    return 'Unknown';
  }

  return raw.replace(
    /([a-z])([A-Z])/g,
    '$1 $2',
  );
}

function isOpenDispute(
  status: CareerDisputeStatus,
) {
  return ![
    CareerDisputeStatus.Resolved,
    CareerDisputeStatus.Rejected,
    CareerDisputeStatus.Cancelled,
  ].includes(status);
}

export default function ConsultantDisputes() {
  const query = useGetCareerDisputesQuery({
    audience: 'consultant',
    query: {
      pageNumber: 1,
      pageSize: 50,
    },
  });

  if (query.isLoading) {
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
          Loading disputes...
        </Typography>
      </Paper>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            onClick={() => {
              void query.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        We couldn't load your disputes.
      </Alert>
    );
  }

  const disputes = query.data.items ?? [];

  const openCount = disputes.filter(
    (dispute) =>
      isOpenDispute(dispute.status),
  ).length;

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
            sm: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
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
              <GavelRounded />
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
              >
                Disputes
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Review disputes connected to your
                guidance bookings and respond with
                evidence when required.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
          >
            <Chip
              label={`${query.data.totalCount} total`}
              variant="outlined"
            />

            <Chip
              label={`${openCount} open`}
              color={
                openCount > 0
                  ? 'warning'
                  : 'default'
              }
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      {query.data.totalPages > 1 && (
        <Alert severity="info">
          Showing the first 50 disputes. Pagination
          will be added if dispute volume grows
          beyond this page.
        </Alert>
      )}

      {disputes.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <GavelRounded
            sx={{
              fontSize: 42,
              color: 'text.disabled',
            }}
          />

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ mt: 1.5 }}
          >
            No disputes
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
              maxWidth: 520,
              mx: 'auto',
            }}
          >
            You don't currently have any disputes
            associated with your consultant
            bookings.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {disputes.map((dispute) => (
            <Paper
              key={dispute.id}
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
                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    alignItems="center"
                  >
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      {enumLabel(
                        CareerDisputeCategory,
                        dispute.category,
                      )}
                    </Typography>

                    <Chip
                      size="small"
                      label={enumLabel(
                        CareerDisputeStatus,
                        dispute.status,
                      )}
                      color={
                        isOpenDispute(
                          dispute.status,
                        )
                          ? 'warning'
                          : 'default'
                      }
                      variant="outlined"
                    />

                    {dispute.requestedRefund && (
                      <Chip
                        size="small"
                        label="Refund requested"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {dispute.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 1,
                    }}
                  >
                    Submitted{' '}
                    {dateTime(
                      dispute.submittedAtUtc,
                    )}
                  </Typography>
                </Box>

                <Button
                  component={Link}
                  to={`/career-guidance/consultant/disputes/${dispute.id}`}
                  endIcon={
                    <ChevronRightRounded />
                  }
                  sx={{
                    flexShrink: 0,
                    alignSelf: {
                      xs: 'flex-start',
                      md: 'center',
                    },
                  }}
                >
                  View details
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}