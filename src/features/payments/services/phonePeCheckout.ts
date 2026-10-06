import { getSafeMembershipReturnTo } from '@/features/interviewInsights/utils/membershipAccess';
import type { PhonePeCheckoutResponse } from '../types/paymentModels';

export const PHONEPE_ORDER_STORAGE_KEY = 'careerHarbor.phonePeMerchantOrderId';
export const PHONEPE_RETURN_TO_STORAGE_KEY = 'careerHarbor.phonePeReturnTo';
const PHONEPE_CHECKOUT_HOSTS = new Set([
  'mercury-uat.phonepe.com',
  'mercury.phonepe.com',
  'mercury-t2.phonepe.com',
]);
const merchantOrderPattern = /^(?:ch_[A-Za-z0-9_-]{1,100}|air_[0-9a-f]{32})$/;

export const isValidPhonePeMerchantOrderId = (value: string | null): value is string =>
  Boolean(value && merchantOrderPattern.test(value));

export const isSafePhonePeRedirectUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      PHONEPE_CHECKOUT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export const storePhonePeMerchantOrderId = (merchantOrderId: string): boolean => {
  if (!isValidPhonePeMerchantOrderId(merchantOrderId)) return false;
  try {
    sessionStorage.setItem(PHONEPE_ORDER_STORAGE_KEY, merchantOrderId);
  } catch {
    // Browser storage can be unavailable. The provider return still carries the order ID.
  }
  return true;
};

export const clearPhonePeMerchantOrderId = (): void =>
  sessionStorage.removeItem(PHONEPE_ORDER_STORAGE_KEY);

export const storePhonePeReturnTo = (returnTo: string | undefined): void => {
  const safeReturnTo = getSafeMembershipReturnTo(returnTo ?? null);
  try {
    if (safeReturnTo) sessionStorage.setItem(PHONEPE_RETURN_TO_STORAGE_KEY, safeReturnTo);
    else sessionStorage.removeItem(PHONEPE_RETURN_TO_STORAGE_KEY);
  } catch {
    // Return-path caching must not prevent an otherwise valid checkout redirect.
  }
};

export const getStoredPhonePeReturnTo = (): string | null =>
  sessionStorage.getItem(PHONEPE_RETURN_TO_STORAGE_KEY);

export const clearPhonePeReturnTo = (): void =>
  sessionStorage.removeItem(PHONEPE_RETURN_TO_STORAGE_KEY);

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
