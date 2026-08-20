import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useRef, type ReactNode } from 'react';
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
  type UserProfile,
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

interface CandidateProfileContentProps {
  hidePageHeader?: boolean;
  onPreviewPortfolio?: () => void;
  publicPortfolioCard?: ReactNode;
}

export const ProfilePage = () => {
  useDocumentMetadata(
    'Candidate Profile | Career Harbor',
    'Complete and maintain your Career Harbor candidate profile, resume, skills, and career preferences.',
  );
  return <CandidateProfileContent />;
};

export const CandidateProfileContent = ({
  hidePageHeader = false,
  onPreviewPortfolio,
  publicPortfolioCard,
}: CandidateProfileContentProps) => {
  const profile = useGetProfileQuery();
  const completion = useGetProfileCompletionQuery();
  const onboarding = useGetOnboardingQuery();
  const aboutRef = useRef<CandidateAboutCardHandle>(null);
  const skillsRef = useRef<CandidateSkillsCardHandle>(null);
  const resumeRef = useRef<CandidateResumeCardHandle>(null);
  const additionalDetailsRef = useRef<AdditionalProfileDetailsCardHandle>(null);

  if (profile.isLoading) {
    return (
      <Grid aria-label="Loading profile" container role="status" spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}><Skeleton height={230} variant="rounded" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Skeleton height={230} variant="rounded" /></Grid>
        <Grid size={{ xs: 12, md: 8 }}><Skeleton height={260} variant="rounded" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Skeleton height={260} variant="rounded" /></Grid>
      </Grid>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <ErrorState
        description="Your candidate profile could not be loaded from the server."
        headingLevel={hidePageHeader ? 'h2' : 'h1'}
        onRetry={() => void profile.refetch()}
        title="Profile is temporarily unavailable"
      />
    );
  }

  const candidate = profile.data;

  return (
    <Stack spacing={hidePageHeader ? 0 : 3}>
      {hidePageHeader ? null : (
        <DashboardPageHeader
          description="Keep the details employers need and follow clear next steps to complete your profile."
          eyebrow="Candidate account"
          title="Candidate profile"
        />
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ order: 1 }}>
          <IdentityCard
            candidate={candidate}
            completionPercentage={completion.data?.completionPercentage}
            onEdit={() => aboutRef.current?.openEditor()}
            onPreviewPortfolio={onPreviewPortfolio}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: 2 }}>
          <ProfileStrengthCard
            completion={completion.data}
            isError={completion.isError}
            isLoading={completion.isLoading}
            onAbout={() => aboutRef.current?.openEditor()}
            onBasicDetails={() => additionalDetailsRef.current?.focusEditor()}
            onResume={() => resumeRef.current?.chooseFile()}
            onRetry={() => void completion.refetch()}
            onSkills={() => skillsRef.current?.focusSection()}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ order: 3 }}>
          <CandidateAboutCard profile={candidate} ref={aboutRef} />
        </Grid>
        {publicPortfolioCard ? (
          <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 7, md: 4 } }}>
            {publicPortfolioCard}
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 4, md: 5 } }}>
          <CandidateSkillsCard ref={skillsRef} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 5, md: 6 } }}>
          <CandidateResumeCard ref={resumeRef} resume={candidate.resume} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 6, md: 7 } }}>
          <CareerPreferencesCard onboarding={onboarding} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: 8 }}>
          <AdditionalProfileDetailsCard profile={candidate} ref={additionalDetailsRef} />
        </Grid>
      </Grid>
    </Stack>
  );
};

interface IdentityCardProps {
  candidate: UserProfile;
  completionPercentage?: number;
  onEdit: () => void;
  onPreviewPortfolio?: () => void;
}

const IdentityCard = ({ candidate, completionPercentage, onEdit, onPreviewPortfolio }: IdentityCardProps) => {
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const initials = getInitials(candidate.firstName, candidate.lastName);

  return (
    <Paper
      component="section"
      id="candidate-profile-identity"
      sx={{
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}12, transparent 58%)`,
        border: 1,
        borderColor: 'divider',
        height: '100%',
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <Stack
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 2.5 }}
      >
        <Avatar
          aria-label={`${fullName || 'Candidate'} initials`}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '1.55rem',
            fontWeight: 850,
            height: 76,
            width: 76,
          }}
        >
          {initials}
        </Avatar>
        <Stack minWidth={0} spacing={1} sx={{ flex: 1 }}>
          <Typography component="h2" variant="h2">{fullName}</Typography>
          {candidate.headline ? (
            <Typography fontWeight={750}>{candidate.headline}</Typography>
          ) : (
            <Button data-profile-action="resumeHeadline" onClick={onEdit} sx={{ alignSelf: 'flex-start', px: 0 }}>
              Add headline
            </Button>
          )}
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {candidate.location ? (
              <IdentityDetail icon={<LocationOnOutlinedIcon fontSize="small" />} text={candidate.location} />
            ) : null}
            <IdentityDetail icon={<MailOutlineIcon fontSize="small" />} text={candidate.email} />
          </Stack>
          {completionPercentage === undefined ? null : (
            <Typography color="text.secondary" variant="body2">
              {completionPercentage}% profile completion
            </Typography>
          )}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button data-profile-action="basicDetails" onClick={onEdit} sx={{ width: { xs: '100%', sm: 'auto' } }} variant="contained">Edit profile</Button>
          {onPreviewPortfolio ? <Button onClick={onPreviewPortfolio} sx={{ width: { xs: '100%', sm: 'auto' } }} variant="outlined">Preview portfolio</Button> : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

const IdentityDetail = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <Stack alignItems="center" color="text.secondary" direction="row" minWidth={0} spacing={0.75}>
    {icon}
    <Typography sx={{ overflowWrap: 'anywhere' }} variant="body2">{text}</Typography>
  </Stack>
);

interface ProfileStrengthCardProps {
  completion?: CandidateProfileCompletion;
  isError: boolean;
  isLoading: boolean;
  onAbout: () => void;
  onBasicDetails: () => void;
  onResume: () => void;
  onRetry: () => void;
  onSkills: () => void;
}

const ProfileStrengthCard = ({ completion, isError, isLoading, onAbout, onBasicDetails, onResume, onRetry, onSkills }: ProfileStrengthCardProps) => (
  <Paper component="section" id="candidate-profile-strength" sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}>
    <Stack spacing={2}>
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <Stack alignItems="center" direction="row" spacing={1}>
          <AccountCircleOutlinedIcon color="primary" />
          <Typography component="h2" variant="h3">Profile strength</Typography>
        </Stack>
        {completion ? <Typography fontWeight={850}>{completion.completionPercentage}%</Typography> : null}
      </Stack>
      {isLoading ? <Skeleton aria-label="Loading profile completion" height={90} variant="rounded" /> : null}
      {isError || (!isLoading && !completion) ? (
        <Stack alignItems="flex-start" spacing={1.25}>
          <Alert severity="error">Profile completion guidance is temporarily unavailable.</Alert>
          <Button onClick={onRetry} variant="outlined">Retry profile completion</Button>
        </Stack>
      ) : null}
      {completion ? (
        <>
          <LinearProgress aria-label={`Profile completion: ${completion.completionPercentage}%`} value={completion.completionPercentage} variant="determinate" />
          <Typography color="text.secondary" variant="body2">
            {completion.completedSections.length} of {completion.sections.length} sections complete
          </Typography>
          {completion.missingSections.length ? (
            <Stack alignItems="flex-start" spacing={0.5}>
              <Typography fontWeight={750} variant="body2">Next steps</Typography>
              {completion.missingSections.slice(0, 3).map((section) => (
                <MissingSectionAction key={section} onAbout={onAbout} onBasicDetails={onBasicDetails} onResume={onResume} onSkills={onSkills} section={section} />
              ))}
            </Stack>
          ) : (
            <Alert severity="success">Your candidate profile is complete.</Alert>
          )}
        </>
      ) : null}
    </Stack>
  </Paper>
);

const MissingSectionAction = ({
  onAbout,
  onBasicDetails,
  onResume,
  onSkills,
  section,
}: Omit<ProfileStrengthCardProps, 'completion' | 'isError' | 'isLoading' | 'onRetry'> & { section: string }) => {
  if (section === 'resumeHeadline' || section === 'profileSummary') {
    return <Button data-profile-action={section} onClick={onAbout} size="small">Edit {sectionLabels[section]}</Button>;
  }
  if (section === 'skills') return <Button data-profile-action={section} onClick={onSkills} size="small">Add skills</Button>;
  if (section === 'resume') return <Button data-profile-action={section} onClick={onResume} size="small">Upload resume</Button>;
  if (section === 'careerPreferences') {
    return <Button component={Link} data-profile-action={section} size="small" to={ROUTES.ONBOARDING}>Add preferences</Button>;
  }
  if (section === 'basicDetails') {
    return <Button data-profile-action={section} onClick={onBasicDetails} size="small">Review profile details</Button>;
  }
  return null;
};

const CareerPreferencesCard = ({
  onboarding,
}: {
  onboarding: {
    data?: CandidateOnboarding;
    isError: boolean;
    isLoading: boolean;
  };
}) => (
  <Paper component="section" id="candidate-career-preferences" sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}>
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h3">Career preferences</Typography>
        <Typography color="text.secondary" variant="body2">
          Keep the opportunities and work settings you are looking for up to date.
        </Typography>
      </Stack>
      {onboarding.isLoading ? <Skeleton aria-label="Loading career preferences" height={72} variant="rounded" /> : null}
      {onboarding.isError ? <Alert severity="warning">Your career-preferences summary is unavailable.</Alert> : null}
      {onboarding.data ? <CareerPreferencesSummary data={onboarding.data} /> : null}
      <Button component={Link} data-profile-action="careerPreferences" sx={{ alignSelf: 'flex-start' }} to={ROUTES.ONBOARDING} variant="outlined">
        Edit preferences
      </Button>
    </Stack>
  </Paper>
);

const CareerPreferencesSummary = ({ data }: { data: CandidateOnboarding }) => {
  const values = [
    data.careerStage ? careerStageLabels[data.careerStage] : null,
    data.city,
    data.yearsOfExperience === null ? null : `${data.yearsOfExperience} ${data.yearsOfExperience === 1 ? 'year' : 'years'} experience`,
    ...data.desiredOpportunities.map((value) => desiredOpportunityLabels[value]),
    ...data.workPreferences.map((value) => workPreferenceLabels[value]),
  ].filter((value): value is string => Boolean(value));

  return values.length ? (
    <Stack aria-label="Career preferences summary" direction="row" flexWrap="wrap" gap={1}>
      {values.map((value) => <Chip key={value} label={value} />)}
    </Stack>
  ) : (
    <Typography color="text.secondary">Add career preferences to improve your job recommendations.</Typography>
  );
};

const getInitials = (firstName: string, lastName: string): string => {
  const initials = [firstName, lastName]
    .map((value) => value.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join('');
  return initials || 'CH';
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
