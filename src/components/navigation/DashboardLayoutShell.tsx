import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { logout, selectCurrentUser } from '@/features/auth/store/authSlice';
import { CookieSettingsButton } from '@/features/cookieConsent/CookieSettingsButton';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { AppBrand } from './AppBrand';
import { NavigationList } from './NavigationList';
import type { NavigationItem } from './navigationTypes';

const DRAWER_WIDTH = 264;

interface DashboardLayoutShellProps {
  accessStatus?: string;
  areaLabel: string;
  navigationItems: NavigationItem[];
}

export const DashboardLayoutShell = ({
  accessStatus,
  areaLabel,
  navigationItems,
}: DashboardLayoutShellProps) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const mobileDrawerId = `${areaLabel.toLowerCase().replace(/\s+/g, '-')}-mobile-navigation`;

  const handleLogout = () => {
    void dispatch(logout()).finally(() => {
      void navigate(ROUTES.HOME, { replace: true });
    });
  };

  const closeMobileDrawer = (restoreFocus = true) => {
    setIsMobileDrawerOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  };

  const drawerContent = (
    <Stack height="100%">
      <Box sx={{ px: 2.5, py: 2.25 }}>
        <AppBrand compact />
        <Typography color="text.secondary" display="block" variant="caption">
          {areaLabel}
        </Typography>
      </Box>
      <Divider />
      {accessStatus ? (
        <Box aria-live="polite" sx={{ px: 2.5, py: 1.5 }}>
          <Typography color="text.secondary" variant="caption">
            Verified access
          </Typography>
          <Typography fontWeight={700} variant="body2">
            {accessStatus}
          </Typography>
        </Box>
      ) : null}
      {accessStatus ? <Divider /> : null}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        <NavigationList
          ariaLabel={`${areaLabel} navigation`}
          items={navigationItems}
          onNavigate={() => closeMobileDrawer(false)}
        />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {currentUser ? (
          <Box sx={{ mb: 2, minWidth: 0 }}>
            <Typography
              fontWeight={700}
              noWrap
              title={`${currentUser.firstName} ${currentUser.lastName}`}
            >
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
            <Typography color="text.secondary" noWrap title={currentUser.email} variant="caption">
              {currentUser.email}
            </Typography>
          </Box>
        ) : null}
        <CookieSettingsButton fullWidth sx={{ mb: 1 }} variant="text" />
        <Button fullWidth onClick={handleLogout} variant="outlined">
          Log out
        </Button>
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
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
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
          <Typography component="p" fontWeight={700} noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {areaLabel}
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { md: DRAWER_WIDTH } }}>
        <Drawer
          ModalProps={{ disableRestoreFocus: true, keepMounted: true }}
          onClose={() => closeMobileDrawer()}
          open={isMobileDrawerOpen}
          slotProps={{
            paper: {
              'aria-label': `${areaLabel} navigation drawer`,
              id: mobileDrawerId,
              sx: { maxWidth: '88vw', width: DRAWER_WIDTH },
            },
          }}
          variant="temporary"
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          open
          slotProps={{ paper: { sx: { width: DRAWER_WIDTH } } }}
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        id="main-content"
        sx={{ flexGrow: 1, minWidth: 0, pt: 8 }}
        tabIndex={-1}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
