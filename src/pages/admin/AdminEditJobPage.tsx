import { Skeleton, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import {
  isAdminApiError,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCompanyOptionsQuery,
  useGetAdminJobQuery,
  useUpdateAdminJobMutation,
} from '@/features/admin/api/adminApi';
import { AdminJobForm } from '@/features/admin/components/AdminJobForm';
import { AdminUnavailableState } from '@/features/admin/components/AdminUnavailableState';
import type { AdminJobRequest } from '@/features/admin/types/adminModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminEditJobPage = () => {
  const { jobId = '' } = useParams<{ jobId: string }>();
  useDocumentMetadata('Edit job | Career Portal', 'Update a backend-managed Career Portal job.');
  const navigate = useNavigate();
  const job = useGetAdminJobQuery(jobId, { skip: !isGuid(jobId) });
  const companiesQuery = useGetAdminCompanyOptionsQuery();
  const categoriesQuery = useGetAdminCategoryOptionsQuery();
  const [updateJob, updateState] = useUpdateAdminJobMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string[]> | undefined
  >();

  const submitJob = async (request: AdminJobRequest) => {
    if (!isGuid(jobId) || updateState.isLoading) return;
    setServerError(null);
    setServerFieldErrors(undefined);
    try {
      await updateJob({ jobId, request }).unwrap();
      enqueueSnackbar('Job updated successfully.', { variant: 'success' });
    } catch (error: unknown) {
      setServerFieldErrors(isAdminApiError(error) ? error.errors : undefined);
      setServerError(
        isAdminApiError(error)
          ? error.message
          : 'The job could not be updated. Please review the form and try again.',
      );
    }
  };

  if (!isGuid(jobId)) {
    return (
      <ErrorState
        description="The job identifier in this URL is invalid."
        headingLevel="h1"
        onRetry={() => void navigate(ROUTES.ADMIN_JOBS)}
        title="Invalid job"
      />
    );
  }

  if (job.isLoading || companiesQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <Stack aria-label="Loading job editor" role="status" spacing={3}>
        <Skeleton height={80} variant="rounded" />
        <Skeleton height={900} variant="rounded" />
      </Stack>
    );
  }

  if (job.isError || !job.data) {
    return (
      <ErrorState
        description={
          isAdminApiError(job.error) && job.error.status === 404
            ? 'The requested job was not found.'
            : 'The job could not be loaded.'
        }
        headingLevel="h1"
        onRetry={() => void job.refetch()}
        title="Job unavailable"
      />
    );
  }

  if (companiesQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        description="Company and category choices could not be loaded."
        headingLevel="h1"
        onRetry={() => {
          void companiesQuery.refetch();
          void categoriesQuery.refetch();
        }}
        title="Job editor unavailable"
      />
    );
  }

  if (job.data.isDeleted) {
    return (
      <AdminUnavailableState
        description="The backend only supports updating active job records. This job was soft-deleted and no restore endpoint is available."
        title="Deleted jobs cannot be edited"
      />
    );
  }

  const companies = companiesQuery.data?.some((company) => company.id === job.data.companyId)
    ? companiesQuery.data
    : [
        ...(companiesQuery.data ?? []),
        { id: job.data.companyId, name: job.data.companyName, slug: '' },
      ];
  const categories = categoriesQuery.data?.some((category) => category.id === job.data.categoryId)
    ? categoriesQuery.data
    : [
        ...(categoriesQuery.data ?? []),
        { id: job.data.categoryId, name: job.data.categoryName, slug: '' },
      ];

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description={`${job.data.referenceNumber} · ${job.data.companyName}`}
        eyebrow="Jobs"
        title={`Edit ${job.data.title}`}
      />
      <AdminJobForm
        categories={categories}
        companies={companies}
        initialJob={job.data}
        isSaving={updateState.isLoading}
        onCancel={() => void navigate(ROUTES.ADMIN_JOBS)}
        onSubmit={submitJob}
        serverFieldErrors={serverFieldErrors}
        serverError={serverError}
        submitLabel="Save changes"
      />
    </Stack>
  );
};
