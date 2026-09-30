import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
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
    label: 'Refer a job',
    path: ROUTES.REFER_A_JOB,
    icon: GroupAddOutlinedIcon,
    badge: 'New',
  },
  {
    label: 'Interview insights',
    path: ROUTES.INTERVIEW_INSIGHTS,
    icon: QuestionAnswerOutlinedIcon,
    preserveCurrentLocation: true,
  },
  {
    label: 'Career Guidance',
    path: ROUTES.CAREER_GUIDANCE,
    icon: PsychologyOutlinedIcon,
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
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: SettingsOutlinedIcon,
  },
];