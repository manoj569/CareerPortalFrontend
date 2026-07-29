import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import type {
  AdminCategory,
  AdminCategoryRequest,
  AdminCompany,
  AdminCompanyRequest,
  AdminOption,
} from '../types/adminModels';
import {
  adminCategorySchema,
  adminCompanySchema,
  type AdminCategoryFormValues,
  type AdminCompanyFormValues,
} from '../validation/adminManagementSchemas';

interface CommonFormProps {
  isSaving: boolean;
  onCancel: () => void;
  serverError?: string | null;
  serverFieldErrors?: Record<string, string[]>;
  submitLabel: string;
}

const BackendErrors = ({
  error,
  fieldErrors,
}: {
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
}) =>
  error ? (
    <Alert aria-live="assertive" severity="error">
      {error}
      {fieldErrors
        ? Object.values(fieldErrors)
            .flat()
            .map((message) => (
              <span key={message}>
                <br />
                {message}
              </span>
            ))
        : null}
    </Alert>
  ) : null;

interface CompanyFormProps extends CommonFormProps {
  initialCompany?: AdminCompany;
  onSubmit: (request: AdminCompanyRequest) => Promise<void>;
}

export const AdminCompanyForm = ({
  initialCompany,
  isSaving,
  onCancel,
  onSubmit,
  serverError,
  serverFieldErrors,
  submitLabel,
}: CompanyFormProps) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AdminCompanyFormValues>({
    defaultValues: {
      description: initialCompany?.description ?? '',
      employeeCount: initialCompany?.employeeCount ?? null,
      industry: initialCompany?.industry ?? '',
      isVerified: initialCompany?.isVerified ?? false,
      location: initialCompany?.location ?? '',
      logoUrl: initialCompany?.logoUrl ?? '',
      name: initialCompany?.name ?? '',
      slug: initialCompany?.slug ?? '',
      websiteUrl: initialCompany?.websiteUrl ?? '',
    },
    resolver: yupResolver(adminCompanySchema),
  });
  const disabled = isSaving || isSubmitting;

  return (
    <Paper
      component="form"
      noValidate
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit({
            description: values.description.trim() || null,
            employeeCount: values.employeeCount,
            industry: values.industry.trim() || null,
            isVerified: values.isVerified,
            location: values.location.trim() || null,
            logoUrl: values.logoUrl.trim() || null,
            name: values.name.trim(),
            slug: values.slug.trim() || null,
            websiteUrl: values.websiteUrl.trim() || null,
          });
        })(event);
      }}
      sx={{ p: { xs: 2.5, md: 4 } }}
    >
      <Stack spacing={2.5}>
        <BackendErrors error={serverError} fieldErrors={serverFieldErrors} />
        <TextField
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          label="Company name"
          {...register('name')}
        />
        <TextField
          error={Boolean(errors.slug)}
          helperText={errors.slug?.message ?? 'Optional; the backend generates one when omitted.'}
          label="Slug"
          {...register('slug')}
        />
        <TextField
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          label="Description"
          minRows={4}
          multiline
          {...register('description')}
        />
        <TextField
          error={Boolean(errors.websiteUrl)}
          helperText={errors.websiteUrl?.message}
          label="Website URL"
          {...register('websiteUrl')}
        />
        <TextField
          error={Boolean(errors.logoUrl)}
          helperText={errors.logoUrl?.message}
          label="Logo URL"
          {...register('logoUrl')}
        />
        <TextField
          error={Boolean(errors.industry)}
          helperText={errors.industry?.message}
          label="Industry"
          {...register('industry')}
        />
        <TextField
          error={Boolean(errors.location)}
          helperText={errors.location?.message}
          label="Location"
          {...register('location')}
        />
        <TextField
          error={Boolean(errors.employeeCount)}
          helperText={errors.employeeCount?.message}
          inputProps={{ min: 0 }}
          label="Employee count"
          type="number"
          {...register('employeeCount', {
            setValueAs: (value: string) => (value === '' ? null : Number(value)),
          })}
        />
        <Controller
          control={control}
          name="isVerified"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onBlur={field.onBlur}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              }
              label="Verified company"
            />
          )}
        />
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" gap={1}>
          <Button disabled={disabled} onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={disabled} type="submit" variant="contained">
            {disabled ? 'Saving…' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

interface CategoryFormProps extends CommonFormProps {
  categoryOptions: AdminOption[];
  initialCategory?: AdminCategory;
  onSubmit: (request: AdminCategoryRequest) => Promise<void>;
}

export const AdminCategoryForm = ({
  categoryOptions,
  initialCategory,
  isSaving,
  onCancel,
  onSubmit,
  serverError,
  serverFieldErrors,
  submitLabel,
}: CategoryFormProps) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AdminCategoryFormValues>({
    defaultValues: {
      description: initialCategory?.description ?? '',
      displayOrder: initialCategory?.displayOrder ?? 0,
      name: initialCategory?.name ?? '',
      parentCategoryId: initialCategory?.parentCategoryId ?? '',
      slug: initialCategory?.slug ?? '',
    },
    resolver: yupResolver(adminCategorySchema),
  });
  const disabled = isSaving || isSubmitting;

  return (
    <Paper
      component="form"
      noValidate
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit({
            description: values.description.trim() || null,
            displayOrder: values.displayOrder,
            name: values.name.trim(),
            parentCategoryId: values.parentCategoryId || null,
            slug: values.slug.trim() || null,
          });
        })(event);
      }}
      sx={{ p: { xs: 2.5, md: 4 } }}
    >
      <Stack spacing={2.5}>
        <BackendErrors error={serverError} fieldErrors={serverFieldErrors} />
        <TextField
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          label="Category name"
          {...register('name')}
        />
        <TextField
          error={Boolean(errors.slug)}
          helperText={errors.slug?.message ?? 'Optional; the backend generates one when omitted.'}
          label="Slug"
          {...register('slug')}
        />
        <TextField
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          label="Description"
          minRows={3}
          multiline
          {...register('description')}
        />
        <TextField
          error={Boolean(errors.displayOrder)}
          helperText={errors.displayOrder?.message}
          inputProps={{ min: 0 }}
          label="Display order"
          type="number"
          {...register('displayOrder', { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="parentCategoryId"
          render={({ field }) => (
            <FormControl error={Boolean(errors.parentCategoryId)} fullWidth>
              <InputLabel id="parent-category-label">Parent category</InputLabel>
              <Select {...field} label="Parent category" labelId="parent-category-label">
                <MenuItem value="">No parent</MenuItem>
                {categoryOptions
                  .filter((option) => option.id !== initialCategory?.id)
                  .map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText>{errors.parentCategoryId?.message}</FormHelperText>
            </FormControl>
          )}
        />
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" gap={1}>
          <Button disabled={disabled} onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={disabled} type="submit" variant="contained">
            {disabled ? 'Saving…' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
