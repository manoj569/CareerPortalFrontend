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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { applyApiValidationErrors } from '@/api/formErrors';
import {
  isDashboardApiError,
  useUpdateProfileMutation,
} from '@/features/dashboard/api/dashboardApi';
import type { UserProfile } from '@/features/dashboard/types/dashboardModels';
import {
  additionalProfileSchema,
  splitLines,
  splitList,
  type AdditionalProfileFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';
import {
  employmentTypeOptions,
  getEmploymentTypeLabel,
} from '@/features/jobs/constants/jobOptions';

interface AdditionalProfileDetailsCardProps {
  profile: UserProfile;
}

export interface AdditionalProfileDetailsCardHandle {
  focusEditor: () => void;
}

const emptyValues: AdditionalProfileFormValues = {
  education: '',
  experience: '',
  linkedInUrl: '',
  location: '',
  portfolioUrl: '',
  preferredJobTypes: [],
  skills: '',
};

export const AdditionalProfileDetailsCard = forwardRef<
  AdditionalProfileDetailsCardHandle,
  AdditionalProfileDetailsCardProps
>(({ profile }, ref) => {
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
  } = useForm<AdditionalProfileFormValues>({
    defaultValues: emptyValues,
    mode: 'onTouched',
    resolver: yupResolver(additionalProfileSchema),
  });

  useEffect(() => {
    reset({
      education: profile.education.join('\n'),
      experience: profile.experience.join('\n'),
      linkedInUrl: profile.linkedInUrl ?? '',
      location: profile.location ?? '',
      portfolioUrl: profile.portfolioUrl ?? '',
      preferredJobTypes: profile.preferredJobTypes,
      skills: profile.skills.join(', '),
    });
  }, [profile, reset]);

  useImperativeHandle(ref, () => ({
    focusEditor: () => {
      document.getElementById('additional-profile-details')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      window.setTimeout(() => setFocus('location'), 0);
    },
  }));

  const submit = async (values: AdditionalProfileFormValues) => {
    setServerError(null);
    try {
      const updated = await updateProfile({
        bio: profile.bio,
        education: splitLines(values.education),
        experience: splitLines(values.experience),
        headline: profile.headline,
        linkedInUrl: values.linkedInUrl.trim() || null,
        location: values.location.trim() || null,
        portfolioUrl: values.portfolioUrl.trim() || null,
        preferredJobTypes: values.preferredJobTypes,
        skills: splitList(values.skills),
      }).unwrap();
      reset({
        education: updated.education.join('\n'),
        experience: updated.experience.join('\n'),
        linkedInUrl: updated.linkedInUrl ?? '',
        location: updated.location ?? '',
        portfolioUrl: updated.portfolioUrl ?? '',
        preferredJobTypes: updated.preferredJobTypes,
        skills: updated.skills.join(', '),
      });
      enqueueSnackbar('Additional profile details updated.', { variant: 'success' });
    } catch (error: unknown) {
      const hasFieldErrors = applyApiValidationErrors<AdditionalProfileFormValues>(
        error,
        [
          'education',
          'experience',
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
          : isDashboardApiError(error)
            ? error.message
            : 'Unable to update your profile. Please try again.',
      );
    }
  };

  return (
    <Paper component="section" id="additional-profile-details" sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography component="h2" variant="h3">
            Additional profile details
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Existing location, legacy skills, experience, education, links, and job-type preferences
            remain available here.
          </Typography>
        </Stack>
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => void handleSubmit(submit)(event)}
          spacing={2.5}
        >
          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}
          <TextField
            autoComplete="address-level2"
            disabled={isSubmitting}
            error={Boolean(errors.location)}
            fullWidth
            helperText={errors.location?.message ?? 'Optional'}
            label="Current location"
            {...register('location')}
          />
          <TextField
            disabled={isSubmitting}
            error={Boolean(errors.skills)}
            fullWidth
            helperText={errors.skills?.message ?? 'Existing comma-separated skills remain supported.'}
            label="Legacy skills"
            {...register('skills')}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.education)}
                fullWidth
                helperText={errors.education?.message ?? 'One existing education entry per line.'}
                label="Education"
                minRows={4}
                multiline
                {...register('education')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                disabled={isSubmitting}
                error={Boolean(errors.experience)}
                fullWidth
                helperText={errors.experience?.message ?? 'One existing experience entry per line.'}
                label="Experience"
                minRows={4}
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
              {isSubmitting ? 'Saving…' : 'Save additional details'}
            </Button>
            <Button disabled={isSubmitting || !isDirty} onClick={() => reset()}>
              Discard changes
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
});

AdditionalProfileDetailsCard.displayName = 'AdditionalProfileDetailsCard';
