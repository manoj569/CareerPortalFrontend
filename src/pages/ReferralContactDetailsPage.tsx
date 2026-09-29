import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ROUTES,
} from '@/constants/routes';
import {
  useGetPublicReferralJobsQuery,
  useLazyUnlockReferralContactQuery,
} from '@/features/referrals/api/referralsApi';
import type {
  PublicReferralJob,
  ReferrerContactDetails,
} from '@/features/referrals/types/referralModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const initials = (name: string | null | undefined) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const employmentLabels: Record<string, string> = {
  1: 'Full-time',
  FullTime: 'Full-time',
  2: 'Part-time',
  PartTime: 'Part-time',
  3: 'Contract',
  Contract: 'Contract',
  4: 'Internship',
  Internship: 'Internship',
  5: 'Freelance',
  Freelance: 'Freelance',
  6: 'Temporary',
  Temporary: 'Temporary',
};

const experienceLabel = (
  minimum?: number | null,
  maximum?: number | null,
) => {
  if (minimum === 0 && maximum === 0) return 'Fresher';

  if (minimum != null && maximum != null) {
    return minimum === maximum
      ? `${minimum} years`
      : `${minimum}–${maximum} years`;
  }

  if (minimum != null) return `${minimum}+ years`;
  if (maximum != null) return `Up to ${maximum} years`;

  return null;
};

const copyValue = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    enqueueSnackbar(`${label} copied`, { variant: 'success' });
  } catch {
    enqueueSnackbar(`Unable to copy ${label.toLowerCase()}`, {
      variant: 'error',
    });
  }
};

const ContactRow = ({
  icon,
  label,
  value,
  copyLabel,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyLabel: string;
  href?: string;
}) => (
  <Box
    sx={{
      border: '1px solid #E2E8F0',
      borderRadius: 2,
      p: { xs: 1.75, sm: 2 },
    }}
  >
    <Stack
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={1.5}
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: '#EEF4FF',
            borderRadius: 2,
            color: '#2563EB',
            display: 'flex',
            flex: '0 0 auto',
            height: 42,
            justifyContent: 'center',
            width: 42,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            color="text.secondary"
            fontSize={11.5}
            fontWeight={700}
          >
            {label}
          </Typography>

          {href ? (
            <Typography
              component="a"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              sx={{
                color: '#1D4ED8',
                display: 'block',
                fontSize: 13.5,
                fontWeight: 650,
                mt: 0.25,
                overflowWrap: 'anywhere',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {value}
            </Typography>
          ) : (
            <Typography
              fontSize={13.5}
              fontWeight={650}
              sx={{
                mt: 0.25,
                overflowWrap: 'anywhere',
              }}
            >
              {value}
            </Typography>
          )}
        </Box>
      </Stack>

      <Button
        onClick={() => void copyValue(value, copyLabel)}
        size="small"
        startIcon={<ContentCopyOutlinedIcon />}
        sx={{
          flexShrink: 0,
          textTransform: 'none',
        }}
        variant="outlined"
      >
        Copy
      </Button>
    </Stack>
  </Box>
);

const JobSummary = ({ job }: { job: PublicReferralJob }) => {
  const experience = experienceLabel(
    job.minimumExperienceYears,
    job.maximumExperienceYears,
  );

  const employment =
    job.employmentType == null
      ? null
      : employmentLabels[String(job.employmentType)];

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #E2E8F0',
        borderRadius: 2.5,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar
          alt={job.companyName ?? 'Company'}
          src={job.companyLogoUrl ?? undefined}
          variant="rounded"
          sx={{
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#2563EB',
            flex: '0 0 auto',
            fontWeight: 800,
            height: { xs: 56, sm: 64 },
            width: { xs: 56, sm: 64 },
            '& img': {
              objectFit: 'contain',
              p: 0.5,
            },
          }}
        >
          {initials(job.companyName) || <BusinessOutlinedIcon />}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
            sx={{
              color: '#101828',
              fontSize: { xs: 17, sm: 19 },
              fontWeight: 800,
            }}
          >
            {job.jobTitle}
          </Typography>

          {job.companyName ? (
            <Typography
              color="text.secondary"
              fontSize={14}
              fontWeight={600}
              sx={{ mt: 0.25 }}
            >
              {job.companyName}
            </Typography>
          ) : null}

          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1.5}
            sx={{
              color: '#667085',
              mt: 1.25,
            }}
            useFlexGap
          >
            {job.location ? (
              <Stack alignItems="center" direction="row" spacing={0.5}>
                <LocationOnOutlinedIcon sx={{ fontSize: 17 }} />
                <Typography fontSize={12.5}>{job.location}</Typography>
              </Stack>
            ) : null}

            {employment ? (
              <Stack alignItems="center" direction="row" spacing={0.5}>
                <WorkOutlineIcon sx={{ fontSize: 17 }} />
                <Typography fontSize={12.5}>{employment}</Typography>
              </Stack>
            ) : null}

            {experience ? (
              <Typography fontSize={12.5}>{experience}</Typography>
            ) : null}
          </Stack>

          {job.skills?.length ? (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.75}
              sx={{ mt: 1.5 }}
              useFlexGap
            >
              {job.skills.slice(0, 6).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: '#F2F4F7',
                    fontSize: 11.5,
                  }}
                />
              ))}
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
};

const ReferrerCard = ({
  contact,
  job,
}: {
  contact: ReferrerContactDetails;
  job: PublicReferralJob | null;
}) => {
  const displayName = contact.referrerName || job?.referrerName || 'Referrer';

  const roleLine = [
    job?.referrerCurrentRole,
    job?.referrerCompanyName,
  ]
    .filter(Boolean)
    .join(' at ');

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #E2E8F0',
        borderRadius: 2.5,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: '#F8FAFF',
          borderBottom: '1px solid #E2E8F0',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack alignItems="center" direction="row" spacing={1}>
          <GroupsOutlinedIcon sx={{ color: '#2563EB' }} />

          <Typography fontSize={15} fontWeight={800}>
            Employee contact
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={2.25} sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack alignItems="center" direction="row" spacing={1.75}>
          <Avatar
            alt={displayName}
            src={job?.referrerProfileImageUrl ?? undefined}
            sx={{
              bgcolor: '#E8EEFA',
              color: '#344B72',
              fontSize: 15,
              fontWeight: 800,
              height: 54,
              width: 54,
            }}
          >
            {initials(displayName)}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontSize={16}
              fontWeight={800}
              sx={{ overflowWrap: 'anywhere' }}
            >
              {displayName}
            </Typography>

            {roleLine ? (
              <Typography
                color="text.secondary"
                fontSize={12.5}
                sx={{ mt: 0.25 }}
              >
                {roleLine}
              </Typography>
            ) : null}

            {job?.referrerCompletedYearsAtCompany != null ? (
              <Typography
                color="text.secondary"
                fontSize={11.5}
                sx={{ mt: 0.25 }}
              >
                {job.referrerCompletedYearsAtCompany}{' '}
                {job.referrerCompletedYearsAtCompany === 1
                  ? 'year'
                  : 'years'}{' '}
                at the company · Self-reported
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={1.25}>
          {contact.email ? (
            <ContactRow
              copyLabel="Email"
              icon={<EmailOutlinedIcon fontSize="small" />}
              label="Work email"
              value={contact.email}
            />
          ) : null}

          {contact.linkedInUrl ? (
            <ContactRow
              copyLabel="LinkedIn"
              href={contact.linkedInUrl}
              icon={<LinkedInIcon fontSize="small" />}
              label="LinkedIn"
              value={contact.linkedInUrl}
            />
          ) : null}

          {contact.phoneNumber ? (
            <ContactRow
              copyLabel="Phone number"
              href={`tel:${contact.phoneNumber}`}
              icon={<PhoneIphoneOutlinedIcon fontSize="small" />}
              label="Phone"
              value={contact.phoneNumber}
            />
          ) : null}

          {!contact.email &&
          !contact.linkedInUrl &&
          !contact.phoneNumber ? (
            <Alert severity="info">
              This referrer has not shared any contact methods.
            </Alert>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

export const ReferralContactDetailsPage = () => {
  useDocumentMetadata(
    'Referral contact details | Career Harbor',
    'View contact details shared by an employee referrer.',
  );

  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  const jobsQuery = useGetPublicReferralJobsQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const [unlockContact, unlockState] =
    useLazyUnlockReferralContactQuery();

  const job = useMemo(
    () =>
      jobsQuery.data?.items.find(
        (item) => item.jobId === jobId,
      ) ?? null,
    [jobId, jobsQuery.data],
  );

  const result = unlockState.data;
  const contact =
    result?.status === 'Granted' ? result.contact : null;

  useEffect(() => {
    if (!jobId) return;

    void unlockContact(jobId, false);
  }, [jobId, unlockContact]);

  useEffect(() => {
    if (!result || !jobId) return;

    const currentPath = `/dashboard/jobs/referral/${encodeURIComponent(
      jobId,
    )}/contact`;

    if (result.status === 'LoginRequired') {
      void navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: currentPath },
      });

      return;
    }

    if (result.status === 'MembershipRequired') {
      void navigate(
        `${ROUTES.MEMBERSHIP}?plan=ReferralContactAccess&returnTo=${encodeURIComponent(
          currentPath,
        )}`,
        { replace: true },
      );
    }
  }, [jobId, navigate, result]);

  if (!jobId) {
    return (
      <Alert severity="error">
        The referral job could not be identified.
      </Alert>
    );
  }

  if (unlockState.isFetching && !result) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ minHeight: 420 }}
      >
        <CircularProgress size={32} />
        <Typography color="text.secondary">
          Checking referral access…
        </Typography>
      </Stack>
    );
  }

  if (unlockState.isError) {
    return (
      <Stack spacing={2.5}>
        <Button
          onClick={() => void navigate(ROUTES.DASHBOARD_JOBS)}
          startIcon={<ArrowBackIcon />}
          sx={{
            alignSelf: 'flex-start',
            textTransform: 'none',
          }}
        >
          Back to referral jobs
        </Button>

        <Alert
          action={
            <Button
              color="inherit"
              onClick={() => void unlockContact(jobId, false)}
            >
              Retry
            </Button>
          }
          severity="error"
        >
          Unable to load referrer contact details. Please try again.
        </Alert>
      </Stack>
    );
  }

  if (!contact) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: 320 }}
      >
        <CircularProgress size={28} />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={2.5}
      sx={{
        maxWidth: 1180,
        mx: 'auto',
        width: '100%',
      }}
    >
      <Button
        onClick={() => void navigate(ROUTES.DASHBOARD_JOBS)}
        startIcon={<ArrowBackIcon />}
        sx={{
          alignSelf: 'flex-start',
          color: '#475467',
          px: 0,
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'transparent',
            color: 'primary.main',
          },
        }}
      >
        Back to referral jobs
      </Button>

      <Box>
        <Typography
          component="h1"
          sx={{
            color: '#101828',
            fontSize: { xs: 25, md: 30 },
            fontWeight: 850,
            letterSpacing: '-0.5px',
          }}
        >
          Referral contact details
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            fontSize: 14,
            mt: 0.5,
          }}
        >
          Connect with the employee who shared this referral opportunity.
        </Typography>
      </Box>

      {job ? <JobSummary job={job} /> : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.6fr) minmax(300px, 0.8fr)',
          },
        }}
      >
        <ReferrerCard contact={contact} job={job} />

        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#F8FBFF',
              border: '1px solid #D8E7FB',
              borderRadius: 2.5,
              p: 2.5,
            }}
          >
            <Typography fontSize={15} fontWeight={800}>
              Before you reach out
            </Typography>

            <Stack spacing={1.4} sx={{ mt: 1.75 }}>
              {[
                'Introduce yourself briefly and mention the role.',
                'Keep your first message concise and professional.',
                'Ask politely whether they are comfortable referring you.',
                'Avoid repeated messages if you do not receive a response.',
              ].map((tip) => (
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  key={tip}
                  spacing={1}
                >
                  <CheckCircleOutlineIcon
                    sx={{
                      color: '#2563EB',
                      flex: '0 0 auto',
                      fontSize: 18,
                      mt: 0.05,
                    }}
                  />

                  <Typography
                    color="text.secondary"
                    fontSize={12.5}
                  >
                    {tip}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              bgcolor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 2.5,
              p: 2.25,
            }}
          >
            <Stack alignItems="flex-start" direction="row" spacing={1}>
              <InfoOutlinedIcon
                sx={{
                  color: '#D97706',
                  flex: '0 0 auto',
                  fontSize: 20,
                  mt: 0.1,
                }}
              />

              <Box>
                <Typography
                  color="#92400E"
                  fontSize={13}
                  fontWeight={800}
                >
                  Please use contact details responsibly
                </Typography>

                <Typography
                  color="#92400E"
                  fontSize={11.5}
                  sx={{ mt: 0.5 }}
                >
                  These details were shared for professional referral
                  communication. A referral does not guarantee a response,
                  interview, or job offer.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
};