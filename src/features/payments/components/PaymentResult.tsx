import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PaymentResultProps {
  actions: Array<{ label: string; path: string; variant?: 'contained' | 'outlined' }>;
  description: string;
  icon: ReactNode;
  reference?: string;
  title: string;
}

export const PaymentResult = ({
  actions,
  description,
  icon,
  reference,
  title,
}: PaymentResultProps) => (
  <Paper component="section" sx={{ mx: 'auto', p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
    <Stack alignItems="center" spacing={2.5}>
      <Box aria-hidden>{icon}</Box>
      <Box>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        <Typography color="text.secondary" maxWidth={620} sx={{ mt: 1 }}>
          {description}
        </Typography>
      </Box>
      {reference ? (
        <Typography
          color="text.secondary"
          sx={{ maxWidth: '100%', overflowWrap: 'anywhere' }}
          variant="body2"
        >
          Payment reference: {reference}
        </Typography>
      ) : null}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        width={{ xs: '100%', sm: 'auto' }}
      >
        {actions.map((action) => (
          <Button
            component={Link}
            key={`${action.label}-${action.path}`}
            to={action.path}
            variant={action.variant ?? 'outlined'}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  </Paper>
);
