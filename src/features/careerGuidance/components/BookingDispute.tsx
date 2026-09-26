import { Alert, Paper, Stack, Typography } from '@mui/material';
import { useGetBookingDisputeQuery, useOpenBookingDisputeMutation } from '../api/trustApi';
import { useGetCareerPaymentQuery } from '../api/financeApi';
import { CareerDisputeCategory, CareerPaymentStatus } from '../types';
import { enumOptions } from '../utils/presentation';
import { guidanceError } from '../utils/errors';
import { useGuidanceAction } from '../hooks/useGuidanceAction';
import { GuidanceForm, numberValue, textValue } from './GuidanceForm';
import { GuidanceError, GuidanceLoading } from './GuidanceUI';
import { DisputeDetail } from './DisputeDetail';

export function BookingDispute({ bookingId }: { bookingId: string }) {
  const payment = useGetCareerPaymentQuery(bookingId);
  const paid = Boolean(payment.data?.paidAtUtc) && Boolean(payment.data && [CareerPaymentStatus.Captured, CareerPaymentStatus.RefundPending, CareerPaymentStatus.Refunded].includes(payment.data.status));
  const query = useGetBookingDisputeQuery(bookingId, { skip: !paid });
  const [open] = useOpenBookingDisputeMutation(); const action = useGuidanceAction();
  const missing = guidanceError(query.error).status === 404;
  if (!paid) return null;
  return <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography component="h2" variant="h3">Dispute or complaint</Typography>
    {action.error && <Alert severity="error">{action.error}</Alert>}
    {query.isLoading ? <GuidanceLoading /> : query.isError && !missing ? <GuidanceError error={query.error} retry={query.refetch} /> : query.data ? <DisputeDetail dispute={query.data} audience="candidate" refreshing={query.isFetching} /> : <>
      <Typography>One dispute is allowed per booking, including resolved cases. The server checks the category, payment, session timing, and complaint deadline. A requested refund is not an automatic refund.</Typography>
      {paid && missing ? <GuidanceForm busy={action.busy || query.isFetching} submitLabel="Open dispute" fields={[{ name: 'category', label: 'Category', kind: 'select', required: true, options: enumOptions(CareerDisputeCategory) }, { name: 'description', label: 'Describe the issue', kind: 'textarea', required: true, maxLength: 4000 }, { name: 'requestedRefund', label: 'Request refund review', kind: 'checkbox' }]} onSubmit={(values) => action.execute(() => open({ bookingId, request: { category: numberValue(values, 'category'), description: textValue(values, 'description'), requestedRefund: Boolean(values.requestedRefund) } }).unwrap(), 'Dispute opened.')} /> : <Typography>A captured payment is required to open a dispute.</Typography>}
    </>}
  </Stack></Paper>;
}
