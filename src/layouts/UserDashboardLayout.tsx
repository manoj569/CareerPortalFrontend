import { DashboardLayoutShell } from '@/components/navigation/DashboardLayoutShell';
import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery, useGetNotificationsQuery } from '@/features/dashboard/api/dashboardApi';
import { isMembershipActive } from '@/features/payments/utils/entitlement';
import { candidateNavigationItems } from './candidateNavigation';

export const UserDashboardLayout = () => {
  const memberships = useGetMembershipsQuery();
  const notifications = useGetNotificationsQuery({ pageNumber: 1, pageSize: 1 });
  const activeAccessCount =
    memberships.data?.filter((membership) => isMembershipActive(membership)).length ?? 0;
  const accessStatus = memberships.isLoading
    ? 'Checking access…'
    : memberships.isError
      ? 'Access status unavailable'
      : activeAccessCount > 0
        ? `${activeAccessCount} active access ${activeAccessCount === 1 ? 'plan' : 'plans'}`
        : 'No active access';

  return (
    <DashboardLayoutShell
      accessStatus={accessStatus}
      accountMenuProfilePath={ROUTES.PORTFOLIO}
      areaLabel="Candidate workspace"
      collapsibleDesktop
      navigationItems={candidateNavigationItems}
      notificationCount={notifications.data?.unreadCount ?? 0}
      showNotifications
    />
  );
};
