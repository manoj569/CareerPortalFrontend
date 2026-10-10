import { ROUTES } from '@/constants/routes';
import { UserRole } from '@/types';
import type { DashboardNotification } from '../types/dashboardModels';
import { NotificationType } from '../types/dashboardModels';
import { getSafeNotificationPath } from './dashboardFormatting';
const referralTargets =
  /^\/dashboard\/(?:referrals(?:\/[a-zA-Z0-9_-]+\/(?:requests|submitted))?|referral-requests(?:\/[a-zA-Z0-9_-]+(?:\/(?:complete|submitted))?)?|my-referral-requests(?:\/[a-zA-Z0-9_-]+)?)$/;
export const getNotificationDestination = (
  notification: DashboardNotification,
  role: UserRole = UserRole.Candidate,
): string | null => {
  const referral =
    notification.type >= NotificationType.ReferralApproved &&
    notification.type <= NotificationType.ReferralRequestReminder;
  if (role === UserRole.Administrator) {
    // This existing page contains the referral approval controls. Never send admins
    // through candidate-only routes; the router independently enforces AdminRoute.
    if (notification.type === NotificationType.ReferralJobSubmitted) {
      const path = getSafeNotificationPath(notification.actionUrl);
      return path === ROUTES.ADMIN_JOBS ? path : ROUTES.ADMIN_JOBS;
    }
    if (referral) return null;
    const path = getSafeNotificationPath(notification.actionUrl);
    return path && /^\/admin(?:[/?#]|$)/i.test(path) ? path : null;
  }
  if (role !== UserRole.Candidate) return null;
  if (notification.actionUrl) {
    const path = getSafeNotificationPath(notification.actionUrl);
    if (!path || /^\/(?:admin|dashboard\/admin)(?:[/?#]|$)/i.test(decodeURIComponent(path)))
      return null;
    return referral ? (referralTargets.test(path) ? path : null) : path;
  }
  switch (notification.type) {
    case NotificationType.ReferralApproved:
    case NotificationType.ReferralRejected:
      return '/dashboard/referrals';
    case NotificationType.ReferralRequested:
    case NotificationType.ReferralRequestReminder:
    case NotificationType.ReferralNotReceived:
      return '/dashboard/referral-requests';
    case NotificationType.ReferralAccepted:
    case NotificationType.ReferralRequestRejected:
    case NotificationType.ReferralSubmitted:
      return '/dashboard/my-referral-requests';
    default:
      return null; // Confirmed/expired have recipient-dependent destinations.
  }
};
