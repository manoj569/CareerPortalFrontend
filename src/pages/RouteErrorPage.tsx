import { Button, Container, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { reportFrontendError } from '@/monitoring/errorReporter';

const getErrorMessage = (error: unknown): string => {
  if (import.meta.env.DEV) {
    if (isRouteErrorResponse(error)) return error.statusText || 'The route could not be loaded.';
    if (error instanceof Error) return error.message;
  }
  return 'The route could not be loaded. Please return home and try again.';
};

export const RouteErrorPage = () => {
  const error = useRouteError();

  useEffect(() => {
    reportFrontendError(error, {
      boundary: 'route',
      routeStatus: isRouteErrorResponse(error) ? error.status : undefined,
    });
  }, [error]);

  return (
    <Container component="main" id="main-content" maxWidth="sm" tabIndex={-1}>
      <Stack alignItems="flex-start" minHeight="100vh" justifyContent="center" spacing={2}>
        <Typography color="error" fontWeight={700}>
          Route error
        </Typography>
        <Typography component="h1" variant="h2">
          We could not open this page
        </Typography>
        <Typography color="text.secondary">{getErrorMessage(error)}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button onClick={() => window.location.reload()} variant="contained">
            Reload page
          </Button>
          <Button component={Link} to={ROUTES.HOME} variant="outlined">
            Return home
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
