import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Skeleton,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import {
  isPaymentsApiError,
  useCancelPendingMembershipCheckoutMutation,
  useCreatePhonePeCheckoutMutation,
  useGetPendingMembershipCheckoutQuery,
} from '@/features/payments/api/paymentsApi';
import {
  beginPhonePeRedirect,
  isSafePhonePeRedirectUrl,
  resumePhonePeRedirect,
  storePhonePeReturnTo,
} from '@/features/payments/services/phonePeCheckout';
import { getSafeMembershipReturnTo } from '@/features/interviewInsights/utils/membershipAccess';
import { findActiveMembership } from '@/features/payments/utils/entitlement';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const benefits = [
  '30 days access',
  'Interview Insights access',
  'Apply to jobs access',
  'No auto-renewal',
];

const formatPendingAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-IN', { currency, style: 'currency' }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatCreatedTime = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Time unavailable'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const safeCheckoutError = (error: unknown): string => {
  if (isPaymentsApiError(error) && error.status === 409) {
    return 'A membership or payment is already in progress. Refresh your membership status before trying again.';
  }
  if (isPaymentsApiError(error) && (error.status === 401 || error.status === 403)) {
    return 'Your signed-in Candidate session is required to create checkout.';
  }
  return 'We could not create a secure PhonePe checkout. No membership was activated. Please try again.';
};

export const PaymentPage = () => {
  useDocumentMetadata(
    'Career Harbor Membership',
    'Purchase a 30-day Career Harbor membership through secure PhonePe checkout.',
  );
  const memberships = useGetMembershipsQuery();
  const [searchParams] = useSearchParams();
  const safeReturnTo = getSafeMembershipReturnTo(searchParams.get('returnTo'));
  const pendingCheckout = useGetPendingMembershipCheckoutQuery();
  const activeMembership = findActiveMembership(memberships.data);
  const [createCheckout, createState] = useCreatePhonePeCheckoutMutation();
  const [cancelPendingCheckout, cancelState] = useCancelPendingMembershipCheckoutMutation();
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const purchaseButtonRef = useRef<HTMLButtonElement>(null);

  const handleCheckout = async () => {
    if (createState.isLoading || activeMembership || pendingCheckout.data) return;
    setError(null);
    try {
      const checkout = await createCheckout().unwrap();
      if (!beginPhonePeRedirect(checkout)) {
        setError('The secure PhonePe destination could not be verified. Please try again.');
        window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
      } else {
        storePhonePeReturnTo(safeReturnTo);
      }
    } catch (checkoutError: unknown) {
      if (
        isPaymentsApiError(checkoutError) &&
        checkoutError.code === 'pending_membership_checkout'
      ) {
        await pendingCheckout.refetch();
        return;
      }
      setError(safeCheckoutError(checkoutError));
      window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
    }
  };

  const handleResume = () => {
    const pending = pendingCheckout.data;
    if (
      !pending?.canResume ||
      pending.provider !== 'PhonePe' ||
      !pending.redirectUrl ||
      !isSafePhonePeRedirectUrl(pending.redirectUrl) ||
      !resumePhonePeRedirect(pending.publicReference, pending.redirectUrl)
    ) {
      setError('The secure PhonePe destination could not be verified. Please try again.');
    } else {
      storePhonePeReturnTo(safeReturnTo);
    }
  };

  const handleCancel = async () => {
    const pending = pendingCheckout.data;
    if (!pending?.canCancel || cancelState.isLoading) return;
    setCancelError(null);
    try {
      await cancelPendingCheckout(pending.publicReference).unwrap();
      setCancelOpen(false);
      await Promise.all([pendingCheckout.refetch(), memberships.refetch()]);
    } catch {
      setCancelError('We could not cancel this pending payment safely. Please try again.');
    }
  };

  if (memberships.isLoading || pendingCheckout.isLoading) {
    return <Stack aria-label="Loading membership" role="status" spacing={3} sx={{ maxWidth: 920, mx: 'auto' }}><Typography sx={{ position: 'absolute', height: 1, overflow: 'hidden', width: 1 }}>Loading…</Typography><Skeleton height={100} variant="rounded" /><Skeleton height={420} variant="rounded" /></Stack>;
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 920, mx: 'auto' }}>
      <Box>
        <Typography color="primary.main" fontWeight={800} variant="overline">
          Simple, secure access
        </Typography>
        <Typography component="h1" variant="h1">
          Career Harbor Membership
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Prepare confidently and apply to opportunities with 30 days of candidate access.
        </Typography>
      </Box>

      {error ? (
        <Alert
          action={
            <Button
              color="inherit"
              disabled={createState.isLoading}
              onClick={() => void handleCheckout()}
            >
              Retry
            </Button>
          }
          aria-live="assertive"
          severity="error"
        >
          {error}
        </Alert>
      ) : null}

      {activeMembership ? (
        <Alert
          action={
            <Button color="inherit" component={Link} to={ROUTES.INTERVIEW_INSIGHTS}>
              Explore insights
            </Button>
          }
          severity="success"
        >
          Your Career Harbor membership is active.
        </Alert>
      ) : null}

      {pendingCheckout.isError ? (
        <Alert
          action={
            <Button color="inherit" onClick={() => void pendingCheckout.refetch()}>
              Retry
            </Button>
          }
          aria-live="assertive"
          severity="error"
        >
          We could not check for an existing membership payment. New checkout is unavailable until
          this check succeeds.
        </Alert>
      ) : null}

      {pendingCheckout.data ? (
        <Card sx={{ border: '1px solid', borderColor: 'warning.light', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2}>
              <Box>
                <Typography component="h2" variant="h2">
                  You have a pending payment
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Complete or cancel this checkout before starting another membership payment.
                </Typography>
              </Box>
              <Divider />
              <Stack spacing={0.75}>
                <Typography>
                  <strong>Provider:</strong> {pendingCheckout.data.provider}
                </Typography>
                <Typography>
                  <strong>Amount:</strong>{' '}
                  {formatPendingAmount(pendingCheckout.data.amount, pendingCheckout.data.currency)}
                </Typography>
                <Typography>
                  <strong>Created:</strong> {formatCreatedTime(pendingCheckout.data.createdAtUtc)}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {pendingCheckout.data.status}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                {pendingCheckout.data.canResume &&
                pendingCheckout.data.provider === 'PhonePe' &&
                pendingCheckout.data.redirectUrl &&
                isSafePhonePeRedirectUrl(pendingCheckout.data.redirectUrl) ? (
                  <Button onClick={handleResume} variant="contained">
                    Resume payment
                  </Button>
                ) : null}
                {pendingCheckout.data.canCancel ? (
                  <Button onClick={() => setCancelOpen(true)} variant="outlined">
                    Cancel pending payment
                  </Button>
                ) : null}
              </Stack>
              {pendingCheckout.data.canCancel ? (
                <Typography color="text.secondary" variant="body2">
                  Cancelling stops this checkout attempt. If a payment was already completed, your
                  membership will be updated after verification.
                </Typography>
              ) : null}
              {cancelError ? (
                <Alert aria-live="assertive" severity="error">
                  {cancelError}
                </Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Card
        sx={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F6F7FF 100%)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: '0 18px 45px rgba(41, 56, 126, 0.12)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={3}>
            <Stack
              alignItems="flex-start"
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Chip color="primary" label="30-day plan" size="small" />
                <Typography component="h2" sx={{ mt: 1.5 }} variant="h2">
                  Career Harbor Membership
                </Typography>
              </Box>
              <Box textAlign={{ xs: 'left', sm: 'right' }}>
                <Typography component="p" fontWeight={900} variant="h1">
                  ₹99
                </Typography>
                <Typography color="text.secondary">INR · one-time payment</Typography>
              </Box>
            </Stack>

            <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {benefits.map((benefit) => (
                <Stack component="li" direction="row" key={benefit} spacing={1.25}>
                  <CheckCircleIcon aria-hidden color="primary" fontSize="small" />
                  <Typography>{benefit}</Typography>
                </Stack>
              ))}
            </Stack>

            <Box sx={{ bgcolor: '#EEF4FF', borderRadius: 2, p: 2 }}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <LockOutlinedIcon aria-hidden color="primary" fontSize="small" />
                <Typography color="text.secondary" variant="body2">
                  You will be redirected to PhonePe to complete payment.
                </Typography>
              </Stack>
            </Box>

            {!pendingCheckout.isLoading && !pendingCheckout.isError && !pendingCheckout.data ? (
              <Stack spacing={0.75}>
                <Button
                  disabled={createState.isLoading || Boolean(activeMembership)}
                  onClick={() => void handleCheckout()}
                  ref={purchaseButtonRef}
                  size="large"
                  variant="contained"
                >
                  {createState.isLoading ? 'Creating secure checkout…' : 'Continue to Pay ₹99'}
                </Button>
                <Typography color="text.secondary" textAlign="center" variant="caption">
                  Secure payment powered by PhonePe
                </Typography>
              </Stack>
            ) : null}
            <Button component={Link} to={ROUTES.PAYMENTS} variant="text">
              View payment history
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography color="text.secondary" textAlign="center" variant="caption">
        No job, interview, recruiter response, or selection is guaranteed.
      </Typography>
      <Dialog
        aria-describedby="cancel-pending-payment-description"
        aria-labelledby="cancel-pending-payment-title"
        onClose={() => !cancelState.isLoading && setCancelOpen(false)}
        open={cancelOpen}
      >
        <DialogTitle id="cancel-pending-payment-title">Cancel this pending payment?</DialogTitle>
        <DialogContent>
          <Typography id="cancel-pending-payment-description">
            This does not refund a completed payment.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={cancelState.isLoading} onClick={() => setCancelOpen(false)}>
            Keep payment
          </Button>
          <Button
            color="error"
            disabled={cancelState.isLoading}
            onClick={() => void handleCancel()}
            variant="contained"
          >
            {cancelState.isLoading ? 'Cancelling…' : 'Cancel payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
