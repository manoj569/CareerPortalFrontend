import * as yup from 'yup';

const passwordRules = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  specialCharacter: /[^a-zA-Z0-9]/,
};

const safeName = /\p{L}/u;
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
    (input.includes('+') && !input.startsWith('+')) ||
    input.includes('--') ||
    (input.match(/\(/g)?.length ?? 0) > 1 ||
    (input.match(/\)/g)?.length ?? 0) > 1 ||
    (input.match(/\(/g)?.length ?? 0) !== (input.match(/\)/g)?.length ?? 0) ||
    (input.includes('(') && input.indexOf('(') > input.indexOf(')'))
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
    /^(\d)\1{9}$/.test(nationalNumber) ||
    nationalNumber.slice(0, 5) === nationalNumber.slice(5)
  ) {
    return null;
  }

  return `+91${nationalNumber}`;
};

export const passwordSchema = yup
  .string()
  .required('Password is required.')
  .min(12, 'Password must be at least 12 characters.')
  .max(128, 'Password must be no more than 128 characters.')
  .matches(passwordRules.uppercase, 'Password must contain an uppercase letter.')
  .matches(passwordRules.lowercase, 'Password must contain a lowercase letter.')
  .matches(passwordRules.number, 'Password must contain a number.')
  .matches(passwordRules.specialCharacter, 'Password must contain a special character.');

export const loginSchema = yup.object({
  email: yup.string().required('Email address is required.').email('Enter a valid email address.'),
  password: yup
    .string()
    .required('Password is required.')
    .max(128, 'Password must be no more than 128 characters.'),
});

export const registrationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required('First name is required.')
    .min(2, 'First name must be at least 2 characters.')
    .max(100, 'First name must be no more than 100 characters.')
    .test(
      'safe-name',
      'First name must contain a letter and no control characters.',
      (value) => !value || (safeName.test(value) && !hasControlCharacters(value)),
    ),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required.')
    .min(2, 'Last name must be at least 2 characters.')
    .max(100, 'Last name must be no more than 100 characters.')
    .test(
      'safe-name',
      'Last name must contain a letter and no control characters.',
      (value) => !value || (safeName.test(value) && !hasControlCharacters(value)),
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
    .required('Indian mobile number is required.')
    .max(32, 'Mobile number must be no more than 32 characters.')
    .test(
      'indian-mobile',
      'Enter a valid 10-digit Indian mobile number.',
      (value) => !value || normalizeIndianMobileNumber(value) !== null,
    ),
  password: passwordSchema.test(
    'personal-data',
    'Password must not contain your name, email name, or mobile number.',
    function (value) {
      if (!value) return true;
      const values = this.parent as {
        email?: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
      };
      const normalizedMobile = normalizeIndianMobileNumber(values.phoneNumber ?? '') ?? '';
      const personalValues = [
        values.email?.trim().split('@', 1)[0] ?? '',
        values.firstName?.trim() ?? '',
        values.lastName?.trim() ?? '',
        normalizedMobile,
        normalizedMobile.replace(/^\+/, ''),
        normalizedMobile.slice(-10),
      ].filter(Boolean);

      return personalValues.every(
        (personalValue) => !value.toLowerCase().includes(personalValue.toLowerCase()),
      );
    },
  ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password.')
    .oneOf([yup.ref('password')], 'Passwords must match.'),
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
