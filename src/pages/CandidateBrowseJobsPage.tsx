import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
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
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { ApplicationQuotaIndicator } from '@/features/dashboard/components/ApplicationQuotaIndicator';
import { ApplyToJobButton } from '@/features/dashboard/components/ApplyToJobButton';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
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

export const CandidateBrowseJobsPage = () => {
  useDocumentMetadata(
    'Browse jobs | Career Portal',
    'Explore active jobs based on your Candidate career goals.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseCandidateJobSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toCandidatePublicJobQuery(state), [state]);
  const [keywordInput, setKeywordInput] = useState(state.keyword);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(true);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const debouncedKeyword = useDebouncedValue(keywordInput, 350);
  const jobs = useSearchJobsQuery(query);
  const filterOptions = useGetJobFilterOptionsQuery({ ...query, pageNumber: 1, pageSize: 1 });
  const supplementalCounts = useGetSupplementalJobFilterCountsQuery(query);
  const appliedCount = countCandidateJobFilters(state);

  const setState = useCallback(
    (nextState: CandidateJobSearchState, replace = false) => {
      setSearchParams(serializeCandidateJobSearchState(nextState), { replace });
    },
    [setSearchParams],
  );

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
      </Paper>

      <ApplicationQuotaIndicator />

      {state.companyName || state.categoryName ? (
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

      {jobs.isFetching && !jobs.isLoading ? (
        <LinearProgress aria-label="Updating job results" />
      ) : null}

      <Stack alignItems="flex-start" direction="row" spacing={2.5}>
        {isDesktopFiltersOpen ? (
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
        ) : (
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
        )}

        <Box component="section" minWidth={0} sx={{ flex: 1 }}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography component="h2" variant="h3">
              {jobs.data ? `${jobs.data.totalCount.toLocaleString()} active jobs` : 'Active jobs'}
            </Typography>
            {appliedCount > 0 ? (
              <Button onClick={clearFilters} size="small">
                Clear all filters
              </Button>
            ) : null}
          </Stack>

          {jobs.isLoading ? (
            <Grid aria-label="Loading Candidate jobs" container role="status" spacing={2}>
              {Array.from({ length: 4 }, (_, index) => (
                <Grid key={index} size={{ xs: 12, xl: 6 }}>
                  <JobCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : jobs.isError ? (
            <ErrorState onRetry={() => void jobs.refetch()} title="Jobs unavailable" />
          ) : jobs.data?.items.length ? (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {jobs.data.items.map((job) => (
                  <Grid key={job.id} size={{ xs: 12, xl: 6 }}>
                    <JobCard
                      additionalAction={
                        <ApplyToJobButton
                          applicationUrl={null}
                          jobId={job.id}
                          jobSlug={job.slug}
                          label="Apply"
                          loadApplicationUrl={() => fetchJobApplicationUrl(job.slug)}
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
              {jobs.data.totalPages > 1 ? (
                <Pagination
                  aria-label="Candidate jobs pagination"
                  count={jobs.data.totalPages}
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
                appliedCount > 0 || state.keyword ? 'Clear search and filters' : undefined
              }
              description="Try a broader keyword or remove one or more filters."
              onAction={
                appliedCount > 0 || state.keyword
                  ? () => {
                      setKeywordInput('');
                      setState(emptyCandidateJobSearchState());
                    }
                  : undefined
              }
              title="No jobs match your search"
            />
          )}
        </Box>
      </Stack>

      <Drawer
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
      </Drawer>
    </Stack>
  );
};
