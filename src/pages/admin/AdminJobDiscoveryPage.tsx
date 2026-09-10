import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
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
import { Link, useNavigate } from 'react-router-dom';

import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { buildAdminJobDiscoveryRunPath } from '@/constants/routes';
import {
  isAdminApiError,
  useGetAdminJobDiscoveryRunsQuery,
  useRunAdminJobDiscoveryMutation,
} from '@/features/admin/api/adminApi';
import type { JobDiscoveryRunSummary } from '@/features/admin/types/adminModels';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';

const getErrorMessage = (error: unknown) =>
  isAdminApiError(error) ? error.message : 'Unable to run job discovery. Please try again.';

export const AdminJobDiscoveryPage = () => {
  const navigate = useNavigate();
  const runs = useGetAdminJobDiscoveryRunsQuery(25);
  const [runDiscovery, runState] = useRunAdminJobDiscoveryMutation();

  const startRun = async () => {
    try {
      const run = await runDiscovery({}).unwrap();
      void navigate(buildAdminJobDiscoveryRunPath(run.id));
    } catch {
      // The mutation error is rendered below.
    }
  };

  const errorMessage = runState.error ? getErrorMessage(runState.error) : null;
  const providerError = Boolean(errorMessage && /provider|configured|configuration/i.test(errorMessage));

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          <Button
            disabled={runState.isLoading}
            onClick={() => void startRun()}
            startIcon={runState.isLoading ? <CircularProgress size={18} /> : <SearchOutlinedIcon />}
            variant="contained"
          >
            {runState.isLoading ? 'Running discovery…' : 'Run discovery now'}
          </Button>
        }
        description="Find jobs from configured approved sources. Review every result before importing drafts."
        eyebrow="Administration"
        title="Discover jobs"
      />

      {errorMessage ? (
        <Alert
          action={
            <Button color="inherit" disabled={runState.isLoading} onClick={() => void startRun()}>
              Retry
            </Button>
          }
          severity="error"
        >
          {errorMessage}
          {providerError
            ? ' An administrator must configure the discovery provider on the server.'
            : null}
        </Alert>
      ) : null}

      <Paper component="section" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography component="h2" sx={{ mb: 2 }} variant="h6">
          Discovery run history
        </Typography>
        {runs.isLoading ? <PageLoadingIndicator label="Loading discovery runs" /> : null}
        {runs.isError ? (
          <Alert
            action={<Button onClick={() => void runs.refetch()}>Retry</Button>}
            severity="error"
          >
            Unable to load discovery run history.
          </Alert>
        ) : null}
        {!runs.isLoading && !runs.isError && (runs.data?.length ?? 0) === 0 ? (
          <Typography color="text.secondary">No discovery runs yet.</Typography>
        ) : null}
        {(runs.data?.length ?? 0) > 0 ? (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table aria-label="Discovery run history" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Run date/time</TableCell><TableCell>Status</TableCell>
                  <TableCell>Provider</TableCell><TableCell align="right">Total found</TableCell>
                  <TableCell align="right">New candidates</TableCell>
                  <TableCell align="right">Duplicates</TableCell>
                  <TableCell align="right">Invalid/failed</TableCell><TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.data?.map((run) => (
                  <RunRow key={run.id} onRetry={startRun} run={run} running={runState.isLoading} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Paper>
    </Stack>
  );
};

const RunRow = ({
  onRetry,
  run,
  running,
}: {
  onRetry: () => Promise<void>;
  run: JobDiscoveryRunSummary;
  running: boolean;
}) => {
  const isFailed = run.status.toLowerCase().includes('failed');
  const newCandidates = Math.max(run.candidateCount - run.duplicateCount - run.importedCount, 0);
  return (
    <TableRow hover>
      <TableCell>{formatAdminDate(run.startedAtUtc)}</TableCell>
      <TableCell><Chip label={run.status} size="small" /></TableCell>
      <TableCell>Configured sources</TableCell>
      <TableCell align="right">{run.candidateCount}</TableCell>
      <TableCell align="right">{newCandidates}</TableCell>
      <TableCell align="right">{run.duplicateCount}</TableCell>
      <TableCell align="right">{isFailed || run.errorSummary ? 1 : 0}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Button component={Link} size="small" to={buildAdminJobDiscoveryRunPath(run.id)}>
            Review
          </Button>
          {isFailed ? (
            <Button
              disabled={running}
              onClick={() => void onRetry()}
              size="small"
              startIcon={<ReplayOutlinedIcon />}
            >
              Retry
            </Button>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default AdminJobDiscoveryPage;
