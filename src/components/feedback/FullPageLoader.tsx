import { Box } from '@mui/material';

import { LoadingIndicator } from './LoadingIndicator';

export const FullPageLoader = () => (
  <Box alignItems="center" display="flex" justifyContent="center" minHeight="100vh" width="100%">
    <LoadingIndicator label="Preparing your experience…" size={36} />
  </Box>
);
