import { Skeleton, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAdminJobEditPath } from '@/constants/routes';
import {
  isAdminApiError,
  useCreateAdminJobMutation,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCompanyOptionsQuery,
} from '@/features/admin/api/adminApi';
import { AdminJobForm } from '@/features/admin/components/AdminJobForm';
import { AdminUnavailableState } from '@/features/admin/components/AdminUnavailableState';
import type { AdminJobRequest } from '@/features/admin/types/adminModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminCreateJobPage = () => {
  useDocumentMetadata(
    'Create job | Career Portal',
    'Create a backend-validated Career Portal job draft.',
  );
  const navigate = useNavigate();
  const companies = useGetAdminCompanyOptionsQuery();
  const categories = useGetAdminCategoryOptionsQuery();
  const [createJob, createState] = useCreateAdminJobMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string[]> | undefined
  >();

  const submitJob = async (request: AdminJobRequest) => {
    if (createState.isLoading) return;
    setServerError(null);
    setServerFieldErrors(undefined);
    try {
      const created = await createJob(request).unwrap();
      enqueueSnackbar('Job draft created successfully.', { variant: 'success' });
      await navigate(buildAdminJobEditPath(created.id), { replace: true });
    } catch (error: unknown) {
      setServerFieldErrors(isAdminApiError(error) ? error.errors : undefined);
      setServerError(
        isAdminApiError(error)
          ? error.message
          : 'The job could not be created. Please review the form and try again.',
      );
    }
  };

  if (companies.isLoading || categories.isLoading) {
    return (
      <Stack aria-label="Loading job form" role="status" spacing={3}>
        <Skeleton height={80} variant="rounded" />
        <Skeleton height={900} variant="rounded" />
      </Stack>
    );
  }

  if (companies.isError || categories.isError) {
    return (
      <ErrorState
        description="Company and category choices could not be loaded from their Administrator options endpoints."
        headingLevel="h1"
        onRetry={() => {
          void companies.refetch();
          void categories.refetch();
        }}
        title="Job form unavailable"
      />
    );
  }

  if (!companies.data?.length || !categories.data?.length) {
    return (
      <AdminUnavailableState
        description="A job requires both a company and a category, but the backend did not return any configured options. Add those records through a supported backend workflow before creating a job."
        title="Job creation is currently unavailable"
      />
    );
  }

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Create a backend-validated draft. Publish it separately after review."
        eyebrow="Jobs"
        title="Create job"
      />
      <AdminJobForm
        categories={categories.data ?? []}
        companies={companies.data ?? []}
        isSaving={createState.isLoading}
        onCancel={() => void navigate(ROUTES.ADMIN_JOBS)}
        onSubmit={submitJob}
        serverFieldErrors={serverFieldErrors}
        serverError={serverError}
        submitLabel="Create draft"
      />
    </Stack>
  );
};
