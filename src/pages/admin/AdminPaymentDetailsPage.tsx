import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { Alert, Grid, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { useGetAdminRecentPaymentsQuery } from '@/features/admin/api/adminApi';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { PaymentStatusBadge } from '@/features/payments/components/PaymentStatusBadge';
import {
  formatPaymentAmount,
  getPaymentProviderLabel,
} from '@/features/payments/utils/paymentFormatting';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminPaymentDetailsPage = () => {
  const { paymentId = '' } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  useDocumentMetadata(
    'Payment summary | Career Portal',
    'Review a safe administrator payment summary when available.',
  );
  const payments = useGetAdminRecentPaymentsQuery(100, { skip: !isGuid(paymentId) });

  if (!isGuid(paymentId)) {
    return (
      <ErrorState
        description="The payment identifier in this URL is invalid."
        headingLevel="h1"
        onRetry={() => void navigate(ROUTES.ADMIN_PAYMENTS)}
        title="Invalid payment"
      />
    );
  }
  if (payments.isLoading) {
    return <PageLoadingIndicator label="Loading admin payment summary" />;
  }
  if (payments.isError) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Payment summary unavailable"
      />
    );
  }

  const payment = payments.data?.find((item) => item.id === paymentId);
  if (!payment) {
    return (
      <ErrorState
        description="This payment is not present in the backend’s 100 most recent payment summaries. No individual administrator payment endpoint exists."
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Payment not available"
      />
    );
  }

  const fields = [
    ['Payment reference', payment.id],
    ['User', payment.userName],
    ['User email', payment.userEmail],
    ['User identifier', payment.userId],
    ['Amount', formatPaymentAmount(payment.amount, payment.currencyCode)],
    ['Provider', getPaymentProviderLabel(payment.provider)],
    ['Provider payment reference', payment.providerPaymentId ?? 'Not provided'],
    ['Created', formatAdminDate(payment.createdAtUtc)],
    ['Verified', formatAdminDate(payment.paidAtUtc)],
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography color="primary.main" fontWeight={700} variant="overline">
          Administration
        </Typography>
        <Typography component="h1" variant="h1">
          Payment summary
        </Typography>
      </Stack>
      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <PaymentStatusBadge status={payment.status} />
          <Grid container spacing={2}>
            {fields.map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, md: 6 }}>
                <Typography color="text.secondary" variant="caption">
                  {label}
                </Typography>
                <Typography sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>
      <Alert severity="info">
        Status history, membership activation, order details, refund, reconciliation, and receipt
        actions are unavailable because the backend exposes no administrator payment-detail or
        mutation endpoints. This page is strictly read-only.
      </Alert>
    </Stack>
  );
};
