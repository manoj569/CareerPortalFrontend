import { describe, expect, it, vi } from 'vitest';

import type { PhonePeCheckoutResponse } from '../types/paymentModels';
import { beginPhonePeRedirect, PHONEPE_ORDER_STORAGE_KEY } from './phonePeCheckout';

const checkout = (redirectUrl: string): PhonePeCheckoutResponse => ({
  amountInMinorUnits: 9_900,
  currencyCode: 'INR',
  durationDays: 30,
  expiresAtUtc: null,
  merchantOrderId: 'ch_order123',
  planName: 'Career Harbor Membership',
  redirectUrl,
});

describe('PhonePe checkout redirect', () => {
  it('stores only the merchant order and redirects to the exact HTTPS PhonePe host', () => {
    const assign = vi.fn();

    expect(
      beginPhonePeRedirect(checkout('https://mercury.phonepe.com/checkout/test'), assign),
    ).toBe(true);
    expect(assign).toHaveBeenCalledWith('https://mercury.phonepe.com/checkout/test');
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBe('ch_order123');
    expect(
      [...Array(sessionStorage.length).keys()].map((index) => sessionStorage.key(index)),
    ).toEqual([PHONEPE_ORDER_STORAGE_KEY]);
  });

  it.each([
    'http://mercury.phonepe.com/checkout/test',
    'https://mercury.phonepe.com.evil.example/checkout',
    'https://evil.example/checkout',
    'not-a-url',
  ])('blocks an unsafe redirect without storing a session: %s', (url) => {
    const assign = vi.fn();

    expect(beginPhonePeRedirect(checkout(url), assign)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBeNull();
  });
});
