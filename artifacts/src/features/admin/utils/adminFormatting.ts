import dayjs from 'dayjs';

import { JobStatus, UserStatus } from '../types/adminModels';

const jobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.Draft]: 'Draft',
  [JobStatus.Published]: 'Published',
  [JobStatus.Paused]: 'Paused',
  [JobStatus.Closed]: 'Closed',
  [JobStatus.Expired]: 'Expired',
  [JobStatus.Archived]: 'Archived',
};

const userStatusLabels: Record<UserStatus, string> = {
  [UserStatus.Pending]: 'Pending',
  [UserStatus.Active]: 'Active',
  [UserStatus.Suspended]: 'Suspended',
  [UserStatus.Inactive]: 'Inactive',
};

export const getAdminJobStatusLabel = (status: JobStatus): string =>
  jobStatusLabels[status] ?? 'Unknown';

export const getAdminUserStatusLabel = (status: UserStatus): string =>
  userStatusLabels[status] ?? 'Unknown';

export const formatAdminDate = (value: string | null): string => {
  if (!value) return '—';
  const date = dayjs(value);
  return date.isValid() ? date.format('D MMM YYYY, h:mm A') : 'Unavailable';
};

export const toDateTimeLocalValue = (value: string | null): string => {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DDTHH:mm') : '';
};
