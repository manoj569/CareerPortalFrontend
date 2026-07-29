import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { ResendVerificationAction } from '@/features/auth/components/ResendVerificationAction';
import { EMAIL_NOT_VERIFIED_MESSAGE } from '@/features/auth/services/authErrorMapper';
import { login } from '@/features/auth/store/authSlice';
import { getSafeRedirectPath } from '@/features/auth/utils/safeRedirect';
import { loginSchema, type LoginFormValues } from '@/features/auth/validation/authSchemas';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

interface LoginLocationState {
  from?: unknown;
  message?: string;
}

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const locationState = location.state as LoginLocationState | null;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    resolver: yupResolver(loginSchema),
  });

  const submitLogin = async (values: LoginFormValues) => {
    setServerError(null);
    setUnverifiedEmail(null);
    try {
      const response = await dispatch(login(values)).unwrap();
      const requestedPath = getSafeRedirectPath(locationState?.from);
      const defaultPath =
        response.user.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;

      enqueueSnackbar('Welcome back.', { variant: 'success' });
      await navigate(requestedPath ?? defaultPath, { replace: true });
    } catch (error: unknown) {
      const message = typeof error === 'string' ? error : 'Unable to log in. Please try again.';
      setServerError(message);
      if (message === EMAIL_NOT_VERIFIED_MESSAGE) {
        setUnverifiedEmail(values.email.trim());
      }
    }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Use the email address and password associated with your account."
        title="Welcome back"
      />

      {locationState?.message ? <Alert severity="success">{locationState.message}</Alert> : null}
      {serverError ? (
        <Alert aria-live="assertive" severity="error">
          {serverError}
        </Alert>
      ) : null}
      {unverifiedEmail ? <ResendVerificationAction email={unverifiedEmail} /> : null}

      <Stack
        component="form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submitLogin, (formErrors) => {
            const firstField = Object.keys(formErrors)[0] as keyof LoginFormValues | undefined;
            if (firstField) setFocus(firstField);
          })(event);
        }}
        spacing={2.5}
      >
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
        <PasswordField
          autoComplete="current-password"
          disabled={isSubmitting}
          errorMessage={errors.password?.message}
          label="Password"
          registration={register('password')}
        />
        <MuiLink alignSelf="flex-start" component={Link} to={ROUTES.FORGOT_PASSWORD}>
          Forgot password?
        </MuiLink>
        <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </Stack>

      <Typography color="text.secondary" textAlign="center">
        New to Career Portal?{' '}
        <MuiLink component={Link} to={ROUTES.REGISTER}>
          Create an account
        </MuiLink>
      </Typography>
    </Stack>
  );
};
