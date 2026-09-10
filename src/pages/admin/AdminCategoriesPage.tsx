import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, Card, CardActions, CardContent, FormControlLabel, Grid, Pagination, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  ROUTES,
  buildAdminCategoryDetailsPath,
  buildAdminCategoryEditPath,
} from '@/constants/routes';
import {
  isAdminApiError,
  useDeleteAdminCategoryMutation,
  useGetAdminCategoriesQuery,
} from '@/features/admin/api/adminApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import type { AdminCategory } from '@/features/admin/types/adminModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

export const AdminCategoriesPage = () => {
  useDocumentMetadata('Categories | Career Portal', 'Manage Career Portal job categories.');
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);
  const pageNumber = Math.max(1, Number(params.get('page')) || 1);
  const rootOnly = params.get('rootOnly') === 'true';
  const categories = useGetAdminCategoriesQuery({
    isDeleted: false,
    pageNumber,
    pageSize: PAGE_SIZE,
    rootOnly,
    search: params.get('search') || undefined,
    sortBy: 'displayOrder',
    sortDirection: 'asc',
  });
  const [deleteCategory, deleteState] = useDeleteAdminCategoryMutation();

  useEffect(() => {
    if ((params.get('search') ?? '') === debouncedSearch.trim()) return;
    const next = new URLSearchParams(params);
    if (debouncedSearch.trim()) next.set('search', debouncedSearch.trim());
    else next.delete('search');
    next.delete('page');
    setParams(next, { replace: true });
  }, [debouncedSearch, params, setParams]);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await deleteCategory(deleting.id).unwrap();
      enqueueSnackbar('Category deleted successfully.', { variant: 'success' });
      setDeleting(null);
    } catch (error: unknown) {
      setDeleteError(
        isAdminApiError(error)
          ? error.message
          : 'The category could not be deleted. It may have children or referenced jobs.',
      );
    }
  };

  const actions = (category: AdminCategory) => (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      <Button component={Link} size="small" to={buildAdminCategoryDetailsPath(category.id)}>
        View
      </Button>
      <Button
        component={Link}
        size="small"
        startIcon={<EditOutlinedIcon />}
        to={buildAdminCategoryEditPath(category.id)}
      >
        Edit
      </Button>
      <Button
        color="error"
        onClick={() => {
          setDeleteError(null);
          setDeleting(category);
        }}
        size="small"
        startIcon={<DeleteOutlineIcon />}
      >
        Delete
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          <Button
            component={Link}
            startIcon={<AddOutlinedIcon />}
            to={ROUTES.ADMIN_CATEGORY_CREATE}
            variant="contained"
          >
            Add category
          </Button>
        }
        description="Manage ordered root and nested job categories."
        eyebrow="Administration"
        title="Categories"
      />
      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid alignItems="center" container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Search categories"
              onChange={(event) => setSearch(event.target.value)}
              value={search}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={rootOnly}
                  onChange={(_, checked) => setParam('rootOnly', checked ? 'true' : undefined)}
                />
              }
              label="Root categories only"
            />
          </Grid>
        </Grid>
      </Paper>
      {categories.isLoading ? <PageLoadingIndicator label="Loading categories" /> : categories.isError ? (
        <ErrorState onRetry={() => void categories.refetch()} title="Categories unavailable" />
      ) : categories.data?.items.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table aria-label="Administrator categories">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.data.items.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography fontWeight={700}>{category.name}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {category.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>{category.parentCategoryName ?? 'Root category'}</TableCell>
                    <TableCell>{category.displayOrder}</TableCell>
                    <TableCell>{actions(category)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {categories.data.items.map((category) => (
              <Card component="article" key={category.id}>
                <CardContent>
                  <Typography component="h2" variant="h3">
                    {category.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {category.parentCategoryName ?? 'Root category'} · Order {category.displayOrder}
                  </Typography>
                </CardContent>
                <CardActions>{actions(category)}</CardActions>
              </Card>
            ))}
          </Stack>
          {categories.data.totalPages > 1 ? (
            <Pagination
              aria-label="Categories pagination"
              count={categories.data.totalPages}
              onChange={(_, page) => setParam('page', String(page))}
              page={pageNumber}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          description="No category records match the current filters."
          title="No categories found"
        />
      )}
      <ConfirmActionDialog
        actionLabel="Delete category"
        description={`Delete ${deleting?.name ?? 'this category'}? The backend will refuse deletion when children or jobs still reference it.`}
        error={deleteError}
        isProcessing={deleteState.isLoading}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        open={Boolean(deleting)}
        title="Delete category"
      />
    </Stack>
  );
};
