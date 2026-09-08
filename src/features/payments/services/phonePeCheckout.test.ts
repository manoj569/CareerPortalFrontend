import { describe, expect, it, vi } from 'vitest';

import type { PhonePeCheckoutResponse } from '../types/paymentModels';
import {
  beginPhonePeRedirect,
  PHONEPE_ORDER_STORAGE_KEY,
  resumePhonePeRedirect,
} from './phonePeCheckout';

const checkout = (redirectUrl: string): PhonePeCheckoutResponse => ({
  amountInMinorUnits: 9_900,
  currencyCode: 'INR',
  durationDays: 30,
  expiresAtUtc: null,
  merchantOrderId: 'ch_order123',
  planName: 'Career Harbor Membership',
  planCode: 'CareerHarborMembership',
  returnTo: null,
  redirectUrl,
});

describe('PhonePe pending checkout resume', () => {
  it('stores only the public merchant reference before resuming', () => {
    const assign = vi.fn();
    expect(
      resumePhonePeRedirect('ch_order123', 'https://mercury.phonepe.com/checkout/resume', assign),
    ).toBe(true);
    expect(assign).toHaveBeenCalledWith('https://mercury.phonepe.com/checkout/resume');
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBe('ch_order123');
  });

  it('blocks an untrusted resume URL', () => {
    const assign = vi.fn();
    expect(resumePhonePeRedirect('ch_order123', 'https://evil.example/resume', assign)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
  });
});

describe('PhonePe checkout redirect', () => {
  it.each([
    'https://mercury-uat.phonepe.com/transact/uat_v3?token=sandbox-token',
    'https://mercury.phonepe.com/checkout/test',
  ])('accepts an exact HTTPS PhonePe checkout host: %s', (url) => {
    const assign = vi.fn();

    expect(beginPhonePeRedirect(checkout(url), assign)).toBe(true);
    expect(assign).toHaveBeenCalledWith(url);
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBe('ch_order123');
    expect(
      [...Array(sessionStorage.length).keys()].map((index) => sessionStorage.key(index)),
    ).toEqual([PHONEPE_ORDER_STORAGE_KEY]);
  });

  it.each([
    'http://mercury.phonepe.com/checkout/test',
    'http://mercury-uat.phonepe.com/transact/uat_v3?token=sandbox-token',
    'https://evilphonepe.com/checkout',
    'https://mercury.phonepe.com.evil.example/checkout',
    'not-a-url',
  ])('blocks an unsafe redirect without storing a session: %s', (url) => {
    const assign = vi.fn();

    expect(beginPhonePeRedirect(checkout(url), assign)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBeNull();
  });
});
