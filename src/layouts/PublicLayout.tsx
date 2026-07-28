import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { AppBrand } from '@/components/navigation/AppBrand';
import { NavigationList } from '@/components/navigation/NavigationList';
import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

const publicNavigation: NavigationItem[] = [
  { label: 'Home', path: ROUTES.HOME, end: true },
  { label: 'Jobs', path: ROUTES.JOBS },
];

export const PublicLayout = () => {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const authenticatedHome =
    currentUser?.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;
  const mobileNavigation: NavigationItem[] = isAuthenticated
    ? [...publicNavigation, { label: 'Dashboard', path: authenticatedHome }]
    : [
        ...publicNavigation,
        { label: 'Log in', path: ROUTES.LOGIN },
        { label: 'Register', path: ROUTES.REGISTER },
      ];

  const closeMobileNavigation = (restoreFocus = true) => {
    setIsMobileNavigationOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar
        color="inherit"
        elevation={0}
        position="sticky"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <AppBrand />
            <Stack
              alignItems="center"
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 5 }}
            >
              {publicNavigation.map(({ end, label, path }) => (
                <Button
                  color="inherit"
                  component={NavLink}
                  end={end}
                  key={path}
                  sx={{
                    '&.active': { color: 'primary.main', bgcolor: 'action.selected' },
                  }}
                  to={path}
                >
                  {label}
                </Button>
              ))}
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto' }}
            >
              {isAuthenticated ? (
                <Button component={NavLink} to={authenticatedHome} variant="contained">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button component={NavLink} to={ROUTES.LOGIN}>
                    Log in
                  </Button>
                  <Button component={NavLink} to={ROUTES.REGISTER} variant="contained">
                    Register
                  </Button>
                </>
              )}
            </Stack>
            <IconButton
              aria-controls="public-mobile-navigation"
              aria-expanded={isMobileNavigationOpen}
              aria-label="Open main navigation"
              edge="end"
              onClick={() => setIsMobileNavigationOpen(true)}
              ref={menuButtonRef}
              sx={{ display: { md: 'none' }, ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        ModalProps={{ disableRestoreFocus: true, keepMounted: true }}
        onClose={() => closeMobileNavigation()}
        open={isMobileNavigationOpen}
        slotProps={{
          paper: {
            'aria-label': 'Main navigation drawer',
            id: 'public-mobile-navigation',
            sx: { p: 2, width: { xs: 'min(88vw, 320px)', sm: 320 } },
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2, px: 1 }}>
          <AppBrand compact />
          <Button onClick={() => closeMobileNavigation()}>Close</Button>
        </Stack>
        <NavigationList
          ariaLabel="Mobile primary navigation"
          items={mobileNavigation}
          onNavigate={() => closeMobileNavigation(false)}
        />
      </Drawer>

      <Container
        component="main"
        id="main-content"
        maxWidth="lg"
        sx={{ flex: 1, minWidth: 0, py: { xs: 4, md: 6 } }}
        tabIndex={-1}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: 3 }}
      >
        <Container maxWidth="lg">
          <Typography color="text.secondary" variant="body2">
            © {new Date().getFullYear()} Career Portal. Build your next chapter.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
