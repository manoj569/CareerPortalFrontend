import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { isAdminApiError } from '@/features/admin/api/adminApi';
import type { AdminJob } from '@/features/admin/types/adminModels';
import {
  useDisableAdminJobPromotionMutation,
  useLazyGetAdminJobPromotionQuery,
  useSaveAdminJobPromotionMutation,
  useUploadAdminJobPromotionBannerMutation,
} from './api';
import { resolveApiAssetUrl } from './assetUrl';
import type { JobPromotionConfiguration, SaveJobPromotionRequest } from './types';

const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const validatePromotionBanner = (file: File): string | null => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPEG, PNG, or WebP image.';
  if (file.size > MAX_BANNER_SIZE) return 'The banner must be 5 MiB or smaller.';
  return null;
};

const localDateTime = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

interface AdminJobPromotionDialogProps {
  job: AdminJob | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminJobPromotionDialog = ({ job, onClose, onSaved }: AdminJobPromotionDialogProps) => {
  const [loadPromotion, loadState] = useLazyGetAdminJobPromotionQuery();
  const [savePromotion, saveState] = useSaveAdminJobPromotionMutation();
  const [disablePromotion, disableState] = useDisableAdminJobPromotionMutation();
  const [uploadBanner, uploadState] = useUploadAdminJobPromotionBannerMutation();
  const [configuration, setConfiguration] = useState<JobPromotionConfiguration | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [priority, setPriority] = useState('0');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [partialFailure, setPartialFailure] = useState(false);
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');
  const [bannerVersion, setBannerVersion] = useState<number | null>(null);
  const pending = loadState.isFetching || saveState.isLoading || disableState.isLoading || uploadState.isLoading;

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!job) return;
    setConfiguration(null); setIsEnabled(false); setStartsAt(''); setEndsAt(''); setPriority('0');
    setFile(null); setFileError(''); setError(''); setPartialFailure(false); setSuccess('');
    void loadPromotion(job.id).unwrap().then((value) => {
      setConfiguration(value); setIsEnabled(value.isEnabled); setStartsAt(localDateTime(value.startsAtUtc));
      setEndsAt(localDateTime(value.endsAtUtc)); setPriority(String(value.displayPriority));
    }).catch((failure: unknown) => {
      const status = typeof failure === 'object' && failure !== null && 'status' in failure ? failure.status : undefined;
      if (status === 404) setConfiguration(null);
      else setError(isAdminApiError(failure) ? failure.message : 'Promotion settings could not be loaded.');
    });
  }, [job, loadPromotion]);

  const bannerUrl = useMemo(() => {
    const url = resolveApiAssetUrl(configuration?.bannerImageUrl);
    if (!url || bannerVersion === null) return url;
    const parsed = new URL(url); parsed.searchParams.set('v', String(bannerVersion)); return parsed.toString();
  }, [bannerVersion, configuration?.bannerImageUrl]);
  const dateError = Boolean(startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime());
  const numericPriority = Number(priority);
  const formError = dateError ? 'End date and time must be later than the start.' : !Number.isInteger(numericPriority) || numericPriority < 0 ? 'Display priority must be a non-negative whole number.' : '';

  const request = (): SaveJobPromotionRequest => ({
    isEnabled,
    startsAtUtc: startsAt ? new Date(startsAt).toISOString() : null,
    endsAtUtc: endsAt ? new Date(endsAt).toISOString() : null,
    displayPriority: numericPriority,
  });

  const save = async () => {
    if (!job || pending) return;
    setError(''); setSuccess(''); setPartialFailure(false);
    if (formError || fileError) { setError(formError || fileError); return; }
    try {
      let saved = await savePromotion({ jobId: job.id, data: request() }).unwrap();
      setConfiguration(saved);
      if (file) {
        try {
          saved = await uploadBanner({ jobId: job.id, file }).unwrap();
          setConfiguration(saved); setBannerVersion(Date.now()); setFile(null);
        } catch (failure: unknown) {
          setPartialFailure(true);
          setError(isAdminApiError(failure) ? failure.message : 'Promotion saved, but banner upload failed.');
          onSaved();
          return;
        }
      }
      setSuccess('Promotion settings saved.');
      onSaved();
    } catch (failure: unknown) {
      setError(isAdminApiError(failure) ? failure.message : 'Promotion settings could not be saved.');
    }
  };

  const disable = async () => {
    if (!job || pending) return;
    setError(''); setSuccess('');
    try {
      const saved = await disablePromotion(job.id).unwrap();
      setConfiguration(saved); setIsEnabled(false); setSuccess('Promotion disabled.'); onSaved();
    } catch (failure: unknown) {
      setError(isAdminApiError(failure) ? failure.message : 'Promotion could not be disabled.');
    }
  };

  const chooseFile = (selected: File | null) => {
    setFile(selected); setFileError(''); setError('');
    if (selected) setFileError(validatePromotionBanner(selected) ?? '');
  };

  return <Dialog open={Boolean(job)} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="job-promotion-title">
    <DialogTitle id="job-promotion-title">Promote Job in Hiring Opportunities</DialogTitle>
    <DialogContent>
      <Stack spacing={2.25} sx={{ pt: 1 }}>
        {job && <Stack><Typography fontWeight={700}>{job.title}</Typography><Typography color="text.secondary">{job.companyName} · {job.status}</Typography></Stack>}
        {loadState.isFetching && <Typography role="status">Loading promotion settings…</Typography>}
        {!loadState.isFetching && configuration && <Typography color="text.secondary" variant="body2">Current status: {configuration.isEnabled ? 'Promoted' : 'Not promoted'}{configuration.isEligible ? '' : ' · Job is currently ineligible for public promotion'}</Typography>}
        <FormControlLabel control={<Switch checked={isEnabled} onChange={(event) => setIsEnabled(event.target.checked)} />} label="Promotion enabled" />
        <TextField label="Start date and time (optional)" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="End date and time (optional)" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Display priority" type="number" inputProps={{ min: 0, step: 1 }} value={priority} onChange={(event) => setPriority(event.target.value)} />
        {bannerUrl && <BoxPreview url={bannerUrl} alt={`${job?.title ?? 'Job'} current promotional banner`} />}
        {preview && <BoxPreview url={preview} alt="Selected promotional banner preview" />}
        <Button component="label" variant="outlined">{file ? 'Replace selected banner' : 'Upload promotional banner'}<input hidden accept="image/jpeg,image/png,image/webp" type="file" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /></Button>
        {(fileError || formError) && <Alert severity="warning">{fileError || formError}</Alert>}
        {error && <Alert severity="error">{partialFailure ? `Promotion saved, but banner upload failed: ${error}` : error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button disabled={pending} onClick={onClose}>Cancel</Button>
      {configuration?.isEnabled && <Button color="warning" disabled={pending} onClick={() => void disable()}>{disableState.isLoading ? 'Disabling…' : 'Disable promotion'}</Button>}
      <Button variant="contained" disabled={pending || Boolean(formError) || Boolean(fileError) || loadState.isFetching} onClick={() => void save()}>{saveState.isLoading || uploadState.isLoading ? 'Saving…' : 'Save'}</Button>
    </DialogActions>
  </Dialog>;
};

const BoxPreview = ({ url, alt }: { url: string; alt: string }) => <img src={url} alt={alt} style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8 }} />;
