import type { CareerCheckout, CareerVerifyRequest } from '../types';

interface CheckoutCallback { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }
interface CheckoutOptions {
  key: string; order_id: string; amount: number; currency: string; name: string; description: string;
  handler: (value: CheckoutCallback) => void; modal: { ondismiss: () => void }; retry: { enabled: boolean };
}
export interface RazorpayInstance { open: () => void; close: () => void; on: (name: 'payment.failed', callback: () => void) => void; }
export type RazorpayConstructor = new (options: CheckoutOptions) => RazorpayInstance;
declare global { interface Window { Razorpay?: RazorpayConstructor; } }
export type CheckoutResult = { type: 'submitted'; request: CareerVerifyRequest } | { type: 'cancelled' | 'failed' | 'timeout' };
const sdkUrl = 'https://checkout.razorpay.com/v1/checkout.js';
let sdkPromise: Promise<void> | null = null;
export const loadCareerCheckout = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => finish(false), 15000);
    const finish = (success: boolean) => {
      window.clearTimeout(timer); script.onload = null; script.onerror = null;
      if (success && window.Razorpay) resolve();
      else { sdkPromise = null; script.remove(); reject(new Error('Secure checkout is unavailable.')); }
    };
    script.src = sdkUrl; script.async = true; script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.onload = () => finish(true); script.onerror = () => finish(false); document.head.append(script);
  });
  return sdkPromise;
};

export const openCareerCheckout = async (order: CareerCheckout, signal: AbortSignal): Promise<CheckoutResult> => {
  await loadCareerCheckout();
  if (signal.aborted) return { type: 'cancelled' };
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('Secure checkout is unavailable.');
  return new Promise((resolve) => {
    let settled = false;
    let timer = 0;
    const finish = (result: CheckoutResult) => {
      if (settled) return;
      settled = true; window.clearTimeout(timer); signal.removeEventListener('abort', abort);
      resolve(result);
    };
    const checkout = new Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
      name: 'CareerHarbor', description: 'Independent career guidance session', retry: { enabled: false },
      handler: (value) => finish({ type: 'submitted', request: { orderId: value.razorpay_order_id, paymentId: value.razorpay_payment_id, signature: value.razorpay_signature } }),
      modal: { ondismiss: () => finish({ type: 'cancelled' }) },
    });
    const abort = () => { finish({ type: 'cancelled' }); checkout.close(); };
    signal.addEventListener('abort', abort, { once: true });
    checkout.on('payment.failed', () => { finish({ type: 'failed' }); checkout.close(); });
    timer = window.setTimeout(() => { finish({ type: 'timeout' }); checkout.close(); }, 600000);
    checkout.open();
  });
};
