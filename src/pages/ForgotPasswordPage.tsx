import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link as MuiLink, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { getAuthenticationErrorMessage } from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/validation/authSchemas';

const privacySafeMessage =
  'If an active account matches that email address, password reset instructions will be sent shortly.';

export const ForgotPasswordPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
    mode: 'onTouched',
    resolver: yupResolver(forgotPasswordSchema),
  });

  const submitRequest = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await authService.forgotPassword({ email: values.email.trim() });
      setIsComplete(true);
    } catch (error: unknown) {
      setServerError(getAuthenticationErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Enter your account email and we’ll send reset instructions when it matches an active account."
        title="Reset your password"
      />

      {isComplete ? (
        <Alert aria-live="polite" severity="success">
          {privacySafeMessage}
        </Alert>
      ) : (
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            void handleSubmit(submitRequest, () => setFocus('email'))(event);
          }}
          spacing={2.5}
        >
          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}
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
          <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
            {isSubmitting ? 'Sending instructions…' : 'Send reset instructions'}
          </Button>
        </Stack>
      )}

      <MuiLink alignSelf="center" component={Link} to={ROUTES.LOGIN}>
        Back to login
      </MuiLink>
    </Stack>
  );
};
