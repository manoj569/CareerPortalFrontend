import { SupportButton } from '@/features/support/SupportButton';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MenuIcon from '@mui/icons-material/Menu';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { AppBrand } from '@/components/navigation/AppBrand';
import { NavigationList } from '@/components/navigation/NavigationList';
import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';
import { PUBLIC_PAGE_CONTAINER_MAX_WIDTH, PUBLIC_PAGE_GUTTER } from '@/constants/publicLayout';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { CookieSettingsButton } from '@/features/cookieConsent/CookieSettingsButton';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

const socialLinks = [
  {
    icon: <LinkedInIcon fontSize="medium" />,
    label: 'Career Harbor on LinkedIn',
    url: 'https://www.linkedin.com/company/career-harbor-jobs',
  },
  {
    icon: <FacebookIcon fontSize="medium" />,
    label: 'Career Harbor on Facebook',
    url: 'https://www.facebook.com/CareerHarbor',
  },
  {
    icon: <InstagramIcon fontSize="medium" />,
    label: 'Career Harbor on Instagram',
    url: 'https://www.instagram.com/career.harbor',
  },
  {
    icon: <YouTubeIcon fontSize="medium" />,
    label: 'Career Harbor on YouTube',
    url: 'https://www.youtube.com/@CareerHarborOfficial',
  },
] as const;

export const PublicLayout = () => {
  const location = useLocation();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const authenticatedHome =
    currentUser?.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;
  const isHomePage = location.pathname === ROUTES.HOME;
  const mobileNavigation: NavigationItem[] = isAuthenticated
    ? [{ label: 'Dashboard', path: authenticatedHome }]
    : [
        { label: 'Home', path: ROUTES.HOME },
        { label: 'Jobs', path: ROUTES.JOBS },
        ...(isHomePage
          ? [
              { label: 'Career Guidance', path: ROUTES.CAREER_GUIDANCE },
              { label: 'Interview Insights', path: ROUTES.INTERVIEW_INSIGHTS },
            ]
          : []),
        { label: 'Log in', path: ROUTES.LOGIN },
        { label: 'Register', path: ROUTES.REGISTER },
      ];

  const closeMobileNavigation = (restoreFocus = true) => {
    setIsMobileNavigationOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ overflowX: 'clip' }}>
      <AppBar
        color="inherit"
        elevation={0}
        position="sticky"
        sx={{
          bgcolor: 'rgba(255,255,255,.97)',
          borderBottom: '1px solid rgba(15,23,42,.08)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: isHomePage ? 'none' : PUBLIC_PAGE_CONTAINER_MAX_WIDTH,
            paddingInline: isHomePage
              ? 'clamp(20px, 5vw, 96px) !important'
              : `${PUBLIC_PAGE_GUTTER} !important`,
          }}
        >
          <Toolbar
            disableGutters
            sx={{ minHeight: isHomePage ? { xs: 68, md: 76 } : { xs: 74, md: 88 } }}
          >
            <AppBrand />
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                display: isHomePage ? { xs: 'none', lg: 'flex' } : { xs: 'none', md: 'flex' },
                ml: 'auto',
              }}
            >
              {isAuthenticated ? (
                <Button component={NavLink} to={authenticatedHome} variant="contained">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button component={NavLink} size="large" sx={{ px: 2 }} to={ROUTES.HOME}>
                    Home
                  </Button>
                  <Button component={NavLink} size="large" sx={{ px: 2 }} to={ROUTES.JOBS}>
                    Jobs
                  </Button>
                  {isHomePage && (
                    <>
                      <Button component={NavLink} to={ROUTES.CAREER_GUIDANCE}>
                        Career Guidance
                      </Button>
                      <Button component={NavLink} to={ROUTES.INTERVIEW_INSIGHTS}>
                        Interview Insights
                      </Button>
                    </>
                  )}
                  <Button component={NavLink} size="large" sx={{ px: 2 }} to={ROUTES.LOGIN}>
                    Log in
                  </Button>
                  <Button
                    component={NavLink}
                    size="large"
                    sx={{ minHeight: 48, px: 3 }}
                    to={ROUTES.REGISTER}
                    variant="contained"
                  >
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
              sx={{ display: isHomePage ? { lg: 'none' } : { md: 'none' }, ml: 'auto' }}
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
        maxWidth={isHomePage ? false : 'lg'}
        sx={{
          flex: 1,
          minWidth: 0,
          ...(isHomePage ? { px: '0 !important' } : {}),
          py: isHomePage ? 0 : { xs: 4, md: 6 },
        }}
        tabIndex={-1}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          bgcolor: '#111827',
          color: 'common.white',
          mt: isHomePage ? 0 : { xs: 6, md: 8 },
          py: { xs: 6, md: 8 },
        }}
      >
        <Container
          maxWidth={isHomePage ? false : 'lg'}
          sx={
            isHomePage
              ? { maxWidth: 'none', paddingInline: 'clamp(20px, 5vw, 96px) !important' }
              : undefined
          }
        >
          <Grid container spacing={{ xs: 4, md: 7 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <AppBrand inverse />
              <Typography
                sx={{ color: 'rgba(255,255,255,.68)', lineHeight: 1.7, maxWidth: 420, mt: 2 }}
              >
                {isHomePage
                  ? 'A complete career growth platform with jobs, referrals, interview insights, guidance and a professional portfolio.'
                  : 'A focused place to discover active jobs, prepare your candidate profile, and manage your job search.'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FooterGroup
                links={[
                  ['Browse jobs', ROUTES.JOBS],
                  ['Pricing / Membership', ROUTES.PRICING],
                  ...(isHomePage
                    ? ([
                        ['Referral jobs', `${ROUTES.DASHBOARD_JOBS}?mode=referral`],
                        ['Internships', `${ROUTES.DASHBOARD_JOBS}?mode=internships`],
                        ['Fresher jobs', `${ROUTES.DASHBOARD_JOBS}?mode=fresher`],
                        ['Experienced jobs', `${ROUTES.DASHBOARD_JOBS}?mode=experienced`],
                      ] as Array<[string, string]>)
                    : []),
                ]}
                title="Jobs"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FooterGroup
                links={
                  isAuthenticated && currentUser?.role !== UserRole.Administrator
                    ? [
                        ['Dashboard', ROUTES.DASHBOARD],
                        ['Saved jobs', ROUTES.SAVED_JOBS],
                        ['Applications', ROUTES.APPLICATIONS],
                        ['Membership', ROUTES.MEMBERSHIP],
                      ]
                    : [
                        ['Create account', ROUTES.REGISTER],
                        ['Log in', ROUTES.LOGIN],
                        ...(isHomePage
                          ? ([
                              ['Career portfolio', ROUTES.PORTFOLIO],
                              ['Interview insights', ROUTES.INTERVIEW_INSIGHTS],
                              ['Career guidance', ROUTES.CAREER_GUIDANCE],
                            ] as Array<[string, string]>)
                          : []),
                      ]
                }
                title="Candidates"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FooterGroup
                links={[
                  ['About Us', ROUTES.ABOUT_US],
                  ['Contact Us', ROUTES.CONTACT_US],
                ]}
                title="Company"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 2 }}>
              <FooterGroup
                links={[
                  ['Terms of Use', ROUTES.TERMS_OF_USE],
                  ['Privacy Policy', ROUTES.PRIVACY_POLICY],
                  ['Refund and Cancellation Policy', ROUTES.REFUND_POLICY],
                  ['Grievance Redressal Policy', ROUTES.GRIEVANCE_POLICY],
                  ['Cookie Policy', ROUTES.COOKIE_POLICY],
                ]}
                title="Legal"
              />
              <SupportButton color="inherit" sx={{ color: 'rgba(255,255,255,.68)', justifyContent: 'flex-start', mt: 1, p: 0 }}>Help & Support</SupportButton>
              <CookieSettingsButton
                color="inherit"
                sx={{ color: 'rgba(255,255,255,.68)', justifyContent: 'flex-start', mt: 1, p: 0 }}
                variant="text"
              />
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,.12)', my: 4 }} />

          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography sx={{ color: 'rgba(255,255,255,.58)' }} variant="body2">
              © {new Date().getFullYear()} Career Harbor. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {socialLinks.map((social) => (
                <IconButton
                  aria-label={social.label}
                  component="a"
                  href={social.url}
                  key={social.label}
                  rel="noopener noreferrer"
                  size="medium"
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'scale(1.1)',
                      color: 'common.white',
                    },
                    color: 'rgba(255,255,255,.58)',
                    transition: 'all 0.2s ease-in-out',
                  }}
                  target="_blank"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

const FooterGroup = ({ links, title }: { links: Array<[string, string]>; title: string }) => (
  <Stack spacing={1.25}>
    <Typography fontWeight={800}>{title}</Typography>
    {links.map(([label, path]) => (
      <Typography
        component={Link}
        key={path}
        sx={{
          '&:hover': { color: 'common.white' },
          color: 'rgba(255,255,255,.68)',
          textDecoration: 'none',
        }}
        to={path}
        variant="body2"
      >
        {label}
      </Typography>
    ))}
  </Stack>
);
