import type { PaymentOrder } from '../types/paymentModels';

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const SDK_LOAD_TIMEOUT_MS = 15_000;
const CHECKOUT_TIMEOUT_MS = 10 * 60 * 1000;

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
  prefill?: { email?: string; name?: string };
  retry: { enabled: boolean };
}

interface RazorpayInstance {
  close: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void) => void;
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export type RazorpayCheckoutResult =
  | { type: 'success'; response: RazorpaySuccessResponse }
  | { type: 'dismissed' }
  | { type: 'failed' }
  | { type: 'timeout' };

let sdkPromise: Promise<void> | null = null;

export const loadRazorpayCheckout = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_URL}"]`,
    );
    const script = existing ?? document.createElement('script');

    const finishLoading = () => {
      window.clearTimeout(loadTimeoutId);
      resolve();
    };
    const handleError = () => {
      window.clearTimeout(loadTimeoutId);
      sdkPromise = null;
      reject(new Error('The secure checkout could not be loaded.'));
    };

    script.addEventListener('load', finishLoading, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (!existing) {
      script.async = true;
      script.referrerPolicy = 'strict-origin-when-cross-origin';
      script.src = RAZORPAY_CHECKOUT_URL;
      document.head.append(script);
    }

    const loadTimeoutId = window.setTimeout(() => {
      sdkPromise = null;
      reject(new Error('The secure checkout took too long to load.'));
    }, SDK_LOAD_TIMEOUT_MS);
  });

  return sdkPromise;
};

interface OpenCheckoutOptions {
  email?: string;
  name?: string;
  order: PaymentOrder;
}

export const openRazorpayCheckout = async ({
  email,
  name,
  order,
}: OpenCheckoutOptions): Promise<RazorpayCheckoutResult> => {
  await loadRazorpayCheckout();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('The secure checkout is unavailable.');

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: RazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(result);
    };

    const checkout: RazorpayInstance = new Razorpay({
      amount: order.amountInMinorUnits,
      currency: order.currencyCode,
      description: 'Application access',
      handler: (response) => finish({ response, type: 'success' }),
      key: order.keyId,
      modal: { ondismiss: () => finish({ type: 'dismissed' }) },
      name: 'Career Portal',
      order_id: order.providerOrderId,
      prefill: { email, name },
      retry: { enabled: true },
    });
    checkout.on('payment.failed', () => finish({ type: 'failed' }));

    const timeoutId = window.setTimeout(() => {
      checkout.close();
      finish({ type: 'timeout' });
    }, CHECKOUT_TIMEOUT_MS);

    checkout.open();
  });
};
