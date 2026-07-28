import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { applyApiValidationErrors } from '@/api/formErrors';
import {
  employmentTypeOptions,
  experienceLevelOptions,
  workplaceTypeOptions,
} from '@/features/jobs/constants/jobOptions';
import { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';
import type { AdminJob, AdminJobRequest, DistributionChartPoint } from '../types/adminModels';
import { toDateTimeLocalValue } from '../utils/adminFormatting';
import { adminJobSchema, type AdminJobFormValues } from '../validation/adminJobSchema';

const emptyValues: AdminJobFormValues = {
  applicationUrl: '',
  benefits: '',
  categoryId: '',
  companyId: '',
  currencyCode: 'INR',
  description: '',
  employmentType: EmploymentType.FullTime,
  experienceLevel: ExperienceLevel.Entry,
  expiresAtUtc: '',
  location: '',
  maximumSalary: null,
  minimumSalary: null,
  requirements: '',
  responsibilities: '',
  title: '',
  workplaceType: WorkplaceType.OnSite,
};

const valuesFromJob = (job?: AdminJob): AdminJobFormValues =>
  job
    ? {
        applicationUrl: '',
        benefits: job.benefits ?? '',
        categoryId: job.categoryId,
        companyId: job.companyId,
        currencyCode: job.currencyCode,
        description: job.description,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        expiresAtUtc: toDateTimeLocalValue(job.expiresAtUtc),
        location: job.location ?? '',
        maximumSalary: job.maximumSalary,
        minimumSalary: job.minimumSalary,
        requirements: job.requirements ?? '',
        responsibilities: job.responsibilities ?? '',
        title: job.title,
        workplaceType: job.workplaceType,
      }
    : emptyValues;

const toRequest = (values: AdminJobFormValues): AdminJobRequest => ({
  applicationUrl: values.applicationUrl.trim(),
  benefits: values.benefits.trim() || null,
  categoryId: values.categoryId,
  companyId: values.companyId,
  currencyCode: values.currencyCode.trim().toUpperCase(),
  description: values.description.trim(),
  employmentType: values.employmentType,
  experienceLevel: values.experienceLevel,
  expiresAtUtc: values.expiresAtUtc ? new Date(values.expiresAtUtc).toISOString() : null,
  location: values.location.trim() || null,
  maximumSalary: values.maximumSalary,
  minimumSalary: values.minimumSalary,
  requirements: values.requirements.trim() || null,
  responsibilities: values.responsibilities.trim() || null,
  title: values.title.trim(),
  workplaceType: values.workplaceType,
});

interface AdminJobFormProps {
  categories: DistributionChartPoint[];
  companies: DistributionChartPoint[];
  initialJob?: AdminJob;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (request: AdminJobRequest) => Promise<void>;
  serverFieldErrors?: Record<string, string[]>;
  serverError?: string | null;
  submitLabel: string;
}

export const AdminJobForm = ({
  categories,
  companies,
  initialJob,
  isSaving,
  onCancel,
  onSubmit,
  serverFieldErrors,
  serverError,
  submitLabel,
}: AdminJobFormProps) => {
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus,
  } = useForm<AdminJobFormValues>({
    defaultValues: valuesFromJob(initialJob),
    mode: 'onTouched',
    resolver: yupResolver(adminJobSchema),
  });
  const submissionInProgress = useRef(false);
  const isBusy = isSaving || isSubmitting;

  useEffect(() => {
    reset(valuesFromJob(initialJob));
  }, [initialJob, reset]);

  useEffect(() => {
    if (!serverFieldErrors) return;
    applyApiValidationErrors<AdminJobFormValues>(
      { errors: serverFieldErrors, status: 400 },
      [
        'applicationUrl',
        'benefits',
        'categoryId',
        'companyId',
        'currencyCode',
        'description',
        'employmentType',
        'experienceLevel',
        'expiresAtUtc',
        'location',
        'maximumSalary',
        'minimumSalary',
        'requirements',
        'responsibilities',
        'title',
        'workplaceType',
      ],
      setError,
    );
  }, [serverFieldErrors, setError]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isDirty]);

  const handleCancel = () => {
    if (!isDirty || window.confirm('Discard your unsaved job changes?')) onCancel();
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack
        component="form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(
            async (values) => {
              if (submissionInProgress.current) return;
              submissionInProgress.current = true;
              try {
                await onSubmit(toRequest(values));
              } finally {
                submissionInProgress.current = false;
              }
            },
            (formErrors) => {
              const firstField = Object.keys(formErrors)[0] as keyof AdminJobFormValues | undefined;
              if (firstField) setFocus(firstField);
            },
          )(event);
        }}
        spacing={3}
      >
        {serverError ? (
          <Alert aria-live="assertive" severity="error">
            {serverError}
          </Alert>
        ) : null}

        <Typography component="h2" variant="h3">
          Role details
        </Typography>
        <TextField
          disabled={isBusy}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          label="Job title"
          required
          {...register('title')}
        />
        <TextField
          disabled={isBusy}
          error={Boolean(errors.description)}
          helperText={errors.description?.message ?? 'Plain text · maximum 16,000 characters'}
          label="Description"
          minRows={6}
          multiline
          required
          {...register('description')}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              defaultValue={initialJob?.companyId ?? ''}
              disabled={isBusy}
              error={Boolean(errors.companyId)}
              helperText={
                errors.companyId?.message ??
                'Top 50 companies from the dashboard distribution endpoint.'
              }
              label="Company"
              required
              select
              {...register('companyId')}
            >
              <MenuItem value="">Select a company</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              defaultValue={initialJob?.categoryId ?? ''}
              disabled={isBusy}
              error={Boolean(errors.categoryId)}
              helperText={
                errors.categoryId?.message ??
                'Top 50 categories from the dashboard distribution endpoint.'
              }
              label="Category"
              required
              select
              {...register('categoryId')}
            >
              <MenuItem value="">Select a category</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <TextField
          disabled={isBusy}
          error={Boolean(errors.applicationUrl)}
          helperText={
            errors.applicationUrl?.message ??
            (initialJob
              ? 'The backend does not return the existing private application URL. Enter it again to save edits.'
              : 'Absolute HTTP or HTTPS URL')
          }
          label="Application URL"
          required
          type="url"
          {...register('applicationUrl')}
        />

        <Divider />
        <Typography component="h2" variant="h3">
          Classification
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              defaultValue={initialJob?.employmentType ?? EmploymentType.FullTime}
              disabled={isBusy}
              error={Boolean(errors.employmentType)}
              helperText={errors.employmentType?.message}
              label="Employment type"
              select
              {...register('employmentType', { valueAsNumber: true })}
            >
              {employmentTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              defaultValue={initialJob?.workplaceType ?? WorkplaceType.OnSite}
              disabled={isBusy}
              error={Boolean(errors.workplaceType)}
              helperText={errors.workplaceType?.message}
              label="Work mode"
              select
              {...register('workplaceType', { valueAsNumber: true })}
            >
              {workplaceTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              defaultValue={initialJob?.experienceLevel ?? ExperienceLevel.Entry}
              disabled={isBusy}
              error={Boolean(errors.experienceLevel)}
              helperText={errors.experienceLevel?.message}
              label="Experience level"
              select
              {...register('experienceLevel', { valueAsNumber: true })}
            >
              {experienceLevelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <TextField
          disabled={isBusy}
          error={Boolean(errors.location)}
          helperText={errors.location?.message ?? 'Optional'}
          label="Location"
          {...register('location')}
        />

        <Divider />
        <Typography component="h2" variant="h3">
          Compensation and closing
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.minimumSalary)}
              helperText={errors.minimumSalary?.message ?? 'Optional'}
              inputProps={{ min: 0 }}
              label="Minimum salary"
              type="number"
              {...register('minimumSalary', {
                setValueAs: (value: string) => (value === '' ? null : Number(value)),
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.maximumSalary)}
              helperText={errors.maximumSalary?.message ?? 'Optional'}
              inputProps={{ min: 0 }}
              label="Maximum salary"
              type="number"
              {...register('maximumSalary', {
                setValueAs: (value: string) => (value === '' ? null : Number(value)),
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.currencyCode)}
              helperText={errors.currencyCode?.message}
              inputProps={{ maxLength: 3 }}
              label="Currency"
              required
              {...register('currencyCode')}
            />
          </Grid>
        </Grid>
        <TextField
          disabled={isBusy}
          error={Boolean(errors.expiresAtUtc)}
          helperText={errors.expiresAtUtc?.message ?? 'Optional · must be in the future'}
          InputLabelProps={{ shrink: true }}
          label="Closing date and time"
          type="datetime-local"
          {...register('expiresAtUtc')}
        />

        <Divider />
        <Typography component="h2" variant="h3">
          Supporting information
        </Typography>
        <TextField
          disabled={isBusy}
          error={Boolean(errors.responsibilities)}
          helperText={errors.responsibilities?.message ?? 'Optional · plain text'}
          label="Responsibilities"
          minRows={4}
          multiline
          {...register('responsibilities')}
        />
        <TextField
          disabled={isBusy}
          error={Boolean(errors.requirements)}
          helperText={errors.requirements?.message ?? 'Optional · plain text'}
          label="Requirements"
          minRows={4}
          multiline
          {...register('requirements')}
        />
        <TextField
          disabled={isBusy}
          error={Boolean(errors.benefits)}
          helperText={errors.benefits?.message ?? 'Optional · plain text'}
          label="Benefits"
          minRows={3}
          multiline
          {...register('benefits')}
        />

        <Alert severity="info">
          New jobs are created as Draft by the backend. Publishing, visibility, featured status, and
          archiving are managed from the jobs list.
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button disabled={isBusy} type="submit" variant="contained">
            {isBusy ? 'Saving…' : submitLabel}
          </Button>
          <Button disabled={isBusy} onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
