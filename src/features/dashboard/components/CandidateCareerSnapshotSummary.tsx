import { Paper, Stack, Typography } from '@mui/material';
import { CareerStage, WorkPreference, type CandidateProfile } from '../types/dashboardModels';

const stageLabels = {
  [CareerStage.Student]: 'Student',
  [CareerStage.Fresher]: 'Fresher',
  [CareerStage.Experienced]: 'Experienced Professional',
};
const modeLabels = {
  [WorkPreference.Remote]: 'Remote',
  [WorkPreference.Hybrid]: 'Hybrid',
  [WorkPreference.OnSite]: 'On-site',
};

export const CandidateCareerSnapshotSummary = ({ profile }: { profile: CandidateProfile }) => {
  if (!profile.careerStage) return null;
  return (
    <Paper component="section" aria-label="Career snapshot" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Career snapshot
        </Typography>
        <Typography>Career stage: {stageLabels[profile.careerStage]}</Typography>
        {profile.primaryRole && <Typography>Primary role: {profile.primaryRole}</Typography>}
        {profile.careerStage === CareerStage.Experienced && profile.yearsOfExperience != null && (
          <Typography>Total experience: {profile.yearsOfExperience} years</Typography>
        )}
        {(profile.basicDetails?.currentCity ?? profile.location) && (
          <Typography>
            Current city: {profile.basicDetails?.currentCity ?? profile.location}
          </Typography>
        )}
        {Boolean(profile.workPreferences?.length) && (
          <Typography>
            Preferred work mode:{' '}
            {profile.workPreferences?.map((mode) => modeLabels[mode]).join(', ')}
          </Typography>
        )}
        <Typography color="text.secondary" variant="body2">
          Your skills and preferred roles are managed in the profile sections below.
        </Typography>
      </Stack>
    </Paper>
  );
};
