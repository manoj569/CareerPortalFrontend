import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Autocomplete,
  Button,
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
import { useGetAdminCompanyOptionsQuery } from '../api/adminApi';
import { AtsType, type JobSource, type SaveJobSourceRequest } from '../types/jobSourceModels';
import { sourceRequest } from '../utils/jobSourceFormatting';
import { jobSourceSchema } from '../validation/jobSourceSchema';

interface Props {
  source?: JobSource;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (request: SaveJobSourceRequest) => Promise<void>;
}

export const JobSourceFormDialog = ({ source, isSaving, error, onClose, onSave }: Props) => {
  const companies = useGetAdminCompanyOptionsQuery();
  const {
    control,
    register,
    watch,
    handleSubmit,
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
          scanIntervalMinutes: 720,
        },
  });
  const busy = isSaving || isSubmitting;
  const atsType = watch('atsType');
  const interval = watch('scanIntervalMinutes');
  const options = companies.data ?? [];
  const companyOptions =
    source && !options.some((company) => company.id === source.companyId)
      ? [...options, { id: source.companyId, name: source.companyName, slug: '' }]
      : options;
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
                <Autocomplete
                  options={companyOptions}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  loading={companies.isLoading}
                  disabled={busy || companies.isLoading || companies.isError}
                  value={companyOptions.find((option) => option.id === field.value) ?? null}
                  onChange={(_, value) => field.onChange(value?.id ?? '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      label="Company"
                      required
                      error={Boolean(errors.companyId)}
                      helperText={errors.companyId?.message}
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
                  {[AtsType.Greenhouse, AtsType.Lever, AtsType.Ashby, AtsType.Custom, AtsType.SuccessFactors].map(
                    (type) => (
                      <MenuItem key={type} value={type}>
                        {AtsType[type]}
                      </MenuItem>
                    ),
                  )}
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
              required={atsType !== AtsType.Custom}
              disabled={busy}
              error={Boolean(errors.atsIdentifier)}
              helperText={
                errors.atsIdentifier?.message ??
                {
                  0: 'Optional for Custom.',
                  1: 'Board token',
                  2: 'Site/company token',
                  3: 'Job board name',
                  4: 'Board / career-site identifier',
                }[atsType]
              }
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
            {busy ? 'Saving…' : 'Save Job Source'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
