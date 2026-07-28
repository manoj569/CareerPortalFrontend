import { Button, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

export const NotFoundPage = () => (
  <Container component="main" id="main-content" maxWidth="sm" tabIndex={-1}>
    <Stack alignItems="flex-start" minHeight="100vh" justifyContent="center" spacing={2}>
      <Typography color="primary" fontWeight={700}>
        404
      </Typography>
      <Typography component="h1" variant="h2">
        Page not found
      </Typography>
      <Typography color="text.secondary">
        The page may have moved, or the address may be incorrect. Check the URL or return home.
      </Typography>
      <Button component={Link} to={ROUTES.HOME} variant="contained">
        Return home
      </Button>
    </Stack>
  </Container>
);
