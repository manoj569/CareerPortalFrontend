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
  const change = <K extends keyof HiringDriveInput>(key: K, value: HiringDriveInput[K]) =>
    setForm((old) => (old ? { ...old, [key]: value } : old));
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
        }}
      >
        Create campaign
      </Button>
      {list.isLoading && <PageLoadingIndicator />}
      {list.isError && (
        <Alert severity="error" action={<Button onClick={() => void list.refetch()}>Retry</Button>}>
          Unable to load hiring drives.
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
                <TableCell>{drive.campaign.companyId ?? '�'}</TableCell>
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
        maxWidth="sm"
      >
        <DialogTitle>{id ? 'Edit campaign' : 'Create campaign'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {form && (
              <>
                <TextField
                  select
                  label="Company"
                  value={form.companyId}
                  onChange={(e) => change('companyId', e.target.value)}
                >
                  {companies.data?.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
                {companies.isError && <Alert severity="error">Unable to load companies.</Alert>}
                {(
                  [
                    'title',
                    'subtitle',
                    'description',
                    'badgeText',
                    'experienceText',
                    'locationText',
                    'imageUrl',
                  ] as const
                ).map((key) => (
                  <TextField
                    key={key}
                    label={
                      {
                        title: 'Title',
                        subtitle: 'Subtitle',
                        description: 'Description',
                        badgeText: 'Badge',
                        experienceText: 'Experience',
                        locationText: 'Location',
                        imageUrl: 'Campaign image URL',
                      }[key]
                    }
                    required={key === 'title'}
                    value={form[key] ?? ''}
                    onChange={(e) => change(key, e.target.value)}
                  />
                ))}
                <TextField
                  select
                  label="Badge type"
                  value={form.badgeType ?? ''}
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
                    <TextField {...params} label="CareerHarbor job (optional)" />
                  )}
                />
                {jobs.isError && <Alert severity="error">Unable to load jobs.</Alert>}
                <TextField
                  label="External apply URL (HTTPS)"
                  value={form.applyUrl ?? ''}
                  onChange={(e) => change('applyUrl', e.target.value || null)}
                />
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
                <FormControlLabel
                  label="Sponsored"
                  control={
                    <Checkbox
                      checked={form.isSponsored}
                      onChange={(_, checked) => change('isSponsored', checked)}
                    />
                  }
                />
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

