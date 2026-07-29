import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Button, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import {
  isPaymentsApiError,
  useConfirmRazorpayPaymentMutation,
  useCreateRazorpayOrderMutation,
  useGetPaymentStatusQuery,
  useReconcileRazorpayPaymentMutation,
} from '@/features/payments/api/paymentsApi';
import { ApplicationAccessPlanCard } from '@/features/payments/components/ApplicationAccessPlanCard';
import { PaymentProcessingOverlay } from '@/features/payments/components/PaymentProcessingOverlay';
import { SecurePaymentNotice } from '@/features/payments/components/SecurePaymentNotice';
import { openRazorpayCheckout } from '@/features/payments/services/razorpayCheckout';
import { PaymentStatus, type PaymentOrder } from '@/features/payments/types/paymentModels';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import {
  buildPaymentStatusPath,
  getSafeJobReturnPath,
  isGuid,
} from '@/features/payments/utils/paymentReturnUrl';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const isPendingPayment = (status: PaymentStatus): boolean =>
  status === PaymentStatus.Created ||
  status === PaymentStatus.Pending ||
  status === PaymentStatus.Authorized;

const getSafePaymentError = (error: unknown): string => {
  if (isPaymentsApiError(error)) {
    if (error.status === 409) {
      return 'An active membership or pending payment already exists. Refresh the current status before trying again.';
    }
    if (error.status === 401 || error.status === 403) {
      return 'Your verified Candidate session is required to create this payment.';
    }
  }
  return 'We could not prepare Test Mode checkout. No membership was activated. Please try again.';
};

export const PaymentPage = () => {
  useDocumentMetadata(
    'Candidate membership | Career Portal',
    'Purchase a server-verified 30-day Candidate membership through Razorpay Test Mode.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const purchaseButtonRef = useRef<HTMLButtonElement>(null);
  const attemptInProgress = useRef(false);
  const [order, setOrder] = useState<PaymentOrder>();
  const [pageError, setPageError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const trackedPaymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const statusQuery = useGetPaymentStatusQuery();
  const [createOrder, createOrderState] = useCreateRazorpayOrderMutation();
  const [confirmPayment, confirmState] = useConfirmRazorpayPaymentMutation();
  const [reconcilePayment, reconcileState] = useReconcileRazorpayPaymentMutation();
  const membership = statusQuery.data?.membership ?? undefined;
  const activeMembership = membership && isMembershipActive(membership) ? membership : undefined;
  const latestPayment = statusQuery.data?.latestPayment;
  const pendingPayment =
    latestPayment && isPendingPayment(latestPayment.status) ? latestPayment : undefined;
  const isProcessing =
    createOrderState.isLoading ||
    confirmState.isLoading ||
    reconcileState.isLoading ||
    isVerifying ||
    attemptInProgress.current;
  const retryPath = `${location.pathname}${location.search}`;

  const finishAttempt = () => {
    attemptInProgress.current = false;
    setIsVerifying(false);
  };

  const navigateToResult = (
    route: string,
    options: { paymentId?: string; reason?: string } = {},
  ) => {
    void navigate(
      buildPaymentStatusPath(route, {
        paymentId: options.paymentId,
        reason: options.reason,
        retryPath,
        returnTo,
      }),
    );
  };

  const handlePurchase = async () => {
    if (attemptInProgress.current || activeMembership || pendingPayment) return;
    attemptInProgress.current = true;
    setPageError(null);
    setStatusMessage(null);

    try {
      const createdOrder = await createOrder().unwrap();
      setOrder(createdOrder);
      const trackedParams = new URLSearchParams(searchParams);
      trackedParams.set('paymentId', createdOrder.paymentId);
      setSearchParams(trackedParams, { replace: true });

      const result = await openRazorpayCheckout({
        email: user?.email,
        name: user ? `${user.firstName} ${user.lastName}`.trim() : undefined,
        order: createdOrder,
      });

      if (result.type !== 'success') {
        finishAttempt();
        navigateToResult(ROUTES.PAYMENT_FAILED, {
          paymentId: createdOrder.paymentId,
          reason: result.type,
        });
        return;
      }

      setIsVerifying(true);
      try {
        const verifiedPayment = await confirmPayment({
          paymentId: createdOrder.paymentId,
          request: {
            razorpayOrderId: result.response.razorpay_order_id,
            razorpayPaymentId: result.response.razorpay_payment_id,
            razorpaySignature: result.response.razorpay_signature,
          },
        }).unwrap();
        const refreshedStatus = await statusQuery.refetch().unwrap();
        const membershipIsActive =
          refreshedStatus.membership !== null && isMembershipActive(refreshedStatus.membership);
        const backendConfirmed =
          verifiedPayment.status === PaymentStatus.Paid &&
          refreshedStatus.latestPayment?.id === verifiedPayment.id &&
          refreshedStatus.latestPayment.status === PaymentStatus.Paid &&
          membershipIsActive;
        finishAttempt();
        navigateToResult(backendConfirmed ? ROUTES.PAYMENT_SUCCESS : ROUTES.PAYMENT_PENDING, {
          paymentId: verifiedPayment.id,
        });
      } catch (verificationError: unknown) {
        finishAttempt();
        const isNetworkUncertain =
          !isPaymentsApiError(verificationError) || verificationError.status === undefined;
        navigateToResult(isNetworkUncertain ? ROUTES.PAYMENT_PENDING : ROUTES.PAYMENT_FAILED, {
          paymentId: createdOrder.paymentId,
          reason: isNetworkUncertain ? undefined : 'verification',
        });
      }
    } catch (error: unknown) {
      finishAttempt();
      setPageError(getSafePaymentError(error));
      void statusQuery.refetch();
      window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
    }
  };

  const handleReconcile = async () => {
    if (!pendingPayment || reconcileState.isLoading) return;
    setPageError(null);
    setStatusMessage(null);
    try {
      const reconciled = await reconcilePayment(pendingPayment.id).unwrap();
      const refreshed = await statusQuery.refetch().unwrap();
      if (
        reconciled.status === PaymentStatus.Paid &&
        refreshed.membership &&
        isMembershipActive(refreshed.membership)
      ) {
        navigateToResult(ROUTES.PAYMENT_SUCCESS, { paymentId: reconciled.id });
        return;
      }
      if (!isPendingPayment(reconciled.status)) {
        navigateToResult(ROUTES.PAYMENT_FAILED, {
          paymentId: reconciled.id,
          reason: 'reconciliation',
        });
        return;
      }
      setStatusMessage('Razorpay still reports this Test Mode payment as pending.');
    } catch {
      setPageError('We could not reconcile this payment. Its backend status was not changed.');
    }
  };

  if (statusQuery.isLoading) {
    return (
      <Stack aria-label="Loading membership plan" role="status" spacing={3}>
        <Skeleton height={64} width="65%" />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton height={420} variant="rounded" />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton height={220} variant="rounded" />
          </Grid>
        </Grid>
      </Stack>
    );
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <ErrorState
        description="We could not verify your current membership and latest payment. Checkout is unavailable until this succeeds."
        headingLevel="h1"
        onRetry={() => void statusQuery.refetch()}
        title="Membership status unavailable"
      />
    );
  }

  if (
    isGuid(trackedPaymentId) &&
    !order &&
    latestPayment?.id === trackedPaymentId &&
    isPendingPayment(latestPayment.status)
  ) {
    return (
      <Navigate
        replace
        to={buildPaymentStatusPath(ROUTES.PAYMENT_PENDING, {
          paymentId: trackedPaymentId,
          returnTo,
        })}
      />
    );
  }

  return (
    <>
      <Stack spacing={4}>
        <Button
          component={Link}
          startIcon={<ArrowBackIcon />}
          sx={{ alignSelf: 'flex-start' }}
          to={returnTo}
        >
          Back to job
        </Button>
        <Stack spacing={1}>
          <Typography color="primary.main" fontWeight={700} variant="overline">
            Secure Test Mode checkout
          </Typography>
          <Typography component="h1" variant="h1">
            Candidate membership
          </Typography>
          <Typography color="text.secondary" maxWidth={720}>
            Purchase 30 days of portal-wide application access for ₹99 INR. The backend owns the
            plan price, creates the Razorpay order, verifies the payment, and activates membership.
          </Typography>
        </Stack>

        {pageError ? (
          <Alert aria-live="assertive" severity="error">
            {pageError}
          </Alert>
        ) : null}
        {statusMessage ? (
          <Alert aria-live="polite" severity="info">
            {statusMessage}
          </Alert>
        ) : null}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <ApplicationAccessPlanCard
              activeMembership={activeMembership}
              isProcessing={isProcessing}
              onPurchase={() => void handlePurchase()}
              order={order}
              purchaseBlocked={Boolean(pendingPayment)}
              purchaseButtonRef={purchaseButtonRef}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <SecurePaymentNotice />
              {pendingPayment ? (
                <Alert
                  action={
                    <Button
                      color="inherit"
                      disabled={reconcileState.isLoading}
                      onClick={() => void handleReconcile()}
                      size="small"
                    >
                      {reconcileState.isLoading ? 'Checking…' : 'Reconcile'}
                    </Button>
                  }
                  severity="warning"
                >
                  Payment {pendingPayment.id} is pending. Reconcile it before creating another
                  order.
                </Alert>
              ) : null}
              <Alert severity="info">
                Use Razorpay Test Mode payment details only. Career Portal never receives or stores
                card, bank, or UPI credentials.
              </Alert>
              <Button component={Link} to={ROUTES.PAYMENTS} variant="outlined">
                View payment history
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <PaymentProcessingOverlay open={isVerifying || confirmState.isLoading} />
    </>
  );
};
