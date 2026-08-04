import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { register as registerAccount } from '@/features/auth/store/authSlice';
import {
  normalizeIndianMobileNumber,
  registrationSchema,
  splitFullName,
  type RegistrationFormValues,
} from '@/features/auth/validation/authSchemas';
import { useAppDispatch } from '@/hooks/reduxHooks';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<RegistrationFormValues>({
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      phoneNumber: '',
      termsAccepted: false,
    },
    mode: 'onTouched',
    resolver: yupResolver(registrationSchema),
  });

  const submitRegistration = async (values: RegistrationFormValues) => {
    setServerError(null);
    setHasValidationErrors(false);

    const normalizedMobile = normalizeIndianMobileNumber(values.phoneNumber);
    const names = splitFullName(values.fullName);

    if (!normalizedMobile || !names) {
      setHasValidationErrors(true);
      return;
    }

    try {
      await dispatch(
        registerAccount({
          email: values.email.trim(),
          firstName: names.firstName,
          hasAcceptedTermsAndPrivacy: values.termsAccepted,
          // lastName: names.lastName,
          password: values.password,
          phoneNumber: normalizedMobile,
        }),
      ).unwrap();

      // ✅ 1. Store the email to show on screen
      setRegisteredEmail(values.email.trim());

      // ✅ 2. Show a success popup/toast on the same page
      enqueueSnackbar('Account created successfully! Redirecting to login...', { 
        variant: 'success',
        autoHideDuration: 3000, // Wait 3 seconds before closing the snackbar automatically
      });

      // ✅ 3. Wait 3 seconds, then redirect to Login page
      setTimeout(() => {
        void navigate(ROUTES.LOGIN, { replace: true });
      }, 3000);

    } catch (error: unknown) {
      setServerError(
        typeof error === 'string' ? error : 'Unable to create your account. Please try again.',
      );
    }
  };

  // If registration is successful, show the message on the SAME page,
  // instead of redirecting to a different email verification page.
  if (registeredEmail) {
    return (
      <Stack spacing={3}>
        <AuthPageHeader
          description="Verify your email address before signing in and completing your profile."
          title="Check your email"
        />

        <Alert aria-live="polite" severity="success">
          Account created successfully! 
          We've sent a verification link to <strong>{registeredEmail}</strong>.
        </Alert>

        <Typography color="text.secondary" textAlign="center">
          Already verified?{' '}
          <MuiLink component={Link} to={ROUTES.LOGIN}>
            Log in
          </MuiLink>
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Create a profile for internships, fresher roles, and experienced opportunities."
        title="Create your account"
      />

      <Box
        component="aside"
        sx={{
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
        }}
      >
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          One account helps you
        </Typography>

        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {[
            'Find verified internships and jobs',
            'Apply with one saved profile',
            'Track your applications',
          ].map((benefit) => (
            <Stack alignItems="center" component="li" direction="row" key={benefit} spacing={1}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
              <Typography variant="body2">{benefit}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {hasValidationErrors ? (
        <Alert aria-live="assertive" severity="error">
          Please correct the highlighted fields before creating your account.
        </Alert>
      ) : null}

      {serverError ? (
        <Alert aria-live="assertive" severity="error">
          {serverError}
        </Alert>
      ) : null}

      <Stack
        component="form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submitRegistration, (formErrors) => {
            setHasValidationErrors(true);

            const firstField = Object.keys(formErrors)[0] as
              | keyof RegistrationFormValues
              | undefined;

            if (firstField) {
              setFocus(firstField);
            }
          })(event);
        }}
        spacing={2.5}
      >
        <TextField
          autoComplete="name"
          disabled={isSubmitting}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName?.message}
          label="Full name"
          placeholder="Enter your full name"
          required
          {...register('fullName')}
        />

        <TextField
          autoComplete="email"
          disabled={isSubmitting}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          label="Email address"
          placeholder="Enter your email ID"
          required
          type="email"
          {...register('email')}
        />

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <TextField
              autoComplete="tel"
              disabled={isSubmitting}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
              label="Mobile number"
              placeholder="Enter 10-digit mobile number"
              required
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  maxLength: 10,
                  pattern: '[0-9]*',
                },
              }}
              type="tel"
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                field.onChange(event.target.value.replace(/\D/g, '').slice(0, 10));
              }}
              inputRef={field.ref}
            />
          )}
        />

        <PasswordField
          autoComplete="new-password"
          disabled={isSubmitting}
          errorMessage={errors.password?.message}
          helperText="Use at least 12 characters with uppercase, lowercase, number, and symbol."
          label="Password"
          placeholder="Minimum 12 characters"
          registration={register('password')}
        />

        <Controller
          control={control}
          name="termsAccepted"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  disabled={isSubmitting}
                  inputRef={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(_, checked) => field.onChange(checked)}
                  required
                />
              }
              label="I accept the Terms of Use and Privacy Policy."
            />
          )}
        />

        {errors.termsAccepted ? (
          <FormHelperText error>{errors.termsAccepted.message}</FormHelperText>
        ) : null}

        <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </Stack>

      <Typography color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <MuiLink component={Link} to={ROUTES.LOGIN}>
          Log in
        </MuiLink>
      </Typography>
    </Stack>
  );
};