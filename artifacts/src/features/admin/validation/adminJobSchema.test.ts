import { describe, expect, it } from 'vitest';

import { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';
import { adminJobSchema, type AdminJobFormValues } from './adminJobSchema';

const validValues: AdminJobFormValues = {
  applicationUrl: 'https://apply.example.com/role',
  benefits: '',
  categoryId: '51741c58-0587-4c68-866e-acfe9b36836c',
  companyId: 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276',
  currencyCode: 'INR',
  description: 'Build reliable products.',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Senior,
  expiresAtUtc: '2099-12-31T00:00',
  location: '',
  maximumSalary: 200,
  minimumSalary: 100,
  requirements: '',
  responsibilities: '',
  title: 'Frontend Engineer',
  workplaceType: WorkplaceType.Hybrid,
};

describe('administrator job validation', () => {
  it('accepts a backend-compatible job request', async () => {
    await expect(adminJobSchema.validate(validValues)).resolves.toMatchObject({
      applicationUrl: validValues.applicationUrl,
      title: validValues.title,
    });
  });

  it('rejects maximum salary below minimum salary', async () => {
    await expect(adminJobSchema.validate({ ...validValues, maximumSalary: 99 })).rejects.toThrow(
      'Maximum salary must be at least the minimum salary.',
    );
  });

  it('rejects a closing date in the past', async () => {
    await expect(
      adminJobSchema.validate({ ...validValues, expiresAtUtc: '2020-01-01T00:00' }),
    ).rejects.toThrow('Closing date must be in the future.');
  });

  it('rejects non-HTTP application URLs', async () => {
    await expect(
      adminJobSchema.validate({ ...validValues, applicationUrl: 'javascript:alert(1)' }),
    ).rejects.toThrow('Enter an absolute HTTP or HTTPS URL.');
  });
});
