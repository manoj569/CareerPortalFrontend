import { Skeleton, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAdminCompanyDetailsPath } from '@/constants/routes';
import {
  isAdminApiError,
  useCreateAdminCompanyMutation,
  useGetAdminCompanyQuery,
  useUpdateAdminCompanyMutation,
} from '@/features/admin/api/adminApi';
import { AdminCompanyForm } from '@/features/admin/components/AdminManagementForms';
import type { AdminCompanyRequest } from '@/features/admin/types/adminModels';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminCompanyFormPage = () => {
  const { companyId } = useParams<{ companyId?: string }>();
  const editing = Boolean(companyId);
  const validId = !editing || isGuid(companyId ?? null);
  useDocumentMetadata(
    `${editing ? 'Edit' : 'Create'} company | Career Portal`,
    'Manage an Administrator company record.',
  );
  const navigate = useNavigate();
  const company = useGetAdminCompanyQuery(companyId ?? '', { skip: !editing || !validId });
  const [createCompany, createState] = useCreateAdminCompanyMutation();
  const [updateCompany, updateState] = useUpdateAdminCompanyMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  if (!validId) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void navigate(ROUTES.ADMIN_COMPANIES)}
        title="Invalid company"
      />
    );
  }
  if (editing && company.isLoading) {
    return (
      <Skeleton aria-label="Loading company form" height={700} role="status" variant="rounded" />
    );
  }
  if (editing && (company.isError || !company.data)) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void company.refetch()}
        title="Company unavailable"
      />
    );
  }

  const submit = async (request: AdminCompanyRequest) => {
    setServerError(null);
    setFieldErrors(undefined);
    try {
      const result =
        editing && companyId
          ? await updateCompany({ companyId, request }).unwrap()
          : await createCompany(request).unwrap();
      enqueueSnackbar(`Company ${editing ? 'updated' : 'created'} successfully.`, {
        variant: 'success',
      });
      await navigate(buildAdminCompanyDetailsPath(result.id), { replace: true });
    } catch (error: unknown) {
      setServerError(isAdminApiError(error) ? error.message : 'The company could not be saved.');
      setFieldErrors(isAdminApiError(error) ? error.errors : undefined);
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Fields are validated in the browser and remain subject to backend validation."
        eyebrow="Companies"
        title={editing ? `Edit ${company.data?.name ?? 'company'}` : 'Create company'}
      />
      <AdminCompanyForm
        initialCompany={company.data}
        isSaving={createState.isLoading || updateState.isLoading}
        onCancel={() => void navigate(ROUTES.ADMIN_COMPANIES)}
        onSubmit={submit}
        serverError={serverError}
        serverFieldErrors={fieldErrors}
        submitLabel={editing ? 'Save company' : 'Create company'}
      />
    </Stack>
  );
};
