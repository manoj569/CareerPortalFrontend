import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import {
  isPaymentsApiError,
  useLazyGetPhonePeReturnQuery,
} from '@/features/payments/api/paymentsApi';
import {
  clearPhonePeMerchantOrderId,
  clearPhonePeReturnTo,
  getStoredPhonePeReturnTo,
  getStoredPhonePeMerchantOrderId,
  isValidPhonePeMerchantOrderId,
} from '@/features/payments/services/phonePeCheckout';
import { PhonePePaymentStatus } from '@/features/payments/types/paymentModels';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { getSafeMembershipReturnTo } from '@/features/interviewInsights/utils/membershipAccess';
import { findActiveMembership } from '@/features/payments/utils/entitlement';

const POLL_INTERVAL_MS = 3_000;
const POLL_LIMIT_MS = 60_000;

const ResultCard = ({ children }: { children: React.ReactNode }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: '0 18px 45px rgba(41, 56, 126, 0.12)',
      maxWidth: 680,
      mx: 'auto',
    }}
  >
    <CardContent sx={{ p: { xs: 3, sm: 5 } }}>{children}</CardContent>
  </Card>
);

export const PhonePeReturnPage = () => {
  useDocumentMetadata(
    'PhonePe payment status | Career Harbor',
    'Check the server-verified status of your Career Harbor membership payment.',
  );
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLegacyReturn = location.pathname === ROUTES.PHONEPE_RETURN_LEGACY;
  const merchantOrderId = searchParams.get(isLegacyReturn ? 'order' : 'merchantOrderId');
  const storedOrderId = getStoredPhonePeMerchantOrderId();
  const sessionMatches =
    isValidPhonePeMerchantOrderId(merchantOrderId) && merchantOrderId === storedOrderId;
  const [checkStatus, query] = useLazyGetPhonePeReturnQuery();
  const [pollingEnded, setPollingEnded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const deadlineRef = useRef(Date.now() + POLL_LIMIT_MS);
  const completedHandled = useRef(false);
  const [activationConfirmed, setActivationConfirmed] = useState(false);
  const [activationError, setActivationError] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const requestStatus = useCallback(async () => {
    if (isLegacyReturn || !sessionMatches || !merchantOrderId || document.hidden) return;
    await checkStatus(merchantOrderId, false);
  }, [checkStatus, isLegacyReturn, merchantOrderId, sessionMatches]);

  useEffect(() => {
    if (isLegacyReturn || !sessionMatches) return;
    void requestStatus();
  }, [isLegacyReturn, requestStatus, sessionMatches]);

  useEffect(() => {
    clearTimer();
    if (
      !sessionMatches ||
      query.data?.merchantOrderId !== merchantOrderId ||
      query.data.status !== PhonePePaymentStatus.Pending
    )
      return;
    if (Date.now() >= deadlineRef.current) {
      setPollingEnded(true);
      return;
    }
    if (!document.hidden) {
      timerRef.current = setTimeout(() => void requestStatus(), POLL_INTERVAL_MS);
    }
    return clearTimer;
  }, [
    clearTimer,
    merchantOrderId,
    query.data?.merchantOrderId,
    query.data?.status,
    query.fulfilledTimeStamp,
    requestStatus,
    sessionMatches,
  ]);

  useEffect(() => {
    const handleVisibility = () => {
      clearTimer();
      if (
        !document.hidden &&
        query.data?.merchantOrderId === merchantOrderId &&
        query.data.status === PhonePePaymentStatus.Pending &&
        Date.now() < deadlineRef.current
      ) {
        timerRef.current = setTimeout(() => void requestStatus(), POLL_INTERVAL_MS);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimer();
    };
  }, [clearTimer, merchantOrderId, query.data, requestStatus]);

  useEffect(() => {
    if (
      query.data?.merchantOrderId !== merchantOrderId ||
      query.data.status !== PhonePePaymentStatus.Completed ||
      completedHandled.current
    )
      return;
    completedHandled.current = true;
    const confirmMembership = async () => {
      try {
        dispatch(dashboardApi.util.invalidateTags(['Memberships']));
        const memberships = await dispatch(dashboardApi.endpoints.getMemberships.initiate(undefined, { forceRefetch: true })).unwrap();
        if (!findActiveMembership(memberships)) {
          setActivationError(true);
          return;
        }
        setActivationConfirmed(true);
        clearPhonePeMerchantOrderId();
        const returnTo = getSafeMembershipReturnTo(getStoredPhonePeReturnTo());
        clearPhonePeReturnTo();
        if (returnTo) void navigate(returnTo, { replace: true });
      } catch {
        setActivationError(true);
      }
    };
    void confirmMembership();
  }, [dispatch, merchantOrderId, navigate, query.data]);

  if (isLegacyReturn && sessionMatches && merchantOrderId) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PHONEPE_RETURN}?${new URLSearchParams({ merchantOrderId }).toString()}`}
      />
    );
  }

  if (!sessionMatches) {
    return (
      <ResultCard>
        <Stack alignItems="center" spacing={2} textAlign="center">
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
          <Typography component="h1" variant="h2">
            Payment session not found
          </Typography>
          <Typography color="text.secondary">
            This payment session is missing, invalid, or no longer belongs to this browser session.
          </Typography>
          <Button component={Link} to={ROUTES.MEMBERSHIP} variant="contained">
            Return to Membership
          </Button>
        </Stack>
      </ResultCard>
    );
  }

  if (query.isFetching && !query.data) {
    return (
      <ResultCard>
        <Stack alignItems="center" aria-label="Checking PhonePe payment" role="status" spacing={2}>
          <CircularProgress />
          <Typography>Checking your payment securely…</Typography>
        </Stack>
      </ResultCard>
    );
  }

  if (query.error && !query.data) {
    const sessionNotFound =
      isPaymentsApiError(query.error) && (query.error.status === 403 || query.error.status === 404);
    return (
      <ResultCard>
        <Stack alignItems="center" spacing={2} textAlign="center">
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
          <Typography component="h1" variant="h2">
            {sessionNotFound ? 'Payment session not found' : 'Payment status unavailable'}
          </Typography>
          <Typography color="text.secondary">
            {sessionNotFound
              ? 'We could not find a payment session associated with this Candidate account.'
              : 'We could not safely confirm your payment. No membership status was assumed.'}
          </Typography>
          {!sessionNotFound ? (
            <Button onClick={() => void requestStatus()} variant="contained">
              Retry
            </Button>
          ) : null}
          <Button component={Link} to={ROUTES.MEMBERSHIP}>
            Return to Membership
          </Button>
        </Stack>
      </ResultCard>
    );
  }

  if (query.data && query.data.merchantOrderId !== merchantOrderId) {
    return (
      <ResultCard>
        <Stack alignItems="center" spacing={2} textAlign="center">
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
          <Typography component="h1" variant="h2">
            Payment session not found
          </Typography>
          <Typography color="text.secondary">
            We could not match this payment to the current browser session.
          </Typography>
          <Button component={Link} to={ROUTES.MEMBERSHIP} variant="contained">
            Return to Membership
          </Button>
        </Stack>
      </ResultCard>
    );
  }

  const status = query.data?.status;
  if (status === PhonePePaymentStatus.Completed) {
    if (!activationConfirmed) {
      return <ResultCard><Stack alignItems="center" aria-live="polite" role="status" spacing={2} textAlign="center"><CircularProgress /><Typography component="h1" variant="h2">Confirming membership activation</Typography>{activationError ? <Alert severity="warning">Payment completed, but active membership could not yet be confirmed. Return to Membership to check again.</Alert> : <Typography color="text.secondary">We are refreshing your authoritative membership status.</Typography>}<Button component={Link} to={ROUTES.MEMBERSHIP}>Return to Membership</Button></Stack></ResultCard>;
    }
    return (
      <ResultCard>
        <Stack alignItems="center" spacing={2} textAlign="center">
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 72 }} />
          <Typography component="h1" variant="h2">
            Membership activated
          </Typography>
          <Typography color="text.secondary">
            Your 30-day Career Harbor membership is active.
          </Typography>
          <Button component={Link} to={ROUTES.INTERVIEW_INSIGHTS} variant="contained">
            Explore Interview Insights
          </Button>
          <Button component={Link} to={ROUTES.DASHBOARD}>
            Go to dashboard
          </Button>
        </Stack>
      </ResultCard>
    );
  }

  if (status === PhonePePaymentStatus.Failed || status === PhonePePaymentStatus.Cancelled) {
    const cancelled = status === PhonePePaymentStatus.Cancelled;
    return (
      <ResultCard>
        <Stack alignItems="center" spacing={2} textAlign="center">
          {cancelled ? (
            <CancelOutlinedIcon color="warning" sx={{ fontSize: 68 }} />
          ) : (
            <ErrorOutlineIcon color="error" sx={{ fontSize: 68 }} />
          )}
          <Typography component="h1" variant="h2">
            {cancelled ? 'Payment cancelled' : 'Payment not completed'}
          </Typography>
          <Typography color="text.secondary">
            {cancelled
              ? 'PhonePe reported that this payment was cancelled. No membership was activated.'
              : 'PhonePe did not complete this payment. No membership was activated.'}
          </Typography>
          <Button component={Link} to={ROUTES.MEMBERSHIP} variant="contained">
            Try again
          </Button>
        </Stack>
      </ResultCard>
    );
  }

  return (
    <ResultCard>
      <Stack alignItems="center" spacing={2} textAlign="center">
        <HourglassTopOutlinedIcon color="warning" sx={{ fontSize: 68 }} />
        <Typography component="h1" variant="h2">
          We are confirming your payment
        </Typography>
        <Typography color="text.secondary">
          Membership remains unchanged until the backend confirms completion.
        </Typography>
        {pollingEnded ? (
          <Alert severity="info">Automatic checking has ended. You can check again safely.</Alert>
        ) : null}
        <Button
          disabled={query.isFetching}
          onClick={() => void requestStatus()}
          variant="contained"
        >
          {query.isFetching ? 'Checking…' : 'Check again'}
        </Button>
        <Button component={Link} to={ROUTES.MEMBERSHIP}>
          Return to Membership
        </Button>
      </Stack>
    </ResultCard>
  );
};
