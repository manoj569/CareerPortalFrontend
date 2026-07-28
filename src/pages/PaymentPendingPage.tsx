import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { Button, Skeleton, Stack } from '@mui/material';
import { Navigate, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { useGetPaymentsQuery } from '@/features/payments/api/paymentsApi';
import { PaymentResult } from '@/features/payments/components/PaymentResult';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import { getSafeJobReturnPath, isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const PaymentPendingPage = () => {
  useDocumentMetadata(
    'Payment pending | Career Portal',
    'Check the backend status of a pending payment.',
  );
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const payments = useGetPaymentsQuery({ pageNumber: 1, pageSize: 100 });

  if (!isGuid(paymentId)) {
    return (
      <ErrorState
        description="The payment reference is missing or invalid."
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Cannot check payment"
      />
    );
  }

  if (payments.isLoading) {
    return (
      <Skeleton aria-label="Checking payment status" height={360} role="status" variant="rounded" />
    );
  }
  if (payments.isError) {
    return (
      <ErrorState
        description="Payment status is temporarily unavailable. Checking again will not create a new payment."
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Status unavailable"
      />
    );
  }

  const payment = payments.data?.items.find((item) => item.id === paymentId);
  if (payment?.status === PaymentStatus.Paid) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_SUCCESS}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }
  if (
    payment &&
    payment.status !== PaymentStatus.Pending &&
    payment.status !== PaymentStatus.Authorized
  ) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_FAILED}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }

  return (
    <Stack spacing={2}>
      <PaymentResult
        actions={[
          { label: 'Back to job', path: returnTo, variant: 'contained' },
          { label: 'Payment history', path: ROUTES.PAYMENTS },
        ]}
        description="The backend has not yet confirmed this payment. Do not create another order while its status is pending."
        icon={<HourglassTopOutlinedIcon color="warning" sx={{ fontSize: 64 }} />}
        reference={paymentId}
        title="Payment confirmation pending"
      />
      <Button onClick={() => void payments.refetch()} sx={{ alignSelf: 'center' }}>
        Check status
      </Button>
    </Stack>
  );
};
