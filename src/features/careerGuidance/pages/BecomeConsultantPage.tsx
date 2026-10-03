import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  BadgeOutlined,
  CameraAltOutlined,
  CheckCircle,
  LightbulbOutlined,
  LocationOnOutlined,
  LockOutlined,
  MailOutline,
  ParkOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import {
  useGetConsultantOnboardingQuery,
  useSaveConsultantOnboardingBasicMutation,
  useStartConsultantOnboardingMutation,
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

  if (!name) {
    errors.displayName = 'Full name is required.';
  } else if (name.length > 120) {
    errors.displayName = 'Full name must be 120 characters or fewer.';
  }

  if (!headline) {
    errors.professionalHeadline = 'Headline is required.';
  } else if (headline.length > 200) {
    errors.professionalHeadline = 'Headline must be 200 characters or fewer.';
  }

  if (!bio) {
    errors.bio = 'About you is required.';
  } else if (bio.length > 4000) {
    errors.bio = 'About you must be 4,000 characters or fewer.';
  }

  if (!location) {
    errors.location = 'Location is required.';
  } else if (location.length > 200) {
    errors.location = 'Location must be 200 characters or fewer.';
  }

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

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
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

  const [startOnboarding, { isLoading: isStarting }] =
    useStartConsultantOnboardingMutation();

  const [form, setForm] = useState<BasicForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hydratedRevision, setHydratedRevision] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const photoMounted = useRef(false);
  const photoRequest = useRef(0);
  const photoUploadPending = useRef(false);

  const loadPhoto = useCallback(async () => {
    const requestId = ++photoRequest.current;
    const response = await apiClient.request<Blob>({
      method: 'GET', responseType: 'blob', url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO,
    });
    if (!photoMounted.current || requestId !== photoRequest.current) return;
    const nextUrl = URL.createObjectURL(response.data);
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = nextUrl;
    setPhotoUrl(nextUrl);
  }, []);

  useEffect(() => {
    photoMounted.current = true;
    void loadPhoto().catch(() => {
      // A candidate without a photo keeps the existing initials placeholder.
    });
    return () => {
      photoMounted.current = false;
      photoRequest.current += 1;
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
    };
  }, [loadPhoto]);

  const uploadPhoto = async (file: File | undefined) => {
    if (!file || photoUploadPending.current) return;
    setPhotoError(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setPhotoError('Profile photo must be no larger than 1 MB.');
      return;
    }
    photoUploadPending.current = true;
    setIsUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append('file', file);
      await apiClient.request({ method: 'PUT', data, url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO });
      await loadPhoto();
      window.dispatchEvent(new Event('careerharbor:profile-photo-changed'));
    } catch {
      if (photoMounted.current) setPhotoError('Unable to update your profile photo. Please try again.');
    } finally {
      photoUploadPending.current = false;
      if (photoMounted.current) setIsUploadingPhoto(false);
    }
  };

  const startAttempt = useRef<Promise<unknown> | null>(null);
  const loadStatus = guidanceError(loadError).status;

  useEffect(() => {
    if (loadStatus !== 404 || onboarding || startError) return;

    // Reuse this attempt across re-renders and StrictMode effect replay.
    // A failed POST or follow-up GET must not automatically create another draft.
    if (!startAttempt.current) {
      startAttempt.current = startOnboarding().unwrap().then(() => refetch().unwrap());
    }

    let cancelled = false;
    void startAttempt.current.catch((cause: unknown) => {
      if (!cancelled) setStartError(guidanceErrorMessage(cause));
    });

    return () => {
      cancelled = true;
    };
  }, [loadStatus, onboarding, startError, startOnboarding, refetch]);

  const retryLoad = async () => {
    // Recheck first: a timed-out creation may already have reached the backend.
    const result = await refetch();
    if (startError) {
      if (guidanceError(result.error).status === 404) startAttempt.current = null;
      setStartError(null);
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
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

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

  if (isLoading || (loadStatus === 404 && !startError && !onboarding)) {
    return (
      <Box
        sx={{
          minHeight: 500,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={34} />
          <Typography color="text.secondary">
            {isStarting ? 'Setting up your consultant profile…' : 'Loading your consultant profile…'}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (loadError || startError || !onboarding) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              disabled={isFetching || isStarting}
              onClick={() => {
                void retryLoad();
              }}
            >
              Retry
            </Button>
          }
        >
          {startError ?? guidanceErrorMessage(loadError)}
        </Alert>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: '1440px',
        mx: 'auto',
        pb: 5,
      }}
    >
      {/* Breadcrumb */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2.5 }}
      >
        Career Guidance
        <Box component="span" sx={{ mx: 1 }}>
          ›
        </Box>
        Become a consultant
        <Box component="span" sx={{ mx: 1 }}>
          ›
        </Box>
        <Box component="span" color="text.primary" fontWeight={700}>
          Create profile
        </Box>
      </Typography>

      {/* Stepper */}
      <Box
        component="nav"
        aria-label="Consultant onboarding progress"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: { xs: 1.5, md: 2 },
          mb: 4,
        }}
      >
        {STEPS.map((step, index) => {
          const active = index === 0;

          return (
            <Box key={step}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    fontSize: 14,
                    fontWeight: 800,
                    bgcolor: active ? '#0b63f6' : '#f7f9fc',
                    color: active ? '#fff' : '#243b6b',
                    border: '2px solid',
                    borderColor: active ? '#0b63f6' : '#cbd8f2',
                  }}
                >
                  {index + 1}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: active ? 800 : 600,
                    color: active ? '#075ed1' : '#1b2b52',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step}
                </Typography>
              </Stack>

              <Box
                sx={{
                  height: 2,
                  mt: 1.2,
                  ml: 0.5,
                  borderRadius: 20,
                  bgcolor: active ? '#0b63f6' : '#dbe4f4',
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Heading + security */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 330px',
          },
          gap: 3,
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1, md: 4 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: '1.7rem',
                  md: '2.1rem',
                },
                lineHeight: 1.15,
                fontWeight: 850,
                color: '#101d45',
              }}
            >
              Let&apos;s create your consultant profile
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                whiteSpace: 'nowrap',
                color: '#26375f',
              }}
            >
              <ScheduleOutlined fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                Takes about 10–15 minutes
              </Typography>
            </Stack>
          </Stack>

          <Typography
            sx={{
              mt: 1,
              fontSize: '1rem',
              color: '#52658e',
            }}
          >
            Start with some basic information. This helps job seekers get to
            know you.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            bgcolor: '#eef6ff',
            borderRadius: 2.5,
            px: 2.25,
            py: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: '#dcecff',
                color: '#0b63f6',
                flexShrink: 0,
              }}
            >
              <LockOutlined />
            </Box>

            <Box>
              <Typography
                variant="body2"
                fontWeight={800}
                color="#172b58"
              >
                Your information is secure
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 0.25, color: '#52658e' }}
              >
                We keep your account information protected.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {saveError}
        </Alert>
      )}

      {/* Main layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2.65fr) minmax(280px, 1fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Main card */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e1e7f0',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(27, 50, 94, 0.05)',
          }}
        >
          {/* Card heading */}
          <Box sx={{ px: 3.5, py: 2.5 }}>
            <Stack direction="row" spacing={1.7} alignItems="center">
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  bgcolor: '#eef5ff',
                  color: '#0b63f6',
                }}
              >
                <BadgeOutlined />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 850,
                    color: '#101d45',
                  }}
                >
                  Basic information
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#637398', mt: 0.2 }}
                >
                  Tell us about yourself
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Form */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '250px minmax(0, 1fr)',
              },
              gap: { xs: 3, md: 4.5 },
            }}
          >
            {/* Photo */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={800}
                sx={{ mb: 1.5, color: '#172343' }}
              >
                Profile photo
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  maxWidth: 245,
                  aspectRatio: '1 / 1',
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#eef2f7',
                  border: '1px solid #e1e6ef',
                }}
              >
                {photoUrl ? (
                  <Box
                    component="img"
                    src={photoUrl}
                    alt="Consultant profile"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: '#d9dde5',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 52,
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      {initials}
                    </Typography>
                  </Box>
                )}

                <IconButton
                  aria-label="Upload profile photo"
                  disabled={isUploadingPhoto}
                  onClick={() => photoInput.current?.click()}
                  sx={{
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    width: 44,
                    height: 44,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    bgcolor: '#fff',
                    color: '#26375f',
                    border: '1px solid #d7dfec',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.10)',
                  }}
                >
                  <CameraAltOutlined />
                </IconButton>
              </Box>

              <input
                ref={photoInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                aria-label="Profile photo file"
                onChange={(event) => {
                  const file = event.currentTarget.files?.item(0) ?? undefined;
                  event.currentTarget.value = '';
                  void uploadPhoto(file);
                }}
              />

              <Button
                fullWidth
                variant="outlined"
                startIcon={<CameraAltOutlined />}
                disabled={isUploadingPhoto}
                onClick={() => photoInput.current?.click()}
                sx={{
                  maxWidth: 245,
                  mt: 2,
                  height: 48,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 750,
                }}
              >
                {isUploadingPhoto ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
              </Button>

              <Typography
                variant="caption"
                display="block"
                sx={{
                  maxWidth: 245,
                  textAlign: 'center',
                  mt: 1,
                  color: '#7180a0',
                }}
              >
                JPEG, PNG, or WebP. Maximum file size 1 MB.
              </Typography>
              {photoError && <Alert severity="error" sx={{ mt: 1, maxWidth: 245 }}>{photoError}</Alert>}
            </Box>

            {/* Fields */}
            <Stack spacing={2.2}>
              <Box>
                <Typography
                  component="label"
                  variant="body2"
                  fontWeight={800}
                  sx={{
                    display: 'block',
                    mb: 0.8,
                    color: '#172343',
                  }}
                >
                  Full name{' '}
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>

                <TextField
                  fullWidth
                  placeholder="Enter your full name"
                  value={form.displayName}
                  onChange={(event) =>
                    update('displayName', event.target.value)
                  }
                  error={Boolean(errors.displayName)}
                  helperText={
                    errors.displayName ??
                    `${form.displayName.length}/120 characters`
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 120,
                      'aria-label': 'Full name',
                    },
                  }}
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  variant="body2"
                  fontWeight={800}
                  sx={{
                    display: 'block',
                    mb: 0.8,
                    color: '#172343',
                  }}
                >
                  Headline{' '}
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>

                <TextField
                  fullWidth
                  placeholder="e.g. Senior HR Manager | Career Coach"
                  value={form.professionalHeadline}
                  onChange={(event) =>
                    update('professionalHeadline', event.target.value)
                  }
                  error={Boolean(errors.professionalHeadline)}
                  helperText={
                    errors.professionalHeadline ??
                    'A short title that describes what you do.'
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 200,
                      'aria-label': 'Headline',
                    },
                  }}
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  variant="body2"
                  fontWeight={800}
                  sx={{
                    display: 'block',
                    mb: 0.8,
                    color: '#172343',
                  }}
                >
                  Location{' '}
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>

                <TextField
                  fullWidth
                  placeholder="City, State, Country"
                  value={form.location}
                  onChange={(event) =>
                    update('location', event.target.value)
                  }
                  error={Boolean(errors.location)}
                  helperText={errors.location}
                  slotProps={{
                    htmlInput: {
                      maxLength: 200,
                      'aria-label': 'Location',
                    },
                    input: {
                      startAdornment: (
                        <LocationOnOutlined
                          fontSize="small"
                          sx={{
                            mr: 1,
                            color: '#51658f',
                          }}
                        />
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  variant="body2"
                  fontWeight={800}
                  sx={{
                    display: 'block',
                    mb: 0.8,
                    color: '#172343',
                  }}
                >
                  Professional email{' '}
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>

                <TextField
                  fullWidth
                  type="email"
                  placeholder="name@company.com"
                  value={form.professionalEmail}
                  onChange={(event) =>
                    update('professionalEmail', event.target.value)
                  }
                  error={Boolean(errors.professionalEmail)}
                  helperText={
                    errors.professionalEmail ??
                    'Used for consultant-related communication.'
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 254,
                      'aria-label': 'Professional email',
                    },
                    input: {
                      startAdornment: (
                        <MailOutline
                          fontSize="small"
                          sx={{
                            mr: 1,
                            color: '#51658f',
                          }}
                        />
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <Typography
                  component="label"
                  variant="body2"
                  fontWeight={800}
                  sx={{
                    display: 'block',
                    mb: 0.8,
                    color: '#172343',
                  }}
                >
                  About you{' '}
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Tell job seekers about your experience and how you can help them."
                  value={form.bio}
                  onChange={(event) => update('bio', event.target.value)}
                  error={Boolean(errors.bio)}
                  helperText={
                    errors.bio ??
                    `${form.bio.length}/4000 characters`
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 4000,
                      'aria-label': 'About you',
                    },
                  }}
                  sx={fieldSx}
                />
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Right column */}
        <Stack spacing={2.2}>
          {/* Tips */}
          <Paper
            elevation={0}
            sx={{
              p: 2.6,
              borderRadius: 3,
              bgcolor: '#f3f8ff',
              border: '1px solid #e1ebfa',
            }}
          >
            <Stack direction="row" spacing={1.3} alignItems="center">
              <LightbulbOutlined sx={{ color: '#0b63f6' }} />

              <Typography
                fontWeight={850}
                sx={{ color: '#101d45' }}
              >
                Tips for a great profile
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 2.2 }}>
              {[
                'Use a clear, professional photo',
                'Write a concise and compelling headline',
                'Describe how your experience can help job seekers',
                'You can edit your draft before submitting',
              ].map((tip) => (
                <Stack
                  key={tip}
                  direction="row"
                  spacing={1.2}
                  alignItems="flex-start"
                >
                  <CheckCircle
                    sx={{
                      color: '#10a84b',
                      fontSize: 21,
                      mt: '1px',
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.45,
                      color: '#25375f',
                    }}
                  >
                    {tip}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* Real preview */}
          <Paper
            elevation={0}
            sx={{
              p: 2.6,
              borderRadius: 3,
              border: '1px solid #e1e7f0',
              boxShadow: '0 5px 20px rgba(27, 50, 94, 0.04)',
            }}
          >
            <Typography
              fontWeight={850}
              sx={{
                color: '#101d45',
                mb: 2,
              }}
            >
              Profile preview
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Avatar
                src={photoUrl ?? undefined}
                sx={{
                  width: 62,
                  height: 62,
                  bgcolor: '#d8dde7',
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {initials}
              </Avatar>

              <Box minWidth={0}>
                <Typography
                  fontWeight={850}
                  sx={{ color: '#101d45' }}
                >
                  {clean(form.displayName) || 'Your name'}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.2,
                    color: '#5d6e93',
                    lineHeight: 1.35,
                  }}
                >
                  {clean(form.professionalHeadline) ||
                    'Your professional headline'}
                </Typography>

                {clean(form.location) && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 0.8 }}
                  >
                    <LocationOnOutlined
                      sx={{
                        fontSize: 15,
                        color: '#6b7a99',
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{ color: '#6b7a99' }}
                    >
                      {clean(form.location)}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>

            {clean(form.bio) && (
              <>
                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="body2"
                  sx={{
                    color: '#52658e',
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {clean(form.bio)}
                </Typography>
              </>
            )}

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 2,
                color: '#7a88a6',
              }}
            >
              Draft preview. Your consultant profile is reviewed after you
              complete and submit the application.
            </Typography>
          </Paper>

          {/* Impact */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#effbf4',
              border: '1px solid #daf2e3',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#e1f7e9',
                  color: '#0da64a',
                  flexShrink: 0,
                }}
              >
                <ParkOutlined />
              </Box>

              <Box>
                <Typography
                  fontWeight={850}
                  sx={{ color: '#172343' }}
                >
                  Make a real impact
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.35,
                    color: '#536681',
                    lineHeight: 1.45,
                  }}
                >
                  Share your knowledge, guide job seekers, and be part of a
                  supportive community.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* Bottom actions */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: '#f3f8ff',
          border: '1px solid #e0e9f7',
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
            sx={{
              minWidth: 150,
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 750,
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
            sx={{
              minWidth: 250,
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 800,
              boxShadow: 'none',
            }}
          >
            {isSaving ? 'Saving…' : 'Next: Professional details'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
