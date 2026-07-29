import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Chip,
  Drawer,
  Grid,
  LinearProgress,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { SaveJobButton } from '@/features/dashboard/components/SaveJobButton';
import { useGetPopularCompaniesQuery, useSearchJobsQuery } from '@/features/jobs/api/jobsApi';
import { JobDiscoveryHighlights } from '@/features/jobs/components/JobDiscoveryHighlights';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobCardSkeleton } from '@/features/jobs/components/JobCardSkeleton';
import { JobFilters, type JobFilterOption } from '@/features/jobs/components/JobFilters';
import { SearchInput } from '@/features/jobs/components/SearchInput';
import {
  employmentTypeOptions,
  experienceLevelOptions,
  workplaceTypeOptions,
} from '@/features/jobs/constants/jobOptions';
import {
  emptyJobSearchState,
  parseJobSearchParams,
  serializeJobSearchState,
  toPublicJobQuery,
  type JobSearchState,
} from '@/features/jobs/utils/jobSearchParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const JobsPage = () => {
  useDocumentMetadata(
    'Find jobs | Career Portal',
    'Search published career opportunities by keyword, location, job type, work mode, and experience level.',
    { canonicalPath: ROUTES.JOBS },
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseJobSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => toPublicJobQuery(state), [state]);
  const [searchInput, setSearchInput] = useState(state.search);
  const [locationInput, setLocationInput] = useState(state.location);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const debouncedLocation = useDebouncedValue(locationInput, 400);
  const { data, isError, isFetching, isLoading, refetch } = useSearchJobsQuery(query);
  const {
    data: popularCompanies,
    isError: isPopularCompaniesError,
    isLoading: isPopularCompaniesLoading,
    refetch: refetchPopularCompanies,
  } = useGetPopularCompaniesQuery({ limit: 10 });

  const setState = useCallback(
    (nextState: JobSearchState, replace = false) => {
      setSearchParams(serializeJobSearchState(nextState), { replace });
    },
    [setSearchParams],
  );

  const applyChanges = useCallback(
    (changes: Partial<JobSearchState>, replace = false) => {
      setState({ ...state, ...changes, page: 1 }, replace);
    },
    [setState, state],
  );

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setLocationInput('');
    setState(emptyJobSearchState());
  }, [setState]);

  useEffect(() => {
    setSearchInput(state.search);
    setLocationInput(state.location);
  }, [state.location, state.search]);

  useEffect(() => {
    if (debouncedSearch !== searchInput || debouncedLocation !== locationInput) return;
    if (debouncedSearch === state.search && debouncedLocation === state.location) return;
    applyChanges(
      {
        location: debouncedLocation.trim().slice(0, 250),
        search: debouncedSearch.trim().slice(0, 250),
      },
      true,
    );
  }, [
    debouncedLocation,
    debouncedSearch,
    applyChanges,
    locationInput,
    searchInput,
    state.location,
    state.search,
  ]);

  const companyOptions = useMemo<JobFilterOption[]>(() => {
    const options = new Map<string, string>();
    popularCompanies?.forEach((company) => options.set(company.id, company.name));
    data?.items.forEach((job) => options.set(job.companyId, job.companyName));
    if (state.companyId && !options.has(state.companyId)) {
      options.set(state.companyId, 'Selected company');
    }
    return Array.from(options, ([id, name]) => ({ id, name }));
  }, [data?.items, popularCompanies, state.companyId]);

  const categoryOptions = useMemo<JobFilterOption[]>(() => {
    const options = new Map<string, string>();
    data?.items.forEach((job) => options.set(job.categoryId, job.categoryName));
    if (state.categoryId && !options.has(state.categoryId)) {
      options.set(state.categoryId, 'Selected category');
    }
    return Array.from(options, ([id, name]) => ({ id, name }));
  }, [data?.items, state.categoryId]);

  const hasDiscoveryContext =
    state.page === 1 &&
    !state.search &&
    !state.location &&
    !state.companyId &&
    !state.categoryId &&
    !state.employmentType &&
    !state.workplaceType &&
    !state.experienceLevel &&
    state.minimumSalary === undefined &&
    state.maximumSalary === undefined &&
    !state.isFeatured;

  const activeFilters = [
    state.companyId
      ? {
          key: 'companyId',
          label:
            companyOptions.find((option) => option.id === state.companyId)?.name ??
            'Selected company',
        }
      : null,
    state.categoryId
      ? {
          key: 'categoryId',
          label:
            categoryOptions.find((option) => option.id === state.categoryId)?.name ??
            'Selected category',
        }
      : null,
    state.employmentType
      ? {
          key: 'employmentType',
          label:
            employmentTypeOptions.find((option) => option.value === state.employmentType)?.label ??
            'Job type',
        }
      : null,
    state.workplaceType
      ? {
          key: 'workplaceType',
          label:
            workplaceTypeOptions.find((option) => option.value === state.workplaceType)?.label ??
            'Work mode',
        }
      : null,
    state.experienceLevel
      ? {
          key: 'experienceLevel',
          label:
            experienceLevelOptions.find((option) => option.value === state.experienceLevel)
              ?.label ?? 'Experience',
        }
      : null,
    state.minimumSalary !== undefined
      ? { key: 'minimumSalary', label: `Minimum salary: ${state.minimumSalary.toLocaleString()}` }
      : null,
    state.maximumSalary !== undefined
      ? { key: 'maximumSalary', label: `Maximum salary: ${state.maximumSalary.toLocaleString()}` }
      : null,
    state.isFeatured ? { key: 'isFeatured', label: 'Featured jobs' } : null,
  ].filter((filter): filter is { key: keyof JobSearchState; label: string } => filter !== null);

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false);
    window.setTimeout(() => filterButtonRef.current?.focus(), 0);
  };

  const filterPanel = (
    <JobFilters
      categories={categoryOptions}
      companies={companyOptions}
      onChange={(changes) => applyChanges(changes)}
      onClear={clearAllFilters}
      state={state}
    />
  );

  return (
    <Stack spacing={4}>
      <Box>
        <Typography component="h1" variant="h1">
          Find your next opportunity
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Search active, published roles from employers across the Career Portal.
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SearchInput
              label="Keywords"
              onChange={setSearchInput}
              placeholder="Job title, company, or category"
              value={searchInput}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <SearchInput
              label="Location"
              onChange={setLocationInput}
              placeholder="City, region, or remote"
              value={locationInput}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Button
              aria-controls="mobile-job-filters"
              aria-expanded={isMobileFiltersOpen}
              fullWidth
              ref={filterButtonRef}
              onClick={() => setIsMobileFiltersOpen(true)}
              startIcon={<FilterListIcon />}
              sx={{ display: { lg: 'none' }, height: '100%' }}
              variant="outlined"
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {activeFilters.length > 0 ? (
        <Stack
          aria-label="Active filters"
          component="section"
          direction="row"
          flexWrap="wrap"
          gap={1}
        >
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              onDelete={() => applyChanges({ [filter.key]: undefined })}
            />
          ))}
          <Button onClick={clearAllFilters} size="small">
            Clear all
          </Button>
        </Stack>
      ) : null}

      <JobDiscoveryHighlights enabled={hasDiscoveryContext} />

      {hasDiscoveryContext ? (
        <Box aria-labelledby="popular-companies-heading" component="section">
          <Typography component="h2" id="popular-companies-heading" variant="h2">
            Popular companies
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Browse employers with the most active opportunities.
          </Typography>
          {isPopularCompaniesLoading ? (
            <Stack
              aria-label="Loading popular companies"
              direction="row"
              role="status"
              spacing={1}
              sx={{ mt: 2 }}
            >
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton height={40} key={index} variant="rounded" width={130} />
              ))}
            </Stack>
          ) : null}
          {isPopularCompaniesError ? (
            <Stack alignItems="flex-start" spacing={1} sx={{ mt: 2 }}>
              <Typography color="text.secondary">
                Popular companies are temporarily unavailable.
              </Typography>
              <Button onClick={() => void refetchPopularCompanies()} variant="outlined">
                Retry companies
              </Button>
            </Stack>
          ) : null}
          {!isPopularCompaniesLoading &&
          !isPopularCompaniesError &&
          popularCompanies?.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No companies with active jobs are available yet.
            </Typography>
          ) : null}
          {popularCompanies && popularCompanies.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
              {popularCompanies.map((company) => (
                <Chip
                  clickable
                  key={company.id}
                  label={`${company.name} (${company.activeJobCount})`}
                  onClick={() => applyChanges({ companyId: company.id })}
                />
              ))}
            </Stack>
          ) : null}
        </Box>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 92 }}>{filterPanel}</Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={3}>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Typography aria-live="polite" color="text.secondary">
                {data ? `${data.totalCount.toLocaleString()} jobs found` : 'Finding jobs…'}
              </Typography>
              {isFetching && data ? <Typography variant="body2">Updating…</Typography> : null}
            </Stack>
            {isFetching && data ? <LinearProgress aria-label="Updating job results" /> : null}

            {isLoading && !data ? (
              <Grid aria-label="Loading jobs" container role="status" spacing={2.5}>
                {Array.from({ length: 6 }, (_, index) => (
                  <Grid key={index} size={{ xs: 12, md: 6 }}>
                    <JobCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : null}

            {isError && !data ? <ErrorState onRetry={() => void refetch()} /> : null}

            {data?.items.length === 0 ? (
              <EmptyState
                actionLabel="Clear all filters"
                description="Try broader keywords, another location, or fewer filters."
                onAction={clearAllFilters}
                title="No jobs match your search"
              />
            ) : null}

            {data && data.items.length > 0 ? (
              <>
                <Grid container spacing={2.5}>
                  {data.items.map((job) => (
                    <Grid key={job.id} size={{ xs: 12, md: 6 }}>
                      <JobCard
                        job={job}
                        returnSearch={searchParams.toString()}
                        secondaryAction={<SaveJobButton jobId={job.id} jobTitle={job.title} />}
                      />
                    </Grid>
                  ))}
                </Grid>
                {data.totalPages > 1 ? (
                  <Stack alignItems="center" spacing={1}>
                    <Pagination
                      aria-label="Jobs pagination"
                      boundaryCount={1}
                      color="primary"
                      count={data.totalPages}
                      onChange={(_, page) => setState({ ...state, page })}
                      page={Math.min(state.page, data.totalPages)}
                      showFirstButton
                      showLastButton
                      siblingCount={0}
                    />
                    <Typography color="text.secondary" variant="body2">
                      Page {state.page} of {data.totalPages}
                    </Typography>
                  </Stack>
                ) : null}
              </>
            ) : null}
          </Stack>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        ModalProps={{ disableRestoreFocus: true, keepMounted: true }}
        onClose={closeMobileFilters}
        open={isMobileFiltersOpen}
        slotProps={{
          paper: {
            'aria-labelledby': 'mobile-job-filters-title',
            id: 'mobile-job-filters',
            sx: { p: { xs: 2, sm: 3 }, width: { xs: '88vw', sm: 380 } },
          },
        }}
      >
        <Typography component="h2" id="mobile-job-filters-title" sx={{ mb: 2 }} variant="h3">
          Filter jobs
        </Typography>
        <Box sx={{ overflowY: 'auto' }}>{filterPanel}</Box>
        <Button onClick={closeMobileFilters} sx={{ mt: 3 }} variant="contained">
          Show results
        </Button>
      </Drawer>
    </Stack>
  );
};
