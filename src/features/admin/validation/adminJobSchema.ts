import * as yup from 'yup';

import {
  EmploymentType,
  ExperienceLevel,
  SalaryPeriod,
  WorkplaceType,
} from '@/features/jobs/types/jobModels';

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
  salaryPeriod: SalaryPeriod | null;

  employmentType: EmploymentType;
  workplaceType: WorkplaceType;

  /**
   * Legacy backend field.
   *
   * The Admin UI should use numeric experience years as the primary
   * experience input. This value remains because the current backend
   * Create/Update contract still requires ExperienceLevel.
   */
  experienceLevel: ExperienceLevel;

  minimumExperienceYears: number | null;
  maximumExperienceYears: number | null;

  expiresAtUtc: string;
}

const guid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const employmentTypeValues = Object.values(EmploymentType).filter(
  (value): value is EmploymentType => typeof value === 'number',
);

const workplaceTypeValues = Object.values(WorkplaceType).filter(
  (value): value is WorkplaceType => typeof value === 'number',
);

const experienceLevelValues = Object.values(ExperienceLevel).filter(
  (value): value is ExperienceLevel => typeof value === 'number',
);

const salaryPeriodValues = Object.values(SalaryPeriod).filter(
  (value): value is SalaryPeriod => typeof value === 'number',
);

const nullableNumber = () =>
  yup
    .number()
    .nullable()
    .defined()
    .transform((value: unknown, originalValue: unknown) => {
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }

      return typeof value === 'number' && !Number.isNaN(value)
        ? value
        : null;
    });

const hasSalary = (
  minimumSalary: number | null | undefined,
  maximumSalary: number | null | undefined,
): boolean =>
  typeof minimumSalary === 'number' || typeof maximumSalary === 'number';

export const adminJobSchema: yup.ObjectSchema<AdminJobFormValues> = yup.object({
  title: yup.string().trim().required('Title is required.').max(250),

  description: yup
    .string()
    .trim()
    .required('Description is required.')
    .max(16000),

  companyId: yup
    .string()
    .required('Company is required.')
    .matches(guid, 'Select a valid company.'),

  categoryId: yup
    .string()
    .required('Category is required.')
    .matches(guid, 'Select a valid category.'),

  applicationUrl: yup
    .string()
    .trim()
    .required('Application URL is required.')
    .max(2048)
    .test(
      'http-url',
      'Enter an absolute HTTP or HTTPS URL.',
      isHttpUrl,
    ),

  responsibilities: yup.string().defined().trim().max(8000),

  requirements: yup.string().defined().trim().max(8000),

  benefits: yup.string().defined().trim().max(4000),

  location: yup.string().defined().trim().max(250),

  minimumSalary: nullableNumber().min(
    0,
    'Minimum salary cannot be negative.',
  ),

  maximumSalary: nullableNumber()
    .min(0, 'Maximum salary cannot be negative.')
    .when('minimumSalary', ([minimumSalary], schema) =>
      typeof minimumSalary === 'number'
        ? schema.min(
            minimumSalary,
            'Maximum salary must be at least the minimum salary.',
          )
        : schema,
    ),

  currencyCode: yup
    .string()
    .defined()
    .trim()
    .test(
      'currency-required-with-salary',
      'Currency is required when salary is provided.',
      function validateCurrency(value) {
        const { minimumSalary, maximumSalary } = this.parent as AdminJobFormValues;

        if (!hasSalary(minimumSalary, maximumSalary)) {
          return !value || /^[A-Za-z]{3}$/.test(value);
        }

        return Boolean(value && /^[A-Za-z]{3}$/.test(value));
      },
    )
    .test(
      'currency-format',
      'Use a three-letter currency code.',
      (value) => !value || /^[A-Za-z]{3}$/.test(value),
    ),

  salaryPeriod: yup
    .mixed<SalaryPeriod>()
    .nullable()
    .defined()
    .oneOf([...salaryPeriodValues, null])
    .test(
      'salary-period-required-with-salary',
      'Salary period is required when salary is provided.',
      function validateSalaryPeriod(value) {
        const { minimumSalary, maximumSalary } = this.parent as AdminJobFormValues;

        if (!hasSalary(minimumSalary, maximumSalary)) {
          return true;
        }

        return value !== null && value !== undefined;
      },
    ),

  employmentType: yup
    .mixed<EmploymentType>()
    .oneOf(employmentTypeValues)
    .required(),

  workplaceType: yup
    .mixed<WorkplaceType>()
    .oneOf(workplaceTypeValues)
    .required(),

  /**
   * Required only because the current backend Create/Update contract
   * still requires the legacy ExperienceLevel enum.
   */
  experienceLevel: yup
    .mixed<ExperienceLevel>()
    .oneOf(experienceLevelValues)
    .required(),

  minimumExperienceYears: nullableNumber()
    .integer('Minimum experience must be a whole number.')
    .min(0, 'Minimum experience cannot be negative.')
    .max(60, 'Minimum experience is too large.'),

  maximumExperienceYears: nullableNumber()
    .integer('Maximum experience must be a whole number.')
    .min(0, 'Maximum experience cannot be negative.')
    .max(60, 'Maximum experience is too large.')
    .when('minimumExperienceYears', ([minimumExperienceYears], schema) =>
      typeof minimumExperienceYears === 'number'
        ? schema.min(
            minimumExperienceYears,
            'Maximum experience must be at least the minimum experience.',
          )
        : schema,
    ),

  expiresAtUtc: yup
    .string()
    .defined()
    .test(
      'valid-future-date',
      'Closing date must be in the future.',
      (value) => {
        if (!value) {
          return true;
        }

        const date = new Date(value);

        return !Number.isNaN(date.getTime()) && date > new Date();
      },
    ),
});