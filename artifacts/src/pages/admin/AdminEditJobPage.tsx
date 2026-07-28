import { Alert, Skeleton, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import {
  isAdminApiError,
  useGetAdminChartsQuery,
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
  const lookups = useGetAdminChartsQuery({ distributionLimit: 50 });
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

  if (job.isLoading || lookups.isLoading) {
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

  if (lookups.isError) {
    return (
      <ErrorState
        description="Company and category choices could not be loaded."
        headingLevel="h1"
        onRetry={() => void lookups.refetch()}
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

  const companies = lookups.data?.companies.some((company) => company.id === job.data.companyId)
    ? lookups.data.companies
    : [
        ...(lookups.data?.companies ?? []),
        { id: job.data.companyId, label: job.data.companyName, value: 0 },
      ];
  const categories = lookups.data?.categories.some(
    (category) => category.id === job.data.categoryId,
  )
    ? lookups.data.categories
    : [
        ...(lookups.data?.categories ?? []),
        { id: job.data.categoryId, label: job.data.categoryName, value: 0 },
      ];

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description={`${job.data.referenceNumber} · ${job.data.companyName}`}
        eyebrow="Jobs"
        title={`Edit ${job.data.title}`}
      />
      <Alert severity="warning">
        The administrator job response omits the existing private application URL, while the update
        DTO requires it. Re-enter the correct application URL before saving any edit.
      </Alert>
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
