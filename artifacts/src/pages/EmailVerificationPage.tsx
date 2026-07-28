import { Alert, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';

export const EmailVerificationPage = () => (
  <Stack spacing={3}>
    <AuthPageHeader
      description="Email confirmation is not required by the current Career Portal account service."
      title="Email verification"
    />
    <Alert severity="info">
      This verification link cannot be processed because the current account service does not expose
      email verification or resend-verification operations.
    </Alert>
    <Button component={Link} to={ROUTES.LOGIN} variant="contained">
      Continue to login
    </Button>
  </Stack>
);
