import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import {
  Alert,
  Avatar,
  Box, Button, Checkbox, FormControlLabel, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { ErrorState } from '@/components/feedback/ErrorState';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { apiClient } from '@/api/apiClient';
import {
  isDashboardApiError,
  useGetCandidateBasicDetailsQuery,
  useGetCandidateCareerPreferencesQuery,
  useUpdateCandidateBasicDetailsMutation,
  useUpdateCandidateCareerPreferencesMutation,
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
  type CandidateProfileCompletion,
  type UserProfile,
  type CandidateBasicDetails,
  type CandidateCareerPreferences,
  type CandidateEmploymentPreference,
  type CandidateJobType,
  type CandidateShiftPreference,
  type UpdateCandidateCareerPreferencesRequest,
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
  openEditorRequest?: number;
  publicPortfolioCard?: ReactNode;
}

type ProfileEditorTab = 'basic' | 'career' | 'education' | 'employment' | 'skills' | 'about';

const profileEditorTabs: { label: string; value: ProfileEditorTab }[] = [
  { label: 'Basic details', value: 'basic' },
  { label: 'Career preferences', value: 'career' },
  { label: 'Education', value: 'education' },
  { label: 'Employment', value: 'employment' },
  { label: 'Skills', value: 'skills' },
  { label: 'About', value: 'about' },
];

export const ProfilePage = () => {
  useDocumentMetadata(
    'Candidate Profile | Career Harbor',
    'Complete and maintain your Career Harbor candidate profile, resume, skills, and career preferences.',
  );
  return <CandidateProfileContent />;
};

export const CandidateProfileContent = ({
  hidePageHeader = false,
  openEditorRequest = 0,
  publicPortfolioCard,
}: CandidateProfileContentProps) => {
  const profile = useGetProfileQuery();
  const completion = useGetProfileCompletionQuery();
  const basicDetails = useGetCandidateBasicDetailsQuery();
  const preferences = useGetCandidateCareerPreferencesQuery();
  const aboutRef = useRef<CandidateAboutCardHandle>(null);
  const skillsRef = useRef<CandidateSkillsCardHandle>(null);
  const resumeRef = useRef<CandidateResumeCardHandle>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<ProfileEditorTab>('basic');

  const openEditor = (nextTab: ProfileEditorTab = 'basic') => {
    setEditorTab(nextTab);
    setEditorOpen(true);
  };

  useEffect(() => {
    if (openEditorRequest > 0) openEditor('basic');
  }, [openEditorRequest]);

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
          actions={(
            <Button onClick={() => openEditor('basic')} startIcon={<EditOutlinedIcon />} variant="contained">
              Edit profile
            </Button>
          )}
          description="Keep the details employers need and follow clear next steps to complete your profile."
          eyebrow="Candidate account"
          title="Candidate profile"
        />
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <IdentityCard
            candidate={candidate}
            completionPercentage={completion.data?.completionPercentage}
            onEdit={() => openEditor('about')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CandidateResumeCard ref={resumeRef} resume={candidate.resume} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <CareerPreferencesCard preferences={preferences} />
            <ProfileEducationRecords />
            <ProfileEmploymentRecords fresher={basicDetails.data?.workStatus === 'Fresher'} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <CandidateAboutCard profile={candidate} ref={aboutRef} />
            <ProfileStrengthCard
              completion={completion.data}
              isError={completion.isError}
              isLoading={completion.isLoading}
              onAbout={() => aboutRef.current?.openEditor()}
              onBasicDetails={() => openEditor('basic')}
              onResume={() => resumeRef.current?.chooseFile()}
              onRetry={() => void completion.refetch()}
              onSkills={() => openEditor('skills')}
            />
            {publicPortfolioCard}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        aria-describedby="profile-editor-description"
        fullScreen={false}
        fullWidth
        maxWidth="md"
        onClose={() => setEditorOpen(false)}
        open={editorOpen}
      >
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" id="profile-editor-description" sx={{ mb: 1 }} variant="body2">
            Keep your private candidate details and portfolio-ready information up to date.
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, maxWidth: '100%', overflow: 'hidden' }}>
            <Tabs
              allowScrollButtonsMobile
              aria-label="Edit profile sections"
              onChange={(_, value: ProfileEditorTab) => setEditorTab(value)}
              scrollButtons="auto"
              value={editorTab}
              variant="scrollable"
            >
              {profileEditorTabs.map((item) => <Tab key={item.value} label={item.label} value={item.value} />)}
            </Tabs>
          </Box>
          {editorTab === 'basic' ? <BasicDetailsCard data={basicDetails.data} isError={basicDetails.isError} isLoading={basicDetails.isLoading} /> : null}
          {editorTab === 'career' ? <CareerPreferencesCard preferences={preferences} /> : null}
          {editorTab === 'education' ? <ProfileEducationRecords /> : null}
          {editorTab === 'employment' ? <ProfileEmploymentRecords fresher={basicDetails.data?.workStatus === 'Fresher'} /> : null}
          {editorTab === 'skills' ? <CandidateSkillsCard ref={skillsRef} /> : null}
          {editorTab === 'about' ? <CandidateAboutCard profile={candidate} /> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

interface IdentityCardProps {
  candidate: UserProfile;
  completionPercentage?: number;
  onEdit: () => void;
}

const IdentityCard = ({ candidate, completionPercentage, onEdit }: IdentityCardProps) => {
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
        <Stack minWidth={0} spacing={1.25} sx={{ flex: 1 }}>
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
            {candidate.email ? <IdentityDetail icon={<MailOutlineIcon fontSize="small" />} text={`Verified email · ${candidate.email}`} /> : null}
          </Stack>
          {candidate.skills.length ? (
            <Stack aria-label="Profile skills" direction="row" flexWrap="wrap" gap={0.75}>
              {candidate.skills.slice(0, 6).map((skill) => <Chip key={skill} label={skill} size="small" variant="outlined" />)}
            </Stack>
          ) : null}
          {completionPercentage === undefined ? null : (
            <Stack spacing={0.5} sx={{ maxWidth: 440 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography color="text.secondary" variant="body2">Profile strength</Typography>
                <Typography color="text.secondary" fontWeight={750} variant="body2">{completionPercentage}%</Typography>
              </Stack>
              <LinearProgress aria-label={`Profile completion: ${completionPercentage}%`} value={completionPercentage} variant="determinate" />
            </Stack>
          )}
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
    return <Button data-profile-action={section} onClick={() => document.getElementById('candidate-career-preferences')?.scrollIntoView({ behavior: 'smooth' })} size="small">Add preferences</Button>;
  }
  if (section === 'basicDetails') {
    return <Button data-profile-action={section} onClick={onBasicDetails} size="small">Review profile details</Button>;
  }
  return null;
};

type CareerPreferencesQuery = {
  data?: CandidateCareerPreferences;
  isError: boolean;
  isLoading: boolean;
  refetch: () => unknown;
};

const emptyCareerPreferences: UpdateCandidateCareerPreferencesRequest = {
  employmentTypes: [],
  expectedAnnualSalary: null,
  jobTypes: [],
  preferredCities: [],
  preferredJobRoles: [],
  preferredShifts: [],
};

const CareerPreferencesCard = ({ preferences }: { preferences: CareerPreferencesQuery }) => {
  const [save, saveState] = useUpdateCandidateCareerPreferencesMutation();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UpdateCandidateCareerPreferencesRequest>(emptyCareerPreferences);
  const [roleInput, setRoleInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<CandidateCareerPreferences | null>(null);
  const displayed = savedData ?? preferences.data;

  const openEditor = () => {
    if (!displayed) return;
    setValues({
      employmentTypes: [...displayed.employmentTypes],
      expectedAnnualSalary: displayed.expectedAnnualSalary,
      jobTypes: [...displayed.jobTypes],
      preferredCities: [...displayed.preferredCities],
      preferredJobRoles: [...displayed.preferredJobRoles],
      preferredShifts: [...displayed.preferredShifts],
    });
    setRoleInput('');
    setCityInput('');
    setError(null);
    setOpen(true);
  };

  const addTextValue = (key: 'preferredJobRoles' | 'preferredCities', rawValue: string, limit: number) => {
    const value = rawValue.trim();
    const label = key === 'preferredJobRoles' ? 'job role' : 'city';
    if (!value) { setError(`Enter a ${label} before adding it.`); return; }
    if (values[key].some((item) => item.toLocaleLowerCase() === value.toLocaleLowerCase())) { setError(`That ${label} is already selected.`); return; }
    if (values[key].length >= limit) { setError(`You can select up to ${limit} ${key === 'preferredJobRoles' ? 'job roles' : 'cities'}.`); return; }
    setValues((current) => ({ ...current, [key]: [...current[key], value] }));
    if (key === 'preferredJobRoles') setRoleInput(''); else setCityInput('');
    setError(null);
  };

  const removeTextValue = (key: 'preferredJobRoles' | 'preferredCities', value: string) => {
    setValues((current) => ({ ...current, [key]: current[key].filter((item) => item !== value) }));
    setError(null);
  };

  const toggle = <T extends CandidateJobType | CandidateEmploymentPreference | CandidateShiftPreference>(key: 'jobTypes' | 'employmentTypes' | 'preferredShifts', value: T) => {
    setValues((current) => {
      const selected = current[key] as T[];
      return { ...current, [key]: selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value] };
    });
  };

  const submit = async () => {
    if (saveState.isLoading) return;
    setError(null);
    if (values.preferredJobRoles.length > 3 || values.preferredCities.length > 5) {
      setError('Review the maximum number of preferred roles and cities.');
      return;
    }
    if (values.expectedAnnualSalary !== null && values.expectedAnnualSalary < 0) {
      setError('Expected annual salary cannot be negative.');
      return;
    }
    const payload: UpdateCandidateCareerPreferencesRequest = {
      employmentTypes: values.employmentTypes,
      expectedAnnualSalary: values.expectedAnnualSalary,
      jobTypes: values.jobTypes,
      preferredCities: values.preferredCities.map((value) => value.trim()),
      preferredJobRoles: values.preferredJobRoles.map((value) => value.trim()),
      preferredShifts: values.preferredShifts,
    };
    try {
      const response = await save(payload).unwrap();
      setSavedData(response);
      setSuccess('Career preferences saved.');
      setOpen(false);
      void preferences.refetch();
    } catch (saveError: unknown) {
      setError(isDashboardApiError(saveError) ? saveError.message : 'Unable to save career preferences. Please try again.');
    }
  };

  return (
    <Paper component="section" id="candidate-career-preferences" sx={{ border: 1, borderColor: 'divider', p: { xs: 2.5, sm: 3 } }}>
      <Stack spacing={2}>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography component="h2" variant="h3">Career preferences</Typography>
            <Typography color="text.secondary" variant="body2">Keep the opportunities and work settings you are looking for up to date.</Typography>
          </Stack>
          <Tooltip title="Edit career preferences"><span><IconButton aria-label="Edit career preferences" disabled={!displayed || preferences.isLoading} onClick={openEditor}><EditOutlinedIcon /></IconButton></span></Tooltip>
        </Stack>
        {success ? <Alert severity="success">{success}</Alert> : null}
        {preferences.isLoading ? <Skeleton aria-label="Loading career preferences" height={96} variant="rounded" /> : null}
        {preferences.isError ? <Alert action={<Button color="inherit" onClick={() => void preferences.refetch()}>Retry</Button>} severity="warning">Your career preferences are temporarily unavailable.</Alert> : null}
        {displayed ? <CareerPreferenceSummary data={displayed} /> : null}
      </Stack>
      <Dialog aria-describedby="career-preferences-description" fullWidth maxWidth="md" onClose={saveState.isLoading ? undefined : () => setOpen(false)} open={open}>
        <DialogTitle>Edit career preferences</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" id="career-preferences-description" sx={{ mb: 2 }} variant="body2">Choose the roles and working conditions that fit your next opportunity.</Typography>
          <Stack spacing={3}>
            <PreferenceTextInput disabled={values.preferredJobRoles.length >= 3 || saveState.isLoading} helperText={`${values.preferredJobRoles.length}/3 selected`} input={roleInput} inputLabel="Preferred job roles" items={values.preferredJobRoles} limit={3} onAdd={() => addTextValue('preferredJobRoles', roleInput, 3)} onInput={setRoleInput} onRemove={(value) => removeTextValue('preferredJobRoles', value)} />
            <PreferenceTextInput disabled={values.preferredCities.length >= 5 || saveState.isLoading} helperText={`${values.preferredCities.length}/5 selected`} input={cityInput} inputLabel="Preferred cities" items={values.preferredCities} limit={5} onAdd={() => addTextValue('preferredCities', cityInput, 5)} onInput={setCityInput} onRemove={(value) => removeTextValue('preferredCities', value)} />
            <TextField disabled={saveState.isLoading} helperText="INR per year" inputProps={{ min: 0 }} label="Expected annual salary" onChange={(event) => setValues((current) => ({ ...current, expectedAnnualSalary: event.target.value ? Number(event.target.value) : null }))} type="number" value={values.expectedAnnualSalary ?? ''} />
            <PreferenceOptions label="Job type" onToggle={(value) => toggle('jobTypes', value as CandidateJobType)} options={jobTypeOptions} selected={values.jobTypes} />
            <PreferenceOptions label="Employment type" onToggle={(value) => toggle('employmentTypes', value as CandidateEmploymentPreference)} options={employmentPreferenceOptions} selected={values.employmentTypes} />
            <PreferenceOptions label="Preferred shift" onToggle={(value) => toggle('preferredShifts', value as CandidateShiftPreference)} options={shiftOptions} selected={values.preferredShifts} />
            {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions><Button disabled={saveState.isLoading} onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saveState.isLoading} onClick={() => void submit()} variant="contained">{saveState.isLoading ? 'Saving…' : 'Save preferences'}</Button></DialogActions>
      </Dialog>
    </Paper>
  );
};

const PreferenceTextInput = ({ disabled, helperText, input, inputLabel, items, onAdd, onInput, onRemove }: { disabled:boolean; helperText:string; input:string; inputLabel:string; items:string[]; limit:number; onAdd:()=>void; onInput:(value:string)=>void; onRemove:(value:string)=>void }) => (
  <Stack spacing={1}>
    <Stack alignItems="flex-start" direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField disabled={disabled} fullWidth helperText={helperText} label={inputLabel} onChange={(event) => onInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onAdd(); } }} value={input} />
      <Button disabled={disabled} onClick={onAdd} sx={{ minWidth: 88 }}>+ Add</Button>
    </Stack>
    <Stack direction="row" flexWrap="wrap" gap={1}>{items.map((item) => <Chip deleteIcon={<span aria-label={`Remove ${item}`}>×</span>} key={item} label={item} onDelete={() => onRemove(item)} />)}</Stack>
  </Stack>
);

const PreferenceOptions = ({ label, onToggle, options, selected }: { label:string; onToggle:(value:string)=>void; options:readonly {label:string;value:string}[]; selected:readonly string[] }) => (
  <Stack spacing={1}><Typography fontWeight={750}>{label}</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{options.map((option) => { const active = selected.includes(option.value); return <Chip aria-label={`${active ? 'Remove' : 'Add'} ${option.label}`} color={active ? 'primary' : 'default'} key={option.value} label={`${active ? '×' : '+'} ${option.label}`} onClick={() => onToggle(option.value)} variant={active ? 'filled' : 'outlined'} />; })}</Stack></Stack>
);

const CareerPreferenceSummary = ({ data }: { data: CandidateCareerPreferences }) => (
  <Stack spacing={1.5}>
    <PreferenceSummaryRow label="Roles" values={data.preferredJobRoles} />
    <PreferenceSummaryRow label="Cities" values={data.preferredCities} />
    <PreferenceSummaryRow label="Job type" values={data.jobTypes.map((value) => jobTypeOptions.find((option) => option.value === value)?.label ?? value)} />
    <PreferenceSummaryRow label="Employment type" values={data.employmentTypes.map((value) => employmentPreferenceOptions.find((option) => option.value === value)?.label ?? value)} />
    <PreferenceSummaryRow label="Shift" values={data.preferredShifts.map((value) => shiftOptions.find((option) => option.value === value)?.label ?? value)} />
    {data.expectedAnnualSalary === null ? null : <Typography variant="body2"><strong>Expected salary:</strong> INR {data.expectedAnnualSalary.toLocaleString('en-IN')} per year</Typography>}
  </Stack>
);

const PreferenceSummaryRow = ({ label, values }: { label:string; values:string[] }) => values.length ? <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}><Typography minWidth={110} variant="body2"><strong>{label}:</strong></Typography>{values.map((value) => <Chip key={`${label}-${value}`} label={value} size="small" />)}</Stack> : null;

const jobTypeOptions = [{ label: 'Permanent', value: 'Permanent' }, { label: 'Contractual', value: 'Contractual' }] as const;
const employmentPreferenceOptions = [{ label: 'Full-time', value: 'FullTime' }, { label: 'Part-time', value: 'PartTime' }] as const;
const shiftOptions = [{ label: 'Day', value: 'Day' }, { label: 'Night', value: 'Night' }, { label: 'Flexible', value: 'Flexible' }] as const;

const BasicDetailsCard = ({ data, isError, isLoading }: { data?: CandidateBasicDetails; isError: boolean; isLoading: boolean }) => {
  const [open, setOpen] = useState(false); const [error, setError] = useState<string | null>(null); const [save, state] = useUpdateCandidateBasicDetailsMutation();
  const [values, setValues] = useState({ workStatus: 'Fresher', isOutsideIndia: false, currentCountry: '', currentCity: '', currentArea: '', availabilityToJoin: '', currentAnnualSalary: '', currentFixedAnnualSalary: '', currentVariableAnnualSalary: '' });
  const openEditor = () => { if (!data) return; setValues({ workStatus: data.workStatus ?? 'Fresher', isOutsideIndia: Boolean(data.isOutsideIndia), currentCountry: data.currentCountry ?? '', currentCity: data.currentCity ?? '', currentArea: data.currentArea ?? '', availabilityToJoin: data.availabilityToJoin ?? '', currentAnnualSalary: data.currentAnnualSalary?.toString() ?? '', currentFixedAnnualSalary: data.currentFixedAnnualSalary?.toString() ?? '', currentVariableAnnualSalary: data.currentVariableAnnualSalary?.toString() ?? '' }); setError(null); setOpen(true); };
  const set = (key: keyof typeof values, value: string | boolean) => setValues((old) => ({ ...old, [key]: value }));
  const submit = async () => { if (!values.currentCity.trim() || !values.currentCountry.trim()) { setError('Current city and country are required.'); return; } try { await save({ workStatus: values.workStatus as 'Fresher' | 'Experienced', isOutsideIndia: values.isOutsideIndia, currentCountry: values.currentCountry.trim(), currentCity: values.currentCity.trim(), currentArea: values.currentArea.trim() || null, availabilityToJoin: (values.availabilityToJoin || null) as never, currentAnnualSalary: values.workStatus === 'Experienced' && values.currentAnnualSalary ? Number(values.currentAnnualSalary) : null, currentFixedAnnualSalary: values.workStatus === 'Experienced' && values.currentFixedAnnualSalary ? Number(values.currentFixedAnnualSalary) : null, currentVariableAnnualSalary: values.workStatus === 'Experienced' && values.currentVariableAnnualSalary ? Number(values.currentVariableAnnualSalary) : null }).unwrap(); setOpen(false); } catch { setError('Unable to save basic details. Please review the fields and try again.'); } };
  return <Paper component="section" id="candidate-basic-details" sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}><Stack spacing={1.5}><Stack direction="row" justifyContent="space-between"><Typography component="h2" variant="h3">Basic details</Typography><Tooltip title="Edit basic details"><IconButton aria-label="Edit basic details" onClick={openEditor}><EditOutlinedIcon /></IconButton></Tooltip></Stack>{isLoading ? <Skeleton height={100} variant="rounded" /> : null}{isError ? <Alert severity="warning">Your basic details are temporarily unavailable.</Alert> : null}{data ? <Stack spacing={0.75}>{[['Work status', data.workStatus], ['Current city', data.currentCity], ['Area/town', data.currentArea], ['Country', data.currentCountry], ['Availability to join', data.availabilityToJoin], ...(data.workStatus === 'Experienced' ? [['Current salary', data.currentAnnualSalary === null ? null : `${data.salaryUnit} ${data.currentAnnualSalary}`]] : []), ['Verified email', data.email], ['Verified mobile', data.mobile]].filter(([, value]) => Boolean(value)).map(([label, value]) => <Typography key={label} variant="body2"><strong>{label}:</strong> {value}</Typography>)}</Stack> : null}</Stack><Dialog fullScreen={false} fullWidth maxWidth="sm" onClose={() => !state.isLoading && setOpen(false)} open={open}><DialogTitle>Edit basic details</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField disabled label="Verified email" value={data?.email ?? ''} /><TextField disabled label="Verified mobile" value={data?.mobile ?? ''} /><TextField label="Work status" onChange={(e) => set('workStatus', e.target.value)} select SelectProps={{ native: true }} value={values.workStatus}><option value="Fresher">Fresher</option><option value="Experienced">Experienced</option></TextField><FormControlLabel control={<Checkbox checked={values.isOutsideIndia} onChange={(e) => set('isOutsideIndia', e.target.checked)} />} label="I currently live outside India" /><TextField label="Country" onChange={(e) => set('currentCountry', e.target.value)} required value={values.currentCountry} /><TextField label="Current city" onChange={(e) => set('currentCity', e.target.value)} required value={values.currentCity} /><TextField label="Current area / town" onChange={(e) => set('currentArea', e.target.value)} value={values.currentArea} /><TextField label="Availability to join" onChange={(e) => set('availabilityToJoin', e.target.value)} value={values.availabilityToJoin} />{values.workStatus === 'Experienced' ? <><TextField label="Current annual salary" onChange={(e) => set('currentAnnualSalary', e.target.value)} type="number" value={values.currentAnnualSalary} /><TextField label="Fixed annual salary" onChange={(e) => set('currentFixedAnnualSalary', e.target.value)} type="number" value={values.currentFixedAnnualSalary} /><TextField label="Variable annual salary" onChange={(e) => set('currentVariableAnnualSalary', e.target.value)} type="number" value={values.currentVariableAnnualSalary} /></> : null}{error ? <Alert severity="error">{error}</Alert> : null}</Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button disabled={state.isLoading} onClick={() => void submit()} variant="contained">{state.isLoading ? 'Saving…' : 'Save'}</Button></DialogActions></Dialog></Paper>;
};

const getInitials = (firstName: string, lastName: string): string => {
  const initials = [firstName, lastName]
    .map((value) => value.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join('');
  return initials || 'CH';
};
