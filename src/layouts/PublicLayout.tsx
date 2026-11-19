import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import { SHOW_HOME_CAREER_GUIDANCE } from '@/constants/homeVisibility';
import { SupportButton } from '@/features/support/SupportButton';
import MenuIcon from '@mui/icons-material/Menu';
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
import { CareerHarborSocialLinks } from '@/components/navigation/CareerHarborSocialLinks';
import { NavigationList } from '@/components/navigation/NavigationList';
import type { NavigationItem } from '@/components/navigation/navigationTypes';
import { ROUTES } from '@/constants/routes';
import { PUBLIC_PAGE_CONTAINER_MAX_WIDTH, PUBLIC_PAGE_GUTTER } from '@/constants/publicLayout';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { CookieSettingsButton } from '@/features/cookieConsent/CookieSettingsButton';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

export const PublicLayout = () => {
  const location = useLocation();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const authenticatedHome =
    currentUser?.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD;

  const isHomePage = location.pathname === ROUTES.HOME;
  const isEmployerHomePage = location.pathname === ROUTES.EMPLOYERS;
  const isWideLandingPage = isHomePage || isEmployerHomePage;

  const mobileNavigation: NavigationItem[] = isAuthenticated
    ? [{ label: 'Dashboard', path: authenticatedHome }]
    : [
        { label: 'Home', path: ROUTES.HOME },
        { label: 'Jobs', path: ROUTES.JOBS },
        ...(isHomePage
          ? [
              ...(SHOW_HOME_CAREER_GUIDANCE
                ? [{ label: 'Career Guidance', path: ROUTES.CAREER_GUIDANCE }]
                : []),
              { label: 'For Employers', path: ROUTES.EMPLOYERS },
            ]
          : []),
        { label: 'Log in', path: ROUTES.LOGIN },
        {
          label: 'Register',
          path: isEmployerHomePage ? ROUTES.EMPLOYER_REGISTER : ROUTES.REGISTER,
        },
      ];

  const homepageNavigation: NavigationItem[] = [
    { label: 'Home', path: ROUTES.HOME, icon: HomeOutlinedIcon, end: true },
    { label: 'Browse Jobs', path: ROUTES.JOBS, icon: WorkOutlineIcon },
    {
      label: 'Employee Referrals',
      path: `${ROUTES.DASHBOARD_JOBS}?mode=referral`,
      icon: GroupAddOutlinedIcon,
    },
    {
      label: 'Interview Insights',
      path: ROUTES.INTERVIEW_INSIGHTS,
      icon: QuestionAnswerOutlinedIcon,
    },
    {
      label: 'Create Portfolio',
      path: ROUTES.PORTFOLIO,
      icon: WebOutlinedIcon,
    },
  ];

  const closeMobileNavigation = (restoreFocus = true) => {
    setIsMobileNavigationOpen(false);

    if (restoreFocus) {
      window.setTimeout(() => menuButtonRef.current?.focus(), 0);
    }
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
          ...(isWideLandingPage
            ? {
                '@media (max-width:1199.95px)': {
                  '& a:focus-visible, & button:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                },
              }
            : {}),
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: isWideLandingPage ? 'none' : PUBLIC_PAGE_CONTAINER_MAX_WIDTH,
            paddingInline: isWideLandingPage
              ? {
                  xs: '8px !important',
                  sm: 'clamp(20px, 5vw, 96px) !important',
                  lg: 'clamp(20px, 5vw, 96px) !important',
                }
              : `${PUBLIC_PAGE_GUTTER} !important`,
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: isWideLandingPage ? { xs: 68, md: 76 } : { xs: 74, md: 88 },
            }}
          >
            <Box
              sx={
                isWideLandingPage
                  ? {
                      display: { xs: 'block', lg: 'contents' },
                      flexShrink: 0,
                      '& > a': {
                        minHeight: { xs: 44, lg: 'auto' },
                        gap: { xs: 0.5, sm: 1.25 },
                      },
                      '& svg': {
                        width: { xs: 24, sm: 31, md: 34 },
                        height: { xs: 24, sm: 31, md: 34 },
                      },
                      '& span': {
                        fontSize: {
                          xs: '0.875rem',
                          sm: '1.15rem',
                          md: '1.25rem',
                        },
                        whiteSpace: 'nowrap',
                      },
                    }
                  : { display: 'contents' }
              }
            >
              <AppBrand />
            </Box>

            {/* DESKTOP NAVIGATION */}
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                display: isWideLandingPage
                  ? { xs: 'none', lg: 'flex' }
                  : { xs: 'none', md: 'flex' },
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
                      {SHOW_HOME_CAREER_GUIDANCE && (
                        <Button component={NavLink} to={ROUTES.CAREER_GUIDANCE}>
                          Career Guidance
                        </Button>
                      )}

                      <Button component={NavLink} to={ROUTES.EMPLOYERS}>
                        For Employers
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
                    to={isEmployerHomePage ? ROUTES.EMPLOYER_REGISTER : ROUTES.REGISTER}
                    variant="contained"
                  >
                    Register
                  </Button>
                </>
              )}
            </Stack>

            {/* MOBILE LANDING PAGE ACTIONS */}
            {isWideLandingPage && (
              <Stack
                direction="row"
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  ml: 'auto',
                  gap: { xs: 0.1, sm: 0.5 },
                  alignItems: 'center',
                  flexShrink: 0,
                  '& .MuiButton-root': {
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                {isAuthenticated ? (
                  <Button
                    component={NavLink}
                    to={authenticatedHome}
                    sx={{
                      minHeight: 44,
                      px: 0.5,
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    {isHomePage && (
                      <Button
                        component={NavLink}
                        to={ROUTES.EMPLOYERS}
                        sx={{
                          minWidth: 0,
                          minHeight: 44,
                          px: { xs: 0.35, sm: 1 },
                          fontSize: { xs: '0.66rem', sm: '0.875rem' },
                          fontWeight: 700,
                        }}
                      >
                        Employers
                      </Button>
                    )}

                    <Button
                      component={NavLink}
                      to={ROUTES.LOGIN}
                      sx={{
                        minWidth: 0,
                        minHeight: 44,
                        px: { xs: 0.35, sm: 1 },
                        fontSize: { xs: '0.66rem', sm: '0.875rem' },
                      }}
                    >
                      Log in
                    </Button>

                    <Button
                      component={NavLink}
                      to={isEmployerHomePage ? ROUTES.EMPLOYER_REGISTER : ROUTES.REGISTER}
                      variant="contained"
                      sx={{
                        minWidth: 0,
                        minHeight: { xs: 38, sm: 44 },
                        px: { xs: 0.65, sm: 1 },
                        fontSize: { xs: '0.66rem', sm: '0.875rem' },
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Stack>
            )}

            {/* MOBILE MENU BUTTON */}
            <IconButton
              aria-controls="public-mobile-navigation"
              aria-expanded={isMobileNavigationOpen}
              aria-label="Open main navigation"
              edge="end"
              onClick={() => setIsMobileNavigationOpen(true)}
              ref={menuButtonRef}
              sx={{
                display: isWideLandingPage ? { lg: 'none' } : { md: 'none' },
                ml: isWideLandingPage ? 0.25 : 'auto',
                minWidth: 44,
                minHeight: 44,
                ...(isWideLandingPage ? { mr: 0 } : {}),
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        ModalProps={{
          disableRestoreFocus: true,
          keepMounted: true,
        }}
        onClose={() => closeMobileNavigation()}
        open={isMobileNavigationOpen}
        slotProps={{
          paper: {
            'aria-label': 'Main navigation drawer',
            id: 'public-mobile-navigation',
            sx: {
              p: 2,
              width: { xs: 'min(88vw, 320px)', sm: 320 },
              boxSizing: 'border-box',
              overflowY: 'auto',
              '& a:focus-visible, & button:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 2,
            px: 1,
            flexShrink: 0,
          }}
        >
          <AppBrand compact />

          <Button sx={{ minHeight: 44 }} onClick={() => closeMobileNavigation()}>
            Close
          </Button>
        </Stack>

        <NavigationList
          ariaLabel="Mobile primary navigation"
          items={isHomePage && !isAuthenticated ? homepageNavigation : mobileNavigation}
          onNavigate={() => closeMobileNavigation(false)}
        />

        {isHomePage && !isAuthenticated && (
          <Stack spacing={1.5} sx={{ flexShrink: 0, pt: 1 }}>
            <Divider />

            <Typography variant="overline" color="text.secondary">
              Your account
            </Typography>

            <Button
              component={NavLink}
              to={ROUTES.LOGIN}
              variant="outlined"
              sx={{ minHeight: 44 }}
              onClick={() => closeMobileNavigation(false)}
            >
              Log in
            </Button>

            <Button
              component={NavLink}
              to={ROUTES.REGISTER}
              variant="contained"
              sx={{ minHeight: 44 }}
              onClick={() => closeMobileNavigation(false)}
            >
              Register for free
            </Button>
          </Stack>
        )}
      </Drawer>

      {/* PAGE CONTENT */}
      <Container
        component="main"
        id="main-content"
        maxWidth={isWideLandingPage ? false : 'lg'}
        sx={{
          flex: 1,
          minWidth: 0,
          ...(isWideLandingPage ? { px: '0 !important' } : {}),
          py: isWideLandingPage ? 0 : { xs: 4, md: 6 },
        }}
        tabIndex={-1}
      >
        <Outlet />
      </Container>

      {/* FOOTER */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#111827',
          color: 'common.white',
          mt: isWideLandingPage ? 0 : { xs: 6, md: 8 },
          py: { xs: 6, md: 8 },
        }}
      >
        <Container
          maxWidth={isWideLandingPage ? false : 'lg'}
          sx={
            isWideLandingPage
              ? {
                  maxWidth: 'none',
                  paddingInline: 'clamp(20px, 5vw, 96px) !important',
                }
              : undefined
          }
        >
          <Grid container spacing={{ xs: 4, md: 7 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <AppBrand inverse />

              <Typography
                sx={{
                  color: 'rgba(255,255,255,.68)',
                  lineHeight: 1.7,
                  maxWidth: 420,
                  mt: 2,
                }}
              >
                {isHomePage
                  ? 'A complete career growth platform with jobs, referrals, interview insights, guidance and a professional portfolio.'
                  : isEmployerHomePage
                    ? 'Find, evaluate and hire the right candidates with CareerHarbor.'
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
                              ...(SHOW_HOME_CAREER_GUIDANCE
                                ? [['Career guidance', ROUTES.CAREER_GUIDANCE] as [string, string]]
                                : []),
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

              <SupportButton
                color="inherit"
                sx={{
                  color: 'rgba(255,255,255,.68)',
                  justifyContent: 'flex-start',
                  mt: 1,
                  p: 0,
                }}
              >
                Help & Support
              </SupportButton>

              <CookieSettingsButton
                color="inherit"
                sx={{
                  color: 'rgba(255,255,255,.68)',
                  justifyContent: 'flex-start',
                  mt: 1,
                  p: 0,
                }}
                variant="text"
              />
            </Grid>
          </Grid>

          <Divider
            sx={{
              borderColor: 'rgba(255,255,255,.12)',
              my: 4,
            }}
          />

          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography sx={{ color: 'rgba(255,255,255,.58)' }} variant="body2">
              © {new Date().getFullYear()} Career Harbor. All rights reserved.
            </Typography>

            <CareerHarborSocialLinks footer />
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

const FooterGroup = ({
  links,
  title,
}: {
  links: Array<[string, string]>;
  title: string;
}) => (
  <Stack spacing={1.25}>
    <Typography fontWeight={800}>{title}</Typography>

    {links.map(([label, path]) => (
      <Typography
        component={Link}
        key={path}
        sx={{
          '&:hover': {
            color: 'common.white',
          },
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