import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { adminSupportRoutes } from '@/features/support/admin/adminSupportApi';

import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';

export const adminNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: ROUTES.ADMIN, icon: DashboardOutlinedIcon, end: true },
  { label: 'Jobs', path: ROUTES.ADMIN_JOBS, icon: WorkOutlineIcon },
  { label: 'Companies', path: ROUTES.ADMIN_COMPANIES, icon: BusinessOutlinedIcon },
  { label: 'Job Sources', path: ROUTES.ADMIN_JOB_SOURCES, icon: PublicOutlinedIcon },
  { label: 'Users', path: ROUTES.ADMIN_USERS, icon: PeopleOutlineIcon },
  {
    label: 'Career Guidance',
    path: ROUTES.ADMIN_CAREER_GUIDANCE,
    icon: PsychologyOutlinedIcon,
  },
  { label: 'Applications', path: ROUTES.ADMIN_APPLICATIONS, icon: AssignmentOutlinedIcon },
  {
    label: 'Interview insights',
    path: ROUTES.ADMIN_INTERVIEW_INSIGHTS,
    icon: QuestionAnswerOutlinedIcon,
  },
  { label: 'AI Apply Operations', path: ROUTES.ADMIN_AI_APPLY, icon: SmartToyOutlinedIcon },
  { label: 'Payments', path: ROUTES.ADMIN_PAYMENTS, icon: PaymentsOutlinedIcon },
  { label: 'Support Tickets', path: adminSupportRoutes.list, icon: SupportAgentOutlinedIcon },
  { label: 'Audit logs', path: ROUTES.ADMIN_AUDIT_LOGS, icon: PolicyOutlinedIcon },
  { label: 'View public site', path: ROUTES.HOME, icon: PublicOutlinedIcon },
];
