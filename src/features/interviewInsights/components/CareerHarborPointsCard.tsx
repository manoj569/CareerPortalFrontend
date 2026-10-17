import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';

import type { CareerHarborPointsBalance } from '../types/interviewInsightModels';

const formatPoints = (value: number) => new Intl.NumberFormat('en-IN').format(value);

const breakdown = (balance: CareerHarborPointsBalance) =>
  [
    ['Candidate-confirmed referrals', balance.referralCandidateConfirmedPoints],
    ['Helpful Interview Insights', balance.interviewInsightHelpfulPoints],
    ['Referral opportunities shared', balance.referralOpportunitySharedPoints],
    ['Interview Insights published', balance.interviewInsightPublishedPoints],
  ] as const;

export const CareerHarborPointsCard = ({
  balance,
  compact = false,
}: {
  balance: CareerHarborPointsBalance;
  compact?: boolean;
}) => {
  const progress =
    balance.mentorEligibilityThreshold > 0
      ? Math.min(100, Math.max(0, (balance.totalPoints / balance.mentorEligibilityThreshold) * 100))
      : 0;
  const remaining = Math.max(0, balance.remainingPoints);

  return (
    <Paper
      elevation={0}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: compact ? 1.5 : 2.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <WorkspacePremiumOutlinedIcon color="primary" fontSize="small" />
        <Typography component="h2" fontWeight={750} variant={compact ? 'subtitle1' : 'h6'}>
          CareerHarbor Points
        </Typography>
        <Typography fontWeight={800} sx={{ ml: 'auto !important' }}>
          {formatPoints(balance.totalPoints)}
        </Typography>
      </Stack>
      {!compact && (
        <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
          Build your reputation by helping the community.
        </Typography>
      )}
      <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
        {formatPoints(balance.totalPoints)} / {formatPoints(balance.mentorEligibilityThreshold)}{' '}
        points
      </Typography>
      <LinearProgress
        aria-label="Mentor eligibility points progress"
        aria-valuemax={balance.mentorEligibilityThreshold}
        aria-valuemin={0}
        aria-valuenow={Math.min(
          Math.max(balance.totalPoints, 0),
          balance.mentorEligibilityThreshold,
        )}
        role="progressbar"
        sx={{ borderRadius: 10, height: 8, my: 1 }}
        value={progress}
        variant="determinate"
      />
      <Typography color="text.secondary" variant="body2">
        {balance.isPointsEligibleForMentor
          ? 'Mentor eligibility unlocked'
          : `${formatPoints(remaining)} points to Mentor eligibility`}
      </Typography>

      {balance.isPointsEligibleForMentor ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography fontWeight={700} variant="body2">
            You’ve reached the CareerHarbor contribution requirement.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Career Guidance is coming soon. Eligibility does not automatically make you an approved
            mentor; verification and onboarding are still required.
          </Typography>
        </Box>
      ) : null}

      {!compact && (
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight={700} variant="subtitle2">
            How you earned points
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {breakdown(balance).map(([label, value]) => (
              <Stack direction="row" justifyContent="space-between" key={label} spacing={2}>
                <Typography color="text.secondary" variant="body2">
                  {label}
                </Typography>
                <Typography fontWeight={650} variant="body2">
                  {formatPoints(value)} pts
                </Typography>
              </Stack>
            ))}
            <Stack
              borderTop={1}
              borderColor="divider"
              direction="row"
              justifyContent="space-between"
              pt={0.75}
            >
              <Typography fontWeight={700} variant="body2">
                Total
              </Typography>
              <Typography fontWeight={700} variant="body2">
                {formatPoints(balance.totalPoints)} pts
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export const POINT_EARNING_GUIDE = [
  ['Candidate confirms your referral', '+300'],
  ['Someone marks your insight Helpful', '+10'],
  ['Publish an Interview Insight', '+5'],
  ['Referral opportunity approved', '+5'],
] as const;
