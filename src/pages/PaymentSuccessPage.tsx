import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Alert, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { useGetPaymentStatusQuery } from '@/features/payments/api/paymentsApi';
import { PaymentResult } from '@/features/payments/components/PaymentResult';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import {
  formatPaymentAmount,
  formatPaymentDate,
} from '@/features/payments/utils/paymentFormatting';
import { getSafeJobReturnPath, isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const PaymentSuccessPage = () => {
  useDocumentMetadata(
    'Payment verified | Career Portal',
    'Confirm your backend-verified payment and active Candidate membership.',
  );
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const status = useGetPaymentStatusQuery();
  const refreshed = useRef(false);

  useEffect(() => {
    if (refreshed.current) return;
    refreshed.current = true;
    void status.refetch();
  }, [status]);

  if (!isGuid(paymentId)) {
    return (
      <ErrorState
        description="The payment reference is missing or invalid."
        headingLevel="h1"
        onRetry={() => void status.refetch()}
        title="Cannot verify payment"
      />
    );
  }

  if (status.isLoading || status.isFetching) {
    return <PageLoadingIndicator label="Verifying successful payment" />;
  }

  if (status.isError || !status.data) {
    return (
      <ErrorState
        description="We could not confirm both the payment and active membership. Success is never shown from the checkout callback alone."
        headingLevel="h1"
        onRetry={() => void status.refetch()}
        title="Verification unavailable"
      />
    );
  }

  const payment =
    status.data.latestPayment?.id === paymentId ? status.data.latestPayment : undefined;
  if (!payment) {
    return (
      <ErrorState
        description="This payment is not the latest payment associated with your Candidate account."
        headingLevel="h1"
        onRetry={() => void status.refetch()}
        title="Payment not found"
      />
    );
  }

  if (
    payment.status === PaymentStatus.Pending ||
    payment.status === PaymentStatus.Authorized ||
    payment.status === PaymentStatus.Created
  ) {
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

  const membership = status.data.membership;
  if (!membership || !isMembershipActive(membership)) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">
          The payment is marked paid, but the backend has not returned an active membership.
        </Alert>
        <ErrorState
          description="Membership must be active in the backend before application access is available."
          headingLevel="h1"
          onRetry={() => void status.refetch()}
          title="Membership activation pending"
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <PaymentResult
        actions={[
          { label: 'Continue application', path: returnTo, variant: 'contained' },
          { label: 'Payment history', path: ROUTES.PAYMENTS },
        ]}
        description={`The backend verified ${formatPaymentAmount(payment.amount, payment.currencyCode)} and activated ${membership.planName} through ${formatPaymentDate(membership.endsAtUtc) ?? 'the configured expiry date'}.`}
        icon={<CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />}
        reference={payment.id}
        title="Payment verified"
      />
      {payment.paidAtUtc ? (
        <Typography align="center" color="text.secondary" variant="body2">
          Paid {formatPaymentDate(payment.paidAtUtc)}
        </Typography>
      ) : null}
    </Stack>
  );
};
