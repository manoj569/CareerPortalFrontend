import { Box, Stack, Typography, LinearProgress } from '@mui/material';
import type { JobReferralSubmission } from '../types/referralModels';
export const OpportunityCapacity = ({ job }: { job: JobReferralSubmission }) => (
  <Box sx={{ minWidth: 170 }}>
    <Stack direction="row" justifyContent="space-between" gap={1}>
      <Typography fontSize={12}>
        {job.acceptedReferralCount} / {job.referralSlots} Accepted
      </Typography>
      <Typography fontSize={12}>
        {job.remainingReferralSlots} {job.remainingReferralSlots === 1 ? 'slot' : 'slots'} remaining
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={
        job.referralSlots ? Math.min(100, (100 * job.acceptedReferralCount) / job.referralSlots) : 0
      }
      sx={{
        mt: 1,
        height: 7,
        borderRadius: 3,
        bgcolor: '#e4eaf1',
        '& .MuiLinearProgress-bar': { bgcolor: '#16b263' },
      }}
    />
  </Box>
);
