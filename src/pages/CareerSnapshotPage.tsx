import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { applyApiValidationErrors } from '@/api/formErrors';
import { toApiRequestError } from '@/api/apiError';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { careerSnapshotConfirmed, selectCurrentUser } from '@/features/auth/store/authSlice';
import { getSafeRedirectPath } from '@/features/auth/utils/safeRedirect';
import { requiresCareerSnapshot } from '@/features/auth/utils/careerSnapshotRouting';
import {
  dashboardApi,
  useGetProfileQuery,
  useUpdateCareerSnapshotMutation,
} from '@/features/dashboard/api/dashboardApi';
import { indianCities } from '@/features/dashboard/reference/profileReferenceData';
import { CareerStage, WorkPreference } from '@/features/dashboard/types/dashboardModels';
import {
  careerSnapshotSchema,
  snapshotRequest,
  type CareerSnapshotFormValues,
} from '@/features/dashboard/validation/careerSnapshotSchema';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const stages = [
  [CareerStage.Student, 'Student'],
  [CareerStage.Fresher, 'Fresher'],
  [CareerStage.Experienced, 'Experienced Professional'],
] as const;
const workModes = [
  [WorkPreference.Remote, 'Remote'],
  [WorkPreference.Hybrid, 'Hybrid'],
  [WorkPreference.OnSite, 'On-site'],
] as const;
const fields: (keyof CareerSnapshotFormValues)[] = [
  'careerStage',
  'primaryRole',
  'skills',
  'yearsOfExperience',
  'city',
  'workPreferences',
];

export const CareerSnapshotPage = () => {
  useDocumentMetadata(
    'Tell us about your career | CareerHarbor',
    'Help CareerHarbor personalize jobs and opportunities for you.',
  );
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useGetProfileQuery();
  const [saveSnapshot] = useUpdateCareerSnapshotMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const hydrated = useRef(false);
  const submitting = useRef(false);
  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CareerSnapshotFormValues>({
    defaultValues: {
      careerStage: null,
      primaryRole: '',
      skills: [],
      yearsOfExperience: '',
      city: '',
      workPreferences: [],
    },
    resolver: yupResolver(careerSnapshotSchema),
    mode: 'onTouched',
  });
  const stage = watch('careerStage');
  const requested = getSafeRedirectPath((location.state as { from?: unknown } | null)?.from);
  const destination =
    requested &&
    ![ROUTES.CAREER_SNAPSHOT, ROUTES.LOGIN, ROUTES.REGISTER].some(
      (path) => requested.split(/[?#]/)[0] === path,
    )
      ? requested
      : ROUTES.DASHBOARD;

  useEffect(() => {
    const data = profile.data;
    if (!data || hydrated.current) return;
    hydrated.current = true;
    reset({
      careerStage: data.careerStage ?? null,
      primaryRole: data.primaryRole ?? data.careerPreferences?.preferredJobRoles[0] ?? '',
      skills: data.skills,
      yearsOfExperience: data.yearsOfExperience?.toString() ?? '',
      city: data.basicDetails?.currentCity ?? data.location ?? '',
      workPreferences: data.workPreferences ?? [],
    });
  }, [profile.data, reset]);

  useEffect(() => {
    if (
      profile.data?.id === user?.id &&
      profile.data?.careerSnapshotRequired === false &&
      user?.careerSnapshotRequired === true
    )
      dispatch(careerSnapshotConfirmed({ userId: user.id, careerSnapshotRequired: false }));
  }, [profile.data, user, dispatch]);

  const submit = async (values: CareerSnapshotFormValues) => {
    if (submitting.current || !user) return;
    submitting.current = true;
    setServerError(null);
    try {
      const saved = await saveSnapshot(snapshotRequest(values)).unwrap();
      if (saved.id !== user.id || saved.careerSnapshotRequired !== false)
        throw new Error('The server has not confirmed career setup completion. Please try again.');
      await dispatch(dashboardApi.util.upsertQueryData('getProfile', undefined, saved));
      dispatch(
        careerSnapshotConfirmed({
          userId: user.id,
          careerSnapshotRequired: saved.careerSnapshotRequired,
        }),
      );
      enqueueSnackbar('Your career profile has been saved.', { variant: 'success' });
      await navigate(destination, { replace: true });
    } catch (error: unknown) {
      const hasFields = applyApiValidationErrors(error, fields, setError);
      setServerError(
        hasFields
          ? 'Review the highlighted fields and try again.'
          : toApiRequestError(error).message ||
              'Unable to save your career profile. Please try again.',
      );
    } finally {
      submitting.current = false;
    }
  };

  if (!requiresCareerSnapshot(user)) return <Navigate replace to={destination} />;
  if (profile.isLoading) return <PageLoadingIndicator label="Loading career snapshot" />;
  if (profile.isError || !profile.data)
    return (
      <ErrorState
        title="Career setup is temporarily unavailable"
        description="Your profile could not be loaded. Please try again."
        onRetry={() => void profile.refetch()}
      />
    );

  return (
    <Grid container spacing={3} sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
        <Paper
          sx={{ p: 4, height: '100%', bgcolor: 'primary.main', color: 'primary.contrastText' }}
        >
          <Typography variant="overline">CareerHarbor · Step 2</Typography>
          <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
            Your next opportunity starts here
          </Typography>
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography>Discover jobs that fit your interests.</Typography>
            <Typography>Build one profile and apply faster.</Typography>
            <Typography>Update your career details anytime in Profile.</Typography>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          component="form"
          noValidate
          onSubmit={(event) => void handleSubmit(submit)(event)}
          sx={{ p: { xs: 2.5, sm: 4 } }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography color="primary" variant="overline">
                Step 2 · Career snapshot
              </Typography>
              <Typography component="h1" variant="h2">
                Tell us about your career
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Help CareerHarbor personalize jobs and opportunities for you.
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Takes less than a minute
              </Typography>
            </Box>
            {serverError && (
              <Alert severity="error" aria-live="assertive">
                {serverError}
              </Alert>
            )}
            <Controller
              name="careerStage"
              control={control}
              render={({ field }) => (
                <FormControl
                  component="fieldset"
                  required
                  error={Boolean(errors.careerStage)}
                  disabled={isSubmitting}
                >
                  <FormLabel component="legend">Career stage</FormLabel>
                  <RadioGroup
                    row
                    value={field.value ?? ''}
                    onChange={(_, value) => field.onChange(Number(value))}
                  >
                    {stages.map(([value, label]) => (
                      <FormControlLabel
                        key={value}
                        value={value}
                        control={<Radio />}
                        label={label}
                      />
                    ))}
                  </RadioGroup>
                  <FormHelperText>{errors.careerStage?.message}</FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              name="primaryRole"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  autoSelect
                  disabled={isSubmitting}
                  options={profile.data?.careerPreferences?.preferredJobRoles ?? []}
                  value={field.value}
                  onInputChange={(_, value) => field.onChange(value)}
                  onChange={(_, value) => field.onChange(value ?? '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      label="Primary role"
                      required
                      error={Boolean(errors.primaryRole)}
                      helperText={
                        errors.primaryRole?.message ??
                        'Search your preferred roles or type a specific role. For Other, enter your custom role.'
                      }
                    />
                  )}
                />
              )}
            />
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  autoSelect
                  filterSelectedOptions
                  disabled={isSubmitting}
                  options={profile.data?.skills ?? []}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      label="Skills"
                      required
                      error={Boolean(errors.skills)}
                      helperText={
                        errors.skills?.message ??
                        'Add at least one skill. We recommend 3–10. Press Enter after each skill.'
                      }
                    />
                  )}
                />
              )}
            />
            {stage === CareerStage.Experienced && (
              <TextField
                {...register('yearsOfExperience')}
                label="Total experience (years)"
                required
                type="number"
                disabled={isSubmitting}
                slotProps={{ htmlInput: { min: 0, max: 50, step: 0.1, inputMode: 'decimal' } }}
                error={Boolean(errors.yearsOfExperience)}
                helperText={
                  errors.yearsOfExperience?.message ??
                  'From 0 to 50 years, with up to one decimal place.'
                }
              />
            )}
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  autoSelect
                  disabled={isSubmitting}
                  options={indianCities.map((city) => city.value)}
                  value={field.value}
                  onInputChange={(_, value) => field.onChange(value)}
                  onChange={(_, value) => field.onChange(value ?? '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      label="Current city"
                      error={Boolean(errors.city)}
                      helperText={errors.city?.message ?? 'Optional'}
                    />
                  )}
                />
              )}
            />
            <Controller
              name="workPreferences"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" disabled={isSubmitting}>
                  <FormLabel component="legend">Preferred work mode (optional)</FormLabel>
                  <Stack direction="row" flexWrap="wrap">
                    {workModes.map(([value, label]) => (
                      <FormControlLabel
                        key={value}
                        label={label}
                        control={
                          <Checkbox
                            checked={field.value.includes(value)}
                            onChange={(_, checked) =>
                              field.onChange(
                                checked
                                  ? [...field.value, value]
                                  : field.value.filter((item) => item !== value),
                              )
                            }
                          />
                        }
                      />
                    ))}
                  </Stack>
                </FormControl>
              )}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Complete profile'}
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};
