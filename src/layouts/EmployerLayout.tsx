import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { JobDraftProvider } from '@/features/employer/jobs/JobDraftContext';
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { AppBrand } from '@/components/navigation/AppBrand';
import { ROUTES } from '@/constants/routes';

const sidebarWidth = 260;

const navigationItems = [
  {
    label: 'Home',
    path: ROUTES.EMPLOYER_DASHBOARD,
    icon: DashboardOutlinedIcon,
  },
  {
    label: 'Jobs',
    path: ROUTES.EMPLOYER_JOBS,
    icon: BusinessCenterOutlinedIcon,
  },
  {
    label: 'Candidates',
    path: ROUTES.EMPLOYER_CANDIDATES,
    icon: GroupsOutlinedIcon,
  },
  {
    label: 'AI Candidate Finder',
    path: ROUTES.EMPLOYER_CANDIDATE_FIND,
    icon: PersonSearchOutlinedIcon,
    badge: 'AI',
  },
  {
    label: 'Hiring Pipeline',
    path: ROUTES.EMPLOYER_PIPELINE,
    icon: FilterAltOutlinedIcon,
  },
  {
    label: 'Interviews',
    path: ROUTES.EMPLOYER_INTERVIEWS,
    icon: CalendarMonthOutlinedIcon,
  },
  {
    label: 'Screening',
    path: ROUTES.EMPLOYER_SCREENING,
    icon: ManageSearchOutlinedIcon,
  },
  {
    label: 'Talent Pool',
    path: ROUTES.EMPLOYER_TALENT_POOL,
    icon: GroupsOutlinedIcon,
  },
  {
    label: 'Messages',
    path: ROUTES.EMPLOYER_MESSAGES,
    icon: MailOutlineOutlinedIcon,
    badge: '3',
  },
  {
    label: 'Analytics',
    path: ROUTES.EMPLOYER_ANALYTICS,
    icon: AnalyticsOutlinedIcon,
  },
  {
    label: 'Company Profile',
    path: ROUTES.EMPLOYER_COMPANY,
    icon: BusinessOutlinedIcon,
  },
  {
    label: 'Settings',
    path: ROUTES.EMPLOYER_SETTINGS,
    icon: SettingsOutlinedIcon,
  },
];

export const EmployerLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0d1c34',
        background:
          'linear-gradient(180deg, #0b1b33 0%, #10233f 100%)',
        color: '#fff',
      }}
    >
      <Box
        sx={{
          minHeight: 74,
          px: 2.25,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,.05)',
          '& a': {
            color: '#fff',
          },
        }}
      >
        <AppBrand inverse />
      </Box>

      <Stack
        component="nav"
        spacing={0.45}
        sx={{
          px: 1.5,
          py: 2,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Box
              component={NavLink}
              end={item.path === ROUTES.EMPLOYER_DASHBOARD}
              key={item.label}
              onClick={() => setMobileOpen(false)}
              to={item.path}
              sx={{
                minHeight: 48,
                px: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'rgba(255,255,255,.87)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'background-color .15s ease',
                '& svg': {
                  fontSize: 21,
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,.07)',
                },
                '&.active': {
                  bgcolor: '#0759bd',
                  color: '#fff',
                  fontWeight: 750,
                },
              }}
            >
              <Icon />

              <Typography
                sx={{
                  flex: 1,
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              >
                {item.label}
              </Typography>

              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 23,
                    minWidth: 23,
                    bgcolor:
                      item.badge === 'AI'
                        ? '#a981f7'
                        : '#f04452',
                    color: '#fff',
                    fontSize: '0.67rem',
                    fontWeight: 850,
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,.07)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: '#fff',
              color: '#075de7',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <BusinessOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '0.82rem',
                fontWeight: 800,
              }}
            >
              TechNova Solutions
            </Typography>

            <Typography
              noWrap
              sx={{
                color: 'rgba(255,255,255,.68)',
                fontSize: '0.72rem',
                mt: 0.25,
              }}
            >
              Employer Account
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f8fd',
      }}
    >
      {isDesktop ? (
        <Box
          sx={{
            position: 'fixed',
            inset: '0 auto 0 0',
            width: sidebarWidth,
            zIndex: 1200,
          }}
        >
          {sidebar}
        </Box>
      ) : (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: sidebarWidth,
                border: 0,
              },
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      {!isDesktop && (
        <IconButton
          aria-label="Open employer navigation"
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 15,
            left: 12,
            zIndex: 1301,
            width: 42,
            height: 42,
            bgcolor: '#0d1c34',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(15,23,42,.15)',
            '&:hover': {
              bgcolor: '#142845',
            },
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>
      )}

      <Box
        sx={{
          ml: {
            xs: 0,
            lg: `${sidebarWidth}px`,
          },
          minHeight: '100vh',
        }}
      >
<JobDraftProvider>
  <Outlet />
</JobDraftProvider>
      </Box>
    </Box>
  );
};