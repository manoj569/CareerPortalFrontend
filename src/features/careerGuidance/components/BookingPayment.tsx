import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreateCareerOrderMutation, useGetCareerPaymentQuery, useReconcileCareerPaymentMutation, useVerifyCareerPaymentMutation } from '../api/financeApi';
import { useProvisionCareerSessionMutation } from '../api/sessionsApi';
import { useLazyGetCareerBookingQuery } from '../api/schedulingApi';
import { CareerBookingStatus, CareerPaymentStatus, type CareerBookingResponse } from '../types';
import { guidanceError } from '../utils/errors';
import { money } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';
import { useGuidanceAction } from '../hooks/useGuidanceAction';
import { openCareerCheckout } from '../services/razorpayCheckout';
import { GuidanceError, GuidanceLoading, StatusChip } from './GuidanceUI';

export const BookingPayment = ({ booking }: { booking: CareerBookingResponse }) => {
  const navigate = useNavigate();
  const payment = useGetCareerPaymentQuery(booking.id, { refetchOnMountOrArgChange: true });
  const [order, orderState] = useCreateCareerOrderMutation();
  const [verify, verifyState] = useVerifyCareerPaymentMutation();
  const [reconcile] = useReconcileCareerPaymentMutation();
  const [provision] = useProvisionCareerSessionMutation();
  const [getBooking] = useLazyGetCareerBookingQuery();
  const action = useGuidanceAction();
  const [notice, setNotice] = useState<string | null>(null);
  const [expiredBookingId, setExpiredBookingId] = useState<string | null>(null);
  const cancellation = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; cancellation.current?.abort(); };
  }, []);
  const synchronize = async (captured: boolean) => {
    const current = await getBooking({ audience: 'candidate', id: booking.id }, false).unwrap();
    if (captured && current.status === CareerBookingStatus.Confirmed) {
      try { await provision({ audience: 'candidate', bookingId: booking.id }).unwrap(); }
      catch { setNotice('Payment is confirmed. Session preparation needs attention; open the session page to refresh its status.'); }
      if (mounted.current) void navigate(guidanceRoutes.bookingConfirmed(booking.id), { replace: true });
    }
  };
  const canPay = expiredBookingId !== booking.id && booking.requiresPayment && booking.status === CareerBookingStatus.Pending &&
    (!payment.data || [CareerPaymentStatus.Created, CareerPaymentStatus.OrderCreated].includes(payment.data.status));
  const missing = guidanceError(payment.error).status === 404;
  return <Paper sx={{ p: 3 }}><Stack spacing={2}><Typography component="h2" variant="h3">Payment</Typography>
    {payment.isLoading ? <GuidanceLoading /> : payment.isError && !missing ? <GuidanceError error={payment.error} retry={payment.refetch} /> : payment.data ? <>
      <StatusChip values={CareerPaymentStatus} value={payment.data.status} /><Typography>{money(payment.data.gross, payment.data.currency)}</Typography>
      {payment.data.requiresRefundReview && <Alert severity="warning">This payment requires administrator refund review. It does not confirm an eligible session.</Alert>}
      {payment.data.status === CareerPaymentStatus.Authorized && <Alert severity="info">Payment authorized; capture and verification are still pending. Refresh payment status.</Alert>}
      {payment.data.status === CareerPaymentStatus.RefundPending && <Alert severity="info">Refund processing is pending.</Alert>}
      {payment.data.status === CareerPaymentStatus.Refunded && <Alert severity="info">Payment refunded.</Alert>}
      {payment.data.status === CareerPaymentStatus.Captured && !payment.data.requiresRefundReview && <Alert severity="success">Payment capture confirmed by the server.</Alert>}
      {payment.data.failureCode && <Alert severity="warning">A payment attempt did not complete. Refresh payment status before retrying.</Alert>}
    </> : <Typography>{booking.requiresPayment ? 'Payment has not been started.' : 'This legacy booking does not require checkout.'}</Typography>}
    <Typography>Booking amount: {money(booking.price, booking.currency)}. Checkout uses the amount returned by the payment server.</Typography>
    {notice && <Alert severity="info">{notice}</Alert>}{action.error && <Alert severity="error">{action.error}</Alert>}
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {canPay && <Button variant="contained" disabled={action.busy || payment.isFetching || payment.isError && !missing} onClick={() => {
        void action.execute(async () => {
          setNotice(null); cancellation.current = new AbortController();
          try {
            const checkout = await order(booking.id).unwrap();
            const outcome = await openCareerCheckout(checkout, cancellation.current.signal);
            if (outcome.type !== 'submitted') { setNotice(outcome.type === 'cancelled' ? 'Checkout closed. No payment success has been assumed. Refresh payment status if money was debited.' : 'Checkout did not confirm payment. Refresh payment status before retrying.'); return; }
            if (cancellation.current.signal.aborted) return;
            const verified = await verify({ bookingId: booking.id, request: outcome.request }).unwrap();
            if (verified.status !== CareerPaymentStatus.Captured) setNotice('Payment verification is pending. Use Refresh payment status to reconcile safely.');
            await synchronize(verified.status === CareerPaymentStatus.Captured && !verified.requiresRefundReview);
          } catch (error: unknown) {
            if (guidanceError(error).code === 'reservation_expired') setExpiredBookingId(booking.id);
            throw error;
          } finally { verifyState.reset(); orderState.reset(); if (!cancellation.current.signal.aborted) void payment.refetch(); }
        });
      }}>{action.busy ? 'Processing…' : 'Continue to secure checkout'}</Button>}
      {payment.data && <Button disabled={action.busy} onClick={() => { void action.execute(async () => { const latest = await reconcile(booking.id).unwrap(); await synchronize(latest.status === CareerPaymentStatus.Captured && !latest.requiresRefundReview); setNotice('Payment status refreshed from the server.'); }); }}>Refresh payment status</Button>}
    </Stack>
  </Stack></Paper>;
};
