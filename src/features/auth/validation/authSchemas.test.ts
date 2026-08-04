import { describe, expect, it } from 'vitest';

import {
  completePasswordResetSchema,
  isValidIndianMobile,
  loginSchema,
  maskIndianMobile,
  mobileNumberSchema,
  registrationSchema,
  requestPasswordResetSchema,
  sanitizeFullNameInput,
  sanitizeIndianMobileInput,
} from './authSchemas';

const validRegistration = {
  email: 'candidate@example.com',
  fullName: 'Manoj Shekapure',
  password: 'abc 12!',
  phoneNumber: '9876543210',
  termsAccepted: true,
};

describe('authentication validation', () => {
  it('keeps Unicode letters and single spaces while filtering other name characters', () => {
    expect(sanitizeFullNameInput('  आशिष123   कुमार!🙂')).toBe('आशिष कुमार');
    expect(sanitizeFullNameInput('Manoj---  Shekapure')).toBe('Manoj Shekapure');
  });

  it('accepts a backend-compatible full name', async () => {
    await expect(registrationSchema.validate(validRegistration)).resolves.toMatchObject({
      fullName: 'Manoj Shekapure',
    });
  });

  it('validates email format', async () => {
    await expect(
      registrationSchema.validate({ ...validRegistration, email: 'not-an-email' }),
    ).rejects.toThrow('Enter a valid email address.');
  });

  it('sanitizes mobile text and country-code paste to ten editable digits', () => {
    expect(sanitizeIndianMobileInput('call +91 (98765) 43210 now')).toBe('9876543210');
    expect(sanitizeIndianMobileInput('98ab76-54 3210')).toBe('9876543210');
  });

  it('matches backend Indian mobile validation', async () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('5876543210')).toBe(false);
    expect(isValidIndianMobile('9999999999')).toBe(false);
    expect(maskIndianMobile('9876543210')).toBe('+91 ••••••3210');
    await expect(mobileNumberSchema.validate({ phoneNumber: '123' })).rejects.toThrow(
      'Enter a valid 10-digit Indian mobile number.',
    );
  });

  it('accepts any password content from six through 128 characters', async () => {
    await expect(
      registrationSchema.validate({ ...validRegistration, password: '      ' }),
    ).resolves.toBeTruthy();
    await expect(
      registrationSchema.validate({ ...validRegistration, password: 'a! 12' }),
    ).rejects.toThrow('Password must be at least 6 characters.');
    await expect(
      registrationSchema.validate({ ...validRegistration, password: 'a'.repeat(129) }),
    ).rejects.toThrow('Password must be no more than 128 characters.');
  });

  it('requires Terms and Privacy consent', async () => {
    await expect(
      registrationSchema.validate({ ...validRegistration, termsAccepted: false }),
    ).rejects.toThrow('You must accept the Terms of Use and Privacy Policy.');
  });

  it('accepts email or a ten-digit mobile identifier for password login', async () => {
    await expect(
      loginSchema.validate({ identifier: 'candidate@example.com', password: 'abc123' }),
    ).resolves.toBeTruthy();
    await expect(
      loginSchema.validate({ identifier: '9876543210', password: 'abc123' }),
    ).resolves.toBeTruthy();
    await expect(
      loginSchema.validate({ identifier: 'not-valid', password: 'abc123' }),
    ).rejects.toThrow('Enter a valid email address or 10-digit Indian mobile number.');
  });

  it('requires a valid email address to request a password reset', async () => {
    await expect(
      requestPasswordResetSchema.validate({ email: ' candidate@example.com ' }),
    ).resolves.toEqual({ email: 'candidate@example.com' });
    await expect(requestPasswordResetSchema.validate({ email: 'invalid' })).rejects.toThrow(
      'Enter a valid email address.',
    );
  });

  it('requires matching reset passwords without complexity rules', async () => {
    await expect(
      completePasswordResetSchema.validate({
        confirmPassword: 'simple pass',
        newPassword: 'simple pass',
      }),
    ).resolves.toBeTruthy();
    await expect(
      completePasswordResetSchema.validate({
        confirmPassword: '      ',
        newPassword: '      ',
      }),
    ).resolves.toBeTruthy();
    await expect(
      completePasswordResetSchema.validate({
        confirmPassword: 'short',
        newPassword: 'short',
      }),
    ).rejects.toThrow('Password must be at least 6 characters.');
    await expect(
      completePasswordResetSchema.validate({
        confirmPassword: 'different',
        newPassword: 'simple pass',
      }),
    ).rejects.toThrow('Passwords must match.');
  });
});
