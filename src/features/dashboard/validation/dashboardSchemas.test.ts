import { describe, expect, it } from 'vitest';

import { EmploymentType } from '@/features/jobs/types/jobModels';
import { changePasswordSchema, profileSchema } from './dashboardSchemas';

const validProfile = {
  bio: 'Frontend engineer',
  education: 'B.Tech Computer Science',
  experience: 'Senior engineer at Northstar',
  headline: 'Senior frontend engineer',
  linkedInUrl: 'https://linkedin.com/in/avery',
  location: 'Pune',
  portfolioUrl: 'https://example.com',
  preferredJobTypes: [EmploymentType.FullTime],
  skills: 'React, TypeScript',
};

describe('dashboard validation schemas', () => {
  it('accepts a backend-compatible candidate profile', async () => {
    await expect(profileSchema.validate(validProfile)).resolves.toMatchObject(validProfile);
  });

  it('rejects non-HTTP candidate portfolio URLs', async () => {
    await expect(
      profileSchema.validate({ ...validProfile, portfolioUrl: 'ftp://example.com/portfolio' }),
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
