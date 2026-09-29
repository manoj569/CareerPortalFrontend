import { Alert, Button, Card, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { paymentsApi, useGetPaymentsQuery, useLazyGetPhonePeReturnQuery } from '../api/paymentsApi';
import { isValidPhonePeMerchantOrderId } from '../services/phonePeCheckout';
import { PaymentProvider, PaymentStatus, type Payment } from '../types/paymentModels';
import { PaymentHistoryTable } from './PaymentHistoryTable';
import { membershipPlanCode } from '../utils/entitlement';

export const RecentPaymentActivity = ({
  canRetry,
  onRetry,
}: {
  canRetry?: (planCode: string) => boolean;
  onRetry?: (planCode: string) => void;
}) => {
  const payments = useGetPaymentsQuery({ pageNumber: 1, pageSize: 5 });
  const [checkStatus, status] = useLazyGetPhonePeReturnQuery();
  const dispatch = useAppDispatch();
  const checkPayment = async (merchantOrderId: string) => {
    const result = await checkStatus({ merchantOrderId }, false);
    if (!result.error) {
      dispatch(paymentsApi.util.invalidateTags(['Payments', 'PaymentStatus', 'PendingCheckout']));
      dispatch(dashboardApi.util.invalidateTags(['Memberships']));
    }
  };
  const action = (payment: Payment) => {
    const planCode = membershipPlanCode(payment);
    if (
      (planCode === 'CareerHarborMembership' || planCode === 'ReferralContactAccess') &&
      onRetry &&
      [PaymentStatus.Failed, PaymentStatus.Cancelled, PaymentStatus.Expired].includes(
        payment.status,
      )
    ) {
      return (
        <Stack spacing={0.5}>
          <Button
            size="small"
            variant="outlined"
            disabled={!canRetry?.(planCode)}
            onClick={() => onRetry(planCode)}
          >
            Retry payment
          </Button>
          {!canRetry?.(planCode) ? (
            <Typography variant="caption" color="text.secondary">
              Manage this plan above to retry.
            </Typography>
          ) : null}
        </Stack>
      );
    }
    const order = payment.providerOrderId;
    if (
      payment.provider === PaymentProvider.PhonePe &&
      isValidPhonePeMerchantOrderId(order) &&
      [PaymentStatus.Pending, PaymentStatus.Created, PaymentStatus.Authorized].includes(
        payment.status,
      )
    ) {
      return (
        <Button
          size="small"
          variant="outlined"
          disabled={status.isFetching}
          onClick={() => void checkPayment(order)}
        >
          Check status
        </Button>
      );
    }
    return null;
  };
  return (
    <Stack component="section" spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
        alignItems={{ sm: 'center' }}
      >
        <Stack spacing={0.5}>
          <Typography component="h2" variant="h3">
            Payment Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your recent transactions and their backend-reported status. Manage pending payments in
            the relevant plan above.
          </Typography>
        </Stack>
        <Button component={Link} to={ROUTES.PAYMENTS} sx={{ flexShrink: 0 }}>
          View all transactions
        </Button>
      </Stack>
      {status.isError ? (
        <Alert severity="warning">Payment status could not be confirmed. Please try again.</Alert>
      ) : null}
      {payments.isLoading ? (
        <PageLoadingIndicator label="Loading payment activity" />
      ) : payments.isError ? (
        <Alert
          severity="warning"
          action={<Button onClick={() => void payments.refetch()}>Retry</Button>}
        >
          Payment activity is unavailable.
        </Alert>
      ) : payments.data?.items.length ? (
        <Card variant="outlined" sx={{ minWidth: 0, overflow: 'hidden' }}>
          <PaymentHistoryTable payments={payments.data.items} compact renderAction={action} />
        </Card>
      ) : (
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No payment activity yet.</Typography>
        </Card>
      )}
    </Stack>
  );
};
