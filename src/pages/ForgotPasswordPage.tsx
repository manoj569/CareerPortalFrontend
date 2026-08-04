import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link as MuiLink, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { getAuthenticationErrorMessage } from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import {
  requestPasswordResetSchema,
  type RequestPasswordResetFormValues,
} from '@/features/auth/validation/authSchemas';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PRIVACY_SAFE_SUCCESS_MESSAGE =
  'If an account exists for this email address, we have sent a password reset link.';

export const ForgotPasswordPage = () => {
  useDocumentMetadata(
    'Forgot password | Career Portal',
    'Request a secure email link to reset your Career Portal password.',
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm<RequestPasswordResetFormValues>({
    defaultValues: { email: '' },
    mode: 'onTouched',
    resolver: yupResolver(requestPasswordResetSchema),
  });

  const requestResetLink = async (values: RequestPasswordResetFormValues) => {
    setServerError(null);
    try {
      await authService.requestPasswordReset({ email: values.email.trim() });
      setIsComplete(true);
    } catch (error: unknown) {
      const hasFieldError = applyApiValidationErrors(error, ['email'] as const, setError);
      if (!hasFieldError) setServerError(getAuthenticationErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Enter the email address associated with your account."
        title="Reset your password"
      />

      {serverError ? (
        <Alert aria-live="assertive" severity="error">
          {serverError}
        </Alert>
      ) : null}
      {isComplete ? (
        <Alert aria-live="polite" severity="success">
          {PRIVACY_SAFE_SUCCESS_MESSAGE}
        </Alert>
      ) : (
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => void handleSubmit(requestResetLink, () => setFocus('email'))(event)}
          spacing={2.5}
        >
          <TextField
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            label="Email address"
            required
            type="email"
            {...register('email')}
          />
          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </Stack>
      )}

      <MuiLink alignSelf="center" component={Link} to={ROUTES.LOGIN}>
        Back to login
      </MuiLink>
    </Stack>
  );
};
