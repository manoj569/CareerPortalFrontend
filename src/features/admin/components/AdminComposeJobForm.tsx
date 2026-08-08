import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  employmentTypeOptions,
  experienceLevelOptions,
  workplaceTypeOptions,
} from '@/features/jobs/constants/jobOptions';
import type { ComposeJobRequest } from '../types/adminModels';

export interface ComposeJobFormValues {
  title: string;
  description: string;
  applicationUrl: string;
  employmentType: number | '';
  workMode: number | '';
  experienceLevel: number | '';
  location: string;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currency: string;
  closingDateUtc: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  companyName: string;
  companyWebsiteUrl: string;
  companyIndustry: string;
  companyLocation: string;
  companyDescription: string;
  companyLogoUrl: string;
  companyEmployeeCount: number | null;
  companyIsVerified: boolean;
  categoryName: string;
  categoryDescription: string;
  categoryDisplayOrder: number;
  recruiterName: string;
  recruiterRole: string;
  recruiterEmail: string;
  recruiterPhoneNumber: string;
  recruiterSharingApproved: boolean;
}

const optionalUrl = yup
  .string()
  .defined()
  .trim()
  .test('url', 'Enter an absolute HTTP or HTTPS URL.', (value) => {
    if (!value) return true;
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  });

const schema = yup.object({
  title: yup.string().defined().trim().required('Job title is required.').max(250),
  description: yup.string().defined().trim().max(16000),
  applicationUrl: optionalUrl,
  employmentType: yup.mixed<number | ''>().defined(),
  workMode: yup.mixed<number | ''>().defined(),
  experienceLevel: yup.mixed<number | ''>().defined(),
  location: yup.string().defined().trim().max(250),
  minimumSalary: yup.number().nullable().defined().min(0),
  maximumSalary: yup.number().nullable().defined().min(0),
  currency: yup.string().defined().trim().max(3),
  closingDateUtc: yup.string().defined(),
  responsibilities: yup.string().defined().trim().max(8000),
  requirements: yup.string().defined().trim().max(8000),
  benefits: yup.string().defined().trim().max(4000),
  companyName: yup.string().defined().trim().required('Company name is required.').max(200),
  companyWebsiteUrl: optionalUrl,
  companyIndustry: yup.string().defined().trim().max(150),
  companyLocation: yup.string().defined().trim().max(250),
  companyDescription: yup.string().defined().trim().max(4000),
  companyLogoUrl: optionalUrl,
  companyEmployeeCount: yup.number().nullable().defined().integer().min(0),
  companyIsVerified: yup.boolean().defined(),
  categoryName: yup.string().defined().trim().required('Category name is required.').max(150),
  categoryDescription: yup.string().defined().trim().max(1000),
  categoryDisplayOrder: yup.number().defined().integer().min(0),
  recruiterName: yup.string().defined().trim().max(200),
  recruiterRole: yup.string().defined().trim().max(200),
  recruiterEmail: yup.string().defined().trim().email('Enter a valid email address.'),
  recruiterPhoneNumber: yup.string().defined().trim().max(50),
  recruiterSharingApproved: yup.boolean().defined(),
});

const blankToNull = (value: string): string | null => value.trim() || null;
// Exported for deterministic contract tests alongside the form that owns the mapping.
// eslint-disable-next-line react-refresh/only-export-components
export const buildComposeJobRequest = (values: ComposeJobFormValues): ComposeJobRequest => ({
  job: {
    title: values.title.trim(),
    description: blankToNull(values.description),
    applicationUrl: blankToNull(values.applicationUrl),
    employmentType: values.employmentType === '' ? null : values.employmentType,
    workMode: values.workMode === '' ? null : values.workMode,
    experienceLevel: values.experienceLevel === '' ? null : values.experienceLevel,
    location: blankToNull(values.location),
    minimumSalary: values.minimumSalary,
    maximumSalary: values.maximumSalary,
    currency: blankToNull(values.currency)?.toUpperCase() ?? null,
    closingDateUtc: values.closingDateUtc ? new Date(values.closingDateUtc).toISOString() : null,
    responsibilities: blankToNull(values.responsibilities),
    requirements: blankToNull(values.requirements),
    benefits: blankToNull(values.benefits),
  },
  company: {
    existingId: null,
    new: {
      name: values.companyName.trim(),
      slug: null,
      description: blankToNull(values.companyDescription),
      websiteUrl: blankToNull(values.companyWebsiteUrl),
      logoUrl: blankToNull(values.companyLogoUrl),
      industry: blankToNull(values.companyIndustry),
      location: blankToNull(values.companyLocation),
      employeeCount: values.companyEmployeeCount,
      isVerified: values.companyIsVerified,
    },
  },
  category: {
    existingId: null,
    new: {
      name: values.categoryName.trim(),
      slug: null,
      description: blankToNull(values.categoryDescription),
      displayOrder: values.categoryDisplayOrder,
      parentCategoryId: null,
    },
  },
  recruiterContact:
    values.recruiterName.trim() ||
    values.recruiterRole.trim() ||
    values.recruiterEmail.trim() ||
    values.recruiterPhoneNumber.trim()
      ? {
          name: blankToNull(values.recruiterName),
          role: blankToNull(values.recruiterRole),
          email: blankToNull(values.recruiterEmail),
          phoneNumber: blankToNull(values.recruiterPhoneNumber),
          sharingApproved: values.recruiterSharingApproved,
        }
      : null,
});

const defaults: ComposeJobFormValues = {
  title: '',
  description: '',
  applicationUrl: '',
  employmentType: '',
  workMode: '',
  experienceLevel: '',
  location: '',
  minimumSalary: null,
  maximumSalary: null,
  currency: '',
  closingDateUtc: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  companyName: '',
  companyWebsiteUrl: '',
  companyIndustry: '',
  companyLocation: '',
  companyDescription: '',
  companyLogoUrl: '',
  companyEmployeeCount: null,
  companyIsVerified: false,
  categoryName: '',
  categoryDescription: '',
  categoryDisplayOrder: 0,
  recruiterName: '',
  recruiterRole: '',
  recruiterEmail: '',
  recruiterPhoneNumber: '',
  recruiterSharingApproved: false,
};

interface Props {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (request: ComposeJobRequest) => Promise<void>;
  serverError?: string | null;
  serverFieldErrors?: Record<string, string[]>;
}

export const AdminComposeJobForm = ({
  isSaving,
  onCancel,
  onSubmit,
  serverError,
  serverFieldErrors,
}: Props) => {
  const pending = useRef(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm<ComposeJobFormValues>({
    defaultValues: defaults,
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });
  const busy = isSaving || isSubmitting;
  useEffect(() => {
    if (!serverFieldErrors) return;
    const aliases: Record<string, keyof ComposeJobFormValues> = {
      'job.title': 'title',
      title: 'title',
      'job.description': 'description',
      description: 'description',
      'job.applicationurl': 'applicationUrl',
      applicationurl: 'applicationUrl',
      'job.employmenttype': 'employmentType',
      'job.workmode': 'workMode',
      'job.experiencelevel': 'experienceLevel',
      'job.location': 'location',
      'job.minimumsalary': 'minimumSalary',
      'job.maximumsalary': 'maximumSalary',
      'job.currency': 'currency',
      'job.closingdateutc': 'closingDateUtc',
      'job.responsibilities': 'responsibilities',
      'job.requirements': 'requirements',
      'job.benefits': 'benefits',
      'company.new.name': 'companyName',
      'company.new.websiteurl': 'companyWebsiteUrl',
      'company.new.logourl': 'companyLogoUrl',
      'company.new.industry': 'companyIndustry',
      'company.new.location': 'companyLocation',
      'company.new.description': 'companyDescription',
      'company.new.employeecount': 'companyEmployeeCount',
      company: 'companyName',
      'category.new.name': 'categoryName',
      'category.new.description': 'categoryDescription',
      'category.new.displayorder': 'categoryDisplayOrder',
      category: 'categoryName',
      'recruitercontact.name': 'recruiterName',
      'recruitercontact.role': 'recruiterRole',
      'recruitercontact.email': 'recruiterEmail',
      'recruitercontact.phonenumber': 'recruiterPhoneNumber',
    };
    for (const [field, messages] of Object.entries(serverFieldErrors)) {
      const target = aliases[field.toLowerCase()];
      if (target && messages[0]) setError(target, { message: messages[0], type: 'server' });
    }
  }, [serverFieldErrors, setError]);

  return (
    <Paper sx={{ p: { xs: 2.5, md: 4 } }}>
      <Stack
        component="form"
        noValidate
        spacing={3}
        onSubmit={(event) => {
          void handleSubmit(
            async (values) => {
              if (pending.current) return;
              pending.current = true;
              try {
                await onSubmit(buildComposeJobRequest(values));
              } finally {
                pending.current = false;
              }
            },
            (validationErrors) => {
              const first = Object.keys(validationErrors)[0] as
                keyof ComposeJobFormValues | undefined;
              if (first) setFocus(first);
            },
          )(event);
        }}
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
          disabled={busy}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          label="Job title"
          required
          {...register('title')}
        />
        <TextField
          disabled={busy}
          error={Boolean(errors.description)}
          helperText={errors.description?.message ?? 'Optional · plain text'}
          label="Job description"
          multiline
          minRows={5}
          {...register('description')}
        />
        <Divider />
        <Typography component="h2" variant="h3">
          Company details
        </Typography>
        <TextField
          disabled={busy}
          error={Boolean(errors.companyName)}
          helperText={errors.companyName?.message}
          label="Company name"
          required
          {...register('companyName')}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              disabled={busy}
              error={Boolean(errors.companyWebsiteUrl)}
              helperText={errors.companyWebsiteUrl?.message}
              label="Website URL"
              type="url"
              {...register('companyWebsiteUrl')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              disabled={busy}
              error={Boolean(errors.companyLogoUrl)}
              helperText={errors.companyLogoUrl?.message}
              label="Logo URL"
              type="url"
              {...register('companyLogoUrl')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField disabled={busy} label="Industry" {...register('companyIndustry')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField disabled={busy} label="Company location" {...register('companyLocation')} />
          </Grid>
        </Grid>
        <TextField
          disabled={busy}
          label="Company description"
          minRows={3}
          multiline
          {...register('companyDescription')}
        />
        <TextField
          disabled={busy}
          error={Boolean(errors.companyEmployeeCount)}
          helperText={errors.companyEmployeeCount?.message}
          inputProps={{ min: 0 }}
          label="Employee count"
          type="number"
          {...register('companyEmployeeCount', {
            setValueAs: (value: string) => (value === '' ? null : Number(value)),
          })}
        />
        <Controller
          control={control}
          name="companyIsVerified"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  disabled={busy}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              }
              label="Verified company"
            />
          )}
        />
        <Divider />
        <Typography component="h2" variant="h3">
          Category details
        </Typography>
        <TextField
          disabled={busy}
          error={Boolean(errors.categoryName)}
          helperText={errors.categoryName?.message}
          label="Category name"
          required
          {...register('categoryName')}
        />
        <TextField
          disabled={busy}
          label="Category description"
          minRows={3}
          multiline
          {...register('categoryDescription')}
        />
        <TextField
          disabled={busy}
          error={Boolean(errors.categoryDisplayOrder)}
          helperText={errors.categoryDisplayOrder?.message}
          inputProps={{ min: 0 }}
          label="Display order"
          type="number"
          {...register('categoryDisplayOrder', { valueAsNumber: true })}
        />
        <Divider />
        <Typography component="h2" variant="h3">
          Job details
        </Typography>
        <TextField
          disabled={busy}
          error={Boolean(errors.applicationUrl)}
          helperText={errors.applicationUrl?.message ?? 'Optional · absolute HTTP or HTTPS URL'}
          label="Application URL"
          type="url"
          {...register('applicationUrl')}
        />
        <Grid container spacing={2}>
          {[
            ['employmentType', 'Employment type', employmentTypeOptions],
            ['workMode', 'Work mode', workplaceTypeOptions],
            ['experienceLevel', 'Experience level', experienceLevelOptions],
          ].map(([name, label, options]) => (
            <Grid key={name as string} size={{ xs: 12, sm: 4 }}>
              <TextField
                defaultValue=""
                disabled={busy}
                label={label as string}
                select
                {...register(name as 'employmentType', {
                  setValueAs: (v: string) => (v === '' ? '' : Number(v)),
                })}
              >
                <MenuItem value="">Not specified</MenuItem>
                {(options as typeof employmentTypeOptions).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ))}
        </Grid>
        <TextField disabled={busy} label="Job location" {...register('location')} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              disabled={busy}
              label="Minimum salary"
              type="number"
              {...register('minimumSalary', {
                setValueAs: (v: string) => (v === '' ? null : Number(v)),
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              disabled={busy}
              label="Maximum salary"
              type="number"
              {...register('maximumSalary', {
                setValueAs: (v: string) => (v === '' ? null : Number(v)),
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              disabled={busy}
              label="Currency"
              inputProps={{ maxLength: 3 }}
              {...register('currency')}
            />
          </Grid>
        </Grid>
        <TextField
          disabled={busy}
          InputLabelProps={{ shrink: true }}
          label="Closing date and time"
          type="datetime-local"
          {...register('closingDateUtc')}
        />
        {(['responsibilities', 'requirements', 'benefits'] as const).map((name) => (
          <TextField
            disabled={busy}
            key={name}
            label={name.charAt(0).toUpperCase() + name.slice(1)}
            multiline
            minRows={3}
            {...register(name)}
          />
        ))}
        <Divider />
        <Typography component="h2" variant="h3">
          Recruiter contact (optional)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField disabled={busy} label="Recruiter name" {...register('recruiterName')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField disabled={busy} label="Recruiter role" {...register('recruiterRole')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              disabled={busy}
              error={Boolean(errors.recruiterEmail)}
              helperText={errors.recruiterEmail?.message}
              label="Recruiter email"
              type="email"
              {...register('recruiterEmail')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              disabled={busy}
              label="Recruiter phone number"
              type="tel"
              {...register('recruiterPhoneNumber')}
            />
          </Grid>
        </Grid>
        <Controller
          control={control}
          name="recruiterSharingApproved"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  disabled={busy}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              }
              label="I have permission to share these recruiter contact details with premium candidates."
            />
          )}
        />
        <Alert severity="info">
          The company, category, and Draft job are created atomically. Publishing remains a separate
          Jobs action.
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button disabled={busy} type="submit" variant="contained">
            {busy ? 'Saving…' : 'Create draft'}
          </Button>
          <Button disabled={busy} onClick={onCancel} variant="outlined">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
