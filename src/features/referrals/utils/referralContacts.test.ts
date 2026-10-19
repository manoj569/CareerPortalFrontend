import { describe, expect, it } from 'vitest';
import { initialContacts, type ContactForm } from '../components/ReferralContactFields';
import {
  contactPayload,
  hasContactMethod,
  restoreContacts,
  validateContacts,
} from './referralContacts';

const valid: ContactForm = {
  linkedin: { selected: true, value: 'https://www.linkedin.com/in/owner' },
  email: { selected: true, value: 'owner@example.com' },
  phone: { selected: true, value: '+91 9876543210' },
};

describe('backend referral contact rules', () => {
  it.each(['linkedin', 'email', 'phone'] as const)('requires selected %s', (key) => {
    expect(
      validateContacts({ ...valid, [key]: { selected: true, value: '  ' } })[key],
    ).toBeTruthy();
  });
  it.each([
    'http://linkedin.com/in/owner',
    'https:linkedin.com/in/owner',
    'https://linked\nin.com/in/owner',
    'https://linkedin.com/company/owner',
    'https://linkedin.com.evil.test/in/owner',
    'https://evil.test/in/owner',
    'https://sub.linkedin.com/in/owner',
    'https://user:pass@linkedin.com/in/owner',
    'https://linkedin.com:8443/in/owner',
    'https://linkedin.com/in/owner?x=1',
    'https://linkedin.com/in/owner#fragment',
    'https://linkedin.com/in/owner?',
    'https://linkedin.com/in/owner#',
    'https://linkedin.com/in/',
    `https://linkedin.com/in/${'x'.repeat(2048)}`,
  ])('rejects invalid LinkedIn %s', (value) => {
    expect(
      validateContacts({ ...valid, linkedin: { selected: true, value } }).linkedin,
    ).toBeTruthy();
  });
  it.each([
    'https://linkedin.com/in/owner',
    'https://www.linkedin.com/in/owner-123/',
    'https://LINKEDIN.COM:443/in/owner',
  ])('accepts LinkedIn %s', (value) => {
    expect(validateContacts({ ...valid, linkedin: { selected: true, value } })).toEqual({});
  });
  it.each([
    'invalid',
    'a@@example.com',
    'a b@example.com',
    '@example.com',
    'a@',
    `${'a'.repeat(250)}@example.com`,
  ])('rejects email %s', (value) => {
    expect(validateContacts({ ...valid, email: { selected: true, value } }).email).toBeTruthy();
  });
  it.each([
    '123456',
    '+1234567890123456',
    'call me',
    '+91 9876543210 ext 1',
    '++919876543210',
    '(123) 4567890',
    '1234567-',
  ])('rejects phone %s', (value) => {
    expect(validateContacts({ ...valid, phone: { selected: true, value } }).phone).toBeTruthy();
  });
  it.each(['+91 9876543210', '1 (212) 555-1234', '123.456.7890', '1234567', '+123456789012345'])(
    'accepts phone %s',
    (value) => {
      expect(validateContacts({ ...valid, phone: { selected: true, value } })).toEqual({});
    },
  );
  it('accepts all three and trims exact backend payload fields', () => {
    const padded = Object.fromEntries(
      Object.entries(valid).map(([key, field]) => [key, { ...field, value: ` ${field.value} ` }]),
    ) as ContactForm;
    expect(validateContacts(padded)).toEqual({});
    expect(hasContactMethod(padded)).toBe(true);
    expect(contactPayload(padded)).toEqual({
      showLinkedIn: true,
      showEmail: true,
      showPhone: true,
      linkedInUrl: valid.linkedin.value,
      contactEmail: valid.email.value,
      contactPhone: valid.phone.value,
    });
  });
  it('does not validate or submit stale unselected values', () => {
    const unselected = Object.fromEntries(
      Object.keys(valid).map((key) => [key, { selected: false, value: 'invalid-stale-secret' }]),
    ) as ContactForm;
    expect(validateContacts(unselected)).toEqual({});
    expect(hasContactMethod(unselected)).toBe(false);
    expect(contactPayload(unselected)).toEqual({
      showLinkedIn: false,
      showEmail: false,
      showPhone: false,
      linkedInUrl: null,
      contactEmail: null,
      contactPhone: null,
    });
  });
  it('restores owner methods and values', () => {
    expect(restoreContacts(contactPayload(valid))).toEqual(valid);
  });
  it.each([null, undefined])('restores legacy %s values as empty fields', (value) => {
    expect(
      restoreContacts({
        showLinkedIn: true,
        showEmail: false,
        showPhone: false,
        linkedInUrl: value,
        contactEmail: value,
        contactPhone: value,
      }),
    ).toEqual(initialContacts);
  });
});
