import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getAuthenticationErrorMessage } from '../services/authErrorMapper';
import { authService } from '../services/authService';
import {
  resendVerificationSchema,
  type ResendVerificationFormValues,
} from '../validation/authSchemas';

const RESEND_SUCCESS_MESSAGE =
  'If an unverified account exists, a verification email will be sent.';

interface ResendVerificationActionProps {
  email?: string;
}

export const ResendVerificationAction = ({ email }: ResendVerificationActionProps) => {
  const normalizedEmail = email?.trim();
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: 'error' | 'success';
  } | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<ResendVerificationFormValues>({
    defaultValues: { email: normalizedEmail ?? '' },
    mode: 'onTouched',
    resolver: yupResolver(resendVerificationSchema),
  });

  const resend = async (values: ResendVerificationFormValues) => {
    setFeedback(null);
    try {
      await authService.resendVerification({ email: values.email.trim() });
      setFeedback({ message: RESEND_SUCCESS_MESSAGE, severity: 'success' });
    } catch (error: unknown) {
      setFeedback({
        message: getAuthenticationErrorMessage(error),
        severity: 'error',
      });
    }
  };

  return (
    <Stack
      component="form"
      noValidate
      onSubmit={(event) => {
        void handleSubmit(resend, () => setFocus('email'))(event);
      }}
      spacing={2}
    >
      {!normalizedEmail ? (
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
      ) : null}

      <Button disabled={isSubmitting} type="submit" variant="outlined">
        {isSubmitting ? 'Sending verification email…' : 'Resend verification email'}
      </Button>

      {feedback ? (
        <Alert
          aria-live={feedback.severity === 'error' ? 'assertive' : 'polite'}
          severity={feedback.severity}
        >
          {feedback.message}
        </Alert>
      ) : null}
    </Stack>
  );
};
