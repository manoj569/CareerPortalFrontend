import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link as MuiLink, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { getAuthenticationErrorMessage } from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/validation/authSchemas';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const token = searchParams.get('token')?.trim() ?? '';
  const hasValidLinkParameters = Boolean(email && token);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { confirmPassword: '', newPassword: '' },
    mode: 'onTouched',
    resolver: yupResolver(resetPasswordSchema),
  });

  const submitReset = async (values: ResetPasswordFormValues) => {
    if (!hasValidLinkParameters) return;
    setServerError(null);

    try {
      await authService.resetPassword({ email, newPassword: values.newPassword, token });
      enqueueSnackbar('Your password has been reset.', { variant: 'success' });
      await navigate(ROUTES.LOGIN, {
        replace: true,
        state: { message: 'Your password has been reset. You can now log in.' },
      });
    } catch (error: unknown) {
      setServerError(getAuthenticationErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Choose a strong new password for your Career Portal account."
        title="Create a new password"
      />

      {!hasValidLinkParameters ? (
        <Alert aria-live="assertive" severity="error">
          This password reset link is incomplete or invalid. Request a new link to continue.
        </Alert>
      ) : (
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            void handleSubmit(submitReset, (formErrors) => {
              const firstField = Object.keys(formErrors)[0] as
                keyof ResetPasswordFormValues | undefined;
              if (firstField) setFocus(firstField);
            })(event);
          }}
          spacing={2.5}
        >
          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}
          <PasswordField
            autoComplete="new-password"
            disabled={isSubmitting}
            errorMessage={
              errors.newPassword?.message ??
              'Use 12–128 characters with uppercase, lowercase, number, and symbol.'
            }
            label="New password"
            registration={register('newPassword')}
          />
          <PasswordField
            autoComplete="new-password"
            disabled={isSubmitting}
            errorMessage={errors.confirmPassword?.message}
            label="Confirm new password"
            registration={register('confirmPassword')}
          />
          <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
            {isSubmitting ? 'Resetting password…' : 'Reset password'}
          </Button>
        </Stack>
      )}

      <MuiLink alignSelf="center" component={Link} to={ROUTES.LOGIN}>
        Back to login
      </MuiLink>
    </Stack>
  );
};
