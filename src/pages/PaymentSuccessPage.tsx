import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Alert, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { dashboardApi, useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { useGetPaymentsQuery } from '@/features/payments/api/paymentsApi';
import { PaymentResult } from '@/features/payments/components/PaymentResult';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import {
  formatPaymentAmount,
  formatPaymentDate,
} from '@/features/payments/utils/paymentFormatting';
import { getSafeJobReturnPath, isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const PaymentSuccessPage = () => {
  useDocumentMetadata(
    'Payment verified | Career Portal',
    'Confirm your verified payment and active application access.',
  );
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const payments = useGetPaymentsQuery({ pageNumber: 1, pageSize: 100 });
  const memberships = useGetMembershipsQuery();
  const dispatch = useAppDispatch();
  const refreshed = useRef(false);

  useEffect(() => {
    if (refreshed.current) return;
    refreshed.current = true;
    dispatch(dashboardApi.util.invalidateTags(['Memberships']));
    void payments.refetch();
    void memberships.refetch();
  }, [dispatch, memberships, payments]);

  if (!isGuid(paymentId)) {
    return (
      <ErrorState
        description="The payment reference is missing or invalid."
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Cannot verify payment"
      />
    );
  }

  if (payments.isLoading || memberships.isLoading) {
    return (
      <Stack aria-label="Verifying successful payment" role="status" spacing={2}>
        <Skeleton height={360} variant="rounded" />
      </Stack>
    );
  }

  if (payments.isError || memberships.isError) {
    return (
      <ErrorState
        description="We could not confirm the payment and access status. No success is shown until both are verified by the backend."
        headingLevel="h1"
        onRetry={() => {
          void payments.refetch();
          void memberships.refetch();
        }}
        title="Verification unavailable"
      />
    );
  }

  const payment = payments.data?.items.find((item) => item.id === paymentId);
  if (!payment) {
    return (
      <ErrorState
        description="This payment was not found in the available account history."
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Payment not found"
      />
    );
  }

  if (payment.status === PaymentStatus.Pending || payment.status === PaymentStatus.Authorized) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_PENDING}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }
  if (payment.status !== PaymentStatus.Paid) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_FAILED}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }

  const membership = memberships.data?.find((item) => item.id === payment.membershipId);
  if (!membership || !isMembershipActive(membership)) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">
          The payment is marked paid, but active access could not yet be confirmed. Refresh before
          applying.
        </Alert>
        <ErrorState
          description="Access must be active in the backend before paid functionality is available."
          headingLevel="h1"
          onRetry={() => void memberships.refetch()}
          title="Access confirmation pending"
        />
      </Stack>
    );
  }

  const paidAt = formatPaymentDate(payment.paidAtUtc);
  return (
    <Stack spacing={2}>
      <PaymentResult
        actions={[
          { label: 'Continue to job', path: returnTo, variant: 'contained' },
          { label: 'Browse jobs', path: ROUTES.JOBS },
        ]}
        description={`The backend verified ${formatPaymentAmount(payment.amount, payment.currencyCode)} and activated ${membership.planName} for ${membership.companyName}.`}
        icon={<CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />}
        reference={payment.id}
        title="Payment verified"
      />
      {paidAt ? (
        <Typography align="center" color="text.secondary" variant="body2">
          Paid {paidAt}
        </Typography>
      ) : null}
    </Stack>
  );
};
