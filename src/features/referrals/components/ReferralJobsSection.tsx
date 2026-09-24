import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { useGetAIApplyPlansQuery } from '@/features/aiApply/api/aiApplyApi';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import {
  useGetPublicReferralJobsQuery,
  useLazyUnlockReferralContactQuery,
} from '../api/referralsApi';
import type { PublicReferralJob, ReferrerContactDetails } from '../types/referralModels';
import { ReferralJobCard } from './ReferralJobCard';
import { ReferralPremiumBanner } from './ReferralPremiumBanner';

export const ReferralJobsSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const {
    currentData: data,
    isError,
    isFetching,
    refetch,
  } = useGetPublicReferralJobsQuery({ pageNumber: page, pageSize: 12 });
  const memberships = useGetMembershipsQuery(undefined, { skip: !currentUser });
  const plans = useGetAIApplyPlansQuery();
  const [triggerUnlock, unlockState] = useLazyUnlockReferralContactQuery();
  const [selectedJob, setSelectedJob] = useState<PublicReferralJob | null>(null);
  const [contact, setContact] = useState<ReferrerContactDetails | null>(null);
  const [contactError, setContactError] = useState(false);
  const [learnMore, setLearnMore] = useState(false);
  const inFlight = useRef(false);
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const goToAccess = () => {
    void navigate(
      `${ROUTES.MEMBERSHIP}?plan=ReferralContactAccess&returnTo=${encodeURIComponent(returnTo)}`,
    );
  };
  const goToLogin = () => {
    void navigate(ROUTES.LOGIN, { state: { from: returnTo } });
  };
  const referralPlan = plans.data?.find((plan) => plan.planCode === 'ReferralContactAccess');
  const activeAccess = Boolean(
    currentUser &&
    (data?.items.some((job) => job.canViewReferrerContact === true) ||
      (referralPlan &&
        memberships.data?.some(
          (membership) =>
            membership.planName === referralPlan.displayName && isMembershipActive(membership),
        ))),
  );
  const access = activeAccess
    ? 'active'
    : !currentUser
      ? 'inactive'
      : memberships.isLoading || plans.isLoading
        ? 'checking'
        : memberships.isError || plans.isError || !referralPlan
          ? 'unknown'
          : 'inactive';

  const handleSeeDetails = async (job: PublicReferralJob) => {
    if (inFlight.current) return;
    if (!currentUser || job.contactAccessStatus === 'LoginRequired') {
      goToLogin();
      return;
    }
    if (job.canViewReferrerContact !== true && job.contactAccessStatus === 'MembershipRequired') {
      goToAccess();
      return;
    }
    inFlight.current = true;
    setSelectedJob(job);
    setContact(null);
    setContactError(false);
    try {
      const result = await triggerUnlock(job.jobId, false).unwrap();
      if (result.status === 'LoginRequired') {
        setSelectedJob(null);
        goToLogin();
      } else if (result.status === 'MembershipRequired') {
        setSelectedJob(null);
        goToAccess();
      } else if (result.status === 'Granted') setContact(result.contact);
    } catch {
      setContactError(true);
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <Stack spacing={2.5} sx={{ minWidth: 0 }}>
      <ReferralPremiumBanner access={access} onAccess={goToAccess} />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{ py: 1.25, flexWrap: 'wrap', rowGap: 1.5 }}
      >
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
          {data ? `${data.totalCount} referral jobs` : 'Referral jobs'}
        </Typography>
        <Box
          title="Results use the backend's default order"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            border: '1px solid #dce2eb',
            borderRadius: 1,
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            fontSize: 14,
          }}
        >
          Sort by: <Box component="strong">Most relevant</Box>
          <ExpandMoreIcon sx={{ ml: 2, fontSize: 16 }} />
        </Box>
      </Stack>
      {isError ? (
        <ErrorState title="Referral jobs unavailable" onRetry={() => void refetch()} />
      ) : isFetching && !data ? (
        <Stack spacing={2.5} role="status" aria-label="Loading referral jobs">
          {[1, 2, 3].map((key) => (
            <Paper
              key={key}
              variant="outlined"
              sx={{ p: 3, display: 'flex', gap: 3, alignItems: 'center', minHeight: 190 }}
            >
              <Skeleton variant="rounded" width={72} height={72} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="65%" />
                <Skeleton width="85%" />
                <Skeleton width="50%" />
              </Box>
              <Skeleton
                variant="rounded"
                sx={{ display: { xs: 'none', md: 'block' }, width: '27%' }}
                height={138}
              />
            </Paper>
          ))}
        </Stack>
      ) : data?.items.length ? (
        data.items.map((job) => (
          <ReferralJobCard
            key={job.referralId ?? job.jobId}
            job={job}
            busy={unlockState.isFetching}
            onSeeDetails={(selected) => void handleSeeDetails(selected)}
          />
        ))
      ) : (
        <EmptyState
          title="No referral jobs yet"
          description="Check back soon for new employee referral opportunities."
        />
      )}
      {data && data.totalPages > 1 && (
        <Pagination
          page={data.pageNumber}
          count={data.totalPages}
          onChange={(_, value) => setPage(value)}
          sx={{ alignSelf: 'center' }}
        />
      )}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        useFlexGap
        flexWrap="wrap"
        gap={3}
        sx={{ bgcolor: '#fff9e9', borderRadius: 1.5, px: 3, py: 2.5, minHeight: 90 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <LightbulbOutlinedIcon sx={{ color: '#dba51b' }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#714719' }}>
            Why referral jobs?
          </Typography>
        </Stack>
        {[
          'Higher chance of getting shortlisted',
          'Faster interview process',
          'Insights from current employees',
        ].map((benefit) => (
          <Stack key={benefit} direction="row" alignItems="center" spacing={0.75}>
            <CheckCircleOutlineIcon sx={{ fontSize: 21, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 13 }}>{benefit}</Typography>
          </Stack>
        ))}
        <Button
          variant="outlined"
          onClick={() => setLearnMore(true)}
          sx={{ ml: { md: 'auto' }, minHeight: 32, fontSize: 13 }}
        >
          Learn more
        </Button>
      </Stack>
      <Dialog open={learnMore} onClose={() => setLearnMore(false)}>
        <DialogTitle>Why referral jobs?</DialogTitle>
        <DialogContent>
          Referrers can share insights about a role and their workplace. Contact access lasts 30
          days across eligible referral jobs. A referral does not guarantee a response, interview,
          faster process, or job offer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLearnMore(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={selectedJob !== null}
        onClose={() => {
          if (!inFlight.current) setSelectedJob(null);
        }}
      >
        <DialogTitle>{selectedJob?.jobTitle}</DialogTitle>
        <DialogContent>
          {unlockState.isFetching ? (
            <Typography>Checking referral access…</Typography>
          ) : contactError ? (
            <Alert
              severity="error"
              action={
                <Button
                  onClick={() => {
                    if (selectedJob) void handleSeeDetails(selectedJob);
                  }}
                >
                  Retry
                </Button>
              }
            >
              Unable to check contact access. Please retry.
            </Alert>
          ) : contact && currentUser ? (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography fontWeight={700}>{contact.referrerName}</Typography>
              {contact.linkedInUrl && (
                <Typography sx={{ overflowWrap: 'anywhere' }}>
                  LinkedIn: {contact.linkedInUrl}
                </Typography>
              )}
              {contact.email && (
                <Typography sx={{ overflowWrap: 'anywhere' }}>Email: {contact.email}</Typography>
              )}
              {contact.phoneNumber && <Typography>Phone: {contact.phoneNumber}</Typography>}
            </Stack>
          ) : (
            <Typography>Referrer contact details are unavailable.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={unlockState.isFetching} onClick={() => setSelectedJob(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
