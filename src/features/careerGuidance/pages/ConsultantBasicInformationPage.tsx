import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  CameraAltOutlined,
  CheckCircleOutline,
  LockOutlined,
  LocationOnOutlined,
  MailOutline,
  PersonOutline,
  ScheduleOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import {
  useGetConsultantOnboardingQuery,
  useSaveConsultantOnboardingBasicMutation,
} from '../api/onboardingApi';
import { guidanceError, guidanceErrorMessage } from '../utils/errors';
import { guidanceRoutes } from '../utils/routes';

interface BasicForm {
  displayName: string;
  professionalHeadline: string;
  bio: string;
  location: string;
  professionalEmail: string;
}

interface FormErrors {
  displayName?: string;
  professionalHeadline?: string;
  bio?: string;
  location?: string;
  professionalEmail?: string;
}

const EMPTY_FORM: BasicForm = {
  displayName: '',
  professionalHeadline: '',
  bio: '',
  location: '',
  professionalEmail: '',
};

const STEPS = [
  'Basic information',
  'Professional details',
  'Expertise & services',
  'Availability',
  'Review & submit',
];

const clean = (value: string) => value.trim();

const validate = (form: BasicForm): FormErrors => {
  const errors: FormErrors = {};

  const name = clean(form.displayName);
  const headline = clean(form.professionalHeadline);
  const bio = clean(form.bio);
  const location = clean(form.location);
  const email = clean(form.professionalEmail);

  if (!name) errors.displayName = 'Full name is required.';
  else if (name.length > 120)
    errors.displayName = 'Full name must be 120 characters or fewer.';

  if (!headline) errors.professionalHeadline = 'Headline is required.';
  else if (headline.length > 200)
    errors.professionalHeadline = 'Headline must be 200 characters or fewer.';

  if (!bio) errors.bio = 'About you is required.';
  else if (bio.length > 4000)
    errors.bio = 'About you must be 4,000 characters or fewer.';

  if (!location) errors.location = 'Location is required.';
  else if (location.length > 200)
    errors.location = 'Location must be 200 characters or fewer.';

  if (!email) {
    errors.professionalEmail = 'Professional email is required.';
  } else if (email.length > 254) {
    errors.professionalEmail =
      'Professional email must be 254 characters or fewer.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.professionalEmail = 'Enter a valid professional email.';
  }

  return errors;
};

export default function ConsultantBasicInformationPage() {
  useDocumentMetadata(
    'Basic information | Become a consultant | Career Harbor',
    'Create your Career Harbor consultant profile.',
  );

  const navigate = useNavigate();

  const {
    data: onboarding,
    isLoading,
    isFetching,
    error: loadError,
    refetch,
  } = useGetConsultantOnboardingQuery();

  const [saveBasic, { isLoading: isSaving }] =
    useSaveConsultantOnboardingBasicMutation();

  const [form, setForm] = useState<BasicForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hydratedRevision, setHydratedRevision] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPhoto = async () => {
      try {
        const response = await apiClient.request<Blob>({
          method: 'GET',
          responseType: 'blob',
          url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO,
        });

        if (!active) return;

        const nextUrl = URL.createObjectURL(response.data);
        if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = nextUrl;
        setPhotoUrl(nextUrl);
      } catch {
        if (!active) return;
        if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = null;
        setPhotoUrl(null);
      }
    };

    void loadPhoto();

    return () => {
      active = false;
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = null;
      }
    };
  }, []);

  const choosePhoto = async (file: File | undefined) => {
    if (!file || isUploadingPhoto) return;

    setPhotoError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setPhotoError('Profile photo must be no larger than 1 MB.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const data = new FormData();
      data.append('file', file);

      await apiClient.request({
        data,
        method: 'PUT',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO,
      });

      const response = await apiClient.request<Blob>({
        method: 'GET',
        responseType: 'blob',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO,
      });

      const nextUrl = URL.createObjectURL(response.data);
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = nextUrl;
      setPhotoUrl(nextUrl);

      window.dispatchEvent(new Event('careerharbor:profile-photo-changed'));
    } catch {
      setPhotoError('Unable to update your profile photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!onboarding || hydratedRevision === onboarding.revision) return;

    setForm({
      displayName: onboarding.displayName ?? '',
      professionalHeadline: onboarding.professionalHeadline ?? '',
      bio: onboarding.bio ?? '',
      location: onboarding.location ?? '',
      professionalEmail:
        onboarding.professionalEmail ?? onboarding.accountEmail ?? '',
    });

    setHydratedRevision(onboarding.revision);
  }, [onboarding, hydratedRevision]);

  const initials = useMemo(() => {
    const parts = clean(form.displayName)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part[0]?.toUpperCase()).join('') || '?';
  }, [form.displayName]);

  const update = (field: keyof BasicForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(null);
  };

  const save = async (goNext: boolean) => {
    if (!onboarding || isSaving) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSaveError(null);

    try {
      const updated = await saveBasic({
        revision: onboarding.revision,
        displayName: clean(form.displayName),
        professionalHeadline: clean(form.professionalHeadline),
        bio: clean(form.bio),
        location: clean(form.location),
        professionalEmail: clean(form.professionalEmail),
      }).unwrap();

      setHydratedRevision(updated.revision);

      if (goNext) {
  await navigate(guidanceRoutes.consultantOnboardingProfessional);
} else {
  await navigate(guidanceRoutes.marketplace);
}
    } catch (cause: unknown) {
      const { status } = guidanceError(cause);

      if (status === 409) {
        await refetch();
      }

      setSaveError(guidanceErrorMessage(cause));
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={34} />
          <Typography color="text.secondary">
            Loading your consultant profile…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (loadError || !onboarding) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          {guidanceErrorMessage(loadError)}
        </Alert>
      </Paper>
    );
  }

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Typography variant="body2" color="text.secondary">
        Career Guidance &nbsp;›&nbsp; Become a consultant &nbsp;›&nbsp;{' '}
        <Box component="span" color="text.primary">
          Create profile
        </Box>
      </Typography>

      <Box
        component="nav"
        aria-label="Consultant onboarding progress"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {STEPS.map((step, index) => (
          <Box key={step}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  bgcolor: index === 0 ? 'primary.main' : 'grey.100',
                  color: index === 0 ? 'primary.contrastText' : 'text.secondary',
                  border: '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider',
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </Box>

              <Typography
                variant="body2"
                fontWeight={index === 0 ? 800 : 600}
                color={index === 0 ? 'primary.main' : 'text.secondary'}
              >
                {step}
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 1,
                height: 3,
                borderRadius: 99,
                bgcolor: index === 0 ? 'primary.main' : 'grey.200',
              }}
            />
          </Box>
        ))}
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Let&apos;s create your consultant profile
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Start with some basic information. This helps job seekers get to
            know you.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleOutlined fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Takes about 10–15 minutes
          </Typography>
        </Stack>
      </Stack>

      <Alert
        severity="info"
        icon={<LockOutlined />}
        sx={{ alignItems: 'center' }}
      >
        <Typography fontWeight={800}>Your information is secure</Typography>
        <Typography variant="body2">
          We keep your account information protected and only publish profile
          information according to your consultant profile settings.
        </Typography>
      </Alert>

      {saveError && <Alert severity="error">{saveError}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 320px',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: 'primary.50',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                }}
              >
                <PersonOutline />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Basic information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add the details job seekers will use to understand who you
                  are.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '190px minmax(0, 1fr)',
              },
              gap: 4,
            }}
          >
            <Stack spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ alignSelf: 'flex-start' }}
              >
                Profile photo
              </Typography>

              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={photoUrl ?? undefined}
                  sx={{
                    width: 132,
                    height: 132,
                    fontSize: 34,
                    fontWeight: 800,
                  }}
                >
                  {initials}
                </Avatar>

                <Button
                  aria-label="Change profile photo"
                  disabled={isUploadingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    right: 2,
                    bottom: 2,
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    p: 0,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  {isUploadingPhoto ? (
                    <CircularProgress size={18} />
                  ) : (
                    <CameraAltOutlined fontSize="small" />
                  )}
                </Button>
              </Box>

              <input
                ref={photoInputRef}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Choose profile photo"
                onChange={(event) => {
                  void choosePhoto(event.target.files?.[0]);
                }}
              />

              <Button
                variant="outlined"
                disabled={isUploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {isUploadingPhoto
                  ? 'Uploading…'
                  : photoUrl
                    ? 'Replace photo'
                    : 'Upload photo'}
              </Button>

              {photoError ? (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {photoError}
                </Alert>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign={{ xs: 'left', md: 'center' }}
                >
                  JPEG, PNG, or WebP. Maximum file size 1 MB.
                </Typography>
              )}
            </Stack>

            <Stack spacing={2.25}>
              <TextField
                fullWidth
                required
                label="Full name"
                value={form.displayName}
                onChange={(event) => update('displayName', event.target.value)}
                error={Boolean(errors.displayName)}
                helperText={
                  errors.displayName ??
                  `${form.displayName.length}/120 characters`
                }
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />

              <TextField
                fullWidth
                required
                label="Headline"
                value={form.professionalHeadline}
                onChange={(event) =>
                  update('professionalHeadline', event.target.value)
                }
                error={Boolean(errors.professionalHeadline)}
                helperText={
                  errors.professionalHeadline ??
                  'A short title that describes what you do, for example Senior HR Manager or Career Coach.'
                }
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />

              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                label="About you"
                value={form.bio}
                onChange={(event) => update('bio', event.target.value)}
                error={Boolean(errors.bio)}
                helperText={
                  errors.bio ??
                  `Tell job seekers about your experience and how you can help. ${form.bio.length}/4000`
                }
                slotProps={{ htmlInput: { maxLength: 4000 } }}
              />

              <TextField
                fullWidth
                required
                label="Location"
                value={form.location}
                onChange={(event) => update('location', event.target.value)}
                error={Boolean(errors.location)}
                helperText={errors.location}
                slotProps={{
                  htmlInput: { maxLength: 200 },
                  input: {
                    startAdornment: (
                      <LocationOnOutlined
                        fontSize="small"
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                required
                type="email"
                label="Professional email"
                value={form.professionalEmail}
                onChange={(event) =>
                  update('professionalEmail', event.target.value)
                }
                error={Boolean(errors.professionalEmail)}
                helperText={
                  errors.professionalEmail ??
                  'Used for consultant-related communication. This is not shown publicly unless the product explicitly allows it.'
                }
                slotProps={{
                  htmlInput: { maxLength: 254 },
                  input: {
                    startAdornment: (
                      <MailOutline
                        fontSize="small"
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                    ),
                  },
                }}
              />
            </Stack>
          </Box>
        </Paper>

        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'primary.50',
            }}
          >
            <Typography fontWeight={800}>Tips for a great profile</Typography>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {[
                'Use a clear, professional profile photo.',
                'Write a concise and specific headline.',
                'Explain the experience you can share with job seekers.',
                'You can return and update your draft before submitting.',
              ].map((tip) => (
                <Stack key={tip} direction="row" spacing={1} alignItems="flex-start">
                  <CheckCircleOutline
                    color="primary"
                    fontSize="small"
                    sx={{ mt: 0.15 }}
                  />
                  <Typography variant="body2">{tip}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography fontWeight={800}>Profile preview</Typography>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Avatar
                src={photoUrl ?? undefined}
                sx={{ width: 52, height: 52 }}
              >
                {initials}
              </Avatar>

              <Box minWidth={0}>
                <Typography fontWeight={800}>
                  {clean(form.displayName) || 'Your name'}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {clean(form.professionalHeadline) ||
                    'Your professional headline'}
                </Typography>

                {clean(form.location) && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {clean(form.location)}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2 }}
            >
              This is a draft preview. Platform review happens only after you
              complete and submit the application.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'success.50',
            }}
          >
            <Typography fontWeight={800}>Make a real impact</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Share your knowledge, guide job seekers, and be part of a
              supportive professional community.
            </Typography>
          </Paper>
        </Stack>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          position: 'sticky',
          bottom: 12,
          zIndex: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Button
            variant="outlined"
            disabled={isSaving || isFetching}
            onClick={() => {
              void save(false);
            }}
          >
            Save and exit
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            disabled={isSaving || isFetching}
            onClick={() => {
              void save(true);
            }}
          >
            {isSaving ? 'Saving…' : 'Next: Professional details'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}