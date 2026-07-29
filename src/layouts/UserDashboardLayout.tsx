import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import { DashboardLayoutShell } from '@/components/navigation/DashboardLayoutShell';
import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { isMembershipActive } from '@/features/payments/utils/entitlement';

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardOutlinedIcon, end: true },
  { label: 'Profile', path: ROUTES.PROFILE, icon: PersonOutlineIcon },
  { label: 'Career preferences', path: ROUTES.ONBOARDING, icon: TuneOutlinedIcon },
  { label: 'Resume', path: ROUTES.RESUME, icon: ArticleOutlinedIcon },
  { label: 'Saved jobs', path: ROUTES.SAVED_JOBS, icon: BookmarkBorderIcon },
  { label: 'Applications', path: ROUTES.APPLICATIONS, icon: DescriptionOutlinedIcon },
  { label: 'Membership', path: ROUTES.MEMBERSHIP, icon: WorkspacePremiumOutlinedIcon },
  { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: NotificationsNoneOutlinedIcon },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: SettingsOutlinedIcon },
  { label: 'Payments', path: ROUTES.PAYMENTS, icon: PaymentsOutlinedIcon },
];

export const UserDashboardLayout = () => {
  const memberships = useGetMembershipsQuery();
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
      areaLabel="Candidate workspace"
      navigationItems={navigationItems}
    />
  );
};
