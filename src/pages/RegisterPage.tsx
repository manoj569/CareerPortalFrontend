import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { ResendVerificationAction } from '@/features/auth/components/ResendVerificationAction';
import { register as registerAccount } from '@/features/auth/store/authSlice';
import {
  normalizeIndianMobileNumber,
  registrationSchema,
  type RegistrationFormValues,
} from '@/features/auth/validation/authSchemas';
import { useAppDispatch } from '@/hooks/reduxHooks';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
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
      confirmPassword: '',
      email: '',
      firstName: '',
      lastName: '',
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
    if (!normalizedMobile) {
      setHasValidationErrors(true);
      return;
    }
    try {
      await dispatch(
        registerAccount({
          email: values.email.trim(),
          firstName: values.firstName.trim(),
          hasAcceptedTermsAndPrivacy: values.termsAccepted,
          lastName: values.lastName.trim(),
          password: values.password,
          phoneNumber: normalizedMobile,
        }),
      ).unwrap();
      setRegisteredEmail(values.email.trim());
    } catch (error: unknown) {
      setServerError(
        typeof error === 'string' ? error : 'Unable to create your account. Please try again.',
      );
    }
  };

  if (registeredEmail) {
    return (
      <Stack spacing={3}>
        <AuthPageHeader
          description="Your account is registered, but it cannot be used until the email address is verified."
          title="Check your email"
        />
        <Alert aria-live="polite" severity="success">
          Check your email to verify your account.
        </Alert>
        <ResendVerificationAction email={registeredEmail} />
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
        description="A simple profile for internships, fresher roles, and experienced opportunities."
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
              keyof RegistrationFormValues | undefined;
            if (firstField) setFocus(firstField);
          })(event);
        }}
        spacing={2.5}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              autoComplete="given-name"
              disabled={isSubmitting}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
              label="First name"
              required
              {...register('firstName')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              autoComplete="family-name"
              disabled={isSubmitting}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
              label="Last name"
              required
              {...register('lastName')}
            />
          </Grid>
        </Grid>
        <TextField
          autoComplete="email"
          disabled={isSubmitting}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          label="Email address"
          required
          type="email"
          {...register('email')}
        />
        <TextField
          autoComplete="tel"
          disabled={isSubmitting}
          error={Boolean(errors.phoneNumber)}
          helperText={errors.phoneNumber?.message ?? 'Use an Indian 10-digit mobile number.'}
          label="Indian mobile number"
          required
          type="tel"
          {...register('phoneNumber')}
        />
        <PasswordField
          autoComplete="new-password"
          disabled={isSubmitting}
          errorMessage={
            errors.password?.message ??
            'Use 12–128 characters with uppercase, lowercase, number, and symbol.'
          }
          label="Password"
          registration={register('password')}
        />
        <PasswordField
          autoComplete="new-password"
          disabled={isSubmitting}
          errorMessage={errors.confirmPassword?.message}
          label="Confirm password"
          registration={register('confirmPassword')}
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
