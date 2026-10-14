import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import {
  isAdminApiError,
  useCreateAdminCompanyMutation,
  useGetAdminCompanyOptionsQuery,
} from '../api/adminApi';
import type { AdminOption } from '../types/adminModels';
import { AtsType, type JobSource, type SaveJobSourceRequest } from '../types/jobSourceModels';
import { sourceRequest } from '../utils/jobSourceFormatting';
import { jobSourceSchema } from '../validation/jobSourceSchema';
import { sourceIdentifierHelp } from '../validation/jobSourceConfiguration';

interface Props {
  source?: JobSource;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (request: SaveJobSourceRequest) => Promise<void>;
}

type CompanyOption = AdminOption & { create?: boolean };
const filterCompanies = createFilterOptions<CompanyOption>();
const normalizeName = (name: string) => name.trim().toLowerCase();

export const JobSourceFormDialog = ({ source, isSaving, error, onClose, onSave }: Props) => {
  const companies = useGetAdminCompanyOptionsQuery();
  const [createCompany, { isLoading: isCreating }] = useCreateAdminCompanyMutation();
  const creating = useRef(false);
  const [createdCompanies, setCreatedCompanies] = useState<AdminOption[]>([]);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaveJobSourceRequest>({
    resolver: yupResolver(jobSourceSchema),
    defaultValues: source
      ? sourceRequest(source)
      : {
          companyId: '',
          careerPageUrl: '',
          atsType: AtsType.Greenhouse,
          atsIdentifier: '',
          isActive: true,
          autoPublishEnabled: true,
          scanIntervalMinutes: 720,
        },
  });
  const busy = isSaving || isSubmitting || isCreating;
  const atsType = watch('atsType');
  const interval = watch('scanIntervalMinutes');
  const options = [
    ...(companies.data ?? []),
    ...createdCompanies.filter(
      (created) => !companies.data?.some((company) => company.id === created.id),
    ),
  ];
  const companyOptions =
    source && !options.some((company) => company.id === source.companyId)
      ? [...options, { id: source.companyId, name: source.companyName, slug: '' }]
      : options;
  const addCompany = async (name: string) => {
    if (creating.current) return;
    const existing = companyOptions.find(
      (company) => normalizeName(company.name) === normalizeName(name),
    );
    if (existing) {
      setValue('companyId', existing.id, { shouldDirty: true, shouldValidate: true });
      return;
    }
    creating.current = true;
    setCompanyError(null);
    try {
      const company = await createCompany({
        name: name.trim(),
        slug: null,
        description: null,
        websiteUrl: null,
        logoUrl: null,
        industry: null,
        location: null,
        employeeCount: null,
        isVerified: false,
      }).unwrap();
      setCreatedCompanies((current) => [...current, company]);
      setValue('companyId', company.id, { shouldDirty: true, shouldValidate: true });
    } catch (cause) {
      setCompanyError(
        isAdminApiError(cause)
          ? [cause.message, ...Object.values(cause.errors ?? {}).flat()].join(' ')
          : 'Company could not be created. Please try again.',
      );
    } finally {
      creating.current = false;
    }
  };
  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={busy ? undefined : onClose}
      aria-labelledby="source-form-title"
    >
      <DialogTitle id="source-form-title">
        {source ? 'Edit Job Source' : 'Add Job Source'}
      </DialogTitle>
      <form
        onSubmit={(event) => {
          if (creating.current) {
            event.preventDefault();
            return;
          }
          void handleSubmit((request) =>
            onSave({ ...request, atsIdentifier: request.atsIdentifier?.trim() || null }),
          )(event);
        }}
        noValidate
      >
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            )}
            {companies.isError && (
              <Alert
                severity="error"
                action={<Button onClick={() => void companies.refetch()}>Retry</Button>}
              >
                Companies could not be loaded.
              </Alert>
            )}
            <Controller
              control={control}
              name="companyId"
              render={({ field }) => (
                <Autocomplete<CompanyOption>
                  options={companyOptions}
                  filterOptions={(options, params) => {
                    const matches = filterCompanies(options, params);
                    const name = params.inputValue.trim();
                    if (
                      !source &&
                      name &&
                      !options.some((option) => normalizeName(option.name) === normalizeName(name))
                    ) {
                      matches.push({ id: '__create__', name, slug: '', create: true });
                    }
                    return matches;
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.create ? `+ Create "${option.name}"` : option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  loading={companies.isLoading}
                  disabled={busy || companies.isLoading || companies.isError}
                  value={companyOptions.find((option) => option.id === field.value) ?? null}
                  onChange={(_, value) => {
                    setCompanyError(null);
                    if (value?.create) void addCompany(value.name);
                    else field.onChange(value?.id ?? '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      label="Company"
                      required
                      error={Boolean(companyError || errors.companyId)}
                      helperText={companyError || errors.companyId?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isCreating && (
                              <CircularProgress size={20} aria-label="Creating company" />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
            <TextField
              {...register('careerPageUrl')}
              label="Career Page URL"
              required
              disabled={busy}
              error={Boolean(errors.careerPageUrl)}
              helperText={errors.careerPageUrl?.message}
            />
            <Controller
              control={control}
              name="atsType"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="ATS Type"
                  disabled={busy}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                >
                  {[
                    AtsType.Greenhouse,
                    AtsType.Lever,
                    AtsType.Ashby,
                    AtsType.Custom,
                    AtsType.SuccessFactors,
                    AtsType.Workday,
                  ].map((type) => (
                    <MenuItem key={type} value={type}>
                      {AtsType[type]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {atsType === AtsType.Custom && (
              <Alert severity="warning">
                Custom configurations can be saved, but the current backend has no Custom
                aggregation provider.
              </Alert>
            )}
            <TextField
              {...register('atsIdentifier')}
              label="ATS Identifier"
              disabled={busy}
              error={Boolean(errors.atsIdentifier)}
              helperText={errors.atsIdentifier?.message ?? sourceIdentifierHelp[atsType]}
            />
            <Controller
              control={control}
              name="scanIntervalMinutes"
              render={({ field }) => (
                <TextField
                  select
                  label="Scan Interval preset"
                  value={[60, 360, 720, 1440].includes(interval) ? interval : ''}
                  disabled={busy}
                  onChange={(event) => {
                    if (event.target.value) field.onChange(Number(event.target.value));
                  }}
                >
                  <MenuItem value="">Custom interval</MenuItem>
                  {[60, 360, 720, 1440].map((minutes) => (
                    <MenuItem key={minutes} value={minutes}>
                      {minutes / 60} {minutes === 60 ? 'hour' : 'hours'}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              {...register('scanIntervalMinutes')}
              type="number"
              label="Scan Interval (minutes)"
              disabled={busy}
              required
              error={Boolean(errors.scanIntervalMinutes)}
              helperText={errors.scanIntervalMinutes?.message ?? 'Between 1 and 10,080 minutes.'}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <FormControlLabel
                  label="Active"
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                      disabled={busy}
                    />
                  }
                />
              )}
            />
            <Stack spacing={0.5}>
              <Controller
                control={control}
                name="autoPublishEnabled"
                render={({ field }) => (
                  <FormControlLabel
                    label="Auto Publish"
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                        disabled={busy}
                        inputRef={field.ref}
                        onBlur={field.onBlur}
                        slotProps={{ input: { 'aria-describedby': 'auto-publish-help' } }}
                      />
                    }
                  />
                )}
              />
              <Typography id="auto-publish-help" variant="body2" color="text.secondary">
                Automatically publish eligible jobs imported from this source.
              </Typography>
            </Stack>
            <Typography variant="body2">
              Category: {source?.categoryName ?? 'Not configured'}. Category mappings are managed by
              server configuration and cannot be edited here.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={busy || companies.isLoading || companies.isError}
          >
            {isCreating ? 'Creating company…' : busy ? 'Saving…' : 'Save Job Source'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
