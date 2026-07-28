import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

import { AppBrand } from '@/components/navigation/AppBrand';
import { ROUTES } from '@/constants/routes';

export const AuthLayout = () => (
  <Box
    alignItems="center"
    component="main"
    display="flex"
    id="main-content"
    minHeight="100vh"
    sx={{ bgcolor: 'background.default', minWidth: 0, py: { xs: 2, sm: 4 } }}
    tabIndex={-1}
  >
    <Container maxWidth="sm">
      <Stack alignItems="center" spacing={3}>
        <AppBrand />
        <Paper sx={{ minWidth: 0, p: { xs: 2, sm: 5 }, width: '100%' }}>
          <Outlet />
        </Paper>
        <Button component={Link} startIcon={<ArrowBackIcon />} to={ROUTES.HOME}>
          Back to home
        </Button>
        <Typography color="text.secondary" textAlign="center" variant="caption">
          Secure access to your Career Portal account
        </Typography>
      </Stack>
    </Container>
  </Box>
);
