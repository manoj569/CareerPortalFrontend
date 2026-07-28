import dayjs from 'dayjs';

import { JobHistoryAction, MembershipStatus, NotificationType } from '../types/dashboardModels';

export const formatDashboardDate = (value: string | null): string | null => {
  if (!value) return null;
  const date = dayjs(value);
  return date.isValid() ? date.format('D MMM YYYY, h:mm A') : null;
};

const membershipStatusLabels: Record<MembershipStatus, string> = {
  [MembershipStatus.Pending]: 'Pending',
  [MembershipStatus.Active]: 'Active',
  [MembershipStatus.Suspended]: 'Suspended',
  [MembershipStatus.Cancelled]: 'Cancelled',
  [MembershipStatus.Expired]: 'Expired',
};

const jobHistoryLabels: Record<JobHistoryAction, string> = {
  [JobHistoryAction.Viewed]: 'Viewed',
  [JobHistoryAction.Saved]: 'Saved',
  [JobHistoryAction.Applied]: 'Applied',
  [JobHistoryAction.Withdrawn]: 'Withdrawn',
  [JobHistoryAction.Rejected]: 'Rejected',
  [JobHistoryAction.Shortlisted]: 'Shortlisted',
  [JobHistoryAction.Hired]: 'Hired',
};

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.General]: 'General',
  [NotificationType.Job]: 'Job',
  [NotificationType.Application]: 'Application',
  [NotificationType.Payment]: 'Payment',
  [NotificationType.Membership]: 'Membership',
  [NotificationType.Security]: 'Security',
};

export const getMembershipStatusLabel = (value: MembershipStatus): string =>
  membershipStatusLabels[value] ?? 'Unknown';

export const getJobHistoryActionLabel = (value: JobHistoryAction): string =>
  jobHistoryLabels[value] ?? 'Updated';

export const getNotificationTypeLabel = (value: NotificationType): string =>
  notificationTypeLabels[value] ?? 'General';

export const getSafeNotificationPath = (value: string | null): string | null => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
};
