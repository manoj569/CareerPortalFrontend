import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import {
  Alert,
  Avatar,
  Box, Button, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
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
  dashboardApi,
  isDashboardApiError,
  useGetCandidateBasicDetailsQuery,
  useGetCandidateCareerPreferencesQuery,
  useGetCandidateSkillsQuery,
  useAddCandidateSkillMutation,
  useDeleteCandidateSkillMutation,
  useUpdateCandidateCareerPreferencesMutation,
  useUpdateProfileMutation,
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
import { CandidateSkillsCard } from '@/features/dashboard/components/CandidateSkillsCard';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  type CandidateSkill,
  type UserProfile,
  type CandidateBasicDetails,
  type CandidateCareerPreferences,
  type CandidateEmploymentPreference,
  type CandidateJobType,
  type CandidateShiftPreference,
  type UpdateCandidateCareerPreferencesRequest,
} from '@/features/dashboard/types/dashboardModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { ProfileEducationRecords, ProfileEmploymentRecords } from '@/features/dashboard/components/ProfileRecords';

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
  const skills = useGetCandidateSkillsQuery();
  const aboutRef = useRef<CandidateAboutCardHandle>(null);
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
            basicDetails={basicDetails.data}
            candidate={candidate}
            completionPercentage={completion.data?.completionPercentage}
            onEdit={() => openEditor('basic')}
            skills={skills.data?.map((skill) => skill.name) ?? candidate.skills}
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
          {editorTab === 'basic' ? (
            <HeroProfileEditor
              basicDetails={basicDetails.data}
              candidate={candidate}
              completionRefetch={completion.refetch}
              onSaved={() => setEditorOpen(false)}
              profileRefetch={profile.refetch}
              skills={skills}
            />
          ) : null}
          {editorTab === 'career' ? <CareerPreferencesCard preferences={preferences} /> : null}
          {editorTab === 'education' ? <ProfileEducationRecords /> : null}
          {editorTab === 'employment' ? <ProfileEmploymentRecords fresher={basicDetails.data?.workStatus === 'Fresher'} /> : null}
          {editorTab === 'skills' ? <CandidateSkillsCard /> : null}
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
  basicDetails?: CandidateBasicDetails;
  candidate: UserProfile;
  completionPercentage?: number;
  onEdit: () => void;
  skills: string[];
}

const IdentityCard = ({ basicDetails, candidate, completionPercentage, onEdit, skills }: IdentityCardProps) => {
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
        position: 'relative',
      }}
    >
      <Tooltip title="Edit profile">
        <IconButton
          aria-label="Edit profile"
          onClick={onEdit}
          sx={{ position: 'absolute', right: { xs: 12, sm: 16 }, top: { xs: 12, sm: 16 } }}
        >
          <EditOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Stack
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 2.5 }}
      >
        <ProfileAvatar fullName={fullName} initials={initials} />
        <Stack minWidth={0} spacing={1.25} sx={{ flex: 1 }}>
          <Typography component="h2" variant="h2">{fullName}</Typography>
          <Typography color={candidate.headline ? 'text.primary' : 'text.secondary'} fontWeight={750}>
            {candidate.headline || 'Add a resume headline'}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {candidate.location ? (
              <IdentityDetail icon={<LocationOnOutlinedIcon fontSize="small" />} text={candidate.location} />
            ) : null}
            {candidate.email ? <IdentityDetail icon={<MailOutlineIcon fontSize="small" />} text={candidate.email} /> : null}
            {basicDetails?.mobile ? <IdentityDetail icon={<PhoneOutlinedIcon fontSize="small" />} text={basicDetails.mobile} /> : null}
          </Stack>
          {skills.length ? (
            <Stack aria-label="Profile skills" direction="row" flexWrap="wrap" gap={0.75}>
              {skills.map((skill) => <Chip key={skill} label={skill} size="small" variant="outlined" />)}
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

const splitLocation = (location: string | null): { city: string; state: string } => {
  const [city = '', ...stateParts] = (location ?? '').split(',');
  return { city: city.trim(), state: stateParts.join(',').trim() };
};

const HeroProfileEditor = ({
  basicDetails,
  candidate,
  completionRefetch,
  onSaved,
  profileRefetch,
  skills,
}: {
  basicDetails?: CandidateBasicDetails;
  candidate: UserProfile;
  completionRefetch: () => unknown;
  onSaved: () => void;
  profileRefetch: () => unknown;
  skills: { data?: CandidateSkill[]; isError: boolean; isLoading: boolean; refetch: () => unknown };
}) => {
  const dispatch = useAppDispatch();
  const location = splitLocation(candidate.location);
  const [headline, setHeadline] = useState(candidate.headline ?? '');
  const [city, setCity] = useState(location.city || basicDetails?.currentCity || '');
  const [state, setState] = useState(location.state);
  const [skillNames, setSkillNames] = useState<string[]>(skills.data?.map((skill) => skill.name) ?? candidate.skills);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updateProfile, updateState] = useUpdateProfileMutation();
  const [addSkill, addState] = useAddCandidateSkillMutation();
  const [deleteSkill, deleteState] = useDeleteCandidateSkillMutation();
  const isSaving = updateState.isLoading || addState.isLoading || deleteState.isLoading;

  const addSkillName = () => {
    const name = skillInput.trim();
    if (!name) { setError('Enter a skill before adding it.'); return; }
    if (skillNames.some((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('That skill is already included.');
      return;
    }
    setSkillNames((current) => [...current, name]);
    setSkillInput('');
    setError(null);
  };

  const save = async () => {
    if (isSaving) return;
    const nextHeadline = headline.trim();
    const nextCity = city.trim();
    const nextState = state.trim();
    if (!nextHeadline || !nextCity || !nextState || skillNames.length === 0) {
      setError('Resume headline, city, state, and at least one skill are required.');
      return;
    }
    if (skills.isLoading) {
      setError('Wait for your skills to finish loading before saving.');
      return;
    }
    if (skills.isError) {
      setError('Skills could not be loaded. Retry before saving your profile.');
      return;
    }

    setError(null);
    const currentSkills = skills.data ?? [];
    const normalizedNames = skillNames.map((name) => name.trim()).filter(Boolean);
    const removed = currentSkills.filter((skill) => !normalizedNames.some((name) => name.toLocaleLowerCase() === skill.name.toLocaleLowerCase()));
    const added = normalizedNames.filter((name) => !currentSkills.some((skill) => skill.name.toLocaleLowerCase() === name.toLocaleLowerCase()));

    try {
      const updatedProfile = await updateProfile({
        bio: candidate.bio,
        education: candidate.education,
        experience: candidate.experience,
        headline: nextHeadline,
        linkedInUrl: candidate.linkedInUrl,
        location: `${nextCity}, ${nextState}`,
        portfolioUrl: candidate.portfolioUrl,
        preferredJobTypes: candidate.preferredJobTypes,
        skills: candidate.skills,
      }).unwrap();
      dispatch(dashboardApi.util.updateQueryData('getProfile', undefined, (draft) => {
        Object.assign(draft, updatedProfile);
      }));
      await Promise.all([
        ...removed.map((skill) => deleteSkill(skill.id).unwrap()),
        ...added.map((name) => addSkill({ name, proficiency: null, yearsOfExperience: null }).unwrap()),
      ]);
      await Promise.all([Promise.resolve(profileRefetch()), Promise.resolve(skills.refetch()), Promise.resolve(completionRefetch())]);
      onSaved();
    } catch (saveError: unknown) {
      await Promise.allSettled([Promise.resolve(profileRefetch()), Promise.resolve(skills.refetch()), Promise.resolve(completionRefetch())]);
      setError(isDashboardApiError(saveError) ? saveError.message : 'Unable to save your profile. Please review the fields and try again.');
    }
  };

  return (
    <Stack component="section" spacing={2.25}>
      <Typography component="h3" variant="h3">Basic details</Typography>
      <TextField disabled label="Email" value={candidate.email} />
      <TextField disabled helperText="Mobile number changes require account verification." label="Verified mobile number" value={basicDetails?.mobile ?? ''} />
      <TextField autoFocus disabled={isSaving} label="Resume headline" onChange={(event) => setHeadline(event.target.value)} required value={headline} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><TextField disabled={isSaving} fullWidth label="City" onChange={(event) => setCity(event.target.value)} required value={city} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField disabled={isSaving} fullWidth label="State" onChange={(event) => setState(event.target.value)} required value={state} /></Grid>
      </Grid>
      <Stack spacing={1}>
        <Stack alignItems="flex-start" direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField disabled={isSaving} fullWidth label="Skills" onChange={(event) => setSkillInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkillName(); } }} value={skillInput} />
          <Button disabled={isSaving} onClick={addSkillName} startIcon={<AddOutlinedIcon />} variant="outlined">Add skill</Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {skillNames.map((name) => <Chip key={name} label={name} onDelete={isSaving ? undefined : () => setSkillNames((current) => current.filter((item) => item !== name))} />)}
        </Stack>
      </Stack>
      {skills.isLoading ? <Skeleton aria-label="Loading profile skills" height={48} variant="rounded" /> : null}
      {skills.isError ? <Alert action={<Button color="inherit" onClick={() => void skills.refetch()}>Retry</Button>} severity="error">Your skills could not be loaded.</Alert> : null}
      {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
      <Button disabled={isSaving || skills.isLoading} onClick={() => void save()} sx={{ alignSelf: 'flex-end' }} variant="contained">
        {isSaving ? 'Saving…' : 'Save profile'}
      </Button>
    </Stack>
  );
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
  const dispatch = useAppDispatch();
  const [save, saveState] = useUpdateCandidateCareerPreferencesMutation();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UpdateCandidateCareerPreferencesRequest>(emptyCareerPreferences);
  const [roleInput, setRoleInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const displayed = preferences.data;

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
      dispatch(dashboardApi.util.updateQueryData('getCandidateCareerPreferences', undefined, (draft) => {
        Object.assign(draft, response);
      }));
      await Promise.resolve(preferences.refetch());
      setOpen(false);
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
        {preferences.isLoading ? <Skeleton aria-label="Loading career preferences" height={96} variant="rounded" /> : null}
        {preferences.isError ? <Alert action={<Button color="inherit" onClick={() => void preferences.refetch()}>Retry</Button>} severity="warning">Your career preferences are temporarily unavailable.</Alert> : null}
        {displayed && hasCareerPreferences(displayed) ? <CareerPreferenceSummary data={displayed} /> : null}
        {displayed && !hasCareerPreferences(displayed) ? <Typography color="text.secondary">Add your preferred roles, locations, and working preferences.</Typography> : null}
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
    <PreferenceSummaryRow label="Desired roles" values={data.preferredJobRoles} />
    <PreferenceSummaryRow label="Preferred locations" values={data.preferredCities} />
    <PreferenceSummaryRow label="Job type" values={data.jobTypes.map((value) => jobTypeOptions.find((option) => option.value === value)?.label ?? value)} />
    <PreferenceSummaryRow label="Employment type" values={data.employmentTypes.map((value) => employmentPreferenceOptions.find((option) => option.value === value)?.label ?? value)} />
    <PreferenceSummaryRow label="Shift" values={data.preferredShifts.map((value) => shiftOptions.find((option) => option.value === value)?.label ?? value)} />
    {data.expectedAnnualSalary === null ? null : <Typography variant="body2"><strong>Expected salary:</strong> INR {data.expectedAnnualSalary.toLocaleString('en-IN')} per year</Typography>}
  </Stack>
);

const hasCareerPreferences = (data: CandidateCareerPreferences): boolean =>
  data.preferredJobRoles.length > 0 ||
  data.preferredCities.length > 0 ||
  data.expectedAnnualSalary !== null ||
  data.jobTypes.length > 0 ||
  data.employmentTypes.length > 0 ||
  data.preferredShifts.length > 0;

const PreferenceSummaryRow = ({ label, values }: { label:string; values:string[] }) => values.length ? <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}><Typography minWidth={110} variant="body2"><strong>{label}:</strong></Typography>{values.map((value) => <Chip key={`${label}-${value}`} label={value} size="small" />)}</Stack> : null;

const jobTypeOptions = [{ label: 'Permanent', value: 'Permanent' }, { label: 'Contractual', value: 'Contractual' }] as const;
const employmentPreferenceOptions = [{ label: 'Full-time', value: 'FullTime' }, { label: 'Part-time', value: 'PartTime' }] as const;
const shiftOptions = [{ label: 'Day', value: 'Day' }, { label: 'Night', value: 'Night' }, { label: 'Flexible', value: 'Flexible' }] as const;

const getInitials = (firstName: string, lastName: string): string => {
  const initials = [firstName, lastName]
    .map((value) => value.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join('');
  return initials || 'CH';
};
