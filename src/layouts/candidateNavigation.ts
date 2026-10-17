import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';

export const candidateNavigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: DashboardOutlinedIcon,
    end: true,
  },
  {
    label: 'Browse jobs',
    path: ROUTES.DASHBOARD_JOBS,
    icon: WorkOutlineIcon,
  },
  {
    label: 'Saved jobs',
    path: ROUTES.SAVED_JOBS,
    icon: BookmarkBorderIcon,
  },
  {
    label: 'Applied jobs',
    path: ROUTES.APPLICATIONS,
    icon: DescriptionOutlinedIcon,
  },
  {
    label: 'Referrals',
    path: ROUTES.REFERRALS,
    icon: GroupAddOutlinedIcon,
    children: [
      {
        label: 'Find Referral Jobs',
        path: `${ROUTES.DASHBOARD_JOBS}?mode=referral`,
        icon: WorkOutlineIcon,
        end: true,
      },
      {
        label: 'My Requests',
        path: '/dashboard/my-referral-requests',
        icon: DescriptionOutlinedIcon,
      },
      { label: 'Share a Job', path: ROUTES.REFER_A_JOB, icon: GroupAddOutlinedIcon },
      {
        label: "Jobs I've Shared",
        path: ROUTES.REFERRALS,
        icon: GroupAddOutlinedIcon,
        end: true,
        activePaths: ['/dashboard/referrals/:referralId/submitted'],
      },
      {
        label: 'Requests Received',
        path: '/dashboard/referral-requests',
        icon: QuestionAnswerOutlinedIcon,
        activePaths: ['/dashboard/referrals/:referralId/requests'],
      },
    ],
  },
  {
    label: 'Interview insights',
    path: ROUTES.INTERVIEW_INSIGHTS,
    icon: QuestionAnswerOutlinedIcon,
    preserveCurrentLocation: true,
  },
  {
    label: 'Career Guidance',
    icon: SchoolOutlinedIcon,
    action: 'career-guidance-coming-soon',
    secondaryLabel: 'Coming soon',
  },
  {
    label: 'Portfolio',
    path: ROUTES.PORTFOLIO,
    icon: WebOutlinedIcon,
  },
  {
    label: 'Membership',
    path: ROUTES.MEMBERSHIP,
    icon: WorkspacePremiumOutlinedIcon,
  },
  {
    label: 'Resume maker',
    path: ROUTES.RESUME_MAKER,
    icon: DescriptionOutlinedIcon,
    badge: 'New',
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: SettingsOutlinedIcon,
  },
];
