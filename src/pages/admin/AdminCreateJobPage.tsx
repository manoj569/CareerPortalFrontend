import { Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES, buildAdminJobEditPath } from '@/constants/routes';
import { isAdminApiError, useComposeAdminJobMutation } from '@/features/admin/api/adminApi';
import { AdminComposeJobForm } from '@/features/admin/components/AdminComposeJobForm';
import type { ComposeJobRequest } from '@/features/admin/types/adminModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminCreateJobPage = () => {
  useDocumentMetadata(
    'Create job | Career Portal',
    'Create a backend-validated Career Portal job draft.',
  );
  const navigate = useNavigate();
  const [composeJob, createState] = useComposeAdminJobMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string[]> | undefined
  >();

  const submitJob = async (request: ComposeJobRequest) => {
    if (createState.isLoading) return;
    setServerError(null);
    setServerFieldErrors(undefined);
    try {
      const created = await composeJob(request).unwrap();
      enqueueSnackbar('Job draft composed successfully.', { variant: 'success' });
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

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Create a backend-validated draft. Publish it separately after review."
        eyebrow="Jobs"
        title="Create job"
      />
      <AdminComposeJobForm
        isSaving={createState.isLoading}
        onCancel={() => void navigate(ROUTES.ADMIN_JOBS)}
        onSubmit={submitJob}
        serverFieldErrors={serverFieldErrors}
        serverError={serverError}
      />
    </Stack>
  );
};
