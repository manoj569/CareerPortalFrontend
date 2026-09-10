import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  Grid,
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
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import { ButtonSpinner } from '@/components/feedback/ButtonSpinner';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useGetAIApplyPlansQuery } from '@/features/aiApply/api/aiApplyApi';
import type { MembershipPlan } from '@/features/aiApply/types/aiApplyModels';

const planBenefits = (plan: MembershipPlan): string[] => {
  if (plan.canUseAIApplyPro) return [
    'Everything in AI Apply',
    'Higher processing priority',
    'AI-tailored resume',
    'AI-generated cover letters',
    'Advanced company/job preferences',
    'Application quality scoring',
    'Follow-up tracking',
    'Interview preparation',
  ];
  if (plan.canUseAIApply) return [
    'AI job matching',
    'Automatic form filling',
    'Resume autofill',
    'Verified answer reuse',
    'Missing-information notifications',
    'Application tracking',
    'Daily activity summary',
  ];
  return ['Manual job applications', 'Browse and save jobs', 'Resume-powered recommendations', 'Application tracking', 'Standard candidate features'];
};

const formatPendingAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-IN', { currency, style: 'currency' }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatPlanAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      style: 'currency',
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const formatCreatedTime = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Time unavailable'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const safeCheckoutError = (error: unknown): string => {
  if (isPaymentsApiError(error) && error.status && error.status >= 400 && error.status < 500 && error.message) {
    return error.message;
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
  const plans = useGetAIApplyPlansQuery();
  const [searchParams] = useSearchParams();
  const safeReturnTo = getSafeMembershipReturnTo(searchParams.get('returnTo'));
  const pendingCheckout = useGetPendingMembershipCheckoutQuery();
  const activeMemberships = memberships.data?.filter((membership) => isMembershipActive(membership)) ?? [];
  const [createCheckout, createState] = useCreatePhonePeCheckoutMutation();
  const [cancelPendingCheckout, cancelState] = useCancelPendingMembershipCheckoutMutation();
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const purchaseButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutInFlight = useRef(false);

  const handleCheckout = async (plan: MembershipPlan) => {
    if (checkoutInFlight.current || createState.isLoading || pendingCheckout.data) return;
    checkoutInFlight.current = true;
    setError(null);
    setSelectedPlanCode(plan.planCode);
    try {
      const checkout = await createCheckout({
        planCode: plan.planCode as 'CareerHarborMembership' | 'AIApply' | 'AIApplyPro',
      }).unwrap();
      if (checkout.planCode !== plan.planCode || !beginPhonePeRedirect(checkout)) {
        setError('The secure PhonePe destination could not be verified. Please try again.');
        window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
      } else {
        storePhonePeReturnTo(
          getSafeMembershipReturnTo(checkout.returnTo ?? safeReturnTo ?? null),
        );
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
    } finally {
      checkoutInFlight.current = false;
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
    return <Stack aria-busy="true" aria-label="Loading membership" role="status" spacing={3} sx={{ maxWidth: 1120, width: '100%', mx: 'auto' }}><Typography>Loading membership…</Typography><Skeleton height={100} variant="rounded" /><Grid container spacing={2}>{[0, 1, 2].map((item) => <Grid key={item} size={{ xs: 12, sm: 6, lg: 4 }}><Skeleton height={420} variant="rounded" /></Grid>)}</Grid></Stack>;
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 1120, width: '100%', minWidth: 0, mx: 'auto' }}>
      <Box>
        <Typography color="primary.main" fontWeight={800} variant="overline">
          Simple, secure access
        </Typography>
        <Typography component="h1" variant="h1">
          Career Harbor Membership
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Choose the access level that fits how you want to apply.
        </Typography>
      </Box>

      {error ? (
        <Alert
          action={
            <Button
              color="inherit"
              disabled={createState.isLoading}
              onClick={() => {
                const plan = plans.data?.find((item) => item.planCode === selectedPlanCode);
                if (plan) void handleCheckout(plan);
              }}
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

      {activeMemberships.length ? (
        <Alert
          action={
            <Button color="inherit" component={Link} to={ROUTES.INTERVIEW_INSIGHTS}>
              Explore insights
            </Button>
          }
          severity="success"
        >
          <Typography fontWeight={700}>Your active plans</Typography>
          {activeMemberships.map((membership) => <Typography variant="body2" key={membership.id}>{membership.planName}{membership.endsAtUtc ? ` · Active until ${new Date(membership.endsAtUtc).toLocaleDateString()}` : ' · Active'}</Typography>)}
          <Typography variant="body2" sx={{ mt: 1 }}>You can purchase another plan while your current plan is active.</Typography>
        </Alert>
      ) : null}

      {memberships.isError ? <Alert severity="warning" action={<Button onClick={() => void memberships.refetch()}>Retry</Button>}>Your active plans could not be loaded.</Alert> : null}

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

      {plans.isLoading ? (
        <Grid aria-busy="true" aria-label="Loading membership plans" container role="status" spacing={2}>
          {[0, 1, 2].map((item) => <Grid key={item} size={{ xs: 12, sm: 6, lg: 4 }}><Skeleton height={360} variant="rounded" /></Grid>)}
        </Grid>
      ) : plans.isError ? (
        <Alert action={<Button color="inherit" onClick={() => void plans.refetch()}>Retry</Button>} severity="error">
          Membership plans could not be loaded.
        </Alert>
      ) : plans.data?.length ? (
        <Grid container spacing={2}>
          {[...plans.data].sort((a, b) => Number(a.canUseAIApply) + Number(a.canUseAIApplyPro) - Number(b.canUseAIApply) - Number(b.canUseAIApplyPro)).map((plan) => {
            const isPro = plan.canUseAIApplyPro;
            const isAI = plan.canUseAIApply && !isPro;
            const activePlan = activeMemberships.find((membership) => membership.planName === plan.displayName);
            return (
              <Grid key={plan.planCode} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: isPro ? '#7C3AED' : isAI ? 'primary.main' : 'divider', height: '100%' }}>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flex: 1 }}>
                    <Stack spacing={2} sx={{ width: '100%', minWidth: 0 }}>
                      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" gap={1}>
                        <Typography component="h2" variant="h3">{plan.displayName}</Typography>
                        {isAI ? <Chip color="primary" label="Popular" size="small" /> : isPro ? <Chip label="Best Value" size="small" sx={{ bgcolor: '#EDE9FE', color: '#5B21B6' }} /> : null}
                      </Stack>
                      <Box><Typography fontWeight={900} variant="h2">{formatPlanAmount(plan.price, plan.currency)}</Typography><Typography color="text.secondary">{plan.durationDays} days</Typography></Box>
                      {activePlan ? <Chip color="success" label="Active" size="small" sx={{ alignSelf: 'flex-start' }} variant="outlined" /> : null}
                      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0, flex: 1 }}>
                        {planBenefits(plan).map((benefit) => <Stack component="li" direction="row" key={benefit} spacing={1}><CheckCircleIcon color="primary" fontSize="small" /><Typography variant="body2">{benefit}</Typography></Stack>)}
                      </Stack>
                      {!pendingCheckout.isLoading && !pendingCheckout.isError && !pendingCheckout.data ? (
                        <Stack spacing={0.75} sx={{ mt: 'auto' }}>
                          <Button
                            startIcon={createState.isLoading && selectedPlanCode === plan.planCode ? <ButtonSpinner /> : undefined}
                            fullWidth
                            aria-busy={createState.isLoading && selectedPlanCode === plan.planCode}
                            disabled={createState.isLoading}
                            onClick={(event) => { purchaseButtonRef.current = event.currentTarget; void handleCheckout(plan); }}
                            variant="contained"
                          >
                            {createState.isLoading && selectedPlanCode === plan.planCode
                              ? 'Creating secure checkout…'
                              : `Continue to Pay ${formatPlanAmount(plan.price, plan.currency)}`}
                          </Button>
                          <Typography color="text.secondary" textAlign="center" variant="caption">
                            Secure payment powered by PhonePe
                          </Typography>
                        </Stack>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : null}

      <Button component={Link} sx={{ alignSelf: 'center' }} to={ROUTES.PAYMENTS} variant="text">
        View payment history
      </Button>

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
