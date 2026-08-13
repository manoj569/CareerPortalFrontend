import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { appConfig } from '@config/appConfig';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { AppErrorBoundary } from '@/components/feedback/AppErrorBoundary';
import { AuthInitializer } from '@/features/auth/components/AuthInitializer';
import { CookieConsentProvider } from '@/features/cookieConsent/CookieConsentProvider';
import { store } from '@/store/store';
import { appTheme } from '@/theme/theme';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <AppErrorBoundary>
    <ReduxProvider store={store}>
      <ThemeProvider theme={appTheme} defaultMode="light">
        <CssBaseline enableColorScheme />
        <SkipLink />
        <AuthInitializer />
        <CookieConsentProvider>
          <SnackbarProvider
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            autoHideDuration={appConfig.toastAutoHideDurationMs}
            maxSnack={3}
            preventDuplicate
          >
            {children}
          </SnackbarProvider>
        </CookieConsentProvider>
      </ThemeProvider>
    </ReduxProvider>
  </AppErrorBoundary>
);
