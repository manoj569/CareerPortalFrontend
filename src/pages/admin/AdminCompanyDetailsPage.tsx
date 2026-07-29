import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES, buildAdminCompanyEditPath } from '@/constants/routes';
import {
  isAdminApiError,
  useDeleteAdminCompanyMutation,
  useGetAdminCompanyQuery,
} from '@/features/admin/api/adminApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const AdminCompanyDetailsPage = () => {
  const { companyId = '' } = useParams<{ companyId: string }>();
  useDocumentMetadata('Company details | Career Portal', 'Review an Administrator company record.');
  const navigate = useNavigate();
  const company = useGetAdminCompanyQuery(companyId, { skip: !isGuid(companyId) });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteCompany, deleteState] = useDeleteAdminCompanyMutation();

  if (!isGuid(companyId) || company.isError || (!company.isLoading && !company.data)) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void company.refetch()}
        title="Company unavailable"
      />
    );
  }
  if (company.isLoading || !company.data) {
    return <Typography aria-live="polite">Loading company…</Typography>;
  }

  const remove = async () => {
    setDeleteError(null);
    try {
      await deleteCompany(companyId).unwrap();
      enqueueSnackbar('Company deleted successfully.', { variant: 'success' });
      await navigate(ROUTES.ADMIN_COMPANIES, { replace: true });
    } catch (error: unknown) {
      setDeleteError(isAdminApiError(error) ? error.message : 'The company could not be deleted.');
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          company.data.isDeleted ? null : (
            <Stack direction="row" gap={1}>
              <Button
                component={Link}
                startIcon={<EditOutlinedIcon />}
                to={buildAdminCompanyEditPath(companyId)}
                variant="outlined"
              >
                Edit
              </Button>
              <Button
                color="error"
                onClick={() => setConfirmDelete(true)}
                startIcon={<DeleteOutlineIcon />}
              >
                Delete
              </Button>
            </Stack>
          )
        }
        description={company.data.slug}
        eyebrow="Companies"
        title={company.data.name}
      />
      <Paper component="section" sx={{ p: 3 }}>
        <Stack divider={<Divider flexItem />} spacing={2}>
          <Typography>{company.data.description ?? 'No description provided.'}</Typography>
          <Typography>
            <strong>Industry:</strong> {company.data.industry ?? 'Not set'}
          </Typography>
          <Typography>
            <strong>Location:</strong> {company.data.location ?? 'Not set'}
          </Typography>
          <Typography>
            <strong>Employees:</strong> {company.data.employeeCount ?? 'Not set'}
          </Typography>
          <Stack direction="row" gap={1}>
            <Chip
              color={company.data.isVerified ? 'success' : 'default'}
              label={company.data.isVerified ? 'Verified' : 'Not verified'}
            />
            {company.data.isDeleted ? <Chip color="error" label="Deleted" /> : null}
          </Stack>
          <Typography color="text.secondary">
            Created {formatAdminDate(company.data.createdAtUtc)} · Updated{' '}
            {formatAdminDate(company.data.updatedAtUtc)}
          </Typography>
        </Stack>
      </Paper>
      <ConfirmActionDialog
        actionLabel="Delete company"
        description="Delete this company? Referenced companies cannot be deleted."
        error={deleteError}
        isProcessing={deleteState.isLoading}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
        open={confirmDelete}
        title="Delete company"
      />
    </Stack>
  );
};
