import { describe, expect, it } from 'vitest';

import { changePasswordSchema, profileSchema } from './dashboardSchemas';

const validProfile = {
  bio: 'Frontend engineer',
  firstName: 'Avery',
  headline: 'Senior frontend engineer',
  lastName: 'Patel',
  phoneNumber: '+91 98765 43210',
  profileImageUrl: 'https://example.com/avatar.png',
};

describe('dashboard validation schemas', () => {
  it('accepts a backend-compatible candidate profile', async () => {
    await expect(profileSchema.validate(validProfile)).resolves.toMatchObject(validProfile);
  });

  it('rejects non-HTTP profile image URLs', async () => {
    await expect(
      profileSchema.validate({ ...validProfile, profileImageUrl: 'ftp://example.com/avatar.png' }),
    ).rejects.toThrow('Enter an absolute HTTP or HTTPS URL.');
  });

  it('requires a strong new password different from the current password', async () => {
    await expect(
      changePasswordSchema.validate({
        confirmPassword: 'StrongPassword!2',
        currentPassword: 'StrongPassword!1',
        newPassword: 'StrongPassword!2',
      }),
    ).resolves.toBeDefined();

    await expect(
      changePasswordSchema.validate({
        confirmPassword: 'StrongPassword!1',
        currentPassword: 'StrongPassword!1',
        newPassword: 'StrongPassword!1',
      }),
    ).rejects.toThrow('New password must differ from the current password.');
  });
});
