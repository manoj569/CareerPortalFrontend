import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
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
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ResumeMatchPanel } from '@/features/jobs/components/ResumeMatchPanel';
import { readResumeMatch } from '@/features/jobs/utils/resumeMatch';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildInterviewInsightsPath, buildJobDetailsPath, ROUTES } from '@/constants/routes';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { ApplicationQuotaIndicator } from '@/features/dashboard/components/ApplicationQuotaIndicator';
import { ApplyToJobButton } from '@/features/dashboard/components/ApplyToJobButton';
import { AIApplyToJobButton } from '@/features/aiApply/components/AIApplyToJobButton';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import { useGetCompanyInterviewInsightSummaryQuery } from '@/features/interviewInsights/api/interviewInsightsApi';
import {
  isJobsApiError,
  useGetJobDetailsQuery,
  useGetRelatedJobsQuery,
} from '@/features/jobs/api/jobsApi';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { RecruiterContactCard } from '@/features/jobs/components/RecruiterContactCard';
import { ShareButton } from '@/features/jobs/components/ShareButton';
import {
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import { EmploymentType, type PublicJobSummary } from '@/features/jobs/types/jobModels';
import { formatJobDate, isJobExpired } from '@/features/jobs/utils/jobFormatting';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { UserRole } from '@/types';
import { getSafeExternalUrl } from '@/utils/safeExternalUrl';

interface DetailSectionProps {
  content: string | null | undefined;
  title: string;
}

interface SummaryItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

interface JobHighlight {
  label: string;
  value: string;
}

interface RelatedJobCardProps {
  job: PublicJobSummary;
  returnPath: string;
}

const getOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const formatSalaryRange = (
  minimumSalary: number | null | undefined,
  maximumSalary: number | null | undefined,
  currencyCode: string | null | undefined,
): string => {
  const currency = getOptionalText(currencyCode) ?? 'INR';
  const formatter = new Intl.NumberFormat('en-IN', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  });

  if (typeof minimumSalary === 'number' && typeof maximumSalary === 'number') {
    return `${formatter.format(minimumSalary)} – ${formatter.format(maximumSalary)}`;
  }

  if (typeof minimumSalary === 'number') {
    return `From ${formatter.format(minimumSalary)}`;
  }

  if (typeof maximumSalary === 'number') {
    return `Up to ${formatter.format(maximumSalary)}`;
  }

  return 'Not disclosed';
};
const DetailSection = ({ content, title }: DetailSectionProps) => {
  const text = getOptionalText(content);

  if (!text) {
    return null;
  }

  return (
    <Box component="section">
      <Typography component="h2" sx={{ mb: 1.5 }} variant="h3">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
        {text}
      </Typography>
    </Box>
  );
};

const SummaryItem = ({ icon, label, value }: SummaryItemProps) => (
  <Stack alignItems="flex-start" direction="row" spacing={1.25}>
    <Box aria-hidden="true" color="primary.main" sx={{ display: 'flex', mt: 0.25 }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" component="p" variant="caption">
        {label}
      </Typography>
      <Typography component="p" fontWeight={600} sx={{ overflowWrap: 'anywhere' }} variant="body2">
        {value}
      </Typography>
    </Box>
  </Stack>
);

const RelatedJobCard = ({ job, returnPath }: RelatedJobCardProps) => {
  const publishedDate = formatJobDate(job.publishedAtUtc);

  return (
    <Paper component="article" sx={{ p: 2.25 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack alignItems="flex-start" direction="row" spacing={1.5}>
          <CompanyLogoFallback
            companyName={job.companyName}
            logoUrl={job.companyLogoUrl}
            size={42}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h3" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
              {job.title}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {job.companyName}
            </Typography>
          </Box>
        </Stack>

        <Stack color="text.secondary" spacing={0.75}>
          <Typography variant="body2">
            {job.location
              ? `${job.location} · ${getWorkplaceTypeLabel(job.workplaceType)}`
              : getWorkplaceTypeLabel(job.workplaceType)}
          </Typography>
          {publishedDate ? <Typography variant="caption">Posted {publishedDate}</Typography> : null}
        </Stack>

        <Stack alignItems="center" direction="row" flexWrap="wrap" gap={0.5}>
          <Button
            aria-label={`View ${job.title} at ${job.companyName}`}
            component={Link}
            size="small"
            state={{ jobsPath: returnPath }}
            to={buildJobDetailsPath(job.slug)}
          >
            View job
          </Button>
          <SaveJobButton jobId={job.id} jobTitle={job.title} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export const JobDetailsPage = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const routeLocation = useLocation();

  // ✅ FIXED: Strict typing to avoid "Unsafe assignment" ESLint error
  const [showRecruiterDialog, setShowRecruiterDialog] = useState<boolean>(false);

  const {
    data: job,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetJobDetailsQuery(slug, { skip: !slug });

  const companyInsightSummary = useGetCompanyInterviewInsightSummaryQuery(job?.companyId ?? '', {
    skip: currentUser?.role !== UserRole.Candidate || !job?.companyId,
  });

  const {
    data: relatedJobs,
    isError: isRelatedJobsError,
    isLoading: isRelatedJobsLoading,
    refetch: refetchRelatedJobs,
  } = useGetRelatedJobsQuery({ limit: 3, slug }, { skip: !slug || !job });

  const backPath: string = isAuthenticated ? '/dashboard/jobs' : '/jobs';
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

  // ✅ FIXED: Used "void" to explicitly suppress the floating Promise ESLint error
  const handleGoToMembership = () => {
    setShowRecruiterDialog(false);
    void navigate(ROUTES.MEMBERSHIP);
  };

  if (isLoading) {
    return (
      <Stack aria-busy="true" aria-label="Loading job details" role="status" spacing={3}>
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

  if (isJobExpired(job)) {
    return (
      <EmptyState
        actionLabel="Browse available jobs"
        description="This opportunity has closed and is no longer publicly available."
        onAction={() => void navigate(ROUTES.JOBS)}
        title="Job no longer available"
      />
    );
  }

  const publishedDate = formatJobDate(job.publishedAtUtc);
  const expiryDate = formatJobDate(job.expiresAtUtc);
  const experience = getExperienceLevelLabel(job.experienceLevel);
  const salary = formatSalaryRange(job.minimumSalary, job.maximumSalary, job.currencyCode);
  const applicationUrl = getSafeExternalUrl(job.applicationUrl);
  const companyWebsite = getSafeExternalUrl(job.companyWebsiteUrl);

  const internshipDuration =
    typeof job.internshipDurationMonths === 'number' && job.internshipDurationMonths > 0
      ? `${job.internshipDurationMonths} month${job.internshipDurationMonths === 1 ? '' : 's'}`
      : job.isFlexibleDuration
        ? 'Flexible duration'
        : null;

  const highlights: JobHighlight[] = [
    { label: 'Work mode', value: getWorkplaceTypeLabel(job.workplaceType) },
    { label: 'Employment type', value: getEmploymentTypeLabel(job.employmentType) },
    { label: 'Category', value: job.categoryName },
    { label: 'Experience', value: experience },
    {
      label: job.employmentType === EmploymentType.Internship ? 'Stipend' : 'Salary',
      value: salary,
    },
  ];

  const location = getOptionalText(job.location);
  const department = getOptionalText(job.department);
  const roleCategory = getOptionalText(job.roleCategory);
  const educationRequirement = getOptionalText(job.educationRequirement);

  if (location) highlights.push({ label: 'Location', value: location });
  if (expiryDate) highlights.push({ label: 'Closing date', value: expiryDate });
  if (department) highlights.push({ label: 'Department', value: department });
  if (roleCategory) highlights.push({ label: 'Role category', value: roleCategory });
  if (educationRequirement) highlights.push({ label: 'Education', value: educationRequirement });
  if (internshipDuration)
    highlights.push({ label: 'Internship duration', value: internshipDuration });

  return (
    <Stack spacing={3} sx={{ pb: { xs: 10, sm: 0 } }}>
      <Button
        component={Link}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        to={backPath}
      >
        Back to jobs
      </Button>

      {isFetching ? (
        <Typography aria-live="polite" color="text.secondary">
          Updating job details…
        </Typography>
      ) : null}

      <Paper component="section" sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
        <Stack spacing={3}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
          >
            <CompanyLogoFallback
              companyName={job.companyName}
              logoUrl={job.companyLogoUrl}
              size={76}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                <Chip label={job.categoryName} size="small" />
                {job.isFeatured ? <Chip color="primary" label="Featured" size="small" /> : null}
              </Stack>

              <Typography
                component="h1"
                id="job-title"
                sx={{ overflowWrap: 'anywhere' }}
                variant="h1"
              >
                {job.title}
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="h3">
                {job.companyName}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryItem
                icon={<WorkOutlineIcon fontSize="small" />}
                label="Experience"
                value={experience}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryItem
                icon={<PaymentsOutlinedIcon fontSize="small" />}
                label={job.employmentType === EmploymentType.Internship ? 'Stipend' : 'Salary'}
                value={salary}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryItem
                icon={<BusinessOutlinedIcon fontSize="small" />}
                label="Work mode"
                value={getWorkplaceTypeLabel(job.workplaceType)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryItem
                icon={<LocationOnOutlinedIcon fontSize="small" />}
                label="Location"
                value={location ?? 'Not specified'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryItem
                icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                label="Posted"
                value={publishedDate ?? 'Date unavailable'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryItem
                icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                label="Closing date"
                value={expiryDate ?? 'Not specified'}
              />
            </Grid>
          </Grid>

          <Divider />

          <Stack alignItems={{ xs: 'stretch', sm: 'flex-start' }} spacing={1.25}>
            {currentUser?.role === UserRole.Candidate && readResumeMatch(routeLocation.state, job.id) ? <ResumeMatchPanel match={readResumeMatch(routeLocation.state, job.id)!} /> : null}
            <ApplicationQuotaIndicator />
            <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1.25}>
              <ApplyToJobButton
                applicationUrl={job.applicationUrl}
                ariaDescribedBy="application-action-help"
                companyName={job.companyName}
                jobId={job.id}
                jobSlug={job.slug}
                jobTitle={job.title}
                label="Apply manually"
              />

              <AIApplyToJobButton
                jobSlug={job.slug}
                companyName={job.companyName}
                jobId={job.id}
                jobTitle={job.title}
                size="large"
              />

              <SaveJobButton jobId={job.id} jobTitle={job.title} />

              <ShareButton
                text={`View ${job.title} at ${job.companyName}`}
                title={job.title}
                url={window.location.href}
              />
            </Stack>

            {currentUser?.role === UserRole.Administrator ? (
              <Alert id="application-action-help" severity="info">
                Administrator accounts cannot apply for jobs.
              </Alert>
            ) : applicationUrl ? (
              <Typography color="text.secondary" id="application-action-help" variant="body2">
                You will be redirected to the employer’s application page.
              </Typography>
            ) : (
              <Typography color="text.secondary" id="application-action-help" variant="body2">
                Your application will be submitted through Career Harbor.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
        }}
      >
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Paper component="article" sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
            <Stack divider={<Divider flexItem />} spacing={4}>
              <DetailSection content={job.description} title="About the role" />
              <DetailSection content={job.responsibilities} title="Responsibilities" />
              <DetailSection content={job.requirements} title="Requirements" />
              <DetailSection content={job.benefits} title="Benefits" />

              <Box component="section">
                <Typography component="h2" sx={{ mb: 2 }} variant="h3">
                  Job highlights
                </Typography>

                <Grid container spacing={2}>
                  {highlights.map((highlight) => (
                    <Grid key={highlight.label} size={{ xs: 12, sm: 6 }}>
                      <Typography color="text.secondary" component="p" variant="caption">
                        {highlight.label}
                      </Typography>
                      <Typography component="p" fontWeight={600}>
                        {highlight.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box component="section">
                <Typography component="h2" sx={{ mb: 2 }} variant="h3">
                  About the company
                </Typography>

                <Stack alignItems="flex-start" direction="row" spacing={2}>
                  <CompanyLogoFallback
                    companyName={job.companyName}
                    logoUrl={job.companyLogoUrl}
                    size={52}
                  />
                  <Box>
                    <Typography component="h3" fontWeight={700} variant="h6">
                      {job.companyName}
                    </Typography>
                    {getOptionalText(job.companyType) ? (
                      <Typography color="text.secondary" variant="body2">
                        {getOptionalText(job.companyType)}
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>

                {getOptionalText(job.companyDescription) ? (
                  <Typography color="text.secondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                    {getOptionalText(job.companyDescription)}
                  </Typography>
                ) : null}

                {companyWebsite ? (
                  <MuiLink
                    display="inline-flex"
                    href={companyWebsite}
                    rel="noopener noreferrer"
                    sx={{ alignItems: 'center', gap: 0.5, mt: 2 }}
                    target="_blank"
                  >
                    <LanguageOutlinedIcon fontSize="small" />
                    Visit company website
                    <OpenInNewOutlinedIcon fontSize="small" />
                  </MuiLink>
                ) : null}
              </Box>
            </Stack>
          </Paper>

          <RecruiterContactCard
            jobId={job.id}
            onUnlockRequired={() => setShowRecruiterDialog(true)}
          />

          {currentUser?.role === UserRole.Candidate ? (
            <Paper component="section" sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <QuestionAnswerOutlinedIcon color="primary" />
                  <Typography component="h2" variant="h3">
                    Interview insights
                  </Typography>
                </Stack>
                {companyInsightSummary.isLoading ? (
                  <Skeleton height={60} variant="rounded" />
                ) : null}
                {companyInsightSummary.isError ? (
                  <Typography color="text.secondary" variant="body2">
                    Interview insight summary is temporarily unavailable.
                  </Typography>
                ) : null}
                {companyInsightSummary.data ? (
                  <Typography color="text.secondary">
                    {companyInsightSummary.data.publishedCount} reviewed insight
                    {companyInsightSummary.data.publishedCount === 1 ? '' : 's'} ·{' '}
                    {companyInsightSummary.data.helpfulConfirmedCount} helpful confirmation
                    {companyInsightSummary.data.helpfulConfirmedCount === 1 ? '' : 's'}
                  </Typography>
                ) : null}
                <Typography color="text.secondary" variant="body2">
                  Explore safe company-level summaries here. Round details and questions are shown
                  only on the protected Interview Insights page when you are eligible.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <Button
                    component={Link}
                    to={buildInterviewInsightsPath({ companyId: job.companyId })}
                    variant="outlined"
                  >
                    Explore insights
                  </Button>
                  <Button
                    component={Link}
                    to={buildInterviewInsightsPath({
                      action: 'schedule',
                      companyId: job.companyId,
                      companyName: job.companyName,
                      jobId: job.id,
                      roleTitle: job.title,
                    })}
                    variant="contained"
                  >
                    Add interview schedule
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Stack>

        <Box component="aside" sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: 96 } }}>
          <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography component="h2" variant="h3">
              Related jobs
            </Typography>

            {isRelatedJobsLoading ? (
              <Stack spacing={2} sx={{ mt: 2.5 }}>
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton height={150} key={index} variant="rounded" />
                ))}
              </Stack>
            ) : null}

            {isRelatedJobsError ? (
              <Stack alignItems="flex-start" spacing={1.5} sx={{ mt: 2.5 }}>
                <Typography color="text.secondary" variant="body2">
                  Related jobs are temporarily unavailable.
                </Typography>
                <Button onClick={() => void refetchRelatedJobs()} variant="outlined">
                  Retry related jobs
                </Button>
              </Stack>
            ) : null}

            {!isRelatedJobsLoading && !isRelatedJobsError && relatedJobs?.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2.5 }} variant="body2">
                No related active jobs are available right now.
              </Typography>
            ) : null}

            {relatedJobs && relatedJobs.length > 0 ? (
              <Stack spacing={2} sx={{ mt: 2.5 }}>
                {relatedJobs.map((relatedJob) => (
                  <RelatedJobCard job={relatedJob} key={relatedJob.id} returnPath={backPath} />
                ))}
              </Stack>
            ) : null}
          </Paper>
        </Box>
      </Box>

      {showRecruiterDialog && (
        <Dialog
          open={showRecruiterDialog}
          onClose={() => setShowRecruiterDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Unlock Recruiter Contact</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body1">
                You need an active Premium membership to view direct recruiter contact details.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Upgrade to Premium for:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>Direct recruiter contact details (Email & Phone)</li>
                  <li>Get your application prioritized</li>
                </ul>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRecruiterDialog(false)}>Continue Browsing</Button>
            <Button onClick={handleGoToMembership} variant="contained" color="primary">
              View Premium Plans
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {currentUser?.role === UserRole.Candidate ? (
        <Paper
          aria-label="Job application actions"
          elevation={8}
          sx={{
            bottom: 0,
            display: { xs: 'block', sm: 'none' },
            left: 0,
            p: 1.5,
            position: 'fixed',
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Stack direction="row" spacing={1}>
            <ApplyToJobButton
              applicationUrl={job.applicationUrl}
              companyName={job.companyName}
              jobId={job.id}
              jobSlug={job.slug}
              jobTitle={job.title}
              label="Apply manually"
              size="medium"
            />
            <AIApplyToJobButton
              jobSlug={job.slug}
              companyName={job.companyName}
              jobId={job.id}
              jobTitle={job.title}
            />
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
};
