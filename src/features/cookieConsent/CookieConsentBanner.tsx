import { Box, Button, Card, CardContent, Link as MuiLink, Stack, Typography } from '@mui/material';
import { ROUTES } from '@/constants/routes';
import { COOKIE_POLICY_PATH } from './cookieConsentLegal';
import { useCookieConsent } from './CookieConsentContext';

export const CookieConsentBanner = () => {
  const {
    acceptAll,
    activeOptionalCategories,
    continueWithNecessary,
    isBannerOpen,
    openPreferences,
    rejectAll,
  } = useCookieConsent();
  if (!isBannerOpen) return null;
  const hasOptionalCategories = activeOptionalCategories.length > 0;

  return (
    <Card
      aria-describedby="cookie-consent-description"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
      data-testid="cookie-consent-banner"
      role="region"
      sx={{
        bottom: { xs: 0, sm: 24 },
        boxShadow: { xs: '0 -10px 30px rgba(15,23,42,.16)', sm: '0 14px 40px rgba(15,23,42,.2)' },
        left: { xs: 0, sm: 24 },
        maxWidth: { xs: 'none', sm: 520 },
        position: 'fixed',
        right: { xs: 0, sm: 'auto' },
        width: { xs: '100%', sm: 'calc(100% - 48px)' },
        zIndex: (theme) => theme.zIndex.modal - 1,
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 3 }, '&:last-child': { pb: { xs: 2.25, sm: 3 } } }}>
        <Stack spacing={2}>
          <Box>
            <Typography component="h2" id="cookie-consent-title" variant="h3">
              Your privacy choices
            </Typography>
            <Typography color="text.secondary" id="cookie-consent-description" sx={{ mt: 1 }}>
              Career Harbor uses essential browser storage for secure login, registration
              verification and remembering your privacy preferences. See our Privacy Policy and
              Cookie Policy for details.
            </Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            <MuiLink href={ROUTES.PRIVACY_POLICY}>
              Privacy Policy
            </MuiLink>
            <MuiLink href={COOKIE_POLICY_PATH}>Cookie Policy</MuiLink>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button fullWidth onClick={openPreferences} variant="outlined">
              Manage preferences
            </Button>
            {hasOptionalCategories ? (
              <>
                <Button fullWidth onClick={rejectAll} variant="contained">
                  Reject all
                </Button>
                <Button fullWidth onClick={acceptAll} variant="contained">
                  Accept all
                </Button>
              </>
            ) : (
              <Button fullWidth onClick={continueWithNecessary} variant="contained">
                Continue
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
