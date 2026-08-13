import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { GoogleAuthenticationButton } from '@/features/auth/components/GoogleAuthenticationButton';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { getGoogleAuthenticationErrorMessage } from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import { login, sessionRefreshed } from '@/features/auth/store/authSlice';
import { getSafeRedirectLocation, getSafeRedirectPath } from '@/features/auth/utils/safeRedirect';
import { loginSchema, type LoginFormValues } from '@/features/auth/validation/authSchemas';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { UserRole } from '@/types';

interface LoginLocationState {
  from?: unknown;
  message?: string;
}

export const LoginPage = () => {
  useDocumentMetadata(
    'Log in to Your Account | Career Harbor',
    'Log in to Career Harbor to manage your profile, saved jobs, applications, resume, and personalized recommendations.',
    { canonicalPath: ROUTES.LOGIN, noIndex: false },
  );
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const locationState = location.state as LoginLocationState | null;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setFocus,
  } = useForm<LoginFormValues>({
    defaultValues: { identifier: '', password: '' },
    mode: 'onTouched',
    resolver: yupResolver(loginSchema),
  });

  // ✅ Clear the form on page load so it's always empty
  useEffect(() => {
    reset({ identifier: '', password: '' });
  }, [reset]);

  const submitLogin = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await dispatch(
        login({ identifier: values.identifier.trim(), password: values.password }),
      ).unwrap();
      const requestedPath = getSafeRedirectPath(locationState?.from);
      const defaultPath =
        response.user.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      const destination =
        response.user.role === UserRole.Candidate ? requestedPath ?? defaultPath : defaultPath;

      enqueueSnackbar('Welcome back.', { variant: 'success' });
      await navigate(destination, { replace: true });
    } catch (error: unknown) {
      setServerError(typeof error === 'string' ? error : 'Unable to log in. Please try again.');
    }
  };

  const submitGoogleLogin = async (credential: string) => {
    if (isSubmitting || isGoogleSubmitting) return;
    setServerError(null);
    setIsGoogleSubmitting(true);
    try {
      const response = await authService.googleAuthenticate({ credential, intent: 'Login', acceptTerms: false });
      dispatch(sessionRefreshed(response));
      const requestedPath = getSafeRedirectPath(locationState?.from);
      const defaultPath = response.user.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      enqueueSnackbar('Welcome back.', { variant: 'success' });
      await navigate(response.user.role === UserRole.Candidate ? requestedPath ?? defaultPath : defaultPath, { replace: true });
    } catch (error: unknown) {
      setServerError(getGoogleAuthenticationErrorMessage(error, 'Login'));
    } finally { setIsGoogleSubmitting(false); }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader description="Sign in to continue" title="Welcome back" />

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
          autoComplete="off"
          disabled={isSubmitting || isGoogleSubmitting}
          error={Boolean(errors.identifier)}
          helperText={errors.identifier?.message}
          label="Email address or mobile number"
          required
          {...register('identifier')}
        />
        <PasswordField
          autoComplete="current-password" // ✅ FIXED: Pass the required prop
          disabled={isSubmitting || isGoogleSubmitting}
          errorMessage={errors.password?.message}
          label="Password"
          registration={register('password')}
        />
        <MuiLink alignSelf="flex-end" component={Link} to={ROUTES.FORGOT_PASSWORD}>
          Forgot password?
        </MuiLink>
        <Button disabled={isSubmitting || isGoogleSubmitting} fullWidth size="large" type="submit" variant="contained">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </Stack>

      <Divider aria-label="OR">OR</Divider>
      <GoogleAuthenticationButton disabled={isSubmitting || isGoogleSubmitting} onCredential={(credential) => { void submitGoogleLogin(credential); }} />

      <Typography color="text.secondary" textAlign="center">
        New to Career Harbor?{' '}
        <MuiLink component={Link} state={getSafeRedirectLocation(locationState?.from) ? { from: getSafeRedirectLocation(locationState?.from) } : undefined} to={ROUTES.REGISTER}>
          Create an account
        </MuiLink>
      </Typography>
    </Stack>
  );
};
