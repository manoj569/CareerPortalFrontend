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
import { useEffect, useRef, useState } from 'react';
import {
  isAdminApiError,
  useCreateAdminCompanyMutation,
  useGetAdminCompanyOptionsQuery,
  useGetAdminCompanyQuery,
} from '../api/adminApi';
import type { AdminOption } from '../types/adminModels';
import { AtsType, type JobSource, type SaveJobSourceRequest, type JobSourceConnectionResult } from '../types/jobSourceModels';
import { useTestJobSourceConfigurationMutation } from '../api/jobSourcesApi';
import { SourceConnectionResult } from './SourceConnectionResult';
import { isVerifiedSourceConnection } from '../utils/sourceConnectionVerification';
import { EMPLOYER_DIRECT_ATS_IDENTIFIER, isEmployerDirectSource, sourceRequest } from '../utils/jobSourceFormatting';
import { jobSourceSchema } from '../validation/jobSourceSchema';
import { parseWorkdaySiteRoot, sourceIdentifierHelp } from '../validation/jobSourceConfiguration';
import type { ApiError } from '@/types';
import { extractApiError } from '@/api/apiError';
import { applyApiValidationErrors } from '@/api/formErrors';
import { ApiErrorAlert } from '@/components/feedback/ApiErrorAlert';

const sourceFields = ['companyId', 'careerPageUrl', 'atsType', 'atsIdentifier', 'isActive', 'autoPublishEnabled', 'scanIntervalMinutes'] as const;

interface Props {
  source?: JobSource;
  isSaving: boolean;
  error: string | ApiError | null;
  onClose: () => void;
  onSave: (request: SaveJobSourceRequest) => Promise<void>;
}

type CompanyOption = AdminOption & { create?: boolean };
const filterCompanies = createFilterOptions<CompanyOption>();
const normalizeName = (name: string) => name.trim().toLowerCase();

const SourceCompanyMetadata = ({ companyId }: { companyId: string }) => {
  const company = useGetAdminCompanyQuery(companyId, { skip: !companyId });
  return (
    <Stack spacing={2}>
      {company.isError && <Alert severity="error">Company details could not be loaded.</Alert>}
      <TextField label="Company Website" value={company.data?.websiteUrl ?? ''} slotProps={{ input: { readOnly: true } }} helperText={company.isLoading ? 'Loading company details…' : 'Managed in company administration.'} />
      <TextField label="Logo URL" value={company.data?.logoUrl ?? ''} slotProps={{ input: { readOnly: true } }} helperText="Managed in company administration. A logo is optional." />
    </Stack>
  );
};

export const JobSourceFormDialog = ({ source, isSaving, error, onClose, onSave }: Props) => {
  const companies = useGetAdminCompanyOptionsQuery();
  const [createCompany, { isLoading: isCreating }] = useCreateAdminCompanyMutation();
  const creating = useRef(false);
  const [createdCompanies, setCreatedCompanies] = useState<AdminOption[]>([]);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [detect] = useTestJobSourceConfigurationMutation();
  const [isDetecting, setIsDetecting] = useState(false);
  const detecting = useRef(false);
  const saving = useRef(false);
  const detectionRequest = useRef<{ abort: () => void } | null>(null);
  const mounted = useRef(true);
  const [preview, setPreview] = useState<{ key: string; result: JobSourceConnectionResult | null; error?: ApiError } | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; detectionRequest.current?.abort(); };
  }, []);
  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    setError,
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
  useEffect(() => {
    if (error && typeof error !== 'string') applyApiValidationErrors(error, sourceFields, setError);
  }, [error, setError]);
  const busy = isSaving || isSubmitting || isCreating || isDetecting;
  const atsType = watch('atsType');
  const companyId = watch('companyId');
  const atsIdentifier = watch('atsIdentifier');
  const careerPageUrl = watch('careerPageUrl');
  const configurationKey = JSON.stringify([atsType, careerPageUrl.trim(), atsIdentifier?.trim() || null]);
  const currentPreview = preview?.key === configurationKey ? preview : null;
  const detectConfiguration = async () => {
    if (detecting.current || busy) return;
    detecting.current = true;
    setIsDetecting(true);
    setPreview(null);
    try {
      if (!await trigger(['atsType', 'careerPageUrl', 'atsIdentifier'])) return;
      const values = getValues();
      const request = detect({ atsType: values.atsType, careerPageUrl: values.careerPageUrl.trim(),
        atsIdentifier: values.atsIdentifier?.trim() || null });
      detectionRequest.current = request;
      const result = await request.unwrap();
      if (mounted.current) setPreview({ key: configurationKey, result });
    } catch (cause) {
      if (mounted.current) {
        const details = extractApiError(cause);
        applyApiValidationErrors(details, sourceFields, setError);
        setPreview({ key: configurationKey, result: null, error: details });
      }
    } finally {
      detecting.current = false;
      detectionRequest.current = null;
      if (mounted.current) setIsDetecting(false);
    }
  };
  const isEmployerDirect = isEmployerDirectSource({ atsType, atsIdentifier });
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
          if (creating.current || detecting.current || saving.current || isSaving) {
            event.preventDefault();
            return;
          }
          saving.current = true;
          void handleSubmit((request) => {
            const identifier = request.atsIdentifier?.trim() || '';
            const workdayRoot =
              request.atsType === AtsType.Workday
                ? parseWorkdaySiteRoot(request.careerPageUrl)
                : null;
            const identifierRoot =
              request.atsType === AtsType.Workday && identifier
                ? parseWorkdaySiteRoot(identifier)
                : null;
            const submittedKey = JSON.stringify([request.atsType, request.careerPageUrl.trim(), identifier || null]);
            const resolved = preview?.key === submittedKey && isVerifiedSourceConnection(preview.result, request.atsType)
              ? preview.result?.discovery?.resolvedCareerPageUrl : null;
            return onSave({
              ...request,
              careerPageUrl: resolved ?? workdayRoot?.canonicalUrl ?? request.careerPageUrl.trim(),
              atsIdentifier: resolved ? null : isEmployerDirect
                ? EMPLOYER_DIRECT_ATS_IDENTIFIER
                : identifierRoot?.canonicalIdentifier ?? (identifier || null),
            });
          })(event).finally(() => { saving.current = false; });
        }}
        noValidate
      >
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && (
              <ApiErrorAlert error={error} fields={sourceFields} />
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
              helperText={errors.careerPageUrl?.message ?? (atsType === AtsType.RippleHire
                ? 'Enter the employer career page or RippleHire tenant URL. CareerHarbor will attempt to detect the public RippleHire configuration automatically.' : undefined)}
            />
            <Controller
              control={control}
              name="atsType"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="ATS Type"
                  error={Boolean(errors.atsType)}
                  helperText={errors.atsType?.message}
                  disabled={busy}
                  onChange={(event) => {
                    const nextType = Number(event.target.value);
                    field.onChange(nextType);
                    if (nextType === Number(AtsType.Custom)) {
                      setValue('atsIdentifier', EMPLOYER_DIRECT_ATS_IDENTIFIER, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  {[
                    AtsType.Greenhouse,
                    AtsType.Lever,
                    AtsType.Ashby,
                    AtsType.Custom,
                    AtsType.SuccessFactors,
                    AtsType.Workday,
                    AtsType.SmartRecruiters,
                    AtsType.RippleHire,
                  ].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === AtsType.Custom && (!source || isEmployerDirect)
                        ? 'Any Career Website'
                        : AtsType[type]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {atsType === AtsType.Custom && !isEmployerDirect && (
              <Alert severity="warning">
                Custom configurations can be saved, but the current backend has no Custom
                aggregation provider.
              </Alert>
            )}
            <TextField
              {...register('atsIdentifier')}
              label="ATS Identifier"
              disabled={busy || isEmployerDirect}
              error={Boolean(errors.atsIdentifier)}
              helperText={isEmployerDirect ? 'Automatically set for Any Career Website.' : errors.atsIdentifier?.message ?? sourceIdentifierHelp[atsType]}
            />
            {atsType === AtsType.SmartRecruiters && <SourceCompanyMetadata companyId={companyId} />}
            {atsType === AtsType.RippleHire && (
              <Stack spacing={1.5}>
                <Button type="button" variant="outlined" disabled={busy} onClick={() => void detectConfiguration()}
                  startIcon={isDetecting ? <CircularProgress size={16} /> : undefined}>
                  {isDetecting ? 'Detecting & testing…' : 'Detect & Test Connection'}
                </Button>
                {currentPreview && (currentPreview.error
                  ? <ApiErrorAlert error={currentPreview.error} fields={sourceFields} />
                  : <SourceConnectionResult result={currentPreview.result} provider={AtsType.RippleHire} />)}
                {currentPreview && isVerifiedSourceConnection(currentPreview.result, AtsType.RippleHire) && (
                  <Button type="button" disabled={busy} onClick={() => {
                    const resolved = currentPreview.result!.discovery!.resolvedCareerPageUrl!;
                    setValue('careerPageUrl', resolved, { shouldDirty: true, shouldValidate: true });
                    setValue('atsIdentifier', null, { shouldDirty: true, shouldValidate: true });
                    setPreview({ ...currentPreview, key: JSON.stringify([AtsType.RippleHire, resolved, null]) });
                  }}>Use Resolved Configuration</Button>
                )}
              </Stack>
            )}
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
            {errors.isActive && <Typography color="error" variant="caption">{errors.isActive.message}</Typography>}
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
              {errors.autoPublishEnabled && <Typography color="error" variant="caption">{errors.autoPublishEnabled.message}</Typography>}
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
            {isCreating ? 'Creating company…' : isDetecting ? 'Detecting…' : busy ? 'Saving…' : 'Save Job Source'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
