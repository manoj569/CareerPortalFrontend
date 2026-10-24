import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  InputAdornment,
  TextField,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { CareerGuidanceComingSoonPage } from '@/features/careerGuidance/components/CareerGuidanceComingSoonPage';
import { useGetMyInterviewContributionsQuery } from '@/features/interviewInsights/api/interviewInsightsApi';
import { CareerGuidanceComingSoonDialog, CareerHarborPointsIndicator } from '@/features/interviewInsights/components/CareerHarborPointsActions';
import { CareerHarborPointsCard } from '@/features/interviewInsights/components/CareerHarborPointsCard';
import { logout, selectCurrentUser } from '@/features/auth/store/authSlice';
import { CookieSettingsButton } from '@/features/cookieConsent/CookieSettingsButton';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { AppBrand } from './AppBrand';
import { CandidateAccountMenu } from './CandidateAccountMenu';
import { CareerHarborSocialLinks } from './CareerHarborSocialLinks';
import { NavigationList } from './NavigationList';
import type { NavigationItem } from './navigationTypes';

const DRAWER_WIDTH = 252;
const COLLAPSED_DRAWER_WIDTH = 72;

interface DashboardLayoutShellProps {
  accessStatus?: string;
  areaLabel: string;
  navigationItems: NavigationItem[];
  collapsibleDesktop?: boolean;
  accountMenuProfilePath?: string;
  notificationCount?: number;
  showNotifications?: boolean;
  notificationBell?: ReactNode;
}

export const DashboardLayoutShell = ({
  accessStatus,
  areaLabel,
  navigationItems,
  accountMenuProfilePath,
  collapsibleDesktop = false,
  notificationCount = 0,
  showNotifications = false,
  notificationBell,
}: DashboardLayoutShellProps) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [careerGuidanceDialogOpen, setCareerGuidanceDialogOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const pointsQuery = useGetMyInterviewContributionsQuery(undefined, {
    skip: areaLabel !== 'Candidate workspace',
  });
  const [jobSearch, setJobSearch] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const browseJobsMatch = useMatch({
    path: ROUTES.DASHBOARD_JOBS,
    end: true,
  });
  const savedJobsMatch = useMatch({
  path: ROUTES.SAVED_JOBS,
  end: true,
});
const applicationsMatch = useMatch({
  path: ROUTES.APPLICATIONS,
  end: true,
});
const referAJobMatch = useMatch({
  path: ROUTES.REFER_A_JOB,
  end: true,
});
const interviewInsightsMatch = useMatch({
  path: ROUTES.INTERVIEW_INSIGHTS,
  end: true,
});
const careerGuidanceMatch = useMatch({
  path: ROUTES.CAREER_GUIDANCE,
  end: true,
});
const portfolioMatch = useMatch({
  path: ROUTES.PORTFOLIO,
  end: true,
});
const membershipMatch = useMatch({
  path: ROUTES.MEMBERSHIP,
  end: true,
});
const settingsMatch = useMatch({
  path: ROUTES.SETTINGS,
  end: true,
});
  const isBrowseJobsPage = browseJobsMatch !== null;
const dashboardMatch = useMatch({
  path: ROUTES.DASHBOARD,
  end: true,
});

const isDashboardPage = dashboardMatch !== null;
const isSavedJobsPage = savedJobsMatch !== null;
const isApplicationsPage = applicationsMatch !== null;
const isReferAJobPage = referAJobMatch !== null;
const isInterviewInsightsPage = interviewInsightsMatch !== null;
const isCareerGuidancePage = careerGuidanceMatch !== null;
const isPortfolioPage = portfolioMatch !== null;
const isMembershipPage = membershipMatch !== null;
const isSettingsPage = settingsMatch !== null;

const referralLocation = useLocation();
const isReferralPage = /^\/dashboard\/(referrals|referral-requests|my-referral-requests)(\/|$)/.test(referralLocation.pathname);
const isFullWidthPage =
  isReferralPage ||
  isBrowseJobsPage ||
  isDashboardPage ||
  isSavedJobsPage ||
  isApplicationsPage ||
  isReferAJobPage ||
  isInterviewInsightsPage ||
  isCareerGuidancePage ||
  isPortfolioPage ||
  isMembershipPage ||
  isSettingsPage;

   const tabletSidebar = useMediaQuery(
    theme.breakpoints.between('md', 'lg'),
  );
  const [desktopCollapseOverride, setDesktopCollapseOverride] =
    useState<boolean | null>(null);

  const isDesktopCollapsed =
    collapsibleDesktop && (desktopCollapseOverride ?? tabletSidebar);

  const desktopDrawerWidth = isDesktopCollapsed
    ? COLLAPSED_DRAWER_WIDTH
    : DRAWER_WIDTH;

  const mobileDrawerId =
    `${areaLabel.toLowerCase().replace(/\s+/g, '-')}-mobile-navigation`;

  const handleLogout = () => {
    void dispatch(logout()).finally(() => {
      void navigate(ROUTES.HOME, { replace: true });
    });
  };

  const submitJobSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (jobSearch.trim()) params.set('q', jobSearch.trim());
    if (jobLocation.trim()) params.set('location', jobLocation.trim());
    void navigate(`${ROUTES.DASHBOARD_JOBS}${params.size ? `?${params.toString()}` : ''}`);
  };

  const closeMobileDrawer = (restoreFocus = true) => {
    setIsMobileDrawerOpen(false);

    if (restoreFocus) {
      window.setTimeout(() => menuButtonRef.current?.focus(), 0);
    }
  };

  const renderDrawerContent = (compact = false, mobile = false) => (
    <Stack flex={1} minHeight={0}>
      <Box
        sx={{
          px: compact ? 1.5 : 2.5,
          py: 2.25,
          textAlign: compact ? 'center' : 'left',
        }}
      >
        <AppBrand compact markOnly={compact} />

        {compact ? null : (
          <Typography
            color="text.secondary"
            display="block"
            variant="caption"
          >
            {areaLabel}
          </Typography>
        )}
      </Box>

      <Divider />

      {accessStatus && !compact ? (
        <Box aria-live="polite" sx={{ px: 2.5, py: 1.5 }}>
          <Typography color="text.secondary" variant="caption">
            Verified access
          </Typography>
          <Typography fontWeight={700} variant="body2">
            {accessStatus}
          </Typography>
        </Box>
      ) : null}

      {accessStatus && !compact ? <Divider /> : null}

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        <NavigationList
          ariaLabel={`${areaLabel} navigation`}
          compact={compact}
          items={navigationItems}
          onNavigate={() => closeMobileDrawer(false)}
          onAction={(action) => {
            if (action === 'career-guidance-coming-soon') setCareerGuidanceDialogOpen(true);
          }}
        />
      </Box>

      <Divider />

      {!compact ? (
        <Box sx={{ px: 2, py: 1.5 }}>
          <CareerHarborSocialLinks mobile={mobile} />
        </Box>
      ) : null}

      <Divider />

      <Box sx={{ p: compact ? 1 : 2 }}>
        {currentUser && !compact ? (
          <Box sx={{ mb: 2, minWidth: 0 }}>
            <Typography
              fontWeight={700}
              noWrap
              title={`${currentUser.firstName} ${currentUser.lastName}`}
            >
              {currentUser.firstName} {currentUser.lastName}
            </Typography>

            <Typography
              color="text.secondary"
              noWrap
              title={currentUser.email}
              variant="caption"
            >
              {currentUser.email}
            </Typography>
          </Box>
        ) : null}

        {compact ? null : (
          <CookieSettingsButton
            fullWidth
            sx={{ mb: 1 }}
            variant="text"
          />
        )}

        {accountMenuProfilePath ? null : compact ? (
          <Tooltip placement="right" title="Log out">
            <IconButton aria-label="Log out" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button fullWidth onClick={handleLogout} variant="outlined">
            Log out
          </Button>
        )}
      </Box>
    </Stack>
  );

  return (
    <Box display="flex" minHeight="100vh">
      <AppBar
        color="inherit"
        elevation={0}
        position="fixed"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          ml: { md: `${desktopDrawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width']),
          width: { md: `calc(100% - ${desktopDrawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, gap: { xs: 0.5, md: 1.25 }, px: { xs: 1.5, md: 2.5 } }}>
          <Box role="group" aria-label="Primary navigation" sx={{ display: 'flex', alignItems: 'center', flexGrow: areaLabel === 'Candidate workspace' ? 0 : 1, flexShrink: 0, minWidth: 0 }}>
            <IconButton
              aria-controls={mobileDrawerId}
              aria-expanded={isMobileDrawerOpen}
              aria-label={`Open ${areaLabel.toLowerCase()} navigation`}
              edge="start"
              onClick={() => setIsMobileDrawerOpen(true)}
              ref={menuButtonRef}
              sx={{ display: { md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {areaLabel === 'Candidate workspace' ? <>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}><AppBrand /></Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}><AppBrand compact markOnly /></Box>
            </> : <Typography
              component="p"
              fontWeight={700}
              noWrap
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {areaLabel}
            </Typography>}
          </Box>

          {areaLabel === 'Candidate workspace' ? <Box component="form" onSubmit={submitJobSearch} role="search" sx={{ display: { xs: 'none', lg: 'flex' }, '@media (min-width:1200px) and (max-width:1399px)': { display: 'none' }, alignItems: 'center', flex: '1 1 640px', maxWidth: 820, mx: 'auto', gap: 1 }}>
            <TextField size="small" value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Search jobs, companies, skills or keywords..." inputProps={{ 'aria-label': 'Search jobs, companies, skills or keywords' }} sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: 44, bgcolor: '#f5f7fc', borderRadius: 2.5 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="primary" /></InputAdornment> }} />
            <TextField size="small" value={jobLocation} onChange={(event) => setJobLocation(event.target.value)} placeholder="All locations" inputProps={{ 'aria-label': 'Job location' }} sx={{ width: 190, '& .MuiOutlinedInput-root': { height: 44, borderRadius: 2.5 } }} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlinedIcon color="primary" /></InputAdornment> }} />
            <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />} sx={{ minHeight: 44, px: 2.25, borderRadius: 2 }}>Search</Button>
          </Box> : null}

          <Box role="group" aria-label="Notifications and account" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: areaLabel === 'Candidate workspace' ? { xs: 'auto', md: 0 } : 0, gap: { xs: 0.5, md: 1.25 } }}>
          {notificationBell ?? (showNotifications ? (
            <IconButton
              aria-label={
                notificationCount > 0
                  ? `Notifications, ${notificationCount} unread`
                  : 'Notifications'
              }
              color="inherit"
              onClick={() => void navigate(ROUTES.NOTIFICATIONS)}
              sx={{ mr: 0.5 }}
            >
              {notificationCount > 0 ? (
                <Badge
                  badgeContent={notificationCount}
                  color="error"
                  max={99}
                >
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              ) : (
                <NotificationsNoneOutlinedIcon />
              )}
            </IconButton>
          ) : null)}

          <CareerHarborPointsIndicator balance={pointsQuery.data?.pointsBalance} />

          {accountMenuProfilePath ? (
            <CandidateAccountMenu
              email={currentUser?.email}
              firstName={currentUser?.firstName}
              lastName={currentUser?.lastName}
              onLogout={handleLogout}
              profilePath={accountMenuProfilePath}
            />
          ) : (
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Log out
            </Button>
          )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width'),
          width: { md: desktopDrawerWidth },
        }}
      >
        <Drawer
          ModalProps={{
            disableRestoreFocus: true,
            keepMounted: true,
          }}
          onClose={() => closeMobileDrawer()}
          open={isMobileDrawerOpen}
          slotProps={{
            paper: {
              'aria-label': `${areaLabel} navigation drawer`,
              id: mobileDrawerId,
              sx: {
                maxWidth: '88vw',
                width: DRAWER_WIDTH,
              },
            },
          }}
          variant="temporary"
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {renderDrawerContent(false, true)}
        </Drawer>

        <Drawer
          open
          slotProps={{
            paper: {
              sx: {
                overflowX: 'hidden',
                transition: theme.transitions.create('width'),
                width: desktopDrawerWidth,
              },
            },
          }}
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {collapsibleDesktop ? (
            <Tooltip
              placement="right"
              title={
                isDesktopCollapsed
                  ? 'Expand navigation'
                  : 'Collapse navigation'
              }
            >
              <IconButton
                aria-expanded={!isDesktopCollapsed}
                aria-label={
                  isDesktopCollapsed
                    ? 'Expand candidate navigation'
                    : 'Collapse candidate navigation'
                }
                onClick={() =>
                  setDesktopCollapseOverride(!isDesktopCollapsed)
                }
                sx={{
                  alignSelf: isDesktopCollapsed ? 'center' : 'flex-end',
                  m: 1,
                }}
              >
                {isDesktopCollapsed ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </Tooltip>
          ) : null}

          {renderDrawerContent(isDesktopCollapsed)}
        </Drawer>
      </Box>

      <CareerGuidanceComingSoonDialog
        balance={pointsQuery.data?.pointsBalance}
        onClose={() => setCareerGuidanceDialogOpen(false)}
        open={careerGuidanceDialogOpen}
      />

      <Box
        component="main"
        id="main-content"
        sx={{ flexGrow: 1, minWidth: 0, pt: 8 }}
        tabIndex={-1}
      >
        <Container
  maxWidth={isFullWidthPage ? false : 'xl'}
  sx={
    isFullWidthPage
      ? {
          px: { xs: 1.5, sm: 2, lg: 3 },
          py: { xs: 1.5, md: 2 },
        }
      : {
          py: { xs: 3, md: 4 },
        }
  }
>
          {referralLocation.pathname === ROUTES.REFERRALS && pointsQuery.data?.pointsBalance ? (
            <Box sx={{ mb: 2 }}>
              <CareerHarborPointsCard balance={pointsQuery.data.pointsBalance} compact />
            </Box>
          ) : null}
          {referralLocation.pathname.startsWith('/career-guidance') ? (
            <CareerGuidanceComingSoonPage balance={pointsQuery.data?.pointsBalance} />
          ) : (
            <Outlet />
          )}
        </Container>
      </Box>
    </Box>
  );
};
