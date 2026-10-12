import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { getSafeExternalUrl } from '@/utils/safeExternalUrl';
import {
  isAdminApiError,
  useGetAdminCompanyQuery,
  useResolveAdminCompanyLogoMutation,
  useUpdateAdminCompanyMutation,
} from '../api/adminApi';
import type { AdminCompany } from '../types/adminModels';
import { companyLogoUpdateRequest, isHttpsCompanyLogoUrl } from '../utils/companyLogoManagement';

interface Props {
  companyId: string;
  onClose: () => void;
  onSaved: () => void;
}
const errorMessage = (error: unknown): string =>
  isAdminApiError(error)
    ? [error.message, ...Object.values(error.errors ?? {}).flat()].join(' ')
    : 'The action could not be completed. Please try again.';

export const CompanyLogoManagementDialog = (props: Props) => {
  const company = useGetAdminCompanyQuery(props.companyId, { refetchOnMountOrArgChange: true });
  if (!company.data)
    return (
      <Dialog
        open
        onClose={props.onClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="company-logo-title"
      >
        <DialogTitle id="company-logo-title">Manage Logo</DialogTitle>
        <DialogContent>
          {company.isError ? (
            <Alert severity="error">Company unavailable. Reopen to retry.</Alert>
          ) : (
            <PageLoadingIndicator label="Loading company" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  return (
    <CompanyLogoEditor
      {...props}
      company={company.data}
      refresh={() => company.refetch().unwrap()}
    />
  );
};

const CompanyLogoEditor = ({
  company,
  onClose,
  onSaved,
  refresh,
}: Props & {
  company: AdminCompany;
  refresh: () => Promise<AdminCompany>;
}) => {
  const [websiteUrl, setWebsiteUrl] = useState(company.websiteUrl ?? '');
  const [logoUrl, setLogoUrl] = useState(company.logoUrl ?? '');
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resolveLogo] = useResolveAdminCompanyLogoMutation();
  const [updateCompany] = useUpdateAdminCompanyMutation();
  const trimmedLogo = logoUrl.trim();
  const validLogo = !trimmedLogo || isHttpsCompanyLogoUrl(trimmedLogo);
  const validWebsite = !websiteUrl.trim() || Boolean(getSafeExternalUrl(websiteUrl));

  const findLogo = async () => {
    if (busy || !validWebsite) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await resolveLogo({
        companyId: company.id,
        request: {
          websiteUrl: websiteUrl.trim() || null,
          careerPageUrl: null,
          replaceExisting: true,
        },
      }).unwrap();
      if (result.companyId !== company.id) throw new Error('Unexpected company response');
      if (!result.resolved || !result.logoUrl) {
        setNotice('No logo was found. You can paste a direct HTTPS logo URL.');
      } else if (!isHttpsCompanyLogoUrl(result.logoUrl)) {
        setError(
          'The returned logo is not a safe HTTPS URL. Paste a direct HTTPS logo URL instead.',
        );
      } else {
        setLogoUrl(result.logoUrl);
        setClearing(false);
        setNotice('Logo found. Preview only — click Save to apply it.');
      }
    } catch (failure: unknown) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (busy) return;
    setError(null);
    if (!validLogo || !validWebsite) {
      setError('Enter valid URLs before saving. Logo URLs must use HTTPS.');
      return;
    }
    if (!trimmedLogo && company.logoUrl && !clearing) {
      setError('Use Clear Logo to remove the current logo, then Save.');
      return;
    }
    setBusy(true);
    try {
      const latest = await refresh();
      if (latest.isDeleted) throw new Error('Company is deleted');
      await updateCompany({
        companyId: company.id,
        request: companyLogoUpdateRequest(latest, websiteUrl.trim() || null, trimmedLogo || null),
      }).unwrap();
      enqueueSnackbar(clearing ? 'Company logo cleared.' : 'Company logo saved.', {
        variant: 'success',
      });
      onSaved();
      onClose();
    } catch (failure: unknown) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={busy ? undefined : onClose}
      aria-labelledby="company-logo-title"
      disableEscapeKeyDown={busy}
    >
      <DialogTitle id="company-logo-title">Manage Logo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          <TextField
            label="Company Name"
            value={company.name}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            label="Website URL"
            value={websiteUrl}
            disabled={busy}
            fullWidth
            error={!validWebsite}
            helperText={!validWebsite ? 'Enter an absolute HTTP or HTTPS website URL.' : undefined}
            onChange={(event) => {
              setWebsiteUrl(event.target.value);
              setNotice(null);
            }}
          />
          <Box>
            <Typography sx={{ mb: 1 }}>Current Logo</Typography>
            <CompanyLogoFallback companyName={company.name} logoUrl={company.logoUrl} />
          </Box>
          <TextField
            label="Logo URL"
            value={logoUrl}
            disabled={busy}
            fullWidth
            error={!validLogo}
            helperText={
              !validLogo ? 'Enter a direct HTTPS logo URL.' : 'Preview only until you save.'
            }
            onChange={(event) => {
              setLogoUrl(event.target.value);
              setClearing(false);
              setNotice(null);
            }}
          />
          <Box aria-label="Logo preview">
            <Typography sx={{ mb: 1 }}>Logo Preview</Typography>
            <CompanyLogoFallback
              companyName={company.name}
              logoUrl={validLogo ? trimmedLogo : null}
            />
          </Box>
          {notice ? <Alert severity="info">{notice}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button
            variant="outlined"
            onClick={() => void findLogo()}
            disabled={busy || !validWebsite}
          >
            Find Logo Automatically
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{ flexWrap: 'wrap', gap: 1, p: 2, '& > :not(style)': { m: 0, minHeight: 44 } }}
      >
        <Button
          color="error"
          disabled={busy || (!logoUrl && !company.logoUrl)}
          onClick={() => {
            setLogoUrl('');
            setClearing(true);
            setError(null);
            setNotice('Logo will be cleared when you click Save.');
          }}
        >
          Clear Logo
        </Button>
        <Button disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={busy || !validLogo || !validWebsite}
          onClick={() => void save()}
        >
          {busy ? 'Working…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
