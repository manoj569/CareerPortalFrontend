import { yupResolver } from '@hookform/resolvers/yup';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
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
  const [open, setOpen] = useState(false);
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

  const profileValues = useMemo<AdditionalProfileFormValues>(
    () => ({
      education: profile.education.join('\n'),
      experience: profile.experience.join('\n'),
      linkedInUrl: profile.linkedInUrl ?? '',
      location: profile.location ?? '',
      portfolioUrl: profile.portfolioUrl ?? '',
      preferredJobTypes: profile.preferredJobTypes,
      skills: profile.skills.join(', '),
    }),
    [profile],
  );

  useEffect(() => {
    reset(profileValues);
  }, [profileValues, reset]);

  const openEditor = (focusLocation = false) => {
    setServerError(null);
    reset(profileValues);
    setOpen(true);
    if (focusLocation) window.setTimeout(() => setFocus('location'), 0);
  };

  useImperativeHandle(ref, () => ({ focusEditor: () => openEditor(true) }));

  const closeEditor = () => {
    if (isSubmitting) return;
    reset(profileValues);
    setServerError(null);
    setOpen(false);
  };

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
      setOpen(false);
      enqueueSnackbar('Additional profile details updated.', { variant: 'success' });
    } catch (error: unknown) {
      const hasFieldErrors = applyApiValidationErrors<AdditionalProfileFormValues>(
        error,
        ['education', 'experience', 'linkedInUrl', 'location', 'portfolioUrl', 'preferredJobTypes', 'skills'],
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

  const summary = getSummary(profile);

  return (
    <>
      <Paper
        component="section"
        id="additional-profile-details"
        sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}
      >
        <Stack spacing={2}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <InfoOutlinedIcon color="primary" />
              <Typography component="h2" variant="h3">Profile details</Typography>
            </Stack>
            <Button onClick={() => openEditor()} startIcon={<EditOutlinedIcon />} variant="outlined">Edit</Button>
          </Stack>
          {summary.length ? (
            <Stack component="dl" spacing={1.25} sx={{ m: 0 }}>
              {summary.map(({ label, value }) => (
                <Stack key={label} spacing={0.25}>
                  <Typography color="text.secondary" component="dt" variant="caption">{label}</Typography>
                  <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }} variant="body2">{value}</Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">Add supported profile details when they are relevant to you.</Typography>
          )}
        </Stack>
      </Paper>

      <Dialog fullWidth maxWidth="md" onClose={closeEditor} open={open}>
        <DialogTitle>Edit profile details</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="additional-profile-details-form"
            noValidate
            onSubmit={(event) => void handleSubmit(submit)(event)}
            spacing={2.5}
            sx={{ pt: 1 }}
          >
            {serverError ? <Alert aria-live="assertive" severity="error">{serverError}</Alert> : null}
            <TextField autoComplete="address-level2" disabled={isSubmitting} error={Boolean(errors.location)} helperText={errors.location?.message ?? 'Optional'} label="Current location" {...register('location')} />
            <TextField disabled={isSubmitting} error={Boolean(errors.skills)} helperText={errors.skills?.message ?? 'Existing comma-separated skills remain supported.'} label="Legacy skills" {...register('skills')} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField disabled={isSubmitting} error={Boolean(errors.education)} helperText={errors.education?.message ?? 'One existing education entry per line.'} label="Education" minRows={4} multiline {...register('education')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField disabled={isSubmitting} error={Boolean(errors.experience)} helperText={errors.experience?.message ?? 'One existing experience entry per line.'} label="Experience" minRows={4} multiline {...register('experience')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField disabled={isSubmitting} error={Boolean(errors.linkedInUrl)} helperText={errors.linkedInUrl?.message ?? 'Optional HTTPS URL'} label="LinkedIn URL" {...register('linkedInUrl')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField disabled={isSubmitting} error={Boolean(errors.portfolioUrl)} helperText={errors.portfolioUrl?.message ?? 'Optional HTTPS URL'} label="Portfolio URL" {...register('portfolioUrl')} />
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
                        {selected.map((value) => <Chip key={value} label={getEmploymentTypeLabel(value)} size="small" />)}
                      </Stack>
                    )}
                  >
                    {employmentTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                  <FormHelperText>{errors.preferredJobTypes?.message ?? 'Optional · choose all that apply'}</FormHelperText>
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isSubmitting} onClick={closeEditor}>Cancel</Button>
          <Button disabled={isSubmitting || !isDirty} form="additional-profile-details-form" type="submit" variant="contained">
            {isSubmitting ? 'Saving…' : 'Save additional details'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

AdditionalProfileDetailsCard.displayName = 'AdditionalProfileDetailsCard';

const getSummary = (profile: UserProfile): Array<{ label: string; value: string }> => {
  const values = [
    profile.location ? { label: 'Location', value: profile.location } : null,
    profile.preferredJobTypes.length
      ? { label: 'Preferred job types', value: profile.preferredJobTypes.map(getEmploymentTypeLabel).join(', ') }
      : null,
    profile.experience.length ? { label: 'Experience', value: `${profile.experience.length} ${profile.experience.length === 1 ? 'entry' : 'entries'}` } : null,
    profile.education.length ? { label: 'Education', value: `${profile.education.length} ${profile.education.length === 1 ? 'entry' : 'entries'}` } : null,
    profile.linkedInUrl ? { label: 'LinkedIn', value: 'Added' } : null,
    profile.portfolioUrl ? { label: 'Portfolio link', value: 'Added' } : null,
  ];
  return values.filter((value): value is { label: string; value: string } => Boolean(value));
};
