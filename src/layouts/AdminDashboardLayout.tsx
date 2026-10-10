import { NotificationBell } from '@/features/dashboard/components/NotificationBell';
import { DashboardLayoutShell } from '@/components/navigation/DashboardLayoutShell';
import { adminNavigationItems } from './adminNavigation';

export const AdminDashboardLayout = () => (
  <DashboardLayoutShell
    areaLabel="Administration"
    notificationBell={<NotificationBell />}
    navigationItems={adminNavigationItems}
  />
);
