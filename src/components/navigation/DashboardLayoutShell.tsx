import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { logout, selectCurrentUser } from '@/features/auth/store/authSlice';
import { CookieSettingsButton } from '@/features/cookieConsent/CookieSettingsButton';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { AppBrand } from './AppBrand';
import { CandidateAccountMenu } from './CandidateAccountMenu';
import { NavigationList } from './NavigationList';
import type { NavigationItem } from './navigationTypes';

const DRAWER_WIDTH = 264;
const COLLAPSED_DRAWER_WIDTH = 72;

interface DashboardLayoutShellProps {
  accessStatus?: string;
  areaLabel: string;
  navigationItems: NavigationItem[];
  collapsibleDesktop?: boolean;
  accountMenuProfilePath?: string;
  notificationCount?: number;
  showNotifications?: boolean;
}

export const DashboardLayoutShell = ({
  accessStatus,
  areaLabel,
  navigationItems,
  accountMenuProfilePath,
  collapsibleDesktop = false,
  notificationCount = 0,
  showNotifications = false,
}: DashboardLayoutShellProps) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const theme = useTheme();

  const browseJobsMatch = useMatch({
    path: ROUTES.DASHBOARD_JOBS,
    end: true,
  });
  const isBrowseJobsPage = browseJobsMatch !== null;

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

  const closeMobileDrawer = (restoreFocus = true) => {
    setIsMobileDrawerOpen(false);

    if (restoreFocus) {
      window.setTimeout(() => menuButtonRef.current?.focus(), 0);
    }
  };

  const renderDrawerContent = (compact = false) => (
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
        />
      </Box>

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
        <Toolbar>
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

          <Typography
            component="p"
            fontWeight={700}
            noWrap
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            {areaLabel}
          </Typography>

          {showNotifications ? (
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
          ) : null}

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
          {renderDrawerContent(false)}
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

      <Box
        component="main"
        id="main-content"
        sx={{ flexGrow: 1, minWidth: 0, pt: 8 }}
        tabIndex={-1}
      >
        <Container
          maxWidth={isBrowseJobsPage ? false : 'xl'}
          sx={
            isBrowseJobsPage
              ? {
                  px: { xs: 1.5, sm: 2, lg: 3 },
                  py: { xs: 1.5, md: 2 },
                }
              : {
                  py: { xs: 3, md: 4 },
                }
          }
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};