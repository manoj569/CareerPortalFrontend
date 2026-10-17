import { Box, Paper, Stack, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

import { CareerHarborPointsCard } from '@/features/interviewInsights/components/CareerHarborPointsCard';
import type { CareerHarborPointsBalance } from '@/features/interviewInsights/types/interviewInsightModels';

export const CareerGuidanceComingSoonPage = ({
  balance,
}: {
  balance?: CareerHarborPointsBalance | null;
}) => (
  <Stack spacing={3} sx={{ maxWidth: 760, mx: 'auto', py: { xs: 2, md: 5 } }}>
    <Paper
      elevation={0}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: { xs: 2.5, md: 4 } }}
    >
      <Stack alignItems="center" direction="row" spacing={1.5}>
        <SchoolOutlinedIcon color="primary" fontSize="large" />
        <Box>
          <Typography component="h1" variant="h4">
            Career Guidance
          </Typography>
          <Typography color="primary" fontWeight={750} variant="overline">
            Coming soon
          </Typography>
        </Box>
      </Stack>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Help candidates with your experience and build your reputation. Earn CareerHarbor Points by
        helping candidates; reach 3,000 points to become eligible for Mentor onboarding.
      </Typography>
      {balance ? (
        <Box sx={{ mt: 3 }}>
          <CareerHarborPointsCard balance={balance} />
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
          Mentor eligibility is not automatic approval. Verification and onboarding will still be
          required.
        </Typography>
      )}
    </Paper>
  </Stack>
);
