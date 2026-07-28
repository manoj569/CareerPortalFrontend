import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  actions?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export const DashboardPageHeader = ({
  actions,
  description,
  eyebrow,
  title,
}: DashboardPageHeaderProps) => (
  <Stack
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    spacing={2}
    sx={{ minWidth: 0 }}
  >
    <Box sx={{ minWidth: 0 }}>
      {eyebrow ? (
        <Typography color="primary.main" fontWeight={700} variant="overline">
          {eyebrow}
        </Typography>
      ) : null}
      <Typography component="h1" variant="h1">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75 }}>
        {description}
      </Typography>
    </Box>
    {actions ? <Box sx={{ flexShrink: 0, maxWidth: '100%' }}>{actions}</Box> : null}
  </Stack>
);
