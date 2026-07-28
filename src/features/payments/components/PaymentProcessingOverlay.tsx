import { Backdrop, CircularProgress, Stack, Typography } from '@mui/material';

export const PaymentProcessingOverlay = ({ open }: { open: boolean }) => (
  <Backdrop
    aria-live="polite"
    open={open}
    sx={{ bgcolor: 'rgba(10, 18, 32, 0.72)', color: 'common.white', zIndex: 1400 }}
  >
    <Stack alignItems="center" spacing={2}>
      <CircularProgress color="inherit" />
      <Typography fontWeight={700}>Verifying your payment securely…</Typography>
    </Stack>
  </Backdrop>
);
