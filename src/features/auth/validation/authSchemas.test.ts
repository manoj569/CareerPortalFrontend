import { describe, expect, it } from 'vitest';

import {
  loginSchema,
  normalizeIndianMobileNumber,
  registrationSchema,
  resetPasswordSchema,
} from './authSchemas';

describe('authentication validation', () => {
  it('rejects an invalid login email and empty password', async () => {
    await expect(loginSchema.validate({ email: 'not-an-email', password: '' })).rejects.toThrow();
  });

  it('requires all backend registration fields and terms acceptance', async () => {
    await expect(
      registrationSchema.validate({
        confirmPassword: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        phoneNumber: '',
        termsAccepted: false,
      }),
    ).rejects.toThrow();
  });

  it('enforces backend password complexity', async () => {
    await expect(
      registrationSchema.validate({
        confirmPassword: 'short',
        email: 'candidate@example.com',
        firstName: 'Avery',
        lastName: 'Patel',
        password: 'short',
        phoneNumber: '+91 98765 43210',
        termsAccepted: true,
      }),
    ).rejects.toThrow('Password must be at least 12 characters.');
  });

  it('normalizes supported Indian mobile formats and rejects invalid numbers', () => {
    expect(normalizeIndianMobileNumber('+91 98765 43210')).toBe('+919876543210');
    expect(normalizeIndianMobileNumber('09876543210')).toBe('+919876543210');
    expect(normalizeIndianMobileNumber('1234567890')).toBeNull();
    expect(normalizeIndianMobileNumber('9999999999')).toBeNull();
  });

  it('rejects invalid email, mobile, password mismatch, and missing consent', async () => {
    const invalidRegistration = {
      confirmPassword: 'Different1!Password',
      email: 'not-an-email',
      firstName: 'Avery',
      lastName: 'Patel',
      password: 'Str0ng!Password2026',
      phoneNumber: '12345',
      termsAccepted: false,
    };

    await expect(registrationSchema.validateAt('email', invalidRegistration)).rejects.toThrow(
      'Enter a valid email address.',
    );
    await expect(registrationSchema.validateAt('phoneNumber', invalidRegistration)).rejects.toThrow(
      'Enter a valid 10-digit Indian mobile number.',
    );
    await expect(
      registrationSchema.validateAt('confirmPassword', invalidRegistration),
    ).rejects.toThrow('Passwords must match.');
    await expect(
      registrationSchema.validateAt('termsAccepted', invalidRegistration),
    ).rejects.toThrow('You must accept the Terms of Use and Privacy Policy.');
  });

  it('matches the backend personal-data password restriction', async () => {
    await expect(
      registrationSchema.validate({
        confirmPassword: 'Avery!Password2026',
        email: 'candidate@example.com',
        firstName: 'Avery',
        lastName: 'Patel',
        password: 'Avery!Password2026',
        phoneNumber: '+91 98765 43210',
        termsAccepted: true,
      }),
    ).rejects.toThrow('Password must not contain your name');
  });

  it('rejects password confirmation mismatches', async () => {
    await expect(
      resetPasswordSchema.validate({
        confirmPassword: 'Different1!Password',
        newPassword: 'Str0ng!Password2026',
      }),
    ).rejects.toThrow('Passwords must match.');
  });
});
