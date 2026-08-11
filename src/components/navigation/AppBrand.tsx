import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

interface AppBrandProps {
  compact?: boolean;
  inverse?: boolean;
}

export const AppBrand = ({ compact = false, inverse = false }: AppBrandProps) => (
  <Box
    aria-label="Career Harbor home"
    alignItems="center"
    color={inverse ? 'common.white' : 'primary.main'}
    component={Link}
    sx={{ display: 'inline-flex', gap: compact ? 1 : 1.25, textDecoration: 'none' }}
    to={ROUTES.HOME}
  >
    <Box
      aria-hidden
      component="svg"
      viewBox="0 0 40 40"
      sx={{ flex: '0 0 auto', height: compact ? 28 : { xs: 31, md: 34 }, width: compact ? 28 : { xs: 31, md: 34 } }}
    >
      <path d="M20 2.5 35 11v18L20 37.5 5 29V11Z" fill="currentColor" opacity=".12" />
      <path d="M27.7 12.2a10.8 10.8 0 1 0 .1 15.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <path d="M17 20h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2" />
    </Box>
    <Typography component="span" fontSize={compact ? '1.05rem' : { xs: '1.15rem', md: '1.25rem' }} fontWeight={850} letterSpacing="-.025em">
      Career Harbor
    </Typography>
  </Box>
);
