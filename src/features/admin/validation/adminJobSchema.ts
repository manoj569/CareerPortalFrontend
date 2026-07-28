import * as yup from 'yup';

import { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';

export interface AdminJobFormValues {
  title: string;
  description: string;
  companyId: string;
  categoryId: string;
  applicationUrl: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  location: string;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currencyCode: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  expiresAtUtc: string;
}

const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const adminJobSchema: yup.ObjectSchema<AdminJobFormValues> = yup.object({
  title: yup.string().trim().required('Title is required.').max(250),
  description: yup.string().trim().required('Description is required.').max(16000),
  companyId: yup.string().required('Company is required.').matches(guid, 'Select a valid company.'),
  categoryId: yup
    .string()
    .required('Category is required.')
    .matches(guid, 'Select a valid category.'),
  applicationUrl: yup
    .string()
    .trim()
    .required('Application URL is required.')
    .max(2048)
    .test('http-url', 'Enter an absolute HTTP or HTTPS URL.', isHttpUrl),
  responsibilities: yup.string().defined().trim().max(8000),
  requirements: yup.string().defined().trim().max(8000),
  benefits: yup.string().defined().trim().max(4000),
  location: yup.string().defined().trim().max(250),
  minimumSalary: yup
    .number()
    .nullable()
    .defined()
    .transform((value: unknown, originalValue: unknown) =>
      originalValue === '' ? null : typeof value === 'number' ? value : null,
    )
    .min(0, 'Minimum salary cannot be negative.'),
  maximumSalary: yup
    .number()
    .nullable()
    .defined()
    .transform((value: unknown, originalValue: unknown) =>
      originalValue === '' ? null : typeof value === 'number' ? value : null,
    )
    .min(0, 'Maximum salary cannot be negative.')
    .when('minimumSalary', ([minimumSalary], schema) =>
      typeof minimumSalary === 'number'
        ? schema.min(minimumSalary, 'Maximum salary must be at least the minimum salary.')
        : schema,
    ),
  currencyCode: yup
    .string()
    .trim()
    .required('Currency is required.')
    .length(3, 'Use a three-letter currency code.')
    .matches(/^[A-Za-z]{3}$/, 'Use a three-letter currency code.'),
  employmentType: yup
    .mixed<EmploymentType>()
    .oneOf(
      Object.values(EmploymentType).filter(
        (value): value is EmploymentType => typeof value === 'number',
      ),
    )
    .required(),
  workplaceType: yup
    .mixed<WorkplaceType>()
    .oneOf(
      Object.values(WorkplaceType).filter(
        (value): value is WorkplaceType => typeof value === 'number',
      ),
    )
    .required(),
  experienceLevel: yup
    .mixed<ExperienceLevel>()
    .oneOf(
      Object.values(ExperienceLevel).filter(
        (value): value is ExperienceLevel => typeof value === 'number',
      ),
    )
    .required(),
  expiresAtUtc: yup
    .string()
    .defined()
    .test('valid-future-date', 'Closing date must be in the future.', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date > new Date();
    }),
});
