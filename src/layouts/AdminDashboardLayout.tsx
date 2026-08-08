import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';

import { DashboardLayoutShell } from '@/components/navigation/DashboardLayoutShell';
import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';

// Exported to keep the navigation contract directly testable.
// eslint-disable-next-line react-refresh/only-export-components
export const adminNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: ROUTES.ADMIN, icon: DashboardOutlinedIcon, end: true },
  { label: 'Jobs', path: ROUTES.ADMIN_JOBS, icon: WorkOutlineIcon },
  { label: 'Users', path: ROUTES.ADMIN_USERS, icon: PeopleOutlineIcon },
  { label: 'Applications', path: ROUTES.ADMIN_APPLICATIONS, icon: AssignmentOutlinedIcon },
  { label: 'Payments', path: ROUTES.ADMIN_PAYMENTS, icon: PaymentsOutlinedIcon },
  { label: 'Audit logs', path: ROUTES.ADMIN_AUDIT_LOGS, icon: PolicyOutlinedIcon },
  { label: 'View public site', path: ROUTES.HOME, icon: PublicOutlinedIcon },
];

export const AdminDashboardLayout = () => (
  <DashboardLayoutShell areaLabel="Administration" navigationItems={adminNavigationItems} />
);
