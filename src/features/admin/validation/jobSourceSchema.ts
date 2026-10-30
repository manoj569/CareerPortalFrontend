import * as yup from 'yup';
import { AtsType, type SaveJobSourceRequest } from '../types/jobSourceModels';
import { sourceConfigurationError } from './jobSourceConfiguration';

export const jobSourceSchema: yup.ObjectSchema<SaveJobSourceRequest> = yup.object({
  companyId: yup.string().required('Select a company.'),

  careerPageUrl: yup
    .string()
    .trim()
    .required('Enter a career page URL.')
    .max(2048)
    .test('http-url', 'Enter an absolute HTTP or HTTPS URL without credentials.', (value) => {
      try {
        const url = new URL(value ?? '');

        return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
      } catch {
        return false;
      }
    })
    .test('ripplehire-url', function (value) {
      const request = this.parent as SaveJobSourceRequest;
      if (request.atsType !== AtsType.RippleHire) return true;
      const message = sourceConfigurationError(request.atsType, value ?? '', null);
      return message ? this.createError({ message }) : true;
    }),

  atsType: yup
    .mixed<AtsType>()
    .oneOf([
      AtsType.Custom,
      AtsType.Greenhouse,
      AtsType.Lever,
      AtsType.Ashby,
      AtsType.SuccessFactors,
      AtsType.Workday,
      AtsType.SmartRecruiters,
      AtsType.RippleHire,
    ])
    .required(),

  atsIdentifier: yup
    .string()
    .nullable()
    .defined()
    .trim()
    .max(255)
    .test('provider-configuration', function (identifier) {
      const request = this.parent as SaveJobSourceRequest;
      // RippleHire URL errors belong to Career Page URL, even with a blank identifier.
      // Only check identifier equality after the URL passes its own validation.
      if (request.atsType === AtsType.RippleHire &&
          sourceConfigurationError(request.atsType, request.careerPageUrl, null)) return true;
      const message = sourceConfigurationError(
        request.atsType,
        request.careerPageUrl,
        request.atsType === AtsType.SmartRecruiters && typeof this.originalValue === 'string'
          ? this.originalValue
          : identifier ?? null,
      );
      return message ? this.createError({ message }) : true;
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
