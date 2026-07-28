import { Chip, type ChipProps } from '@mui/material';

import { JobStatus, UserStatus } from '../types/adminModels';
import { getAdminJobStatusLabel, getAdminUserStatusLabel } from '../utils/adminFormatting';

const jobColors: Record<JobStatus, ChipProps['color']> = {
  [JobStatus.Draft]: 'default',
  [JobStatus.Published]: 'success',
  [JobStatus.Paused]: 'warning',
  [JobStatus.Closed]: 'secondary',
  [JobStatus.Expired]: 'error',
  [JobStatus.Archived]: 'default',
};

const userColors: Record<UserStatus, ChipProps['color']> = {
  [UserStatus.Pending]: 'warning',
  [UserStatus.Active]: 'success',
  [UserStatus.Suspended]: 'error',
  [UserStatus.Inactive]: 'default',
};

export const AdminJobStatusBadge = ({ status }: { status: JobStatus }) => (
  <Chip
    color={jobColors[status] ?? 'default'}
    label={getAdminJobStatusLabel(status)}
    size="small"
    variant="outlined"
  />
);

export const AdminUserStatusBadge = ({ status }: { status: UserStatus }) => (
  <Chip
    color={userColors[status] ?? 'default'}
    label={getAdminUserStatusLabel(status)}
    size="small"
    variant="outlined"
  />
);
