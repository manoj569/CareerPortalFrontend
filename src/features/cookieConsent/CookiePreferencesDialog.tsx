import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { COOKIE_POLICY_PATH } from './cookieConsentLegal';
import { useCookieConsent } from './CookieConsentContext';

export const CookiePreferencesDialog = () => {
  const {
    activeOptionalCategories,
    closePreferences,
    consent,
    continueWithNecessary,
    hasSavedChoice,
    isPreferencesOpen,
    savePreferences,
  } = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const hasAnalytics = activeOptionalCategories.includes('analytics');

  useEffect(() => {
    if (isPreferencesOpen) setAnalytics(consent.analytics);
  }, [consent.analytics, isPreferencesOpen]);

  return (
    <Dialog
      aria-describedby="cookie-preferences-description"
      aria-labelledby="cookie-preferences-title"
      fullWidth
      maxWidth="sm"
      onClose={closePreferences}
      open={isPreferencesOpen}
    >
      <DialogTitle id="cookie-preferences-title">Cookie preferences</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography color="text.secondary" id="cookie-preferences-description">
            Review the browser storage Career Harbor uses. Essential storage supports account
            security and core portal operation and does not depend on consent.
          </Typography>
          <Stack spacing={0.75}>
            <FormControlLabel
              control={<Switch checked disabled inputProps={{ 'aria-label': 'Strictly necessary' }} />}
              label="Strictly necessary"
            />
            <Typography color="text.secondary" sx={{ pl: { sm: 6 } }} variant="body2">
              Always enabled. Used for secure login, registration verification, session continuity,
              and remembering your privacy preference.
            </Typography>
          </Stack>
          {hasAnalytics ? (
            <Stack spacing={0.75}>
              <FormControlLabel
                control={
                  <Switch
                    checked={analytics}
                    inputProps={{ 'aria-label': 'Analytics' }}
                    onChange={(event) => setAnalytics(event.target.checked)}
                  />
                }
                label="Analytics"
              />
              <Typography color="text.secondary" sx={{ pl: { sm: 6 } }} variant="body2">
                Allows the currently configured analytics service to measure platform usage.
              </Typography>
            </Stack>
          ) : (
            <Alert severity="info">
              No analytics, advertising, or personalization technology is currently active.
            </Alert>
          )}
          <Alert severity="info">
            Privacy preferences never sign you out or remove necessary authentication and security
            storage.
          </Alert>
          <Button href={COOKIE_POLICY_PATH} sx={{ alignSelf: 'flex-start' }} variant="text">
            Read the Cookie Policy
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, p: 2 }}>
        <Button fullWidth onClick={closePreferences} variant="outlined">
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={() =>
            hasAnalytics
              ? savePreferences({ analytics })
              : hasSavedChoice
                ? closePreferences()
                : continueWithNecessary()
          }
          variant="contained"
        >
          {hasAnalytics ? 'Save preferences' : hasSavedChoice ? 'Done' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
