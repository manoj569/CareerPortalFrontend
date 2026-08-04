import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  ROUTES,
  buildAdminJobDetailsPath,
  buildAdminJobEditPath,
  buildJobDetailsPath,
} from '@/constants/routes';
import {
  isAdminApiError,
  useArchiveAdminJobMutation,
  useCloseAdminJobMutation,
  useFeatureAdminJobMutation,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCompanyOptionsQuery,
  useGetAdminJobsQuery,
  usePublishAdminJobMutation,
  useSetAdminJobHiddenMutation,
  useSoftDeleteAdminJobMutation,
  useUnfeatureAdminJobMutation,
  useUnpublishAdminJobMutation,
} from '@/features/admin/api/adminApi';
import { AdminJobStatusBadge } from '@/features/admin/components/AdminStatusBadge';
import { AdminCsvImportDialog } from '@/features/admin/components/AdminCsvImportDialog';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { JobStatus, type AdminJob, type AdminJobsQuery } from '@/features/admin/types/adminModels';
import { formatAdminDate, getAdminJobStatusLabel } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  employmentTypeOptions,
  getEmploymentTypeLabel,
  getWorkplaceTypeLabel,
  workplaceTypeOptions,
} from '@/features/jobs/constants/jobOptions';
import { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

const parsePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseEnum = <T extends number>(
  value: string | null,
  enumObject: Record<string, string | number>,
): T | undefined => {
  const parsed = Number(value);
  return Object.values(enumObject).includes(parsed) ? (parsed as T) : undefined;
};

type JobAction =
  | 'archive'
  | 'close'
  | 'delete'
  | 'feature'
  | 'hide'
  | 'publish'
  | 'show'
  | 'unfeature'
  | 'unpublish';

interface PendingAction {
  action: JobAction;
  job: AdminJob;
}

const actionCopy: Record<JobAction, { label: string; verb: string }> = {
  archive: { label: 'Archive job', verb: 'archive' },
  close: { label: 'Close job', verb: 'close' },
  delete: { label: 'Delete job', verb: 'soft-delete' },
  feature: { label: 'Feature job', verb: 'feature' },
  hide: { label: 'Hide job', verb: 'hide' },
  publish: { label: 'Publish job', verb: 'publish' },
  show: { label: 'Make job visible', verb: 'make visible' },
  unfeature: { label: 'Remove featured status', verb: 'unfeature' },
  unpublish: { label: 'Unpublish job', verb: 'unpublish' },
};

const canPublishJob = (job: AdminJob): boolean =>
  !job.isDeleted &&
  job.status !== JobStatus.Published &&
  job.status !== JobStatus.Archived &&
  (!job.expiresAtUtc || new Date(job.expiresAtUtc) > new Date());

export const AdminJobsPage = () => {
  useDocumentMetadata(
    'Manage jobs | Career Portal',
    'Search and manage jobs through administrator APIs.',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? '';
    if (debouncedSearch.trim() === currentSearch) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch.trim()) next.set('search', debouncedSearch.trim());
    else next.delete('search');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  const pageNumber = parsePositiveInteger(searchParams.get('page'), 1);
  const status = parseEnum<JobStatus>(searchParams.get('status'), JobStatus);
  const employmentType = parseEnum<EmploymentType>(
    searchParams.get('employmentType'),
    EmploymentType,
  );
  const workplaceType = parseEnum<WorkplaceType>(searchParams.get('workplaceType'), WorkplaceType);
  const categoryId = searchParams.get('categoryId') || undefined;
  const companyId = searchParams.get('companyId') || undefined;
  const sortValue = searchParams.get('sort') ?? 'createdAt-desc';
  const [sortByValue, sortDirectionValue] = sortValue.split('-');
  const supportedSorts: AdminJobsQuery['sortBy'][] = [
    'createdAt',
    'updatedAt',
    'publishedAt',
    'title',
    'expiresAt',
    'status',
  ];
  const sortBy = supportedSorts.includes(sortByValue as AdminJobsQuery['sortBy'])
    ? (sortByValue as AdminJobsQuery['sortBy'])
    : 'createdAt';
  const sortDirection = sortDirectionValue === 'asc' ? 'asc' : 'desc';
  const deletedFilter = searchParams.get('records') ?? 'active';
  const isDeleted =
    deletedFilter === 'all' ? undefined : deletedFilter === 'deleted' ? true : false;

  const query = useMemo<AdminJobsQuery>(
    () => ({
      categoryId,
      companyId,
      employmentType,
      isDeleted,
      pageNumber,
      pageSize: PAGE_SIZE,
      search: searchParams.get('search') || undefined,
      sortBy,
      sortDirection,
      status,
      workplaceType,
    }),
    [
      categoryId,
      companyId,
      employmentType,
      isDeleted,
      pageNumber,
      searchParams,
      sortBy,
      sortDirection,
      status,
      workplaceType,
    ],
  );
  const jobs = useGetAdminJobsQuery(query);
  const categories = useGetAdminCategoryOptionsQuery();
  const companies = useGetAdminCompanyOptionsQuery();
  const [publishJob, publishState] = usePublishAdminJobMutation();
  const [unpublishJob, unpublishState] = useUnpublishAdminJobMutation();
  const [closeJob, closeState] = useCloseAdminJobMutation();
  const [archiveJob, archiveState] = useArchiveAdminJobMutation();
  const [featureJob, featureState] = useFeatureAdminJobMutation();
  const [unfeatureJob, unfeatureState] = useUnfeatureAdminJobMutation();
  const [setHidden, hiddenState] = useSetAdminJobHiddenMutation();
  const [softDelete, deleteState] = useSoftDeleteAdminJobMutation();
  const isActing =
    publishState.isLoading ||
    unpublishState.isLoading ||
    closeState.isLoading ||
    archiveState.isLoading ||
    featureState.isLoading ||
    unfeatureState.isLoading ||
    hiddenState.isLoading ||
    deleteState.isLoading;

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const runAction = async () => {
    if (!pendingAction || isActing) return;
    setActionError(null);
    const { action, job } = pendingAction;
    try {
      if (action === 'publish') await publishJob(job.id).unwrap();
      if (action === 'unpublish') await unpublishJob(job.id).unwrap();
      if (action === 'close') await closeJob(job.id).unwrap();
      if (action === 'archive') await archiveJob(job.id).unwrap();
      if (action === 'feature') await featureJob(job.id).unwrap();
      if (action === 'unfeature') await unfeatureJob(job.id).unwrap();
      if (action === 'hide' || action === 'show') {
        await setHidden({ jobId: job.id, value: action === 'hide' }).unwrap();
      }
      if (action === 'delete') await softDelete(job.id).unwrap();
      enqueueSnackbar(`${job.title} updated successfully.`, { variant: 'success' });
      setPendingAction(null);
    } catch (error: unknown) {
      setActionError(
        isAdminApiError(error)
          ? error.status === 409
            ? `The backend rejected this state change: ${error.message}`
            : error.message
          : 'The job could not be updated. Please try again.',
      );
    }
  };

  const openAction = (action: JobAction, job: AdminJob) => {
    setActionError(null);
    setPendingAction({ action, job });
  };

  const jobActions = (job: AdminJob) => (
    <Stack direction="row" flexWrap="wrap" gap={0.75}>
      <Button component={Link} size="small" to={buildAdminJobDetailsPath(job.id)}>
        Details
      </Button>
      {!job.isDeleted ? (
        <Button
          component={Link}
          size="small"
          startIcon={<EditOutlinedIcon />}
          to={buildAdminJobEditPath(job.id)}
        >
          Edit
        </Button>
      ) : null}
      {job.status === JobStatus.Published && !job.isHidden && !job.isDeleted ? (
        <Button component={Link} size="small" to={buildJobDetailsPath(job.slug)}>
          View
        </Button>
      ) : null}
      {canPublishJob(job) ? (
        <Button
          onClick={() => openAction('publish', job)}
          size="small"
          startIcon={<PublishOutlinedIcon />}
        >
          Publish
        </Button>
      ) : null}
      {job.status === JobStatus.Published && !job.isDeleted ? (
        <>
          <Button onClick={() => openAction('unpublish', job)} size="small">
            Unpublish
          </Button>
          <Button
            onClick={() => openAction('close', job)}
            size="small"
            startIcon={<BlockOutlinedIcon />}
          >
            Close
          </Button>
        </>
      ) : null}
      {!job.isDeleted && job.status !== JobStatus.Archived ? (
        <Button
          onClick={() => openAction('archive', job)}
          size="small"
          startIcon={<ArchiveOutlinedIcon />}
        >
          Archive
        </Button>
      ) : null}
      {!job.isDeleted ? (
        <Button
          onClick={() => openAction(job.isHidden ? 'show' : 'hide', job)}
          size="small"
          startIcon={job.isHidden ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
        >
          {job.isHidden ? 'Show' : 'Hide'}
        </Button>
      ) : null}
      {!job.isDeleted && job.status === JobStatus.Published ? (
        <Button
          onClick={() => openAction(job.isFeatured ? 'unfeature' : 'feature', job)}
          size="small"
          startIcon={<StarOutlineIcon />}
        >
          {job.isFeatured ? 'Unfeature' : 'Feature'}
        </Button>
      ) : null}
      {!job.isDeleted ? (
        <Button
          color="error"
          onClick={() => openAction('delete', job)}
          size="small"
          startIcon={<DeleteOutlineIcon />}
        >
          Delete
        </Button>
      ) : null}
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              onClick={() => setIsImportOpen(true)}
              startIcon={<FileUploadOutlinedIcon />}
              variant="outlined"
            >
              Import CSV
            </Button>
            <Button
              component={Link}
              startIcon={<AddOutlinedIcon />}
              to={ROUTES.ADMIN_JOB_CREATE}
              variant="contained"
            >
              Create job
            </Button>
          </Stack>
        }
        description="Search, filter, publish, archive, feature, hide, and soft-delete backend jobs."
        eyebrow="Administration"
        title="Manage jobs"
      />

      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Search jobs"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Title, reference, company…"
              value={searchInput}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-status-filter-label">Status</InputLabel>
              <Select
                label="Status"
                labelId="job-status-filter-label"
                onChange={(event) => setFilter('status', String(event.target.value))}
                value={status ?? ''}
              >
                <MenuItem value="">All statuses</MenuItem>
                {Object.values(JobStatus)
                  .filter((value): value is JobStatus => typeof value === 'number')
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {getAdminJobStatusLabel(value)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-category-filter-label">Category</InputLabel>
              <Select
                label="Category"
                labelId="job-category-filter-label"
                onChange={(event) => setFilter('categoryId', event.target.value)}
                value={categoryId ?? ''}
              >
                <MenuItem value="">All categories</MenuItem>
                {categories.data?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-company-filter-label">Company</InputLabel>
              <Select
                label="Company"
                labelId="job-company-filter-label"
                onChange={(event) => setFilter('companyId', event.target.value)}
                value={companyId ?? ''}
              >
                <MenuItem value="">All companies</MenuItem>
                {companies.data?.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-type-filter-label">Job type</InputLabel>
              <Select
                label="Job type"
                labelId="job-type-filter-label"
                onChange={(event) => setFilter('employmentType', String(event.target.value))}
                value={employmentType ?? ''}
              >
                <MenuItem value="">All types</MenuItem>
                {employmentTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="work-mode-filter-label">Work mode</InputLabel>
              <Select
                label="Work mode"
                labelId="work-mode-filter-label"
                onChange={(event) => setFilter('workplaceType', String(event.target.value))}
                value={workplaceType ?? ''}
              >
                <MenuItem value="">All modes</MenuItem>
                {workplaceTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-sort-label">Sort</InputLabel>
              <Select
                label="Sort"
                labelId="job-sort-label"
                onChange={(event) => setFilter('sort', event.target.value)}
                value={`${sortBy}-${sortDirection}`}
              >
                <MenuItem value="createdAt-desc">Newest created</MenuItem>
                <MenuItem value="createdAt-asc">Oldest created</MenuItem>
                <MenuItem value="title-asc">Title A–Z</MenuItem>
                <MenuItem value="status-asc">Status</MenuItem>
                <MenuItem value="publishedAt-desc">Recently published</MenuItem>
                <MenuItem value="expiresAt-asc">Closing soon</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-record-filter-label">Records</InputLabel>
              <Select
                label="Records"
                labelId="job-record-filter-label"
                onChange={(event) => setFilter('records', event.target.value)}
                value={deletedFilter}
              >
                <MenuItem value="active">Active records</MenuItem>
                <MenuItem value="deleted">Deleted records</MenuItem>
                <MenuItem value="all">All records</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {categories.isError || companies.isError ? (
        <Alert severity="warning">
          Company or category filter options could not be loaded; existing URL filters remain
          active.
        </Alert>
      ) : null}

      {jobs.isLoading ? (
        <Stack aria-label="Loading admin jobs" role="status" spacing={2}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton height={82} key={index} variant="rounded" />
          ))}
        </Stack>
      ) : jobs.isError ? (
        <ErrorState onRetry={() => void jobs.refetch()} title="Jobs unavailable" />
      ) : jobs.data?.items.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Table aria-label="Administrator jobs">
              <caption className="sr-only">
                Administrator jobs including company, category, employment type, status, dates, and
                actions
              </caption>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Company / category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created / closing</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.data.items.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Typography fontWeight={700}>{job.title}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {job.referenceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {job.companyName}
                      <Typography color="text.secondary" variant="body2">
                        {job.categoryName} · {job.location ?? 'Location not set'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getEmploymentTypeLabel(job.employmentType)}
                      <Typography color="text.secondary" variant="body2">
                        {getWorkplaceTypeLabel(job.workplaceType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="flex-start" spacing={0.75}>
                        <AdminJobStatusBadge status={job.status} />
                        {job.isHidden ? (
                          <Typography color="text.secondary" variant="caption">
                            Hidden
                          </Typography>
                        ) : null}
                        {job.isDeleted ? (
                          <Typography color="error.main" variant="caption">
                            Deleted
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {formatAdminDate(job.createdAtUtc)}
                      <Typography color="text.secondary" variant="body2">
                        Closes {formatAdminDate(job.expiresAtUtc)}
                      </Typography>
                    </TableCell>
                    <TableCell>{jobActions(job)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ display: { xs: 'flex', lg: 'none' } }}>
            {jobs.data.items.map((job) => (
              <Card component="article" key={job.id}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack
                      alignItems="flex-start"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box minWidth={0}>
                        <Typography component="h2" fontWeight={700} variant="h3">
                          {job.title}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {job.referenceNumber}
                        </Typography>
                      </Box>
                      <AdminJobStatusBadge status={job.status} />
                    </Stack>
                    <Typography>
                      {job.companyName} · {job.categoryName}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {getEmploymentTypeLabel(job.employmentType)} ·{' '}
                      {getWorkplaceTypeLabel(job.workplaceType)} · Created{' '}
                      {formatAdminDate(job.createdAtUtc)}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ alignItems: 'flex-start', flexDirection: 'column', px: 2 }}>
                  {jobActions(job)}
                </CardActions>
              </Card>
            ))}
          </Stack>

          {jobs.data.totalPages > 1 ? (
            <Box display="flex" justifyContent="center">
              <Pagination
                aria-label="Administrator jobs pagination"
                boundaryCount={1}
                count={jobs.data.totalPages}
                onChange={(_, page) => {
                  const next = new URLSearchParams(searchParams);
                  if (page === 1) next.delete('page');
                  else next.set('page', String(page));
                  setSearchParams(next);
                }}
                page={pageNumber}
                showFirstButton
                showLastButton
                siblingCount={0}
              />
            </Box>
          ) : null}
        </>
      ) : (
        <EmptyState
          actionLabel="Clear filters"
          description="No backend job records match the current administrator filters."
          onAction={() => {
            setSearchInput('');
            setSearchParams(new URLSearchParams());
          }}
          title="No jobs found"
        />
      )}

      <Alert severity="info">
        The backend does not expose unpublish, restore, application-count, or dedicated
        activate/deactivate operations. Permanent deletion is intentionally not exposed here; soft
        deletion is the safer supported workflow.
      </Alert>

      <ConfirmActionDialog
        actionLabel={pendingAction ? actionCopy[pendingAction.action].label : 'Confirm'}
        description={
          pendingAction
            ? `This will ${actionCopy[pendingAction.action].verb} “${pendingAction.job.title}”. The backend remains authoritative and may reject invalid state transitions.`
            : ''
        }
        error={actionError}
        isProcessing={isActing}
        onClose={() => {
          setActionError(null);
          setPendingAction(null);
        }}
        onConfirm={() => void runAction()}
        open={Boolean(pendingAction)}
        title={pendingAction ? actionCopy[pendingAction.action].label : 'Confirm action'}
      />
      <AdminCsvImportDialog
        kind="jobs"
        onClose={() => setIsImportOpen(false)}
        open={isImportOpen}
      />
    </Stack>
  );
};
