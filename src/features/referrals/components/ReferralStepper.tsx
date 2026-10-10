import { Box, Stack, Typography } from '@mui/material';
export const ReferralStepper = ({
  steps,
  active = 0,
}: {
  steps: readonly [string, string][];
  active?: number;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    gap={{ xs: 1, sm: 0 }}
    alignItems={{ sm: 'center' }}
  >
    {steps.map(([title, subtitle], i) => (
      <Box
        key={title}
        aria-current={i === active ? 'step' : undefined}
        sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1.25, minWidth: 0 }}
      >
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            bgcolor: i <= active ? '#0061f5' : '#aab5c9',
            color: '#fff',
            borderRadius: '50%',
            width: 30,
            height: 30,
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {i < active ? '✓' : i + 1}
        </Box>
        <Box>
          <Typography fontSize={12} fontWeight={700}>
            {title}
          </Typography>
          <Typography fontSize={11} color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {i < steps.length - 1 && (
          <Box
            aria-hidden="true"
            sx={{
              display: { xs: 'none', sm: 'block' },
              height: 1,
              bgcolor: '#b9c8dc',
              mx: 1,
              flex: 1,
            }}
          />
        )}
      </Box>
    ))}
  </Stack>
);
