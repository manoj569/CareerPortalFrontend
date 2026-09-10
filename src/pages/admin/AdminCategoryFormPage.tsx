import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAdminCategoryDetailsPath } from '@/constants/routes';
import {
  isAdminApiError,
  useCreateAdminCategoryMutation,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCategoryQuery,
  useUpdateAdminCategoryMutation,
} from '@/features/admin/api/adminApi';
import { AdminCategoryForm } from '@/features/admin/components/AdminManagementForms';
import type { AdminCategoryRequest } from '@/features/admin/types/adminModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminCategoryFormPage = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const editing = Boolean(categoryId);
  const validId = !editing || isGuid(categoryId ?? null);
  useDocumentMetadata(
    `${editing ? 'Edit' : 'Create'} category | Career Portal`,
    'Manage an Administrator category record.',
  );
  const navigate = useNavigate();
  const category = useGetAdminCategoryQuery(categoryId ?? '', { skip: !editing || !validId });
  const options = useGetAdminCategoryOptionsQuery();
  const [createCategory, createState] = useCreateAdminCategoryMutation();
  const [updateCategory, updateState] = useUpdateAdminCategoryMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  if (!validId) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void navigate(ROUTES.ADMIN_CATEGORIES)}
        title="Invalid category"
      />
    );
  }
  if (options.isLoading || (editing && category.isLoading)) {
    return <PageLoadingIndicator label="Loading category form" />;
  }
  if (options.isError || (editing && (category.isError || !category.data))) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => {
          void options.refetch();
          if (editing) void category.refetch();
        }}
        title="Category form unavailable"
      />
    );
  }

  const submit = async (request: AdminCategoryRequest) => {
    setServerError(null);
    setFieldErrors(undefined);
    try {
      const result =
        editing && categoryId
          ? await updateCategory({ categoryId, request }).unwrap()
          : await createCategory(request).unwrap();
      enqueueSnackbar(`Category ${editing ? 'updated' : 'created'} successfully.`, {
        variant: 'success',
      });
      await navigate(buildAdminCategoryDetailsPath(result.id), { replace: true });
    } catch (error: unknown) {
      setServerError(isAdminApiError(error) ? error.message : 'The category could not be saved.');
      setFieldErrors(isAdminApiError(error) ? error.errors : undefined);
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Create root categories or assign an existing parent."
        eyebrow="Categories"
        title={editing ? `Edit ${category.data?.name ?? 'category'}` : 'Create category'}
      />
      <AdminCategoryForm
        categoryOptions={options.data ?? []}
        initialCategory={category.data}
        isSaving={createState.isLoading || updateState.isLoading}
        onCancel={() => void navigate(ROUTES.ADMIN_CATEGORIES)}
        onSubmit={submit}
        serverError={serverError}
        serverFieldErrors={fieldErrors}
        submitLabel={editing ? 'Save category' : 'Create category'}
      />
    </Stack>
  );
};
