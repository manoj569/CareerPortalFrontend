import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  Pagination,
  Paper,
  Skeleton,
  Stack,
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
  downloadCandidateResume,
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
import { ActiveFilterChips } from '@/features/jobs/components/candidateBrowse/ActiveFilterChips';
import {
  JobModeTabs,
  type CandidateBrowseMode as BrowseMode,
  type CandidateBrowseTab,
} from '@/features/jobs/components/candidateBrowse/JobModeTabs';
import { JobResultsHeader } from '@/features/jobs/components/candidateBrowse/JobResultsHeader';
import { JobSearchBar } from '@/features/jobs/components/candidateBrowse/JobSearchBar';
import { ResumeRecommendationCard } from '@/features/jobs/components/candidateBrowse/ResumeRecommendationCard';
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
import { EmploymentType, type PublicJobSummary } from '@/features/jobs/types/jobModels';

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
  const [locationInput, setLocationInput] = useState(state.locations.join(', '));
  const [experienceInput, setExperienceInput] = useState(state.minExperienceYears?.toString() ?? '');
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
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
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

  const isInternshipTab =
    !isRecommended &&
    state.employmentTypes.length === 1 &&
    state.employmentTypes[0] === EmploymentType.Internship;
  const activeTab: CandidateBrowseTab = isRecommended
    ? 'recommended'
    : isInternshipTab
      ? 'internships'
      : 'all';

  const setTab = (nextTab: CandidateBrowseTab) => {
    if (nextTab === 'internships') {
      const next = serializeCandidateJobSearchState({
        ...state,
        employmentTypes: [EmploymentType.Internship],
        page: 1,
      });
      next.set('mode', 'all');
      setSearchParams(next);
      return;
    }
    if (nextTab === 'all' && isInternshipTab) {
      const next = serializeCandidateJobSearchState({ ...state, employmentTypes: [], page: 1 });
      next.set('mode', 'all');
      setSearchParams(next);
      return;
    }
    setMode(nextTab);
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

  const downloadResume = async () => {
    if (isDownloadingResume) return;
    setIsDownloadingResume(true);
    try {
      const blob = await downloadCandidateResume();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = profile.data?.resume?.fileName ?? 'career-harbor-resume';
      try {
        link.click();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setResumeError('Your resume could not be downloaded. Please try again.');
    } finally {
      setIsDownloadingResume(false);
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
    setKeywordInput('');
    setLocationInput('');
    setExperienceInput('');
    setState({ ...empty, sort: state.sort });
  }, [setState, state.sort]);

  useEffect(() => {
    setKeywordInput(state.keyword);
    setLocationInput(state.locations.join(', '));
    setExperienceInput(state.minExperienceYears?.toString() ?? '');
  }, [state.keyword, state.locations, state.minExperienceYears]);

  useEffect(() => {
    if (debouncedKeyword !== keywordInput || debouncedKeyword.trim() === state.keyword) return;
    applyChanges({ keyword: debouncedKeyword.trim().slice(0, 250) }, true);
  }, [applyChanges, debouncedKeyword, keywordInput, state.keyword]);

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false);
    window.setTimeout(() => filterButtonRef.current?.focus(), 0);
  };

  const searchJobs = () => {
    const locations = locationInput.split(',').map((value) => value.trim()).filter(Boolean).slice(0, 25);
    const parsedExperience = experienceInput === '' ? undefined : Math.min(60, Math.max(0, Number(experienceInput)));
    applyChanges({
      keyword: keywordInput.trim().slice(0, 250),
      locations,
      minExperienceYears: Number.isFinite(parsedExperience) ? parsedExperience : undefined,
    });
  };

  const refreshMatches = () => {
    if (resumeStatus.isFetching || recommended.isFetching) return;
    void resumeStatus.refetch();
    if (isRecommended) void recommended.refetch();
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
          Browse jobs
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Find roles that match your skills and goals.
        </Typography>
      </Box>

      {!isRecommended ? (
        <JobSearchBar
          experience={experienceInput}
          keyword={keywordInput}
          location={locationInput}
          onExperienceChange={setExperienceInput}
          onKeywordChange={setKeywordInput}
          onLocationChange={setLocationInput}
          onSearch={searchJobs}
        />
      ) : null}

      <JobModeTabs
        mode={activeTab}
        onChange={setTab}
        resumeMatchesEnabled={isResumeReady}
      />

      <ResumeRecommendationCard
        error={resumeError}
        fileInputRef={fileInput}
        fileName={profile.data?.resume?.fileName}
        hasResume={resumeStatus.data?.hasResume ?? false}
        isDownloading={isDownloadingResume}
        isRefreshing={resumeStatus.isFetching || recommended.isFetching}
        isUploading={uploadState.isLoading}
        lastUpdatedUtc={profile.data?.resume?.uploadedAtUtc}
        onDownload={() => void downloadResume()}
        onFileChange={(event) => void handleResume(event)}
        onRefresh={refreshMatches}
        onUpload={() => fileInput.current?.click()}
        status={resumeStatus.data?.extractionStatus}
      />

      {!isRecommended ? (
        <Button
          aria-controls="candidate-mobile-job-filters"
          aria-expanded={isMobileFiltersOpen}
          onClick={() => setIsMobileFiltersOpen(true)}
          ref={filterButtonRef}
          startIcon={<FilterListIcon />}
          sx={{ alignSelf: 'flex-start', display: { lg: 'none' } }}
          variant="outlined"
        >
          Filters{appliedCount ? ` (${appliedCount})` : ''}
        </Button>
      ) : null}

      <ApplicationQuotaIndicator />

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
              p: 2,
              position: 'sticky',
              top: 88,
              width: 272,
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
          <Button
            aria-label="Expand job filters"
            onClick={() => setIsDesktopFiltersOpen(true)}
            startIcon={<TuneOutlinedIcon />}
            sx={{ display: { xs: 'none', lg: 'inline-flex' }, position: 'sticky', top: 88 }}
            variant="outlined"
          >
            Filters{appliedCount ? ` (${appliedCount})` : ''}
          </Button>
        ) : null}

        <Box component="section" minWidth={0} sx={{ flex: 1 }}>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <JobResultsHeader
              count={displayedTotal}
              isLoading={resultsLoading}
              isRecommended={isRecommended}
              onSortChange={(sort) => applyChanges({ sort })}
              sort={state.sort}
            />
            {!isRecommended && (appliedCount > 0 || state.keyword) ? (
              <Stack alignItems="flex-start" spacing={1}>
                <ActiveFilterChips
                  onChange={applyChanges}
                  onKeywordClear={() => {
                    setKeywordInput('');
                    applyChanges({ keyword: '' });
                  }}
                  state={state}
                />
                <Button onClick={clearFilters} size="small">
                  Clear all filters
                </Button>
              </Stack>
            ) : null}
          </Stack>

          {resultsLoading ? (
            <Grid aria-label="Loading Candidate jobs" container role="status" spacing={2}>
              {Array.from({ length: 4 }, (_, index) => (
                <Grid key={index} size={{ xs: 12 }}>
                  <JobCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : resultsError ? (
            <ErrorState onRetry={() => void refetchResults()} title="Jobs unavailable" />
          ) : displayedJobs?.length ? (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {displayedJobs.map((job) => {
                  const recommendation = isRecommended
                    ? recommended.data?.items.find((item) => item.id === job.id)
                    : undefined;

                  return (
                  <Grid key={job.id} size={{ xs: 12 }}>
                    {recommendation ? (
                      <Stack sx={{ mb: 1 }} spacing={0.5}>
                        <Chip color="primary" label={`Resume match ${recommendation.matchScore}%`} size="small" sx={{ alignSelf: 'flex-start' }} />
                        {recommendation.matchReasons.slice(0, 3).map((reason) => <Typography color="text.secondary" key={reason} variant="body2">• {reason}</Typography>)}
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
                      compact
                      showExtendedDetails
                      viewActionLabel="View job"
                    />
                  </Grid>
                  );
                })}
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
              title={isRecommended ? 'No resume matches found' : 'No jobs match your search'}
            />
          )}
        </Box>
      </Stack>

      {!isRecommended ? <Drawer
        anchor="bottom"
        id="candidate-mobile-job-filters"
        onClose={closeMobileFilters}
        open={isMobileFiltersOpen}
        slotProps={{
          paper: {
            'aria-label': 'Candidate job filters',
            sx: {
              borderRadius: '20px 20px 0 0',
              maxHeight: 'min(85dvh, 720px)',
              overflowY: 'auto',
              p: { xs: 2, sm: 2.5 },
              width: '100%',
            },
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
