import { DashboardLayoutShell } from '@/components/navigation/DashboardLayoutShell';
import { adminNavigationItems } from './adminNavigation';

export const AdminDashboardLayout = () => (
  <DashboardLayoutShell
    areaLabel="Administration"
    navigationItems={adminNavigationItems}
  />
);