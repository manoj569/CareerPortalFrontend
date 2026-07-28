import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ROUTES } from '@/constants/routes';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { logout } from '@/features/auth/store/authSlice';
import {
  isDashboardApiError,
  useChangePasswordMutation,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';

export const SettingsPage = () => {
  useDocumentMetadata(
    'Account settings | Career Portal',
    'Manage the account settings supported by the Career Portal backend.',
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [changePassword] = useChangePasswordMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { confirmPassword: '', currentPassword: '', newPassword: '' },
    mode: 'onTouched',
    resolver: yupResolver(changePasswordSchema),
  });

  const submitPassword = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      reset();
      await dispatch(logout());
      enqueueSnackbar('Password changed. Sign in again with your new password.', {
        variant: 'success',
      });
      await navigate(ROUTES.LOGIN, {
        replace: true,
        state: { message: 'Password changed successfully. Sign in with your new password.' },
      });
    } catch (error: unknown) {
      const hasFieldErrors = applyApiValidationErrors<ChangePasswordFormValues>(
        error,
        ['currentPassword', 'newPassword'],
        setError,
      );
      setServerError(
        hasFieldErrors
          ? 'Review the highlighted password fields and try again.'
          : isDashboardApiError(error)
            ? error.message
            : 'Unable to change your password. Please try again.',
      );
    }
  };

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="Manage security controls currently exposed by the backend."
        eyebrow="Account"
        title="Settings"
      />

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <LockResetOutlinedIcon color="primary" />
            <Typography component="h2" variant="h3">
              Change password
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Use 12–128 characters with uppercase, lowercase, a number, and a symbol.
          </Typography>
          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}
          <Stack
            component="form"
            maxWidth={560}
            noValidate
            onSubmit={(event) => {
              void handleSubmit(submitPassword, (formErrors) => {
                const firstField = Object.keys(formErrors)[0] as
                  keyof ChangePasswordFormValues | undefined;
                if (firstField) setFocus(firstField);
              })(event);
            }}
            spacing={2.5}
          >
            <PasswordField
              autoComplete="current-password"
              disabled={isSubmitting}
              errorMessage={errors.currentPassword?.message}
              label="Current password"
              registration={register('currentPassword')}
            />
            <PasswordField
              autoComplete="new-password"
              disabled={isSubmitting}
              errorMessage={errors.newPassword?.message}
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
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {isSubmitting ? 'Changing password…' : 'Change password'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h3">
            Other account controls unavailable
          </Typography>
          <Divider />
          <Typography color="text.secondary">
            The backend currently has no routes to change an email address, manage communication
            preferences, export account data, or delete an account. This frontend does not simulate
            those operations.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};
