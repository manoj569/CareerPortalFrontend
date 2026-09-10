import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { Alert, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import {
  useGetPaymentStatusQuery,
  useReconcileRazorpayPaymentMutation,
} from '@/features/payments/api/paymentsApi';
import { PaymentResult } from '@/features/payments/components/PaymentResult';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import { getSafeJobReturnPath, isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const isPendingPayment = (status: PaymentStatus): boolean =>
  status === PaymentStatus.Created ||
  status === PaymentStatus.Pending ||
  status === PaymentStatus.Authorized;

export const PaymentPendingPage = () => {
  useDocumentMetadata(
    'Payment pending | Career Portal',
    'Safely reconcile a pending Razorpay Test Mode payment with the backend.',
  );
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const status = useGetPaymentStatusQuery();
  const [reconcile, reconcileState] = useReconcileRazorpayPaymentMutation();
  const [reconcileError, setReconcileError] = useState<string | null>(null);
  const [reconciledPending, setReconciledPending] = useState(false);

  if (!isGuid(paymentId)) {
    return (
      <ErrorState
        description="The payment reference is missing or invalid."
        headingLevel="h1"
        onRetry={() => void status.refetch()}
        title="Cannot check payment"
      />
    );
  }

  if (status.isLoading) {
    return <PageLoadingIndicator label="Checking payment status" />;
  }
  if (status.isError || !status.data) {
    return (
      <ErrorState
        description="Payment status is temporarily unavailable. Checking again will not create a new payment."
        headingLevel="h1"
        onRetry={() => void status.refetch()}
        title="Status unavailable"
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
        title="Payment not available"
      />
    );
  }

  if (
    payment.status === PaymentStatus.Paid &&
    status.data.membership &&
    isMembershipActive(status.data.membership)
  ) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_SUCCESS}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }
  if (!isPendingPayment(payment.status)) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_FAILED}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }

  const handleReconcile = async () => {
    setReconcileError(null);
    setReconciledPending(false);
    try {
      const result = await reconcile(paymentId).unwrap();
      await status.refetch();
      if (isPendingPayment(result.status)) setReconciledPending(true);
    } catch {
      setReconcileError(
        'We could not reconcile this payment. Its backend status remains unchanged.',
      );
    }
  };

  return (
    <Stack spacing={2}>
      {reconcileError ? (
        <Alert aria-live="assertive" severity="error">
          {reconcileError}
        </Alert>
      ) : null}
      {reconciledPending ? (
        <Alert aria-live="polite" severity="info">
          Razorpay still reports this Test Mode order as pending.
        </Alert>
      ) : null}
      <PaymentResult
        actions={[
          { label: 'Membership page', path: ROUTES.MEMBERSHIP, variant: 'contained' },
          { label: 'Payment history', path: ROUTES.PAYMENTS },
        ]}
        description="The backend has not confirmed a captured payment. Membership remains inactive until reconciliation or confirmation succeeds."
        icon={<HourglassTopOutlinedIcon color="warning" sx={{ fontSize: 64 }} />}
        reference={paymentId}
        title="Payment confirmation pending"
      />
      <Button
        disabled={reconcileState.isLoading}
        onClick={() => void handleReconcile()}
        sx={{ alignSelf: 'center' }}
        variant="outlined"
      >
        {reconcileState.isLoading ? 'Reconciling…' : 'Reconcile with Razorpay'}
      </Button>
    </Stack>
  );
};
