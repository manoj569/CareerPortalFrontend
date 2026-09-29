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

import type { ReactNode } from 'react';
import type { Payment } from '../types/paymentModels';
import { membershipPlanName } from '../utils/entitlement';
import {
  formatPaymentAmount,
  formatPaymentDate,
  getPaymentProviderLabel,
} from '../utils/paymentFormatting';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentHistoryTableProps {
  planName?: string;
  payments: Payment[];
  compact?: boolean;
  renderAction?: (payment: Payment) => ReactNode;
}

export const PaymentHistoryTable = ({
  payments,
  planName,
  compact = false,
  renderAction,
}: PaymentHistoryTableProps) => (
  <>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
      <Table
        aria-label="Payment history"
        sx={
          compact
            ? {
                '& th': { bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 },
                '& td, & th': { py: 1.5, px: 2 },
                '& td': { overflowWrap: 'anywhere' },
                '& tr:last-child td': { borderBottom: 0 },
              }
            : undefined
        }
      >
        <caption className="sr-only">
          Payment history including reference, plan, amount, status, provider, and dates
        </caption>
        <TableHead>
          <TableRow>
            {!compact ? <TableCell>Reference</TableCell> : null}
            <TableCell>Plan</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Created</TableCell>
            {!compact ? <TableCell>Paid</TableCell> : null}
            {renderAction ? <TableCell>Action</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              {!compact ? (
                <TableCell sx={{ maxWidth: 180, overflowWrap: 'anywhere' }}>
                  <Typography fontFamily="monospace" variant="body2">
                    {payment.id}
                  </Typography>
                </TableCell>
              ) : null}
              <TableCell>
                {membershipPlanName({ ...payment, planName: payment.planName ?? planName })}
              </TableCell>
              <TableCell>{formatPaymentAmount(payment.amount, payment.currencyCode)}</TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell>{getPaymentProviderLabel(payment.provider)}</TableCell>
              <TableCell>{formatPaymentDate(payment.createdAtUtc) ?? 'Unavailable'}</TableCell>
              {!compact ? (
                <TableCell>{formatPaymentDate(payment.paidAtUtc) ?? '—'}</TableCell>
              ) : null}
              {renderAction ? <TableCell>{renderAction(payment)}</TableCell> : null}
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
                <Typography fontWeight={700}>
                  {membershipPlanName({ ...payment, planName: payment.planName ?? planName })}
                </Typography>
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
              {renderAction?.(payment)}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </>
);
