import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Alert, Box, Button, Drawer, Grid, IconButton, LinearProgress, Pagination, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { ApplicationQuotaIndicator } from '@/features/dashboard/components/ApplicationQuotaIndicator';
import { ApplyToJobButton } from '@/features/dashboard/components/ApplyToJobButton';
import { AIApplyToJobButton } from '@/features/aiApply/components/AIApplyToJobButton';
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
import {
  sanitizeResumeFileName,
  validateResume,
} from '@/features/dashboard/utils/resumeValidation';
import {
  fetchJobApplicationUrl,
  useGetJobFilterOptionsQuery,
  useGetSupplementalJobFilterCountsQuery,
  useSearchJobsQuery,
} from '@/features/jobs/api/jobsApi';
import { CandidateJobFilters } from '@/features/jobs/components/CandidateJobFilters';
import { JobCard } from '@/features/jobs/components/JobCard';

import { ActiveFilterChips } from '@/features/jobs/components/candidateBrowse/ActiveFilterChips';
import {
  JobModeTabs,
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

const readBrowseTab = (value: string | null): CandidateBrowseTab =>
  value === 'recommended' ||
  value === 'internships' ||
  value === 'fresher' ||
  value === 'experienced'
    ? value
    : 'all';

const applyTabFilters = (
  state: CandidateJobSearchState,
  tab: CandidateBrowseTab,
): CandidateJobSearchState => {
  if (tab === 'internships') {
    return { ...state, employmentTypes: [EmploymentType.Internship] };
  }
  if (tab === 'fresher') {
    return { ...state, maxExperienceYears: 1, minExperienceYears: 0 };
  }
  if (tab === 'experienced') {
    return { ...state, maxExperienceYears: undefined, minExperienceYears: 2 };
  }
  return state;
};

const removeTabFilters = (
  state: CandidateJobSearchState,
  tab: CandidateBrowseTab,
): CandidateJobSearchState => {
  if (tab === 'internships') return { ...state, employmentTypes: [] };
  if (tab === 'fresher' || tab === 'experienced') {
    return { ...state, maxExperienceYears: undefined, minExperienceYears: undefined };
  }
  return state;
};

export const CandidateBrowseJobsPage = () => {
  useDocumentMetadata(
    'Browse jobs | Career Portal',
    'Explore active jobs based on your Candidate career goals.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = readBrowseTab(searchParams.get('mode'));
  const parsedState = useMemo(() => parseCandidateJobSearchParams(searchParams), [searchParams]);
  const state = useMemo(
    () => applyTabFilters(parsedState, requestedTab),
    [parsedState, requestedTab],
  );
  const query = useMemo(() => toCandidatePublicJobQuery(state), [state]);
  const [keywordInput, setKeywordInput] = useState(state.keyword);
  const [locationInput, setLocationInput] = useState(state.locations.join(', '));
  const [experienceInput, setExperienceInput] = useState(state.minExperienceYears?.toString() ?? '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFilterButtonFocusRef = useRef(false);
  const debouncedKeyword = useDebouncedValue(keywordInput, 350);
  const profile = useGetProfileQuery();
  const [pollAttempts, setPollAttempts] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);
  const resumeStatus = useGetResumeStatusQuery(undefined, {
    pollingInterval: pollingActive && pollAttempts < 12 ? 5000 : 0,
    skipPollingIfUnfocused: true,
  });
  const isResumeReady = resumeStatus.data?.extractionStatus === ResumeExtractionStatus.Ready;
  const isRecommended = requestedTab === 'recommended' && isResumeReady;
  const activeTab: CandidateBrowseTab =
    requestedTab === 'recommended' && !isResumeReady ? 'all' : requestedTab;
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
  const downloadInProgressRef = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const appliedCount = countCandidateJobFilters(state);

  const setState = useCallback(
    (nextState: CandidateJobSearchState, replace = false, nextTab = activeTab) => {
      const next = serializeCandidateJobSearchState(nextState);
      next.set('mode', nextTab);
      setSearchParams(next, { replace });
    },
    [activeTab, setSearchParams],
  );

  const setTab = (nextTab: CandidateBrowseTab) => {
    const compatibleState = removeTabFilters(state, activeTab);
    setState(applyTabFilters({ ...compatibleState, page: 1 }, nextTab), false, nextTab);
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
      await profile.refetch();
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
    if (downloadInProgressRef.current) return;
    const downloadFileName = sanitizeResumeFileName(profile.data?.resume?.fileName, '');
    if (!downloadFileName) {
      setResumeError('Your resume filename is unavailable. Refresh the page and try again.');
      return;
    }
    downloadInProgressRef.current = true;
    setIsDownloadingResume(true);
    try {
      const blob = await downloadCandidateResume();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      try {
        link.click();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setResumeError('Your resume could not be downloaded. Please try again.');
    } finally {
      downloadInProgressRef.current = false;
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
      const changesExperience =
        Object.hasOwn(changes, 'minExperienceYears') ||
        Object.hasOwn(changes, 'maxExperienceYears');
      const changesEmploymentType = Object.hasOwn(changes, 'employmentTypes');
      const leavesMode =
        ((activeTab === 'fresher' || activeTab === 'experienced') && changesExperience) ||
        (activeTab === 'internships' && changesEmploymentType);
      const nextTab = leavesMode ? 'all' : activeTab;
      const currentState = leavesMode ? removeTabFilters(state, activeTab) : state;
      setState({ ...currentState, ...changes, page: 1 }, replace, nextTab);
    },
    [activeTab, setState, state],
  );

  useEffect(() => {
    const normalized = serializeCandidateJobSearchState(state);
    normalized.set('mode', activeTab);
    const current = new URLSearchParams(searchParams);
    normalized.sort();
    current.sort();
    if (normalized.toString() !== current.toString()) {
      setSearchParams(normalized, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams, state]);

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

  useEffect(() => {
    if (isMobileFiltersOpen || !restoreFilterButtonFocusRef.current) return;
    restoreFilterButtonFocusRef.current = false;
    filterButtonRef.current?.focus();
  }, [isMobileFiltersOpen]);

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  const searchJobs = () => {
    const locations = locationInput.split(',').map((value) => value.trim()).filter(Boolean).slice(0, 25);
    const parsedExperience = experienceInput === '' ? undefined : Math.min(45, Math.max(0, Number(experienceInput)));
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

  const renderFilterPanel = (onCollapse?: () => void) =>
    filterOptions.isLoading && !filterOptions.data ? <PageLoadingIndicator compact label="Loading job filters" /> : !filterOptions.data ? (
      <Stack spacing={2}>
        <Alert severity="error">Unable to load filters</Alert>
        <Button
          onClick={() => {
            void filterOptions.refetch();
          }}
          variant="outlined"
        >
          Retry
        </Button>
      </Stack>
    ) : (
      <Stack spacing={1} aria-busy={filterOptions.isFetching}>
      {filterOptions.isError ? <Alert severity="warning" action={<Button onClick={() => void filterOptions.refetch()}>Retry</Button>}>Unable to load filters</Alert> : null}
      {filterOptions.isFetching ? <Typography role="status" variant="caption">Updating filters…</Typography> : null}
      <CandidateJobFilters
        appliedCount={appliedCount}
        onChange={applyChanges}
        onClear={clearFilters}
        onCollapse={onCollapse}
        options={filterOptions.data}
        state={state}
        supplementalCounts={supplementalCounts.data}
      />
      </Stack>
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
          onClick={() => {
            restoreFilterButtonFocusRef.current = true;
            setIsMobileFiltersOpen(true);
          }}
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
              p: 2,
              position: 'sticky',
              top: 88,
              width: 272,
            }}
          >
            {renderFilterPanel(() => setIsDesktopFiltersOpen(false))}
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
                  options={filterOptions.data}
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

          {resultsLoading ? <PageLoadingIndicator label="Loading Candidate jobs" /> : resultsError ? (
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
                    <JobCard
                      match={recommendation}
                      additionalAction={
                        <AIApplyToJobButton
                          jobSlug={job.slug}
                          companyName={job.companyName}
                          jobId={job.id}
                          jobTitle={job.title}
                        />
                      }
                      secondaryAction={
                        <>
                          <SaveJobButton jobId={job.id} jobTitle={job.title} />
                          <ApplyToJobButton
                            applicationUrl={null}
                            companyName={job.companyName}
                            jobId={job.id}
                            jobSlug={job.slug}
                            jobTitle={job.title}
                            label="Apply manually"
                            loadApplicationUrl={() => fetchJobApplicationUrl(job.slug)}
                            onApplied={(jobId) => setAppliedJobIds((current) => new Set(current).add(jobId))}
                            size="medium"
                          />
                        </>
                      }
                      job={job}
                      returnPath={ROUTES.DASHBOARD_JOBS}
                      returnSearch={searchParams.toString()}
                      compact
                      showExtendedDetails
                      viewActionLabel="View details"
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
            <Stack spacing={1}>
            <EmptyState
              actionLabel={
                isRecommended ? 'Browse all jobs' : appliedCount > 0 || state.keyword ? 'Clear search and filters' : undefined
              }
              description={isRecommended ? "We couldn't find a strong match with your current resume." : 'Try a broader keyword or remove one or more filters.'}
              onAction={
                isRecommended
                  ? () => setTab('all')
                  : appliedCount > 0 || state.keyword
                  ? () => {
                      setKeywordInput('');
                      setState(emptyCandidateJobSearchState());
                    }
                  : undefined
              }
              title={isRecommended ? 'No matching jobs yet' : 'No jobs match your search'}
            />
            {isRecommended ? <Button onClick={() => fileInput.current?.click()} sx={{ alignSelf: 'center' }}>Update resume</Button> : null}
            </Stack>
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
        {renderFilterPanel()}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            bgcolor: 'background.paper',
            bottom: 0,
            borderTop: 1,
            borderColor: 'divider',
            mt: 2,
            pb: 0.5,
            pt: 1.5,
            position: 'sticky',
          }}
        >
          <Button disabled={appliedCount === 0} fullWidth onClick={clearFilters} variant="outlined">
            Clear all
          </Button>
          <Button
            fullWidth
            onClick={closeMobileFilters}
            type="button"
            variant="contained"
          >
            Show jobs
          </Button>
        </Stack>
      </Drawer> : null}
    </Stack>
  );
};
