import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
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
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { register as registerAccount } from '@/features/auth/store/authSlice';
import {
  registrationSchema,
  type RegistrationFormValues,
} from '@/features/auth/validation/authSchemas';
import { useAppDispatch } from '@/hooks/reduxHooks';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
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
    try {
      await dispatch(
        registerAccount({
          email: values.email.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          password: values.password,
          phoneNumber: values.phoneNumber?.trim() || null,
        }),
      ).unwrap();
      enqueueSnackbar('Your account is ready.', { variant: 'success' });
      await navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error: unknown) {
      setServerError(
        typeof error === 'string' ? error : 'Unable to create your account. Please try again.',
      );
    }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Create a candidate account to save jobs and track applications."
        title="Create your account"
      />

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
          helperText={errors.phoneNumber?.message ?? 'Optional'}
          label="Mobile number"
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
