import { Stack } from '@mui/material';

import { LoadingIndicator } from './LoadingIndicator';

/** Initial page/section loading only; background refetches keep existing content visible. */
export const PageLoadingIndicator = ({ label = 'Loading…', compact = false }: { label?: string; compact?: boolean }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{ width: '100%', minHeight: compact ? 120 : 'min(50dvh, 420px)', py: 4, px: 2 }}
  >
    <LoadingIndicator label={label} size={36} />
  </Stack>
);
