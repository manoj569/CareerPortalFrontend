import { Button, Container, Stack, Typography } from '@mui/material';
import { Component, type ReactNode } from 'react';

import { reportFrontendError } from '@/monitoring/errorReporter';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error): void {
    reportFrontendError(error, { boundary: 'application' });
  }

  public override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <Container maxWidth="sm">
        <Stack alignItems="flex-start" minHeight="100vh" justifyContent="center" spacing={2}>
          <Typography component="h1" variant="h2">
            Something went wrong
          </Typography>
          <Typography color="text.secondary">
            The application encountered an unexpected problem. Reload the page to try again.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload application
          </Button>
        </Stack>
      </Container>
    );
  }
}
