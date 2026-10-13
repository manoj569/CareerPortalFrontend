import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';

import CloseIcon from '@mui/icons-material/Close';

import FilterListIcon from '@mui/icons-material/FilterList';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import {
  Alert,
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

import { NavigationType, useLocation, useNavigationType, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';

import { ErrorState } from '@/components/feedback/ErrorState';

import { ROUTES } from '@/constants/routes';

import { ApplicationQuotaIndicator } from '@/features/dashboard/components/ApplicationQuotaIndicator';

import { ApplyToJobButton } from '@/features/dashboard/components/ApplyToJobButton';

// import { AIApplyToJobButton } from '@/features/aiApply/components/AIApplyToJobButton';

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

import { ReferralJobsSection } from '@/features/referrals/components/ReferralJobsSection';

import {
  countCandidateJobFilters,
  emptyCandidateJobSearchState,
  parseCandidateJobSearchParams,
  serializeCandidateJobSearchState,
  toCandidatePublicJobQuery,
  type CandidateJobSearchState,
} from '@/features/jobs/utils/candidateJobSearchParams';

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
  value === 'internships' || value === 'fresher' || value === 'experienced' || value === 'referral'
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
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousLocationKeyRef = useRef(location.key);

  const requestedTab = readBrowseTab(searchParams.get('mode'));

  const parsedState = useMemo(() => parseCandidateJobSearchParams(searchParams), [searchParams]);

  const state = useMemo(
    () => applyTabFilters(parsedState, requestedTab),

    [parsedState, requestedTab],
  );

  const query = useMemo(() => toCandidatePublicJobQuery(state), [state]);

  const [draftKeyword, setDraftKeyword] = useState(state.keyword);

  const [locationInput, setLocationInput] = useState(state.locations.join(', '));

  const [experienceInput, setExperienceInput] = useState(
    state.minExperienceYears?.toString() ?? '',
  );

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(true);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());

  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const restoreFilterButtonFocusRef = useRef(false);

  const internalNavigationRef = useRef<{ keyword: boolean; locations: boolean } | null>(null);
  const preserveDraftsRef = useRef(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPendingSearch = useCallback(() => {
    if (searchTimerRef.current !== null) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = null;
  }, []);

  const profile = useGetProfileQuery();

  const [pollAttempts, setPollAttempts] = useState(0);

  const [pollingActive, setPollingActive] = useState(false);

  const resumeStatus = useGetResumeStatusQuery(undefined, {
    pollingInterval: pollingActive && pollAttempts < 12 ? 5000 : 0,

    skipPollingIfUnfocused: true,
  });

  const isResumeReady = resumeStatus.data?.extractionStatus === ResumeExtractionStatus.Ready;

  // Resume Matches is reserved for Phase 2; disabled URLs normalize to All jobs.
  const isRecommended = requestedTab === 'recommended';

  const activeTab: CandidateBrowseTab = requestedTab;

  const isReferralTab = activeTab === 'referral';

  // Normal job search should not run while viewing Resume Matches
  // or Referral Jobs.
  const jobs = useSearchJobsQuery(query, {
    refetchOnMountOrArgChange: true,
    skip: isRecommended || isReferralTab,
  });

  // Only fetch AI resume-matched jobs after resume extraction
  // has successfully completed.
  const recommended = useGetRecommendedJobsQuery(
    {
      pageNumber: state.page,
      pageSize: 20,
    },
    {
      skip: !isRecommended || !isResumeReady,
    },
  );

  const filterOptions = useGetJobFilterOptionsQuery(
    { ...query, pageNumber: 1, pageSize: 1 },

    { skip: isRecommended || isReferralTab },
  );

  const supplementalCounts = useGetSupplementalJobFilterCountsQuery(query, {
    skip: isRecommended || isReferralTab,
  });

  const [uploadResume, uploadState] = useUploadResumeMutation();

  const [resumeError, setResumeError] = useState<string | null>(null);

  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  const downloadInProgressRef = useRef(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const appliedCount = countCandidateJobFilters(state);

  const setState = useCallback(
    (nextState: CandidateJobSearchState, replace = false, nextTab = activeTab) => {
      internalNavigationRef.current = {
        keyword: nextState.keyword !== state.keyword,
        locations: nextState.locations.join(', ') !== state.locations.join(', '),
      };
      const next = serializeCandidateJobSearchState(nextState);

      next.set('mode', nextTab);

      setSearchParams(next, { replace });
    },

    [activeTab, setSearchParams, state],
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
        isDashboardApiError(error)
          ? error.message
          : 'Unable to upload your resume. Please try again.',
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

    setDraftKeyword('');

    setLocationInput('');

    setExperienceInput('');

    cancelPendingSearch();
    setState(empty, false, 'all');
  }, [cancelPendingSearch, setState]);

  const appliedStateRef = useRef(state);
  const applyChangesRef = useRef(applyChanges);
  useEffect(() => {
    appliedStateRef.current = state;
    applyChangesRef.current = applyChanges;
  }, [applyChanges, state]);

  // Automatic application must not erase typing that continued during navigation.
  // External navigation (including Back/Forward) restores inputs and cancels old typing.
  useEffect(() => {
    const isHistoryNavigation =
      navigationType === NavigationType.Pop && previousLocationKeyRef.current !== location.key;
    previousLocationKeyRef.current = location.key;
    const internal = internalNavigationRef.current;
    internalNavigationRef.current = null;
    if (isHistoryNavigation) preserveDraftsRef.current = false;
    if (preserveDraftsRef.current) {
      preserveDraftsRef.current = false;
      return;
    }
    if (internal && !isHistoryNavigation) {
      if (internal.locations) setLocationInput(state.locations.join(', '));
      setExperienceInput(state.minExperienceYears?.toString() ?? '');
      return;
    }
    // Canonicalization and other internal URL updates must never hydrate active typing.
    if (!isHistoryNavigation) return;
    cancelPendingSearch();
    setDraftKeyword(state.keyword);
    setLocationInput(state.locations.join(', '));
    setExperienceInput(state.minExperienceYears?.toString() ?? '');
  }, [searchParams, cancelPendingSearch, state, location.key, navigationType]);

  useEffect(() => cancelPendingSearch, [cancelPendingSearch]);

  const normalizeSearch = (keyword: string, location: string) => ({
    keyword: keyword.trim().slice(0, 250),
    locations: Array.from(
      new Set(
        location
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ).slice(0, 25),
  });

  const scheduleSearch = (keyword: string, location: string) => {
    cancelPendingSearch();
    const next = normalizeSearch(keyword, location);
    searchTimerRef.current = setTimeout(() => {
      searchTimerRef.current = null;
      const current = appliedStateRef.current;
      // A location filter selected during keyword typing wins over the old draft location.
      const changes = {
        ...next,
        locations:
          state.locations.join(', ') === current.locations.join(', ')
            ? next.locations
            : current.locations,
      };
      if (
        changes.keyword !== current.keyword ||
        changes.locations.join(', ') !== current.locations.join(', ')
      ) {
        preserveDraftsRef.current = true;
        applyChangesRef.current(changes);
      }
    }, 350);
  };

  useEffect(() => {
    if (isMobileFiltersOpen || !restoreFilterButtonFocusRef.current) return;

    restoreFilterButtonFocusRef.current = false;

    filterButtonRef.current?.focus();
  }, [isMobileFiltersOpen]);

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  const searchJobs = () => {
    cancelPendingSearch();
    const next = normalizeSearch(draftKeyword, locationInput);
    if (
      next.keyword === state.keyword &&
      next.locations.join(', ') === state.locations.join(', ') &&
      state.page === 1
    ) {
      if (!isRecommended && !isReferralTab && !jobs.isFetching) void jobs.refetch();
      return;
    }
    applyChanges(next);
  };

  const refreshMatches = () => {
    if (resumeStatus.isFetching || recommended.isFetching) return;

    void resumeStatus.refetch();

    if (isRecommended) void recommended.refetch();
  };

  const sourceJobs = isRecommended
    ? isResumeReady
      ? recommended.data?.items.map(toJobSummary)
      : undefined
    : jobs.data?.items;

  const displayedJobs = sourceJobs?.filter((job) => !appliedJobIds.has(job.id));

  const sourceTotal = isRecommended
    ? isResumeReady
      ? recommended.data?.totalCount
      : undefined
    : jobs.data?.totalCount;

  const displayedTotal = sourceTotal === undefined ? undefined : sourceTotal;

  const displayedPages =
    isRecommended && isResumeReady
      ? recommended.data?.totalPages
      : isRecommended
        ? undefined
        : jobs.data?.totalPages;

  const resultsLoading = isRecommended ? isResumeReady && recommended.isLoading : jobs.isLoading;

  const resultsError = isRecommended ? isResumeReady && recommended.isError : jobs.isError;

  const refetchResults = isRecommended ? recommended.refetch : jobs.refetch;

  const renderFilterPanel = (onCollapse?: () => void) =>
    filterOptions.isLoading && !filterOptions.data ? (
      <PageLoadingIndicator compact label="Loading job filters" />
    ) : !filterOptions.data ? (
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
        {filterOptions.isError ? (
          <Alert
            severity="warning"
            action={<Button onClick={() => void filterOptions.refetch()}>Retry</Button>}
          >
            Unable to load filters
          </Alert>
        ) : null}

        {filterOptions.isFetching ? (
          <Typography role="status" variant="caption">
            Updating filters…
          </Typography>
        ) : null}

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

  const pagePresentation: Record<CandidateBrowseTab, { title: string; description: string }> = {
    all: {
      title: 'Find your next opportunity',
      description:
        'Explore jobs, internships and career opportunities from top companies across India.',
    },
    recommended: {
      title: 'Jobs that match your resume',
      description: 'AI-powered job matching based on your skills, experience and preferences.',
    },
    internships: {
      title: 'Find the right internship for your career',
      description: 'Kickstart your career with internships from companies across India.',
    },
    fresher: {
      title: 'Start your career with the right opportunity',
      description: 'Discover entry-level jobs and opportunities designed for freshers.',
    },
    experienced: {
      title: 'Take the next step in your career',
      description: 'Explore opportunities that match your experience and career goals.',
    },
    referral: {
      title: 'Find jobs through employee referrals',
      description:
        'Discover referral opportunities and connect with employees who can help you apply.',
    },
  };

  const presentation = pagePresentation[activeTab];

  return (
    <Box sx={{ mx: 'auto', width: '100%' }}>
      <Stack spacing={{ xs: 2, md: 2.5 }}>
        <Box>
          <Typography
            component="h1"
            sx={{
              color: 'text.primary',
              fontSize: { xs: '1.65rem', md: '2rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            {activeTab === 'all' && (draftKeyword.trim() || state.keyword)
              ? 'Search jobs'
              : presentation.title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', md: '0.96rem' }, mt: 0.65 }}
          >
            {presentation.description}
          </Typography>
        </Box>

        {!isRecommended && !isReferralTab ? (
          <JobSearchBar
            experience={experienceInput}
            keyword={draftKeyword}
            location={locationInput}
            onExperienceChange={setExperienceInput}
            onKeywordChange={(value) => {
              setDraftKeyword(value);
              scheduleSearch(value, locationInput);
            }}
            onLocationChange={(value) => {
              setLocationInput(value);
              scheduleSearch(draftKeyword, value);
            }}
            onSearch={searchJobs}
          />
        ) : null}

        <JobModeTabs mode={activeTab} onChange={setTab} />

        {isRecommended ? (
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
        ) : null}

        {!isRecommended && !isReferralTab ? (
          <Button
            aria-controls="candidate-mobile-job-filters"
            aria-expanded={isMobileFiltersOpen}
            onClick={() => {
              restoreFilterButtonFocusRef.current = true;
              setIsMobileFiltersOpen(true);
            }}
            ref={filterButtonRef}
            startIcon={<FilterListIcon />}
            sx={{
              alignSelf: 'flex-start',
              display: { lg: 'none' },
              borderRadius: 1.5,
              textTransform: 'none',
            }}
            variant="outlined"
          >
            Filters{appliedCount ? ` (${appliedCount})` : ''}
          </Button>
        ) : null}

        {!isReferralTab ? <ApplicationQuotaIndicator /> : null}

        {!isReferralTab &&
        (isRecommended
          ? recommended.isFetching && !recommended.isLoading
          : jobs.isFetching && !jobs.isLoading) ? (
          <LinearProgress aria-label="Updating job results" />
        ) : null}

        {isReferralTab ? (
          <ReferralJobsSection />
        ) : (
          <Stack alignItems="flex-start" direction="row" spacing={{ lg: 2.5 }}>
            {!isRecommended && isDesktopFiltersOpen ? (
              <Paper
                component="aside"
                elevation={0}
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: { xs: 'none', lg: 'block' },
                  overflow: 'hidden',
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
                sx={{
                  display: { xs: 'none', lg: 'inline-flex' },
                  position: 'sticky',
                  top: 88,
                  textTransform: 'none',
                }}
                variant="outlined"
              >
                Filters{appliedCount ? ` (${appliedCount})` : ''}
              </Button>
            ) : null}

            <Box component="section" aria-busy={jobs.isFetching} minWidth={0} sx={{ flex: 1 }}>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <JobResultsHeader
                  count={resultsError ? undefined : displayedTotal}
                  isLoading={resultsLoading || jobs.isFetching}
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
                        cancelPendingSearch();
                        setDraftKeyword('');
                        applyChanges({ keyword: '' });
                      }}
                      state={state}
                    />
                    <Button onClick={clearFilters} size="small" sx={{ textTransform: 'none' }}>
                      Clear all filters
                    </Button>
                  </Stack>
                ) : null}
              </Stack>

              {isRecommended && !isResumeReady ? null : resultsLoading ? (
                <PageLoadingIndicator label="Loading Candidate jobs" />
              ) : resultsError ? (
                <ErrorState
                  onRetry={() => void refetchResults()}
                  title="We couldn't load jobs. Try again."
                />
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
                                  onApplied={(jobId) =>
                                    setAppliedJobIds((current) => new Set(current).add(jobId))
                                  }
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
                      isRecommended
                        ? 'Browse all jobs'
                        : appliedCount > 0 || state.keyword
                          ? 'Clear search and filters'
                          : undefined
                    }
                    description={
                      isRecommended
                        ? "We couldn't find a strong match with your current resume."
                        : `No jobs found${state.keyword ? ` for '${state.keyword}'` : ''}${state.locations.length ? ` in ${state.locations.join(', ')}` : ''}. Try a broader keyword or remove filters.`
                    }
                    onAction={
                      isRecommended
                        ? () => setTab('all')
                        : appliedCount > 0 || state.keyword
                          ? clearFilters
                          : undefined
                    }
                    title={isRecommended ? 'No matching jobs yet' : 'No jobs match your search'}
                  />
                  {isRecommended ? (
                    <Button onClick={() => fileInput.current?.click()} sx={{ alignSelf: 'center' }}>
                      Update resume
                    </Button>
                  ) : null}
                </Stack>
              )}
            </Box>
          </Stack>
        )}

        {!isRecommended && !isReferralTab ? (
          <Drawer
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
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
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
              <Button
                disabled={appliedCount === 0 && !state.keyword}
                fullWidth
                onClick={clearFilters}
                variant="outlined"
              >
                Clear all
              </Button>
              <Button fullWidth onClick={closeMobileFilters} type="button" variant="contained">
                Show jobs
              </Button>
            </Stack>
          </Drawer>
        ) : null}
      </Stack>
    </Box>
  );
};
