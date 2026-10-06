import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectAuthStatus } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import {
  clearPhonePeMerchantOrderId,
  clearPhonePeReturnTo,
} from '@/features/payments/services/phonePeCheckout';
import { useGetResumeCreditsQuery, useGetResumePurchaseQuery } from '../api/aiResumeApi';
import { resumeMakerPath, resumeWorkflowStorage, validResumeId } from '../services/resumeWorkflow';
import { WorkflowPanel } from './AnalysisScreen';
export const ResumePaymentReturn = ({ merchantOrderId }: { merchantOrderId: string }) => {
  const auth = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  const [ended, setEnded] = useState(false);
  const deadline = useRef(Date.now() + 60000);
  const handled = useRef(false);
  const [error, setError] = useState(false);
  const purchase = useGetResumePurchaseQuery(merchantOrderId, {
    skip: auth !== 'authenticated',
    refetchOnMountOrArgChange: true,
  });
  const credits = useGetResumeCreditsQuery(undefined, { skip: auth !== 'authenticated' });
  const sessionId = resumeWorkflowStorage.get('session');
  const returnPath = validResumeId(sessionId) ? resumeMakerPath(sessionId) : ROUTES.RESUME_MAKER;
  useEffect(() => {
    if (
      auth !== 'authenticated' ||
      !purchase.data ||
      purchase.isFetching ||
      purchase.data.merchantOrderId !== merchantOrderId ||
      ![PaymentStatus.Created, PaymentStatus.Pending, PaymentStatus.Authorized].includes(
        purchase.data.status,
      )
    )
      return;
    if (Date.now() >= deadline.current) {
      setEnded(true);
      return;
    }
    const timer = setTimeout(() => {
      void purchase.refetch();
    }, 3000);
    return () => clearTimeout(timer);
  }, [auth, merchantOrderId, purchase]);
  useEffect(() => {
    if (
      auth !== 'authenticated' ||
      purchase.data?.merchantOrderId !== merchantOrderId ||
      purchase.data.status !== PaymentStatus.Paid ||
      handled.current
    )
      return;
    handled.current = true;
    void credits
      .refetch()
      .unwrap()
      .then(() => {
        if (purchase.data?.returnTo !== ROUTES.RESUME_MAKER) {
          setError(true);
          return;
        }
        clearPhonePeMerchantOrderId();
        clearPhonePeReturnTo();
        resumeWorkflowStorage.remove('purchase');
        if (purchase.data?.packageCode && sessionId)
          resumeWorkflowStorage.remove(`checkoutKey.${sessionId}.${purchase.data.packageCode}`);
        if (validResumeId(sessionId)) resumeWorkflowStorage.set('verifiedSession', sessionId);
        void navigate(returnPath, { replace: true });
      })
      .catch(() => {
        setError(true);
      });
  }, [auth, credits, merchantOrderId, navigate, purchase.data, returnPath, sessionId]);
  const status = purchase.data?.status;
  const failed =
    status === PaymentStatus.Failed ||
    status === PaymentStatus.Expired ||
    status === PaymentStatus.Refunded;
  const cancelled = status === PaymentStatus.Cancelled;
  useEffect(() => {
    if ((failed || cancelled) && purchase.data?.packageCode)
      resumeWorkflowStorage.remove('checkoutKey.' + sessionId + '.' + purchase.data.packageCode);
  }, [failed, cancelled, purchase.data?.packageCode, sessionId]);
  if (auth === 'idle' || auth === 'initializing')
    return (
      <WorkflowPanel>
        <Typography role="status">Restoring your secure session…</Typography>
      </WorkflowPanel>
    );
  return (
    <WorkflowPanel>
      <Stack alignItems="center" spacing={2} textAlign="center">
        <Typography variant="h4" fontWeight={700}>
          {failed
            ? 'Payment not completed'
            : cancelled
              ? 'Payment cancelled'
              : 'Verifying your payment…'}
        </Typography>
        {!failed && !cancelled && !purchase.isError && <CircularProgress />}
        <Typography>
          No resume credits are granted by the browser. CareerHarbor verifies your purchase
          securely.
        </Typography>
        {(purchase.isError || error) && (
          <Alert severity="error">
            Payment or credit verification is unavailable. Please check again.
          </Alert>
        )}
        {ended && (
          <Alert severity="info">Automatic checking has ended. You can check again safely.</Alert>
        )}
        {!failed && !cancelled && (
          <Button
            disabled={purchase.isFetching || auth !== 'authenticated'}
            onClick={() => {
              handled.current = false;
              setError(false);
              void purchase.refetch();
            }}
          >
            Check again
          </Button>
        )}
        <Button component={Link} to={returnPath} variant="outlined">
          Back to Resume Maker
        </Button>
      </Stack>
    </WorkflowPanel>
  );
};
