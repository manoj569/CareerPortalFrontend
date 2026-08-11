import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import {
  useGetOnboardingQuery,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
} from '@/features/dashboard/api/dashboardApi';
import {
  AdditionalProfileDetailsCard,
  type AdditionalProfileDetailsCardHandle,
} from '@/features/dashboard/components/AdditionalProfileDetailsCard';
import {
  CandidateAboutCard,
  type CandidateAboutCardHandle,
} from '@/features/dashboard/components/CandidateAboutCard';
import {
  CandidateResumeCard,
  type CandidateResumeCardHandle,
} from '@/features/dashboard/components/CandidateResumeCard';
import {
  CandidateSkillsCard,
  type CandidateSkillsCardHandle,
} from '@/features/dashboard/components/CandidateSkillsCard';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  CareerStage,
  DesiredOpportunity,
  WorkPreference,
  type CandidateOnboarding,
  type CandidateProfileCompletion,
} from '@/features/dashboard/types/dashboardModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const sectionLabels: Record<string, string> = {
  basicDetails: 'Basic candidate details',
  careerPreferences: 'Career preferences',
  profileSummary: 'Profile summary',
  resume: 'Resume',
  resumeHeadline: 'Resume headline',
  skills: 'Key skills',
};

export const ProfilePage = () => {
  useDocumentMetadata(
    'Candidate Profile | Career Harbor',
    'Complete and maintain your Career Harbor candidate profile, resume, skills, and career preferences.',
  );
  const profile = useGetProfileQuery();
  const completion = useGetProfileCompletionQuery();
  const onboarding = useGetOnboardingQuery();
  const aboutRef = useRef<CandidateAboutCardHandle>(null);
  const skillsRef = useRef<CandidateSkillsCardHandle>(null);
  const resumeRef = useRef<CandidateResumeCardHandle>(null);
  const additionalDetailsRef = useRef<AdditionalProfileDetailsCardHandle>(null);

  if (profile.isLoading) {
    return (
      <Stack aria-label="Loading profile" role="status" spacing={3}>
        <Skeleton height={76} variant="rounded" />
        <Skeleton height={220} variant="rounded" />
        <Skeleton height={320} variant="rounded" />
      </Stack>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <ErrorState
        description="Your candidate profile could not be loaded from the server."
        headingLevel="h1"
        onRetry={() => void profile.refetch()}
        title="Profile is temporarily unavailable"
      />
    );
  }

  const candidate = profile.data;
  const percentage = completion.data?.completionPercentage;

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Keep the details employers need and follow clear next steps to complete your profile."
        eyebrow="Candidate account"
        title="Candidate profile"
      />

      <Paper component="section" sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Stack
          alignItems={{ xs: 'flex-start', md: 'center' }}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2.5}
        >
          <Stack minWidth={0} spacing={0.5}>
            <Typography component="h2" variant="h3">
              {candidate.firstName} {candidate.lastName}
            </Typography>
            <Typography color="text.secondary">{candidate.email}</Typography>
            {candidate.location ? (
              <Typography color="text.secondary" variant="body2">
                {candidate.location}
              </Typography>
            ) : null}
            {candidate.headline ? (
              <Typography fontWeight={700} sx={{ pt: 0.5 }}>
                {candidate.headline}
              </Typography>
            ) : null}
          </Stack>
          <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
            {percentage === undefined ? (
              <Typography color="text.secondary">Profile completion unavailable</Typography>
            ) : (
              <Typography fontWeight={850} variant="h3">
                {percentage}% complete
              </Typography>
            )}
            <Button onClick={() => aboutRef.current?.openEditor()} variant="contained">
              Edit headline and summary
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {completion.isLoading ? (
        <Skeleton aria-label="Loading profile completion" height={230} variant="rounded" />
      ) : completion.isError || !completion.data ? (
        <Paper component="section" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack alignItems="flex-start" spacing={1.5}>
            <Alert severity="error">Profile completion guidance is temporarily unavailable.</Alert>
            <Button onClick={() => void completion.refetch()} variant="outlined">
              Retry profile completion
            </Button>
          </Stack>
        </Paper>
      ) : (
        <ProfileCompletionCard
          completion={completion.data}
          onAbout={() => aboutRef.current?.openEditor()}
          onBasicDetails={() => additionalDetailsRef.current?.focusEditor()}
          onResume={() => resumeRef.current?.chooseFile()}
          onSkills={() => skillsRef.current?.focusSection()}
        />
      )}

      <CandidateAboutCard profile={candidate} ref={aboutRef} />
      <CandidateSkillsCard ref={skillsRef} />
      <CandidateResumeCard ref={resumeRef} resume={candidate.resume} />

      <Paper component="section" sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography component="h2" variant="h3">
              Career preferences
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Keep the opportunities and work settings you are looking for up to date.
            </Typography>
          </Stack>
          {onboarding.isLoading ? (
            <Skeleton aria-label="Loading career preferences" height={72} variant="rounded" />
          ) : onboarding.isError ? (
            <Alert severity="warning">Your career-preferences summary is unavailable.</Alert>
          ) : onboarding.data ? (
            <CareerPreferencesSummary data={onboarding.data} />
          ) : null}
          <Button component={Link} sx={{ alignSelf: 'flex-start' }} to={ROUTES.ONBOARDING} variant="outlined">
            Manage career preferences
          </Button>
        </Stack>
      </Paper>

      <AdditionalProfileDetailsCard profile={candidate} ref={additionalDetailsRef} />
    </Stack>
  );
};

interface ProfileCompletionCardProps {
  completion: CandidateProfileCompletion;
  onAbout: () => void;
  onBasicDetails: () => void;
  onResume: () => void;
  onSkills: () => void;
}

const ProfileCompletionCard = ({
  completion,
  onAbout,
  onBasicDetails,
  onResume,
  onSkills,
}: ProfileCompletionCardProps) => (
  <Paper component="section" sx={{ p: { xs: 2.5, sm: 3 } }}>
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography component="h2" variant="h3">
            Profile completion
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            {completion.completedSections.length} of {completion.sections.length} sections complete
          </Typography>
        </Box>
        <Typography fontWeight={850}>{completion.completionPercentage}%</Typography>
      </Stack>
      <LinearProgress
        aria-label={`Profile completion: ${completion.completionPercentage}%`}
        value={completion.completionPercentage}
        variant="determinate"
      />
      {completion.missingSections.length ? (
        <Stack spacing={1.5}>
          <Typography fontWeight={800}>Recommended next steps</Typography>
          <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {completion.missingSections.map((section) => (
              <Stack
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                component="li"
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                key={section}
                spacing={1}
                sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}
              >
                <Typography>{sectionLabels[section] ?? section}</Typography>
                <MissingSectionAction
                  onAbout={onAbout}
                  onBasicDetails={onBasicDetails}
                  onResume={onResume}
                  onSkills={onSkills}
                  section={section}
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      ) : (
        <Alert severity="success">Your Phase 1 candidate profile sections are complete.</Alert>
      )}
    </Stack>
  </Paper>
);

const MissingSectionAction = ({
  onAbout,
  onBasicDetails,
  onResume,
  onSkills,
  section,
}: Omit<ProfileCompletionCardProps, 'completion'> & { section: string }) => {
  if (section === 'resumeHeadline' || section === 'profileSummary') {
    return <Button onClick={onAbout}>Edit about</Button>;
  }
  if (section === 'skills') return <Button onClick={onSkills}>Add skills</Button>;
  if (section === 'resume') return <Button onClick={onResume}>Upload resume</Button>;
  if (section === 'careerPreferences') {
    return (
      <Button component={Link} to={ROUTES.ONBOARDING}>
        Add preferences
      </Button>
    );
  }
  if (section === 'basicDetails') {
    return <Button onClick={onBasicDetails}>Review profile details</Button>;
  }
  return null;
};

const CareerPreferencesSummary = ({
  data,
}: {
  data: CandidateOnboarding | undefined;
}) => {
  if (!data) return null;
  const values = [
    data.careerStage ? careerStageLabels[data.careerStage] : null,
    data.city,
    ...data.desiredOpportunities.map((value) => desiredOpportunityLabels[value]),
    ...data.workPreferences.map((value) => workPreferenceLabels[value]),
  ].filter((value): value is string => Boolean(value));

  return values.length ? (
    <Stack aria-label="Career preferences summary" direction="row" flexWrap="wrap" gap={1}>
      {values.map((value) => (
        <Chip key={value} label={value} />
      ))}
    </Stack>
  ) : (
    <Typography color="text.secondary">No career preferences have been completed yet.</Typography>
  );
};

const careerStageLabels: Record<CareerStage, string> = {
  [CareerStage.Student]: 'Student',
  [CareerStage.Fresher]: 'Fresher',
  [CareerStage.Experienced]: 'Experienced',
};

const desiredOpportunityLabels: Record<DesiredOpportunity, string> = {
  [DesiredOpportunity.Internship]: 'Internships',
  [DesiredOpportunity.FresherJob]: 'Fresher jobs',
  [DesiredOpportunity.ExperiencedJob]: 'Experienced roles',
};

const workPreferenceLabels: Record<WorkPreference, string> = {
  [WorkPreference.Remote]: 'Remote',
  [WorkPreference.Hybrid]: 'Hybrid',
  [WorkPreference.OnSite]: 'On-site',
};
