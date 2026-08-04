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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
// We don't use isDashboardApiError here anymore, so we remove it from the import
import { useSubmitApplicationMutation } from '@/features/dashboard/api/dashboardApi';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import { isJobsApiError, useGetJobDetailsQuery } from '@/features/jobs/api/jobsApi';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { ShareButton } from '@/features/jobs/components/ShareButton';
import {
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import { formatJobDate, formatSalary, isJobExpired } from '@/features/jobs/utils/jobFormatting';
import {
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { UserRole } from '@/types';

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
  const user = useAppSelector(selectCurrentUser);

  const [confirmApplication, setConfirmApplication] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [showQuotaExceededDialog, setShowQuotaExceededDialog] = useState(false);
  const [quotaExceededMessage, setQuotaExceededMessage] = useState('');

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

  const [submitApplication, submitState] = useSubmitApplicationMutation();

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

    if (user?.role !== UserRole.Candidate) {
      await navigate(ROUTES.UNAUTHORIZED);
      return;
    }

    setConfirmApplication(true);
  };

  const handleSubmitApplication = async () => {
    if (!job || submitState.isLoading) return;

    setApplyError(null);

    try {
      await submitApplication({
        coverLetter: coverLetter.trim() || null,
        jobId: job.id,
      }).unwrap();

      setConfirmApplication(false);
      setCoverLetter('');

      await navigate(ROUTES.APPLICATIONS);
    } catch (error: unknown) {
      console.log('Application error:', error);
      
      // SAFE TYPE CHECK WITHOUT 'any'
      if (error && typeof error === 'object') {
        const errorRecord = error as Record<string, unknown>;
        
        // Check for redirectToMembership safely
        if (errorRecord.redirectToMembership === true) {
          setConfirmApplication(false);
          setQuotaExceededMessage(
            typeof errorRecord.message === 'string' 
              ? errorRecord.message 
              : 'Application limit reached.'
          );
          setShowQuotaExceededDialog(true);
          return;
        }

        // Handle other errors safely
        setApplyError(
          typeof errorRecord.message === 'string'
            ? errorRecord.message
            : 'We could not submit your application. Please try again.'
        );
      } else {
        // Handle unexpected errors
        setApplyError(
          'We could not submit your application. Please try again.',
        );
      }
    }
  };

    const handleGoToMembership = () => {
    setShowQuotaExceededDialog(false);

    // Void operator instantly tells the linter "I am ignoring this returned value".
    // This permanently satisfies the linting rule, even though navigate is actually synchronous.
    void navigate(ROUTES.MEMBERSHIP, {
      state: {
        from: location.pathname,
        reason: 'application_limit_reached',
        jobTitle: job?.title,
        jobId: job?.id,
      },
    });
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              disabled={expired || authStatus === 'initializing'}
              onClick={() => void handleApply()}
              size="large"
              variant="contained"
            >
              {expired ? 'Applications closed' : 'Apply now'}
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

      {/* Application Confirmation Dialog */}
      <Dialog
        aria-describedby="application-confirmation-description"
        aria-labelledby="application-confirmation-title"
        fullWidth
        maxWidth="sm"
        onClose={() => !submitState.isLoading && setConfirmApplication(false)}
        open={confirmApplication}
      >
        <DialogTitle id="application-confirmation-title">Apply for {job.title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography id="application-confirmation-description">
              Confirm your application to {job.companyName}. Your current resume, if uploaded, will
              be attached to this application.
            </Typography>

            {applyError ? (
              <Alert aria-live="assertive" severity="error">
                {applyError}
              </Alert>
            ) : null}

            <TextField
              disabled={submitState.isLoading}
              fullWidth
              helperText={`${coverLetter.length.toLocaleString()} / 5,000 characters · optional`}
              inputProps={{ maxLength: 5000 }}
              label="Cover letter"
              minRows={6}
              multiline
              onChange={(event) => setCoverLetter(event.target.value)}
              value={coverLetter}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button disabled={submitState.isLoading} onClick={() => setConfirmApplication(false)}>
            Cancel
          </Button>

          <Button
            disabled={submitState.isLoading}
            onClick={() => void handleSubmitApplication()}
            variant="contained"
          >
            {submitState.isLoading ? 'Submitting…' : 'Submit application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quota Exceeded Dialog - Rendering guaranteed by conditional */}
      {showQuotaExceededDialog && (
        <Dialog
          open={showQuotaExceededDialog}
          onClose={() => setShowQuotaExceededDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Application Limit Reached</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body1">
                {quotaExceededMessage || 'You have reached your application limit for this period.'}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Upgrade to Premium for:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>35 daily job applications instead of 10 monthly</li>
                  <li>View recruiter contact details</li>
                  <li>Get your application prioritized</li>
                  <li>Exclusive job opportunities</li>
                </ul>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuotaExceededDialog(false)}>
              Continue Browsing
            </Button>
            <Button
              onClick={handleGoToMembership}
              variant="contained"
              color="primary"
            >
              View Premium Plans
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
};