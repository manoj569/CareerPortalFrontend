import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';

export const candidateNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardOutlinedIcon, end: true },
  { label: 'Browse jobs', path: ROUTES.DASHBOARD_JOBS, icon: WorkOutlineIcon },
  { label: 'Portfolio', path: ROUTES.PORTFOLIO, icon: WebOutlinedIcon },
  { label: 'Saved jobs', path: ROUTES.SAVED_JOBS, icon: BookmarkBorderIcon },
  { label: 'Applied jobs', path: ROUTES.APPLICATIONS, icon: DescriptionOutlinedIcon },
  { label: 'AI Apply', path: ROUTES.AI_APPLY, icon: AutoAwesomeOutlinedIcon },
  {
    label: 'Interview insights',
    path: ROUTES.INTERVIEW_INSIGHTS,
    icon: QuestionAnswerOutlinedIcon,
    preserveCurrentLocation: true,
  },
  { label: 'Membership', path: ROUTES.MEMBERSHIP, icon: WorkspacePremiumOutlinedIcon },
  { label: 'Payments', path: ROUTES.PAYMENTS, icon: PaymentsOutlinedIcon },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: SettingsOutlinedIcon },
];
