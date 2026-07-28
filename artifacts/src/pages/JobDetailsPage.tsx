import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import {
  isJobsApiError,
  useApplyToJobMutation,
  useGetJobDetailsQuery,
} from '@/features/jobs/api/jobsApi';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { ShareButton } from '@/features/jobs/components/ShareButton';
import {
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import { ApplicationAccessStatus } from '@/features/jobs/types/jobModels';
import { formatJobDate, formatSalary, isJobExpired } from '@/features/jobs/utils/jobFormatting';
import { buildPaymentPath } from '@/features/payments/utils/paymentReturnUrl';
import { selectAuthStatus, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

interface DetailsLocationState {
  jobsSearch?: string;
}

const getSafeExternalUrl = (value: string | null): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const DetailSection = ({ content, title }: { content: string | null; title: string }) =>
  content ? (
    <Box component="section">
      <Typography component="h2" sx={{ mb: 1.5 }} variant="h3">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
        {content}
      </Typography>
    </Box>
  ) : null;

export const JobDetailsPage = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const authStatus = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [applicationUrl, setApplicationUrl] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const {
    data: job,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetJobDetailsQuery(slug, {
    skip: !slug,
  });
  const [applyToJob, { isLoading: isApplying }] = useApplyToJobMutation();
  const locationState = location.state as DetailsLocationState | null;
  const jobsSearch = locationState?.jobsSearch
    ? new URLSearchParams(locationState.jobsSearch).toString()
    : '';
  const backPath = jobsSearch ? `${ROUTES.JOBS}?${jobsSearch}` : ROUTES.JOBS;
  const expired = job ? isJobExpired(job) : false;

  useDocumentMetadata(
    job ? `${job.title} at ${job.companyName} | Career Portal` : 'Job details | Career Portal',
    job
      ? `View ${job.title} at ${job.companyName}${job.location ? ` in ${job.location}` : ''}.`
      : 'View job details on Career Portal.',
    {
      canonicalPath: job ? buildJobDetailsPath(job.slug) : isError ? null : undefined,
      noIndex: isError ? true : undefined,
    },
  );

  const handleApply = async () => {
    if (!job || expired) return;
    setApplyError(null);

    if (!isAuthenticated) {
      await navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }

    try {
      const access = await applyToJob(job.slug).unwrap();
      if (access.status === ApplicationAccessStatus.LoginRequired) {
        await navigate(ROUTES.LOGIN, { state: { from: location } });
        return;
      }
      if (access.status === ApplicationAccessStatus.PaymentRequired) {
        await navigate(buildPaymentPath(job.id, job.slug));
        return;
      }

      const safeApplicationUrl = getSafeExternalUrl(access.applicationUrl);
      if (safeApplicationUrl) {
        setApplicationUrl(safeApplicationUrl);
      } else {
        setApplyError(
          'Application access was granted, but no valid application link was provided.',
        );
      }
    } catch {
      setApplyError('We could not check application access. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Stack aria-label="Loading job details" role="status" spacing={3}>
        <Skeleton height={40} width={180} />
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={2}>
            <Skeleton height={64} width="75%" />
            <Skeleton width="45%" />
            <Skeleton height={160} variant="rounded" />
          </Stack>
        </Paper>
      </Stack>
    );
  }

  if (isError && isJobsApiError(error) && error.status === 404) {
    return (
      <EmptyState
        actionLabel="Browse available jobs"
        description="This job may have expired, been closed, or the link may be incorrect."
        onAction={() => void navigate(ROUTES.JOBS)}
        title="Job not found"
      />
    );
  }

  if (isError || !job) {
    return <ErrorState headingLevel="h1" onRetry={() => void refetch()} />;
  }

  const publishedDate = formatJobDate(job.publishedAtUtc);
  const expiryDate = formatJobDate(job.expiresAtUtc);
  const companyWebsite = getSafeExternalUrl(job.companyWebsiteUrl);

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        to={backPath}
      >
        Back to jobs
      </Button>

      {isFetching ? <Typography aria-live="polite">Updating job details…</Typography> : null}

      <Paper component="article" sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={4}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <CompanyLogoFallback
              companyName={job.companyName}
              logoUrl={job.companyLogoUrl}
              size={68}
            />
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                {job.isFeatured ? <Chip color="primary" label="Featured" size="small" /> : null}
                <Chip label={job.categoryName} size="small" />
              </Stack>
              <Typography component="h1" sx={{ overflowWrap: 'anywhere' }} variant="h1">
                {job.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="h3">
                {job.companyName}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            {job.location ? (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <LocationOnOutlinedIcon color="primary" />
                  <Typography>{job.location}</Typography>
                </Stack>
              </Grid>
            ) : null}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <WorkOutlineIcon color="primary" />
                <Typography>
                  {getEmploymentTypeLabel(job.employmentType)} ·{' '}
                  {getWorkplaceTypeLabel(job.workplaceType)}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <BusinessOutlinedIcon color="primary" />
                <Typography>{getExperienceLevelLabel(job.experienceLevel)}</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <PaymentsOutlinedIcon color="primary" />
                <Typography>
                  {formatSalary(job.minimumSalary, job.maximumSalary, job.currencyCode)}
                </Typography>
              </Stack>
            </Grid>
            {publishedDate ? (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <CalendarMonthOutlinedIcon color="primary" />
                  <Typography>Posted {publishedDate}</Typography>
                </Stack>
              </Grid>
            ) : null}
            {expiryDate ? (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <CalendarMonthOutlinedIcon color="primary" />
                  <Typography>Closes {expiryDate}</Typography>
                </Stack>
              </Grid>
            ) : null}
          </Grid>

          {expired ? (
            <Alert severity="warning">
              This job has expired and is no longer accepting applications.
            </Alert>
          ) : null}
          {applyError ? (
            <Alert aria-live="assertive" severity="error">
              {applyError}
            </Alert>
          ) : null}
          {applicationUrl ? (
            <Alert severity="success">
              Application access granted.{' '}
              <MuiLink href={applicationUrl} rel="noopener noreferrer" target="_blank">
                Continue to the employer’s application site
              </MuiLink>
              .
            </Alert>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              disabled={expired || isApplying || authStatus === 'initializing'}
              onClick={() => void handleApply()}
              size="large"
              variant="contained"
            >
              {expired ? 'Applications closed' : isApplying ? 'Checking access…' : 'Apply now'}
            </Button>
            <ShareButton
              text={`View ${job.title} at ${job.companyName}`}
              title={job.title}
              url={window.location.href}
            />
            <SaveJobButton jobId={job.id} jobTitle={job.title} />
          </Stack>

          <Divider />
          <DetailSection content={job.description} title="About the role" />
          <DetailSection content={job.responsibilities} title="Responsibilities" />
          <DetailSection content={job.requirements} title="Requirements" />
          <DetailSection content={job.benefits} title="Benefits" />

          {job.companyDescription || companyWebsite ? (
            <Box component="section">
              <Typography component="h2" sx={{ mb: 1.5 }} variant="h3">
                About {job.companyName}
              </Typography>
              {job.companyDescription ? (
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {job.companyDescription}
                </Typography>
              ) : null}
              {companyWebsite ? (
                <MuiLink
                  display="inline-block"
                  href={companyWebsite}
                  rel="noopener noreferrer"
                  sx={{ mt: 1.5 }}
                  target="_blank"
                >
                  Visit company website
                </MuiLink>
              ) : null}
            </Box>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
};
