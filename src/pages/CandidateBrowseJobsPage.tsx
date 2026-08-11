import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { ApplicationQuotaIndicator } from '@/features/dashboard/components/ApplicationQuotaIndicator';
import { ApplyToJobButton } from '@/features/dashboard/components/ApplyToJobButton';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import {
  isDashboardApiError,
  useGetProfileQuery,
  useGetRecommendedJobsQuery,
  useGetResumeStatusQuery,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import {
  ResumeExtractionStatus,
  type RecommendedJob,
} from '@/features/dashboard/types/dashboardModels';
import { validateResume } from '@/features/dashboard/utils/resumeValidation';
import {
  fetchJobApplicationUrl,
  useGetJobFilterOptionsQuery,
  useGetSupplementalJobFilterCountsQuery,
  useSearchJobsQuery,
} from '@/features/jobs/api/jobsApi';
import { CandidateJobFilters } from '@/features/jobs/components/CandidateJobFilters';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobCardSkeleton } from '@/features/jobs/components/JobCardSkeleton';
import { candidateJobSortOptions } from '@/features/jobs/constants/jobOptions';
import {
  countCandidateJobFilters,
  emptyCandidateJobSearchState,
  parseCandidateJobSearchParams,
  serializeCandidateJobSearchState,
  toCandidatePublicJobQuery,
  type CandidateJobSearchState,
} from '@/features/jobs/utils/candidateJobSearchParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import type { PublicJobSummary } from '@/features/jobs/types/jobModels';

type BrowseMode = 'all' | 'recommended';

const toJobSummary = (job: RecommendedJob): PublicJobSummary => ({
  ...job,
  companyType: null,
  currencyCode: 'INR',
  department: null,
  educationRequirement: null,
  industry: null,
  internshipDurationMonths: null,
  isFlexibleDuration: false,
  maximumExperienceYears: null,
  maximumSalary: null,
  minimumExperienceYears: null,
  minimumSalary: null,
  postedByType: null,
  roleCategory: null,
});

export const CandidateBrowseJobsPage = () => {
  useDocumentMetadata(
    'Browse jobs | Career Portal',
    'Explore active jobs based on your Candidate career goals.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const mode: BrowseMode = searchParams.get('mode') === 'recommended' ? 'recommended' : 'all';
  const state = useMemo(() => parseCandidateJobSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toCandidatePublicJobQuery(state), [state]);
  const [keywordInput, setKeywordInput] = useState(state.keyword);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const debouncedKeyword = useDebouncedValue(keywordInput, 350);
  const profile = useGetProfileQuery();
  const [pollAttempts, setPollAttempts] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);
  const resumeStatus = useGetResumeStatusQuery(undefined, {
    pollingInterval: pollingActive && pollAttempts < 12 ? 5000 : 0,
    skipPollingIfUnfocused: true,
  });
  const isResumeReady = resumeStatus.data?.extractionStatus === ResumeExtractionStatus.Ready;
  const isRecommended = mode === 'recommended' && isResumeReady;
  const jobs = useSearchJobsQuery(query, { skip: isRecommended });
  const recommended = useGetRecommendedJobsQuery(
    { pageNumber: state.page, pageSize: 20 },
    { skip: !isRecommended },
  );
  const filterOptions = useGetJobFilterOptionsQuery(
    { ...query, pageNumber: 1, pageSize: 1 },
    { skip: isRecommended },
  );
  const supplementalCounts = useGetSupplementalJobFilterCountsQuery(query, {
    skip: isRecommended,
  });
  const [uploadResume, uploadState] = useUploadResumeMutation();
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const appliedCount = countCandidateJobFilters(state);

  const setState = useCallback(
    (nextState: CandidateJobSearchState, replace = false) => {
      const next = serializeCandidateJobSearchState(nextState);
      next.set('mode', mode);
      setSearchParams(next, { replace });
    },
    [mode, setSearchParams],
  );

  const setMode = (nextMode: BrowseMode) => {
    const next = serializeCandidateJobSearchState({ ...state, page: 1 });
    next.set('mode', nextMode);
    setSearchParams(next);
  };

  const handleResume = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const validationError = validateResume(file);
    if (validationError) return setResumeError(validationError);
    setResumeError(null);
    try {
      await uploadResume(file).unwrap();
      setPollAttempts(0);
      setPollingActive(true);
      await resumeStatus.refetch();
    } catch (error: unknown) {
      setResumeError(
        isDashboardApiError(error) ? error.message : 'Unable to upload your resume. Please try again.',
      );
    }
  };

  useEffect(() => {
    if (!resumeStatus.fulfilledTimeStamp) return;
    if (resumeStatus.data?.extractionStatus === ResumeExtractionStatus.Processing) {
      setPollingActive(true);
      setPollAttempts((attempts) => Math.min(12, attempts + 1));
    } else {
      setPollingActive(false);
    }
  }, [resumeStatus.data?.extractionStatus, resumeStatus.fulfilledTimeStamp]);

  const applyChanges = useCallback(
    (changes: Partial<CandidateJobSearchState>, replace = false) => {
      setState({ ...state, ...changes, page: 1 }, replace);
    },
    [setState, state],
  );

  const clearFilters = useCallback(() => {
    const empty = emptyCandidateJobSearchState();
    setState({ ...empty, keyword: state.keyword, sort: state.sort });
  }, [setState, state.keyword, state.sort]);

  useEffect(() => {
    setKeywordInput(state.keyword);
  }, [state.keyword]);

  useEffect(() => {
    if (debouncedKeyword !== keywordInput || debouncedKeyword.trim() === state.keyword) return;
    applyChanges({ keyword: debouncedKeyword.trim().slice(0, 250) }, true);
  }, [applyChanges, debouncedKeyword, keywordInput, state.keyword]);

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false);
    window.setTimeout(() => filterButtonRef.current?.focus(), 0);
  };

  const sourceJobs = isRecommended
    ? recommended.data?.items.map(toJobSummary)
    : jobs.data?.items;
  const displayedJobs = sourceJobs?.filter((job) => !appliedJobIds.has(job.id));
  const removedFromPage = sourceJobs?.filter((job) => appliedJobIds.has(job.id)).length ?? 0;
  const sourceTotal = isRecommended ? recommended.data?.totalCount : jobs.data?.totalCount;
  const displayedTotal = sourceTotal === undefined ? undefined : Math.max(0, sourceTotal - removedFromPage);
  const displayedPages = isRecommended ? recommended.data?.totalPages : jobs.data?.totalPages;
  const resultsLoading = isRecommended ? recommended.isLoading : jobs.isLoading;
  const resultsError = isRecommended ? recommended.isError : jobs.isError;
  const refetchResults = isRecommended ? recommended.refetch : jobs.refetch;

  const filterPanel =
    filterOptions.isLoading || supplementalCounts.isLoading ? (
      <Stack aria-label="Loading job filters" role="status" spacing={2}>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton height={72} key={index} variant="rounded" />
        ))}
      </Stack>
    ) : filterOptions.isError ||
      !filterOptions.data ||
      supplementalCounts.isError ||
      !supplementalCounts.data ? (
      <Stack spacing={2}>
        <Alert severity="error">Job filters are temporarily unavailable.</Alert>
        <Button
          onClick={() => {
            void filterOptions.refetch();
            void supplementalCounts.refetch();
          }}
          variant="outlined"
        >
          Retry filters
        </Button>
      </Stack>
    ) : (
      <CandidateJobFilters
        appliedCount={appliedCount}
        onChange={applyChanges}
        onClear={clearFilters}
        options={filterOptions.data}
        state={state}
        supplementalCounts={supplementalCounts.data}
      />
    );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h1">
          Find your next opportunity
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Explore active jobs based on your career goals.
        </Typography>
      </Box>

      <Paper component="section" sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box minWidth={0}>
            <Typography component="h2" variant="h3">Your resume</Typography>
            {!resumeStatus.data?.hasResume ? (
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>Upload your resume to receive personalized job recommendations</Typography>
            ) : (
              <>
                <Typography noWrap sx={{ mt: 0.75 }}>{profile.data?.resume?.fileName ?? 'Resume uploaded'}</Typography>
                <Typography color={resumeStatus.data.extractionStatus === ResumeExtractionStatus.Failed ? 'error' : 'text.secondary'} variant="body2">
                  {resumeStatus.data.extractionStatus === ResumeExtractionStatus.Processing ? 'Processing' : resumeStatus.data.extractionStatus === ResumeExtractionStatus.Ready ? 'Ready' : resumeStatus.data.extractionStatus === ResumeExtractionStatus.Failed ? 'Failed — your resume is stored, but recommendations could not be prepared.' : 'Preparing recommendations'}
                </Typography>
              </>
            )}
            {resumeError ? <Alert severity="error" sx={{ mt: 1 }}>{resumeError}</Alert> : null}
            {resumeStatus.data?.extractionStatus === ResumeExtractionStatus.Ready ? (
              <Alert severity="success" sx={{ mt: 1 }}>Your resume is ready for personalized recommendations.</Alert>
            ) : null}
          </Box>
          <Button disabled={uploadState.isLoading} onClick={() => fileInput.current?.click()} startIcon={<CloudUploadOutlinedIcon />} variant="outlined">
            {uploadState.isLoading ? 'Uploading…' : resumeStatus.data?.hasResume ? 'Replace resume' : 'Upload resume'}
          </Button>
          <input accept=".pdf,.doc,.docx" aria-label="Choose resume" hidden onChange={(event) => void handleResume(event)} ref={fileInput} type="file" />
        </Stack>
        {isResumeReady ? (
          <Tabs aria-label="Browse jobs mode" onChange={(_, value: BrowseMode) => setMode(value)} sx={{ mt: 2 }} value={mode} variant="scrollable">
            <Tab label="All jobs" value="all" />
            <Tab label="Recommended for you" value="recommended" />
          </Tabs>
        ) : null}
      </Paper>

      {!isRecommended ? <Paper component="section" sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Grid alignItems="stretch" container spacing={1.5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              label="Search jobs"
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Title, company, category, or skill"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              value={keywordInput}
            />
          </Grid>
          <Grid size={{ xs: 7, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="candidate-jobs-sort-label">Sort jobs</InputLabel>
              <Select
                label="Sort jobs"
                labelId="candidate-jobs-sort-label"
                onChange={(event) => applyChanges({ sort: event.target.value })}
                value={state.sort}
              >
                {candidateJobSortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 5, md: 2 }}>
            <Button
              aria-controls="candidate-mobile-job-filters"
              aria-expanded={isMobileFiltersOpen}
              fullWidth
              onClick={() => setIsMobileFiltersOpen(true)}
              ref={filterButtonRef}
              startIcon={<FilterListIcon />}
              sx={{ display: { lg: 'none' }, height: '100%' }}
              variant="outlined"
            >
              Filters{appliedCount ? ` (${appliedCount})` : ''}
            </Button>
          </Grid>
        </Grid>
      </Paper> : <Alert severity="info">Search and filters apply to All jobs. Recommended jobs are ranked from your resume.</Alert>}

      <ApplicationQuotaIndicator />

      {!isRecommended && (state.companyName || state.categoryName) ? (
        <Stack aria-label="Active filters" direction="row" flexWrap="wrap" gap={1}>
          {state.companyName ? (
            <Chip
              label={`Company: ${state.companyName}`}
              onDelete={() => applyChanges({ companyName: '' })}
            />
          ) : null}
          {state.categoryName ? (
            <Chip
              label={`Category: ${state.categoryName}`}
              onDelete={() => applyChanges({ categoryName: '' })}
            />
          ) : null}
        </Stack>
      ) : null}

      {(isRecommended ? recommended.isFetching && !recommended.isLoading : jobs.isFetching && !jobs.isLoading) ? (
        <LinearProgress aria-label="Updating job results" />
      ) : null}

      <Stack alignItems="flex-start" direction="row" spacing={2.5}>
        {!isRecommended && isDesktopFiltersOpen ? (
          <Paper
            component="aside"
            sx={{
              alignSelf: 'flex-start',
              display: { xs: 'none', lg: 'block' },
              maxHeight: 'calc(100vh - 96px)',
              overflowY: 'auto',
              p: 2.5,
              position: 'sticky',
              top: 88,
              width: 300,
            }}
          >
            <Stack alignItems="center" direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <IconButton
                aria-label="Collapse job filters"
                onClick={() => setIsDesktopFiltersOpen(false)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            {filterPanel}
          </Paper>
        ) : !isRecommended ? (
          <Paper
            component="aside"
            sx={{ display: { xs: 'none', lg: 'block' }, p: 1, position: 'sticky', top: 88 }}
          >
            <IconButton
              aria-label="Expand job filters"
              onClick={() => setIsDesktopFiltersOpen(true)}
            >
              <TuneOutlinedIcon />
            </IconButton>
          </Paper>
        ) : null}

        <Box component="section" minWidth={0} sx={{ flex: 1 }}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography component="h2" variant="h3">
              {displayedTotal !== undefined
                ? `${displayedTotal.toLocaleString()} ${isRecommended ? 'recommended jobs' : 'active jobs'}`
                : isRecommended ? 'Recommended for you' : 'Active jobs'}
            </Typography>
            {appliedCount > 0 ? (
              <Button onClick={clearFilters} size="small">
                Clear all filters
              </Button>
            ) : null}
          </Stack>

          {resultsLoading ? (
            <Grid aria-label="Loading Candidate jobs" container role="status" spacing={2}>
              {Array.from({ length: 4 }, (_, index) => (
                <Grid key={index} size={{ xs: 12, xl: 6 }}>
                  <JobCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : resultsError ? (
            <ErrorState onRetry={() => void refetchResults()} title="Jobs unavailable" />
          ) : displayedJobs?.length ? (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {displayedJobs.map((job) => (
                  <Grid key={job.id} size={{ xs: 12, xl: 6 }}>
                    {isRecommended ? (
                      <Stack sx={{ mb: 1 }} spacing={0.5}>
                        <Chip color="primary" label={`Resume match ${recommended.data?.items.find((item) => item.id === job.id)?.matchScore ?? 0}%`} size="small" sx={{ alignSelf: 'flex-start' }} />
                        {(recommended.data?.items.find((item) => item.id === job.id)?.matchReasons ?? []).slice(0, 3).map((reason) => <Typography color="text.secondary" key={reason} variant="body2">• {reason}</Typography>)}
                      </Stack>
                    ) : null}
                    <JobCard
                      additionalAction={
                        <ApplyToJobButton
                          applicationUrl={null}
                          jobId={job.id}
                          jobSlug={job.slug}
                          label="Apply"
                          loadApplicationUrl={() => fetchJobApplicationUrl(job.slug)}
                          onApplied={(jobId) => setAppliedJobIds((current) => new Set(current).add(jobId))}
                          size="medium"
                        />
                      }
                      job={job}
                      returnPath={ROUTES.DASHBOARD_JOBS}
                      returnSearch={searchParams.toString()}
                      secondaryAction={<SaveJobButton jobId={job.id} jobTitle={job.title} />}
                      showExtendedDetails
                    />
                  </Grid>
                ))}
              </Grid>
              {(displayedPages ?? 0) > 1 ? (
                <Pagination
                  aria-label="Candidate jobs pagination"
                  count={displayedPages}
                  onChange={(_, page) => setState({ ...state, page })}
                  page={state.page}
                  showFirstButton
                  showLastButton
                  sx={{ alignSelf: 'center' }}
                />
              ) : null}
            </Stack>
          ) : (
            <EmptyState
              actionLabel={
                isRecommended ? 'View all jobs' : appliedCount > 0 || state.keyword ? 'Clear search and filters' : undefined
              }
              description={isRecommended ? 'No resume-matched jobs are available right now.' : 'Try a broader keyword or remove one or more filters.'}
              onAction={
                isRecommended
                  ? () => setMode('all')
                  : appliedCount > 0 || state.keyword
                  ? () => {
                      setKeywordInput('');
                      setState(emptyCandidateJobSearchState());
                    }
                  : undefined
              }
              title={isRecommended ? 'No recommendations yet' : 'No jobs match your search'}
            />
          )}
        </Box>
      </Stack>

      {!isRecommended ? <Drawer
        id="candidate-mobile-job-filters"
        onClose={closeMobileFilters}
        open={isMobileFiltersOpen}
        slotProps={{
          paper: {
            'aria-label': 'Candidate job filters',
            sx: { maxWidth: '92vw', p: 2.5, width: 360 },
          },
        }}
        sx={{ display: { lg: 'none' } }}
      >
        <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography component="h2" variant="h3">
            Filter jobs
          </Typography>
          <IconButton aria-label="Close job filters" onClick={closeMobileFilters}>
            <CloseIcon />
          </IconButton>
        </Stack>
        {filterPanel}
      </Drawer> : null}
    </Stack>
  );
};
