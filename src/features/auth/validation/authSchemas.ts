import * as yup from 'yup';

const unicodeNameCharacter = /[\p{L}\p{M}]/u;
const normalizedFullNamePattern = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
const indianMobilePattern = /^[6-9]\d{9}$/;

export const sanitizeFullNameInput = (value: string): string => {
  const normalized = value.normalize('NFC');
  const lettersAndSpaces = Array.from(normalized)
    .filter((character) => character === ' ' || unicodeNameCharacter.test(character))
    .join('');

  return lettersAndSpaces.replace(/ +/g, ' ').trimStart().slice(0, 201);
};

export const sanitizeIndianMobileInput = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
};

export const isValidIndianMobile = (value: string): boolean =>
  indianMobilePattern.test(value) &&
  !/^(\d)\1{9}$/.test(value) &&
  value.slice(0, 5) !== value.slice(5);

export const maskIndianMobile = (value: string): string => {
  const digits = sanitizeIndianMobileInput(value);
  return digits.length === 10 ? `+91 ••••••${digits.slice(-4)}` : '+91 mobile number';
};

export const passwordSchema = yup
  .string()
  .required('Password is required.')
  .min(6, 'Password must be at least 6 characters.')
  .max(128, 'Password must be no more than 128 characters.');

const mobileSchema = yup
  .string()
  .required('Mobile number is required.')
  .test('indian-mobile', 'Enter a valid 10-digit Indian mobile number.', (value) =>
    value ? isValidIndianMobile(value) : false,
  );

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .trim()
    .required('Email address or mobile number is required.')
    .max(256, 'Email address or mobile number is too long.')
    .test(
      'email-or-mobile',
      'Enter a valid email address or 10-digit Indian mobile number.',
      (value) => {
        if (!value) return false;
        if (isValidIndianMobile(value)) return true;
        return yup.string().email().isValidSync(value);
      },
    ),
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
    .max(201, 'Full name must be no more than 201 characters.')
    .matches(normalizedFullNamePattern, 'Use letters and single spaces only for your full name.')
    .test('name-parts', 'Each name part must be no more than 100 characters.', (value) => {
      if (!value) return false;
      const [firstName = '', ...remaining] = value.split(' ');
      return firstName.length <= 100 && remaining.join(' ').length <= 100;
    }),
  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.')
    .max(256, 'Email address must be no more than 256 characters.'),
  password: passwordSchema,
  phoneNumber: mobileSchema,
  termsAccepted: yup
    .boolean()
    .required()
    .oneOf([true], 'You must accept the Terms of Use and Privacy Policy.'),
});

export const mobileNumberSchema = yup.object({ phoneNumber: mobileSchema });

export const otpSchema = yup.object({
  otp: yup
    .string()
    .required('Enter the six-digit OTP.')
    .matches(/^\d{6}$/, 'Enter the complete six-digit OTP.'),
});

export const requestPasswordResetSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.'),
});

export const completePasswordResetSchema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required.')
    .min(6, 'Password must be at least 6 characters.'),
  confirmPassword: yup
    .string()
    .required('Confirm your new password.')
    .oneOf([yup.ref('newPassword')], 'Passwords must match.'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegistrationFormValues = yup.InferType<typeof registrationSchema>;
export type MobileNumberFormValues = yup.InferType<typeof mobileNumberSchema>;
export type OtpFormValues = yup.InferType<typeof otpSchema>;
export type RequestPasswordResetFormValues = yup.InferType<typeof requestPasswordResetSchema>;
export type CompletePasswordResetFormValues = yup.InferType<typeof completePasswordResetSchema>;
