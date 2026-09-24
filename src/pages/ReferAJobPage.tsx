import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useGetProfileQuery } from '@/features/dashboard/api/dashboardApi';
import { EmploymentType } from '@/features/jobs/types/jobModels';

import {
  useExtractJobFromUrlMutation,
  useGetMyReferralsQuery,
  useGetReferralCategoryOptionsQuery,
  useSubmitJobReferralMutation,
} from '@/features/referrals/api/referralsApi';

import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const emptyForm = {
  companyName: '',
  description: '',
  location: '',
  title: '',
  employmentType: '',
  minimumExperienceYears: '',
  maximumExperienceYears: '',
  skills: [] as string[],
  categoryId: '',
  newCategoryName: '',
  applicationUrl: '',
};


const normalizeReferralStatus = (value: string | number) => {
  const normalized = String(value);

  if (normalized === '1') return 'Pending';
  if (normalized === '2') return 'Approved';
  if (normalized === '3') return 'Rejected';

  return normalized;
};



const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    bgcolor: '#fff',
  },
};

export const ReferAJobPage = () => {
  useDocumentMetadata(
    'Refer a job | Career Harbor',
    'Share a job opportunity with the Career Harbor community.',
  );
    const navigate = useNavigate();

  const currentUser = useAppSelector(selectCurrentUser);

  const [url, setUrl] = useState('');
  const [form, setForm] = useState(emptyForm);
const [skillInput, setSkillInput] = useState('');
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState('');
  const [referrerRole, setReferrerRole] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [extractFromUrl, extractState] = useExtractJobFromUrlMutation();
  const [submitReferral, submitState] = useSubmitJobReferralMutation();
const {
  data: myReferralsPage,
  isLoading: isMyReferralsLoading,
  isError: isMyReferralsError,
  refetch: refetchMyReferrals,
} = useGetMyReferralsQuery({
  pageNumber: 1,
  pageSize: 3,
});

const myReferrals = myReferralsPage?.items ?? [];
  const profile = useGetProfileQuery();
  const categories = useGetReferralCategoryOptionsQuery();

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    if (profile.data?.linkedInUrl) {
      setLinkedinUrl(profile.data.linkedInUrl);
    }
  }, [profile.data?.linkedInUrl]);

 const categoryComplete =
  Boolean(form.categoryId.trim()) &&
  (form.categoryId !== '__new' ||
    Boolean(form.newCategoryName.trim()));

const descriptionComplete =
  Boolean(form.applicationUrl.trim()) ||
  Boolean(form.description.trim()) ||
  Boolean(url.trim());

const experienceComplete =
  Boolean(form.minimumExperienceYears) &&
  Boolean(form.maximumExperienceYears) &&
  Number(form.maximumExperienceYears) >=
    Number(form.minimumExperienceYears);

const jobDetailsComplete =
  Boolean(form.title.trim()) &&
  Boolean(form.companyName.trim()) &&
  Boolean(form.employmentType) &&
  experienceComplete &&
  form.skills.length > 0 &&
  categoryComplete &&
  descriptionComplete;

const linkedInComplete =
  !showLinkedIn ||
  !linkedinUrl.trim() ||
  linkedinUrl.trim().startsWith('https://');

const emailComplete =
  !showEmail || /^\S+@\S+\.\S+$/.test(email.trim());

const contactSharingComplete =
  (showLinkedIn || showEmail || showPhone) &&
  linkedInComplete &&
  emailComplete;

const stepStates = submitted
  ? (['complete', 'complete', 'complete'] as const)
  : !jobDetailsComplete
    ? (['active', 'idle', 'idle'] as const)
    : !contactSharingComplete
      ? (['complete', 'active', 'idle'] as const)
      : (['complete', 'complete', 'active'] as const);

  const update = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addSkill = () => {
  const skill = skillInput.trim();

  if (!skill) return;

  const alreadyAdded = form.skills.some(
  (existingSkill) =>
    existingSkill.toLowerCase() === skill.toLowerCase(),
);

if (alreadyAdded) {
  setSkillInput('');
  return;
}
  setForm((current) => ({
    ...current,
    skills: [...current.skills, skill],
  }));

  setSkillInput('');
};

const removeSkill = (skillToRemove: string) => {
  setForm((current) => ({
    ...current,
    skills: current.skills.filter(
      (skill) => skill !== skillToRemove,
    ),
  }));
};

  const handleExtract = async () => {
    if (!url.trim()) return;

    setExtractNote(null);

    const result = await extractFromUrl(url.trim())
      .unwrap()
      .catch(
        (error: {
          data?: { failureReason?: string };
          message?: string;
        }) => {
          const reason =
            error?.data?.failureReason ??
            error?.message ??
            'Could not extract details. Please fill the form manually.';

          setExtractNote(reason);
          setToast(reason);

          return null;
        },
      );

    if (!result || !result.succeeded) {
      const message =
        result?.failureReason ??
        'Could not extract details. Please fill the form manually.';

      setExtractNote(message);
      setToast(message);

      return;
    }

    setForm({
  companyName: result.companyName ?? '',
  description: result.description ?? '',
  location: result.location ?? '',
  title: result.title ?? '',
  employmentType: '',
  minimumExperienceYears:
    result.minimumExperienceYears != null
      ? String(result.minimumExperienceYears)
      : '',
  maximumExperienceYears:
    result.maximumExperienceYears != null
      ? String(result.maximumExperienceYears)
      : '',
  skills: [],
  categoryId: '',
  newCategoryName: '',
  applicationUrl: url.trim(),
});

    setToast('Job details imported!');
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setSubmitError(null);

 const requiredFields: Array<[keyof typeof form, string]> = [
  ['title', 'title'],
  ['companyName', 'company'],
  ['employmentType', 'employment type'],
  ['minimumExperienceYears', 'minimum experience'],
  ['maximumExperienceYears', 'maximum experience'],
];
    const missing = requiredFields
      .filter(([key]) => String(form[key] ?? '').trim() === '')
      .map(([, label]) => label);

      if (form.skills.length === 0) {
  missing.push('skills');
}

if (
  form.minimumExperienceYears &&
  form.maximumExperienceYears &&
  Number(form.maximumExperienceYears) <
    Number(form.minimumExperienceYears)
) {
  const message =
    'Maximum experience cannot be less than minimum experience.';

  setSubmitError(message);
  setToast(message);
  return;
}

    const categoryId = String(form.categoryId ?? '').trim();
    const newCategoryName = String(form.newCategoryName ?? '').trim();

    if ((!categoryId || categoryId === '__new') && !newCategoryName) {
      missing.push('category');
    }

    if (
      !String(form.applicationUrl ?? '').trim() &&
      !String(form.description ?? '').trim() &&
      !url.trim()
    ) {
      missing.push('description');
    }

    if (
      showLinkedIn &&
      linkedinUrl.trim() &&
      !linkedinUrl.trim().startsWith('https://')
    ) {
      missing.push('LinkedIn URL');
    }

    if (showEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      missing.push('contact email');
    }

    if (missing.length) {
  const message =
    `Please complete required fields: ${missing.join(', ')}.`;

  setSubmitError(message);
  setToast(message);
  return;
}

    if (!showLinkedIn && !showEmail && !showPhone) {
      const message =
        'Choose at least one contact field to share with job seekers.';

      setSubmitError(message);
      setToast(message);
      return;
    }

    const payload = {
      jobDetails: {
        category:
          categoryId && categoryId !== '__new'
            ? {
                existingId: categoryId,
                new: null,
              }
            : {
                existingId: null,
                new: {
                  name: newCategoryName,
                  slug: newCategoryName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, ''),
                  description: '',
                  displayOrder: 0,
                },
              },

        company: {
          new: {
            name: form.companyName.trim(),
          },
        },

        job: {
  title: form.title.trim(),
  description: form.description.trim() || undefined,
  location: form.location.trim() || undefined,
  employmentType: form.employmentType || null,

  minimumExperienceYears: Number(form.minimumExperienceYears),
  maximumExperienceYears: Number(form.maximumExperienceYears),

  skills: form.skills,

  applicationUrl: form.applicationUrl.trim() || null,
},

        recruiterContact: {
          showLinkedIn,
          showEmail,
          showPhone,

          overrideLinkedInUrl: showLinkedIn
            ? linkedinUrl.trim() || null
            : null,

          overrideEmail: showEmail ? email.trim() || null : null,

          overridePhoneNumber: showPhone ? phone.trim() || null : null,

          referrerRole: referrerRole.trim() || null,
          personalNote: personalNote.trim() || null,
        },
      },

      showEmail,
      showLinkedIn,
      showPhone,

      sourceUrl: url.trim() || undefined,

      overrideLinkedInUrl: showLinkedIn
        ? linkedinUrl.trim() || null
        : null,

      overrideEmail: showEmail ? email.trim() || null : null,

      overridePhoneNumber: showPhone ? phone.trim() || null : null,

      referrerRole: referrerRole.trim() || null,
      personalNote: personalNote.trim() || null,
    };

    let result: unknown = null;

    try {
      result = await submitReferral(payload).unwrap();
    } catch (error) {
      const typedError = error as {
        message?: string;
      };

      setSubmitError(
        typedError.message ??
          'Could not submit your referral. Please try again.',
      );
    }

    if (result) {
      setSubmitted(true);
      setForm(emptyForm);
      setUrl('');
      setReferrerRole('');
      setPersonalNote('');
      setSubmitError(null);

      setToast('Referral submitted successfully.');
    }
  };

  const scrollToReferrals = () => {
    document
      .getElementById('your-referrals')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
  <Box
  sx={{
    width: '100%',
    maxWidth: 'none',
    minWidth: 0,
    m: 0,
    pb: 3,
  }}
>
      {/* HERO */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#eef8ff',
          background:
            'linear-gradient(110deg, #eef8ff 0%, #eaf6ff 55%, #e3f7ff 100%)',
          border: '1px solid #b9dcfa',
          borderRadius: 2.5,
          mb: 1.5,
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 2, md: 1.8 },
        }}
      >
        <Stack
          alignItems={{ xs: 'flex-start', md: 'center' }}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: '#0877ee',
                borderRadius: '50%',
                color: '#fff',
                display: 'flex',
                flexShrink: 0,
                height: { xs: 50, sm: 58 },
                justifyContent: 'center',
                width: { xs: 50, sm: 58 },
              }}
            >
<SendRoundedIcon
  sx={{
    fontSize: { xs: 27, sm: 32 },
    transform: 'rotate(-45deg)',
  }}
/>            </Box>

            <Box>
              <Typography
                component="h1"
                fontWeight={800}
                sx={{
                  color: '#0d1b3e',
                  fontSize: { xs: 21, sm: 26 },
                  lineHeight: 1.2,
                }}
              >
                Share a job opportunity
              </Typography>

              <Typography
                sx={{
                  color: '#405376',
                  fontSize: { xs: 13, sm: 14 },
                  mt: 0.5,
                }}
              >
                Help talented professionals find great opportunities. It takes
                just a few minutes.
              </Typography>
            </Box>
          </Stack>

          <Stack
            alignItems="center"
            direction="row"
            spacing={1.5}
            sx={{
              display: { xs: 'none', md: 'flex' },
              pr: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <GroupsRoundedIcon
                sx={{
                  color: '#2588ed',
                  fontSize: 47,
                }}
              />
            </Box>

            <ArrowForwardRoundedIcon
              sx={{
                color: '#0877ee',
                fontSize: 34,
              }}
            />

            <Box
              sx={{
                alignItems: 'center',
                bgcolor: '#086bd7',
                borderRadius: 1.5,
                color: '#fff',
                display: 'flex',
                height: 46,
                justifyContent: 'center',
                width: 46,
              }}
            >
              <WorkOutlineRoundedIcon />
            </Box>
          </Stack>
        </Stack>

        <Typography
          sx={{
            color: '#405376',
            display: { xs: 'none', md: 'block' },
            fontSize: 11,
            ml: 'auto',
            mt: -0.3,
            mr: 0.5,
            textAlign: 'right',
            width: 300,
          }}
        >
          Your referral can create new opportunities
        </Typography>
      </Paper>

      {/* SUCCESS */}
      {submitted ? (
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#edfff5',
            border: '1px solid #aeeacb',
            borderRadius: 2,
            mb: 1.5,
            px: { xs: 1.5, sm: 2 },
            py: 1.2,
          }}
        >
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack alignItems="center" direction="row" spacing={1.5}>
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: '#d0f5e1',
                  borderRadius: '50%',
                  color: '#087c58',
                  display: 'flex',
                  flexShrink: 0,
                  height: 42,
                  justifyContent: 'center',
                  width: 42,
                }}
              >
                <CheckCircleIcon />
              </Box>

              <Box>
                <Typography
                  fontWeight={800}
                  sx={{ color: '#173a35', fontSize: 14 }}
                >
                  Referral submitted successfully!
                </Typography>

                <Typography
                  sx={{
                    color: '#355d56',
                    fontSize: 12,
                    mt: 0.2,
                  }}
                >
                  Your job has been sent for review. You can track its status
                  under <strong>Your referrals.</strong>
                </Typography>
              </Box>
            </Stack>

            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={scrollToReferrals}
                size="small"
                sx={{
                  bgcolor: '#fff',
                  flexGrow: { xs: 1, sm: 0 },
                }}
                variant="outlined"
              >
                View my referrals
              </Button>

              <Button
                aria-label="Close success message"
                onClick={() => setSubmitted(false)}
                sx={{
                  color: '#405376',
                  minWidth: 36,
                  width: 36,
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Grid container spacing={1.5} alignItems="flex-start">
        {/* MAIN FORM */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            component="form"
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            sx={{
              borderRadius: 2.5,
              p: { xs: 2, sm: 2.5 },
            }}
            variant="outlined"
          >
            {/* STEPPER */}
           {/* STEPPER */}
<Stack
  alignItems="center"
  direction="row"
  justifyContent="center"
  sx={{
    mb: 2.5,
    overflow: 'hidden',
    width: '100%',
  }}
>
  {[
    ['1', 'Job details', 'Basic information'],
    ['2', 'Contact sharing', 'What to share'],
    ['3', 'Submit', 'For approval'],
  ].map(([number, title, subtitle], index) => {
    const state = stepStates[index];
    const complete = state === 'complete';
    const active = state === 'active';

    return (
      <Box
        key={title}
        sx={{
          alignItems: 'center',
          display: 'flex',
          flex: index < 2 ? 1 : '0 0 auto',
          minWidth: 0,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{ flexShrink: 0 }}
        >
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: complete
                ? '#16a36a'
                : active
                  ? '#0877ee'
                  : '#aeb6c5',
              borderRadius: '50%',
              color: '#fff',
              display: 'flex',
              fontSize: 12,
              fontWeight: 800,
              height: 28,
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              width: 28,
            }}
          >
            {complete ? (
              <CheckCircleIcon sx={{ fontSize: 18 }} />
            ) : (
              number
            )}
          </Box>

          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography
              fontWeight={800}
              sx={{
                color: complete
                  ? '#16865d'
                  : active
                    ? '#0877ee'
                    : '#1c2945',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                color: complete
                  ? '#16865d'
                  : active
                    ? '#0877ee'
                    : '#697895',
                fontSize: 10,
                whiteSpace: 'nowrap',
              }}
            >
              {complete ? 'Completed' : subtitle}
            </Typography>
          </Box>
        </Stack>

        {index < 2 ? (
          <Box
            sx={{
              bgcolor: complete ? '#9edfc4' : '#c7cfdb',
              height: '1px',
              mx: { xs: 1, sm: 2 },
              minWidth: { xs: 20, sm: 30 },
              transition: 'background-color 0.2s ease',
              width: '100%',
            }}
          />
        ) : null}
      </Box>
    );
  })}
</Stack>

            {/* 1 PASTE LINK */}
            <Stack spacing={1.2} sx={{ mb: 2.4 }}>
              <Stack alignItems="flex-start" direction="row" spacing={1.3}>
                <LinkRoundedIcon
                  sx={{
                    color: '#0877ee',
                    fontSize: 23,
                    mt: 0.1,
                  }}
                />

                <Box>
                  <Typography
                    fontWeight={800}
                    sx={{
                      color: '#122040',
                      fontSize: 14,
                    }}
                  >
                  Paste the job link (optional)
                  </Typography>

                  <Typography
                    sx={{
                      color: '#5d6c87',
                      fontSize: 11.5,
                      mt: 0.2,
                    }}
                  >
                    If the job is already posted online, paste the link and
                    we'll fetch the details automatically.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ pl: { xs: 0, sm: 4.3 } }}
              >
                <TextField
                  fullWidth
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://company.com/careers/frontend-developer"
                  size="small"
                  sx={fieldSx}
                  value={url}
                />

                <Button
                  disabled={!url.trim() || extractState.isLoading}
                  onClick={() => void handleExtract()}
                  startIcon={<AutoAwesomeOutlinedIcon />}
                  sx={{
                    minWidth: 145,
                    whiteSpace: 'nowrap',
                  }}
                  variant="outlined"
                >
                  {extractState.isLoading ? 'Fetching…' : 'Fetch details'}
                </Button>
              </Stack>

              {extractNote ? (
                <Box sx={{ pl: { xs: 0, sm: 4.3 } }}>
                  <Alert severity="info">{extractNote}</Alert>
                </Box>
              ) : null}
            </Stack>

            {/* 2 DETAILS */}
            <Stack spacing={1.3}>
              <Stack alignItems="flex-start" direction="row" spacing={1.3}>
                <DescriptionOutlinedIcon
                  sx={{
                    color: '#0877ee',
                    fontSize: 23,
                    mt: 0.1,
                  }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    fontWeight={800}
                    sx={{
                      color: '#122040',
                      fontSize: 14,
                    }}
                  >
                    1. Provide job details
                  </Typography>

                  <Typography
                    sx={{
                      color: '#5d6c87',
                      fontSize: 11.5,
                    }}
                  >
                    Tell us about the job opportunity. Fields marked with * are
                    required.
                  </Typography>

                  <Divider sx={{ mt: 0.8 }} />
                </Box>
              </Stack>

              <Box sx={{ pl: { xs: 0, sm: 4.3 } }}>
                <Grid container spacing={1.2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
                      Job title *
                    </Typography>

                    <TextField
                      fullWidth
                      onChange={(event) => update('title', event.target.value)}
                      placeholder="e.g. Software Engineer"
                      size="small"
                      sx={fieldSx}
                      value={form.title}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
                      Company name *
                    </Typography>

                    <TextField
                      fullWidth
                      onChange={(event) =>
                        update('companyName', event.target.value)
                      }
                      placeholder="e.g. Google, Microsoft, TCS"
                      size="small"
                      sx={fieldSx}
                      value={form.companyName}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
                      Employment type *
                    </Typography>

                    <FormControl fullWidth>
                      <TextField
                        onChange={(event) =>
                          update('employmentType', event.target.value)
                        }
                        select
                        size="small"
                        sx={fieldSx}
                        value={form.employmentType}
                      >
                        <MenuItem value="">Select employment type</MenuItem>

                        {[
                          [EmploymentType.FullTime, 'Full-time'],
                          [EmploymentType.PartTime, 'Part-time'],
                          [EmploymentType.Contract, 'Contract'],
                          [EmploymentType.Internship, 'Internship'],
                        ].map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
  <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
    Skills *
  </Typography>

  <Stack direction="row" spacing={1}>
    <TextField
      fullWidth
      onChange={(event) => setSkillInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addSkill();
        }
      }}
      placeholder="e.g. C#, .NET Core, Angular"
      size="small"
      sx={fieldSx}
      value={skillInput}
    />

    <Button
      disabled={!skillInput.trim()}
      onClick={addSkill}
      sx={{ minWidth: 90 }}
      variant="outlined"
    >
      Add Skill
    </Button>
  </Stack>

  {form.skills.length > 0 ? (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.7}
      sx={{ mt: 1 }}
    >
      {form.skills.map((skill) => (
        <Chip
          key={skill.toLowerCase()}
          label={skill}
          onDelete={() => removeSkill(skill)}
          size="small"
        />
      ))}
    </Stack>
  ) : null}
</Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
  <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
    Experience required *
  </Typography>

  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
    <TextField
      fullWidth
      label="Minimum experience"
      onChange={(event) =>
        update('minimumExperienceYears', event.target.value)
      }
      select
      size="small"
      sx={fieldSx}
      value={form.minimumExperienceYears}
    >
      <MenuItem value="0">Fresher</MenuItem>
      {Array.from({ length: 21 }, (_, index) => index + 1).map(
        (year) => (
          <MenuItem key={year} value={String(year)}>
            {year} {year === 1 ? 'year' : 'years'}
          </MenuItem>
        ),
      )}
    </TextField>

    <TextField
      fullWidth
      label="Maximum experience"
      onChange={(event) =>
        update('maximumExperienceYears', event.target.value)
      }
      select
      size="small"
      sx={fieldSx}
      value={form.maximumExperienceYears}
    >
      <MenuItem value="0">Fresher</MenuItem>
      {Array.from({ length: 21 }, (_, index) => index + 1).map(
        (year) => (
          <MenuItem
            disabled={
              form.minimumExperienceYears !== '' &&
              year < Number(form.minimumExperienceYears)
            }
            key={year}
            value={String(year)}
          >
            {year} {year === 1 ? 'year' : 'years'}
          </MenuItem>
        ),
      )}
    </TextField>
  </Stack>
</Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
                      Category *
                    </Typography>

                    <TextField
                      disabled={categories.isLoading}
                      fullWidth
                      onChange={(event) =>
                        update('categoryId', event.target.value)
                      }
                      select
                      size="small"
                      sx={fieldSx}
                      value={form.categoryId}
                    >
                      <MenuItem value="">
                        {categories.isLoading
                          ? 'Loading categories…'
                          : 'Select job category'}
                      </MenuItem>

                      {(categories.data ?? []).map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}

                      <MenuItem value="__new">New category…</MenuItem>
                    </TextField>
                  </Grid>

                  {form.categoryId === '__new' ? (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="New category name"
                        onChange={(event) =>
                          update('newCategoryName', event.target.value)
                        }
                        required
                        size="small"
                        sx={fieldSx}
                        value={form.newCategoryName}
                      />
                    </Grid>
                  ) : null}

                  {categories.isError ? (
                    <Grid size={{ xs: 12 }}>
                      <Alert
                        action={
                          <Button
                            color="inherit"
                            onClick={() => void categories.refetch()}
                          >
                            Retry
                          </Button>
                        }
                        severity="warning"
                      >
                        Categories could not be loaded. You can create a new
                        category.
                      </Alert>
                    </Grid>
                  ) : null}

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
                      Location
                    </Typography>

                    <TextField
                      fullWidth
                      onChange={(event) =>
                        update('location', event.target.value)
                      }
                      placeholder="e.g. Bengaluru, Mumbai (optional)"
                      size="small"
                      sx={fieldSx}
                      value={form.location}
                    />
                  </Grid>

                 

                  

                

                

                  <Grid size={{ xs: 12 }}>
                    <Typography fontSize={11.5} fontWeight={600} mb={0.4}>
                      Application URL
                    </Typography>

                    <TextField
                      fullWidth
                      onChange={(event) =>
                        update('applicationUrl', event.target.value)
                      }
                      placeholder="e.g. https://company.com/apply (optional)"
                      size="small"
                      sx={fieldSx}
                      type="url"
                      value={form.applicationUrl}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Description"
                      minRows={2}
                      multiline
                      onChange={(event) =>
                        update('description', event.target.value)
                      }
                      placeholder="Share key responsibilities, skills, or any additional details... (optional)"
                      sx={fieldSx}
                      value={form.description}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>

            {/* CONTACT SHARING */}
            <Stack spacing={1.2} sx={{ mt: 2 }}>
              <Stack alignItems="flex-start" direction="row" spacing={1.3}>
                <LockRoundedIcon
                  sx={{
                    color: '#0877ee',
                    fontSize: 23,
                    mt: 0.1,
                  }}
                />

                <Box>
                  <Typography
                    fontWeight={800}
                    sx={{
                      color: '#122040',
                      fontSize: 14,
                    }}
                  >
                    2. Choose what to share
                  </Typography>

                  <Typography
                    sx={{
                      color: '#5d6c87',
                      fontSize: 11.5,
                    }}
                  >
                    Only paying subscribers can see this, and only for this job.
                  </Typography>
                </Box>
              </Stack>

              <Grid
                container
                spacing={1}
                sx={{
                  pl: { xs: 0, sm: 4.3 },
                }}
              >
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      borderColor: showLinkedIn ? '#a8cef8' : '#dce3ed',
                      borderRadius: 1.5,
                      height: '100%',
                      p: 1,
                    }}
                    variant="outlined"
                  >
                    <Stack spacing={0.7}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showLinkedIn}
                              onChange={(_, value) => setShowLinkedIn(value)}
                              size="small"
                            />
                          }
                          label={
                            <Stack
                              alignItems="center"
                              direction="row"
                              spacing={0.6}
                            >
                              <LinkedInIcon
                                color="primary"
                                sx={{ fontSize: 18 }}
                              />

                              <Typography fontSize={11.5} fontWeight={600}>
                                LinkedIn
                              </Typography>
                            </Stack>
                          }
                          sx={{ m: 0 }}
                        />

                        <Tooltip title="Candidates with referral contact access can see this LinkedIn profile.">
                          <InfoOutlinedIcon
                            sx={{
                              color: '#26385e',
                              fontSize: 16,
                            }}
                          />
                        </Tooltip>
                      </Stack>

                      {showLinkedIn ? (
                        <TextField
                          fullWidth
                          onChange={(event) =>
                            setLinkedinUrl(event.target.value)
                          }
                          placeholder="LinkedIn Profile URL"
                          size="small"
                          sx={fieldSx}
                          value={linkedinUrl}
                        />
                      ) : null}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      borderColor: showEmail ? '#a8cef8' : '#dce3ed',
                      borderRadius: 1.5,
                      height: '100%',
                      p: 1,
                    }}
                    variant="outlined"
                  >
                    <Stack spacing={0.7}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showEmail}
                              onChange={(_, value) => setShowEmail(value)}
                              size="small"
                            />
                          }
                          label={
                            <Stack
                              alignItems="center"
                              direction="row"
                              spacing={0.6}
                            >
                              <EmailOutlinedIcon sx={{ fontSize: 18 }} />

                              <Typography fontSize={11.5} fontWeight={600}>
                                Email
                              </Typography>
                            </Stack>
                          }
                          sx={{ m: 0 }}
                        />

                        <Tooltip title="Candidates with referral contact access can see this email address.">
                          <InfoOutlinedIcon
                            sx={{
                              color: '#26385e',
                              fontSize: 16,
                            }}
                          />
                        </Tooltip>
                      </Stack>

                      {showEmail ? (
                        <TextField
                          fullWidth
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="Contact email"
                          size="small"
                          sx={fieldSx}
                          type="email"
                          value={email}
                        />
                      ) : null}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      borderColor: showPhone ? '#a8cef8' : '#dce3ed',
                      borderRadius: 1.5,
                      height: '100%',
                      p: 1,
                    }}
                    variant="outlined"
                  >
                    <Stack spacing={0.7}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showPhone}
                              onChange={(_, value) => setShowPhone(value)}
                              size="small"
                            />
                          }
                          label={
                            <Stack
                              alignItems="center"
                              direction="row"
                              spacing={0.6}
                            >
                              <PhoneOutlinedIcon sx={{ fontSize: 18 }} />

                              <Typography fontSize={11.5} fontWeight={600}>
                                Phone
                              </Typography>
                            </Stack>
                          }
                          sx={{ m: 0 }}
                        />

                        <Tooltip title="Candidates with referral contact access can see this phone number.">
                          <InfoOutlinedIcon
                            sx={{
                              color: '#26385e',
                              fontSize: 16,
                            }}
                          />
                        </Tooltip>
                      </Stack>

                      {showPhone ? (
                        <TextField
                          fullWidth
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="+91 98765 43210"
                          size="small"
                          sx={fieldSx}
                          value={phone}
                        />
                      ) : null}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    onChange={(event) => setReferrerRole(event.target.value)}
                    placeholder="Your role at this company (optional)"
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <PersonOutlineRoundedIcon
                            sx={{
                              color: '#61708c',
                              fontSize: 19,
                              mr: 1,
                            }}
                          />
                        ),
                      },
                    }}
                    sx={fieldSx}
                    value={referrerRole}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    minRows={1}
                    multiline
                    onChange={(event) => setPersonalNote(event.target.value)}
                    placeholder="Personal note (optional) — e.g. Why you're referring this opportunity..."
                    size="small"
                    sx={fieldSx}
                    value={personalNote}
                  />
                </Grid>

                {submitError ? (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">{submitError}</Alert>
                  </Grid>
                ) : null}

                <Grid size={{ xs: 12 }}>
                  <Button
                    disabled={submitState.isLoading}
                    fullWidth
                    startIcon={<SendRoundedIcon />}
                    sx={{
                      borderRadius: 1.3,
                      fontWeight: 700,
                      mt: 0.5,
                      py: 1,
                    }}
                    type="submit"
                    variant="contained"
                  >
                    {submitState.isLoading
                      ? 'Submitting…'
                      : 'Submit for approval'}
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={1.5}>
            {/* REFERRALS */}
            <Paper
              id="your-referrals"
              sx={{
                borderRadius: 2.5,
                p: 2,
              }}
              variant="outlined"
            >
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={1}
              >
                <Box>
                  <Typography
                    fontWeight={800}
                    sx={{
                      color: '#122040',
                      fontSize: 16,
                    }}
                  >
                    Your referrals
                  </Typography>

                  <Typography
                    sx={{
                      color: '#697895',
                      fontSize: 11,
                      mt: 0.3,
                    }}
                  >
                    Track the status of jobs you've referred.
                  </Typography>
                </Box>

                <Button
  endIcon={<ArrowForwardRoundedIcon />}
  onClick={() => {
    void navigate(ROUTES.REFERRALS);
  }}
  size="small"
  sx={{
    fontSize: 11,
    minWidth: 0,
    whiteSpace: 'nowrap',
  }}
>
  View all referrals
</Button>
              </Stack>

              <Divider sx={{ my: 1.2 }} />

              {isMyReferralsLoading ? (
                <Stack spacing={1}>
                  <Skeleton height={65} variant="rounded" />
                  <Skeleton height={65} variant="rounded" />
                  <Skeleton height={65} variant="rounded" />
                </Stack>
              ) : isMyReferralsError ? (
                <Alert
                  action={
                    <Button
                      color="inherit"
                      onClick={() => void refetchMyReferrals()}
                      size="small"
                    >
                      Retry
                    </Button>
                  }
                  severity="warning"
                >
                  Referrals could not be loaded.
                </Alert>
              ) : !myReferrals.length ? (
                <Box
                  sx={{
                    py: 3,
                    textAlign: 'center',
                  }}
                >
                  <BusinessOutlinedIcon
                    sx={{
                      color: '#0877ee',
                      fontSize: 34,
                    }}
                  />

                  <Typography fontWeight={700} mt={0.5}>
                    No referrals yet
                  </Typography>

                  <Typography color="text.secondary" fontSize={12} mt={0.4}>
                    Submit your first job opportunity and track it here.
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {myReferrals.map((referral) => (
                    <Box
  key={referral.id}
  onClick={() => {
    if (referral.sourceUrl) {
      window.open(referral.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  }}
  sx={{
    py: 1.4,
    px: 1.25,
    borderBottom: '1px solid #E5EAF2',
    cursor: referral.sourceUrl ? 'pointer' : 'default',
    '&:last-of-type': {
      borderBottom: 'none',
    },
    '&:hover': {
      bgcolor: '#F8FAFD',
    },
  }}
>
  <Stack direction="row" alignItems="center" spacing={1.25}>
    {/* Job icon */}
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 2,
        bgcolor: '#EFF6FF',
        color: '#0B74DE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <BusinessRoundedIcon sx={{ fontSize: 18 }} />
    </Box>

    {/* Referral details */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {/* Job title */}
      <Typography
        noWrap
        sx={{
          color: '#14213D',
          fontSize: 12.5,
          fontWeight: 800,
          lineHeight: 1.3,
        }}
      >
        {referral.jobTitle}
      </Typography>

      {/* Location */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.4}
        sx={{ mt: 0.45 }}
      >
        <LocationOnOutlinedIcon
          sx={{
            fontSize: 13,
            color: '#64748B',
          }}
        />

        <Typography
          noWrap
          sx={{
            color: '#64748B',
            fontSize: 10.5,
            fontWeight: 500,
          }}
        >
          {referral.location || 'Location not specified'}
        </Typography>
      </Stack>

      {/* Submitted date + status */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          mt: 0.45,
          flexWrap: 'wrap',
          rowGap: 0.4,
        }}
      >
        <Typography
          sx={{
            color: '#64748B',
            fontSize: 10.5,
            whiteSpace: 'nowrap',
          }}
        >
          Submitted{' '}
          {new Date(referral.createdAtUtc).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Typography>

        <Typography
          component="span"
          sx={{
            color: '#CBD5E1',
            fontSize: 10,
          }}
        >
          •
        </Typography>

        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            color:
              normalizeReferralStatus(referral.approvalStatus) === 'Approved'
                ? '#15803D'
                : normalizeReferralStatus(referral.approvalStatus) === 'Rejected'
                  ? '#DC2626'
                  : '#D97706',
          }}
        >
          {normalizeReferralStatus(referral.approvalStatus) === 'Approved'
            ? 'Approved'
            : normalizeReferralStatus(referral.approvalStatus) === 'Rejected'
              ? 'Rejected'
              : 'Pending'}
        </Typography>
      </Stack>
    </Box>

    {/* Arrow */}
    <ChevronRightRoundedIcon
      sx={{
        color: '#64748B',
        fontSize: 20,
        flexShrink: 0,
      }}
    />
  </Stack>
</Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* TIPS */}
            <Paper
              sx={{
                borderRadius: 2.5,
                p: 2,
              }}
              variant="outlined"
            >
              <Stack alignItems="center" direction="row" spacing={1.2}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: '#e8f3ff',
                    borderRadius: '50%',
                    color: '#0877ee',
                    display: 'flex',
                    height: 38,
                    justifyContent: 'center',
                    width: 38,
                  }}
                >
                  <LightbulbRoundedIcon />
                </Box>

                <Typography
                  fontWeight={800}
                  sx={{
                    color: '#122040',
                    fontSize: 15,
                  }}
                >
                  Tips for a great referral
                </Typography>
              </Stack>

              <Stack spacing={1.05} sx={{ mt: 1.6 }}>
                {[
                  'Share accurate job details',
                  "Include the company's official job link",
                  'Mention key skills and requirements',
                  'Choose what contact details to share',
                  'We review all submissions before publishing',
                ].map((tip) => (
                  <Stack
                    alignItems="center"
                    direction="row"
                    key={tip}
                    spacing={1}
                  >
                    <CheckCircleOutlineRoundedIcon
                      sx={{
                        color: '#0877ee',
                        fontSize: 18,
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#283a5d',
                        fontSize: 11.5,
                      }}
                    >
                      {tip}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* MAKE A DIFFERENCE */}
            <Paper
              sx={{
                background:
                  'linear-gradient(110deg, #fff9fa 0%, #f6faff 100%)',
                borderRadius: 2.5,
                p: 2,
              }}
              variant="outlined"
            >
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={1.5}
              >
                <Stack alignItems="center" direction="row" spacing={1.2}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      bgcolor: '#ffe2e6',
                      borderRadius: '50%',
                      color: '#ef3d57',
                      display: 'flex',
                      flexShrink: 0,
                      height: 42,
                      justifyContent: 'center',
                      width: 42,
                    }}
                  >
                    <FavoriteRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      fontWeight={800}
                      sx={{
                        color: '#122040',
                        fontSize: 15,
                      }}
                    >
                      Make a difference
                    </Typography>

                    <Typography
                      sx={{
                        color: '#536685',
                        fontSize: 11.5,
                        lineHeight: 1.45,
                        mt: 0.6,
                      }}
                    >
                      Your referral can help someone take the next step in their
                      career.
                    </Typography>
                  </Box>
                </Stack>

                <GroupsRoundedIcon
                  sx={{
                    color: '#2588ed',
                    fontSize: 44,
                  }}
                />
              </Stack>
            </Paper>

            {/* QUOTE */}
            <Paper
              sx={{
                borderRadius: 2.5,
                px: 2,
                py: 1.8,
                textAlign: 'center',
              }}
              variant="outlined"
            >
              <Typography
                sx={{
                  color: '#536685',
                  fontSize: 11.5,
                  fontStyle: 'italic',
                }}
              >
                “Great opportunities grow through great people.”
              </Typography>

              <Typography
                sx={{
                  color: '#536685',
                  fontSize: 11,
                  mt: 0.8,
                }}
              >
                — Career Harbor
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        autoHideDuration={4000}
        message={toast}
        onClose={() => setToast(null)}
        open={Boolean(toast)}
      />
    </Box>
  );
};