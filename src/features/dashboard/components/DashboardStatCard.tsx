import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardStatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export const DashboardStatCard = ({ icon, label, value }: DashboardStatCardProps) => (
  <Paper variant="outlined" sx={{ height: '100%', p: 1.5, borderRadius: 2.5, bgcolor: 'background.paper' }}>
    <Stack alignItems="center" direction="row" spacing={2}>
      <Box
        aria-hidden="true"
        sx={{
          alignItems: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
          color: 'primary.main',
          display: 'flex',
          height: 44,
          justifyContent: 'center',
          width: 44,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography component="p" fontWeight={800} variant="h5" aria-label={`${label}: ${typeof value === 'number' || typeof value === 'string' ? value : 'loading'}`}>
          {value}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);
