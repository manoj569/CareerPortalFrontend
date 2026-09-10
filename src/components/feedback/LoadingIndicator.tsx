import { CircularProgress, Stack, Typography } from '@mui/material';

interface LoadingIndicatorProps {
  label?: string;
  size?: number;
}

export const LoadingIndicator = ({ label = 'Loading…', size = 28 }: LoadingIndicatorProps) => (
  <Stack aria-busy="true" alignItems="center" direction="row" gap={1.5} role="status">
    <CircularProgress aria-hidden size={size} />
    <Typography color="text.secondary">{label}</Typography>
  </Stack>
);
