import { Chip, type ChipProps } from '@mui/material';

import { JobApplicationStatus } from '../types/dashboardModels';
import { getApplicationStatusLabel } from '../utils/dashboardFormatting';

const statusColors: Record<JobApplicationStatus, ChipProps['color']> = {
  [JobApplicationStatus.Submitted]: 'info',
  [JobApplicationStatus.Reviewed]: 'primary',
  [JobApplicationStatus.Shortlisted]: 'success',
  [JobApplicationStatus.Rejected]: 'error',
  [JobApplicationStatus.Withdrawn]: 'default',
};

export const ApplicationStatusChip = ({ status }: { status: JobApplicationStatus }) => (
  <Chip
    color={statusColors[status] ?? 'default'}
    label={getApplicationStatusLabel(status)}
    size="small"
  />
);
