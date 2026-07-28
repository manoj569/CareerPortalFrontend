import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Skeleton } from '@mui/material';
import { Navigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetPaymentsQuery } from '@/features/payments/api/paymentsApi';
import { PaymentResult } from '@/features/payments/components/PaymentResult';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import {
  getSafeJobReturnPath,
  getSafePaymentRetryPath,
  isGuid,
} from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const failureMessages: Record<string, string> = {
  dismissed: 'Secure checkout was closed before payment was verified.',
  failed: 'The payment gateway reported that this attempt did not complete.',
  timeout: 'Secure checkout timed out before payment could be verified.',
  verification: 'The backend could not verify the payment response.',
};

export const PaymentFailedPage = () => {
  useDocumentMetadata(
    'Payment not completed | Career Portal',
    'Review an unconfirmed payment and safely retry.',
  );
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const retryPath = getSafePaymentRetryPath(searchParams.get('retryPath'));
  const reason = searchParams.get('reason') ?? '';
  const payments = useGetPaymentsQuery(
    { pageNumber: 1, pageSize: 100 },
    { skip: !isGuid(paymentId) },
  );

  const payment = payments.data?.items.find((item) => item.id === paymentId);
  if (payment?.status === PaymentStatus.Paid && isGuid(paymentId)) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_SUCCESS}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }
  if (payments.isLoading) {
    return (
      <Skeleton aria-label="Checking payment status" height={360} role="status" variant="rounded" />
    );
  }

  return (
    <PaymentResult
      actions={[
        { label: 'Try payment again', path: retryPath, variant: 'contained' },
        { label: 'Return to jobs', path: ROUTES.JOBS },
      ]}
      description={
        failureMessages[reason] ??
        'This payment was not confirmed, and no access has been activated.'
      }
      icon={<ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />}
      reference={isGuid(paymentId) ? paymentId : undefined}
      title="Payment not completed"
    />
  );
};
