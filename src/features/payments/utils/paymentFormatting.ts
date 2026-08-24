import dayjs from 'dayjs';

import { PaymentProvider, PaymentStatus } from '../types/paymentModels';

export const formatPaymentAmount = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      currency: currencyCode,
      style: 'currency',
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export const formatMinorAmount = (amount: number, currencyCode: string): string =>
  formatPaymentAmount(amount / 100, currencyCode);

export const formatPaymentDate = (value: string | null): string | null => {
  if (!value) return null;
  const date = dayjs(value);
  return date.isValid() ? date.format('D MMM YYYY, h:mm A') : null;
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Authorized]: 'Authorized',
  [PaymentStatus.Paid]: 'Paid',
  [PaymentStatus.Failed]: 'Failed',
  [PaymentStatus.Refunded]: 'Refunded',
  [PaymentStatus.Cancelled]: 'Cancelled',
  [PaymentStatus.Created]: 'Created',
  [PaymentStatus.Expired]: 'Expired',
};

const paymentProviderLabels: Record<PaymentProvider, string> = {
  [PaymentProvider.Unknown]: 'Unknown',
  [PaymentProvider.Stripe]: 'Stripe',
  [PaymentProvider.Razorpay]: 'Razorpay',
  [PaymentProvider.PhonePe]: 'PhonePe',
  [PaymentProvider.PayPal]: 'PayPal',
  [PaymentProvider.BankTransfer]: 'Bank transfer',
};

export const getPaymentStatusLabel = (status: PaymentStatus): string =>
  paymentStatusLabels[status] ?? 'Unknown';

export const getPaymentProviderLabel = (provider: PaymentProvider): string =>
  paymentProviderLabels[provider] ?? 'Unknown';
