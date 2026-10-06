import { describe, expect, it, vi } from 'vitest';

import type { PhonePeCheckoutResponse } from '../types/paymentModels';
import {
  beginPhonePeRedirect,
  isSafePhonePeRedirectUrl,
  isValidPhonePeMerchantOrderId,
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
  it('calls the browser location.assign with its receiver using the production default', () => {
    const url = 'https://mercury-t2.phonepe.com/transact/pgv3?token=test&routingKey=W';
    const assign = vi.fn(function (this: { assign: unknown }) {
      expect(this).toBe(location);
    });
    const location = { assign };
    vi.stubGlobal('window', { location });
    try {
      expect(beginPhonePeRedirect(checkout(url))).toBe(true);
      expect(assign).toHaveBeenCalledExactlyOnceWith(url);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it.each([
    'https://mercury-uat.phonepe.com/transact/uat_v3?token=sandbox-token',
    'https://mercury.phonepe.com/checkout/test',
    'https://mercury-t2.phonepe.com/transact/pgv3?token=backend-token',
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
    '',
    'https://mercury-t2.phonepe.com.evil.example/transact/pgv3',
    'https://user:password@mercury-t2.phonepe.com/transact/pgv3',
  ])('blocks an unsafe redirect without storing a session: %s', (url) => {
    const assign = vi.fn();

    expect(beginPhonePeRedirect(checkout(url), assign)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PHONEPE_ORDER_STORAGE_KEY)).toBeNull();
  });
});

it.each([undefined, null, 123])('rejects a missing/non-string runtime redirect: %s', (url) => {
  expect(isSafePhonePeRedirectUrl(url)).toBe(false);
});

it('accepts only the backend AI Resume order shape alongside existing membership orders', () => {
  expect(isValidPhonePeMerchantOrderId('air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(true);
  expect(isValidPhonePeMerchantOrderId('air_missing-guid')).toBe(false);
  expect(isValidPhonePeMerchantOrderId('air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?token=secret')).toBe(false);
  expect(isValidPhonePeMerchantOrderId('ch_order123')).toBe(true);
});
