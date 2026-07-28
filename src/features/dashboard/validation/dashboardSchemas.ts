import * as yup from 'yup';

import { passwordSchema } from '@/features/auth/validation/authSchemas';

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string;
  headline: string;
  bio: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const isOptionalHttpUrl = (value?: string): boolean => {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const profileSchema: yup.ObjectSchema<ProfileFormValues> = yup.object({
  firstName: yup
    .string()
    .trim()
    .required('First name is required.')
    .max(100, 'First name must be no more than 100 characters.'),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required.')
    .max(100, 'Last name must be no more than 100 characters.'),
  phoneNumber: yup
    .string()
    .defined()
    .trim()
    .max(32, 'Phone number must be no more than 32 characters.')
    .matches(/^\+?[0-9 ()-]{7,32}$/, {
      excludeEmptyString: true,
      message: 'Enter a valid phone number.',
    }),
  profileImageUrl: yup
    .string()
    .defined()
    .trim()
    .max(2048, 'Image URL must be no more than 2,048 characters.')
    .test('http-url', 'Enter an absolute HTTP or HTTPS URL.', isOptionalHttpUrl),
  headline: yup.string().defined().trim().max(250, 'Headline must be no more than 250 characters.'),
  bio: yup.string().defined().trim().max(4000, 'Bio must be no more than 4,000 characters.'),
});

export const changePasswordSchema: yup.ObjectSchema<ChangePasswordFormValues> = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required.')
    .max(128, 'Password must be no more than 128 characters.'),
  newPassword: passwordSchema.notOneOf(
    [yup.ref('currentPassword')],
    'New password must differ from the current password.',
  ),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password.')
    .oneOf([yup.ref('newPassword')], 'Passwords must match.'),
});
