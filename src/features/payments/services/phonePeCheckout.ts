import type { PhonePeCheckoutResponse } from '../types/paymentModels';

export const PHONEPE_ORDER_STORAGE_KEY = 'careerHarbor.phonePeMerchantOrderId';
const PHONEPE_CHECKOUT_HOSTS = new Set([
  'mercury-uat.phonepe.com',
  'mercury.phonepe.com',
]);
const merchantOrderPattern = /^ch_[A-Za-z0-9_-]{1,100}$/;

export const isValidPhonePeMerchantOrderId = (value: string | null): value is string =>
  Boolean(value && merchantOrderPattern.test(value));

export const isSafePhonePeRedirectUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && PHONEPE_CHECKOUT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export const storePhonePeMerchantOrderId = (merchantOrderId: string): boolean => {
  if (!isValidPhonePeMerchantOrderId(merchantOrderId)) return false;
  sessionStorage.setItem(PHONEPE_ORDER_STORAGE_KEY, merchantOrderId);
  return true;
};

export const clearPhonePeMerchantOrderId = (): void =>
  sessionStorage.removeItem(PHONEPE_ORDER_STORAGE_KEY);

export const getStoredPhonePeMerchantOrderId = (): string | null =>
  sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY);

export const beginPhonePeRedirect = (
  checkout: PhonePeCheckoutResponse,
  assign: (url: string) => void = (url) => window.location.assign(url),
): boolean => {
  if (
    !isSafePhonePeRedirectUrl(checkout.redirectUrl) ||
    !storePhonePeMerchantOrderId(checkout.merchantOrderId)
  ) {
    return false;
  }
  assign(checkout.redirectUrl);
  return true;
};

export const resumePhonePeRedirect = (
  merchantOrderId: string,
  redirectUrl: string,
  assign: (url: string) => void = (url) => window.location.assign(url),
): boolean => {
  if (!isSafePhonePeRedirectUrl(redirectUrl) || !storePhonePeMerchantOrderId(merchantOrderId)) {
    return false;
  }
  assign(redirectUrl);
  return true;
};
