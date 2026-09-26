import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ArrowForward,
  Check,
  DeleteOutline,
  LanguageOutlined,
  LightbulbOutlined,
  SellOutlined,
  StarBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import {
  type ConsultantServiceItem,
  useCreateConsultantServiceMutation,
  useDeleteConsultantServiceMutation,
  useGetConsultantOnboardingQuery,
  useSaveConsultantOnboardingExpertiseMutation,
  useUpdateConsultantServiceMutation,
} from '../api/onboardingApi';
import { guidanceError, guidanceErrorMessage } from '../utils/errors';
import { guidanceRoutes } from '../utils/routes';

interface ServiceDraft {
  key: string;
  id: string | null;
  serviceType: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: string;
  currency: 'INR';
  isActive: boolean;
  original: ConsultantServiceItem | null;
}

const STEPS = [
  'Basic information',
  'Professional details',
  'Expertise & services',
  'Availability',
  'Review & submit',
];

const SUGGESTED_EXPERTISE = [
  'Career Planning',
  'Resume Review',
  'Interview Preparation',
  'Job Search Strategy',
  'Salary Negotiation',
  'Career Transition',
  'Leadership',
  'Software Engineering',
  'Product Management',
  'Data & Analytics',
  'Human Resources',
  'Recruitment',
];

const SUGGESTED_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Gujarati',
];

const DURATION_OPTIONS = [15, 30, 60];

const clean = (value: string) => value.trim();

const normalize = (value: string) => clean(value).toLocaleLowerCase();

const createKey = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toDraft = (service: ConsultantServiceItem): ServiceDraft => ({
  key: service.id,
  id: service.id,
  serviceType: service.serviceType,
  title: service.title,
  description: service.description ?? '',
  durationMinutes: service.durationMinutes,
  price: String(service.price),
  currency: 'INR',
  isActive: service.isActive,
  original: service,
});

const newService = (durationMinutes = 30): ServiceDraft => ({
  key: createKey(),
  id: null,
  serviceType: 'VideoConsultation',
  title: `${durationMinutes}-minute career consultation`,
  description: '',
  durationMinutes,
  price: '',
  currency: 'INR',
  isActive: true,
  original: null,
});

const sameService = (
  draft: ServiceDraft,
  original: ConsultantServiceItem,
) =>
  clean(draft.serviceType) === clean(original.serviceType) &&
  clean(draft.title) === clean(original.title) &&
  clean(draft.description) === clean(original.description ?? '') &&
  draft.durationMinutes === original.durationMinutes &&
  Number(draft.price) === Number(original.price) &&
  draft.currency === original.currency &&
  draft.isActive === original.isActive;

export default function ConsultantExpertiseServicesPage() {
  useDocumentMetadata(
    'Expertise & services | Become a consultant | Career Harbor',
    'Configure your expertise, languages and consultation services.',
  );

  const navigate = useNavigate();

  const {
    data: onboarding,
    isLoading,
    isFetching,
    error: loadError,
    refetch,
  } = useGetConsultantOnboardingQuery();

  const [saveExpertise, { isLoading: savingExpertise }] =
    useSaveConsultantOnboardingExpertiseMutation();

  const [createService, { isLoading: creatingService }] =
    useCreateConsultantServiceMutation();

  const [updateService, { isLoading: updatingService }] =
    useUpdateConsultantServiceMutation();

  const [deleteService, { isLoading: deletingService }] =
    useDeleteConsultantServiceMutation();

  const [expertise, setExpertise] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [services, setServices] = useState<ServiceDraft[]>([]);

  const [hydratedRevision, setHydratedRevision] = useState<string | null>(
    null,
  );
  const [validationError, setValidationError] = useState<string | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const isSaving =
    savingExpertise ||
    creatingService ||
    updatingService ||
    deletingService;

  useEffect(() => {
    if (!onboarding || hydratedRevision === onboarding.revision) return;

    setExpertise(onboarding.expertise ?? []);
    setLanguages(onboarding.languages ?? []);
    setServices((onboarding.services ?? []).map(toDraft));
    setHydratedRevision(onboarding.revision);
  }, [onboarding, hydratedRevision]);

  const initials = useMemo(() => {
    const parts = onboarding?.displayName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return parts?.map((part) => part[0]?.toUpperCase()).join('') || '?';
  }, [onboarding?.displayName]);

  const addUnique = (
    rawValue: string,
    current: string[],
    maximum: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const value = clean(rawValue);

    if (!value) return;

    if (current.some((item) => normalize(item) === normalize(value))) {
      return;
    }

    if (current.length >= maximum) {
      setValidationError(
        `You can add up to ${maximum} ${
          maximum === 10 ? 'languages' : 'areas of expertise'
        }.`,
      );
      return;
    }

    setter([...current, value]);
    setValidationError(null);
  };

  const removeValue = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.filter((item) => normalize(item) !== normalize(value)),
    );
  };

  const updateServiceDraft = (
    key: string,
    patch: Partial<ServiceDraft>,
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.key === key ? { ...service, ...patch } : service,
      ),
    );

    setValidationError(null);
    setSaveError(null);
  };

  const validate = () => {
    if (expertise.length === 0) {
      return 'Add at least one area of expertise.';
    }

    if (expertise.length > 20) {
      return 'You can add up to 20 areas of expertise.';
    }

    if (languages.length === 0) {
      return 'Add at least one language.';
    }

    if (languages.length > 10) {
      return 'You can add up to 10 languages.';
    }

    const activeServices = services.filter((service) => service.isActive);

    if (activeServices.length === 0) {
      return 'Add at least one active consultation service.';
    }

    for (const service of services) {
      if (!clean(service.serviceType)) {
        return 'Every service must have a service type.';
      }

      if (!clean(service.title)) {
        return 'Every service must have a title.';
      }

      if (!DURATION_OPTIONS.includes(service.durationMinutes)) {
        return 'Consultation duration must be 15, 30 or 60 minutes.';
      }

      const price = Number(service.price);

      if (!Number.isFinite(price) || price <= 0) {
        return 'Enter a valid price greater than ₹0 for every service.';
      }

      if (service.currency !== 'INR') {
        return 'New consultation services must use INR.';
      }
    }

    return null;
  };

  const saveAll = async (goNext: boolean) => {
    if (!onboarding || isSaving) return;

    const problem = validate();

    if (problem) {
      setValidationError(problem);
      return;
    }

    setValidationError(null);
    setSaveError(null);

    try {
      let revision = onboarding.revision;

      const expertiseResult = await saveExpertise({
        revision,
        languages: languages.map(clean),
        expertise: expertise.map(clean),
      }).unwrap();

      revision = expertiseResult.revision;

      const originalServices = onboarding.services ?? [];

      const deletedServices = originalServices.filter(
        (original) =>
          !services.some((service) => service.id === original.id),
      );

      for (const deleted of deletedServices) {
        const result = await deleteService({
          serviceId: deleted.id,
          revision,
        }).unwrap();

        revision = result.revision;
      }

      for (const service of services) {
        const payload = {
          serviceType: clean(service.serviceType),
          title: clean(service.title),
          description: clean(service.description),
          durationMinutes: service.durationMinutes,
          price: Number(service.price),
          currency: service.currency,
          isActive: service.isActive,
          revision,
        };

        if (!service.id) {
          const result = await createService(payload).unwrap();
          revision = result.revision;
          continue;
        }

        const original = originalServices.find(
          (item) => item.id === service.id,
        );

        if (original && sameService(service, original)) {
          continue;
        }

        const result = await updateService({
          serviceId: service.id,
          ...payload,
        }).unwrap();

        revision = result.revision;
      }

      setHydratedRevision(revision);

      if (goNext) {
        await navigate(guidanceRoutes.consultantOnboardingAvailability);
      } else {
        await navigate(guidanceRoutes.marketplace);
      }
    } catch (cause: unknown) {
      if (guidanceError(cause).status === 409) {
        await refetch();
      }

      setSaveError(guidanceErrorMessage(cause));
    }
  };

  if (isLoading) {
    return (
      <Box minHeight={450} display="grid" sx={{ placeItems: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">
            Loading expertise and services…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (loadError || !onboarding) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
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
    );
  }

  return (
    <Stack spacing={3} sx={{ pb: 5 }}>
      <Typography variant="body2" color="text.secondary">
        Career Guidance &nbsp;›&nbsp; Become a consultant &nbsp;›&nbsp;
        <Box component="span" color="text.primary">
          Create profile
        </Box>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {STEPS.map((step, index) => {
          const complete = index < 2;
          const active = index === 2;

          return (
            <Box key={step}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    bgcolor:
                      complete || active ? 'primary.main' : 'grey.100',
                    color:
                      complete || active
                        ? 'primary.contrastText'
                        : 'text.secondary',
                  }}
                >
                  {complete ? <Check fontSize="small" /> : index + 1}
                </Box>

                <Typography
                  variant="body2"
                  fontWeight={active ? 800 : 600}
                  color={
                    complete || active
                      ? 'primary.main'
                      : 'text.secondary'
                  }
                >
                  {step}
                </Typography>
              </Stack>

              <Box
                sx={{
                  mt: 1,
                  height: 3,
                  borderRadius: 20,
                  bgcolor:
                    complete || active ? 'primary.main' : 'grey.200',
                }}
              />
            </Box>
          );
        })}
      </Box>

      <Box>
        <Typography variant="h4" fontWeight={850}>
          What can you help job seekers with?
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Select your expertise, languages and the consultation services you
          want to offer.
        </Typography>
      </Box>

      {validationError && (
        <Alert severity="warning">{validationError}</Alert>
      )}

      {saveError && <Alert severity="error">{saveError}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2.6fr) minmax(280px, 1fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2.5 }}
            >
              <StarBorder color="primary" />

              <Box>
                <Typography variant="h6" fontWeight={850}>
                  Areas of expertise
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add the topics you can confidently guide job seekers on.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              sx={{ mb: 2.5 }}
            >
              {expertise.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  color="primary"
                  onDelete={() => removeValue(item, setExpertise)}
                />
              ))}
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
            >
              <TextField
                fullWidth
                label="Add expertise"
                placeholder="e.g. System Design"
                value={expertiseInput}
                onChange={(event) =>
                  setExpertiseInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;

                  event.preventDefault();

                  addUnique(
                    expertiseInput,
                    expertise,
                    20,
                    setExpertise,
                  );

                  setExpertiseInput('');
                }}
              />

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  addUnique(
                    expertiseInput,
                    expertise,
                    20,
                    setExpertise,
                  );

                  setExpertiseInput('');
                }}
              >
                Add
              </Button>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 2 }}
            >
              Suggestions
            </Typography>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
              {SUGGESTED_EXPERTISE.filter(
                (suggestion) =>
                  !expertise.some(
                    (item) =>
                      normalize(item) === normalize(suggestion),
                  ),
              )
                .slice(0, 8)
                .map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={`+ ${suggestion}`}
                    variant="outlined"
                    onClick={() =>
                      addUnique(
                        suggestion,
                        expertise,
                        20,
                        setExpertise,
                      )
                    }
                  />
                ))}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 2 }}
            >
              {expertise.length}/20 expertise areas
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2.5 }}
            >
              <LanguageOutlined color="primary" />

              <Box>
                <Typography variant="h6" fontWeight={850}>
                  Languages
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Add the languages you can comfortably use during a
                  consultation.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              sx={{ mb: 2.5 }}
            >
              {languages.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  color="primary"
                  onDelete={() => removeValue(item, setLanguages)}
                />
              ))}
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
            >
              <TextField
                fullWidth
                label="Add language"
                placeholder="e.g. English"
                value={languageInput}
                onChange={(event) =>
                  setLanguageInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;

                  event.preventDefault();

                  addUnique(
                    languageInput,
                    languages,
                    10,
                    setLanguages,
                  );

                  setLanguageInput('');
                }}
              />

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  addUnique(
                    languageInput,
                    languages,
                    10,
                    setLanguages,
                  );

                  setLanguageInput('');
                }}
              >
                Add
              </Button>
            </Stack>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              sx={{ mt: 2 }}
            >
              {SUGGESTED_LANGUAGES.filter(
                (suggestion) =>
                  !languages.some(
                    (item) =>
                      normalize(item) === normalize(suggestion),
                  ),
              ).map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={`+ ${suggestion}`}
                  variant="outlined"
                  onClick={() =>
                    addUnique(
                      suggestion,
                      languages,
                      10,
                      setLanguages,
                    )
                  }
                />
              ))}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 2 }}
            >
              {languages.length}/10 languages
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <Box sx={{ p: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Stack direction="row" spacing={1.5}>
                    <SellOutlined color="primary" />

                    <Box>
                      <Typography variant="h6" fontWeight={850}>
                        Services & pricing
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Create 15, 30 or 60-minute paid consultation
                        services.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() =>
                    setServices((current) => [
                      ...current,
                      newService(),
                    ])
                  }
                >
                  Add service
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={2.5} sx={{ p: 3 }}>
              {services.length === 0 && (
                <Alert severity="info">
                  Add at least one consultation service. You control the
                  duration and price.
                </Alert>
              )}

              {services.map((service, index) => (
                <Paper
                  key={service.key}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 2.5 }}
                >
                  <Stack spacing={2.5}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Typography fontWeight={850}>
                        Service {index + 1}
                      </Typography>

                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteOutline />}
                        onClick={() =>
                          setServices((current) =>
                            current.filter(
                              (item) => item.key !== service.key,
                            ),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Service type"
                        value={service.serviceType}
                        onChange={(event) =>
                          updateServiceDraft(service.key, {
                            serviceType: event.target.value,
                          })
                        }
                        placeholder="e.g. VideoConsultation"
                      />

                      <TextField
                        required
                        label="Service title"
                        value={service.title}
                        onChange={(event) =>
                          updateServiceDraft(service.key, {
                            title: event.target.value,
                          })
                        }
                        placeholder="e.g. Resume & interview consultation"
                      />

                      <TextField
                        required
                        select
                        label="Duration"
                        value={service.durationMinutes}
                        onChange={(event) => {
                          const duration = Number(event.target.value);

                          updateServiceDraft(service.key, {
                            durationMinutes: duration,
                          });
                        }}
                      >
                        {DURATION_OPTIONS.map((duration) => (
                          <MenuItem key={duration} value={duration}>
                            {duration} minutes
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        required
                        type="number"
                        label="Price"
                        value={service.price}
                        onChange={(event) =>
                          updateServiceDraft(service.key, {
                            price: event.target.value,
                          })
                        }
                        slotProps={{
                          htmlInput: {
                            min: 1,
                            step: 1,
                          },
                          input: {
                            startAdornment: (
                              <Typography
                                color="text.secondary"
                                sx={{ mr: 1 }}
                              >
                                ₹
                              </Typography>
                            ),
                          },
                        }}
                        helperText="INR"
                      />
                    </Box>

                    <TextField
                      multiline
                      minRows={3}
                      label="Service description"
                      value={service.description}
                      onChange={(event) =>
                        updateServiceDraft(service.key, {
                          description: event.target.value,
                        })
                      }
                      placeholder="Explain what the job seeker can discuss or receive during this session."
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={service.isActive}
                          onChange={(event) =>
                            updateServiceDraft(service.key, {
                              isActive: event.target.checked,
                            })
                          }
                        />
                      }
                      label={
                        service.isActive
                          ? 'Available for booking'
                          : 'Not available for booking'
                      }
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Stack>

        <Stack spacing={2.5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#effbf4',
            }}
          >
            <Typography fontWeight={850}>
              Step 3 of 5
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              Define what you can help with and how job seekers can book
              your time.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#f6f2ff',
            }}
          >
            <Stack direction="row" spacing={1.2}>
              <LightbulbOutlined color="primary" />

              <Box>
                <Typography fontWeight={850}>
                  Pricing tip
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75 }}
                >
                  Set a price that reflects the duration and value of your
                  consultation. You can offer more than one duration.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography fontWeight={850} sx={{ mb: 2 }}>
              Profile preview
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Avatar
                src={onboarding.profileImageUrl ?? undefined}
                sx={{ width: 64, height: 64 }}
              >
                {initials}
              </Avatar>

              <Box minWidth={0}>
                <Typography fontWeight={850}>
                  {onboarding.displayName || 'Your name'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {onboarding.professionalHeadline ||
                    'Your professional headline'}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  {onboarding.currentRole || 'Current role'}
                  {onboarding.companyName
                    ? ` · ${onboarding.companyName}`
                    : ''}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" fontWeight={800}>
              Expertise
            </Typography>

            <Stack
              direction="row"
              gap={0.75}
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
              {expertise.length > 0 ? (
                expertise.slice(0, 5).map((item) => (
                  <Chip
                    key={item}
                    size="small"
                    label={item}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Add expertise to preview it here.
                </Typography>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" fontWeight={800}>
              Services
            </Typography>

            <Stack spacing={1} sx={{ mt: 1 }}>
              {services.filter((service) => service.isActive).length >
              0 ? (
                services
                  .filter((service) => service.isActive)
                  .slice(0, 3)
                  .map((service) => (
                    <Box key={service.key}>
                      <Typography variant="body2" fontWeight={700}>
                        {clean(service.title) || 'Consultation'}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {service.durationMinutes} min
                        {service.price
                          ? ` · ₹${service.price}`
                          : ' · Add price'}
                      </Typography>
                    </Box>
                  ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Add an active service to preview it here.
                </Typography>
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 2 }}
            >
              Draft preview. Your public consultant profile becomes
              available only after the required review and approval.
            </Typography>
          </Paper>
        </Stack>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: '#f4f8ff',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Button
            startIcon={<ArrowBack />}
            disabled={isSaving}
            onClick={() => {
              void navigate(
                guidanceRoutes.consultantOnboardingProfessional,
              );
            }}
          >
            Back
          </Button>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
          >
            <Button
              variant="outlined"
              disabled={isSaving || isFetching}
              onClick={() => {
                void saveAll(false);
              }}
            >
              Save and exit
            </Button>

            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              disabled={isSaving || isFetching}
              onClick={() => {
                void saveAll(true);
              }}
            >
              {isSaving ? 'Saving…' : 'Next: Availability'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}