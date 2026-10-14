import * as yup from 'yup';
import { AtsType, type SaveJobSourceRequest } from '../types/jobSourceModels';

export const jobSourceSchema: yup.ObjectSchema<SaveJobSourceRequest> = yup.object({
  companyId: yup.string().required('Select a company.'),

  careerPageUrl: yup
    .string()
    .trim()
    .required('Enter a career page URL.')
    .max(2048)
    .test(
      'http-url',
      'Enter an absolute HTTP or HTTPS URL without credentials.',
      (value) => {
        try {
          const url = new URL(value ?? '');

          return (
            ['http:', 'https:'].includes(url.protocol) &&
            !url.username &&
            !url.password
          );
        } catch {
          return false;
        }
      },
    ),

  atsType: yup
    .mixed<AtsType>()
    .oneOf([
      AtsType.Custom,
      AtsType.Greenhouse,
      AtsType.Lever,
      AtsType.Ashby,
      AtsType.SuccessFactors,
      AtsType.Workday,
    ])
    .required(),

  atsIdentifier: yup
    .string()
    .nullable()
    .defined()
    .trim()
    .max(255)
    .when('atsType', {
      is: (type: AtsType) => type !== AtsType.Custom,
      then: (schema) =>
        schema.required('Enter the ATS identifier.'),
    }),

  isActive: yup.boolean().required(),
  autoPublishEnabled: yup.boolean().required(),

  scanIntervalMinutes: yup
    .number()
    .typeError('Enter a scan interval.')
    .integer()
    .min(1)
    .max(10080)
    .required(),
});