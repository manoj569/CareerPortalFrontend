import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ROUTES } from '@/constants/routes';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { logout } from '@/features/auth/store/authSlice';
import {
  isDashboardApiError,
  useChangePasswordMutation,
  useGetCandidateBasicDetailsQuery,
  useGetMembershipsQuery,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { MembershipStatus } from '@/features/dashboard/types/dashboardModels';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import { findActiveMembership } from '@/features/payments/utils/entitlement';

export const SettingsPage = () => {
  useDocumentMetadata(
    'Account settings | Career Portal',
    'Manage the account settings supported by the Career Portal backend.',
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [changePassword] = useChangePasswordMutation();
  const basicDetails = useGetCandidateBasicDetailsQuery();
  const memberships = useGetMembershipsQuery();
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

  if (basicDetails.isLoading || memberships.isLoading) {
    return <PageLoadingIndicator label="Loading settings" />;
  }

  const activeMembership = findActiveMembership(memberships.data);

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
            Use 6–128 characters. Spaces and special characters are allowed.
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
        <Stack spacing={2.5}>
          <Stack alignItems="center" direction="row" spacing={1.5}><SecurityOutlinedIcon color="primary" /><Typography component="h2" variant="h3">Account security</Typography></Stack>
          {basicDetails.isError ? <Alert action={<Button color="inherit" onClick={() => void basicDetails.refetch()}>Retry</Button>} severity="warning">Security status is temporarily unavailable.</Alert> : basicDetails.data ? <Stack alignItems="center" direction="row" justifyContent="space-between"><Typography>Mobile verification</Typography><Chip color={basicDetails.data.mobileVerified ? 'success' : 'default'} label={basicDetails.data.mobileVerified ? 'Verified' : 'Not verified'} size="small" /></Stack> : null}
        </Stack>
      </Paper>

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}><Stack spacing={2.5}><Stack alignItems="center" direction="row" spacing={1.5}><WorkspacePremiumOutlinedIcon color="primary" /><Typography component="h2" variant="h3">Membership</Typography></Stack>{memberships.isError ? <Alert action={<Button color="inherit" onClick={() => void memberships.refetch()}>Retry</Button>} severity="warning">Membership status is temporarily unavailable.</Alert> : <Stack spacing={0.75}><Typography fontWeight={750}>{activeMembership ? MembershipStatus[activeMembership.status] : 'No active membership'}</Typography>{activeMembership?.endsAtUtc ? <Typography color="text.secondary" variant="body2">Expires {formatDashboardDate(activeMembership.endsAtUtc) ?? 'date unavailable'}</Typography> : null}</Stack>}<Button component={Link} sx={{ alignSelf: 'flex-start' }} to={ROUTES.MEMBERSHIP} variant="outlined">Manage membership</Button></Stack></Paper>

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack alignItems="center" direction="row" spacing={1.5}><AutoAwesomeOutlinedIcon color="primary" /><Typography component="h2" variant="h3">AI Apply preferences</Typography></Stack>
          <Typography color="text.secondary">Manage setup details, verified answer memory, and connected job sites when you need them.</Typography>
          <Stack alignItems="flex-start" direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={Link} to={ROUTES.AI_APPLY_SETUP} variant="outlined">Profile and preferences</Button>
            <Button component={Link} to={ROUTES.AI_APPLY_ANSWERS} variant="outlined">Saved answers</Button>
            <Button component={Link} to={ROUTES.AI_APPLY_CONNECTIONS} variant="outlined">Connected job sites</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};
