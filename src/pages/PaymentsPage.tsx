import {
  Alert,
  Box,
  Button,
  Divider,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { MembershipStatus } from '@/features/dashboard/types/dashboardModels';
import {
  useGetPaymentHistoryQuery,
  useGetPaymentsQuery,
  useGetPaymentStatusQuery,
} from '@/features/payments/api/paymentsApi';
import { PaymentHistoryTable } from '@/features/payments/components/PaymentHistoryTable';
import { PaymentStatusBadge } from '@/features/payments/components/PaymentStatusBadge';
import {
  formatPaymentDate,
  getPaymentStatusLabel,
} from '@/features/payments/utils/paymentFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;

export const PaymentsPage = () => {
  useDocumentMetadata(
    'Membership and payments | Career Portal',
    'Review your backend membership status, payments, and payment history.',
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [historyPageNumber, setHistoryPageNumber] = useState(1);
  const navigate = useNavigate();
  const payments = useGetPaymentsQuery({ pageNumber, pageSize: PAGE_SIZE });
  const history = useGetPaymentHistoryQuery({
    pageNumber: historyPageNumber,
    pageSize: PAGE_SIZE,
  });
  const status = useGetPaymentStatusQuery();

  if (payments.isLoading || history.isLoading || status.isLoading) {
    return (
      <Stack aria-busy="true" aria-label="Loading membership and payment history" role="status" spacing={3}>
        <Skeleton height={80} variant="rounded" />
        <Skeleton height={180} variant="rounded" />
        <Skeleton height={360} variant="rounded" />
      </Stack>
    );
  }

  if (payments.isError || status.isError || !status.data) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => {
          void payments.refetch();
          void status.refetch();
        }}
        title="Payments unavailable"
      />
    );
  }

  const membership = status.data.membership;

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        actions={
          <Button component={Link} to={ROUTES.MEMBERSHIP} variant="contained">
            Manage membership
          </Button>
        }
        description="Membership and payment state reported by the backend."
        eyebrow="Candidate account"
        title="Membership and payments"
      />

      <Paper component="section" sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography component="h2" variant="h3">
            Current membership
          </Typography>
          {membership ? (
            <>
              <Typography fontWeight={800}>{membership.planName}</Typography>
              <Typography color="text.secondary">
                Status: {membership.status === MembershipStatus.Active ? 'Active' : 'Inactive'}
              </Typography>
              {membership.endsAtUtc ? (
                <Typography color="text.secondary">
                  Expires {formatPaymentDate(membership.endsAtUtc) ?? 'date unavailable'}
                </Typography>
              ) : null}
            </>
          ) : (
            <Typography color="text.secondary">No membership has been created yet.</Typography>
          )}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Typography component="h2" variant="h2">
          Payment transactions
        </Typography>
        {payments.data?.items.length ? (
          <Paper component="section" sx={{ overflow: 'hidden' }}>
            <PaymentHistoryTable payments={payments.data.items} planName={membership?.planName} />
            {payments.data.totalPages > 1 ? (
              <Box
                display="flex"
                justifyContent="center"
                sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}
              >
                <Pagination
                  aria-label="Payment transactions pagination"
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
            actionLabel="View membership"
            description="No payment transactions have been recorded for this account."
            onAction={() => void navigate(ROUTES.MEMBERSHIP)}
            title="No payments yet"
          />
        )}
      </Stack>

      <Stack spacing={2}>
        <Typography component="h2" variant="h2">
          Payment status history
        </Typography>
        {history.isError ? (
          <Alert
            action={
              <Button color="inherit" onClick={() => void history.refetch()} size="small">
                Retry
              </Button>
            }
            severity="warning"
          >
            Payment status history is temporarily unavailable.
          </Alert>
        ) : null}
        {history.data?.items.length ? (
          <Paper component="section" sx={{ p: 3 }}>
            <Stack divider={<Divider flexItem />} spacing={2}>
              {history.data.items.map((event) => (
                <Stack
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  key={event.id}
                  spacing={1}
                >
                  <Box>
                    <Typography fontWeight={700}>
                      {getPaymentStatusLabel(event.currentStatus)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {formatPaymentDate(event.occurredAtUtc) ?? 'Date unavailable'}
                    </Typography>
                  </Box>
                  <PaymentStatusBadge status={event.currentStatus} />
                </Stack>
              ))}
            </Stack>
            {history.data.totalPages > 1 ? (
              <Box display="flex" justifyContent="center" sx={{ pt: 3 }}>
                <Pagination
                  aria-label="Payment status history pagination"
                  count={history.data.totalPages}
                  onChange={(_, page) => setHistoryPageNumber(page)}
                  page={historyPageNumber}
                />
              </Box>
            ) : null}
          </Paper>
        ) : !history.isError ? (
          <Typography color="text.secondary">No payment status events recorded.</Typography>
        ) : null}
      </Stack>
    </Stack>
  );
};
