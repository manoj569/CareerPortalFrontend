import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Avatar,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  isDashboardApiError,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { profileUpdated } from '@/features/auth/store/authSlice';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const emptyProfile: ProfileFormValues = {
  bio: '',
  firstName: '',
  headline: '',
  lastName: '',
  phoneNumber: '',
  profileImageUrl: '',
};

export const ProfilePage = () => {
  useDocumentMetadata(
    'Candidate profile | Career Portal',
    'Review and update your Career Portal candidate profile.',
  );
  const dispatch = useAppDispatch();
  const { data: profile, isError, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
    watch,
  } = useForm<ProfileFormValues>({
    defaultValues: emptyProfile,
    mode: 'onTouched',
    resolver: yupResolver(profileSchema),
  });
  const profileImageUrl = watch('profileImageUrl');

  useEffect(() => {
    if (!profile) return;
    reset({
      bio: profile.bio ?? '',
      firstName: profile.firstName,
      headline: profile.headline ?? '',
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber ?? '',
      profileImageUrl: profile.profileImageUrl ?? '',
    });
  }, [profile, reset]);

  const submitProfile = async (values: ProfileFormValues) => {
    setServerError(null);
    try {
      const updated = await updateProfile({
        bio: values.bio.trim() || null,
        firstName: values.firstName.trim(),
        headline: values.headline.trim() || null,
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim() || null,
        profileImageUrl: values.profileImageUrl.trim() || null,
      }).unwrap();
      dispatch(profileUpdated({ firstName: updated.firstName, lastName: updated.lastName }));
      reset({
        bio: updated.bio ?? '',
        firstName: updated.firstName,
        headline: updated.headline ?? '',
        lastName: updated.lastName,
        phoneNumber: updated.phoneNumber ?? '',
        profileImageUrl: updated.profileImageUrl ?? '',
      });
      enqueueSnackbar('Profile updated successfully.', { variant: 'success' });
    } catch (updateError: unknown) {
      const hasFieldErrors = applyApiValidationErrors<ProfileFormValues>(
        updateError,
        ['bio', 'firstName', 'headline', 'lastName', 'phoneNumber', 'profileImageUrl'],
        setError,
      );
      setServerError(
        hasFieldErrors
          ? 'Review the highlighted profile fields and try again.'
          : isDashboardApiError(updateError)
            ? updateError.message
            : 'Unable to update your profile. Please try again.',
      );
    }
  };

  if (isLoading) {
    return (
      <Stack aria-label="Loading profile" role="status" spacing={3}>
        <Skeleton height={76} variant="rounded" />
        <Skeleton height={520} variant="rounded" />
      </Stack>
    );
  }

  if (isError || !profile) {
    return <ErrorState headingLevel="h1" onRetry={() => void refetch()} />;
  }

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="Keep the information employers and the portal use to identify you up to date."
        eyebrow="Account"
        title="Candidate profile"
      />

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            void handleSubmit(submitProfile, (formErrors) => {
              const firstField = Object.keys(formErrors)[0] as keyof ProfileFormValues | undefined;
              if (firstField) setFocus(firstField);
            })(event);
          }}
          spacing={3}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <Avatar
              alt={`${profile.firstName} ${profile.lastName}`}
              src={profileImageUrl || undefined}
              sx={{ height: 72, width: 72 }}
            >
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </Avatar>
            <Stack>
              <Typography fontWeight={700}>{profile.email}</Typography>
              <Typography color="text.secondary" variant="body2">
                {profile.emailConfirmed ? 'Email confirmed' : 'Email not confirmed'}
              </Typography>
            </Stack>
          </Stack>

          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                autoComplete="given-name"
                disabled={isSubmitting}
                error={Boolean(errors.firstName)}
                fullWidth
                helperText={errors.firstName?.message}
                label="First name"
                required
                {...register('firstName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                autoComplete="family-name"
                disabled={isSubmitting}
                error={Boolean(errors.lastName)}
                fullWidth
                helperText={errors.lastName?.message}
                label="Last name"
                required
                {...register('lastName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                autoComplete="tel"
                disabled={isSubmitting}
                error={Boolean(errors.phoneNumber)}
                fullWidth
                helperText={errors.phoneNumber?.message ?? 'Optional'}
                label="Phone number"
                {...register('phoneNumber')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.profileImageUrl)}
                fullWidth
                helperText={
                  errors.profileImageUrl?.message ??
                  'Optional absolute HTTP(S) URL. File upload is not supported by the API.'
                }
                label="Profile image URL"
                {...register('profileImageUrl')}
              />
            </Grid>
          </Grid>
          <TextField
            disabled={isSubmitting}
            error={Boolean(errors.headline)}
            fullWidth
            helperText={errors.headline?.message ?? 'Optional'}
            label="Professional headline"
            {...register('headline')}
          />
          <TextField
            disabled={isSubmitting}
            error={Boolean(errors.bio)}
            fullWidth
            helperText={errors.bio?.message ?? 'Optional · maximum 4,000 characters'}
            label="Professional bio"
            minRows={5}
            multiline
            {...register('bio')}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button disabled={isSubmitting || !isDirty} type="submit" variant="contained">
              {isSubmitting ? 'Saving…' : 'Save profile'}
            </Button>
            <Button disabled={isSubmitting || !isDirty} onClick={() => reset()} variant="text">
              Discard changes
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <CloudUploadOutlinedIcon color="disabled" />
          <Typography component="h2" variant="h3">
            Resume management unavailable
          </Typography>
          <Typography color="text.secondary">
            The current backend has no candidate resume upload, download, replace, or delete
            endpoint. No file is selected or stored by this frontend.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};
