import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

interface AppBrandProps {
  compact?: boolean;
  inverse?: boolean;
}

export const AppBrand = ({ compact = false, inverse = false }: AppBrandProps) => (
  <Box
    aria-label="Career Portal home"
    color={inverse ? 'common.white' : 'primary.main'}
    component={Link}
    sx={{ display: 'inline-flex', textDecoration: 'none' }}
    to={ROUTES.HOME}
  >
    <Typography component="span" fontSize={compact ? '1.05rem' : '1.2rem'} fontWeight={800}>
      Career Portal
    </Typography>
  </Box>
);
