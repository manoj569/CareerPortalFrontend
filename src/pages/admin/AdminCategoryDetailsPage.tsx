import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAdminCategoryEditPath } from '@/constants/routes';
import {
  isAdminApiError,
  useDeleteAdminCategoryMutation,
  useGetAdminCategoryQuery,
} from '@/features/admin/api/adminApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminCategoryDetailsPage = () => {
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  useDocumentMetadata('Category details | Career Portal', 'Review an Administrator category.');
  const navigate = useNavigate();
  const category = useGetAdminCategoryQuery(categoryId, { skip: !isGuid(categoryId) });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteCategory, deleteState] = useDeleteAdminCategoryMutation();

  if (!isGuid(categoryId) || category.isError || (!category.isLoading && !category.data)) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void navigate(ROUTES.ADMIN_CATEGORIES)}
        title="Category unavailable"
      />
    );
  }
  if (category.isLoading || !category.data) {
    return <Typography aria-live="polite">Loading category…</Typography>;
  }

  const remove = async () => {
    try {
      await deleteCategory(categoryId).unwrap();
      enqueueSnackbar('Category deleted successfully.', { variant: 'success' });
      await navigate(ROUTES.ADMIN_CATEGORIES, { replace: true });
    } catch (error: unknown) {
      setDeleteError(isAdminApiError(error) ? error.message : 'The category could not be deleted.');
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          <Stack direction="row" gap={1}>
            <Button
              component={Link}
              startIcon={<EditOutlinedIcon />}
              to={buildAdminCategoryEditPath(categoryId)}
              variant="outlined"
            >
              Edit
            </Button>
            <Button
              color="error"
              onClick={() => setDialogOpen(true)}
              startIcon={<DeleteOutlineIcon />}
            >
              Delete
            </Button>
          </Stack>
        }
        description={category.data.slug}
        eyebrow="Categories"
        title={category.data.name}
      />
      <Paper component="section" sx={{ p: 3 }}>
        <Stack divider={<Divider flexItem />} spacing={2}>
          <Typography>{category.data.description ?? 'No description provided.'}</Typography>
          <Typography>
            <strong>Parent:</strong> {category.data.parentCategoryName ?? 'Root category'}
          </Typography>
          <Typography>
            <strong>Display order:</strong> {category.data.displayOrder}
          </Typography>
          <Typography color="text.secondary">
            Created {formatAdminDate(category.data.createdAtUtc)} · Updated{' '}
            {formatAdminDate(category.data.updatedAtUtc)}
          </Typography>
        </Stack>
      </Paper>
      <ConfirmActionDialog
        actionLabel="Delete category"
        description="Delete this category? Categories referenced by children or jobs cannot be deleted."
        error={deleteError}
        isProcessing={deleteState.isLoading}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => void remove()}
        open={dialogOpen}
        title="Delete category"
      />
    </Stack>
  );
};
