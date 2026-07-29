import * as yup from 'yup';

export interface AdminCompanyFormValues {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  industry: string;
  location: string;
  employeeCount: number | null;
  isVerified: boolean;
}

export interface AdminCategoryFormValues {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  parentCategoryId: string;
}

const optionalHttpUrl = yup
  .string()
  .defined()
  .trim()
  .max(2048)
  .test('optional-http-url', 'Enter an absolute HTTP or HTTPS URL.', (value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  });

export const adminCompanySchema: yup.ObjectSchema<AdminCompanyFormValues> = yup.object({
  name: yup.string().defined().trim().required('Company name is required.').max(200),
  slug: yup.string().defined().trim().max(220),
  description: yup.string().defined().trim().max(4000),
  websiteUrl: optionalHttpUrl,
  logoUrl: optionalHttpUrl,
  industry: yup.string().defined().trim().max(150),
  location: yup.string().defined().trim().max(250),
  employeeCount: yup
    .number()
    .nullable()
    .defined()
    .transform((value: unknown, originalValue: unknown) =>
      originalValue === '' ? null : typeof value === 'number' ? value : null,
    )
    .integer('Employee count must be a whole number.')
    .min(0, 'Employee count cannot be negative.'),
  isVerified: yup.boolean().defined(),
});

export const adminCategorySchema: yup.ObjectSchema<AdminCategoryFormValues> = yup.object({
  name: yup.string().defined().trim().required('Category name is required.').max(150),
  slug: yup.string().defined().trim().max(170),
  description: yup.string().defined().trim().max(1000),
  displayOrder: yup
    .number()
    .defined()
    .integer('Display order must be a whole number.')
    .min(0, 'Display order cannot be negative.'),
  parentCategoryId: yup.string().defined(),
});
