import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { Alert, Autocomplete, Avatar, Box, Button, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, TextField, MenuItem, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { apiClient } from '@/api/apiClient';
import {
  dashboardApi,
  isDashboardApiError,
  useGetCandidateBasicDetailsQuery,
  useGetCandidateCareerPreferencesQuery,
  useGetCandidateSkillsQuery,
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
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  type CandidateSkill,
  type UserProfile,
  type CandidateBasicDetails,
  type CandidateCareerPreferences,
  type CandidateNoticePeriod,
  type CandidateWorkStatus,
  type CandidateEmploymentPreference,
  type CandidateJobType,
  type CandidateShiftPreference,
  type UpdateCandidateBasicDetailsRequest,
  type UpdateCandidateCareerPreferencesRequest,
} from '@/features/dashboard/types/dashboardModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { ProfileEducationRecords, ProfileEmploymentRecords } from '@/features/dashboard/components/ProfileRecords';
import { isSafeProfessionalText, isWholeInrAmount } from '@/features/dashboard/validation/professionalText';
import { countries, indianCities } from '@/features/dashboard/reference/profileReferenceData';

interface CandidateProfileContentProps {
  hidePageHeader?: boolean;
  openEditorRequest?: number;
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
  const [editorSession, setEditorSession] = useState(0);
  const [editorActionsNode, setEditorActionsNode] = useState<HTMLElement | null>(null);

  const openEditor = () => { setEditorSession((value) => value + 1); setEditorOpen(true); };

  useEffect(() => {
    if (openEditorRequest > 0) openEditor();
  }, [openEditorRequest]);

  if (profile.isLoading) {
    return <PageLoadingIndicator label="Loading profile" />;
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
            <Button onClick={openEditor} startIcon={<EditOutlinedIcon />} variant="contained">
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
            onEdit={openEditor}
            skills={skills.data?.map((skill) => skill.name) ?? candidate.skills}
          />
        </Grid>
        <Grid id="candidate-profile-about" size={{ xs: 12, md: 8 }}>
          <CandidateAboutCard profile={candidate} ref={aboutRef} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <CareerPreferencesCard preferences={preferences} />
            <Box id="candidate-profile-education"><ProfileEducationRecords /></Box>
            <Box id="candidate-profile-employment"><ProfileEmploymentRecords fresher={basicDetails.data?.workStatus === 'Fresher'} /></Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <Box id="candidate-profile-resume"><CandidateResumeCard ref={resumeRef} resume={candidate.resume} /></Box>
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
        sx={{ '& .MuiDialog-paper': { maxHeight: 'calc(100dvh - 32px)', m: 2, width: 'calc(100% - 32px)' } }}
      >
        <DialogTitle>Edit basic details</DialogTitle>
        <DialogContent sx={{ minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          <Typography color="text.secondary" id="profile-editor-description" sx={{ mb: 1 }} variant="body2">
            Update the essential details shown in your private candidate profile.
          </Typography>
          <HeroProfileEditor
            actionsNode={editorActionsNode}
            key={editorSession}
            basicDetails={basicDetails.data}
            basicDetailsRefetch={basicDetails.refetch}
            candidate={candidate}
            completionRefetch={completion.refetch}
            onCancel={() => setEditorOpen(false)}
            onSaved={() => setEditorOpen(false)}
            profileRefetch={profile.refetch}
            skills={skills}
          />
        </DialogContent>
        <DialogActions ref={setEditorActionsNode} sx={{ bgcolor: 'background.paper', pb: 'max(8px, env(safe-area-inset-bottom))', px: 2 }} />
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
            {basicDetails?.mobileNumber ? <IdentityDetail icon={<PhoneOutlinedIcon fontSize="small" />} text={basicDetails.mobileNumber} /> : null}
          </Stack>
          {skills.length ? (
            <Stack aria-label="Profile skills" direction="row" flexWrap="wrap" gap={0.75}>
              {skills.map((skill) => <Chip key={skill} label={skill} size="small" variant="outlined" />)}
            </Stack>
          ) : null}
          {basicDetails?.noticePeriod ? <IdentityDetail icon={<EventAvailableOutlinedIcon fontSize="small" />} text={`Availability: ${noticePeriodLabels[basicDetails.noticePeriod]}`} /> : null}
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

const noticePeriodLabels: Record<CandidateNoticePeriod, string> = {
  ImmediateJoiner: 'Immediate joiner', FifteenDaysOrLess: '15 days', OneMonth: '1 month', ThreeMonths: '3 months', Other: 'Other',
};
const getLocationCity = (location: string | null): string => (location ?? '').split(',')[0]?.trim() ?? '';
const getEditableMobile = (mobile: string | null): string => {
  const digits = mobile?.replace(/\D/g, '') ?? '';
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const HeroProfileEditor = ({
  actionsNode,
  basicDetails,
  basicDetailsRefetch,
  candidate,
  completionRefetch,
  onCancel,
  onSaved,
  profileRefetch,
  skills,
}: {
  actionsNode: HTMLElement | null;
  basicDetails?: CandidateBasicDetails;
  basicDetailsRefetch: () => unknown;
  candidate: UserProfile;
  completionRefetch: () => unknown;
  onCancel: () => void;
  onSaved: () => void;
  profileRefetch: () => unknown;
  skills: { data?: CandidateSkill[]; isError: boolean; isLoading: boolean; refetch: () => unknown };
}) => {
  const [headline, setHeadline] = useState(basicDetails?.resumeHeadline ?? candidate.headline ?? '');
  const [city, setCity] = useState(basicDetails?.currentCity || getLocationCity(candidate.location));
  const [workStatus, setWorkStatus] = useState<CandidateWorkStatus | ''>(basicDetails?.workStatus ?? '');
  const [isOutsideIndia, setIsOutsideIndia] = useState<boolean | null>(basicDetails?.isOutsideIndia ?? null);
  const [country, setCountry] = useState(basicDetails?.currentCountry ?? '');
  const [area, setArea] = useState(basicDetails?.currentArea ?? '');
  const existingMobile = basicDetails?.mobileNumber ?? candidate.mobileNumber ?? candidate.phoneNumber ?? null;
  const [mobileNumber, setMobileNumber] = useState(getEditableMobile(existingMobile));
  const [noticePeriod, setNoticePeriod] = useState<CandidateNoticePeriod | ''>(basicDetails?.noticePeriod ?? '');
  const [skillNames, setSkillNames] = useState<string[]>(basicDetails?.skills ?? skills.data?.map((skill) => skill.name) ?? candidate.skills);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<'headline' | 'workStatus' | 'isOutsideIndia' | 'country' | 'mobileNumber' | 'city' | 'skills', string | undefined>>({ city: undefined, country: undefined, headline: undefined, isOutsideIndia: undefined, mobileNumber: undefined, skills: undefined, workStatus: undefined });
  const [updateBasicDetails, basicUpdateState] = useUpdateCandidateBasicDetailsMutation();
  const isSaving = basicUpdateState.isLoading;

  const addSkillName = () => {
    const name = skillInput.trim();
    if (!isSafeProfessionalText(name) || name.length > 100) { setFieldErrors((current) => ({ ...current, skills: 'Enter a meaningful skill without markup or control characters (100 characters maximum).' })); return; }
    if (skillNames.some((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setFieldErrors((current) => ({ ...current, skills: 'That skill is already included.' }));
      return;
    }
    setSkillNames((current) => [...current, name]);
    setSkillInput('');
    setFieldErrors((current) => ({ ...current, skills: undefined }));
  };

  const save = async () => {
    if (isSaving) return;
    const nextHeadline = headline.trim();
    const nextCity = city.trim();
    const nextSkills = skillNames.map((name) => name.trim()).filter(Boolean);
    const nextErrors = {
      city: isSafeProfessionalText(nextCity) ? undefined : 'Enter a meaningful city without markup.',
      country: countries.some((option) => option.value === country) || basicDetails?.currentCountry === country ? undefined : 'Select a country from the list.',
      headline: isSafeProfessionalText(nextHeadline) && nextHeadline.length <= 180 ? undefined : 'Enter a meaningful resume headline without markup (180 characters maximum).',
      isOutsideIndia: isOutsideIndia === null ? 'Select whether you are currently outside India.' : undefined,
      mobileNumber: !basicDetails?.mobileVerified && mobileNumber.trim() && !/^\d{10}$/.test(mobileNumber.trim()) ? 'Enter a valid 10-digit Indian mobile number.' : undefined,
      skills: nextSkills.length && nextSkills.every((name) => isSafeProfessionalText(name) && name.length <= 100) ? undefined : 'Add at least one meaningful skill.',
      workStatus: workStatus ? undefined : 'Work status is required.',
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    if (area.trim() && !isSafeProfessionalText(area)) { setError('Enter a meaningful area without markup.'); return; }
    if (skills.isLoading) {
      setError('Wait for your skills to finish loading before saving.');
      return;
    }
    if (skills.isError) {
      setError('Skills could not be loaded. Retry before saving your profile.');
      return;
    }

    setError(null);
    const normalizedNames = nextSkills;

    try {
      const basicPayload: UpdateCandidateBasicDetailsRequest = {
        resumeHeadline: nextHeadline,
        skills: normalizedNames,
        workStatus: workStatus || undefined,
        isOutsideIndia: isOutsideIndia ?? undefined,
        currentCountry: country.trim() || undefined,
        currentCity: nextCity,
        currentArea: area.trim() || null,
        noticePeriod: noticePeriod || null,
        availabilityToJoin: basicDetails?.availabilityToJoin ?? null,
        currentAnnualSalary: basicDetails?.currentAnnualSalary ?? null,
        currentFixedAnnualSalary: basicDetails?.currentFixedAnnualSalary ?? null,
        currentVariableAnnualSalary: basicDetails?.currentVariableAnnualSalary ?? null,
        ...(basicDetails?.mobileVerified ? {} : { mobileNumber: mobileNumber.trim() || null }),
      };
      await updateBasicDetails(basicPayload).unwrap();
      await Promise.all([Promise.resolve(profileRefetch()), Promise.resolve(basicDetailsRefetch()), Promise.resolve(skills.refetch()), Promise.resolve(completionRefetch())]);
      onSaved();
    } catch (saveError: unknown) {
      await Promise.allSettled([Promise.resolve(profileRefetch()), Promise.resolve(basicDetailsRefetch()), Promise.resolve(skills.refetch()), Promise.resolve(completionRefetch())]);
      if (isDashboardApiError(saveError) && saveError.status === 400 && saveError.errors) {
        const get = (keys: string[]) => Object.entries(saveError.errors ?? {}).find(([key]) => keys.some((candidateKey) => key.toLocaleLowerCase().startsWith(candidateKey.toLocaleLowerCase())))?.[1]?.[0];
        setFieldErrors((current) => ({
          ...current,
          city: get(['currentCity', 'location']) ?? current.city,
          country: get(['currentCountry']) ?? current.country,
          headline: get(['resumeHeadline', 'headline']) ?? current.headline,
          mobileNumber: get(['mobileNumber']) ?? current.mobileNumber,
          isOutsideIndia: get(['isOutsideIndia']) ?? current.isOutsideIndia,
          skills: get(['skills', 'name']) ?? current.skills,
          workStatus: get(['workStatus']) ?? current.workStatus,
        }));
      }
      setError(isDashboardApiError(saveError) ? saveError.message : saveError instanceof Error ? saveError.message : 'Unable to save your profile. Please review the fields and try again.');
    }
  };

  return (
    <Stack component="section" spacing={2.25}>
      <TextField autoFocus disabled={isSaving} error={Boolean(fieldErrors.headline)} helperText={fieldErrors.headline} label="Resume headline" onChange={(event) => { setHeadline(event.target.value); setFieldErrors((current) => ({ ...current, headline: undefined })); }} required value={headline} />
      <TextField disabled={isSaving} error={Boolean(fieldErrors.workStatus)} helperText={fieldErrors.workStatus} label="Work status" onChange={(event) => { setWorkStatus(event.target.value as CandidateWorkStatus); setFieldErrors((current) => ({ ...current, workStatus: undefined })); }} required select value={workStatus}>
        <MenuItem value="Fresher">Fresher</MenuItem><MenuItem value="Experienced">Experienced</MenuItem>
      </TextField>
      <TextField disabled={isSaving} error={Boolean(fieldErrors.isOutsideIndia)} helperText={fieldErrors.isOutsideIndia} label="Are you currently outside India?" onChange={(event) => { setIsOutsideIndia(event.target.value === 'true'); setFieldErrors((current) => ({ ...current, isOutsideIndia: undefined })); }} required select value={isOutsideIndia === null ? '' : String(isOutsideIndia)}>
        <MenuItem value="false">No</MenuItem><MenuItem value="true">Yes</MenuItem>
      </TextField>
      <Autocomplete disabled={isSaving} onChange={(_, value) => { setCountry(value ?? ''); if (value !== country && !(value === 'India' && indianCities.some((option) => option.value.toLocaleLowerCase() === city.toLocaleLowerCase()))) setCity(''); setFieldErrors((current) => ({ ...current, country: undefined })); }} options={[...new Set([...countries.map((option) => option.value), ...(country ? [country] : [])])]} renderInput={(params) => <TextField {...params} error={Boolean(fieldErrors.country)} helperText={fieldErrors.country} label="Country" required />} value={country || null} />
      {country === 'India' ? <Autocomplete disabled={isSaving} freeSolo onInputChange={(_, value) => { setCity(value); setFieldErrors((current) => ({ ...current, city: undefined })); }} options={[...new Set([...indianCities.map((option) => option.value), ...(city ? [city] : [])])]} renderInput={(params) => <TextField {...params} error={Boolean(fieldErrors.city)} helperText={fieldErrors.city} label="City" required />} value={city} /> : <TextField disabled={isSaving} error={Boolean(fieldErrors.city)} fullWidth helperText={fieldErrors.city ?? 'Enter a city in the selected country.'} label="City" onChange={(event) => { setCity(event.target.value); setFieldErrors((current) => ({ ...current, city: undefined })); }} required value={city} />}
      <TextField disabled={isSaving} label="Area" onChange={(event) => setArea(event.target.value)} value={area} />
      <TextField
        disabled={isSaving}
        error={Boolean(fieldErrors.mobileNumber)}
        helperText={fieldErrors.mobileNumber ?? (basicDetails?.mobileVerified ? 'Verified mobile number.' : 'Enter a 10-digit Indian mobile number.')}
        inputProps={{ inputMode: 'numeric', maxLength: 10 }}
        label="Mobile number"
        slotProps={{ input: { readOnly: Boolean(basicDetails?.mobileVerified) } }}
        onChange={(event) => { setMobileNumber(event.target.value.replace(/\D/g, '').slice(0, 10)); setFieldErrors((current) => ({ ...current, mobileNumber: undefined })); }}
        value={mobileNumber}
      />
      <TextField disabled={isSaving} label="Notice period" onChange={(event) => setNoticePeriod(event.target.value as CandidateNoticePeriod | '')} select value={noticePeriod}>
        <MenuItem value=""><em>Not specified</em></MenuItem>
        {Object.entries(noticePeriodLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
      </TextField>
      <Stack spacing={1}>
        <Stack alignItems="flex-start" direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField disabled={isSaving} fullWidth label="Skills" onChange={(event) => setSkillInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkillName(); } }} value={skillInput} />
          <Button disabled={isSaving} onClick={addSkillName} startIcon={<AddOutlinedIcon />} variant="outlined">Add skill</Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {skillNames.map((name) => <Chip key={name} label={name} onDelete={isSaving ? undefined : () => { setSkillNames((current) => current.filter((item) => item !== name)); setFieldErrors((current) => ({ ...current, skills: undefined })); }} />)}
        </Stack>
        {fieldErrors.skills ? <FormHelperText error>{fieldErrors.skills}</FormHelperText> : null}
      </Stack>
      {skills.isLoading ? <PageLoadingIndicator compact label="Loading profile skills" /> : null}
      {skills.isError ? <Alert action={<Button color="inherit" onClick={() => void skills.refetch()}>Retry</Button>} severity="error">Your skills could not be loaded.</Alert> : null}
      {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
      {actionsNode ? createPortal(<>
        <Button disabled={isSaving} onClick={onCancel}>Cancel</Button>
        <Button disabled={isSaving || skills.isLoading} onClick={() => void save()} variant="contained">{isSaving ? 'Saving…' : 'Save basic details'}</Button>
      </>, actionsNode) : null}
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
const splitSelections = (items: string[]): string[] => {
  const selections: string[] = [];
  for (const item of items.flatMap((value) => value.split(','))) {
    const selection = item.trim();
    if (selection && !selections.some((existing) => existing.toLocaleLowerCase() === selection.toLocaleLowerCase())) selections.push(selection);
  }
  return selections;
};

const CareerPreferencesCard = ({ preferences }: { preferences: CareerPreferencesQuery }) => {
  const dispatch = useAppDispatch();
  const [save, saveState] = useUpdateCandidateCareerPreferencesMutation();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UpdateCandidateCareerPreferencesRequest>(emptyCareerPreferences);
  const [roleInput, setRoleInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [salaryInput, setSalaryInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedResponse, setSavedResponse] = useState<CandidateCareerPreferences | null>(null);
  const displayed = savedResponse ?? preferences.data;

  useEffect(() => {
    setSavedResponse(null);
  }, [preferences.data]);

  const openEditor = () => {
    if (!displayed) return;
    setValues({
      employmentTypes: [...displayed.employmentTypes],
      expectedAnnualSalary: displayed.expectedAnnualSalary,
      jobTypes: [...displayed.jobTypes],
      preferredCities: splitSelections(displayed.preferredCities),
      preferredJobRoles: splitSelections(displayed.preferredJobRoles),
      preferredShifts: [...displayed.preferredShifts],
    });
    setRoleInput('');
    setCityInput('');
    setSalaryInput(displayed.expectedAnnualSalary?.toString() ?? '');
    setError(null);
    setFieldErrors({});
    setOpen(true);
  };

  const addTextValue = (key: 'preferredJobRoles' | 'preferredCities', rawValue: string, limit: number) => {
    const additions = splitSelections([rawValue]);
    const label = key === 'preferredJobRoles' ? 'job role' : 'city';
    if (!additions.length || additions.some((value) => !isSafeProfessionalText(value))) { setError(`Enter a meaningful ${label} without markup or control characters.`); return; }
    if (additions.some((value) => values[key].some((item) => item.toLocaleLowerCase() === value.toLocaleLowerCase()))) { setError(`That ${label} is already selected.`); return; }
    if (values[key].length + additions.length > limit) { setError(`You can select up to ${limit} ${key === 'preferredJobRoles' ? 'job roles' : 'cities'}.`); return; }
    setValues((current) => ({ ...current, [key]: [...current[key], ...additions] }));
    if (key === 'preferredJobRoles') setRoleInput(''); else setCityInput('');
    setError(null);
    setFieldErrors({});
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
    if (salaryInput && !isWholeInrAmount(salaryInput)) {
      setFieldErrors({ expectedAnnualSalary: 'Enter a whole-number INR amount from 0 to 1,000,000,000.' });
      return;
    }
    const payload: UpdateCandidateCareerPreferencesRequest = {
      employmentTypes: values.employmentTypes,
      expectedAnnualSalary: salaryInput ? Number(salaryInput) : null,
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
      setSavedResponse(response);
      await Promise.resolve(preferences.refetch());
      setOpen(false);
    } catch (saveError: unknown) {
      if (isDashboardApiError(saveError) && saveError.status === 400 && saveError.errors) {
        setFieldErrors(Object.fromEntries(Object.entries(saveError.errors).flatMap(([field, messages]) => {
          const message = messages.find((value) => value.trim());
          return message ? [[field.charAt(0).toLocaleLowerCase() + field.slice(1).replace(/\[\d+\].*$/, ''), message]] : [];
        })));
      }
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
        {preferences.isLoading ? <PageLoadingIndicator compact label="Loading career preferences" /> : null}
        {preferences.isError ? <Alert action={<Button color="inherit" onClick={() => void preferences.refetch()}>Retry</Button>} severity="warning">Your career preferences are temporarily unavailable.</Alert> : null}
        {displayed && hasCareerPreferences(displayed) ? <CareerPreferenceSummary data={displayed} /> : null}
        {displayed && !hasCareerPreferences(displayed) ? <Typography color="text.secondary">Add your preferred roles, locations, and working preferences.</Typography> : null}
      </Stack>
      <Dialog aria-describedby="career-preferences-description" fullWidth maxWidth="md" onClose={saveState.isLoading ? undefined : () => setOpen(false)} open={open} sx={{ '& .MuiDialog-paper': { maxHeight: 'calc(100dvh - 32px)', m: 2, width: 'calc(100% - 32px)' } }}>
        <DialogTitle>Edit career preferences</DialogTitle>
        <DialogContent sx={{ minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          <Typography color="text.secondary" id="career-preferences-description" sx={{ mb: 2 }} variant="body2">Choose the roles and working conditions that fit your next opportunity.</Typography>
          <Stack spacing={3}>
            <PreferenceTextInput disabled={values.preferredJobRoles.length >= 3 || saveState.isLoading} error={fieldErrors.preferredJobRoles} helperText={`${values.preferredJobRoles.length}/3 selected`} input={roleInput} inputLabel="Preferred job roles" items={values.preferredJobRoles} limit={3} onAdd={() => addTextValue('preferredJobRoles', roleInput, 3)} onInput={setRoleInput} onRemove={(value) => removeTextValue('preferredJobRoles', value)} options={['.NET Developer', 'C++ Developer', 'UI/UX Designer', 'AI/ML Product Manager', 'Software Engineer', 'Product Manager']} />
            <PreferenceTextInput disabled={values.preferredCities.length >= 5 || saveState.isLoading} error={fieldErrors.preferredCities} helperText={`${values.preferredCities.length}/5 selected`} input={cityInput} inputLabel="Preferred cities" items={values.preferredCities} limit={5} onAdd={() => addTextValue('preferredCities', cityInput, 5)} onInput={setCityInput} onRemove={(value) => removeTextValue('preferredCities', value)} options={indianCities.map((option) => option.value)} />
            <TextField disabled={saveState.isLoading} error={Boolean(fieldErrors.expectedAnnualSalary)} helperText={fieldErrors.expectedAnnualSalary ?? 'INR per year'} inputProps={{ inputMode: 'numeric' }} label="Expected annual salary" onChange={(event) => setSalaryInput(event.target.value)} value={salaryInput} />
            <PreferenceOptions error={fieldErrors.jobTypes} label="Job type" onToggle={(value) => toggle('jobTypes', value as CandidateJobType)} options={jobTypeOptions} selected={values.jobTypes} />
            <PreferenceOptions error={fieldErrors.employmentTypes} label="Employment type" onToggle={(value) => toggle('employmentTypes', value as CandidateEmploymentPreference)} options={employmentPreferenceOptions} selected={values.employmentTypes} />
            <PreferenceOptions error={fieldErrors.preferredShifts} label="Preferred shift" onToggle={(value) => toggle('preferredShifts', value as CandidateShiftPreference)} options={shiftOptions} selected={values.preferredShifts} />
            {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions><Button disabled={saveState.isLoading} onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saveState.isLoading} onClick={() => void submit()} variant="contained">{saveState.isLoading ? 'Saving…' : 'Save preferences'}</Button></DialogActions>
      </Dialog>
    </Paper>
  );
};

const PreferenceTextInput = ({ disabled, error, helperText, input, inputLabel, items, onAdd, onInput, onRemove, options }: { disabled:boolean; error?:string; helperText:string; input:string; inputLabel:string; items:string[]; limit:number; onAdd:()=>void; onInput:(value:string)=>void; onRemove:(value:string)=>void; options:string[] }) => (
  <Stack spacing={1}>
    <Stack alignItems="flex-start" direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Autocomplete disabled={disabled} freeSolo fullWidth onInputChange={(_, value) => onInput(value)} options={options} renderInput={(params) => <TextField {...params} error={Boolean(error)} helperText={error ?? helperText} label={inputLabel} onKeyDown={(event) => { if (event.key === 'Enter' && !event.defaultPrevented) { event.preventDefault(); onAdd(); } }} />} value={input} />
      <Button disabled={disabled} onClick={onAdd} sx={{ minHeight: 44, minWidth: 88 }}>+ Add</Button>
    </Stack>
    <Stack direction="row" flexWrap="wrap" gap={1}>{items.map((item) => <Chip deleteIcon={<span aria-label={`Remove ${item}`}>×</span>} key={item} label={item} onDelete={() => onRemove(item)} />)}</Stack>
  </Stack>
);

const PreferenceOptions = ({ error, label, onToggle, options, selected }: { error?:string; label:string; onToggle:(value:string)=>void; options:readonly {label:string;value:string}[]; selected:readonly string[] }) => (
  <Stack spacing={1}><Typography fontWeight={750}>{label}</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{options.map((option) => { const active = selected.includes(option.value); return <Chip aria-label={`${active ? 'Remove' : 'Add'} ${option.label}`} color={active ? 'primary' : 'default'} key={option.value} label={`${active ? '×' : '+'} ${option.label}`} onClick={() => onToggle(option.value)} variant={active ? 'filled' : 'outlined'} />; })}</Stack>{error ? <FormHelperText error>{error}</FormHelperText> : null}</Stack>
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
