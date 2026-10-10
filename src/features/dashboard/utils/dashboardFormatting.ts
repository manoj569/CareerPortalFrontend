import dayjs from 'dayjs';

import { JobApplicationStatus, MembershipStatus, NotificationType } from '../types/dashboardModels';

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

const applicationStatusLabels: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.Submitted]: 'Submitted',
  [JobApplicationStatus.Reviewed]: 'Reviewed',
  [JobApplicationStatus.Shortlisted]: 'Shortlisted',
  [JobApplicationStatus.Rejected]: 'Rejected',
  [JobApplicationStatus.Withdrawn]: 'Withdrawn',
  [JobApplicationStatus.ExternalApplicationStarted]: 'External application started',
};

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.Profile]: 'Profile',
  [NotificationType.System]: 'General',
  [NotificationType.Application]: 'Application',
  [NotificationType.Payment]: 'Payment',
  [NotificationType.Membership]: 'Membership',
  [NotificationType.Security]: 'Security',
  [NotificationType.ReferralApproved]: 'Referral',
  [NotificationType.ReferralJobSubmitted]: 'Referral',
  [NotificationType.ReferralRejected]: 'Referral',
  [NotificationType.ReferralRequested]: 'Referral',
  [NotificationType.ReferralAccepted]: 'Referral',
  [NotificationType.ReferralRequestRejected]: 'Referral',
  [NotificationType.ReferralSubmitted]: 'Referral',
  [NotificationType.ReferralConfirmed]: 'Referral',
  [NotificationType.ReferralNotReceived]: 'Referral',
  [NotificationType.ReferralExpired]: 'Referral',
  [NotificationType.ReferralRequestReminder]: 'Referral',
};

export const getMembershipStatusLabel = (value: MembershipStatus): string =>
  membershipStatusLabels[value] ?? 'Unknown';

export const getApplicationStatusLabel = (value: JobApplicationStatus): string =>
  applicationStatusLabels[value] ?? 'Unknown';

export const canWithdrawApplication = (value: JobApplicationStatus): boolean =>
  value === JobApplicationStatus.Submitted;

export const getNotificationTypeLabel = (value: NotificationType): string =>
  notificationTypeLabels[value] ?? 'General';

export const getSafeNotificationPath = (value: string | null): string | null => {
  const unsafe = (text: string) =>
    text.includes('\\') ||
    [...text].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127);
  if (!value || !value.startsWith('/') || value.startsWith('//') || unsafe(value)) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (
      unsafe(decoded) ||
      decoded.startsWith('//') ||
      decoded.split(/[/?#]/).some((segment) => segment === '.' || segment === '..')
    )
      return null;
    const url = new URL(value, 'https://careerharbor.in');
    return url.origin === 'https://careerharbor.in' ? value : null;
  } catch {
    return null;
  }
};
