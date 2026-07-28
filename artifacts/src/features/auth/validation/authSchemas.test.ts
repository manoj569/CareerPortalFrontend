import { describe, expect, it } from 'vitest';

import { loginSchema, registrationSchema, resetPasswordSchema } from './authSchemas';

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
        phoneNumber: '',
        termsAccepted: true,
      }),
    ).rejects.toThrow('Password must be at least 12 characters.');
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
