import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, Card, CardActions, CardContent, Chip, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  ROUTES,
  buildAdminCompanyDetailsPath,
  buildAdminCompanyEditPath,
} from '@/constants/routes';
import {
  isAdminApiError,
  useDeleteAdminCompanyMutation,
  useGetAdminCompaniesQuery,
} from '@/features/admin/api/adminApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import type { AdminCompany } from '@/features/admin/types/adminModels';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

export const AdminCompaniesPage = () => {
  useDocumentMetadata('Companies | Career Portal', 'Manage Career Portal companies.');
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [deleting, setDeleting] = useState<AdminCompany | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);
  const pageNumber = Math.max(1, Number(params.get('page')) || 1);
  const verified = params.get('verified');
  const records = params.get('records') ?? 'active';
  const companies = useGetAdminCompaniesQuery({
    isDeleted: records === 'all' ? undefined : records === 'deleted',
    isVerified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
    search: params.get('search') || undefined,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const [deleteCompany, deleteState] = useDeleteAdminCompanyMutation();

  useEffect(() => {
    if ((params.get('search') ?? '') === debouncedSearch.trim()) return;
    const next = new URLSearchParams(params);
    if (debouncedSearch.trim()) next.set('search', debouncedSearch.trim());
    else next.delete('search');
    next.delete('page');
    setParams(next, { replace: true });
  }, [debouncedSearch, params, setParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const confirmDelete = async () => {
    if (!deleting || deleteState.isLoading) return;
    setDeleteError(null);
    try {
      await deleteCompany(deleting.id).unwrap();
      enqueueSnackbar('Company deleted successfully.', { variant: 'success' });
      setDeleting(null);
    } catch (error: unknown) {
      setDeleteError(
        isAdminApiError(error)
          ? error.message
          : 'The company could not be deleted. It may still be referenced by jobs.',
      );
    }
  };

  const actions = (company: AdminCompany) => (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      <Button component={Link} size="small" to={buildAdminCompanyDetailsPath(company.id)}>
        View
      </Button>
      {!company.isDeleted ? (
        <>
          <Button
            component={Link}
            size="small"
            startIcon={<EditOutlinedIcon />}
            to={buildAdminCompanyEditPath(company.id)}
          >
            Edit
          </Button>
          <Button
            color="error"
            onClick={() => {
              setDeleteError(null);
              setDeleting(company);
            }}
            size="small"
            startIcon={<DeleteOutlineIcon />}
          >
            Delete
          </Button>
        </>
      ) : null}
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              component={Link}
              startIcon={<AddOutlinedIcon />}
              to={ROUTES.ADMIN_COMPANY_CREATE}
              variant="contained"
            >
              Add company
            </Button>
          </Stack>
        }
        description="Search, verify, update, and safely delete backend company records."
        eyebrow="Administration"
        title="Companies"
      />
      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Search companies"
              onChange={(event) => setSearch(event.target.value)}
              value={search}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="company-verified-filter">Verification</InputLabel>
              <Select
                label="Verification"
                labelId="company-verified-filter"
                onChange={(event) => setFilter('verified', event.target.value)}
                value={verified ?? ''}
              >
                <MenuItem value="">All companies</MenuItem>
                <MenuItem value="true">Verified</MenuItem>
                <MenuItem value="false">Not verified</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="company-record-filter">Records</InputLabel>
              <Select
                label="Records"
                labelId="company-record-filter"
                onChange={(event) => setFilter('records', event.target.value)}
                value={records}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {companies.isLoading ? <PageLoadingIndicator label="Loading companies" /> : companies.isError ? (
        <ErrorState onRetry={() => void companies.refetch()} title="Companies unavailable" />
      ) : companies.data?.items.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table aria-label="Administrator companies">
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Industry / location</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.data.items.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Typography fontWeight={700}>{company.name}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {company.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {company.industry ?? 'Not set'} · {company.location ?? 'Not set'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={company.isVerified ? 'success' : 'default'}
                        label={company.isVerified ? 'Verified' : 'Not verified'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatAdminDate(company.createdAtUtc)}</TableCell>
                    <TableCell>{actions(company)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {companies.data.items.map((company) => (
              <Card component="article" key={company.id}>
                <CardContent>
                  <Typography component="h2" variant="h3">
                    {company.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {company.industry ?? 'Industry not set'} ·{' '}
                    {company.location ?? 'Location not set'}
                  </Typography>
                </CardContent>
                <CardActions>{actions(company)}</CardActions>
              </Card>
            ))}
          </Stack>
          {companies.data.totalPages > 1 ? (
            <Pagination
              aria-label="Companies pagination"
              count={companies.data.totalPages}
              onChange={(_, page) => setFilter('page', String(page))}
              page={pageNumber}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          description="No company records match the current filters."
          title="No companies found"
        />
      )}
      <ConfirmActionDialog
        actionLabel="Delete company"
        description={`Delete ${deleting?.name ?? 'this company'}? The backend will refuse deletion when jobs still reference it.`}
        error={deleteError}
        isProcessing={deleteState.isLoading}
        onClose={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
        open={Boolean(deleting)}
        title="Delete company"
      />
    </Stack>
  );
};
