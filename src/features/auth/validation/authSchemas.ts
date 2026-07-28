import * as yup from 'yup';

const passwordRules = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  specialCharacter: /[^a-zA-Z0-9]/,
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
    .max(100, 'First name must be no more than 100 characters.'),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required.')
    .max(100, 'Last name must be no more than 100 characters.'),
  email: yup
    .string()
    .trim()
    .required('Email address is required.')
    .email('Enter a valid email address.')
    .max(256, 'Email address must be no more than 256 characters.'),
  phoneNumber: yup
    .string()
    .trim()
    .max(32, 'Mobile number must be no more than 32 characters.')
    .matches(/^\+?[0-9 ()-]{7,32}$/, {
      excludeEmptyString: true,
      message: 'Enter a valid mobile number.',
    }),
  password: passwordSchema,
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
export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;
