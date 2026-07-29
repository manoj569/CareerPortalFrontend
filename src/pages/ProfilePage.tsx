import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import {
  isDashboardApiError,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  profileSchema,
  splitLines,
  splitList,
  type ProfileFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';
import {
  employmentTypeOptions,
  getEmploymentTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const emptyProfile: ProfileFormValues = {
  bio: '',
  education: '',
  experience: '',
  headline: '',
  linkedInUrl: '',
  location: '',
  portfolioUrl: '',
  preferredJobTypes: [],
  skills: '',
};

export const ProfilePage = () => {
  useDocumentMetadata(
    'Candidate profile | Career Portal',
    'Review and update your Career Portal candidate profile.',
  );
  const { data: profile, isError, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
  } = useForm<ProfileFormValues>({
    defaultValues: emptyProfile,
    mode: 'onTouched',
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      bio: profile.bio ?? '',
      education: profile.education.join('\n'),
      experience: profile.experience.join('\n'),
      headline: profile.headline ?? '',
      linkedInUrl: profile.linkedInUrl ?? '',
      location: profile.location ?? '',
      portfolioUrl: profile.portfolioUrl ?? '',
      preferredJobTypes: profile.preferredJobTypes,
      skills: profile.skills.join(', '),
    });
  }, [profile, reset]);

  const submitProfile = async (values: ProfileFormValues) => {
    setServerError(null);
    try {
      const updated = await updateProfile({
        bio: values.bio.trim() || null,
        education: splitLines(values.education),
        experience: splitLines(values.experience),
        headline: values.headline.trim() || null,
        linkedInUrl: values.linkedInUrl.trim() || null,
        location: values.location.trim() || null,
        portfolioUrl: values.portfolioUrl.trim() || null,
        preferredJobTypes: values.preferredJobTypes,
        skills: splitList(values.skills),
      }).unwrap();
      reset({
        bio: updated.bio ?? '',
        education: updated.education.join('\n'),
        experience: updated.experience.join('\n'),
        headline: updated.headline ?? '',
        linkedInUrl: updated.linkedInUrl ?? '',
        location: updated.location ?? '',
        portfolioUrl: updated.portfolioUrl ?? '',
        preferredJobTypes: updated.preferredJobTypes,
        skills: updated.skills.join(', '),
      });
      enqueueSnackbar('Profile updated successfully.', { variant: 'success' });
    } catch (updateError: unknown) {
      const hasFieldErrors = applyApiValidationErrors<ProfileFormValues>(
        updateError,
        [
          'bio',
          'education',
          'experience',
          'headline',
          'linkedInUrl',
          'location',
          'portfolioUrl',
          'preferredJobTypes',
          'skills',
        ],
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
        <Skeleton height={700} variant="rounded" />
      </Stack>
    );
  }

  if (isError || !profile) {
    return <ErrorState headingLevel="h1" onRetry={() => void refetch()} />;
  }

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        actions={
          <Button component={Link} to={ROUTES.RESUME} variant="outlined">
            Manage resume
          </Button>
        }
        description="Help employers understand your strengths, experience, and preferred opportunities."
        eyebrow="Candidate account"
        title="Candidate profile"
      />

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography fontWeight={800}>
            {profile.firstName} {profile.lastName}
          </Typography>
          <Typography color="text.secondary">{profile.email}</Typography>
          <Typography color="text.secondary" variant="body2">
            Your name and email are managed by your verified account.
          </Typography>
        </Stack>

        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            void handleSubmit(submitProfile, (formErrors) => {
              const firstField = Object.keys(formErrors)[0] as keyof ProfileFormValues | undefined;
              if (firstField && firstField !== 'preferredJobTypes') setFocus(firstField);
            })(event);
          }}
          spacing={3}
        >
          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.headline)}
                fullWidth
                helperText={errors.headline?.message ?? 'Optional · maximum 250 characters'}
                label="Professional headline"
                {...register('headline')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                autoComplete="address-level2"
                disabled={isSubmitting}
                error={Boolean(errors.location)}
                fullWidth
                helperText={errors.location?.message ?? 'Optional'}
                label="Location"
                {...register('location')}
              />
            </Grid>
          </Grid>

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

          <TextField
            disabled={isSubmitting}
            error={Boolean(errors.skills)}
            fullWidth
            helperText={errors.skills?.message ?? 'Separate up to 50 skills with commas.'}
            label="Skills"
            {...register('skills')}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.education)}
                fullWidth
                helperText={errors.education?.message ?? 'One education entry per line.'}
                label="Education"
                minRows={5}
                multiline
                {...register('education')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.experience)}
                fullWidth
                helperText={errors.experience?.message ?? 'One experience entry per line.'}
                label="Experience"
                minRows={5}
                multiline
                {...register('experience')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.linkedInUrl)}
                fullWidth
                helperText={errors.linkedInUrl?.message ?? 'Optional HTTPS URL'}
                label="LinkedIn URL"
                {...register('linkedInUrl')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.portfolioUrl)}
                fullWidth
                helperText={errors.portfolioUrl?.message ?? 'Optional HTTPS URL'}
                label="Portfolio URL"
                {...register('portfolioUrl')}
              />
            </Grid>
          </Grid>

          <Controller
            control={control}
            name="preferredJobTypes"
            render={({ field }) => (
              <FormControl error={Boolean(errors.preferredJobTypes)} fullWidth>
                <InputLabel id="preferred-job-types-label">Preferred job types</InputLabel>
                <Select
                  {...field}
                  disabled={isSubmitting}
                  input={<OutlinedInput label="Preferred job types" />}
                  labelId="preferred-job-types-label"
                  multiple
                  renderValue={(selected) => (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {selected.map((value) => (
                        <Chip key={value} label={getEmploymentTypeLabel(value)} size="small" />
                      ))}
                    </Stack>
                  )}
                >
                  {employmentTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.preferredJobTypes?.message ?? 'Optional · choose all that apply'}
                </FormHelperText>
              </FormControl>
            )}
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
    </Stack>
  );
};
