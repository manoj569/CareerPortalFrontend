import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Skeleton } from '@mui/material';

import { beginPhonePeRedirect } from '@/features/payments/services/phonePeCheckout';

import {
  getAcceleratorPlan,
  getAcceleratorSubscription,
  startAcceleratorCheckout,
  type AcceleratorEntitlementResponse,
} from '../api/acceleratorApi';

export function AcceleratorSubscriptionStatus({
  entitlement,
}: {
  entitlement?: AcceleratorEntitlementResponse;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutFailed, setCheckoutFailed] = useState(false);
  const checkoutKey = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void (
      entitlement ? Promise.resolve(entitlement) : getAcceleratorSubscription(controller.signal)
    )
      .then(async (subscription) => {
        if (controller.signal.aborted) return;
        setStatus(subscription.status);
        if (subscription.status === 'Active' || subscription.status === 'Pending') return;
        const plan = await getAcceleratorPlan(controller.signal);
        if (!controller.signal.aborted) setCheckoutAvailable(plan.checkoutAvailable);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [entitlement, retry]);

  const checkout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setCheckoutFailed(false);
    try {
      checkoutKey.current ??= crypto.randomUUID();
      const payment = await startAcceleratorCheckout(checkoutKey.current);
      if (beginPhonePeRedirect(payment)) return;
    } catch {
      // Keep the request key for a retry of this checkout.
    }
    setCheckoutFailed(true);
    setCheckingOut(false);
  };

  if (failed) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              setFailed(false);
              setRetry((attempt) => attempt + 1);
            }}
          >
            Retry
          </Button>
        }
      >
        Could not load Accelerator access.
      </Alert>
    );
  }

  if (status === null) return <Skeleton aria-label="Loading Accelerator access" width={140} />;

  const active = status.toLowerCase() === 'active';
  const expired = status.toLowerCase() === 'expired';
  return (
    <Alert
      severity={checkoutFailed ? 'error' : active ? 'success' : 'info'}
      action={
        checkoutAvailable && !active ? (
          <Button
            color="inherit"
            size="small"
            disabled={checkingOut}
            onClick={() => void checkout()}
          >
            {checkingOut ? 'Opening checkout…' : 'Activate Accelerator'}
          </Button>
        ) : undefined
      }
    >
      {checkoutFailed
        ? 'Could not open Accelerator checkout. Please try again.'
        : active
          ? 'Active access'
          : expired
            ? 'Expired access'
            : 'No active access'}
    </Alert>
  );
}
