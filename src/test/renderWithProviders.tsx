import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import { createAppStore, type RootState } from '@/store/store';
import { appTheme } from '@/theme/theme';

export const renderWithProviders = (ui: ReactElement, preloadedState?: Partial<RootState>) => {
  const store = createAppStore(preloadedState);

  return {
    store,
    ...render(
      <Provider store={store}>
        <ThemeProvider theme={appTheme}>
          <SnackbarProvider>{ui}</SnackbarProvider>
        </ThemeProvider>
      </Provider>,
    ),
  };
};
