import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardStatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
}

export const DashboardStatCard = ({ icon, label, value }: DashboardStatCardProps) => (
  <Paper sx={{ height: '100%', p: 2.5 }}>
    <Stack alignItems="center" direction="row" spacing={2}>
      <Box
        aria-hidden="true"
        sx={{
          alignItems: 'center',
          bgcolor: 'primary.main',
          borderRadius: 2,
          color: 'primary.contrastText',
          display: 'flex',
          height: 44,
          justifyContent: 'center',
          width: 44,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography component="p" fontWeight={800} variant="h3">
          {value}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);
