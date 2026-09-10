import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { Navigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetPaymentStatusQuery } from '@/features/payments/api/paymentsApi';
import { PaymentResult } from '@/features/payments/components/PaymentResult';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import {
  getSafeJobReturnPath,
  getSafePaymentRetryPath,
  isGuid,
} from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const failureMessages: Record<string, string> = {
  dismissed: 'Test Mode checkout was closed before the payment was confirmed.',
  failed: 'Razorpay reported that this Test Mode attempt did not complete.',
  timeout: 'Test Mode checkout timed out before the payment could be confirmed.',
  verification: 'The backend could not verify the checkout response.',
  reconciliation: 'Backend reconciliation reported that the payment did not complete.',
};

const isPendingPayment = (status: PaymentStatus): boolean =>
  status === PaymentStatus.Created ||
  status === PaymentStatus.Pending ||
  status === PaymentStatus.Authorized;

export const PaymentFailedPage = () => {
  useDocumentMetadata(
    'Payment not completed | Career Portal',
    'Review an unconfirmed Test Mode payment and recover safely.',
  );
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const returnTo = getSafeJobReturnPath(searchParams.get('returnTo'));
  const retryPath = getSafePaymentRetryPath(searchParams.get('retryPath'), ROUTES.MEMBERSHIP);
  const reason = searchParams.get('reason') ?? '';
  const status = useGetPaymentStatusQuery(undefined, { skip: !isGuid(paymentId) });
  const payment =
    status.data?.latestPayment?.id === paymentId ? status.data.latestPayment : undefined;

  if (payment?.status === PaymentStatus.Paid && isGuid(paymentId)) {
    return (
      <Navigate
        replace
        to={`${ROUTES.PAYMENT_SUCCESS}?${new URLSearchParams({ paymentId, returnTo }).toString()}`}
      />
    );
  }
  if (status.isLoading) {
    return <PageLoadingIndicator label="Checking payment status" />;
  }

  const pendingPath =
    isGuid(paymentId) && payment && isPendingPayment(payment.status)
      ? `${ROUTES.PAYMENT_PENDING}?${new URLSearchParams({ paymentId, returnTo }).toString()}`
      : null;

  return (
    <PaymentResult
      actions={[
        pendingPath
          ? { label: 'Resolve pending payment', path: pendingPath, variant: 'contained' }
          : { label: 'Try payment again', path: retryPath, variant: 'contained' },
        { label: 'Payment history', path: ROUTES.PAYMENTS },
      ]}
      description={
        failureMessages[reason] ??
        'This payment was not confirmed, and no membership was activated by the frontend.'
      }
      icon={<ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />}
      reference={isGuid(paymentId) ? paymentId : undefined}
      title="Payment not completed"
    />
  );
};
