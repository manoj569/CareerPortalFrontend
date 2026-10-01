import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
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
import { MembershipStatus } from '@/features/dashboard/types/dashboardModels';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';
import { findActiveMembership } from '@/features/payments/utils/entitlement';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';

type SettingsSection = 'account' | 'security' | 'membership';

export const SettingsPage = () => {
  useDocumentMetadata(
    'Account settings | Career Portal',
    'Manage your Career Harbor account, security and membership preferences.',
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>('account');

  const [serverError, setServerError] = useState<string | null>(null);

  const [changePassword] = useChangePasswordMutation();

  const basicDetails = useGetCandidateBasicDetailsQuery();
  const memberships = useGetMembershipsQuery();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
    },
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

      enqueueSnackbar(
        'Password changed. Sign in again with your new password.',
        {
          variant: 'success',
        },
      );

      await navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          message:
            'Password changed successfully. Sign in with your new password.',
        },
      });
    } catch (error: unknown) {
      const hasFieldErrors =
        applyApiValidationErrors<ChangePasswordFormValues>(
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

  const navigationItems: Array<{
    id: SettingsSection;
    label: string;
    description: string;
    icon: typeof AccountCircleOutlinedIcon;
  }> = [
    {
      id: 'account',
      label: 'Account',
      description: 'Account information',
      icon: AccountCircleOutlinedIcon,
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Password & security',
      icon: SecurityOutlinedIcon,
    },
    {
      id: 'membership',
      label: 'Membership',
      description: 'Plan & access',
      icon: WorkspacePremiumOutlinedIcon,
    },
  ];

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Manage your account, security and membership preferences."
        eyebrow="Account"
        title="Settings"
      />

      <Paper
        component="section"
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ minHeight: 520 }}
        >
          {/* Settings navigation */}
          <Box
            component="nav"
            aria-label="Settings sections"
            sx={{
              bgcolor: '#F8FAFC',
              borderBottom: { xs: '1px solid', md: 0 },
              borderColor: 'divider',
              borderRight: { xs: 0, md: '1px solid' },
              minWidth: { md: 260 },
              p: 2,
              width: { xs: '100%', md: 260 },
            }}
          >
            <Typography
              color="text.secondary"
              fontSize={11}
              fontWeight={800}
              letterSpacing={0.8}
              sx={{ mb: 1.5, px: 1.25 }}
            >
              ACCOUNT SETTINGS
            </Typography>

            <Stack
              direction={{ xs: 'row', md: 'column' }}
              spacing={0.75}
              sx={{
                overflowX: { xs: 'auto', md: 'visible' },
                pb: { xs: 0.5, md: 0 },
              }}
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const selected = activeSection === item.id;

                return (
                  <Button
                    aria-current={selected ? 'page' : undefined}
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    startIcon={<Icon />}
                    sx={{
                      bgcolor: selected ? '#EAF2FF' : 'transparent',
                      borderRadius: 2,
                      color: selected ? 'primary.main' : 'text.primary',
                      justifyContent: 'flex-start',
                      minWidth: { xs: 'max-content', md: '100%' },
                      px: 1.5,
                      py: 1.25,
                      textAlign: 'left',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: selected ? '#EAF2FF' : '#F1F5F9',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography
                        fontSize={14}
                        fontWeight={selected ? 800 : 650}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        fontSize={11}
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          mt: 0.1,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: { xs: 2.5, sm: 3, md: 4 },
            }}
          >
            {activeSection === 'account' ? (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    component="h2"
                    fontSize={22}
                    fontWeight={800}
                  >
                    Account
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                    variant="body2"
                  >
                    View your account and verification information.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1.25}
                    sx={{ mb: 2 }}
                  >
                    <SecurityOutlinedIcon color="primary" />

                    <Typography
                      component="h3"
                      fontSize={16}
                      fontWeight={800}
                    >
                      Account security
                    </Typography>
                  </Stack>

                  {basicDetails.isError ? (
                    <Alert
                      action={
                        <Button
                          color="inherit"
                          onClick={() => void basicDetails.refetch()}
                        >
                          Retry
                        </Button>
                      }
                      severity="warning"
                    >
                      Account information is temporarily unavailable.
                    </Alert>
                  ) : basicDetails.data ? (
                    <Paper
                      elevation={0}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2.5,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Email */}
                      <Stack
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ p: 2.5 }}
                      >
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1.5}
                        >
                          <Box
                            sx={{
                              alignItems: 'center',
                              bgcolor: '#EFF6FF',
                              borderRadius: 2,
                              color: 'primary.main',
                              display: 'flex',
                              height: 42,
                              justifyContent: 'center',
                              width: 42,
                            }}
                          >
                            <EmailOutlinedIcon fontSize="small" />
                          </Box>

                          <Box>
                            <Typography
                              color="text.secondary"
                              fontSize={12}
                              fontWeight={650}
                            >
                              Email address
                            </Typography>

                            <Typography
                              fontSize={14}
                              fontWeight={650}
                              sx={{
                                mt: 0.25,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {basicDetails.data.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>

                      <Divider />

                      {/* Mobile */}
                      <Stack
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ p: 2.5 }}
                      >
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1.5}
                        >
                          <Box
                            sx={{
                              alignItems: 'center',
                              bgcolor: '#F0FDF4',
                              borderRadius: 2,
                              color: 'success.main',
                              display: 'flex',
                              height: 42,
                              justifyContent: 'center',
                              width: 42,
                            }}
                          >
                            <PhoneIphoneOutlinedIcon fontSize="small" />
                          </Box>

                          <Box>
                            <Typography
                              color="text.secondary"
                              fontSize={12}
                              fontWeight={650}
                            >
                              Mobile verification
                            </Typography>

                            <Typography
                              fontSize={14}
                              fontWeight={650}
                              sx={{ mt: 0.25 }}
                            >
                              {basicDetails.data.mobileNumber ||
                                'No mobile number available'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          color={
                            basicDetails.data.mobileVerified
                              ? 'success'
                              : 'default'
                          }
                          icon={
                            basicDetails.data.mobileVerified ? (
                              <CheckCircleRoundedIcon />
                            ) : undefined
                          }
                          label={
                            basicDetails.data.mobileVerified
                              ? 'Verified'
                              : 'Not verified'
                          }
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>
                    </Paper>
                  ) : null}
                </Box>
              </Stack>
            ) : null}

            {activeSection === 'security' ? (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    component="h2"
                    fontSize={22}
                    fontWeight={800}
                  >
                    Security
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                    variant="body2"
                  >
                    Keep your Career Harbor account secure.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1.25}
                  >
                    <LockResetOutlinedIcon color="primary" />

                    <Box>
                      <Typography
                        component="h3"
                        fontSize={16}
                        fontWeight={800}
                      >
                        Change password
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.25 }}
                        variant="body2"
                      >
                        Use 6–128 characters. Spaces and special characters
                        are allowed.
                      </Typography>
                    </Box>
                  </Stack>

                  {serverError ? (
                    <Alert
                      aria-live="assertive"
                      severity="error"
                      sx={{ mt: 2.5, maxWidth: 600 }}
                    >
                      {serverError}
                    </Alert>
                  ) : null}

                  <Stack
                    component="form"
                    maxWidth={560}
                    noValidate
                    onSubmit={(event) => {
                      void handleSubmit(
                        submitPassword,
                        (formErrors) => {
                          const firstField = Object.keys(
                            formErrors,
                          )[0] as
                            | keyof ChangePasswordFormValues
                            | undefined;

                          if (firstField) {
                            setFocus(firstField);
                          }
                        },
                      )(event);
                    }}
                    spacing={2}
                    sx={{ mt: 3 }}
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

                    <Button
                      disabled={isSubmitting}
                      sx={{
                        alignSelf: { xs: 'stretch', sm: 'flex-start' },
                        minWidth: 180,
                        mt: 0.5,
                        textTransform: 'none',
                      }}
                      type="submit"
                      variant="contained"
                    >
                      {isSubmitting
                        ? 'Changing password…'
                        : 'Change password'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            ) : null}

            {activeSection === 'membership' ? (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    component="h2"
                    fontSize={22}
                    fontWeight={800}
                  >
                    Membership
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                    variant="body2"
                  >
                    View your current membership and manage your access.
                  </Typography>
                </Box>

                <Divider />

                {memberships.isError ? (
                  <Alert
                    action={
                      <Button
                        color="inherit"
                        onClick={() => void memberships.refetch()}
                      >
                        Retry
                      </Button>
                    }
                    severity="warning"
                  >
                    Membership status is temporarily unavailable.
                  </Alert>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      background:
                        'linear-gradient(135deg, #F5F9FF 0%, #FFFFFF 70%)',
                      border: '1px solid',
                      borderColor: '#D8E6FA',
                      borderRadius: 2.5,
                      maxWidth: 720,
                      p: { xs: 2.5, sm: 3 },
                    }}
                  >
                    <Stack
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      spacing={2.5}
                    >
                      <Stack
                        alignItems="flex-start"
                        direction="row"
                        spacing={1.75}
                      >
                        <Box
                          sx={{
                            alignItems: 'center',
                            bgcolor: '#E8F1FF',
                            borderRadius: 2.25,
                            color: 'primary.main',
                            display: 'flex',
                            height: 48,
                            justifyContent: 'center',
                            width: 48,
                          }}
                        >
                          <WorkspacePremiumOutlinedIcon />
                        </Box>

                        <Box>
                          <Stack
                            alignItems="center"
                            direction="row"
                            flexWrap="wrap"
                            gap={1}
                          >
                            <Typography
                              fontSize={17}
                              fontWeight={800}
                            >
                              Current membership
                            </Typography>

                            {activeMembership ? (
                              <Chip
                                color="success"
                                label={
                                  MembershipStatus[
                                    activeMembership.status
                                  ]
                                }
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            ) : (
                              <Chip
                                label="No active membership"
                                size="small"
                              />
                            )}
                          </Stack>

                          {activeMembership?.endsAtUtc ? (
                            <Typography
                              color="text.secondary"
                              sx={{ mt: 1 }}
                              variant="body2"
                            >
                              Your access expires{' '}
                              {formatDashboardDate(
                                activeMembership.endsAtUtc,
                              ) ?? 'date unavailable'}
                              .
                            </Typography>
                          ) : (
                            <Typography
                              color="text.secondary"
                              sx={{ mt: 1 }}
                              variant="body2"
                            >
                              You currently do not have an active
                              membership.
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      <Button
                        component={Link}
                        sx={{
                          flexShrink: 0,
                          textTransform: 'none',
                        }}
                        to={ROUTES.MEMBERSHIP}
                        variant="outlined"
                      >
                        Manage membership
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};