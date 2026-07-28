import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { Membership } from '@/features/dashboard/types/dashboardModels';
import type { Payment } from '../types/paymentModels';
import {
  formatPaymentAmount,
  formatPaymentDate,
  getPaymentProviderLabel,
} from '../utils/paymentFormatting';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentHistoryTableProps {
  memberships: Membership[];
  payments: Payment[];
}

const paymentPlan = (payment: Payment, memberships: Membership[]): string =>
  memberships.find((membership) => membership.id === payment.membershipId)?.planName ??
  'Application access';

export const PaymentHistoryTable = ({ memberships, payments }: PaymentHistoryTableProps) => (
  <>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
      <Table aria-label="Payment history">
        <caption className="sr-only">
          Payment history including reference, plan, amount, status, provider, and dates
        </caption>
        <TableHead>
          <TableRow>
            <TableCell>Reference</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Paid</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell sx={{ maxWidth: 180, overflowWrap: 'anywhere' }}>
                <Typography fontFamily="monospace" variant="body2">
                  {payment.id}
                </Typography>
              </TableCell>
              <TableCell>{paymentPlan(payment, memberships)}</TableCell>
              <TableCell>{formatPaymentAmount(payment.amount, payment.currencyCode)}</TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell>{getPaymentProviderLabel(payment.provider)}</TableCell>
              <TableCell>{formatPaymentDate(payment.createdAtUtc) ?? 'Unavailable'}</TableCell>
              <TableCell>{formatPaymentDate(payment.paidAtUtc) ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
      {payments.map((payment) => (
        <Card component="article" key={payment.id}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography fontWeight={700}>{paymentPlan(payment, memberships)}</Typography>
                <PaymentStatusBadge status={payment.status} />
              </Stack>
              <Typography variant="h3">
                {formatPaymentAmount(payment.amount, payment.currencyCode)}
              </Typography>
              <Box>
                <Typography color="text.secondary" variant="caption">
                  Payment reference
                </Typography>
                <Typography sx={{ overflowWrap: 'anywhere' }} variant="body2">
                  {payment.id}
                </Typography>
              </Box>
              <Typography color="text.secondary" variant="body2">
                {getPaymentProviderLabel(payment.provider)} · Created{' '}
                {formatPaymentDate(payment.createdAtUtc) ?? 'date unavailable'}
              </Typography>
              {payment.paidAtUtc ? (
                <Typography color="text.secondary" variant="body2">
                  Paid {formatPaymentDate(payment.paidAtUtc)}
                </Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </>
);
