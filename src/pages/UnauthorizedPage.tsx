import { Button, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

export const UnauthorizedPage = () => (
  <Container component="main" id="main-content" maxWidth="sm" tabIndex={-1}>
    <Stack alignItems="flex-start" minHeight="100vh" justifyContent="center" spacing={2}>
      <Typography color="primary" fontWeight={700}>
        403
      </Typography>
      <Typography component="h1" variant="h2">
        Access denied
      </Typography>
      <Typography color="text.secondary">You do not have permission to view this page.</Typography>
      <Button component={Link} to={ROUTES.DASHBOARD} variant="contained">
        Return to dashboard
      </Button>
    </Stack>
  </Container>
);
