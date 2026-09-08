import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import {
  isAdminAIApplyApiError,
  useCloseAdminAIApplySiteMutation,
  useGetAdminAIApplyApplicationsQuery,
  useGetAdminAIApplyCostsQuery,
  useGetAdminAIApplyFailuresQuery,
  useGetAdminAIApplyOverviewQuery,
  useGetAdminAIApplySitesQuery,
  useGetAdminAIApplyWorkersQuery,
  useOpenAdminAIApplySiteMutation,
  useRequeueAdminAIApplyApplicationMutation,
} from '@/features/admin/aiApply/api/adminAIApplyApi';
import {
  AdminAIApplySiteHealthChip,
  AdminAIApplyStatusChip,
} from '@/features/admin/aiApply/components/AdminAIApplyStatusChip';
import {
  AdminAIApplyRunStatus,
  AdminAIApplySiteHealth,
  type AdminAIApplyApplication,
  type AdminAIApplyApplicationsPage,
  type AdminAIApplySiteStatus,
} from '@/features/admin/aiApply/types/adminAIApplyModels';
import {
  canOfferRequeue,
  failureDescription,
  runStatusLabel,
  siteLabel,
} from '@/features/admin/aiApply/utils/adminAIApplyStatus';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

type View = 'overview' | 'applications' | 'failures' | 'sites' | 'workers' | 'costs';
const views: View[] = ['overview', 'applications', 'failures', 'sites', 'workers', 'costs'];
const isView = (value: string | null): value is View =>
  value !== null && views.some((item) => item === value);
const labels: Record<View, string> = {
  overview: 'Overview',
  applications: 'Applications',
  failures: 'Failures',
  sites: 'Sites',
  workers: 'Workers',
  costs: 'Costs',
};
const periodFrom = (params: URLSearchParams) => params.get('from') || undefined;
const periodTo = (params: URLSearchParams) => params.get('to') || undefined;
const safeError = (error: unknown, fallback: string) =>
  isAdminAIApplyApiError(error) && error.status === 403
    ? 'You do not have access to AI Apply operations.'
    : fallback;
const number = (value: number | null) =>
  value === null
    ? 'Not available'
    : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(value);

const LoadingRows = () => (
  <Stack aria-label="Loading AI Apply operations" role="status" spacing={1}>
    {Array.from({ length: 4 }, (_, i) => (
      <Skeleton height={64} key={i} variant="rounded" />
    ))}
  </Stack>
);

export const AdminAIApplyOperationsPage = () => {
  useDocumentMetadata(
    'AI Apply Operations | Career Harbor',
    'Monitor AI Apply operational health.',
  );
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const view: View = isView(requested) ? requested : 'overview';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const statusNumber = Number(params.get('status'));
  const status = Object.values(AdminAIApplyRunStatus).includes(statusNumber)
    ? statusNumber
    : undefined;
  const period = { from: periodFrom(params), to: periodTo(params) };
  const common = { pollingInterval: 30_000, refetchOnFocus: true, skipPollingIfUnfocused: true };
  const overview = useGetAdminAIApplyOverviewQuery(period, {
    ...common,
    skip: view !== 'overview',
  });
  const applications = useGetAdminAIApplyApplicationsQuery(
    { ...period, failureCode: params.get('failureCode') || undefined, page, pageSize: 25, status },
    { ...common, skip: view !== 'applications' },
  );
  const failures = useGetAdminAIApplyFailuresQuery(period, {
    ...common,
    skip: view !== 'failures',
  });
  const sites = useGetAdminAIApplySitesQuery(undefined, {
    ...common,
    skip: view !== 'sites' && view !== 'overview',
  });
  const workers = useGetAdminAIApplyWorkersQuery(undefined, {
    ...common,
    pollingInterval: 15_000,
    skip: view !== 'workers' && view !== 'overview',
  });
  const costs = useGetAdminAIApplyCostsQuery(period, { ...common, skip: view !== 'costs' });
  const [requeue, requeueState] = useRequeueAdminAIApplyApplicationMutation();
  const [openSite, openState] = useOpenAdminAIApplySiteMutation();
  const [closeSite, closeState] = useCloseAdminAIApplySiteMutation();
  const [selectedApplication, setSelectedApplication] = useState<AdminAIApplyApplication | null>(
    null,
  );
  const [selectedSite, setSelectedSite] = useState<{
    item: AdminAIApplySiteStatus;
    action: 'open' | 'close';
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  const changeView = (nextView: View) => {
    const next = new URLSearchParams();
    next.set('view', nextView);
    setParams(next);
  };
  const refresh = () => {
    if (view === 'overview') {
      void overview.refetch();
      void sites.refetch();
      void workers.refetch();
    } else if (view === 'applications') void applications.refetch();
    else if (view === 'failures') void failures.refetch();
    else if (view === 'sites') void sites.refetch();
    else if (view === 'workers') void workers.refetch();
    else void costs.refetch();
  };

  const confirmRequeue = async () => {
    if (!selectedApplication) return;
    setActionError(null);
    try {
      await requeue(selectedApplication.id).unwrap();
      enqueueSnackbar('Application requeued', { variant: 'success' });
      setSelectedApplication(null);
    } catch (error) {
      setActionError(
        isAdminAIApplyApiError(error) ? error.message : 'The application could not be requeued.',
      );
    }
  };
  const confirmSiteAction = async () => {
    if (!selectedSite) return;
    setActionError(null);
    try {
      const action = selectedSite.action === 'open' ? openSite : closeSite;
      await action(selectedSite.item.site).unwrap();
      enqueueSnackbar(`Site circuit ${selectedSite.action === 'open' ? 'opened' : 'closed'}.`, {
        variant: 'success',
      });
      setSelectedSite(null);
    } catch (error) {
      if (isAdminAIApplyApiError(error) && error.status === 409) {
        void sites.refetch();
        enqueueSnackbar('Site state changed. Current status has been refreshed.', {
          variant: 'info',
        });
        setSelectedSite(null);
      } else
        setActionError(
          isAdminAIApplyApiError(error) ? error.message : 'The site circuit could not be changed.',
        );
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          <Button onClick={refresh} startIcon={<RefreshOutlinedIcon />} variant="outlined">
            Refresh
          </Button>
        }
        description="Monitor automation health, application processing, failures, sites, workers, and costs."
        eyebrow="Administration"
        title="AI Apply Operations"
      />
      <Paper>
        <Tabs
          aria-label="AI Apply operations sections"
          onChange={(_, value: View) => changeView(value)}
          scrollButtons="auto"
          value={view}
          variant="scrollable"
        >
          {views.map((item) => (
            <Tab key={item} label={labels[item]} value={item} />
          ))}
        </Tabs>
      </Paper>
      {view === 'overview' || view === 'applications' || view === 'failures' || view === 'costs' ? (
        <Paper component="section" sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="From"
              onChange={(e) => setParam('from', e.target.value || undefined)}
              type="date"
              value={period.from?.slice(0, 10) ?? ''}
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="To"
              onChange={(e) => setParam('to', e.target.value || undefined)}
              type="date"
              value={period.to?.slice(0, 10) ?? ''}
            />
          </Stack>
        </Paper>
      ) : null}
      {view === 'overview' ? (
        overview.isLoading ? (
          <LoadingRows />
        ) : overview.isError ? (
          <ErrorState
            onRetry={() => void overview.refetch()}
            title={safeError(overview.error, "We couldn't load AI Apply operations.")}
          />
        ) : overview.data ? (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              {(
                [
                  ['Queued', overview.data.queued],
                  ['Processing', overview.data.processing],
                  ['Waiting for user', overview.data.waitingForUser],
                  ['Submitted', overview.data.submitted],
                  ['Failed', overview.data.failed],
                  ['Dead Lettered', overview.data.deadLettered],
                  ['Needs Review / unconfirmed', overview.data.submissionUnconfirmed],
                  ['Active workers', overview.data.activeWorkers],
                ] as const
              ).map(([label, value]) => (
                <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <DashboardStatCard icon={<ReplayOutlinedIcon />} label={label} value={value} />
                </Grid>
              ))}
            </Grid>
            <Paper component="section" sx={{ p: 2.5 }}>
              <Typography component="h2" variant="h3">
                Operational Health Summary
              </Typography>
              <Typography sx={{ mt: 1 }}>
                Browser execution: {number(overview.data.browserExecutionSeconds)} seconds · Backend
                estimated cost: {number(overview.data.estimatedCost)}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                Worker snapshot: {workers.data?.[0]?.status ?? 'Unavailable'} · Failing sites:{' '}
                {sites.data?.filter((x) => x.health === AdminAIApplySiteHealth.Failing).length ??
                  'Unavailable'}
              </Typography>
            </Paper>
          </Stack>
        ) : null
      ) : null}
      {view === 'applications' ? (
        <ApplicationsView
          applications={applications}
          page={page}
          setParam={setParam}
          setSelected={setSelectedApplication}
          status={status}
        />
      ) : null}
      {view === 'failures' ? (
        failures.isLoading ? (
          <LoadingRows />
        ) : failures.isError ? (
          <ErrorState
            onRetry={() => void failures.refetch()}
            title={safeError(failures.error, "We couldn't load AI Apply failures.")}
          />
        ) : failures.data?.length ? (
          <TableContainer component={Paper}>
            <Table aria-label="AI Apply failures">
              <TableHead>
                <TableRow>
                  <TableCell>Failure code</TableCell>
                  <TableCell>Classification</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Last failure</TableCell>
                  <TableCell>Explanation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failures.data.map((item) => (
                  <TableRow key={`${item.failureCode}-${item.failureClassification}`}>
                    <TableCell>{item.failureCode}</TableCell>
                    <TableCell>{item.failureClassification ?? 'Unclassified'}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{formatAdminDate(item.lastFailureAtUtc)}</TableCell>
                    <TableCell>{failureDescription(item.failureClassification)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            description="No aggregated failure groups were returned for the selected period."
            title="No failures match these filters."
          />
        )
      ) : null}
      {view === 'sites' ? (
        sites.isLoading ? (
          <LoadingRows />
        ) : sites.isError ? (
          <ErrorState
            onRetry={() => void sites.refetch()}
            title={safeError(sites.error, "We couldn't load AI Apply site health.")}
          />
        ) : (
          <Stack spacing={2}>
            <Alert severity="info">
              Site health and circuit state are currently instance-local. The API lists health, not
              the exact circuit state.
            </Alert>
            {sites.data?.length ? (
              <TableContainer component={Paper}>
                <Table aria-label="AI Apply site health">
                  <TableHead>
                    <TableRow>
                      <TableCell>Site</TableCell>
                      <TableCell>Health</TableCell>
                      <TableCell>Manual circuit controls</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sites.data.map((item) => (
                      <TableRow key={item.site}>
                        <TableCell>{siteLabel(item.site)}</TableCell>
                        <TableCell>
                          <AdminAIApplySiteHealthChip health={item.health} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              aria-label={`Open circuit for ${siteLabel(item.site)}`}
                              onClick={() => setSelectedSite({ item, action: 'open' })}
                              size="small"
                            >
                              Open circuit
                            </Button>
                            <Button
                              aria-label={`Close circuit for ${siteLabel(item.site)}`}
                              onClick={() => setSelectedSite({ item, action: 'close' })}
                              size="small"
                            >
                              Close circuit
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState
                description="The backend did not return any site-health snapshots."
                title="No site-health data is available."
              />
            )}
          </Stack>
        )
      ) : null}
      {view === 'workers' ? (
        workers.isLoading ? (
          <LoadingRows />
        ) : workers.isError ? (
          <ErrorState
            onRetry={() => void workers.refetch()}
            title={safeError(workers.error, "We couldn't load AI Apply workers.")}
          />
        ) : (
          <Stack spacing={2}>
            <Alert severity="info">
              Worker heartbeat currently reflects this application instance only.
            </Alert>
            {workers.data?.length ? (
              <TableContainer component={Paper}>
                <Table aria-label="AI Apply workers">
                  <TableHead>
                    <TableRow>
                      <TableCell>Worker ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Started</TableCell>
                      <TableCell>Last heartbeat</TableCell>
                      <TableCell>Active applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workers.data.map((item) => (
                      <TableRow key={item.workerId}>
                        <TableCell>{item.workerId}</TableCell>
                        <TableCell>
                          <Chip label={item.status} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{formatAdminDate(item.startedAtUtc)}</TableCell>
                        <TableCell>{formatAdminDate(item.lastHeartbeatAtUtc)}</TableCell>
                        <TableCell>{item.activeExecutions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState
                description="The backend did not return a worker snapshot for this application instance."
                title="No worker status is currently available."
              />
            )}
          </Stack>
        )
      ) : null}
      {view === 'costs' ? (
        costs.isLoading ? (
          <LoadingRows />
        ) : costs.isError ? (
          <ErrorState
            onRetry={() => void costs.refetch()}
            title={safeError(costs.error, "We couldn't load AI Apply costs.")}
          />
        ) : costs.data ? (
          <Stack spacing={2}>
            <Alert severity="info">
              Cost values are backend estimates. The API does not provide a currency or named cost
              unit.
            </Alert>
            <Grid container spacing={2}>
              {(
                [
                  ['AI requests', costs.data.totals?.aiRequests ?? 0],
                  ['Input tokens', costs.data.totals?.inputTokens ?? 0],
                  ['Output tokens', costs.data.totals?.outputTokens ?? 0],
                  ['Browser seconds', costs.data.totals?.browserSeconds ?? 0],
                  [
                    'Proxy cost',
                    costs.data.totals ? number(costs.data.totals.proxyCost) : 'No records',
                  ],
                  [
                    'Estimated cost',
                    costs.data.totals ? number(costs.data.totals.estimatedCost) : 'No records',
                  ],
                  ['Confirmed submissions', costs.data.confirmedSubmissions],
                  [
                    'Cost per confirmed application',
                    number(costs.data.costPerConfirmedApplication),
                  ],
                ] as const
              ).map(([label, value]) => (
                <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <DashboardStatCard icon={<ReplayOutlinedIcon />} label={label} value={value} />
                </Grid>
              ))}
            </Grid>
            {!costs.data.totals ? (
              <EmptyState
                description="The backend did not return cost totals for the selected period."
                title="No cost records are available for this period."
              />
            ) : null}
          </Stack>
        ) : null
      ) : null}
      <ConfirmActionDialog
        actionLabel="Requeue application"
        description="Career Harbor will make the application eligible for processing again if the backend safety checks allow it."
        error={actionError}
        isProcessing={requeueState.isLoading}
        onClose={() => {
          setSelectedApplication(null);
          setActionError(null);
        }}
        onConfirm={() => void confirmRequeue()}
        open={Boolean(selectedApplication)}
        title="Requeue this application?"
      />
      <ConfirmActionDialog
        actionLabel={selectedSite?.action === 'open' ? 'Open circuit' : 'Close circuit'}
        description={
          selectedSite?.action === 'open'
            ? 'New automated attempts for this site may be blocked until the circuit is closed or recovers according to backend policy.'
            : 'Automation may resume attempts for this site.'
        }
        error={actionError}
        isProcessing={openState.isLoading || closeState.isLoading}
        onClose={() => {
          setSelectedSite(null);
          setActionError(null);
        }}
        onConfirm={() => void confirmSiteAction()}
        open={Boolean(selectedSite)}
        title={`${selectedSite?.action === 'open' ? 'Open' : 'Close'} circuit for this site?`}
      />
    </Stack>
  );
};

interface ApplicationsViewProps {
  applications: {
    data?: AdminAIApplyApplicationsPage;
    error?: unknown;
    isError: boolean;
    isLoading: boolean;
    refetch: () => unknown;
  };
  page: number;
  status?: AdminAIApplyRunStatus;
  setParam: (key: string, value?: string) => void;
  setSelected: (item: AdminAIApplyApplication) => void;
}
const ApplicationsView = ({
  applications,
  page,
  setParam,
  setSelected,
  status,
}: ApplicationsViewProps) => (
  <Stack spacing={2}>
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="ai-apply-status-filter">Status</InputLabel>
          <Select
            label="Status"
            labelId="ai-apply-status-filter"
            onChange={(e) =>
              setParam('status', e.target.value ? String(e.target.value) : undefined)
            }
            value={status ?? ''}
          >
            <MenuItem value="">All statuses</MenuItem>
            {Object.values(AdminAIApplyRunStatus)
              .filter((x): x is AdminAIApplyRunStatus => typeof x === 'number')
              .map((x) => (
                <MenuItem key={x} value={x}>
                  {runStatusLabel(x)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Failure code"
          onChange={(e) => setParam('failureCode', e.target.value || undefined)}
        />
      </Stack>
    </Paper>
    {applications.isLoading ? (
      <LoadingRows />
    ) : applications.isError ? (
      <ErrorState
        onRetry={() => void applications.refetch()}
        title={safeError(applications.error, "We couldn't load AI Apply applications.")}
      />
    ) : applications.data?.items.length ? (
      <>
        <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table aria-label="AI Apply applications">
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Attempts</TableCell>
                <TableCell>Failure</TableCell>
                <TableCell>First / last failure</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.data.items.map((item: AdminAIApplyApplication) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <AdminAIApplyStatusChip status={item.status} />
                    {item.status === AdminAIApplyRunStatus.DeadLettered ? (
                      <Typography color="text.secondary" variant="caption" display="block">
                        Automatic retries are exhausted.
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.retryCount}</TableCell>
                  <TableCell>
                    {item.failureCode ?? '—'}
                    <Typography color="text.secondary" variant="caption" display="block">
                      {item.failureClassification ?? ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatAdminDate(item.firstFailureAtUtc)} /{' '}
                    {formatAdminDate(item.lastFailureAtUtc)}
                  </TableCell>
                  <TableCell>{formatAdminDate(item.createdAtUtc)}</TableCell>
                  <TableCell>
                    {canOfferRequeue(item.status) ? (
                      <Button onClick={() => setSelected(item)} size="small">
                        Requeue
                      </Button>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack spacing={1} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {applications.data.items.map((item: AdminAIApplyApplication) => (
            <Card component="article" key={item.id}>
              <CardContent>
                <Typography component="h2" variant="h3">
                  {item.id}
                </Typography>
                <Box sx={{ my: 1 }}>
                  <AdminAIApplyStatusChip status={item.status} />
                </Box>
                <Typography>Attempts: {item.retryCount}</Typography>
                <Typography color="text.secondary">
                  Failure: {item.failureCode ?? 'None'}
                </Typography>
                <Typography color="text.secondary">
                  Created: {formatAdminDate(item.createdAtUtc)}
                </Typography>
              </CardContent>
              {canOfferRequeue(item.status) ? (
                <CardActions>
                  <Button onClick={() => setSelected(item)}>Requeue</Button>
                </CardActions>
              ) : null}
            </Card>
          ))}
        </Stack>
        {applications.data.total > applications.data.pageSize ? (
          <Pagination
            aria-label="AI Apply applications pagination"
            count={Math.ceil(applications.data.total / applications.data.pageSize)}
            onChange={(_, next) => setParam('page', String(next))}
            page={page}
            sx={{ alignSelf: 'center' }}
          />
        ) : null}
      </>
    ) : (
      <EmptyState
        description="Try changing the status, failure code, or date filters."
        title="No AI Apply applications match these filters."
      />
    )}
  </Stack>
);
