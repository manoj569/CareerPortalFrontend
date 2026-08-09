import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link as MuiLink, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { getAuthenticationErrorMessage } from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import {
  completePasswordResetSchema,
  type CompletePasswordResetFormValues,
} from '@/features/auth/validation/authSchemas';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const ResetPasswordPage = () => {
  useDocumentMetadata(
    'Choose a new password | Career Portal',
    'Choose a new password for your Career Portal account.',
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const hasResetLink = token.length > 0;
  const [isComplete, setIsComplete] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
  } = useForm<CompletePasswordResetFormValues>({
    defaultValues: { confirmPassword: '', newPassword: '' },
    mode: 'onTouched',
    resolver: yupResolver(completePasswordResetSchema),
  });

  useEffect(() => {
    if (!isComplete) return;
    const timeoutId = window.setTimeout(() => {
      void navigate(ROUTES.LOGIN, {
        replace: true,
        state: { message: 'Password changed successfully. Please log in.' },
      });
    }, 5_000);

    return () => window.clearTimeout(timeoutId);
  }, [isComplete, navigate]);

  const completeReset = async (values: CompletePasswordResetFormValues) => {
    if (!hasResetLink) return;
    setServerError(null);
    try {
      await authService.completePasswordReset({
        newPassword: values.newPassword,
        token,
      });
      reset();
      setIsComplete(true);
    } catch (error: unknown) {
      const hasFieldError = applyApiValidationErrors(
        error,
        ['newPassword', 'confirmPassword'] as const,
        setError,
      );
      if (!hasFieldError) setServerError(getAuthenticationErrorMessage(error));
    }
  };

  if (!hasResetLink) {
    return (
      <Stack spacing={3}>
        <AuthPageHeader
          description="This password reset link is invalid or incomplete. Request a new link."
          title="Reset link unavailable"
        />
        <Alert aria-live="assertive" severity="error">
          This password reset link is invalid or incomplete. Request a new link.
        </Alert>
        <Button component={Link} to={ROUTES.FORGOT_PASSWORD} variant="contained">
          Request a new link
        </Button>
      </Stack>
    );
  }

  if (isComplete) {
    return (
      <Alert
        aria-live="polite"
        icon={<CheckCircleIcon fontSize="large" />}
        severity="success"
        sx={{ alignItems: 'center', py: 3 }}
      >
        <Typography component="h1" fontWeight={700} variant="h5">
          Password changed successfully. Redirecting you to login…
        </Typography>
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Enter and confirm the new password for your account."
        title="Choose a new password"
      />

      {serverError ? (
        <Alert aria-live="assertive" severity="error">
          {serverError}
        </Alert>
      ) : null}

      <Stack
        component="form"
        noValidate
        onSubmit={(event) =>
          void handleSubmit(completeReset, (formErrors) => {
            const firstField = Object.keys(formErrors)[0] as
              keyof CompletePasswordResetFormValues | undefined;
            if (firstField) setFocus(firstField);
          })(event)
        }
        spacing={2.5}
      >
        <PasswordField
          autoComplete="new-password"
          disabled={isSubmitting}
          errorMessage={errors.newPassword?.message}
          label="New password"
          placeholder="Minimum 6 characters"
          registration={register('newPassword')}
        />
        <PasswordField
          autoComplete="new-password"
          disabled={isSubmitting}
          errorMessage={errors.confirmPassword?.message}
          label="Confirm password"
          registration={register('confirmPassword')}
        />
        <Button disabled={isSubmitting} type="submit" variant="contained">
          {isSubmitting ? 'Changing password…' : 'Change password'}
        </Button>
      </Stack>

      <MuiLink alignSelf="center" component={Link} to={ROUTES.LOGIN}>
        Back to login
      </MuiLink>
    </Stack>
  );
};
