import { useRef, useState, type ReactNode } from 'react';

import {

  Alert,

  Avatar,

  Box,

  Breadcrumbs,

  Button,

  Checkbox,

  Chip,

  CircularProgress,

  FormControlLabel,

  Link,

  Paper,

  Stack,

  Step,

  StepLabel,

  Stepper,

  Typography,

} from '@mui/material';

import {

  ArrowBack,

  ArrowForward,

  BadgeOutlined,

  CalendarMonthOutlined,

  EditOutlined,

  LightbulbOutlined,

  SettingsOutlined,

  ShieldOutlined,

  TaskAlt,

  WorkOutline,

} from '@mui/icons-material';

import { Link as RouterLink } from 'react-router-dom';

import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

import { ROUTES } from '@/constants/routes';

import {

  CONSULTANT_POLICY_VERSION,

  useGetConsultantOnboardingQuery,

  useSubmitConsultantOnboardingMutation,

} from '../api/onboardingApi';

import { guidanceError, guidanceErrorMessage } from '../utils/errors';

import { consultantLifecycle } from '../utils/lifecycle';

import { guidanceRoutes } from '../utils/routes';
import { useAuthenticatedProfilePhoto } from '../hooks/useAuthenticatedProfilePhoto';

import { CareerProfessionalType, ConsultantVerificationStatus } from '../types';



const STEPS = [

  'Basic information',

  'Professional details',

  'Expertise & services',

  'Availability',

  'Review & submit',

];

const DAYS = [

  { value: 1, label: 'Mon' },

  { value: 2, label: 'Tue' },

  { value: 3, label: 'Wed' },

  { value: 4, label: 'Thu' },

  { value: 5, label: 'Fri' },

  { value: 6, label: 'Sat' },

  { value: 0, label: 'Sun' },

];

const TYPES = new Map<number, string>([

  [CareerProfessionalType.CurrentEmployee, 'Current employee'],

  [CareerProfessionalType.FormerEmployee, 'Former employee'],

  [CareerProfessionalType.Recruiter, 'Recruiter'],

  [CareerProfessionalType.HiringManager, 'Hiring manager'],

  [CareerProfessionalType.CareerCoach, 'Career coach'],

]);



const record = (value: unknown): value is Record<string, unknown> =>

  typeof value === 'object' && value !== null;

const strings = (value: unknown): value is string[] =>

  Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');



// Check fields rendered by this screen before using a response, including successful submissions.

function validReview(value: unknown): boolean {

  if (

    !record(value) ||

    typeof value.id !== 'string' ||

    !value.id ||

    typeof value.revision !== 'string' ||

    !value.revision ||

    ![1, 2, 3, 4, 5].includes(Number(value.status)) ||

    typeof value.status !== 'number'

  )

    return false;

  if (

    ![

      'displayName',

      'professionalHeadline',

      'bio',

      'companyName',

      'currentRole',

      'policyVersion',

    ].every((key) => typeof value[key] === 'string')

  )

    return false;

  if (

    ![

      'location',

      'professionalEmail',

      'industry',

      'functionalArea',

      'rejectionFeedback',

    ].every((key) => value[key] === null || typeof value[key] === 'string')

  )

    return false;

  if (!strings(value.languages) || !strings(value.expertise) || !strings(value.missingRequirements))

    return false;

  if (

    !(value.yearsOfExperience === null || typeof value.yearsOfExperience === 'number') ||

    !(value.professionalType === null || typeof value.professionalType === 'number')

  )

    return false;

  if (

    !Array.isArray(value.education) ||

    !value.education.every(

      (item: unknown) =>

        record(item) &&

        typeof item.qualification === 'string' &&

        typeof item.institution === 'string' &&

        (item.fieldOfStudy === null || typeof item.fieldOfStudy === 'string') &&

        (item.startYear === null || typeof item.startYear === 'number') &&

        (item.endYear === null || typeof item.endYear === 'number') &&

        typeof item.isCurrentlyStudying === 'boolean',

    )

  )

    return false;

  if (

    !Array.isArray(value.services) ||

    !value.services.every(

      (item: unknown) =>

        record(item) &&

        ['id', 'title', 'serviceType', 'description', 'currency'].every(

          (key) => typeof item[key] === 'string',

        ) &&

        typeof item.durationMinutes === 'number' &&

        typeof item.price === 'number' &&

        Number.isFinite(item.price) &&

        typeof item.isActive === 'boolean',

    )

  )

    return false;

  const availability = value.availability;

  return (

    record(availability) &&

    (availability.timeZoneId === null || typeof availability.timeZoneId === 'string') &&

    Array.isArray(availability.windows) &&

    availability.windows.every(

      (item: unknown) =>

        record(item) &&

        typeof item.dayOfWeek === 'number' &&

        typeof item.startTime === 'string' &&

        typeof item.endTime === 'string' &&

        typeof item.isActive === 'boolean',

    )

  );

}



function time(value: string): string {

  const [hour = '', minute = ''] = value.split(':');

  const hours = Number(hour);

  if (!/^\d{2}$/.test(hour) || !/^\d{2}$/.test(minute) || hours > 23 || Number(minute) > 59)

    return value;

  return `${hours % 12 || 12}:${minute} ${hours >= 12 ? 'PM' : 'AM'}`;

}

function Row({ label, children }: { label: string; children: ReactNode }) {

  if (children === null || children === undefined || children === '') return null;

  return (

    <Box

      sx={{

        display: 'grid',

        gridTemplateColumns: { xs: '1fr', sm: '170px minmax(0, 1fr)' },

        gap: 1,

        py: 0.45,

      }}

    >

      <Typography component="dt" color="text.secondary" variant="body2">

        {label}

      </Typography>

      <Box component="dd" sx={{ m: 0, overflowWrap: 'anywhere', typography: 'body2' }}>

        {children}

      </Box>

    </Box>

  );

}

function ReviewCard({

  title,

  icon,

  to,

  editable,

  children,

}: {

  title: string;

  icon: ReactNode;

  to: string;

  editable: boolean;

  children: ReactNode;

}) {

  return (

    <Paper

      component="section"

      variant="outlined"

      sx={{

        p: { xs: 2, md: 2.5 },

        borderRadius: 3,

        borderColor: '#edf2fb',

        boxShadow: '0 3px 14px #315ca006',

      }}

    >

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>

        <Avatar sx={{ bgcolor: '#edf4ff', color: 'primary.main' }}>{icon}</Avatar>

        <Typography component="h2" variant="h6" fontWeight={800} sx={{ flex: 1 }}>

          {title}

        </Typography>

        {editable && (

          <Button

            component={RouterLink}

            to={to}

            size="small"

            startIcon={<EditOutlined />}

            aria-label={`Edit ${title.toLowerCase()}`}

          >

            Edit

          </Button>

        )}

      </Stack>

      {children}

    </Paper>

  );

}

function InfoCard({

  title,

  color,

  icon,

  children,

}: {

  title: string;

  color: string;

  icon: ReactNode;

  children: ReactNode;

}) {

  return (

    <Paper variant="outlined" sx={{ p: 2.5, bgcolor: color, border: 0, borderRadius: 3 }}>

      <Stack direction="row" spacing={1.5}>

        <Box sx={{ color: 'primary.main', pt: 0.5 }}>{icon}</Box>

        <Box>

          <Typography component="h2" variant="h6" fontWeight={800}>

            {title}

          </Typography>

          <Box sx={{ mt: 1, color: 'text.secondary', typography: 'body2', lineHeight: 1.6 }}>

            {children}

          </Box>

        </Box>

      </Stack>

    </Paper>

  );

}



export default function ConsultantReviewSubmitPage() {

  useDocumentMetadata(

    'Review & submit | Become a consultant | Career Harbor',

    'Review your consultant profile before submitting it to CareerHarbor.',

  );

  const {

    data,

    isLoading,

    isFetching,

    error: loadError,

    refetch,

  } = useGetConsultantOnboardingQuery();

  const [submit, { isLoading: submitting }] = useSubmitConsultantOnboardingMutation();
  const { photoUrl: photo } = useAuthenticatedProfilePhoto();



  const [consent, setConsent] = useState({ revision: '', terms: false, publicProfile: false });

  const [error, setError] = useState<string | null>(null);

  const [uncertain, setUncertain] = useState(false);

  const inFlight = useRef(false);

  const onboarding = data;

  if (isLoading)

    return (

      <Stack alignItems="center" spacing={2} sx={{ py: 10 }}>

        <CircularProgress aria-label="Loading consultant profile" />

        <Typography>Loading your profile…</Typography>

      </Stack>

    );

  if (loadError || !onboarding || !validReview(onboarding))

    return (

      <Alert

        severity="error"

        action={

          <Button

            onClick={() => {

              void refetch();

            }}

          >

            Retry

          </Button>

        }

      >

        {loadError

          ? guidanceErrorMessage(loadError)

          : 'We could not load a complete profile response. Please reload before continuing.'}

      </Alert>

    );



  const lifecycle = consultantLifecycle(onboarding.status, onboarding.missingRequirements);

  const { isDraft: draft, isRejected: rejected, missing } = lifecycle;

  const editable = lifecycle.canEditOnboarding && !submitting;

  const terms = consent.revision === onboarding.revision && consent.terms;

  const publicConsent = consent.revision === onboarding.revision && consent.publicProfile;

  const blocked =

    !lifecycle.canSubmit ||

    !terms ||

    !publicConsent ||

    missing.length > 0 ||

    isFetching ||

    submitting ||

    uncertain;


  const activeServices = onboarding.services.filter((service) => service.isActive);

  const activeWindows = onboarding.availability.windows.filter((window) => window.isActive);



  const submitApplication = async () => {

    if (blocked || inFlight.current) return;

    inFlight.current = true;

    setError(null);

    try {

      const result = await submit({

        revision: onboarding.revision,

        policyVersion: CONSULTANT_POLICY_VERSION,

        acceptIndependentGuidancePolicy: terms,

        acceptPublicProfileConsent: publicConsent,

      }).unwrap();

      if (

        !result ||

        !validReview(result) ||

        result.id !== onboarding.id ||

        result.status !== ConsultantVerificationStatus.Pending ||

        !result.submittedAtUtc ||

        !result.publicProfileConsentAtUtc ||

        !result.termsAcceptedAtUtc ||

        result.policyVersion !== CONSULTANT_POLICY_VERSION

      ) {

        setUncertain(true);

        setError(

          'The submission response was unexpected. Reload your profile to check its status before trying again.',

        );

        return;

      }

      setUncertain(true);

      const refreshed = await refetch();

      if (refreshed.data && validReview(refreshed.data) && refreshed.data.status !== ConsultantVerificationStatus.Draft) {

        setUncertain(false);

      } else {

        setError("Reload your profile to confirm its latest status before continuing.");

      }

    } catch (cause: unknown) {

      const details = guidanceError(cause);

      if (details.status === 409) {

        setConsent({ revision: '', terms: false, publicProfile: false });

        setError(

          'Your profile changed. Review the reloaded information and confirm both consent choices again before submitting.',

        );

        await refetch();

      } else if (details.status === 400) {

        const messages = Object.values(details.errors ?? {})

          .flat()

          .join(' ');

        setError(messages || details.message || guidanceErrorMessage(cause));

        await refetch();

      } else {

        setError(

          details.status

            ? guidanceErrorMessage(cause)

            : 'We could not confirm submission. Reload your profile to check its status before trying again.',

        );

        if (!details.status || details.status >= 500) setUncertain(true);

      }

    } finally {

      inFlight.current = false;

    }

  };



  return (

    <Stack spacing={3} sx={{ pb: 5 }}>

      <Breadcrumbs separator="›" aria-label="Breadcrumb">

        <Link component={RouterLink} to={guidanceRoutes.marketplace}>

          Career Guidance

        </Link>

        <Link component={RouterLink} to={guidanceRoutes.becomeConsultant}>

          Become a consultant

        </Link>

        <Typography fontWeight={700}>Create profile</Typography>

      </Breadcrumbs>

      <Stepper

        activeStep={4}

        alternativeLabel

        sx={{

          '& .MuiStepLabel-label': { fontSize: { xs: 10, sm: 14 } },

          '& .MuiStepIcon-root': { fontSize: 32 },

        }}

      >

        {STEPS.map((label) => (

          <Step key={label}>

            <StepLabel>{label}</StepLabel>

          </Step>

        ))}

      </Stepper>

      <Box>

        <Typography component="h1" variant="h4" fontWeight={850}>

          {lifecycle.title}

        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.75 }}>

          {draft ? 'Review your information and complete the required consent before submitting.' : lifecycle.isPending ? 'CareerHarbor is reviewing your profile.' : lifecycle.isVerified ? 'Manage your services and availability from your consultant workspace.' : rejected ? 'Review the feedback, update your profile, and resubmit after corrections.' : 'Consultant access and public availability are restricted.'}

        </Typography>

      </Box>

      {error && (

        <Alert

          severity="error"

          action={

            uncertain ? (

              <Button

                onClick={() => {

                  void refetch().then((result) => {

                    if (result.data && validReview(result.data)) {

                      setUncertain(false);

                      setConsent({ revision: '', terms: false, publicProfile: false });

                      setError(null);

                    }

                  });

                }}

              >

                Reload profile

              </Button>

            ) : undefined

          }

        >

          {error}

        </Alert>

      )}

      {!draft && (

        <Alert

          severity={

            rejected || onboarding.status === ConsultantVerificationStatus.Suspended

              ? 'warning'

              : 'success'

          }

        >

          <Typography fontWeight={800}>{lifecycle.displayStatus}</Typography>

          {lifecycle.isVerified && <Stack direction="row" spacing={2} sx={{ mt: 1 }}>

            <Button component={RouterLink} variant="contained" to={guidanceRoutes.owner('profile')}>Open Consultant Workspace</Button>

            <Button component={RouterLink} to={guidanceRoutes.profile(onboarding.id)}>View public profile</Button>

          </Stack>}

          {rejected && <Button component={RouterLink} to={guidanceRoutes.consultantOnboardingBasic}>Update profile</Button>}

        </Alert>

      )}

      {(draft || rejected) && onboarding.rejectionFeedback && (

        <Alert severity="warning">Review feedback: {onboarding.rejectionFeedback}</Alert>

      )}

      {draft && missing.length > 0 && (

        <Alert severity="warning">

          <Typography fontWeight={700}>Complete the following before submitting</Typography>

          <Box component="ul" sx={{ my: 1, pl: 2 }}>

            {missing.map((item) => (

              <li key={item}>{item.replace(/([a-z])([A-Z])/g, '$1 $2')}</li>

            ))}

          </Box>

          Use the Edit actions below to complete these requirements.

        </Alert>

      )}

      <Box

        sx={{

          display: 'grid',

          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(320px, 1fr)' },

          gap: 3,

          alignItems: 'start',

        }}

      >

        <Stack spacing={1.5}>

          <ReviewCard

            title="Basic information"

            icon={<BadgeOutlined />}

            to={guidanceRoutes.consultantOnboardingBasic}

            editable={editable}

          >

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>

              {photo && (

                <Box

                  component="img"

                  src={photo}

                  alt={`${onboarding.displayName}'s consultant profile`}

                  sx={{ width: 150, height: 160, objectFit: 'cover', borderRadius: 2 }}

                />

              )}

              <Box component="dl" sx={{ m: 0, flex: 1 }}>

                <Row label="Full name">{onboarding.displayName}</Row>

                <Row label="Headline">{onboarding.professionalHeadline}</Row>

                <Row label="Location">{onboarding.location}</Row>

                <Row label="Professional email">{onboarding.professionalEmail}</Row>

                <Row label="Bio">{onboarding.bio}</Row>

              </Box>

            </Stack>

          </ReviewCard>

          <ReviewCard

            title="Professional details"

            icon={<WorkOutline />}

            to={guidanceRoutes.consultantOnboardingProfessional}

            editable={editable}

          >

            <Box component="dl" sx={{ m: 0 }}>

              <Row label="Current role">{onboarding.currentRole}</Row>

              <Row label="Company">{onboarding.companyName}</Row>

              <Row label="Total experience">

                {onboarding.yearsOfExperience !== null

                  ? `${onboarding.yearsOfExperience} years`

                  : null}

              </Row>

              <Row label="Professional type">

                {onboarding.professionalType !== null

                  ? TYPES.get(onboarding.professionalType)

                  : null}

              </Row>

              <Row label="Functional area">{onboarding.functionalArea}</Row>

              <Row label="Industry">{onboarding.industry}</Row>

              {onboarding.education.length > 0 && (

                <Row label="Education">

                  <Stack spacing={1}>

                    {onboarding.education.map((item, index) => (

                      <Box key={`${item.qualification}-${index}`}>

                        <Typography variant="body2">

                          {item.qualification}, {item.institution}

                          {item.fieldOfStudy ? ` — ${item.fieldOfStudy}` : ''}

                        </Typography>

                        {(item.startYear !== null ||

                          item.endYear !== null ||

                          item.isCurrentlyStudying) && (

                          <Typography variant="caption" color="text.secondary">

                            {[item.startYear, item.isCurrentlyStudying ? 'Present' : item.endYear]

                              .filter((value) => value !== null)

                              .join(' – ')}

                          </Typography>

                        )}

                      </Box>

                    ))}

                  </Stack>

                </Row>

              )}

            </Box>

          </ReviewCard>

          <ReviewCard

            title="Expertise & services"

            icon={<SettingsOutlined />}

            to={guidanceRoutes.consultantOnboardingExpertise}

            editable={editable}

          >

            <Box component="dl" sx={{ m: 0 }}>

              <Row label="Areas of expertise">

                <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>

                  {onboarding.expertise.map((item) => (

                    <Chip key={item} label={item} color="primary" variant="outlined" size="small" />

                  ))}

                </Stack>

              </Row>

              <Row label="Languages">{onboarding.languages.join(', ')}</Row>

            </Box>

            <Stack spacing={1.5} sx={{ mt: 2 }}>

              {activeServices.map((service) => (

                <Box key={service.id} sx={{ p: 2, bgcolor: '#f5f8ff', borderRadius: 2 }}>

                  <Typography component="h3" fontWeight={700}>

                    {service.title}

                  </Typography>

                  <Typography variant="body2" color="text.secondary">

                    {service.serviceType} · {service.durationMinutes} minutes ·{' '}

                    {service.currency === 'INR'

                      ? new Intl.NumberFormat('en-IN', {

                          style: 'currency',

                          currency: 'INR',

                        }).format(service.price)

                      : `${service.price} ${service.currency}`}

                  </Typography>

                  {service.description && (

                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>

                      {service.description}

                    </Typography>

                  )}

                </Box>

              ))}

              {activeServices.length === 0 && (

                <Typography color="text.secondary">No active services saved.</Typography>

              )}

            </Stack>

          </ReviewCard>

          <ReviewCard

            title="Availability"

            icon={<CalendarMonthOutlined />}

            to={guidanceRoutes.consultantOnboardingAvailability}

            editable={editable}

          >

            <Box component="dl" sx={{ m: 0 }}>

              <Row label="Time zone">{onboarding.availability.timeZoneId}</Row>

              <Row label="Weekly schedule">

                <Stack spacing={1}>

                  {DAYS.map((day) => {

                    const windows = activeWindows

                      .filter((window) => window.dayOfWeek === day.value)

                      .sort((a, b) => a.startTime.localeCompare(b.startTime));

                    return windows.length ? (

                      <Stack key={day.value} direction="row" spacing={1} alignItems="start">

                        <Chip label={day.label} size="small" color="primary" variant="outlined" />

                        <Stack spacing={0.5}>

                          {windows.map((window, index) => (

                            <Typography key={`${window.startTime}-${index}`} variant="body2">

                              {time(window.startTime)} – {time(window.endTime)}

                            </Typography>

                          ))}

                        </Stack>

                      </Stack>

                    ) : null;

                  })}

                  {activeWindows.length === 0 && (

                    <Typography variant="body2">No active weekly windows saved.</Typography>

                  )}

                </Stack>

              </Row>

            </Box>

          </ReviewCard>

        </Stack>

        <Stack spacing={2}>

          {draft && <>

          <InfoCard title="You're almost there!" color="#effbf5" icon={<TaskAlt />}>

            Review your details and submit your consultant profile for CareerHarbor review.

          </InfoCard>

          <InfoCard title="Before submitting" color="#f0f6ff" icon={<LightbulbOutlined />}>

            <Box component="ul" sx={{ m: 0, pl: 2, '& li + li': { mt: 1.5 } }}>

              <li>Review your profile information for accuracy.</li>

              <li>Your profile will be reviewed by CareerHarbor.</li>

              <li>

                You can update your profile later, subject to the existing onboarding/profile rules.

              </li>

              <li>

                Your profile is not publicly bookable until it reaches the appropriate approved

                state.

              </li>

            </Box>

          </InfoCard>

          <InfoCard title="Profile review" color="#f7f4ff" icon={<ShieldOutlined />}>

            CareerHarbor reviews consultant applications before they can become publicly

            discoverable and bookable.

          </InfoCard>

          </>}

          {draft && (

            <Paper

              variant="outlined"

              sx={{ p: 2.5, bgcolor: '#fff8ec', border: 0, borderRadius: 3 }}

            >

              <Typography component="h2" variant="h6" fontWeight={800}>

                Terms & consent

              </Typography>

              <Typography variant="body2" sx={{ my: 1 }}>

                Independent career guidance, not employer representation. No guaranteed job,

                interview or referral. Do not disclose employer-confidential information; comply

                with your employer’s outside-work policies.

              </Typography>

              <Typography variant="caption">Policy: {CONSULTANT_POLICY_VERSION}</Typography>

              <FormControlLabel

                control={

                  <Checkbox

                    checked={terms}

                    disabled={submitting}

                    onChange={(_, checked) =>

                      setConsent({

                        revision: onboarding.revision,

                        terms: checked,

                        publicProfile: publicConsent,

                      })

                    }

                  />

                }

                label="I agree to the Consultant Terms & Conditions."

              />

              <FormControlLabel

                control={

                  <Checkbox

                    checked={publicConsent}

                    disabled={submitting}

                    onChange={(_, checked) =>

                      setConsent({ revision: onboarding.revision, terms, publicProfile: checked })

                    }

                  />

                }

                label="I consent to the selected consultant profile information being displayed publicly after approval."

              />

              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>

                <Link

                  component={RouterLink}

                  to={ROUTES.TERMS_OF_USE}

                  target="_blank"

                  rel="noopener"

                >

                  Terms of use

                </Link>

                <Link

                  component={RouterLink}

                  to={ROUTES.PRIVACY_POLICY}

                  target="_blank"

                  rel="noopener"

                >

                  Privacy policy

                </Link>

              </Stack>

            </Paper>

          )}

          {(draft || rejected) && (

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f2f7ff', border: 0, borderRadius: 3 }}>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>

                <Button

                  component={RouterLink}

                  to={guidanceRoutes.consultantOnboardingAvailability}

                  disabled={submitting}

                  variant="outlined"

                  startIcon={<ArrowBack />}

                >

                  Back

                </Button>

                {draft && (

                  <Button

                    variant="contained"

                    endIcon={

                      submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />

                    }

                    disabled={blocked}

                    onClick={() => {

                      void submitApplication();

                    }}

                    sx={{ flex: 1 }}

                  >

                    {submitting ? 'Submitting…' : 'Submit for review'}

                  </Button>

                )}

              </Stack>

            </Paper>

          )}

        </Stack>

      </Box>

    </Stack>

  );

}
