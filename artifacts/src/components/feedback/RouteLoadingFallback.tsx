import { Box } from '@mui/material';

import { LoadingIndicator } from './LoadingIndicator';

export const RouteLoadingFallback = () => (
  <Box alignItems="center" display="flex" justifyContent="center" minHeight={280} role="status">
    <LoadingIndicator label="Loading page…" />
  </Box>
);
