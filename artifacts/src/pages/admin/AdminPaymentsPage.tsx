import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildAdminPaymentDetailsPath } from '@/constants/routes';
import {
  useGetAdminRecentPaymentsQuery,
  useGetAdminStatisticsQuery,
} from '@/features/admin/api/adminApi';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { PaymentStatusBadge } from '@/features/payments/components/PaymentStatusBadge';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import {
  formatPaymentAmount,
  getPaymentProviderLabel,
  getPaymentStatusLabel,
} from '@/features/payments/utils/paymentFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const isPaymentStatus = (value: number): value is PaymentStatus =>
  Object.values(PaymentStatus).includes(value);

export const AdminPaymentsPage = () => {
  useDocumentMetadata(
    'Recent payments | Career Portal',
    'Review the safe recent payment data available to administrators.',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const payments = useGetAdminRecentPaymentsQuery(100);
  const statistics = useGetAdminStatisticsQuery();
  const search = searchParams.get('search') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const statusValue = Number(searchParams.get('status'));
  const status = isPaymentStatus(statusValue) ? statusValue : undefined;

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    return (payments.data ?? []).filter((payment) => {
      const created = new Date(payment.createdAtUtc);
      const matchesSearch =
        !normalizedSearch ||
        payment.id.toLowerCase().includes(normalizedSearch) ||
        payment.userId.toLowerCase().includes(normalizedSearch) ||
        payment.userName.toLowerCase().includes(normalizedSearch) ||
        payment.userEmail.toLowerCase().includes(normalizedSearch) ||
        payment.providerPaymentId?.toLowerCase().includes(normalizedSearch);
      return (
        matchesSearch &&
        (!status || payment.status === status) &&
        (!fromDate || created >= fromDate) &&
        (!toDate || created <= toDate)
      );
    });
  }, [from, payments.data, search, status, to]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Safe read-only payment reporting from the administrator dashboard endpoint."
        eyebrow="Administration"
        title="Payments"
      />
      <Alert severity="warning">
        The backend exposes only the 100 most recent payment summaries—without pagination,
        membership plan, history, detail, reconciliation, refund, or receipt endpoints. Filters
        below apply only to those displayed records.
      </Alert>

      {statistics.data?.revenue.length ? (
        <Grid container spacing={2}>
          {statistics.data.revenue.map((revenue) => (
            <Grid key={revenue.currencyCode} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Paper component="section" sx={{ p: 2.5 }}>
                <Typography color="text.secondary" variant="body2">
                  Verified revenue · {revenue.currencyCode}
                </Typography>
                <Typography fontWeight={800} variant="h2">
                  {formatPaymentAmount(revenue.total, revenue.currencyCode)}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatPaymentAmount(revenue.thisMonth, revenue.currencyCode)} this month
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : statistics.isError ? (
        <Alert severity="info">Verified revenue totals are temporarily unavailable.</Alert>
      ) : null}

      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              label="Filter displayed payments"
              onChange={(event) => setFilter('search', event.target.value)}
              placeholder="Payment, user, email, or provider reference"
              value={search}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-payment-status-label">Status</InputLabel>
              <Select
                label="Status"
                labelId="admin-payment-status-label"
                onChange={(event) => setFilter('status', String(event.target.value))}
                value={status ?? ''}
              >
                <MenuItem value="">All displayed statuses</MenuItem>
                {Object.values(PaymentStatus)
                  .filter((value): value is PaymentStatus => typeof value === 'number')
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {getPaymentStatusLabel(value)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Created from"
              onChange={(event) => setFilter('from', event.target.value)}
              type="date"
              value={from}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Created to"
              onChange={(event) => setFilter('to', event.target.value)}
              type="date"
              value={to}
            />
          </Grid>
        </Grid>
      </Paper>

      {payments.isLoading ? (
        <Stack aria-label="Loading recent admin payments" role="status" spacing={2}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton height={76} key={index} variant="rounded" />
          ))}
        </Stack>
      ) : payments.isError ? (
        <ErrorState onRetry={() => void payments.refetch()} title="Recent payments unavailable" />
      ) : filteredPayments.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Table aria-label="Recent administrator payment report">
              <caption className="sr-only">
                Recent payments including reference, user, amount, status, provider, dates, and
                details
              </caption>
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Created / verified</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell sx={{ maxWidth: 180, overflowWrap: 'anywhere' }}>
                      {payment.id}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{payment.userName}</Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ overflowWrap: 'anywhere' }}
                        variant="body2"
                      >
                        {payment.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatPaymentAmount(payment.amount, payment.currencyCode)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{getPaymentProviderLabel(payment.provider)}</TableCell>
                    <TableCell>
                      {formatAdminDate(payment.createdAtUtc)}
                      <Typography color="text.secondary" variant="body2">
                        Verified {formatAdminDate(payment.paidAtUtc)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        size="small"
                        to={buildAdminPaymentDetailsPath(payment.id)}
                      >
                        View summary
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ display: { xs: 'flex', lg: 'none' } }}>
            {filteredPayments.map((payment) => (
              <Card component="article" key={payment.id}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography fontWeight={800} variant="h3">
                        {formatPaymentAmount(payment.amount, payment.currencyCode)}
                      </Typography>
                      <PaymentStatusBadge status={payment.status} />
                    </Stack>
                    <Typography fontWeight={700}>{payment.userName}</Typography>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Payment reference
                      </Typography>
                      <Typography sx={{ overflowWrap: 'anywhere' }} variant="body2">
                        {payment.id}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" variant="body2">
                      {getPaymentProviderLabel(payment.provider)} ·{' '}
                      {formatAdminDate(payment.createdAtUtc)}
                    </Typography>
                    <Button
                      component={Link}
                      sx={{ alignSelf: 'flex-start' }}
                      to={buildAdminPaymentDetailsPath(payment.id)}
                    >
                      View summary
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      ) : (
        <EmptyState
          actionLabel="Clear filters"
          description="No displayed recent-payment records match these local filters."
          onAction={() => setSearchParams(new URLSearchParams())}
          title="No payments found"
        />
      )}
    </Stack>
  );
};
