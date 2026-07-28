import { Alert, Box, Pagination, Paper, Skeleton, Stack } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useGetPaymentsQuery } from '@/features/payments/api/paymentsApi';
import { PaymentHistoryTable } from '@/features/payments/components/PaymentHistoryTable';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

export const PaymentsPage = () => {
  useDocumentMetadata(
    'Payment history | Career Portal',
    'Review your server-recorded Career Portal payments.',
  );
  const [pageNumber, setPageNumber] = useState(1);
  const navigate = useNavigate();
  const payments = useGetPaymentsQuery({ pageNumber, pageSize: PAGE_SIZE });
  const memberships = useGetMembershipsQuery();

  if (payments.isLoading || memberships.isLoading) {
    return (
      <Stack aria-label="Loading payment history" role="status" spacing={3}>
        <Skeleton height={80} variant="rounded" />
        <Skeleton height={360} variant="rounded" />
      </Stack>
    );
  }

  if (payments.isError) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void payments.refetch()}
        title="Payments unavailable"
      />
    );
  }

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Payments recorded by the backend for your account."
        eyebrow="Account"
        title="Payment history"
      />

      {memberships.isError ? (
        <Alert severity="warning">
          Plan names are temporarily unavailable. Payment records remain unchanged.
        </Alert>
      ) : null}

      {payments.data?.items.length ? (
        <Paper component="section" sx={{ overflow: 'hidden' }}>
          <PaymentHistoryTable
            memberships={memberships.data ?? []}
            payments={payments.data.items}
          />
          {payments.data.totalPages > 1 ? (
            <Box
              display="flex"
              justifyContent="center"
              sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}
            >
              <Pagination
                aria-label="Payment history pagination"
                boundaryCount={1}
                count={payments.data.totalPages}
                onChange={(_, page) => setPageNumber(page)}
                page={pageNumber}
                showFirstButton
                showLastButton
                siblingCount={0}
              />
            </Box>
          ) : null}
        </Paper>
      ) : (
        <EmptyState
          actionLabel="Browse jobs"
          description="No payment transactions have been recorded for this account."
          onAction={() => void navigate(ROUTES.JOBS)}
          title="No payments yet"
        />
      )}

      <Alert severity="info">
        The current backend does not provide downloadable receipts or a payment updated timestamp.
      </Alert>
    </Stack>
  );
};
