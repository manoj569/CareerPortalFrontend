import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
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
  useGetOnboardingQuery,
  useUpdateOnboardingMutation,
} from '@/features/dashboard/api/dashboardApi';
import {
  CareerStage,
  DesiredOpportunity,
  WorkPreference,
} from '@/features/dashboard/types/dashboardModels';
import { splitList } from '@/features/dashboard/validation/dashboardSchemas';
import {
  emptyOnboardingForm,
  onboardingSchema,
  type OnboardingFormValues,
} from '@/features/dashboard/validation/onboardingSchema';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const careerStageOptions = [
  {
    description: 'I am currently studying.',
    label: 'Student',
    value: CareerStage.Student,
  },
  {
    description: 'I am starting my career.',
    label: 'Fresher',
    value: CareerStage.Fresher,
  },
  {
    description: 'I already have professional experience.',
    label: 'Experienced professional',
    value: CareerStage.Experienced,
  },
];

const opportunityOptions = [
  { label: 'Internship', value: DesiredOpportunity.Internship },
  { label: 'Fresher job', value: DesiredOpportunity.FresherJob },
  { label: 'Experienced job', value: DesiredOpportunity.ExperiencedJob },
];

const workPreferenceOptions = [
  { label: 'Remote', value: WorkPreference.Remote },
  { label: 'Hybrid', value: WorkPreference.Hybrid },
  { label: 'On-site', value: WorkPreference.OnSite },
];

const stepLabels = ['Career stage', 'Opportunity types', 'Preferences'];
const onboardingFields: (keyof OnboardingFormValues)[] = [
  'careerStage',
  'desiredOpportunities',
  'city',
  'skills',
  'workPreferences',
  'college',
  'degree',
  'graduationYear',
  'yearsOfExperience',
];

const toggleSelection = <T,>(values: T[], value: T, checked: boolean): T[] =>
  checked ? [...values, value] : values.filter((current) => current !== value);

export const OnboardingPage = () => {
  useDocumentMetadata(
    'Candidate onboarding | Career Portal',
    'Tell Career Portal what opportunities and work settings suit you.',
  );
  const { data, isError, isLoading, refetch } = useGetOnboardingQuery();
  const [updateOnboarding] = useUpdateOnboardingMutation();
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
    trigger,
    watch,
  } = useForm<OnboardingFormValues>({
    defaultValues: emptyOnboardingForm,
    mode: 'onTouched',
    resolver: yupResolver(onboardingSchema),
  });
  const careerStage = watch('careerStage');

  useEffect(() => {
    if (!data) return;
    reset({
      careerStage: data.careerStage,
      city: data.city ?? '',
      college: data.college ?? '',
      degree: data.degree ?? '',
      desiredOpportunities: data.desiredOpportunities,
      graduationYear: data.graduationYear?.toString() ?? '',
      skills: data.skills.join(', '),
      workPreferences: data.workPreferences,
      yearsOfExperience: data.yearsOfExperience?.toString() ?? '',
    });
  }, [data, reset]);

  const goToNextStep = async () => {
    const fields: (keyof OnboardingFormValues)[] =
      activeStep === 0 ? ['careerStage'] : ['desiredOpportunities'];
    const isValid = await trigger(fields, { shouldFocus: true });
    if (!isValid) {
      setValidationSummary('Please complete this step before continuing.');
      return;
    }
    setValidationSummary(null);
    setActiveStep((step) => Math.min(step + 1, stepLabels.length - 1));
  };

  const submitOnboarding = async (values: OnboardingFormValues) => {
    if (values.careerStage === null) return;
    setServerError(null);
    setValidationSummary(null);
    const isEarlyCareer =
      values.careerStage === CareerStage.Student || values.careerStage === CareerStage.Fresher;

    try {
      await updateOnboarding({
        careerStage: values.careerStage,
        city: values.city.trim(),
        college: isEarlyCareer ? values.college.trim() || null : null,
        degree: isEarlyCareer ? values.degree.trim() || null : null,
        desiredOpportunities: values.desiredOpportunities,
        graduationYear:
          isEarlyCareer && values.graduationYear.trim() ? Number(values.graduationYear) : null,
        skills: splitList(values.skills),
        workPreferences: values.workPreferences,
        yearsOfExperience:
          values.careerStage === CareerStage.Experienced ? Number(values.yearsOfExperience) : null,
      }).unwrap();
      setIsComplete(true);
      enqueueSnackbar('Your candidate preferences have been saved.', { variant: 'success' });
    } catch (error: unknown) {
      const hasFieldErrors = applyApiValidationErrors<OnboardingFormValues>(
        error,
        onboardingFields,
        setError,
      );
      setServerError(
        hasFieldErrors
          ? 'Review the highlighted fields and try again.'
          : isDashboardApiError(error)
            ? error.message
            : 'Unable to save your onboarding details. Please try again.',
      );
    }
  };

  if (isLoading) {
    return (
      <Stack aria-label="Loading candidate onboarding" role="status" spacing={3}>
        <Skeleton height={100} variant="rounded" />
        <Skeleton height={560} variant="rounded" />
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        description="Your onboarding details could not be loaded from the server."
        headingLevel="h1"
        onRetry={() => void refetch()}
        title="Onboarding is temporarily unavailable"
      />
    );
  }

  if (isComplete) {
    return (
      <Paper sx={{ mx: 'auto', p: { xs: 3, sm: 5 }, width: 'min(100%, 720px)' }}>
        <Stack spacing={3}>
          <Alert aria-live="polite" severity="success">
            Your candidate profile preferences are ready.
          </Alert>
          <Box>
            <Typography component="h1" variant="h1">
              You are ready to explore opportunities
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              A resume is optional. You can add or manage one from your Candidate dashboard.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} to={ROUTES.RESUME} variant="contained">
              Add an optional resume
            </Button>
            <Button component={Link} to={ROUTES.DASHBOARD} variant="outlined">
              Go to dashboard
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3} sx={{ mx: 'auto', width: 'min(100%, 840px)' }}>
      <Box>
        <Typography color="primary.main" fontWeight={700} variant="overline">
          Candidate setup
        </Typography>
        <Typography component="h1" variant="h1">
          Tell us what you are looking for
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Three short steps help Career Portal focus your job discovery experience.
        </Typography>
      </Box>

      <Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography fontWeight={700} variant="body2">
            Step {activeStep + 1} of {stepLabels.length}: {stepLabels[activeStep]}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {Math.round(((activeStep + 1) / stepLabels.length) * 100)}%
          </Typography>
        </Stack>
        <LinearProgress
          aria-label={`Onboarding progress: step ${activeStep + 1} of ${stepLabels.length}`}
          value={((activeStep + 1) / stepLabels.length) * 100}
          variant="determinate"
        />
      </Box>

      <Paper
        component="form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(submitOnboarding, (formErrors) => {
            setValidationSummary('Please correct the highlighted fields before saving.');
            const firstField = Object.keys(formErrors)[0] as keyof OnboardingFormValues | undefined;
            if (firstField) setFocus(firstField);
          })(event);
        }}
        sx={{ p: { xs: 2.5, sm: 4 } }}
      >
        <Stack spacing={3}>
          {validationSummary ? (
            <Alert aria-live="assertive" severity="error">
              {validationSummary}
            </Alert>
          ) : null}
          {serverError ? (
            <Alert aria-live="assertive" severity="error">
              {serverError}
            </Alert>
          ) : null}

          {activeStep === 0 ? (
            <Controller
              control={control}
              name="careerStage"
              render={({ field }) => (
                <FormControl component="fieldset" error={Boolean(errors.careerStage)}>
                  <FormLabel component="legend">Where are you in your career?</FormLabel>
                  <RadioGroup
                    aria-describedby={
                      errors.careerStage ? 'career-stage-error' : 'career-stage-help'
                    }
                    onChange={(_, value) => field.onChange(Number(value))}
                    value={field.value ?? ''}
                  >
                    {careerStageOptions.map((option) => (
                      <Paper
                        key={option.value}
                        sx={{ border: 1, borderColor: 'divider', mt: 1.5, p: 1.5 }}
                        variant="outlined"
                      >
                        <FormControlLabel
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography fontWeight={700}>{option.label}</Typography>
                              <Typography color="text.secondary" variant="body2">
                                {option.description}
                              </Typography>
                            </Box>
                          }
                          value={option.value}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                  <FormHelperText id="career-stage-help">
                    Choose the option that best describes you today.
                  </FormHelperText>
                  {errors.careerStage ? (
                    <FormHelperText error id="career-stage-error">
                      {errors.careerStage.message}
                    </FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />
          ) : null}

          {activeStep === 1 ? (
            <Controller
              control={control}
              name="desiredOpportunities"
              render={({ field }) => (
                <FormControl component="fieldset" error={Boolean(errors.desiredOpportunities)}>
                  <FormLabel component="legend">What are you looking for?</FormLabel>
                  <Typography color="text.secondary" id="opportunity-help" variant="body2">
                    Select one or more opportunity types.
                  </Typography>
                  <Stack aria-describedby="opportunity-help" sx={{ mt: 1 }}>
                    {opportunityOptions.map((option) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value.includes(option.value)}
                            onChange={(_, checked) =>
                              field.onChange(toggleSelection(field.value, option.value, checked))
                            }
                          />
                        }
                        key={option.value}
                        label={option.label}
                      />
                    ))}
                  </Stack>
                  {errors.desiredOpportunities ? (
                    <FormHelperText>{errors.desiredOpportunities.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />
          ) : null}

          {activeStep === 2 ? (
            <Stack spacing={3}>
              <Box>
                <Typography component="h2" variant="h2">
                  Your preferences
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Add a few details so relevant opportunities are easier to find.
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    autoComplete="address-level2"
                    disabled={isSubmitting}
                    error={Boolean(errors.city)}
                    helperText={errors.city?.message}
                    label="City"
                    required
                    {...register('city')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isSubmitting}
                    error={Boolean(errors.skills)}
                    helperText={errors.skills?.message ?? 'Separate skills with commas.'}
                    label="Skills"
                    required
                    {...register('skills')}
                  />
                </Grid>
              </Grid>

              <Controller
                control={control}
                name="workPreferences"
                render={({ field }) => (
                  <FormControl component="fieldset" error={Boolean(errors.workPreferences)}>
                    <FormLabel component="legend">Preferred work setting (optional)</FormLabel>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ sm: 2 }}>
                      {workPreferenceOptions.map((option) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value.includes(option.value)}
                              disabled={isSubmitting}
                              onChange={(_, checked) =>
                                field.onChange(toggleSelection(field.value, option.value, checked))
                              }
                            />
                          }
                          key={option.value}
                          label={option.label}
                        />
                      ))}
                    </Stack>
                    {errors.workPreferences ? (
                      <FormHelperText>{errors.workPreferences.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />

              <Divider />

              {careerStage === CareerStage.Student || careerStage === CareerStage.Fresher ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      disabled={isSubmitting}
                      error={Boolean(errors.college)}
                      helperText={errors.college?.message ?? 'Optional'}
                      label="College"
                      {...register('college')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      disabled={isSubmitting}
                      error={Boolean(errors.degree)}
                      helperText={errors.degree?.message ?? 'Optional'}
                      label="Degree or course"
                      {...register('degree')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      disabled={isSubmitting}
                      error={Boolean(errors.graduationYear)}
                      helperText={errors.graduationYear?.message ?? 'Optional'}
                      inputProps={{ inputMode: 'numeric' }}
                      label="Graduation year"
                      type="number"
                      {...register('graduationYear')}
                    />
                  </Grid>
                </Grid>
              ) : null}

              {careerStage === CareerStage.Experienced ? (
                <TextField
                  disabled={isSubmitting}
                  error={Boolean(errors.yearsOfExperience)}
                  helperText={errors.yearsOfExperience?.message}
                  inputProps={{ inputMode: 'decimal', min: 0, max: 50, step: 0.5 }}
                  label="Years of experience"
                  required
                  type="number"
                  {...register('yearsOfExperience')}
                />
              ) : null}
            </Stack>
          ) : null}

          <Divider />
          <Stack
            alignItems={{ xs: 'stretch', sm: 'center' }}
            direction={{ xs: 'column-reverse', sm: 'row' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Button component={Link} disabled={isSubmitting} to={ROUTES.DASHBOARD}>
              Skip for now
            </Button>
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5}>
              {activeStep > 0 ? (
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    setServerError(null);
                    setValidationSummary(null);
                    setActiveStep((step) => Math.max(0, step - 1));
                  }}
                  type="button"
                  variant="outlined"
                >
                  Back
                </Button>
              ) : null}
              {activeStep < stepLabels.length - 1 ? (
                <Button
                  disabled={isSubmitting}
                  onClick={() => void goToNextStep()}
                  type="button"
                  variant="contained"
                >
                  Continue
                </Button>
              ) : (
                <Button disabled={isSubmitting} type="submit" variant="contained">
                  {isSubmitting ? (
                    <>
                      <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                      Saving…
                    </>
                  ) : (
                    'Save preferences'
                  )}
                </Button>
              )}
            </Stack>
          </Stack>
          <Typography color="text.secondary" textAlign="center" variant="caption">
            Skipping does not save this form. You can return to onboarding later.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
};
