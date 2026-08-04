import * as yup from 'yup';

// const passwordRules = {
//   uppercase: /[A-Z]/,
//   lowercase: /[a-z]/,
//   number: /[0-9]/,
//   specialCharacter: /[^a-zA-Z0-9]/,
// };


const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 31 || (codePoint >= 127 && codePoint <= 159);
  });

export const normalizeIndianMobileNumber = (value: string): string | null => {
  const input = value.trim();

  if (
    !input ||
    hasControlCharacters(input) ||
    /[^+\d ()-]/.test(input) ||
    (input.match(/\+/g)?.length ?? 0) > 1 ||
    (input.includes('+') && !input.startsWith('+'))
  ) {
    return null;
  }

  const digits = input.replace(/\D/g, '');

  const nationalNumber =
    digits.length === 10
      ? digits
      : digits.length === 11 && digits.startsWith('0')
        ? digits.slice(1)
        : digits.length === 12 && digits.startsWith('91')
          ? digits.slice(2)
          : '';

  if (
    !/^[6-9]\d{9}$/.test(nationalNumber) ||
    /^(\d)\1{9}$/.test(nationalNumber)
  ) {
    return null;
  }

  return `+91${nationalNumber}`;
};

export const splitFullName = (
  value: string,
): { firstName: string; lastName: string } | null => {
  const [firstName, ...lastNameParts] = value.trim().split(/\s+/).filter(Boolean);

  if (!firstName || lastNameParts.length === 0) {
    return null;
  }

  const lastName = lastNameParts.join(' ');

  return {
    firstName,
    lastName,
  };
};

export const passwordSchema = yup
  .string()
  .required('Password is required.')
  .min(6, 'Password must be at least 6 characters.')
  .max(18, 'Password must be no more than 128 characters.');

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.')
    .max(256, 'Email address must be no more than 256 characters.'),

  password: yup
    .string()
    .required('Password is required.')
    .max(128, 'Password must be no more than 128 characters.'),
});

export const registrationSchema = yup.object({
 fullName: yup
  .string()
  .trim()
  .required('Full name is required.')
  .min(5, 'Enter your first and last name.')
  .max(201, 'Full name must be no more than 201 characters.')
  .matches(
    /^[\p{L}]+(?:\s+[\p{L}]+)+$/u,
    'Full name must contain only letters and first and last name.',
  ),

  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.')
    .max(256, 'Email address must be no more than 256 characters.'),

  phoneNumber: yup
    .string()
    .trim()
    .required('Mobile number is required.')
    .test(

      'Enter a valid 10-digit mobile number.',
      (value) => !value || normalizeIndianMobileNumber(value) !== null,
    ),

  password: passwordSchema.test(
    'personal-data',
    'Password must not contain your name, email name, or mobile number.',
    function (value) {
      if (!value) {
        return true;
      }

      const values = this.parent as {
        email?: string;
        fullName?: string;
        phoneNumber?: string;
      };

      const names = splitFullName(values.fullName ?? '');
      const normalizedMobile = normalizeIndianMobileNumber(values.phoneNumber ?? '') ?? '';

      const personalValues = [
        values.email?.trim().split('@', 1)[0] ?? '',
        names?.firstName ?? '',
        names?.lastName ?? '',
        normalizedMobile,
        normalizedMobile.replace(/^\+/, ''),
        normalizedMobile.slice(-10),
      ].filter(Boolean);

      return personalValues.every(
        (personalValue) => !value.toLowerCase().includes(personalValue.toLowerCase()),
      );
    },
  ),

  termsAccepted: yup
    .boolean()
    .required()
    .oneOf([true], 'You must accept the Terms of Use and Privacy Policy.'),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.')
    .max(256, 'Email address must be no more than 256 characters.'),
});

export const resendVerificationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.')
    .max(256, 'Email address must be no more than 256 characters.'),
});

export const resetPasswordSchema = yup.object({
  newPassword: passwordSchema,

  confirmPassword: yup
    .string()
    .required('Please confirm your password.')
    .oneOf([yup.ref('newPassword')], 'Passwords must match.'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegistrationFormValues = yup.InferType<typeof registrationSchema>;
export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;
export type ResendVerificationFormValues = yup.InferType<typeof resendVerificationSchema>;
export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;