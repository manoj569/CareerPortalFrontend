import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { ROUTES } from '@/constants/routes';
import {
  isAdminApiError,
  useCommitAdminJobDiscoveryMutation,
  useGetAdminJobDiscoveryRunQuery,
  usePreviewAdminJobDiscoveryMutation,
} from '@/features/admin/api/adminApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import type {
  AdminCsvImportResult,
  JobDiscoveryCommitResult,
  JobDiscoveryItem,
} from '@/features/admin/types/adminModels';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';

const errorMessage = (error: unknown, fallback: string) =>
  isAdminApiError(error) ? error.message : fallback;

const isImportable = (item: JobDiscoveryItem) => item.status.toLowerCase() === 'candidate';

export const AdminJobDiscoveryRunPage = () => {
  const { runId = '' } = useParams();
  const details = useGetAdminJobDiscoveryRunQuery(runId, { skip: !runId });
  const [previewImport, previewState] = usePreviewAdminJobDiscoveryMutation();
  const [commitImport, commitState] = useCommitAdminJobDiscoveryMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<AdminCsvImportResult | null>(null);
  const [committed, setCommitted] = useState<JobDiscoveryCommitResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = useMemo(
    () => (Array.isArray(details.data?.items) ? details.data.items : []),
    [details.data?.items],
  );
  const validIds = useMemo(() => items.filter(isImportable).map((item) => item.id), [items]);
  const selectedItems = useMemo(
    () => items.filter((item) => isImportable(item) && selected.includes(item.id)),
    [items, selected],
  );
  const previewValidIds = useMemo(() => {
    if (!preview) return [];
    return preview.rows.flatMap((row) => {
      if (row.status.toLowerCase() !== 'valid') return [];
      const item = selectedItems[row.rowNumber - 2];
      return item ? [item.id] : [];
    });
  }, [preview, selectedItems]);
  const invalidatePreview = (next: string[]) => {
    setSelected(next);
    setPreview(null);
    setCommitted(null);
  };
  const toggle = (id: string) =>
    invalidatePreview(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);

  const handlePreview = async () => {
    try {
      setPreview(await previewImport({ request: { itemIds: selected }, runId }).unwrap());
    } catch {
      setPreview(null);
    }
  };
  const handleCommit = async () => {
    try {
      setCommitted(await commitImport({ request: { itemIds: previewValidIds }, runId }).unwrap());
      setConfirmOpen(false);
      void details.refetch();
    } catch {
      // The dialog renders the backend error.
    }
  };

  if (details.isLoading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <CircularProgress aria-label="Loading discovery run" />
        <Typography color="text.secondary">Loading discovery run…</Typography>
      </Stack>
    );
  }
  if (details.isError || !details.data) {
    return (
      <Alert action={<Button onClick={() => void details.refetch()}>Retry</Button>} severity="error">
        {errorMessage(details.error, 'Unable to load this discovery run.')}
      </Alert>
    );
  }

  const invalid = items.filter(
    (item) => !['candidate', 'duplicate', 'imported'].includes(item.status.toLowerCase()),
  ).length;
  const previewSucceeded = previewValidIds.length > 0;
  const skippedInvalidCount = preview?.invalidRows ?? 0;
  const importSummary = preview
    ? `${previewValidIds.length} ${previewValidIds.length === 1 ? 'job' : 'jobs'} will be imported as Drafts. ${skippedInvalidCount} ${skippedInvalidCount === 1 ? 'invalid job' : 'invalid jobs'} will be skipped.`
    : '';

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={<Button component={Link} startIcon={<ArrowBackOutlinedIcon />} to={ROUTES.ADMIN_JOB_DISCOVERY}>All runs</Button>}
        description="Review discovered jobs and import only valid selections as drafts."
        eyebrow="Discover jobs"
        title={`Review run ${details.data.id.slice(0, 8)}`}
      />

      <Paper component="section" sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography color="text.secondary">Status</Typography><Chip label={details.data.status} size="small" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography color="text.secondary">Started</Typography><Typography>{formatAdminDate(details.data.startedAtUtc)}</Typography></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography color="text.secondary">Completed</Typography><Typography>{formatAdminDate(details.data.completedAtUtc)}</Typography></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography color="text.secondary">Imported</Typography><Typography>{details.data.importedCount}</Typography></Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {[['Found', details.data.candidateCount], ['New', validIds.length], ['Duplicates', details.data.duplicateCount], ['Invalid', invalid]].map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2.5 }}><Typography color="text.secondary">{label}</Typography><Typography variant="h4">{value}</Typography></Paper>
          </Grid>
        ))}
      </Grid>

      {details.data.errorSummary ? <Alert severity="warning">{details.data.errorSummary}</Alert> : null}

      <Paper component="section" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={validIds.length > 0 && selected.length === validIds.length} disabled={validIds.length === 0 || previewState.isLoading || commitState.isLoading} indeterminate={selected.length > 0 && selected.length < validIds.length} onChange={(_, checked) => invalidatePreview(checked ? validIds : [])} />}
            label="Select all valid"
          />
          <Button disabled={selected.length === 0 || previewState.isLoading || commitState.isLoading} onClick={() => void handlePreview()} variant="outlined">
            {previewState.isLoading ? 'Previewing…' : 'Preview selected import'}
          </Button>
        </Stack>

        {previewState.error ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage(previewState.error, 'Unable to preview the selected jobs.')}</Alert> : null}
        {items.length === 0 ? (
          <Alert severity="info">No discovery items were returned for this run.</Alert>
        ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table aria-label="Discovered jobs" size="small">
            <TableHead><TableRow><TableCell padding="checkbox" /><TableCell>Title</TableCell><TableCell>Company</TableCell><TableCell>Category</TableCell><TableCell>Location</TableCell><TableCell>Source provider</TableCell><TableCell>Source URL</TableCell><TableCell>Duplicate status</TableCell><TableCell>Validation status</TableCell></TableRow></TableHead>
            <TableBody>{items.map((item) => {
              const selectable = isImportable(item);
              return <TableRow key={item.id} hover><TableCell padding="checkbox"><Checkbox checked={selected.includes(item.id)} disabled={!selectable || previewState.isLoading || commitState.isLoading} inputProps={{ 'aria-label': `Select ${item.title}` }} onChange={() => toggle(item.id)} /></TableCell><TableCell>{item.title}</TableCell><TableCell>{item.companyName}</TableCell><TableCell>{item.categoryName}</TableCell><TableCell>{item.location ?? '—'}</TableCell><TableCell>{item.provider}</TableCell><TableCell><MuiLink href={item.applicationUrl} rel="noreferrer" target="_blank">Open source</MuiLink></TableCell><TableCell>{item.duplicateReason ?? (selectable ? 'New' : item.status)}</TableCell><TableCell><Chip color={selectable ? 'success' : item.status.toLowerCase() === 'duplicate' ? 'default' : 'warning'} label={selectable ? 'Ready for preview' : item.status} size="small" /></TableCell></TableRow>;
            })}</TableBody>
          </Table>
        </TableContainer>
        )}
      </Paper>

      {preview ? (
        <Paper component="section" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography component="h2" variant="h6">Import preview</Typography>
          <Typography color="text.secondary" sx={{ my: 1 }}>{preview.validRows} valid · {preview.invalidRows} invalid · {preview.duplicateRows} duplicates</Typography>
          {preview.rows.map((row) => <Box key={row.rowNumber} sx={{ borderTop: 1, borderColor: 'divider', py: 1.5 }}><Typography fontWeight={600}>Row {row.rowNumber}: {row.status}</Typography><Typography color="text.secondary">Company: {row.companyResolution ?? 'No resolution supplied'} · Category: {row.categoryResolution ?? 'No resolution supplied'}</Typography>{row.errors.map((error) => <Typography color="error" key={`${error.field}-${error.message}`}>{error.field}: {error.message}</Typography>)}</Box>)}
          <Alert severity={previewSucceeded ? 'info' : 'warning'} sx={{ my: 2 }}>
            {previewSucceeded
              ? importSummary
              : 'No preview-valid jobs are available to import. Fix the validation errors or change the selection and preview again.'}
            {' '}Imported jobs require separate review before publishing.
          </Alert>
          <Button disabled={!previewSucceeded || commitState.isLoading} onClick={() => setConfirmOpen(true)} variant="contained">Import selected as drafts</Button>
        </Paper>
      ) : null}

      {committed ? <Alert action={<Button component={Link} to={ROUTES.ADMIN_JOBS}>Back to Manage jobs</Button>} severity="success">{committed.import.importedRows} jobs imported as Draft. {committed.import.skippedRows} skipped; {committed.import.invalidRows} invalid.</Alert> : null}

      <ConfirmActionDialog actionLabel="Import selected as drafts" description={`${importSummary} Imported jobs require separate review before publishing.`} error={commitState.error ? errorMessage(commitState.error, 'Unable to import the selected jobs.') : null} isProcessing={commitState.isLoading} onClose={() => setConfirmOpen(false)} onConfirm={() => void handleCommit()} open={confirmOpen} title="Confirm draft import" />
    </Stack>
  );
};

export default AdminJobDiscoveryRunPage;
