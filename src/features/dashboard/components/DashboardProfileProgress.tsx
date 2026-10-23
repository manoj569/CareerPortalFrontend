import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { Alert, Box, Button, Chip, Grid, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import type { CandidateProfileCompletion, ProfileCompletionStep } from '@/features/dashboard/types/dashboardModels';
import { isSectionCompleted, isSectionMissing, profileSteps, recommendedStep } from '@/features/dashboard/utils/profileCompletion';

const profileStepActions: Record<ProfileCompletionStep, { label: string; path: string }> = {
  BasicDetails: { label: 'Add basic details', path: `${ROUTES.PORTFOLIO}?tab=profile&action=basic-details` },
  Skills: { label: 'Add skills', path: `${ROUTES.PORTFOLIO}?tab=profile&action=basic-details` },
  CareerPreferences: { label: 'Add career preferences', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-career-preferences` },
  Education: { label: 'Add education', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-education` },
  Employment: { label: 'Add employment', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-employment` },
  Resume: { label: 'Upload resume', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-resume` },
  ProfileSummary: { label: 'Add profile summary', path: `${ROUTES.PORTFOLIO}?tab=profile#candidate-profile-about` },
};

interface DashboardProfileProgressProps {
  completion?: CandidateProfileCompletion;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const DashboardProfileProgress = ({ completion, isLoading, isError, onRetry }: DashboardProfileProgressProps) => {
  if (isLoading) return <Paper component="section" aria-label="Profile progress loading" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5 }}><Skeleton width="30%" /><Skeleton height={10} /><Skeleton width="70%" /></Paper>;
  if (isError || !completion) return <Alert severity="info" action={<Button onClick={onRetry}>Retry</Button>}>Profile progress is temporarily unavailable.</Alert>;

  const percent = Math.min(100, Math.max(0, completion.completionPercentage));
  const nextStep = recommendedStep(completion);
  const completedCount = profileSteps.filter((step) => isSectionCompleted(completion, step.value)).length;

  return (
    <Paper component="section" aria-labelledby="dashboard-profile-progress" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, borderColor: '#dce5f5', boxShadow: '0 3px 12px rgba(37,76,145,.055)' }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            <Box sx={{ display: 'grid', placeItems: 'center', flex: '0 0 42px', width: 42, height: 42, borderRadius: '50%', bgcolor: '#e4efff', color: 'primary.main' }}><PersonOutlineRoundedIcon aria-hidden="true" sx={{ fontSize: 25 }} /></Box>
            <Box minWidth={0}>
              <Typography id="dashboard-profile-progress" component="h2" variant="h6" fontWeight={800}>Profile progress</Typography>
              <Typography variant="body2" color="text.secondary">Complete your profile to get better job recommendations.</Typography>
            </Box>
          </Stack>
          <Typography color="primary.main" fontWeight={850} variant="h6" aria-label={`Profile ${percent}% complete`} sx={{ fontSize: '1.15rem' }}>{percent}%</Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
          <LinearProgress variant="determinate" value={percent} aria-label={`Profile ${percent}% complete`} sx={{ flex: 1, height: 9, borderRadius: 99, bgcolor: '#e5ebf4', '& .MuiLinearProgress-bar': { borderRadius: 99 } }} />
          {nextStep && <Button component={Link} to={profileStepActions[nextStep.value].path} variant="contained" sx={{ minHeight: 42, px: 2.25, borderRadius: 2, alignSelf: { xs: 'stretch', sm: 'auto' }, whiteSpace: 'nowrap' }}>Continue profile</Button>}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
          {completedCount} of {profileSteps.length} sections complete{nextStep ? ` · Next: ${nextStep.label}` : ''}
        </Typography>
        <Grid container spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {profileSteps.map((step) => {
            const complete = isSectionCompleted(completion, step.value);
            const missing = isSectionMissing(completion, step.value);
            return <Grid key={step.value} size={{ sm: 6, md: 3, lg: 'auto' }} sx={{ flex: { lg: '1 1 0' } }}>
              <Chip
                size="small"
                variant={complete ? 'filled' : 'outlined'}
                color={complete ? 'success' : missing ? 'default' : 'primary'}
                icon={complete ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
                label={step.label}
                aria-label={`${step.label}: ${complete ? 'complete' : missing ? 'incomplete' : 'not marked complete'}`}
                sx={{ maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
            </Grid>;
          })}
        </Grid>

        {nextStep ? <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Continue with {nextStep.label.toLowerCase()}.</Typography> : <Typography variant="body2" color="success.dark" fontWeight={600}>Your profile is complete.</Typography>}
      </Stack>
    </Paper>
  );
};
