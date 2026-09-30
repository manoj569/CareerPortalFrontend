import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { alpha } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { RecentPaymentActivity } from '@/features/payments/components/RecentPaymentActivity';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
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
  Typography,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ButtonSpinner } from '@/components/feedback/ButtonSpinner';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ROUTES } from '@/constants/routes';
import { useGetAIApplyPlansQuery } from '@/features/aiApply/api/aiApplyApi';
import type { MembershipPlan } from '@/features/aiApply/types/aiApplyModels';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import {
  isPaymentsApiError,
  useCancelPendingMembershipCheckoutMutation,
  useCreatePhonePeCheckoutMutation,
  useGetPendingMembershipCheckoutQuery,
  useLazyGetPhonePeReturnQuery,
  paymentsApi,
} from '@/features/payments/api/paymentsApi';
import {
  beginPhonePeRedirect,
  isSafePhonePeRedirectUrl,
  isValidPhonePeMerchantOrderId,
  resumePhonePeRedirect,
  storePhonePeReturnTo,
} from '@/features/payments/services/phonePeCheckout';
import type {
  PendingMembershipCheckoutResponse,
  PhonePePlanCode,
} from '@/features/payments/types/paymentModels';
import {
  isMembershipActive,
  membershipPlanCode,
  membershipPlanName,
} from '@/features/payments/utils/entitlement';
import { getSafeMembershipReturnTo } from '@/features/interviewInsights/utils/membershipAccess';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';

const JOB_ACCESS_PLAN: PhonePePlanCode = 'CareerHarborMembership';
const REFERRAL_ACCESS_PLAN: PhonePePlanCode = 'ReferralContactAccess';

const PHASE_ONE_PLAN_CODES = [JOB_ACCESS_PLAN, REFERRAL_ACCESS_PLAN] as const;

const isPhaseOnePlan = (planCode: string): planCode is PhonePePlanCode =>
  PHASE_ONE_PLAN_CODES.some((code) => code === planCode);

const formatMoney = (amount: number, currency: string, keepDecimals = false): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      currency,
      maximumFractionDigits: keepDecimals || !Number.isInteger(amount) ? 2 : 0,
      minimumFractionDigits: keepDecimals ? 2 : 0,
      style: 'currency',
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(keepDecimals ? 2 : 0)}`;
  }
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return 'No expiry date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatCreatedTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const planBenefits = (plan: MembershipPlan): string[] => {
  if (plan.planCode === REFERRAL_ACCESS_PLAN) {
    return [
      'Unlock referrer contact details',
      'Connect directly with job referrers',
      'Access approved referral opportunities',
      'Browse referral jobs',
      `${plan.durationDays}-day referral contact access`,
    ];
  }

  return [
    'Manual job applications',
    'Browse and save jobs',
    'Resume-powered recommendations',
    'Application tracking',
    'Standard candidate features',
  ];
};

const planDescription = (planCode: string): string => {
  if (planCode === REFERRAL_ACCESS_PLAN) {
    return 'Connect directly with employees who are sharing approved referral opportunities.';
  }

  return 'Apply to jobs and use the standard Career Harbor candidate experience.';
};

const safeCheckoutError = (error: unknown): string => {
  if (isPaymentsApiError(error) && (error.status === 401 || error.status === 403)) {
    return 'Your signed-in Candidate session is required to create checkout.';
  }

  if (
    isPaymentsApiError(error) &&
    error.status &&
    error.status >= 400 &&
    error.status < 500 &&
    error.message
  ) {
    return error.message;
  }

  return 'We could not create a secure PhonePe checkout. No membership was activated. Please try again.';
};

const PendingPaymentCard = ({
  pending,
  cancelling,
  onCancel,
  onResume,
  onCheck,
}: {
  pending: PendingMembershipCheckoutResponse;
  cancelling: boolean;
  onCancel: () => void;
  onResume: () => void;
  onCheck: () => void;
}) => {
  const [checkStatus, status] = useLazyGetPhonePeReturnQuery();
  const dispatch = useAppDispatch();
  const checkPending = async () => {
    if (pending.provider === 'PhonePe' && isValidPhonePeMerchantOrderId(pending.publicReference)) {
      const result = await checkStatus({ merchantOrderId: pending.publicReference }, false);
      if (result.error) return;
      dispatch(paymentsApi.util.invalidateTags(['Payments', 'PaymentStatus', 'PendingCheckout']));
      dispatch(dashboardApi.util.invalidateTags(['Memberships']));
    }
    onCheck();
  };
  const canResume =
    pending.canResume &&
    pending.provider === 'PhonePe' &&
    Boolean(pending.redirectUrl) &&
    isSafePhonePeRedirectUrl(pending.redirectUrl ?? '');

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'warning.light',
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
      }}
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Stack alignItems="center" direction="row" spacing={1}>
                <AccessTimeOutlinedIcon color="warning" />

                <Typography component="h3" fontWeight={800} variant="subtitle1">
                  Payment in progress
                </Typography>
              </Stack>
            </Box>

            <Chip color="warning" label={pending.status} size="small" variant="outlined" />
          </Stack>

          <Divider />

          <Grid container spacing={1.25}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography color="text.secondary" variant="caption">
                Provider
              </Typography>

              <Typography fontWeight={700} variant="body2">
                {pending.provider}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography color="text.secondary" variant="caption">
                Amount
              </Typography>

              <Typography fontWeight={700} variant="body2">
                {formatMoney(pending.amount, pending.currency, true)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography color="text.secondary" variant="caption">
                Created
              </Typography>

              <Typography fontWeight={700} variant="body2">
                {formatCreatedTime(pending.createdAtUtc)}
              </Typography>
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Button disabled={status.isFetching} onClick={() => void checkPending()} size="small">
              Check status
            </Button>
            {canResume ? (
              <Button onClick={onResume} size="small" variant="contained">
                Resume payment
              </Button>
            ) : null}

            {pending.canCancel ? (
              <Button disabled={cancelling} onClick={onCancel} size="small" variant="outlined">
                Cancel pending payment
              </Button>
            ) : null}
          </Stack>
          {status.isError ? (
            <Alert severity="warning">
              Payment status could not be confirmed. Please try again.
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export const PaymentPage = () => {
  useDocumentMetadata(
    'Membership & Access | Career Harbor',
    'Choose the Career Harbor access plans you need and pay securely through PhonePe.',
  );

  const memberships = useGetMembershipsQuery();
  const plans = useGetAIApplyPlansQuery();

  const [searchParams] = useSearchParams();

  const safeReturnTo = getSafeMembershipReturnTo(searchParams.get('returnTo'));

  const jobPending = useGetPendingMembershipCheckoutQuery(JOB_ACCESS_PLAN);

  const referralPending = useGetPendingMembershipCheckoutQuery(REFERRAL_ACCESS_PLAN);

  const [createCheckout, createState] = useCreatePhonePeCheckoutMutation();

  const [cancelPendingCheckout, cancelState] = useCancelPendingMembershipCheckoutMutation();

  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [pendingToCancel, setPendingToCancel] = useState<PendingMembershipCheckoutResponse | null>(
    null,
  );

  const purchaseButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutInFlight = useRef(false);

  const activeMemberships = useMemo(
    () => memberships.data?.filter((membership) => isMembershipActive(membership)) ?? [],
    [memberships.data],
  );

  const visiblePlans = useMemo(
    () => plans.data?.filter((plan) => isPhaseOnePlan(plan.planCode)) ?? [],
    [plans.data],
  );

  const getPendingQuery = (planCode: string) =>
    planCode === REFERRAL_ACCESS_PLAN ? referralPending : jobPending;

  const findActivePlan = (plan: MembershipPlan) =>
    activeMemberships.find((membership) => membershipPlanCode(membership) === plan.planCode);

  const openCheckout = (plan: MembershipPlan) => {
    const pendingQuery = getPendingQuery(plan.planCode);

    setError(null);

    if (findActivePlan(plan) || pendingQuery.isFetching) return;

    if (pendingQuery.isError) {
      setError(
        'We could not verify whether this plan already has a pending payment. Please retry the payment check first.',
      );
      return;
    }

    if (pendingQuery.data) {
      setError(
        `There is already a ${pendingQuery.data.status.toLowerCase()} payment for this plan. Complete or cancel it before starting another checkout.`,
      );
      return;
    }

    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handleCheckout = async () => {
    const plan = selectedPlan;

    if (
      !plan ||
      !isPhaseOnePlan(plan.planCode) ||
      checkoutInFlight.current ||
      createState.isLoading
    ) {
      return;
    }

    const pendingQuery = getPendingQuery(plan.planCode);

    if (
      findActivePlan(plan) ||
      pendingQuery.isFetching ||
      pendingQuery.data ||
      pendingQuery.isError
    ) {
      setCheckoutOpen(false);
      return;
    }

    checkoutInFlight.current = true;
    setError(null);

    try {
      const checkout = await createCheckout({
        planCode: plan.planCode,
        returnTo: safeReturnTo,
      }).unwrap();

      storePhonePeReturnTo(getSafeMembershipReturnTo(checkout.returnTo ?? safeReturnTo ?? null));

      if (checkout.planCode !== plan.planCode || !beginPhonePeRedirect(checkout)) {
        setError('The secure PhonePe destination could not be verified. Please try again.');

        setCheckoutOpen(false);

        window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());

        return;
      }
    } catch (checkoutError: unknown) {
      if (
        isPaymentsApiError(checkoutError) &&
        checkoutError.code === 'pending_membership_checkout'
      ) {
        await pendingQuery.refetch();
        setCheckoutOpen(false);
        return;
      }

      setError(safeCheckoutError(checkoutError));
      setCheckoutOpen(false);

      window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
    } finally {
      checkoutInFlight.current = false;
    }
  };

  const handleResume = (pending: PendingMembershipCheckoutResponse) => {
    storePhonePeReturnTo(safeReturnTo);
    if (
      !pending.canResume ||
      pending.provider !== 'PhonePe' ||
      !pending.redirectUrl ||
      !isSafePhonePeRedirectUrl(pending.redirectUrl) ||
      !resumePhonePeRedirect(pending.publicReference, pending.redirectUrl)
    ) {
      setError('The secure PhonePe destination could not be verified. Please try again.');

      return;
    }

    storePhonePeReturnTo(safeReturnTo);
  };

  const handleCancel = async () => {
    if (!pendingToCancel?.canCancel || cancelState.isLoading) {
      return;
    }

    setCancelError(null);

    try {
      await cancelPendingCheckout(pendingToCancel.publicReference).unwrap();

      setPendingToCancel(null);

      await Promise.all([jobPending.refetch(), referralPending.refetch(), memberships.refetch()]);
    } catch {
      setCancelError('We could not cancel this pending payment safely. Please try again.');
    }
  };

  if (memberships.isLoading) {
    return <PageLoadingIndicator label="Loading membership" />;
  }

  const selectedPricing = selectedPlan?.pricing;

  return (
   <Stack
  spacing={3}
  sx={{
    minWidth: 0,
    width: '100%',
  }}
>
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
          background: (theme) =>
            `linear-gradient(115deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.primary.main, 0.15)})`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 3 }}>
          <WorkspacePremiumOutlinedIcon
            color="primary"
            sx={{ fontSize: { xs: 44, sm: 64 }, flexShrink: 0, color: 'primary.main' }}
          />
          <Box sx={{ maxWidth: 700 }}>
            <Typography component="h1" variant="h1">
              Membership &amp; Access
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25 }}>
              Choose the access you need. Plans are independent, so you can activate more than one.
            </Typography>
          </Box>
        </Stack>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            border: '35px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.04),
            right: -90,
            top: -100,
            pointerEvents: 'none',
          }}
        />
      </Box>

      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      <Stack component="section" spacing={1.5}>
        <Box>
          <Typography component="h2" variant="h3">
            Your Active Access
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Here are your currently active memberships and what you can do with them.
          </Typography>
        </Box>
        {memberships.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void memberships.refetch()}>Retry</Button>}
          >
            Active access could not be loaded.
          </Alert>
        ) : activeMemberships.length ? (
          <Grid container spacing={2}>
            {activeMemberships.map((membership) => {
              const code = membershipPlanCode(membership);
              const referral = code === REFERRAL_ACCESS_PLAN;
              const knownPlan = referral || code === JOB_ACCESS_PLAN;
              return (
                <Grid
                  key={membership.id}
                  size={{ xs: 12, lg: activeMemberships.length === 1 ? 12 : 6 }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(23, 32, 51, 0.04)',
                    }}
                  >
                    <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ sm: 'center' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          {referral ? (
                            <GroupsOutlinedIcon fontSize="large" />
                          ) : (
                            <WorkOutlineOutlinedIcon fontSize="large" />
                          )}
                        </Box>
                        <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                            alignItems="center"
                          >
                            <Typography fontWeight={700}>
                              {membershipPlanName(membership)}
                            </Typography>
                            <Chip color="success" label="Active" size="small" />
                          </Stack>
                          {knownPlan ? (
                            <Typography variant="body2" color="text.secondary">
                              {planDescription(code)}
                            </Typography>
                          ) : null}
                          <Typography variant="caption" color="text.secondary">
                            From {formatDate(membership.startsAtUtc)} ·{' '}
                            {membership.endsAtUtc
                              ? `Valid until ${formatDate(membership.endsAtUtc)}`
                              : 'No expiry date'}
                          </Typography>
                        </Stack>
                        {knownPlan ? (
                          <Button
                            component={Link}
                            to={
                              referral
                                ? `${ROUTES.DASHBOARD_JOBS}?mode=referral`
                                : ROUTES.DASHBOARD_JOBS
                            }
                            variant={referral ? 'outlined' : 'contained'}
                            sx={{ flexShrink: 0 }}
                          >
                            {referral ? 'Browse Referral Jobs' : 'Browse Jobs'}
                          </Button>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700}>No active access plans yet</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Choose the plan that fits your next step. Each plan unlocks its own benefits.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Stack component="section" spacing={1.75}>
        <Box>
          <Typography component="h2" variant="h3">
            Available Plans
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Activate a plan to unlock more opportunities. Each plan gives you different access and
            benefits.
          </Typography>
        </Box>
        {plans.isLoading ? (
          <PageLoadingIndicator label="Loading plans" />
        ) : plans.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void plans.refetch()}>Retry</Button>}
          >
            Membership plans could not be loaded.
          </Alert>
        ) : visiblePlans.length ? (
          <Grid container spacing={2}>
            {[...visiblePlans]
              .sort(
                (a, b) =>
                  PHASE_ONE_PLAN_CODES.indexOf(a.planCode as typeof JOB_ACCESS_PLAN) -
                  PHASE_ONE_PLAN_CODES.indexOf(b.planCode as typeof JOB_ACCESS_PLAN),
              )
              .map((plan) => {
                const referral = plan.planCode === REFERRAL_ACCESS_PLAN;
                const pricing = plan.pricing;
                const activePlan = findActivePlan(plan);
                const pendingQuery = getPendingQuery(plan.planCode);
                const pending = pendingQuery.data;
                const name = membershipPlanName({
                  planCode: plan.planCode,
                  planName: plan.displayName,
                });
                return (
                  <Grid key={plan.planCode} size={{ xs: 12, lg: 6 }}>
                    <Card
                      component="article"
                      aria-label={name}
                      variant="outlined"
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        borderColor:
                          searchParams.get('plan') === plan.planCode ? 'primary.main' : 'divider',
                        bgcolor: (theme) =>
                          alpha(
                            referral ? theme.palette.secondary.main : theme.palette.primary.main,
                            0.045,
                          ),
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'minmax(0, 1fr)',
                              sm: 'minmax(0, 1fr) minmax(170px, 0.55fr)',
                            },
                            gap: 2.5,
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box
                                sx={{
                                  display: 'flex',
                                  p: 1.25,
                                  borderRadius: 2,
                                  bgcolor: 'action.hover',
                                  color: 'primary.main',
                                }}
                              >
                                {referral ? (
                                  <GroupsOutlinedIcon fontSize="large" />
                                ) : (
                                  <WorkOutlineOutlinedIcon fontSize="large" />
                                )}
                              </Box>
                              <Box>
                                <Typography component="h3" variant="h6" fontWeight={800}>
                                  {name}
                                </Typography>
                                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                                  {planDescription(plan.planCode)}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack
                              component="ul"
                              spacing={1}
                              sx={{ listStyle: 'none', m: 0, p: 0 }}
                            >
                              {planBenefits(plan).map((benefit) => (
                                <Stack component="li" direction="row" spacing={1} key={benefit}>
                                  <CheckCircleIcon
                                    color="primary"
                                    sx={{ fontSize: 18, mt: 0.25 }}
                                  />
                                  <Typography variant="body2">{benefit}</Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Stack>
                          <Stack
                            spacing={1.25}
                            justifyContent="center"
                            textAlign="center"
                            sx={{
                              borderLeft: { sm: '1px solid' },
                              borderTop: { xs: '1px solid', sm: 'none' },
                              borderColor: { xs: 'divider', sm: 'divider' },
                              pl: { sm: 2 },
                              pt: { xs: 2, sm: 0 },
                              minWidth: 0,
                            }}
                          >
                            <Typography variant="h3" fontWeight={800}>
                              {formatMoney(pricing?.baseAmount ?? plan.price, plan.currency, true)}
                            </Typography>
                            {pricing ? (
                              <>
                                <Typography variant="caption" color="text.secondary">
                                  + {formatMoney(pricing.taxAmount, plan.currency, true)} GST (
                                  {pricing.taxRate}%)
                                </Typography>
                                <Divider />
                                <Typography variant="h3" fontWeight={800}>
                                  {formatMoney(pricing.totalAmount, plan.currency, true)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Total payable
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Final payable amount will be confirmed securely before payment.
                              </Typography>
                            )}
                            <Typography variant="body2">{plan.durationDays} days access</Typography>
                            {activePlan ? (
                              <Chip
                                icon={<CheckCircleOutlineIcon />}
                                color="success"
                                label="Already active"
                              />
                            ) : !pending && !pendingQuery.isError ? (
                              <Button
                                fullWidth
                                disabled={
                                  memberships.isError ||
                                  createState.isLoading ||
                                  pendingQuery.isFetching ||
                                  pendingQuery.isLoading
                                }
                                onClick={(event) => {
                                  purchaseButtonRef.current = event.currentTarget;
                                  openCheckout(plan);
                                }}
                                variant="contained"
                              >
                                {referral ? 'Get Referral Contact Access' : 'Get Access'}
                              </Button>
                            ) : null}
                            <Stack direction="row" justifyContent="center" spacing={0.5}>
                              <LockOutlinedIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                Secure payment powered by PhonePe
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                        {pendingQuery.isError ? (
                          <Alert
                            sx={{ mt: 2 }}
                            severity="warning"
                            action={
                              <Button onClick={() => void pendingQuery.refetch()}>Retry</Button>
                            }
                          >
                            Payment status could not be checked.
                          </Alert>
                        ) : null}
                        {pending ? (
                          <Box sx={{ mt: 2 }}>
                            <PendingPaymentCard
                              pending={pending}
                              cancelling={
                                cancelState.isLoading &&
                                pendingToCancel?.publicReference === pending.publicReference
                              }
                              onResume={() => handleResume(pending)}
                              onCheck={() => void pendingQuery.refetch()}
                              onCancel={() => {
                                setCancelError(null);
                                setPendingToCancel(pending);
                              }}
                            />
                          </Box>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        ) : (
          <Alert severity="info">Membership plans are currently unavailable.</Alert>
        )}
      </Stack>
      <RecentPaymentActivity
        canRetry={(planCode) => {
          const plan = visiblePlans.find((entry) => entry.planCode === planCode);
          const pending = getPendingQuery(planCode);
          return Boolean(
            plan &&
            !findActivePlan(plan) &&
            !memberships.isError &&
            !createState.isLoading &&
            !pending.isLoading &&
            !pending.isFetching &&
            !pending.isError &&
            !pending.data,
          );
        }}
        onRetry={(planCode) => {
          const plan = visiblePlans.find((entry) => entry.planCode === planCode);
          if (plan) openCheckout(plan);
        }}
      />

      <Typography color="text.secondary" textAlign="center" variant="caption">
        No job, interview, recruiter response, referral, or selection is guaranteed.
      </Typography>

      {/* Checkout confirmation */}
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => !createState.isLoading && setCheckoutOpen(false)}
        open={checkoutOpen}
      >
        <DialogTitle>Confirm your access plan</DialogTitle>

        <DialogContent>
          {selectedPlan ? (
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Box>
                <Typography fontWeight={800} variant="h6">
                  {membershipPlanName({
                    planCode: selectedPlan.planCode,
                    planName: selectedPlan.displayName,
                  })}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                  {selectedPlan.durationDays} days of access
                </Typography>
              </Box>

              <Divider />

              {selectedPricing ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Plan price</Typography>

                    <Typography fontWeight={600}>
                      {formatMoney(selectedPricing.baseAmount, selectedPlan.currency, true)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">GST ({selectedPricing.taxRate}%)</Typography>

                    <Typography fontWeight={600}>
                      {formatMoney(selectedPricing.taxAmount, selectedPlan.currency, true)}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={800}>Total payable</Typography>

                    <Typography color="primary.main" fontWeight={900} variant="h6">
                      {formatMoney(selectedPricing.totalAmount, selectedPlan.currency, true)}
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">
                  The final payable amount will be confirmed by the server when secure checkout is
                  created.
                </Alert>
              )}

              <Alert icon={<LockOutlinedIcon />} severity="info">
                You will continue to PhonePe to complete the payment securely. Access is activated
                only after the backend verifies successful payment.
              </Alert>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={createState.isLoading} onClick={() => setCheckoutOpen(false)}>
            Cancel
          </Button>

          <Button
            startIcon={createState.isLoading ? <ButtonSpinner /> : undefined}
            aria-busy={createState.isLoading}
            disabled={createState.isLoading}
            onClick={() => void handleCheckout()}
            variant="contained"
          >
            {createState.isLoading
              ? 'Creating secure checkout…'
              : selectedPricing
                ? `Pay ${formatMoney(
                    selectedPricing.totalAmount,
                    selectedPlan?.currency ?? 'INR',
                    true,
                  )}`
                : 'Continue to PhonePe'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel pending checkout */}
      <Dialog
        aria-describedby="cancel-pending-payment-description"
        aria-labelledby="cancel-pending-payment-title"
        onClose={() => !cancelState.isLoading && setPendingToCancel(null)}
        open={Boolean(pendingToCancel)}
      >
        <DialogTitle id="cancel-pending-payment-title">Cancel this pending payment?</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography id="cancel-pending-payment-description">
              This stops this checkout attempt. It does not refund a payment that PhonePe has
              already completed.
            </Typography>

            {pendingToCancel ? (
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography color="text.secondary" variant="caption">
                  Payment amount
                </Typography>

                <Typography fontWeight={800}>
                  {formatMoney(pendingToCancel.amount, pendingToCancel.currency, true)}
                </Typography>
              </Box>
            ) : null}

            {cancelError ? (
              <Alert aria-live="assertive" severity="error">
                {cancelError}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button disabled={cancelState.isLoading} onClick={() => setPendingToCancel(null)}>
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
