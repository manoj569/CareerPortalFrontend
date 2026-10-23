import { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import {
  useGetAdminCompanyOptionsQuery,
  useGetAdminJobsQuery,
} from '@/features/admin/api/adminApi';
import {
  useGetAdminHiringDrivesQuery,
  useSaveAdminHiringDriveMutation,
  useDeleteAdminHiringDriveMutation,
} from '@/features/hiringDrives/api';
import type { AdminHiringDrive, HiringDriveInput } from '@/features/hiringDrives/types';
import { validateHiringDrive } from '@/features/hiringDrives/validation';
import { parseHiringDriveQuickFill, type QuickFillField, type QuickFillResult } from '@/features/hiringDrives/quickFill';
const blank: HiringDriveInput = {
  companyId: '',
  title: '',
  subtitle: '',
  description: '',
  badgeText: '',
  badgeType: null,
  experienceText: '',
  locationText: '',
  imageUrl: '',
  isSponsored: false,
  showOnHome: false,
  jobId: null,
  applyUrl: '',
  isActive: false,
  startAtUtc: '',
  endAtUtc: null,
  displayOrder: 0,
};
const toInput = (drive: AdminHiringDrive): HiringDriveInput => ({ ...blank, ...drive.campaign });
export const AdminHiringDrivesPage = () => {
  const list = useGetAdminHiringDrivesQuery({ pageNumber: 1, pageSize: 20 });
  const companies = useGetAdminCompanyOptionsQuery();
  const [jobSearch, setJobSearch] = useState('');
  const jobs = useGetAdminJobsQuery({
    pageNumber: 1,
    pageSize: 30,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    search: jobSearch || undefined,
  });
  const [save, state] = useSaveAdminHiringDriveMutation();
  const [remove, removeState] = useDeleteAdminHiringDriveMutation();
  const [form, setForm] = useState<HiringDriveInput | null>(null);
  const [id, setId] = useState<string>();
  const [error, setError] = useState('');
  const [quickFillText, setQuickFillText] = useState('');
  const [quickFillResult, setQuickFillResult] = useState<QuickFillResult>({ values: {}, errors: {} });
  const change = <K extends keyof HiringDriveInput>(key: K, value: HiringDriveInput[K]) => {
    setForm((old) => (old ? { ...old, [key]: value } : old));
    setQuickFillResult((old) => {
      const errors = { ...old.errors };
      delete errors[key as QuickFillField];
      return { ...old, errors, unresolvedCompany: key === 'companyId' ? undefined : old.unresolvedCompany };
    });
  };
  const removeDrive = async (driveId: string) => {
    try {
      await remove(driveId).unwrap();
      enqueueSnackbar('Hiring drive deactivated.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to deactivate this hiring drive.', { variant: 'error' });
    }
  };
  const submit = async () => {
    if (!form || state.isLoading) return;
    if (Object.keys(quickFillResult.errors).length) {
      setError('Correct the Quick Fill fields before saving.');
      return;
    }
    const validation = validateHiringDrive(form);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      await save({
        id,
        data: {
          ...form,
          title: form.title.trim(),
          startAtUtc: new Date(form.startAtUtc).toISOString(),
        },
      }).unwrap();
      setForm(null);
      enqueueSnackbar('Hiring drive saved.', { variant: 'success' });
    } catch {
      setError('Unable to save the hiring drive. Please check the details and try again.');
    }
  };
  const dateValue = (value: string | null | undefined) =>
    value
      ? new Date(Date.parse(value) - new Date(value).getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : '';
  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        title="Hiring Drives"
        description="Manage hiring campaigns and their performance."
      />
      <Button
        variant="contained"
        onClick={() => {
          setId(undefined);
          setForm({ ...blank });
          setError('');
          setQuickFillText('');
          setQuickFillResult({ values: {}, errors: {} });
        }}
      >
        Create campaign
      </Button>
      {list.isLoading && <PageLoadingIndicator />}
      {list.isError && (
        <Alert severity="error" action={<Button onClick={() => void list.refetch()}>Retry</Button>}>
          Hiring Drives could not be loaded. Please retry.
        </Alert>
      )}
      {list.data?.items.length === 0 && <Alert severity="info">No hiring campaigns yet.</Alert>}
      <TableContainer component={Paper}>
        <Table aria-label="Hiring campaigns">
          <TableHead>
            <TableRow>
              {['Campaign', 'Company', 'Status', 'Impressions', 'Clicks', 'CTR', 'Actions'].map(
                (label) => (
                  <TableCell key={label}>{label}</TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {list.data?.items.map((drive) => (
              <TableRow key={drive.id}>
                <TableCell>{drive.campaign.title}</TableCell>
                <TableCell>
                  {companies.data?.find((company) => company.id === drive.campaign.companyId)?.name ??
                    drive.campaign.companyId ?? '—'}
                </TableCell>
                <TableCell>{drive.campaign.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>{drive.impressionCount}</TableCell>
                <TableCell>{drive.clickCount}</TableCell>
                <TableCell>{drive.ctr.toFixed(2)}%</TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setId(drive.id);
                      setForm(toInput(drive));
                      setError('');
                      setQuickFillText('');
                      setQuickFillResult({ values: {}, errors: {} });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={removeState.isLoading}
                    color="error"
                    onClick={() => void removeDrive(drive.id)}
                  >
                    Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={!!form}
        onClose={() => {
          if (!state.isLoading) setForm(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{id ? 'Edit campaign' : 'Create campaign'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {form && (
              <>
                <Typography component="h3" variant="h6">Quick Fill Campaign</Typography>
                <TextField
                  label="Paste campaign data"
                  placeholder={'JSON or key/value text, for example:\nCompany: Infosys\nTitle: Systems Engineer\nShow on Home: Yes'}
                  multiline
                  minRows={5}
                  value={quickFillText}
                  onChange={(event) => setQuickFillText(event.target.value)}
                  error={Boolean(quickFillResult.errors.input)}
                  helperText={quickFillResult.errors.input ?? 'Supports JSON and one field per line in Name: Value format.'}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const result = parseHiringDriveQuickFill(quickFillText, companies.data ?? []);
                    setQuickFillResult(result);
                    setForm((old) => old ? { ...old, ...result.values } : old);
                    setError('');
                  }}
                >Auto Fill</Button>
                {quickFillResult.unresolvedCompany && (
                  <Alert severity="warning">
                    Company &quot;{quickFillResult.unresolvedCompany}&quot; was not found. Please
                    select a company manually.
                  </Alert>
                )}
                <Typography component="h3" variant="h6">Campaign</Typography>
                <TextField
                  select
                  label="Company"
                  value={form.companyId}
                  onChange={(e) => change('companyId', e.target.value)}
                  error={Boolean(quickFillResult.errors.companyId || quickFillResult.unresolvedCompany)}
                >
                  {companies.data?.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
                {quickFillResult.errors.companyId && <Typography color="error" variant="caption">{quickFillResult.errors.companyId}</Typography>}
                {companies.isError && <Alert severity="error">Unable to load companies.</Alert>}
                {(['title', 'subtitle', 'description'] as const).map((key) => (
                  <TextField
                    key={key}
                    label={{ title: 'Title', subtitle: 'Subtitle', description: 'Description' }[key]}
                    required={key === 'title'}
                    error={Boolean(quickFillResult.errors[key])}
                    helperText={quickFillResult.errors[key]}
                    multiline={key === 'description'}
                    minRows={key === 'description' ? 3 : undefined}
                    value={form[key] ?? ''}
                    onChange={(e) => change(key, e.target.value)}
                  />
                ))}
                <Typography component="h3" variant="h6">Candidate targeting</Typography>
                {(
                  [
                    'badgeText',
                    'experienceText',
                    'locationText',
                  ] as const
                ).map((key) => (
                  <TextField
                    key={key}
                    label={
                      {
                        badgeText: 'Badge',
                        experienceText: 'Experience',
                        locationText: 'Location',
                      }[key]
                    }
                    value={form[key] ?? ''}
                    onChange={(e) => change(key, e.target.value)}
                  />
                ))}
                <Typography component="h3" variant="h6">Creative</Typography>
                <TextField
                  label="Campaign image URL"
                  error={Boolean(quickFillResult.errors.imageUrl)}
                  helperText={quickFillResult.errors.imageUrl}
                  value={form.imageUrl ?? ''}
                  onChange={(e) => change('imageUrl', e.target.value || null)}
                />
                <TextField
                  select
                  label="Badge type"
                  value={form.badgeType ?? ''}
                  error={Boolean(quickFillResult.errors.badgeType)}
                  helperText={quickFillResult.errors.badgeType}
                  onChange={(e) =>
                    change('badgeType', (e.target.value || null) as HiringDriveInput['badgeType'])
                  }
                >
                  <MenuItem value="">No badge type</MenuItem>
                  <MenuItem value="hiring">Hiring</MenuItem>
                  <MenuItem value="walkIn">Walk-in</MenuItem>
                  <MenuItem value="openings">Openings</MenuItem>
                  <MenuItem value="featured">Featured</MenuItem>
                </TextField>
                <Autocomplete
                  options={jobs.data?.items ?? []}
                  getOptionLabel={(job) => job.title}
                  value={jobs.data?.items.find((job) => job.id === form.jobId) ?? null}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') setJobSearch(value);
                  }}
                  onChange={(_, job) => change('jobId', job?.id ?? null)}
                  renderInput={(params) => (
                    <TextField {...params} label="CareerHarbor job (optional)" error={Boolean(quickFillResult.errors.jobId)} helperText={quickFillResult.errors.jobId} />
                  )}
                />
                {jobs.isError && <Alert severity="error">Unable to load jobs.</Alert>}
                <Typography component="h3" variant="h6">Destination</Typography>
                <TextField
                  label="External apply URL (HTTPS)"
                  error={Boolean(quickFillResult.errors.applyUrl)}
                  helperText={quickFillResult.errors.applyUrl}
                  value={form.applyUrl ?? ''}
                  onChange={(e) => change('applyUrl', e.target.value || null)}
                />
                <Typography component="h3" variant="h6">Schedule</Typography>
                {(['startAtUtc', 'endAtUtc'] as const).map((key) => (
                  <TextField
                    key={key}
                    required={key === 'startAtUtc'}
                    label={
                      key === 'startAtUtc'
                        ? 'Start date (local time)'
                        : 'End date (optional, local time)'
                    }
                    type="datetime-local"
                    error={Boolean(quickFillResult.errors[key])}
                    helperText={quickFillResult.errors[key]}
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={dateValue(form[key])}
                    onChange={(e) =>
                      change(key, e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                  />
                ))}
                <TextField
                  label="Display order"
                  type="number"
                  error={Boolean(quickFillResult.errors.displayOrder)}
                  helperText={quickFillResult.errors.displayOrder}
                  value={form.displayOrder}
                  onChange={(e) => change('displayOrder', Number(e.target.value))}
                />
                <FormControlLabel
                  label="Active"
                  control={
                    <Checkbox
                      checked={form.isActive}
                      onChange={(_, checked) => change('isActive', checked)}
                    />
                  }
                />
                {quickFillResult.errors.isActive && <Typography color="error" variant="caption">{quickFillResult.errors.isActive}</Typography>}
                <Typography component="h3" variant="h6">Placement</Typography>
                <FormControlLabel
                  label="Sponsored"
                  control={
                    <Checkbox
                      checked={form.isSponsored}
                      onChange={(_, checked) => change('isSponsored', checked)}
                    />
                  }
                />
                {quickFillResult.errors.isSponsored && <Typography color="error" variant="caption">{quickFillResult.errors.isSponsored}</Typography>}
                <FormControlLabel
                  label={
                    <Stack spacing={0.25}>
                      <span>Show on Home</span>
                      <Typography color="text.secondary" variant="caption">
                        Display this hiring drive in homepage and candidate dashboard Hiring
                        Opportunities.
                      </Typography>
                    </Stack>
                  }
                  control={
                    <Checkbox
                      checked={form.showOnHome}
                      onChange={(_, checked) => change('showOnHome', checked)}
                    />
                  }
                />
                {quickFillResult.errors.showOnHome && <Typography color="error" variant="caption">{quickFillResult.errors.showOnHome}</Typography>}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={state.isLoading} onClick={() => setForm(null)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={state.isLoading} onClick={() => void submit()}>
            {state.isLoading ? 'Saving�' : 'Save campaign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

