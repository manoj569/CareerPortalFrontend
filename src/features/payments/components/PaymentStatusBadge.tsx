import { Chip, type ChipProps } from '@mui/material';

import { PaymentStatus } from '../types/paymentModels';
import { getPaymentStatusLabel } from '../utils/paymentFormatting';

const statusColors: Record<PaymentStatus, ChipProps['color']> = {
  [PaymentStatus.Pending]: 'warning',
  [PaymentStatus.Authorized]: 'info',
  [PaymentStatus.Paid]: 'success',
  [PaymentStatus.Failed]: 'error',
  [PaymentStatus.Refunded]: 'secondary',
  [PaymentStatus.Cancelled]: 'default',
};

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Chip
    color={statusColors[status] ?? 'default'}
    label={getPaymentStatusLabel(status)}
    size="small"
    variant="outlined"
  />
);
