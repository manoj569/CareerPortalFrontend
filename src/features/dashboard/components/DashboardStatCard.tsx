import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardStatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

const statColors: Record<string, { color: string; tint: string }> = {
  'Saved jobs': { color: '#5d28d9', tint: '#f0eaff' },
  'Applied jobs': { color: '#0758d7', tint: '#e8f1ff' },
  'Pending referrals': { color: '#5035d2', tint: '#efebff' },
  'Insights published': { color: '#078b73', tint: '#e0f8f2' },
};

export const DashboardStatCard = ({ icon, label, value }: DashboardStatCardProps) => {
  const colors = statColors[label] ?? { color: '#0758d7', tint: '#e8f1ff' };
  return (
  <Stack alignItems="center" direction="row" spacing={1.25} sx={{ height: '100%', p: { xs: 1, sm: 1.25 } }}>
      <Box
        aria-hidden="true"
        sx={{
          alignItems: 'center',
          bgcolor: colors.tint,
          borderRadius: '50%',
          color: colors.color,
          display: 'flex',
          height: { xs: 40, sm: 46 },
          justifyContent: 'center',
          width: { xs: 40, sm: 46 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="p" fontWeight={800} variant="h5" aria-label={`${label}: ${typeof value === 'number' || typeof value === 'string' ? value : 'loading'}`} sx={{ lineHeight: 1.05 }}>
          {value}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
      </Box>
  </Stack>
  );
};
