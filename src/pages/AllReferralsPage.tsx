import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetMyReferralsQuery } from '@/features/referrals/api/referralsApi';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

type ReferralStatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

const formatSubmittedDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const normalizeReferralStatus = (value: string | number) => {
  const normalized = String(value);

  if (normalized === '1') return 'Pending';
  if (normalized === '2') return 'Approved';
  if (normalized === '3') return 'Rejected';

  return normalized;
};

const getStatusColor = (status: string) => {
  if (status === 'Approved') return '#15803D';
  if (status === 'Rejected') return '#DC2626';

  return '#D97706';
};

export const AllReferralsPage = () => {
  useDocumentMetadata(
    'All referrals | CareerHarbor',
    'View and track all the jobs you have referred on CareerHarbor.',
  );

  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReferralStatusFilter>('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const {
    data,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetMyReferralsQuery({
    search: search || undefined,
    status: status === 'All' ? undefined : status,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const handleStatusChange = (
    _: React.MouseEvent<HTMLElement>,
    nextStatus: ReferralStatusFilter | null,
  ) => {
    if (!nextStatus) {
      return;
    }

    setStatus(nextStatus);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
onClick={() => {
  void navigate(ROUTES.REFER_A_JOB);
}}          startIcon={<ArrowBackRoundedIcon />}
          sx={{
            mb: 1.5,
            px: 0,
            textTransform: 'none',
          }}
          variant="text"
        >
          Back to Refer a job
        </Button>

        <Typography
          component="h1"
          sx={{
            color: '#172B4D',
            fontSize: { xs: 28, md: 34 },
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          All referrals
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
            maxWidth: 680,
          }}
        >
          View and track all the jobs you've referred.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Stack spacing={2}>
          <Stack
            alignItems={{ xs: 'stretch', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <TextField
              fullWidth
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search referrals by job title or location..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <Button
                        onClick={handleClearSearch}
                        size="small"
                        sx={{ minWidth: 0 }}
                      >
                        Clear
                      </Button>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
              sx={{
                maxWidth: { md: 620 },
              }}
              value={searchInput}
            />

            {isFetching && !isLoading ? (
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                sx={{ color: 'text.secondary' }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2">Updating...</Typography>
              </Stack>
            ) : null}
          </Stack>

          <Box
            sx={{
              overflowX: 'auto',
              pb: 0.25,
            }}
          >
            <ToggleButtonGroup
              exclusive
onChange={(event, nextStatus) => {
  handleStatusChange(event, nextStatus as ReferralStatusFilter | null);
}}
              size="small"
              value={status}
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '999px !important',
                  fontWeight: 700,
                  minWidth: 82,
                  px: 2,
                  textTransform: 'none',
                },
                '& .Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                },
                display: 'flex',
                gap: 1,
                width: 'max-content',
              }}
            >
              <ToggleButton value="All">All</ToggleButton>
              <ToggleButton value="Pending">Pending</ToggleButton>
              <ToggleButton value="Approved">Approved</ToggleButton>
              <ToggleButton value="Rejected">Rejected</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Paper>

      {isLoading && !data ? (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 5,
          }}
        >
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">
              Loading your referrals...
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      {isError && !data ? (
        <Alert
          action={
            <Button color="inherit" onClick={() => void refetch()} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          We couldn't load your referrals.
        </Alert>
      ) : null}

      {data && data.items.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            textAlign: 'center',
          }}
        >
          <Stack alignItems="center" spacing={1.5}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: '#EEF4FF',
                borderRadius: '50%',
                color: 'primary.main',
                display: 'flex',
                height: 52,
                justifyContent: 'center',
                width: 52,
              }}
            >
              <BusinessRoundedIcon />
            </Box>

            <Typography fontSize={18} fontWeight={800}>
              {search || status !== 'All'
                ? 'No matching referrals'
                : 'No referrals yet'}
            </Typography>

            <Typography color="text.secondary" variant="body2">
              {search || status !== 'All'
                ? 'Try changing your search or status filter.'
                : 'Jobs you refer will appear here so you can track their status.'}
            </Typography>

            {!search && status === 'All' ? (
              <Button
onClick={() => {
  void navigate(ROUTES.REFER_A_JOB);
}}                sx={{ mt: 1 }}
                variant="contained"
              >
                Refer a job
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      {data && data.items.length > 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary" variant="body2">
            {data.totalCount.toLocaleString()}{' '}
            {data.totalCount === 1 ? 'referral' : 'referrals'}
          </Typography>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {data.items.map((referral, index) => {
              const referralStatus = normalizeReferralStatus(
                referral.approvalStatus,
              );

              return (
                <Box
                  component="article"
                  key={referral.id}
                  sx={{
                    borderBottom:
                      index < data.items.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    p: { xs: 2, sm: 2.5 },
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: '#F8FAFD',
                    },
                  }}
                >
                  <Stack
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack
                      alignItems="flex-start"
                      direction="row"
                      spacing={1.5}
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          alignItems: 'center',
                          bgcolor: '#EEF4FF',
                          borderRadius: 2,
                          color: 'primary.main',
                          display: 'flex',
                          flexShrink: 0,
                          height: 42,
                          justifyContent: 'center',
                          width: 42,
                        }}
                      >
                        <BusinessRoundedIcon fontSize="small" />
                      </Box>

                      <Stack spacing={0.6} sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: '#172B4D',
                            fontSize: 16,
                            fontWeight: 800,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {referral.jobTitle}
                        </Typography>

                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={0.5}
                        >
                          <LocationOnOutlinedIcon
                            sx={{
                              color: 'text.secondary',
                              fontSize: 17,
                            }}
                          />
                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            {referral.location?.trim() || 'Location not specified'}
                          </Typography>
                        </Stack>

                        <Typography color="text.secondary" variant="caption">
                          Submitted {formatSubmittedDate(referral.createdAtUtc)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={0.75}
                      sx={{
                        flexShrink: 0,
                        pl: { xs: 7.25, sm: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: getStatusColor(referralStatus),
                          borderRadius: '50%',
                          height: 7,
                          width: 7,
                        }}
                      />

                      <Typography
                        fontWeight={700}
                        sx={{
                          color: getStatusColor(referralStatus),
                        }}
                        variant="body2"
                      >
                        {referralStatus}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Paper>

          {data.totalPages > 1 ? (
            <Stack alignItems="center" pt={1}>
              <Pagination
                boundaryCount={1}
                color="primary"
                count={data.totalPages}
               onChange={(_, nextPage) => {
  void Promise.resolve().then(() => {
    setPage(nextPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}}
                page={Math.min(page, data.totalPages)}
                siblingCount={1}
              />
            </Stack>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};