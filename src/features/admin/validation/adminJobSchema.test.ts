import { describe, expect, it } from 'vitest';

import {
  EmploymentType,
  ExperienceLevel,
  SalaryPeriod,
  WorkplaceType,
} from '@/features/jobs/types/jobModels';
import { adminJobSchema, type AdminJobFormValues } from './adminJobSchema';

const validValues: AdminJobFormValues = {
  applicationUrl: 'https://apply.example.com/role',
  benefits: '',
  categoryId: '51741c58-0587-4c68-866e-acfe9b36836c',
  companyId: 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276',

  currencyCode: 'INR',
  minimumSalary: 100,
  maximumSalary: 200,
  salaryPeriod: SalaryPeriod.Yearly,

  description: 'Build reliable products.',

  employmentType: EmploymentType.FullTime,
  workplaceType: WorkplaceType.Hybrid,

  experienceLevel: ExperienceLevel.Senior,
  minimumExperienceYears: 5,
  maximumExperienceYears: null,

  expiresAtUtc: '2099-12-31T00:00',
  location: '',

  requirements: '',
  responsibilities: '',
  title: 'Frontend Engineer',
};

describe('administrator job validation', () => {
  it('accepts a backend-compatible job request', async () => {
    await expect(adminJobSchema.validate(validValues)).resolves.toMatchObject({
      applicationUrl: validValues.applicationUrl,
      minimumExperienceYears: 5,
      maximumExperienceYears: null,
      salaryPeriod: SalaryPeriod.Yearly,
      title: validValues.title,
    });
  });

  it('accepts an exact minimum experience requirement without inventing a maximum', async () => {
    await expect(
      adminJobSchema.validate({
        ...validValues,
        experienceLevel: ExperienceLevel.Unknown,
        minimumExperienceYears: 3,
        maximumExperienceYears: null,
      }),
    ).resolves.toMatchObject({
      minimumExperienceYears: 3,
      maximumExperienceYears: null,
    });
  });

  it('rejects maximum experience below minimum experience', async () => {
    await expect(
      adminJobSchema.validate({
        ...validValues,
        minimumExperienceYears: 5,
        maximumExperienceYears: 3,
      }),
    ).rejects.toThrow();
  });

  it('rejects maximum salary below minimum salary', async () => {
    await expect(
      adminJobSchema.validate({
        ...validValues,
        maximumSalary: 99,
      }),
    ).rejects.toThrow('Maximum salary must be at least the minimum salary.');
  });

  it('rejects a closing date in the past', async () => {
    await expect(
      adminJobSchema.validate({
        ...validValues,
        expiresAtUtc: '2020-01-01T00:00',
      }),
    ).rejects.toThrow('Closing date must be in the future.');
  });

  it('rejects non-HTTP application URLs', async () => {
    await expect(
      adminJobSchema.validate({
        ...validValues,
        applicationUrl: 'javascript:alert(1)',
      }),
    ).rejects.toThrow('Enter an absolute HTTP or HTTPS URL.');
  });
});