import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ROUTES } from '@/constants/routes';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isAdminApiError } from '@/features/admin/api/adminApi';
import {
  useCreateJobSourceMutation,
  useDeleteJobSourceMutation,
  useGetJobSourcesQuery,
  useLazyGetJobSourceQuery,
  useRunJobSourceMutation,
  useUpdateJobSourceMutation,
} from '@/features/admin/api/jobSourcesApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { JobSourceFormDialog } from '@/features/admin/components/JobSourceFormDialog';
import {
  AtsType,
  type JobSource,
  type SaveJobSourceRequest,
} from '@/features/admin/types/jobSourceModels';
import { JobStatus } from '@/features/admin/types/adminModels';
import {
  formatScanInterval,
  formatSourceDate,
  hasSourceError,
  sourceRequest,
} from '@/features/admin/utils/jobSourceFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useJobSourceRuns } from '@/features/admin/hooks/useJobSourceRuns';

type Action = { kind: 'run' | 'toggle' | 'delete'; source: JobSource };
const errorMessage = (error: unknown) =>
  isAdminApiError(error)
    ? [error.message, ...Object.values(error.errors ?? {}).flat()].join(' ')
    : 'The request could not be completed. Please try again.';

export const AdminJobSourcesPage = () => {
  useDocumentMetadata(
    'Job Sources | CareerHarbor',
    'Manage external ATS sources and automated job aggregation.',
  );
  const sources = useGetJobSourcesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [getSource] = useLazyGetJobSourceQuery();
  const [create] = useCreateJobSourceMutation();
  const [update] = useUpdateJobSourceMutation();
  const [remove] = useDeleteJobSourceMutation();
  const [run] = useRunJobSourceMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [ats, setAts] = useState('all');
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<JobSource | 'new' | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const lock = useRef(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const runs = useJobSourceRuns((entry) => {
    enqueueSnackbar(
      entry.run?.status === 'Succeeded'
        ? 'Aggregation complete.'
        : `Aggregation ${entry.run?.status.toLowerCase()}. Review the result.`,
      {
        variant: entry.run?.status === 'Succeeded' ? 'success' : 'error',
      },
    );
  });
  const result = resultId ? runs.entries[resultId] : null;
  const runError = Object.values(runs.entries).find((entry) => entry.error);
  const mounted = useRef(true);
  const generation = useRef(0);
  const submission = useRef<{ abort: () => void } | null>(null);
  useEffect(() => {
    mounted.current = true;
    generation.current++;
    const activeGeneration = generation.current;
    return () => {
      mounted.current = false;
      generation.current = activeGeneration + 1;
      lock.current = false;
      submission.current?.abort();
    };
  }, [runs.accountKey]);
  const [errorSource, setErrorSource] = useState<JobSource | null>(null);
  const collection = sources.data ?? [];
  const filtered = collection.filter((source) => {
    const matches = `${source.companyName} ${source.atsIdentifier ?? ''}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return (
      matches &&
      (ats === 'all' || String(source.atsType) === ats) &&
      (status === 'all' ||
        (status === 'active' && source.isActive) ||
        (status === 'inactive' && !source.isActive) ||
        (status === 'error' && hasSourceError(source)))
    );
  });
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 10) - 1));
  const failures = collection
    .filter(hasSourceError)
    .sort((a, b) => b.consecutiveFailures - a.consecutiveFailures);
  const successful = collection.filter((source) => source.lastSuccessfulRunAtUtc);
  const recent = [...successful]
    .sort((a, b) => b.lastSuccessfulRunAtUtc!.localeCompare(a.lastSuccessfulRunAtUtc!))
    .slice(0, 5);
  const begin = (id: string) => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(id);
    return true;
  };
  const finish = () => {
    lock.current = false;
    setBusy(null);
  };
  const edit = async (source: JobSource) => {
    if (!begin(source.id)) return;
    setNotice(null);
    try {
      setForm(await getSource(source.id, false).unwrap());
      setFormError(null);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      finish();
    }
  };
  const save = async (request: SaveJobSourceRequest) => {
    if (!begin('form')) return;
    setFormError(null);
    try {
      if (form && form !== 'new') await update({ id: form.id, request }).unwrap();
      else await create(request).unwrap();
      setForm(null);
      enqueueSnackbar('Job source saved.', { variant: 'success' });
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      finish();
    }
  };
  const execute = async () => {
    if (!pending || !begin(pending.source.id)) return;
    const { source, kind } = pending;
    const currentGeneration = generation.current;
    setActionError(null);
    try {
      if (kind === 'run') {
        if (runs.active(source.id)) return;
        const request = run(source.id);
        submission.current = request;
        const response = await request.unwrap();
        if (!mounted.current || currentGeneration !== generation.current) return;
        if (response.jobSourceId !== source.id)
          throw new Error('The server returned a different source run.');
        runs.track(source.companyName, response);
        setResultId(source.id);
      } else if (kind === 'delete') {
        await remove(source.id).unwrap();
        enqueueSnackbar('Job source deleted.', { variant: 'success' });
      } else {
        // Read current editable values before toggling to avoid overwriting a stale row.
        const current = await getSource(source.id, false).unwrap();
        await update({
          id: source.id,
          request: { ...sourceRequest(current), isActive: !source.isActive },
        }).unwrap();
        enqueueSnackbar(source.isActive ? 'Job source deactivated.' : 'Job source activated.', {
          variant: 'success',
        });
      }
      setPending(null);
    } catch (error) {
      if (!mounted.current || currentGeneration !== generation.current) return;
      const message =
        kind === 'run' &&
        isAdminApiError(error) &&
        ['request_timeout', 'network_error'].includes(error.code ?? '')
          ? `${error.message} The run outcome is unknown. Refresh source status before trying again.`
          : errorMessage(error);
      setActionError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      if (currentGeneration === generation.current) {
        submission.current = null;
        if (mounted.current) finish();
      }
    }
  };
  const openAction = (kind: Action['kind'], source: JobSource) => {
    if (kind === 'run' && runs.active(source.id)) return;
    setActionError(null);
    setPending({ kind, source });
  };
  const actions = (source: JobSource) => (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      <Button
        size="small"
        disabled={
          Boolean(busy) ||
          runs.active(source.id) ||
          sources.isFetching ||
          !source.isActive ||
          source.atsType === AtsType.Custom
        }
        onClick={() => openAction('run', source)}
        startIcon={busy === source.id ? <CircularProgress size={14} /> : undefined}
      >
        {busy === source.id
          ? 'Working…'
          : runs.active(source.id)
            ? (runs.entries[source.id]?.run?.status ?? 'Checking run…')
            : 'Run Now'}
      </Button>
      <Button
        size="small"
        disabled={Boolean(busy) || sources.isFetching}
        onClick={() => void edit(source)}
      >
        Edit
      </Button>
      <Button
        size="small"
        disabled={Boolean(busy) || sources.isFetching}
        onClick={() => openAction('toggle', source)}
      >
        {source.isActive ? 'Deactivate' : 'Activate'}
      </Button>
      <Button
        size="small"
        color="error"
        disabled={Boolean(busy) || sources.isFetching}
        onClick={() => openAction('delete', source)}
      >
        Delete
      </Button>
    </Stack>
  );
  const badges = (source: JobSource) => (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      <Chip
        size="small"
        label={source.isActive ? 'Active' : 'Inactive'}
        color={source.isActive ? 'success' : 'default'}
      />
      <Chip
        size="small"
        label={source.autoPublishEnabled ? 'Auto Publish: On' : 'Auto Publish: Off'}
        color={source.autoPublishEnabled ? 'info' : 'default'}
      />
      {hasSourceError(source) && (
        <Chip size="small" label="Error" color="error" onClick={() => setErrorSource(source)} />
      )}
    </Stack>
  );
  const actionLabel =
    pending?.kind === 'delete'
      ? 'Delete Job Source'
      : pending?.kind === 'run'
        ? 'Run Now'
        : pending?.source.isActive
          ? 'Deactivate Job Source'
          : 'Activate Job Source';

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        title="Job Sources"
        description="Manage external ATS sources and automated job aggregation."
        eyebrow="Administration"
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={Link} to={`${ROUTES.ADMIN_JOBS}?status=${JobStatus.Draft}`}>
              Review draft jobs
            </Button>
            <Button
              variant="contained"
              disabled={Boolean(busy)}
              onClick={() => {
                setForm('new');
                setFormError(null);
              }}
            >
              + Add Job Source
            </Button>
          </Stack>
        }
      />
      {notice && (
        <Alert severity="error" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {runError && (
        <Alert
          severity="error"
          action={<Button onClick={() => setResultId(runError.sourceId)}>Check run status</Button>}
        >
          {runError.company}: {runError.error}
        </Alert>
      )}
      {sources.isLoading ? (
        <PageLoadingIndicator label="Loading job sources" />
      ) : sources.isError ? (
        <ErrorState title="Job sources unavailable" onRetry={() => void sources.refetch()} />
      ) : (
        <>
          <Grid container spacing={2}>
            {[
              ['Total Sources', collection.length],
              ['Active Sources', collection.filter((source) => source.isActive).length],
              ['Inactive Sources', collection.filter((source) => !source.isActive).length],
              ['Sources With Errors', failures.length],
              ['Successful Sources', successful.length],
            ].map(([label, value]) => (
              <Grid size={{ xs: 6, md: 'grow' }} key={label}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      {label}
                    </Typography>
                    <Typography variant="h3">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="caption" color="text.secondary">
            Successful Sources counts sources with a recorded successful run, including sources with
            subsequent failures.
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Search sources"
                placeholder="Company or ATS identifier"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 160 }}
              >
                {['all', 'active', 'inactive', 'error'].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value === 'all'
                      ? 'All Status'
                      : value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="ATS"
                value={ats}
                onChange={(event) => {
                  setAts(event.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All ATS</MenuItem>
                {[1, 2, 3, 0, 4].map((value) => (
                  <MenuItem key={value} value={String(value)}>
                    {AtsType[value]}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                disabled={sources.isFetching || Boolean(busy)}
                onClick={() => void sources.refetch()}
              >
                Refresh
              </Button>
            </Stack>
          </Paper>
          {sources.isFetching && <PageLoadingIndicator label="Refreshing job sources" />}
          {!filtered.length ? (
            <EmptyState
              title={
                collection.length ? 'No matching job sources' : 'No job sources configured yet.'
              }
              description={
                collection.length
                  ? 'Try another company, identifier, or filter.'
                  : 'Add an external ATS source to start aggregating draft jobs.'
              }
            />
          ) : (
            <>
              <TableContainer component={Paper} sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Table aria-label="Job sources">
                  <TableHead>
                    <TableRow>
                      {[
                        'Company',
                        'ATS',
                        'Identifier',
                        'Category',
                        'Status',
                        'Scan Interval',
                        'Last Run',
                        'Last Successful Run',
                        'Failures',
                        'Actions',
                      ].map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.slice(currentPage * 10, currentPage * 10 + 10).map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>{source.companyName}</TableCell>
                        <TableCell>
                          <Chip label={AtsType[source.atsType]} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ overflowWrap: 'anywhere' }}>
                          {source.atsIdentifier ?? '—'}
                        </TableCell>
                        <TableCell>{source.categoryName ?? 'Not configured'}</TableCell>
                        <TableCell>{badges(source)}</TableCell>
                        <TableCell>{formatScanInterval(source.scanIntervalMinutes)}</TableCell>
                        <TableCell>{formatSourceDate(source.lastRunAtUtc)}</TableCell>
                        <TableCell>{formatSourceDate(source.lastSuccessfulRunAtUtc)}</TableCell>
                        <TableCell>{source.consecutiveFailures}</TableCell>
                        <TableCell>{actions(source)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack spacing={2} sx={{ display: { xs: 'flex', lg: 'none' } }}>
                {filtered.slice(currentPage * 10, currentPage * 10 + 10).map((source) => (
                  <Card key={source.id}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h3">{source.companyName}</Typography>
                        {badges(source)}
                        <Typography sx={{ overflowWrap: 'anywhere' }}>
                          {AtsType[source.atsType]} · {source.atsIdentifier ?? 'No identifier'}
                        </Typography>
                        <Typography>Category: {source.categoryName ?? 'Not configured'}</Typography>
                        <Typography>{formatScanInterval(source.scanIntervalMinutes)}</Typography>
                        <Typography>Last Run: {formatSourceDate(source.lastRunAtUtc)}</Typography>
                        <Typography>
                          Last Successful Run: {formatSourceDate(source.lastSuccessfulRunAtUtc)}
                        </Typography>
                        <Typography>Failures: {source.consecutiveFailures}</Typography>
                        {actions(source)}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
              <TablePagination
                component="div"
                count={filtered.length}
                page={currentPage}
                onPageChange={(_, value) => setPage(value)}
                rowsPerPage={10}
                rowsPerPageOptions={[10]}
              />
            </>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="h3" gutterBottom>
                  Recently Successful Sources
                </Typography>
                <Stack spacing={1}>
                  {recent.length ? (
                    recent.map((source) => (
                      <Typography key={source.id}>
                        {source.companyName} · {formatSourceDate(source.lastSuccessfulRunAtUtc)}
                      </Typography>
                    ))
                  ) : (
                    <Typography>No successful runs recorded.</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="h3" gutterBottom>
                  Sources With Failures
                </Typography>
                <Stack spacing={1}>
                  {failures.length ? (
                    failures.slice(0, 5).map((source) => (
                      <Button
                        key={source.id}
                        color="error"
                        onClick={() => setErrorSource(source)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {source.companyName} · {source.consecutiveFailures} consecutive failures
                      </Button>
                    ))
                  ) : (
                    <Typography>No source failures recorded.</Typography>
                  )}
                </Stack>
                {failures.length > 5 && (
                  <Button
                    onClick={() => {
                      setStatus('error');
                      setAts('all');
                      setSearch('');
                      setPage(0);
                    }}
                  >
                    Show all failures
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
      {form && (
        <JobSourceFormDialog
          source={form === 'new' ? undefined : form}
          isSaving={busy === 'form'}
          error={formError}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      <ConfirmActionDialog
        open={Boolean(pending)}
        title={actionLabel}
        actionLabel={actionLabel}
        isProcessing={Boolean(busy)}
        error={actionError}
        onClose={() => setPending(null)}
        onConfirm={() => void execute()}
        description={
          pending
            ? `${actionLabel} for ${pending.source.companyName}?${pending.kind === 'run' ? ' Newly ingested jobs will be available for draft review.' : ''}`
            : ''
        }
      />
      <Dialog
        open={Boolean(result)}
        onClose={() => setResultId(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="run-result-title"
      >
        <DialogTitle id="run-result-title">
          {result?.run?.status === 'Succeeded'
            ? 'Aggregation Complete'
            : `Aggregation ${result?.run?.status ?? 'Status unknown'}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>{result?.company}</Typography>
            <Alert
              severity={
                result?.run?.status === 'Succeeded'
                  ? 'success'
                  : result?.run?.status === 'Failed'
                    ? 'error'
                    : 'info'
              }
            >
              Status: {result?.run?.status ?? 'Checking'}
              {result?.run?.retryPending ? ' — retry pending' : ''}
            </Alert>
            {result?.run && (
              <Grid container spacing={2}>
                {[
                  ['Total Received', result.run.totalReceived],
                  ['Created', result.run.created],
                  ['Existing', result.run.existing ?? result.run.matched],
                  ['Published', result.run.published ?? 0],
                  ['Rejected', result.run.rejected ?? result.run.skipped],
                  ['Matched', result.run.matched],
                  ['Skipped', result.run.skipped],
                  ['Failed', result.run.failed],
                ].map(([label, value]) => (
                  <Grid size={6} key={label}>
                    <Typography>
                      {label}: {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
            {result?.error && <Alert severity="error">{result.error}</Alert>}
            {result?.run?.diagnostics?.failureReasonCode && (
              <Alert severity="warning">
                {result.run.diagnostics.failureReasonCode}
                {result.run.diagnostics.failureStage
                  ? ` (${result.run.diagnostics.failureStage})`
                  : ''}
              </Alert>
            )}
            {result?.run?.error && (
              <Alert severity="error" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {result.run.error}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button component={Link} to={`${ROUTES.ADMIN_JOBS}?status=${JobStatus.Draft}`}>
            Review draft jobs
          </Button>
          {result?.error && (
            <Button onClick={() => runs.retry(result.sourceId)}>Retry status check</Button>
          )}
          <Button onClick={() => setResultId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(errorSource)}
        onClose={() => setErrorSource(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="source-error-title"
      >
        <DialogTitle id="source-error-title">Source error · {errorSource?.companyName}</DialogTitle>
        <DialogContent>
          <Box sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {errorSource?.lastError ?? 'No error detail was returned.'}
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Consecutive failures: {errorSource?.consecutiveFailures}. Error details are limited to
            the message provided by the server.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorSource(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
