import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
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
  const locationState = location.state as LoginLocationState | null;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<LoginFormValues>({
    defaultValues: { identifier: '', password: '' },
    mode: 'onTouched',
    resolver: yupResolver(loginSchema),
  });

  const submitLogin = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await dispatch(
        login({ identifier: values.identifier.trim(), password: values.password }),
      ).unwrap();
      const requestedPath = getSafeRedirectPath(locationState?.from);
      const defaultPath =
        response.user.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;

      enqueueSnackbar('Welcome back.', { variant: 'success' });
      await navigate(requestedPath ?? defaultPath, { replace: true });
    } catch (error: unknown) {
      setServerError(typeof error === 'string' ? error : 'Unable to log in. Please try again.');
    }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Use your email address or Indian mobile number and password."
        title="Welcome back"
      />

      {locationState?.message ? <Alert severity="success">{locationState.message}</Alert> : null}
      {serverError ? (
        <Alert aria-live="assertive" severity="error">
          {serverError}
        </Alert>
      ) : null}

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
          autoComplete="username"
          disabled={isSubmitting}
          error={Boolean(errors.identifier)}
          helperText={errors.identifier?.message}
          label="Email address or mobile number"
          required
          {...register('identifier')}
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

      {/* 
        Removed the Divider and OTP button as requested for production.
        A small spacer is added below to maintain clean layout.
      */}
      <Box sx={{ height: 8 }} />

      <Typography color="text.secondary" textAlign="center">
        New to Career Portal?{' '}
        <MuiLink component={Link} to={ROUTES.REGISTER}>
          Create an account
        </MuiLink>
      </Typography>
    </Stack>
  );
};