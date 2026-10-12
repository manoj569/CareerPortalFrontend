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
  salaryPeriodOptions,
  workplaceTypeOptions,
} from '@/features/jobs/constants/jobOptions';
import {
  EmploymentType,
  ExperienceLevel,
  WorkplaceType,
} from '@/features/jobs/types/jobModels';
import type { AdminJob, AdminJobRequest } from '../types/adminModels';
import { toDateTimeLocalValue } from '../utils/adminFormatting';
import {
  adminJobSchema,
  type AdminJobFormValues,
} from '../validation/adminJobSchema';

const emptyValues: AdminJobFormValues = {
  applicationUrl: '',
  benefits: '',
  categoryId: '',
  companyId: '',
  currencyCode: '',
  description: '',

  employmentType: EmploymentType.Unknown,
  workplaceType: WorkplaceType.Unknown,
  experienceLevel: ExperienceLevel.Unknown,

  minimumExperienceYears: null,
  maximumExperienceYears: null,

  salaryPeriod: null,
  minimumSalary: null,
  maximumSalary: null,

  expiresAtUtc: '',
  location: '',
  requirements: '',
  responsibilities: '',
  title: '',
};

const valuesFromJob = (job?: AdminJob): AdminJobFormValues =>
  job
    ? {
        applicationUrl: job.applicationUrl ?? '',
        benefits: job.benefits ?? '',
        categoryId: job.categoryId ?? '',
        companyId: job.companyId,
        currencyCode: job.currencyCode ?? '',
        description: job.description,

        employmentType: job.employmentType ?? EmploymentType.Unknown,
        workplaceType: job.workplaceType ?? WorkplaceType.Unknown,
        experienceLevel: job.experienceLevel ?? ExperienceLevel.Unknown,

        minimumExperienceYears: job.minimumExperienceYears ?? null,
        maximumExperienceYears: job.maximumExperienceYears ?? null,

        minimumSalary: job.minimumSalary,
        maximumSalary: job.maximumSalary,
        salaryPeriod: job.salaryPeriod ?? null,

        expiresAtUtc: toDateTimeLocalValue(job.expiresAtUtc),
        location: job.location ?? '',
        requirements: job.requirements ?? '',
        responsibilities: job.responsibilities ?? '',
        title: job.title,
      }
    : emptyValues;

const toRequest = (
  values: AdminJobFormValues,
  initialJob?: AdminJob,
): AdminJobRequest => ({
  applicationUrl: values.applicationUrl.trim(),
  benefits: values.benefits.trim() || null,

  categoryId: values.categoryId || null,
  companyId: values.companyId,

  currencyCode: values.currencyCode.trim()
    ? values.currencyCode.trim().toUpperCase()
    : null,

  description: values.description.trim(),

  employmentType: values.employmentType,
  workplaceType: values.workplaceType,

  /*
   * This legacy value remains in the request only because the backend
   * contract still contains ExperienceLevel.
   *
   * Unknown = 0 prevents us from fabricating Entry/Junior/Mid/etc.
   */
  experienceLevel: values.experienceLevel,

  minimumExperienceYears: values.minimumExperienceYears,
  maximumExperienceYears: values.maximumExperienceYears,

  minimumSalary: values.minimumSalary,
  maximumSalary: values.maximumSalary,
  salaryPeriod: values.salaryPeriod,

  expiresAtUtc: values.expiresAtUtc
    ? new Date(values.expiresAtUtc).toISOString()
    : null,

  location: values.location.trim() || null,

  requirements: values.requirements.trim() || null,
  responsibilities: values.responsibilities.trim() || null,

  /*
   * These fields are supported by the backend Create/Update contract.
   * This form does not currently expose them, so preserve existing
   * values when editing and use neutral values for a new job.
   */
  internshipDurationMonths:
    initialJob?.internshipDurationMonths ?? null,

  isFlexibleDuration:
    initialJob?.isFlexibleDuration ?? false,

  department:
    initialJob?.department ?? null,

  roleCategory:
    initialJob?.roleCategory ?? null,

  educationRequirement:
    initialJob?.educationRequirement ?? null,

  /*
   * Preserve existing override metadata.
   * We do not fabricate override-field names here.
   */
  manualOverrideFields:
    initialJob?.manualOverrideFields ?? [],

  title: values.title.trim(),
});

interface AdminJobFormProps {
  categories: Array<{
    id: string;
    label?: string;
    name?: string;
  }>;

  companies: Array<{
    id: string;
    label?: string;
    name?: string;
  }>;

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
    formState: {
      errors,
      isDirty,
      isSubmitting,
    },
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
    if (!serverFieldErrors) {
      return;
    }

    applyApiValidationErrors<AdminJobFormValues>(
      {
        errors: serverFieldErrors,
        status: 400,
      },
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
        'maximumExperienceYears',
        'maximumSalary',
        'minimumExperienceYears',
        'minimumSalary',
        'requirements',
        'responsibilities',
        'salaryPeriod',
        'title',
        'workplaceType',
      ],
      setError,
    );
  }, [serverFieldErrors, setError]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('beforeunload', warnBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
    };
  }, [isDirty]);

  const handleCancel = () => {
    if (
      !isDirty ||
      window.confirm('Discard your unsaved job changes?')
    ) {
      onCancel();
    }
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack
        component="form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(
            async (values) => {
              if (submissionInProgress.current) {
                return;
              }

              submissionInProgress.current = true;

              try {
                await onSubmit(
                  toRequest(values, initialJob),
                );
              } finally {
                submissionInProgress.current = false;
              }
            },
            (formErrors) => {
              const firstField = Object.keys(
                formErrors,
              )[0] as
                | keyof AdminJobFormValues
                | undefined;

              if (firstField) {
                setFocus(firstField);
              }
            },
          )(event);
        }}
        spacing={3}
      >
        {serverError ? (
          <Alert
            aria-live="assertive"
            severity="error"
          >
            {serverError}
          </Alert>
        ) : null}

        {/* Required by the backend for backward compatibility.
            The Admin UI intentionally does not ask the user to
            fabricate a legacy experience classification. */}
        <input
          type="hidden"
          {...register('experienceLevel', {
            valueAsNumber: true,
          })}
        />

        <Typography
          component="h2"
          variant="h3"
        >
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
          helperText={
            errors.description?.message ??
            'Plain text · maximum 16,000 characters'
          }
          label="Description"
          minRows={6}
          multiline
          required
          {...register('description')}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.companyId)}
              helperText={
                errors.companyId?.message ??
                'Select the company associated with this job.'
              }
              label="Company"
              required
              select
              {...register('companyId')}
            >
              <MenuItem value="">
                Select a company
              </MenuItem>

              {companies.map((company) => (
                <MenuItem
                  key={company.id}
                  value={company.id}
                >
                  {company.name ?? company.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.categoryId)}
              helperText={
                errors.categoryId?.message ??
                'Select the most appropriate category.'
              }
              label="Category"
              required
              select
              {...register('categoryId')}
            >
              <MenuItem value="">
                Select a category
              </MenuItem>

              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name ?? category.label}
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
            'Absolute HTTP or HTTPS application URL'
          }
          label="Application URL"
          required
          type="url"
          {...register('applicationUrl')}
        />

        <Divider />

        <Typography
          component="h2"
          variant="h3"
        >
          Classification
        </Typography>

        <Alert severity="info">
          Use only information supported by the job posting.
          Leave employment type or work mode as Not specified
          when the posting does not provide reliable evidence.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.employmentType)}
              helperText={
                errors.employmentType?.message ??
                'Do not assume Full time when it is not stated.'
              }
              label="Employment type"
              select
              {...register('employmentType', {
                valueAsNumber: true,
              })}
            >
              <MenuItem value={EmploymentType.Unknown}>
                Not specified
              </MenuItem>

              {employmentTypeOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.workplaceType)}
              helperText={
                errors.workplaceType?.message ??
                'An office location alone does not prove On site.'
              }
              label="Work mode"
              select
              {...register('workplaceType', {
                valueAsNumber: true,
              })}
            >
              <MenuItem value={WorkplaceType.Unknown}>
                Not specified
              </MenuItem>

              {workplaceTypeOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Typography
          component="h3"
          variant="h6"
        >
          Experience requirement
        </Typography>

        <Typography
          color="text.secondary"
          variant="body2"
        >
          Enter the exact experience stated in the job
          description. For example, “3+ years” means minimum
          3 and no maximum.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(
                errors.minimumExperienceYears,
              )}
              helperText={
                errors.minimumExperienceYears?.message ??
                'Optional · whole years'
              }
              inputProps={{
                min: 0,
                max: 60,
                step: 1,
              }}
              label="Minimum experience (years)"
              type="number"
              {...register(
                'minimumExperienceYears',
                {
                  setValueAs: (value: string) =>
                    value === ''
                      ? null
                      : Number(value),
                },
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(
                errors.maximumExperienceYears,
              )}
              helperText={
                errors.maximumExperienceYears?.message ??
                'Optional · leave blank for “X+ years”'
              }
              inputProps={{
                min: 0,
                max: 60,
                step: 1,
              }}
              label="Maximum experience (years)"
              type="number"
              {...register(
                'maximumExperienceYears',
                {
                  setValueAs: (value: string) =>
                    value === ''
                      ? null
                      : Number(value),
                },
              )}
            />
          </Grid>
        </Grid>

        <TextField
          disabled={isBusy}
          error={Boolean(errors.location)}
          helperText={
            errors.location?.message ??
            'Optional · use the location supported by the source'
          }
          label="Location"
          {...register('location')}
        />

        <Divider />

        <Typography
          component="h2"
          variant="h3"
        >
          Compensation and closing
        </Typography>

        <Alert severity="info">
          Leave compensation blank when the job posting does
          not disclose salary. Do not infer currency from the
          job location.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.minimumSalary)}
              helperText={
                errors.minimumSalary?.message ??
                'Optional'
              }
              inputProps={{ min: 0 }}
              label="Minimum salary"
              type="number"
              {...register('minimumSalary', {
                setValueAs: (value: string) =>
                  value === ''
                    ? null
                    : Number(value),
              })}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.maximumSalary)}
              helperText={
                errors.maximumSalary?.message ??
                'Optional'
              }
              inputProps={{ min: 0 }}
              label="Maximum salary"
              type="number"
              {...register('maximumSalary', {
                setValueAs: (value: string) =>
                  value === ''
                    ? null
                    : Number(value),
              })}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.currencyCode)}
              helperText={
                errors.currencyCode?.message ??
                'Required only when salary is provided'
              }
              inputProps={{ maxLength: 3 }}
              label="Currency"
              placeholder="INR"
              {...register('currencyCode')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              disabled={isBusy}
              error={Boolean(errors.salaryPeriod)}
              helperText={
                errors.salaryPeriod?.message ??
                'Required only when salary is provided'
              }
              label="Salary period"
              select
              {...register('salaryPeriod', {
                setValueAs: (value) =>
                  value === '' ||
                  value === null ||
                  value === undefined
                    ? null
                    : Number(value),
              })}
            >
              <MenuItem value="">
                Not specified
              </MenuItem>

              {salaryPeriodOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          disabled={isBusy}
          error={Boolean(errors.expiresAtUtc)}
          helperText={
            errors.expiresAtUtc?.message ??
            'Optional · must be in the future'
          }
          InputLabelProps={{ shrink: true }}
          label="Closing date and time"
          type="datetime-local"
          {...register('expiresAtUtc')}
        />

        <Divider />

        <Typography
          component="h2"
          variant="h3"
        >
          Supporting information
        </Typography>

        <TextField
          disabled={isBusy}
          error={Boolean(errors.responsibilities)}
          helperText={
            errors.responsibilities?.message ??
            'Optional · plain text'
          }
          label="Responsibilities"
          minRows={4}
          multiline
          {...register('responsibilities')}
        />

        <TextField
          disabled={isBusy}
          error={Boolean(errors.requirements)}
          helperText={
            errors.requirements?.message ??
            'Optional · plain text'
          }
          label="Requirements"
          minRows={4}
          multiline
          {...register('requirements')}
        />

        <TextField
          disabled={isBusy}
          error={Boolean(errors.benefits)}
          helperText={
            errors.benefits?.message ??
            'Optional · plain text'
          }
          label="Benefits"
          minRows={3}
          multiline
          {...register('benefits')}
        />

        <Alert severity="info">
          New jobs are created as Draft by the backend.
          Publishing, visibility, featured status and archiving
          are managed from the jobs list.
        </Alert>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
        >
          <Button
            disabled={isBusy}
            type="submit"
            variant="contained"
          >
            {isBusy ? 'Saving…' : submitLabel}
          </Button>

          <Button
            disabled={isBusy}
            onClick={handleCancel}
            variant="outlined"
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};