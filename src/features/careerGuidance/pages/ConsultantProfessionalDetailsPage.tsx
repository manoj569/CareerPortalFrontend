import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ArrowForward,
  BusinessOutlined,
  Check,
  DeleteOutline,
  EditOutlined,
  LinkedIn,
  SchoolOutlined,
  WorkOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import {
  type ConsultantEducationItem,
  type ConsultantExperienceItem,
  useGetConsultantOnboardingQuery,
  useSaveConsultantOnboardingEducationMutation,
  useSaveConsultantOnboardingExperienceMutation,
  useSaveConsultantOnboardingProfessionalMutation,
} from '../api/onboardingApi';
import { guidanceError, guidanceErrorMessage } from '../utils/errors';
import { guidanceRoutes } from '../utils/routes';

interface ProfessionalForm {
  currentRole: string;
  companyName: string;
  yearsOfExperience: string;
  professionalType: string;
  industry: string;
  functionalArea: string;
  linkedInUrl: string;
}

const EMPTY_FORM: ProfessionalForm = {
  currentRole: '',
  companyName: '',
  yearsOfExperience: '',
  professionalType: '',
  industry: '',
  functionalArea: '',
  linkedInUrl: '',
};

const STEPS = [
  'Basic information',
  'Professional details',
  'Expertise & services',
  'Availability',
  'Review & submit',
];

const PROFESSIONAL_TYPES = [
  { value: 1, label: 'Current employee' },
  { value: 2, label: 'Former employee' },
  { value: 3, label: 'Recruiter' },
  { value: 4, label: 'Hiring manager' },
  { value: 5, label: 'Career coach' },
];

const currentYear = new Date().getFullYear();

const clean = (value: string) => value.trim();

const emptyEducation = (displayOrder: number): ConsultantEducationItem => ({
  qualification: '',
  institution: '',
  fieldOfStudy: null,
  startYear: null,
  endYear: null,
  isCurrentlyStudying: false,
  displayOrder,
});

const emptyExperience = (displayOrder: number): ConsultantExperienceItem => ({
  jobTitle: '',
  companyName: '',
  startDate: '',
  endDate: null,
  isCurrent: false,
  description: null,
  displayOrder,
});

const validateLinkedIn = (value: string) => {
  if (!value) return true;

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      (url.hostname === 'linkedin.com' ||
        url.hostname === 'www.linkedin.com') &&
      url.pathname.toLowerCase().startsWith('/in/') &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
};

export default function ConsultantProfessionalDetailsPage() {
  useDocumentMetadata(
    'Professional details | Become a consultant | Career Harbor',
    'Add your professional experience to your Career Harbor consultant profile.',
  );

  const navigate = useNavigate();

  const {
    data: onboarding,
    isLoading,
    isFetching,
    error: loadError,
    refetch,
  } = useGetConsultantOnboardingQuery();

  const [saveProfessional, { isLoading: savingProfessional }] =
    useSaveConsultantOnboardingProfessionalMutation();

  const [saveEducation, { isLoading: savingEducation }] =
    useSaveConsultantOnboardingEducationMutation();

  const [saveExperience, { isLoading: savingExperience }] =
    useSaveConsultantOnboardingExperienceMutation();

  const [form, setForm] = useState<ProfessionalForm>(EMPTY_FORM);
  const [education, setEducation] = useState<ConsultantEducationItem[]>([]);
  const [experience, setExperience] = useState<ConsultantExperienceItem[]>([]);

  const [hydratedRevision, setHydratedRevision] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSaving =
    savingProfessional || savingEducation || savingExperience;

  useEffect(() => {
    if (!onboarding || hydratedRevision === onboarding.revision) return;

    setForm({
      currentRole: onboarding.currentRole ?? '',
      companyName: onboarding.companyName ?? '',
      yearsOfExperience:
        onboarding.yearsOfExperience === null
          ? ''
          : String(onboarding.yearsOfExperience),
      professionalType:
        onboarding.professionalType === null
          ? ''
          : String(onboarding.professionalType),
      industry: onboarding.industry ?? '',
      functionalArea: onboarding.functionalArea ?? '',
      linkedInUrl: onboarding.linkedInUrl ?? '',
    });

    setEducation(onboarding.education ?? []);
    setExperience(onboarding.workExperience ?? []);
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

  const updateForm = (field: keyof ProfessionalForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationError(null);
    setSaveError(null);
  };

  const updateEducation = (
    index: number,
    patch: Partial<ConsultantEducationItem>,
  ) => {
    setEducation((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

    setValidationError(null);
  };

  const updateExperience = (
    index: number,
    patch: Partial<ConsultantExperienceItem>,
  ) => {
    setExperience((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

    setValidationError(null);
  };

  const validate = () => {
    const years = Number(form.yearsOfExperience);

    if (!clean(form.currentRole)) {
      return 'Current role is required.';
    }

    if (!clean(form.companyName)) {
      return 'Company is required.';
    }

    if (
      form.yearsOfExperience === '' ||
      !Number.isFinite(years) ||
      years < 0 ||
      years > 70 ||
      Math.round(years * 10) !== years * 10
    ) {
      return 'Experience must be between 0 and 70 years with at most one decimal place.';
    }

    if (!form.professionalType) {
      return 'Professional type is required.';
    }

    if (form.linkedInUrl && !validateLinkedIn(clean(form.linkedInUrl))) {
      return 'Use a valid HTTPS LinkedIn /in/ profile URL without query parameters.';
    }

    for (const item of education) {
      if (!clean(item.qualification) || !clean(item.institution)) {
        return 'Qualification and institution are required for every education entry.';
      }

      if (
        item.startYear !== null &&
        (item.startYear < 1900 || item.startYear > currentYear + 10)
      ) {
        return 'Check the education start year.';
      }

      if (
        item.endYear !== null &&
        item.startYear !== null &&
        item.endYear < item.startYear
      ) {
        return 'Education end year cannot be before the start year.';
      }
    }

    for (const item of experience) {
      if (
        !clean(item.jobTitle) ||
        !clean(item.companyName) ||
        !item.startDate
      ) {
        return 'Job title, company and start date are required for every work experience entry.';
      }

      if (
        !item.isCurrent &&
        item.endDate &&
        item.endDate < item.startDate
      ) {
        return 'Work experience end date cannot be before the start date.';
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

      const professional = await saveProfessional({
        revision,
        companyName: clean(form.companyName),
        currentRole: clean(form.currentRole),
        yearsOfExperience: Number(form.yearsOfExperience),
        professionalType: Number(form.professionalType),
        linkedInUrl: clean(form.linkedInUrl) || null,
        industry: clean(form.industry) || null,
        functionalArea: clean(form.functionalArea) || null,
      }).unwrap();

      revision = professional.revision;

      const educationResult = await saveEducation({
        revision,
        items: education.map((item, index) => ({
          ...item,
          qualification: clean(item.qualification),
          institution: clean(item.institution),
          fieldOfStudy: item.fieldOfStudy
            ? clean(item.fieldOfStudy) || null
            : null,
          displayOrder: index,
        })),
      }).unwrap();

      revision = educationResult.revision;

      const experienceResult = await saveExperience({
        revision,
        items: experience.map((item, index) => ({
          ...item,
          jobTitle: clean(item.jobTitle),
          companyName: clean(item.companyName),
          description: item.description
            ? clean(item.description) || null
            : null,
          endDate: item.isCurrent ? null : item.endDate,
          displayOrder: index,
        })),
      }).unwrap();

      setHydratedRevision(experienceResult.revision);

      if (goNext) {
        await navigate(guidanceRoutes.consultantOnboardingExpertise);
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
            Loading professional details…
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
          const complete = index < 1;
          const active = index === 1;

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
                    complete || active ? 'primary.main' : 'text.secondary'
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
          Tell us about your professional background
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          This helps job seekers understand your experience and expertise.
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
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <WorkOutline color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight={850}>
                    Professional details
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Add your current professional information.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Box
              sx={{
                p: 3,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              <TextField
                required
                label="Current role"
                placeholder="e.g. Senior Software Engineer"
                value={form.currentRole}
                onChange={(event) =>
                  updateForm('currentRole', event.target.value)
                }
                slotProps={{
                  htmlInput: { maxLength: 160 },
                }}
              />

              <TextField
                required
                label="Company"
                placeholder="e.g. Microsoft"
                value={form.companyName}
                onChange={(event) =>
                  updateForm('companyName', event.target.value)
                }
                slotProps={{
                  htmlInput: { maxLength: 200 },
                }}
              />

              <TextField
                required
                type="number"
                label="Total work experience"
                value={form.yearsOfExperience}
                onChange={(event) =>
                  updateForm('yearsOfExperience', event.target.value)
                }
                helperText="Years, for example 4 or 4.5"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 70,
                    step: 0.1,
                  },
                }}
              />

              <TextField
                required
                select
                label="Professional type"
                value={form.professionalType}
                onChange={(event) =>
                  updateForm('professionalType', event.target.value)
                }
              >
                {PROFESSIONAL_TYPES.map((type) => (
                  <MenuItem key={type.value} value={String(type.value)}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Industry"
                placeholder="e.g. Information Technology"
                value={form.industry}
                onChange={(event) =>
                  updateForm('industry', event.target.value)
                }
                slotProps={{
                  htmlInput: { maxLength: 120 },
                }}
              />

              <TextField
                label="Functional area"
                placeholder="e.g. Software Engineering"
                value={form.functionalArea}
                onChange={(event) =>
                  updateForm('functionalArea', event.target.value)
                }
                slotProps={{
                  htmlInput: { maxLength: 120 },
                }}
              />

              <TextField
                label="LinkedIn profile"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={form.linkedInUrl}
                onChange={(event) =>
                  updateForm('linkedInUrl', event.target.value)
                }
                slotProps={{
                  htmlInput: { maxLength: 500 },
                  input: {
                    startAdornment: (
                      <LinkedIn
                        fontSize="small"
                        sx={{ mr: 1, color: '#0a66c2' }}
                      />
                    ),
                  },
                }}
                sx={{ gridColumn: { md: '1 / -1' } }}
                helperText="Use your HTTPS LinkedIn /in/ profile URL."
              />
            </Box>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SchoolOutlined color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight={850}>
                    Education
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add the education you want included in your consultant
                    profile.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={2.5} sx={{ p: 3 }}>
              {education.map((item, index) => (
                <Paper
                  key={`education-${index}`}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 2 }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight={800}>
                        Education {index + 1}
                      </Typography>

                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteOutline />}
                        onClick={() =>
                          setEducation((current) =>
                            current
                              .filter((_, itemIndex) => itemIndex !== index)
                              .map((entry, order) => ({
                                ...entry,
                                displayOrder: order,
                              })),
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
                          md: 'repeat(2, 1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      <TextField
                        required
                        label="Qualification"
                        value={item.qualification}
                        onChange={(event) =>
                          updateEducation(index, {
                            qualification: event.target.value,
                          })
                        }
                      />

                      <TextField
                        required
                        label="Institution"
                        value={item.institution}
                        onChange={(event) =>
                          updateEducation(index, {
                            institution: event.target.value,
                          })
                        }
                      />

                      <TextField
                        label="Field of study"
                        value={item.fieldOfStudy ?? ''}
                        onChange={(event) =>
                          updateEducation(index, {
                            fieldOfStudy: event.target.value || null,
                          })
                        }
                      />

                      <Box />

                      <TextField
                        type="number"
                        label="Start year"
                        value={item.startYear ?? ''}
                        onChange={(event) =>
                          updateEducation(index, {
                            startYear: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                      />

                      <TextField
                        type="number"
                        label="End year"
                        disabled={item.isCurrentlyStudying}
                        value={item.endYear ?? ''}
                        onChange={(event) =>
                          updateEducation(index, {
                            endYear: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                      />
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isCurrentlyStudying}
                          onChange={(event) =>
                            updateEducation(index, {
                              isCurrentlyStudying: event.target.checked,
                              endYear: event.target.checked
                                ? null
                                : item.endYear,
                            })
                          }
                        />
                      }
                      label="I currently study here"
                    />
                  </Stack>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() =>
                  setEducation((current) => [
                    ...current,
                    emptyEducation(current.length),
                  ])
                }
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Add another education
              </Button>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BusinessOutlined color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight={850}>
                    Work experience
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Add previous roles you want shown on your consultant
                    profile.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={2.5} sx={{ p: 3 }}>
              {experience.map((item, index) => (
                <Paper
                  key={`experience-${index}`}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 2 }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight={800}>
                        Work experience {index + 1}
                      </Typography>

                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteOutline />}
                        onClick={() =>
                          setExperience((current) =>
                            current
                              .filter((_, itemIndex) => itemIndex !== index)
                              .map((entry, order) => ({
                                ...entry,
                                displayOrder: order,
                              })),
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
                          md: 'repeat(2, 1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      <TextField
                        required
                        label="Job title"
                        value={item.jobTitle}
                        onChange={(event) =>
                          updateExperience(index, {
                            jobTitle: event.target.value,
                          })
                        }
                      />

                      <TextField
                        required
                        label="Company"
                        value={item.companyName}
                        onChange={(event) =>
                          updateExperience(index, {
                            companyName: event.target.value,
                          })
                        }
                      />

                      <TextField
                        required
                        type="date"
                        label="Start date"
                        value={item.startDate}
                        onChange={(event) =>
                          updateExperience(index, {
                            startDate: event.target.value,
                          })
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />

                      <TextField
                        type="date"
                        label="End date"
                        disabled={item.isCurrent}
                        value={item.endDate ?? ''}
                        onChange={(event) =>
                          updateExperience(index, {
                            endDate: event.target.value || null,
                          })
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isCurrent}
                          onChange={(event) =>
                            updateExperience(index, {
                              isCurrent: event.target.checked,
                              endDate: event.target.checked
                                ? null
                                : item.endDate,
                            })
                          }
                        />
                      }
                      label="I currently work here"
                    />

                    <TextField
                      multiline
                      minRows={3}
                      label="Description"
                      value={item.description ?? ''}
                      onChange={(event) =>
                        updateExperience(index, {
                          description: event.target.value || null,
                        })
                      }
                    />
                  </Stack>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() =>
                  setExperience((current) => [
                    ...current,
                    emptyExperience(current.length),
                  ])
                }
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Add previous experience
              </Button>
            </Stack>
          </Paper>
        </Stack>

        <Stack spacing={2.5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#f4f8ff',
            }}
          >
            <Typography fontWeight={850}>Why this matters</Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Your professional background helps job seekers understand which
              consultants may be relevant to their career questions.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
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

                {onboarding.location && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {onboarding.location}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" fontWeight={800}>
              {clean(form.currentRole) || 'Current role'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {clean(form.companyName) || 'Company'}
            </Typography>

            {form.yearsOfExperience && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                {form.yearsOfExperience} years of experience
              </Typography>
            )}

            {clean(form.industry) && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                {clean(form.industry)}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 2 }}
            >
              Draft preview. Platform review occurs after the completed
              application is submitted.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#effbf4',
            }}
          >
            <Stack direction="row" spacing={1.2}>
              <EditOutlined color="success" />

              <Box>
                <Typography fontWeight={850}>
                  Keep it accurate
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Only include professional and education information you are
                  comfortable presenting on your consultant profile.
                </Typography>
              </Box>
            </Stack>
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
              void navigate(guidanceRoutes.consultantOnboardingBasic);
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
              {isSaving ? 'Saving…' : 'Next: Expertise & services'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}