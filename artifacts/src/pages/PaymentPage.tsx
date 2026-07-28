import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Button, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { dashboardApi, useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { useGetJobDetailsQuery } from '@/features/jobs/api/jobsApi';
import {
  isPaymentsApiError,
  useConfirmRazorpayPaymentMutation,
  useCreateRazorpayOrderMutation,
} from '@/features/payments/api/paymentsApi';
import { ApplicationAccessPlanCard } from '@/features/payments/components/ApplicationAccessPlanCard';
import { PaymentProcessingOverlay } from '@/features/payments/components/PaymentProcessingOverlay';
import { SecurePaymentNotice } from '@/features/payments/components/SecurePaymentNotice';
import { openRazorpayCheckout } from '@/features/payments/services/razorpayCheckout';
import { PaymentStatus, type PaymentOrder } from '@/features/payments/types/paymentModels';
import { findActiveCompanyMembership } from '@/features/payments/utils/entitlement';
import {
  buildPaymentStatusPath,
  getJobSlugFromReturnPath,
  getSafeJobReturnPath,
  isGuid,
} from '@/features/payments/utils/paymentReturnUrl';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const getSafePaymentError = (error: unknown): string => {
  if (isPaymentsApiError(error)) {
    if (error.status === 409) {
      return 'An active access plan or an existing payment prevents a new order. Refresh your access status and try again.';
    }
    if (error.status === 404) return 'This job is no longer available for payment.';
    if (error.status === 401 || error.status === 403) {
      return 'Your session cannot create this payment. Please sign in again.';
    }
  }
  return 'We could not prepare secure checkout. No payment was completed. Please try again.';
};

export const PaymentPage = () => {
  useDocumentMetadata(
    'Purchase application access | Career Portal',
    'Purchase server-verified company application access through secure Razorpay checkout.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const purchaseButtonRef = useRef<HTMLButtonElement>(null);
  const attemptInProgress = useRef(false);
  const [order, setOrder] = useState<PaymentOrder>();
  const [pageError, setPageError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const jobId = searchParams.get('jobId');
  const trackedPaymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const jobSlug = getJobSlugFromReturnPath(returnTo);
  const hasValidContext = isGuid(jobId) && Boolean(jobSlug);
  const jobQuery = useGetJobDetailsQuery(jobSlug ?? '', { skip: !hasValidContext });
  const membershipsQuery = useGetMembershipsQuery();
  const [createOrder, createOrderState] = useCreateRazorpayOrderMutation();
  const [confirmPayment, confirmState] = useConfirmRazorpayPaymentMutation();
  const activeMembership = findActiveCompanyMembership(
    membershipsQuery.data,
    jobQuery.data?.companyId,
  );
  const isProcessing =
    createOrderState.isLoading ||
    confirmState.isLoading ||
    isVerifying ||
    attemptInProgress.current;
  const retryPath = `${location.pathname}${location.search}`;

  const restoreFocus = () => {
    window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
  };

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
    if (attemptInProgress.current || !isGuid(jobId) || !jobQuery.data || activeMembership) return;
    attemptInProgress.current = true;
    setPageError(null);

    let createdOrder: PaymentOrder | undefined;
    try {
      createdOrder = await createOrder({ jobId }).unwrap();
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

        dispatch(dashboardApi.util.invalidateTags(['Memberships']));
        void membershipsQuery.refetch();
        finishAttempt();
        navigateToResult(
          verifiedPayment.status === PaymentStatus.Paid
            ? ROUTES.PAYMENT_SUCCESS
            : ROUTES.PAYMENT_PENDING,
          { paymentId: verifiedPayment.id },
        );
      } catch (verificationError) {
        finishAttempt();
        const isNetworkUncertain =
          !isPaymentsApiError(verificationError) || verificationError.status === undefined;
        navigateToResult(isNetworkUncertain ? ROUTES.PAYMENT_PENDING : ROUTES.PAYMENT_FAILED, {
          paymentId: createdOrder.paymentId,
          reason: isNetworkUncertain ? undefined : 'verification',
        });
      }
    } catch (error) {
      finishAttempt();
      setPageError(getSafePaymentError(error));
      void membershipsQuery.refetch();
      restoreFocus();
    }
  };

  const retryData = () => {
    setPageError(null);
    void jobQuery.refetch();
    void membershipsQuery.refetch();
  };

  if (!hasValidContext) {
    return (
      <ErrorState
        description="Payment must be started from an available job so the backend can identify the correct company access plan."
        headingLevel="h1"
        onRetry={() => void navigate(ROUTES.JOBS)}
        title="Choose a job first"
      />
    );
  }

  if (isGuid(trackedPaymentId) && !order) {
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

  if (jobQuery.isLoading || membershipsQuery.isLoading) {
    return (
      <Stack aria-label="Loading payment plan" role="status" spacing={3}>
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

  if (jobQuery.isError || membershipsQuery.isError || !jobQuery.data) {
    return (
      <ErrorState
        description="We could not verify the job and your current access. Payment is unavailable until both checks succeed."
        headingLevel="h1"
        onRetry={retryData}
        title="Access details unavailable"
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
            Secure checkout
          </Typography>
          <Typography component="h1" variant="h1">
            Application access for {jobQuery.data.companyName}
          </Typography>
          <Typography color="text.secondary" maxWidth={720}>
            Access is company-specific and remains subject to the membership term returned by the
            backend. The current API does not expose a read-only plan or price before order
            creation.
          </Typography>
        </Stack>

        {pageError ? (
          <Alert
            action={
              <Button color="inherit" onClick={() => void handlePurchase()} size="small">
                Try again
              </Button>
            }
            aria-live="assertive"
            severity="error"
          >
            {pageError}
          </Alert>
        ) : null}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <ApplicationAccessPlanCard
              activeMembership={activeMembership}
              companyName={jobQuery.data.companyName}
              isProcessing={isProcessing}
              onPurchase={() => void handlePurchase()}
              order={order}
              purchaseButtonRef={purchaseButtonRef}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <SecurePaymentNotice />
              <Alert severity="warning">
                Creating a payment order starts a pending transaction. Avoid opening multiple
                checkout windows; the backend does not currently support idempotency keys.
              </Alert>
              {activeMembership ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button component={Link} to={returnTo} variant="contained">
                    Continue to job
                  </Button>
                  <Button component={Link} to={ROUTES.PAYMENTS} variant="outlined">
                    Payment history
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <PaymentProcessingOverlay open={isVerifying || confirmState.isLoading} />
    </>
  );
};
