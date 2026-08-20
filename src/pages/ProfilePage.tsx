import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import {
  Alert,
  Avatar,
  Box, Button, Checkbox, FormControlLabel, IconButton, Tooltip, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { apiClient } from '@/api/apiClient';
import {
  useGetOnboardingQuery,
  useGetCandidateBasicDetailsQuery,
  useGetCandidateCareerPreferencesQuery,
  useUpdateCandidateBasicDetailsMutation,
  useGetProfileCompletionQuery,
  useGetProfileQuery,
} from '@/features/dashboard/api/dashboardApi';
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
  type CandidateBasicDetails,
  type CandidateCareerPreferences,
} from '@/features/dashboard/types/dashboardModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { ProfileEducationRecords, ProfileEmploymentRecords } from '@/features/dashboard/components/ProfileRecords';

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
  const basicDetails = useGetCandidateBasicDetailsQuery();
  const preferences = useGetCandidateCareerPreferencesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get('section');
  const section = requestedSection === 'education' || requestedSection === 'employment' ? requestedSection : 'overview';
  const setSection = (value: 'overview' | 'education' | 'employment') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'profile');
    next.set('section', value);
    setSearchParams(next);
  };
  const aboutRef = useRef<CandidateAboutCardHandle>(null);
  const skillsRef = useRef<CandidateSkillsCardHandle>(null);
  const resumeRef = useRef<CandidateResumeCardHandle>(null);

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

      {hidePageHeader ? (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
          <Tabs allowScrollButtonsMobile aria-label="Profile sections" onChange={(_, value: unknown) => { if (value === 'overview' || value === 'education' || value === 'employment') setSection(value); }} scrollButtons="auto" value={section} variant="scrollable">
            <Tab label="Overview" value="overview" />
            <Tab label="Education" value="education" />
            <Tab label="Employment" value="employment" />
          </Tabs>
        </Box>
      ) : null}

      {section === 'education' ? <ProfileEducationRecords /> : null}
      {section === 'employment' ? <ProfileEmploymentRecords fresher={basicDetails.data?.workStatus === 'Fresher'} /> : null}

      {section === 'overview' ? <Grid container spacing={{ xs: 2, md: 3 }}>
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
            onBasicDetails={() => document.getElementById('candidate-basic-details')?.scrollIntoView({ behavior: 'smooth' })}
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
          <CareerPreferencesCard onboarding={onboarding} preferences={preferences} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: 8 }}>
          <BasicDetailsCard data={basicDetails.data} isError={basicDetails.isError} isLoading={basicDetails.isLoading} />
        </Grid>
      </Grid> : null}
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
        <ProfileAvatar fullName={fullName} initials={initials} />
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

const ProfileAvatar = ({ fullName, initials }: { fullName: string; initials: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const revoke = (url: string | null) => { if (url) URL.revokeObjectURL(url); };
  const clearPreview = () => { revoke(previewUrlRef.current); previewUrlRef.current = null; setPreview(null); setFile(null); };
  const load = useCallback(async () => { try { const response = await apiClient.request<Blob>({ method: 'GET', responseType: 'blob', url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO }); const next = URL.createObjectURL(response.data); revoke(photoUrlRef.current); photoUrlRef.current = next; setPhotoUrl(next); } catch { revoke(photoUrlRef.current); photoUrlRef.current = null; setPhotoUrl(null); } }, []);
  useEffect(() => { void load(); return () => { revoke(photoUrlRef.current); revoke(previewUrlRef.current); }; }, [load]);
  const close = () => { if (saving) return; clearPreview(); setError(null); setOpen(false); window.setTimeout(() => triggerRef.current?.focus(), 0); };
  const choose = (next: File | undefined) => { if (!next) return; setError(null); if (!['image/jpeg', 'image/png', 'image/webp'].includes(next.type)) { setError('Choose a JPEG, PNG, or WebP image.'); return; } if (next.size > 1024 * 1024) { setError('Profile photo must be no larger than 1 MB.'); return; } const nextPreview = URL.createObjectURL(next); revoke(previewUrlRef.current); previewUrlRef.current = nextPreview; setPreview(nextPreview); setFile(next); };
  const save = async () => { if (!file || saving) return; setSaving(true); setError(null); try { const data = new FormData(); data.append('file', file); await apiClient.request({ data, method: 'PUT', url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO }); await load(); window.dispatchEvent(new Event('careerharbor:profile-photo-changed')); clearPreview(); setOpen(false); } catch { setError('Unable to update your profile photo. Please try again.'); } finally { setSaving(false); } };
  const remove = async () => { if (saving) return; setSaving(true); setError(null); try { await apiClient.request({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO }); revoke(photoUrlRef.current); photoUrlRef.current = null; setPhotoUrl(null); window.dispatchEvent(new Event('careerharbor:profile-photo-changed')); setConfirmRemove(false); setOpen(false); } catch { setConfirmRemove(false); setError('Unable to remove your profile photo. Please try again.'); } finally { setSaving(false); } };
  return <><Box sx={{ position: 'relative' }}><Avatar aria-label={`${fullName || 'Candidate'} initials`} imgProps={{ onError: () => { revoke(photoUrlRef.current); photoUrlRef.current = null; setPhotoUrl(null); } }} src={photoUrl ?? undefined} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '1.55rem', fontWeight: 850, height: 76, width: 76 }}>{initials}</Avatar><Tooltip title="Change profile photo"><IconButton aria-label="Change profile photo" onClick={() => setOpen(true)} ref={triggerRef} size="small" sx={{ bgcolor: 'background.paper', bottom: -6, boxShadow: 1, minHeight: 44, minWidth: 44, position: 'absolute', right: -8 }}><PhotoCameraOutlinedIcon fontSize="small" /></IconButton></Tooltip></Box><Dialog aria-describedby="profile-photo-description" fullWidth maxWidth="xs" onClose={close} open={open}><DialogTitle>Profile photo</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Typography color="text.secondary" id="profile-photo-description">Use a JPEG, PNG, or WebP image up to 1 MB.</Typography>{(preview || photoUrl) ? <Avatar aria-label="Profile photo preview" src={preview ?? photoUrl ?? undefined} sx={{ height: 112, width: 112 }} /> : null}{error ? <Alert severity="error">{error}</Alert> : null}<input accept="image/jpeg,image/png,image/webp" aria-label="Choose profile photo" hidden onChange={(event) => choose(event.target.files?.[0])} ref={inputRef} type="file" /><Button disabled={saving} onClick={() => inputRef.current?.click()} variant="outlined">{photoUrl ? 'Replace photo' : 'Upload photo'}</Button></Stack></DialogContent><DialogActions><Button disabled={saving} onClick={close}>Cancel</Button>{photoUrl ? <Button color="error" disabled={saving} onClick={() => setConfirmRemove(true)}>Remove photo</Button> : null}<Button disabled={!file || saving} onClick={() => void save()} variant="contained">{saving ? 'Saving…' : 'Save photo'}</Button></DialogActions></Dialog><Dialog aria-describedby="remove-photo-description" onClose={() => !saving && setConfirmRemove(false)} open={confirmRemove}><DialogTitle>Remove profile photo?</DialogTitle><DialogContent><Typography id="remove-photo-description">Your initials will be shown instead.</Typography>{error ? <Alert severity="error">{error}</Alert> : null}</DialogContent><DialogActions><Button disabled={saving} onClick={() => setConfirmRemove(false)}>Cancel</Button><Button color="error" disabled={saving} onClick={() => void remove()}>{saving ? 'Removing…' : 'Remove photo'}</Button></DialogActions></Dialog></>;
};

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
  preferences,
}: {
  onboarding: {
    data?: CandidateOnboarding;
    isError: boolean;
    isLoading: boolean;
  };
  preferences: { data?: CandidateCareerPreferences; isError: boolean; isLoading: boolean };
}) => (
  <Paper component="section" id="candidate-career-preferences" sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}>
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h3">Career preferences</Typography>
        <Typography color="text.secondary" variant="body2">
          Keep the opportunities and work settings you are looking for up to date.
        </Typography>
      </Stack>
      {preferences.isLoading ? <Skeleton aria-label="Loading career preferences" height={72} variant="rounded" /> : null}
      {preferences.isError ? <Alert severity="warning">Your career-preferences summary is unavailable.</Alert> : null}
      {preferences.data ? <Stack direction="row" flexWrap="wrap" gap={1}>{[...preferences.data.preferredJobRoles, ...preferences.data.preferredCities, ...preferences.data.jobTypes, ...preferences.data.employmentTypes, ...preferences.data.preferredShifts].map((value) => <Chip key={value} label={value} />)}</Stack> : onboarding.data ? <CareerPreferencesSummary data={onboarding.data} /> : null}
      <Button component={Link} data-profile-action="careerPreferences" sx={{ alignSelf: 'flex-start' }} to={ROUTES.ONBOARDING} variant="outlined">
        Edit preferences
      </Button>
    </Stack>
  </Paper>
);

const BasicDetailsCard = ({ data, isError, isLoading }: { data?: CandidateBasicDetails; isError: boolean; isLoading: boolean }) => {
  const [open, setOpen] = useState(false); const [error, setError] = useState<string | null>(null); const [save, state] = useUpdateCandidateBasicDetailsMutation();
  const [values, setValues] = useState({ workStatus: 'Fresher', isOutsideIndia: false, currentCountry: '', currentCity: '', currentArea: '', availabilityToJoin: '', currentAnnualSalary: '', currentFixedAnnualSalary: '', currentVariableAnnualSalary: '' });
  const openEditor = () => { if (!data) return; setValues({ workStatus: data.workStatus ?? 'Fresher', isOutsideIndia: Boolean(data.isOutsideIndia), currentCountry: data.currentCountry ?? '', currentCity: data.currentCity ?? '', currentArea: data.currentArea ?? '', availabilityToJoin: data.availabilityToJoin ?? '', currentAnnualSalary: data.currentAnnualSalary?.toString() ?? '', currentFixedAnnualSalary: data.currentFixedAnnualSalary?.toString() ?? '', currentVariableAnnualSalary: data.currentVariableAnnualSalary?.toString() ?? '' }); setError(null); setOpen(true); };
  const set = (key: keyof typeof values, value: string | boolean) => setValues((old) => ({ ...old, [key]: value }));
  const submit = async () => { if (!values.currentCity.trim() || !values.currentCountry.trim()) { setError('Current city and country are required.'); return; } try { await save({ workStatus: values.workStatus as 'Fresher' | 'Experienced', isOutsideIndia: values.isOutsideIndia, currentCountry: values.currentCountry.trim(), currentCity: values.currentCity.trim(), currentArea: values.currentArea.trim() || null, availabilityToJoin: (values.availabilityToJoin || null) as never, currentAnnualSalary: values.workStatus === 'Experienced' && values.currentAnnualSalary ? Number(values.currentAnnualSalary) : null, currentFixedAnnualSalary: values.workStatus === 'Experienced' && values.currentFixedAnnualSalary ? Number(values.currentFixedAnnualSalary) : null, currentVariableAnnualSalary: values.workStatus === 'Experienced' && values.currentVariableAnnualSalary ? Number(values.currentVariableAnnualSalary) : null }).unwrap(); setOpen(false); } catch { setError('Unable to save basic details. Please review the fields and try again.'); } };
  return <Paper component="section" id="candidate-basic-details" sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}><Stack spacing={1.5}><Stack direction="row" justifyContent="space-between"><Typography component="h2" variant="h3">Basic details</Typography><Tooltip title="Edit basic details"><IconButton aria-label="Edit basic details" onClick={openEditor}><PhotoCameraOutlinedIcon sx={{ display: 'none' }} /><AccountCircleOutlinedIcon /></IconButton></Tooltip></Stack>{isLoading ? <Skeleton height={100} variant="rounded" /> : null}{isError ? <Alert severity="warning">Your basic details are temporarily unavailable.</Alert> : null}{data ? <Stack spacing={0.75}>{[['Work status', data.workStatus], ['Current city', data.currentCity], ['Area/town', data.currentArea], ['Country', data.currentCountry], ['Availability to join', data.availabilityToJoin], ...(data.workStatus === 'Experienced' ? [['Current salary', data.currentAnnualSalary === null ? null : `${data.salaryUnit} ${data.currentAnnualSalary}`]] : []), ['Verified email', data.email], ['Verified mobile', data.mobile]].filter(([, value]) => Boolean(value)).map(([label, value]) => <Typography key={label} variant="body2"><strong>{label}:</strong> {value}</Typography>)}</Stack> : null}</Stack><Dialog fullScreen={false} fullWidth maxWidth="sm" onClose={() => !state.isLoading && setOpen(false)} open={open}><DialogTitle>Edit basic details</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField disabled label="Verified email" value={data?.email ?? ''} /><TextField disabled label="Verified mobile" value={data?.mobile ?? ''} /><TextField label="Work status" onChange={(e) => set('workStatus', e.target.value)} select SelectProps={{ native: true }} value={values.workStatus}><option value="Fresher">Fresher</option><option value="Experienced">Experienced</option></TextField><FormControlLabel control={<Checkbox checked={values.isOutsideIndia} onChange={(e) => set('isOutsideIndia', e.target.checked)} />} label="I currently live outside India" /><TextField label="Country" onChange={(e) => set('currentCountry', e.target.value)} required value={values.currentCountry} /><TextField label="Current city" onChange={(e) => set('currentCity', e.target.value)} required value={values.currentCity} /><TextField label="Current area / town" onChange={(e) => set('currentArea', e.target.value)} value={values.currentArea} /><TextField label="Availability to join" onChange={(e) => set('availabilityToJoin', e.target.value)} value={values.availabilityToJoin} />{values.workStatus === 'Experienced' ? <><TextField label="Current annual salary" onChange={(e) => set('currentAnnualSalary', e.target.value)} type="number" value={values.currentAnnualSalary} /><TextField label="Fixed annual salary" onChange={(e) => set('currentFixedAnnualSalary', e.target.value)} type="number" value={values.currentFixedAnnualSalary} /><TextField label="Variable annual salary" onChange={(e) => set('currentVariableAnnualSalary', e.target.value)} type="number" value={values.currentVariableAnnualSalary} /></> : null}{error ? <Alert severity="error">{error}</Alert> : null}</Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button disabled={state.isLoading} onClick={() => void submit()} variant="contained">{state.isLoading ? 'Saving…' : 'Save'}</Button></DialogActions></Dialog></Paper>;
};

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
